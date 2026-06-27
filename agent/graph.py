import os
import sqlite3
from typing import TypedDict
from dotenv import load_dotenv
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_community.tools.tavily_search import TavilySearchResults

load_dotenv()

# =========================
# 🧠 LLM & TOOLS
# =========================
llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama-3.1-8b-instant"
)

web_search = TavilySearchResults(max_results=3)

# =========================
# 💾 SQLITE MEMORY
# =========================
conn = sqlite3.connect("tax_memory.db", check_same_thread=False)
cursor = conn.cursor()
cursor.execute("""
CREATE TABLE IF NOT EXISTS memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT,
    answer TEXT,
    topic TEXT
)
""")
conn.commit()

def save_memory(question, answer, topic):
    cursor.execute(
        "INSERT INTO memory (question, answer, topic) VALUES (?, ?, ?)",
        (question, answer, topic)
    )
    conn.commit()

def get_last_entry():
    cursor.execute("SELECT question, answer, topic FROM memory ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    if row:
        return {"question": row[0], "answer": row[1], "topic": row[2]}
    return {"question": "", "answer": "", "topic": "General Tax"}

# =========================
# 📚 EMBEDDINGS & CHROMA
# =========================
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)
db = Chroma(persist_directory="chroma_db", embedding_function=embeddings)
retriever = db.as_retriever(search_kwargs={"k": 4})

# =========================
# 🧠 STATE DEFINITION
# =========================
class AgentState(TypedDict, total=False):
    question: str          # السؤال الأصلي المدخل
    rewritten_question: str# السؤال بعد إعادة الصياغة
    category: str          # TAX, OTHER, UNCLEAR
    topic: str
    context: str
    answer: str
    use_web: bool
    retry_with_web: bool   # Flag في حال فشل RAG داخلياً
    is_web_context: bool   # لمعرفة ما إذا كان السياق قادم من الويب أم من الملفات المحلية

# =========================
# 🔍 FOLLOW-UP CHECKER
# =========================
def is_followup(q: str):
    q = q.lower().strip()
    followup_words = [
        "more", "details", "explain", "again", "tell me more",
        "اشرح", "وضح", "فسر", "اكمل", "كمل", "وضح اكثر", "اشرح اكثر", "فسر اكثر"
    ]
    short_questions = ["ماذا", "كيف", "ليه", "لماذا", "ما هي", "ماهي"]
    
    if any(word in q for word in followup_words) or q in short_questions or len(q) < 10:
        return True
    return False

# =========================
# 🧠 NODES IMPLEMENTATION
# =========================

def query_rewriting_node(state: AgentState):
    """تقوم بفحص السؤال وإعادة صياغته بناءً على الذاكرة إذا كان سؤال متابعة"""
    q = state["question"]
    
    if is_followup(q):
        last_entry = get_last_entry()
        if last_entry["answer"]:
            prompt = f"""
You are an expert Query Rewriter for a Tax System.
The user is asking a follow-up question that depends on the previous conversation.
Re-write the follow-up question to be a standalone, clear, and specific question in the language of the user (Arabic or English).

Previous Question: {last_entry['question']}
Previous Answer: {last_entry['answer']}
Follow-up Request: {q}

Standalone rewritten question:"""
            rewritten = llm.invoke(prompt).content.strip()
            return {"rewritten_question": rewritten, "topic": last_entry["topic"]}
            
    return {"rewritten_question": q, "is_web_context": False}


def classifier_node(state: AgentState):
    """تصنيف السؤال المعاد صياغته لضمان الدقة الكاملة"""
    q = state["rewritten_question"]
    
    prompt = f"""
You are a strict tax domain classifier. Classify the following question into exactly one of these categories:
- TAX: Questions related to Egyptian taxes, VAT, income tax, corporate tax, invoices, and financial laws.
- OTHER: General knowledge, sports, tech, greeting, or irrelevant topics.
- UNCLEAR: Meaningless words or completely ambiguous terms.

Output format exactly:
CATEGORY: [TAX or OTHER or UNCLEAR]
TOPIC: [One or two words representing the core topic]

Question:
{q}
"""
    result = llm.invoke(prompt).content.upper()
    
    category = "OTHER"
    if "CATEGORY: TAX" in result:
        category = "TAX"
    elif "CATEGORY: UNCLEAR" in result:
        category = "UNCLEAR"
        
    topic = "General Tax"
    if "TOPIC:" in result:
        try:
            topic = result.split("TOPIC:")[1].strip()
        except:
            pass
            
    return {"category": category, "topic": topic}


def retrieval_node(state: AgentState):
    """جلب البيانات المحلية مع توثيق المصدر والصفحة بشكل صارم"""
    q = state["rewritten_question"]
    docs = retriever.invoke(q)
    
    if not docs:
        return {"context": "", "use_web": True, "is_web_context": True}
        
    context_parts = []
    for doc in docs:
        source = doc.metadata.get("source", "output.txt")
        page = doc.metadata.get("page", "غير محدد")
        chunk = f"[المصدر: {source} - صفحة: {page}]\nالسياق:\n{doc.page_content}"
        context_parts.append(chunk)
        
    return {"context": "\n\n---\n\n".join(context_parts), "use_web": False, "is_web_context": False}


