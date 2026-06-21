import React, { useEffect, useState } from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';

const NotificationsPage = () => {
  const { lang, translations } = useLanguage();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('tax_notifications') || '[]');
    setNotifications(saved);
  }, []);

  return (
    <div className="p-3 p-md-4">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white fw-bold">
          {translations[lang].notifications}
        </Card.Header>
        <Card.Body>
          <ListGroup variant="flush">
            {notifications.map((item) => (
              <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="fw-semibold">{item.text}</div>
                  <small className="text-muted">{item.time}</small>
                </div>
                <Badge bg={item.type === 'success' ? 'success' : item.type === 'warning' ? 'warning' : 'info'}>
                  {item.type}
                </Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
    </div>
  );
};

export default NotificationsPage;
