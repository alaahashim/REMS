import React, { useState } from 'react';
import { Modal, Button, Form, Table } from 'react-bootstrap';

const SelectCitizenModal = ({ show, handleClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // بيانات وهمية للمواطنين للاستعراض (يمكن ربطها بالـ Context لاحقاً)
  const mockCitizens = [
    { id: 101, name: 'شركة النور للمقاولات', type: 'Legal', nationalId: '12345678901234', phone: '01112223344', email: 'info@elnor.com' },
    { id: 102, name: 'محمد محمود علي', type: 'Natural', nationalId: '2850101010101', phone: '01015556677', email: 'm.mahmoud@example.com' },
    { id: 103, name: 'سارة أحمد محمود', type: 'Natural', nationalId: '2900505050505', phone: '01024446655', email: 's.ahmed@example.com' },
    { id: 104, name: 'أحمد سعيد', type: 'Natural', nationalId: '2800555555555', phone: '01119998877', email: 'ahmed.saeed@example.com' },
    { id: 105, name: 'أماني للخدمات', type: 'Legal', nationalId: '999888777666', phone: '01223334455', email: 'contact@amani.com' },
  ];

  const filteredCitizens = mockCitizens.filter(c => 
    c.name.includes(searchTerm)
    || c.nationalId.includes(searchTerm)
    || c.phone?.includes(searchTerm)
    || c.email?.includes(searchTerm)
  );

  const handleSelect = (citizen) => {
    onSelect(citizen);
    setSearchTerm('');
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>اختيار مواطن / مالك</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Control
          type="text"
          placeholder="ابحث بالاسم أو الرقم القومي..."
          className="mb-3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <Table striped hover responsive>
          <thead>
            <tr>
              <th>الرقم القومي</th>
              <th>الاسم</th>
              <th>الهاتف</th>
              <th>الإيميل</th>
              <th>النوع</th>
              <th>اختيار</th>
            </tr>
          </thead>
          <tbody>
            {filteredCitizens.length > 0 ? (
              filteredCitizens.map(citizen => (
                <tr key={citizen.id}>
                  <td>{citizen.nationalId}</td>
                  <td>{citizen.name}</td>
                  <td>{citizen.phone}</td>
                  <td>{citizen.email}</td>
                  <td>
                    <span className={`badge ${citizen.type === 'Legal' ? 'bg-info text-dark' : 'bg-light text-dark'}`}>
                      {citizen.type === 'Legal' ? 'اعتباري' : 'فرد (طبيعي)'}
                    </span>
                  </td>
                  <td>
                    <Button variant="primary" size="sm" onClick={() => handleSelect(citizen)}>
                      اختيار
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-muted">لا توجد نتائج مطابقة للبحث.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Modal.Body>
    </Modal>
  );
};

export default SelectCitizenModal;