import React, { useState } from 'react';
import { Container, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Chatbot = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'أهلاً بك في نظام المساعدة الذكي. كيف أساعدك اليوم؟' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // إضافة رسالة المستخدم
    const newMsg = { sender: 'user', text: input };
    setMessages([...messages, newMsg]);
    setInput('');

    // رد تلقائي وهمي من البوت
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: `شكراً لسؤالك "${input}". سيتم مراجعة استفسارك والرد عليك حالا انتظر.` 
      }]);
    }, 1000);
  };

  // دالة العودة الذكية
  const handleBackToHome = () => {
    if (!user) return;
    const role = user.role;
    
    switch (role) {
      case 'Data Entry':
        navigate('/data-entry/home');
        break;
      case 'Reviewer':
        navigate('/reviewer/home');
        break;
      case 'Finance':
        navigate('/finance/home');
        break;
      case 'Manager':
        navigate('/manager/home');
        break;
      case 'Committee':
        navigate('/committee/home');
        break;
      case 'Admin':
        navigate('/admin/home');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <Container fluid className="mt-4" style={{ minHeight: '80vh' }}>
      <div className="d-flex justify-content-center">
        <Card style={{ width: '100%', maxWidth: '800px' }} className="shadow-sm">
          <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <i className="fa-solid fa-robot fa-2x me-3"></i>
              <div>
                <h5 className="mb-0 fw-bold">مساعد النظام (Chatbot)</h5>
                <small className="opacity-75">متصل الآن للرد على استفساراتك</small>
              </div>
            </div>
            {/* زر العودة للرئيسية */}
            <Button variant="light" className="text-primary fw-bold" onClick={handleBackToHome}>
              <i className="fa-solid fa-arrow-right me-2"></i> عودة للرئيسية
            </Button>
          </Card.Header>
          
          <Card.Body className="bg-light p-0" style={{ height: '500px', overflowY: 'auto' }}>
            <div className="p-4 d-flex flex-column gap-3">
              {messages.map((msg, index) => (
                <div key={index} className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                  <div 
                    className={`p-3 rounded ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-white text-dark'}`}
                    style={{ maxWidth: '70%', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>

          <Card.Footer className="p-3 bg-white">
            <Form onSubmit={handleSend}>
              <InputGroup>
                <Form.Control
                  placeholder="اكتب استفسارك هنا..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <Button variant="primary" type="submit">
                  <i className="fa-solid fa-paper-plane"></i> إرسال
                </Button>
              </InputGroup>
            </Form>
          </Card.Footer>
        </Card>
      </div>
    </Container>
  );
};

export default Chatbot;