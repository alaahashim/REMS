import React from 'react';
import { Dropdown, Badge } from 'react-bootstrap';

const NotificationDropdown = () => {
  // بيانات وهمية للإشعارات
  const notifications = [
    { id: 1, text: 'تم إضافة عقار جديد بنجاح (#12)', time: 'منذ 5 دقائق', type: 'success' },
    { id: 2, text: 'تمت الموافقة على طلب إعفاء سابق', time: 'منذ ساعة', type: 'primary' },
    { id: 3, text: 'تنبيه النظام: برجاء مراجعة الطلبات المعلقة', time: 'منذ يومين', type: 'danger' },
  ];

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="link" className="text-secondary p-2 position-relative border-0">
        <i className="fa-solid fa-bell fs-4"></i>
        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white p-1">
          <span className="visually-hidden">unread messages</span>
        </span>
      </Dropdown.Toggle>

      <Dropdown.Menu className="shadow border-0" style={{ width: '300px' }}>
        <Dropdown.Header className="bg-light fw-bold border-bottom">
          <div className="d-flex justify-content-between">
            <span>الإشعارات</span>
            <span className="badge bg-primary">{notifications.length} جديد</span>
          </div>
        </Dropdown.Header>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {notifications.map(not => (
            <Dropdown.Item key={not.id} className="py-3 border-bottom border-light">
              <div className="d-flex align-items-start">
                <div className={`me-2 mt-1`} style={{width: '8px', height: '8px', borderRadius:'50%', backgroundColor: not.type==='success'?'green': (not.type==='danger'?'red':'blue')}}></div>
                <div>
                  <p className="mb-0 small text-secondary">{not.text}</p>
                  <small className="text-muted" style={{fontSize:'0.7rem'}}>{not.time}</small>
                </div>
              </div>
            </Dropdown.Item>
          ))}
        </div>
        <Dropdown.Item href="#" className="text-center text-primary fw-bold small py-2 border-top">
          عرض كل الإشعارات
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationDropdown;