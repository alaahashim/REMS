import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ========================================== //
// دالة الاتصال بالباك إند (اللي أرسلتها رحاب) //
// ========================================== //
async function sendTaxQuestionToAgent(userInput) {
    // الرابط السحري الخاص بكِ من شاشة ngrok
    const apiUrl = "https://defiling-catty-unblended.ngrok-free.dev/api/chat"; 

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                session_id: "rems_tax_chat_session", // معرف الجلسة للمحادثة
                question: userInput                 // السؤال المكتوب في واجهة الـ Frontend
            })
        });

        if (!response.ok) {
            throw new Error(`خطأ في الاتصال بالسيرفر: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.status === "success") {
            // إرجاع الإجابة الضريبية القادمة من الـ LangGraph Agent الخاص بكِ
            return data.answer; 
        } else {
            return "المعذرة، حدث خطأ أثناء معالجة الرد من السيرفر.";
        }

    } catch (error) {
        console.error("Error connecting to AI Agent:", error);
        return "المعذرة، سيرفر المساعد الضريبي غير متاح حالياً. يرجى التأكد من تشغيل السيرفر.";
    }
}


// ========================================== //
// مكوّن الشات بوت الرئيسي                   //
// ========================================== //
const Chatbot = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'أهلاً بك في نظام المساعدة الذكي. كيف أساعدك اليوم؟' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false); // حالة التحميل الجديدة
  
  // مرجع للـ Auto Scroll
  const messagesEndRef = useRef(null);

  // دالة تنزيل الشاشة للأسفل تلقائياً
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // دالة إرسال الرسالة (تم التعديل لتتصل بالباك إند)
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return; // منع الإرسال إذا كان فارغاً أو يتم التحميل

    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    
    const questionText = input;
    setInput(''); // تفريغ حقل الكتابة فوراً
    setIsLoading(true); // تفعيل حالة التحميل

    try {
      // استدعاء دالة الباك إند والانتظار حتى ترجع بالرد
      const botReply = await sendTaxQuestionToAgent(questionText);
      
      // إضافة رد البوت
      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: "حدث خطأ غير متوقع في الواجهة." }]);
    } finally {
      setIsLoading(false); // إيقاف حالة التحميل سواء نجح أو فشل
    }
  };

  // دالة العودة الذكية
  const handleBackToHome = () => {
    if (!user) return;
    const role = user.role;
    
    switch (role) {
      case 'Data Entry': navigate('/data-entry/home'); break;
      case 'Reviewer': navigate('/reviewer/home'); break;
      case 'Finance': navigate('/finance/home'); break;
      case 'Manager': navigate('/manager/home'); break;
      case 'Committee': navigate('/committee/home'); break;
      case 'Admin': navigate('/admin/home'); break;
      default: navigate('/');
    }
  };

  return (
    <Container fluid className="mt-4" style={{ minHeight: '80vh' }}>
      <div className="d-flex justify-content-center">
        <Card style={{ width: '100%', maxWidth: '800px' }} className="shadow-sm border-0">
          
          {/* هيدر الشات */}
          <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center py-3">
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3">
                <i className="fa-solid fa-robot fa-lg"></i>
              </div>
              <div>
                <h6 className="mb-0 fw-bold">مساعد النظام الذكي</h6>
                <small className="opacity-75">
                  <i className="fa-solid fa-circle fa-xs me-1 text-success"></i>
                  متصل الآن للرد على استفساراتك
                </small>
              </div>
            </div>
            <Button variant="outline-light" size="sm" className="fw-bold" onClick={handleBackToHome}>
              <i className="fa-solid fa-arrow-right me-1"></i> الرئيسية
            </Button>
          </Card.Header>
          
          {/* منطقة الرسائل */}
          <Card.Body className="bg-light p-0" style={{ height: '500px', overflowY: 'auto' }}>
            <div className="p-4 d-flex flex-column gap-3">
              {messages.map((msg, index) => (
                <div key={index} className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                  <div className="d-flex align-items-end gap-2" style={{ maxWidth: '75%' }}>
                    
                    {/* أيقونة البوت */}
                    {msg.sender === 'bot' && (
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '30px', height: '30px', fontSize: '14px' }}>
                        <i className="fa-solid fa-robot"></i>
                      </div>
                    )}

                    <div 
                      className={`p-3 rounded-4 ${msg.sender === 'user' ? 'bg-primary text-white rounded-bottom-right-0' : 'bg-white text-dark border rounded-bottom-left-0'}`}
                      style={{ boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
                    >
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{msg.text}</div>
                    </div>

                    {/* أيقونة المستخدم */}
                    {msg.sender === 'user' && (
                      <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '30px', height: '30px', fontSize: '14px' }}>
                        <i className="fa-solid fa-user"></i>
                      </div>
                    )}

                  </div>
                </div>
              ))}

              {/* مؤشر الكتابة (اللودينج) */}
              {isLoading && (
                <div className="d-flex justify-content-start">
                  <div className="d-flex align-items-end gap-2">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '30px', height: '30px', fontSize: '14px' }}>
                      <i className="fa-solid fa-robot"></i>
                    </div>
                    <div className="bg-white border p-3 rounded-4 rounded-bottom-left-0">
                      <div className="d-flex gap-1">
                        <span className="bg-secondary rounded-circle" style={{width:'8px', height:'8px', animation: 'pulse 1s infinite'}}></span>
                        <span className="bg-secondary rounded-circle" style={{width:'8px', height:'8px', animation: 'pulse 1s infinite 0.2s'}}></span>
                        <span className="bg-secondary rounded-circle" style={{width:'8px', height:'8px', animation: 'pulse 1s infinite 0.4s'}}></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* المكان اللي بينزل عليه السكرول */}
              <div ref={messagesEndRef} />
            </div>
          </Card.Body>

          {/* حقل الإدخال */}
          <Card.Footer className="p-3 bg-white border-top">
            <Form onSubmit={handleSend}>
              <InputGroup>
                <Form.Control
                  placeholder="اكتب استفسارك هنا..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading} // قفل الإدخال أثناء التحميل
                  className="border-end-0"
                />
                <Button variant="primary" type="submit" disabled={isLoading} className="d-flex align-items-center gap-2 px-4">
                  {isLoading ? (
                    <><Spinner size="sm" animation="border" /> جاري الرد...</>
                  ) : (
                    <><i className="fa-solid fa-paper-plane"></i> إرسال</>
                  )}
                </Button>
              </InputGroup>
            </Form>
          </Card.Footer>
        </Card>
      </div>

      {/* كود CSS بسيط علشان يشتغل مؤشر الكتابة */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0.3; transform: scale(0.8); }
        }
      `}</style>
    </Container>
  );
};

export default Chatbot;