import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

export const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light text-center">
      <h1 className="display-1 text-danger">403</h1>
      <h2 className="mb-3">غير مصرح لك بالدخول</h2>
      <p className="text-muted lead mb-4">عذراً، ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة.</p>
      <Button variant="primary" className="px-4" onClick={() => navigate(-1)}>
        العودة للخلف
      </Button>
    </div>
  );
};