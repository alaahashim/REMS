import React, { useEffect, useState } from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';
import { useDynamicTranslation } from '../../utils/useDynamicTranslation';

// ── مكون مساعد لترجمة البيانات اللي جاية من الداتا بيز ──
const DynText = ({ text, lang }) => {
  const translated = useDynamicTranslation(text || '', lang);
  return <>{translated || '-'}</>;
};

const NotificationsPage = () => {
  const { lang } = useLanguage();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('tax_notifications') || '[]');
    setNotifications(saved);
  }, []);

  return (
    <div className="p-3 p-md-4">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white fw-bold">
          الإشعارات
        </Card.Header>
        <Card.Body>
          {notifications.length === 0 ? (
            <div className="text-center text-muted py-4">لا توجد إشعارات جديدة حالياً</div>
          ) : (
            <ListGroup variant="flush">
              {notifications.map((item) => (
                <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fw-semibold"><DynText text={item.text} lang={lang} /></div>
                    <small className="text-muted"><DynText text={item.time} lang={lang} /></small>
                  </div>
                  <Badge bg={item.type === 'success' ? 'success' : item.type === 'warning' ? 'warning' : 'info'}>
                    {item.type}
                  </Badge>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default NotificationsPage;