def web_node(state: AgentState):
    """البحث على الويب في حال تفعيل الـ Fallback"""
    q = state["rewritten_question"]
    search_query = f"الضرائب المصرية {q}"
    
    results = web_search.invoke(search_query)
    web_context = []
    
    for r in results:
        if isinstance(r, dict):
            web_context.append(f"[المصدر: {r.get('url', 'رابط ويب')}]\n{r.get('content', '')}")
            
    return {"context": "\n\n---\n\n".join(web_context), "is_web_context": True}


def tax_node(state: AgentState):
    """توليد الإجابة النهائية وفحص ما إذا كان هناك حاجة للتحول للويب"""
    q = state["rewritten_question"]
    context = state.get("context", "")
    is_web = state.get("is_web_context", False)
    
    if not is_web:
        # بومبت صارم للملفات المحلية لمنع التأليف والهلوسة والتكرار
        prompt = f"""
أنت مستشار ضريبي محترف خبير بالقوانين المصرية. مهمتك الإجابة على سؤال المستخدم بناءً على السياق (Context) المرفق والمستخرج من الملفات الرسمية فقط.

شروط صارمة للإجابة:
1. صغ إجابتك مرة واحدة بشكل منظم ومنسق للغاية على شكل نقاط واضحة وتجنب تكرار الجمل أو إعادة صياغة نفس التعريف بأشكال متعددة.
2. التزم التزاماً كاملاً بالأرقام والنسب المئوية الواردة في السياق دون أي تشويه أو تغيير.
3. يجب إدراج التوثيق (Citation) للمصدر والصفحة المذكورة في السياق مع كل حقيقة تذكرها.
4. إذا لم تجد الإجابة بشكل واضح ومباشر وتفصيلي داخل السياق المرفق، اكتب الكلمة التالية فقط دون أي حرف إضافي: Not found

السياق الضريبي المتاح (من ملفات النظام):
{context}

السؤال:
{q}
"""
    else:
        # برومبت مرن خاص بالويب لمنع الـ Not found وصياغة إجابة من نتائج البحث
        prompt = f"""
أنت مستشار ضريبي محترف خبير بالقوانين المصرية. تم جلب بيانات حديثة من الويب للإجابة على سؤال المستخدم.

شروط صارمة للإجابة:
1. صغ إجابة كاملة، واضحة، ومنظمة بناءً على سياق الويب المرفق مع ذكر روابط المصادر (URLs) المستعينة بها للتوثيق والشفافية.
2. إذا كانت نتائج البحث تحتوي على المعلومة، صغها بأسلوب مهني منسق يمنع تكرار الأفكار.
3. إذا كانت نتائج البحث غير مفيدة تماماً ولا تحتوي على إجابة، أجب بـ: "عذراً، هذا المصطلح أو التفاصيل المتعلقة به غير متوفرة في الدليل الضريبي حالياً".

سياق البحث من الويب:
{context}

السؤال:
{q}
"""

    answer = llm.invoke(prompt).content.strip()
    
    # فحص إذا فشل الـ RAG داخلياً ولم يجد إجابة بالرغم من وجود سياق محلي
    if "not found" in answer.lower() and not state.get("retry_with_web") and not is_web:
        return {"retry_with_web": True, "answer": "NOT_FOUND_TRIGGER"}
        
    # حفظ الإجابة الناجحة بالذاكرة
    if "not found" not in answer.lower() and answer != "NOT_FOUND_TRIGGER":
        save_memory(state["question"], answer, state.get("topic", "Tax"))
        
    return {"answer": answer, "retry_with_web": False}


def clarify_node(state: AgentState):
    return {"answer": "❓ السؤال غير واضح، برجاء صياغته بشكل أفضل يتعلق بالضرائب."}

def reject_node(state: AgentState):
    return {"answer": "🚫 عذراً، أنا مساعد ضريبي متخصص في الإجابة على الأسئلة المتعلقة بالضرائب فقط."}

# =========================
# 🌐 CONDITIONAL ROUTERS
# =========================
def route_after_classifier(state: AgentState):
    return state["category"]

def route_after_retrieval(state: AgentState):
    return "WEB" if state["use_web"] else "TAX"

def route_after_tax(state: AgentState):
    # إذا أخبرنا الـ Node بالتحول للويب
    return "GO_TO_WEB" if state.get("retry_with_web") else "END"

# =========================
# 🏗️ BUILD LANGGRAPH
# =========================
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("query_rewriter", query_rewriting_node)
workflow.add_node("classifier", classifier_node)
workflow.add_node("retrieve", retrieval_node)
workflow.add_node("web", web_node)
workflow.add_node("tax", tax_node)
workflow.add_node("clarify", clarify_node)
workflow.add_node("reject", reject_node)

# Set Entry Point
workflow.set_entry_point("query_rewriter")

# Sequential Chain: Rewriter -> Classifier
workflow.add_edge("query_rewriter", "classifier")

# Router 1: Category Router
workflow.add_conditional_edges(
    "classifier",
    route_after_classifier,
    {
        "TAX": "retrieve",
        "OTHER": "reject",
        "UNCLEAR": "clarify"
    }
)

# Router 2: RAG or Web Router
workflow.add_conditional_edges(
    "retrieve",
    route_after_retrieval,
    {
        "WEB": "web",
        "TAX": "tax"
    }
)

workflow.add_edge("web", "tax")

# Router 3: Fallback Loop (RAG -> If fails -> Web Search)
workflow.add_conditional_edges(
    "tax",
    route_after_tax,
    {
        "GO_TO_WEB": "web",
        "END": END
    }
)

workflow.add_edge("reject", END)
workflow.add_edge("clarify", END)

app = workflow.compile()