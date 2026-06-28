import React, { useState } from 'react';
import { Modal, Button, Table, Form } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';
import { useDynamicTranslation } from '../../utils/useDynamicTranslation';

// ── مكون مساعد لترجمة البيانات اللي جاية من الداتا بيز ──
const DynText = ({ text, lang }) => {
  const translated = useDynamicTranslation(text || '', lang);
  return <>{translated || '-'}</>;
};

const SelectUnitModal = ({ show, handleClose, onSelect }) => {
  const { lang } = useLanguage();
  const [search, setSearch] = useState('');

  // بيانات وهمية للوحدات
  const units = [
    { id: 1001, address: 'مبنى 15 - الدور الأول', owner: 'محمود حسن', tax: 500 },
    { id: 1002, address: 'فيلا 45 - الدور الأرضي', owner: 'خالد يوسف', tax: 1200 },
    { id: 1003, address: 'برج النور - محل 12', owner: 'شركة النور', tax: 2000 },
  ];

  const filtered = units.filter(u => 
    u.address.toLowerCase().includes(search.toLowerCase()) || 
    String(u.id).includes(search)
  );

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title><i className="fa-solid fa-door-open me-2"></i> اختيار وحدة ضريبية</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Control 
          className="mb-3"
          placeholder="ابحث عن الوحدة (العنوان أو الرقم)..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Table striped hover size="sm">
          <thead>
            <tr>
              <th>رقم الوحدة</th>
              <th>العنوان</th>
              <th>المالك</th>
              <th>الضريبة التقديرية</th>
              <th>اختيار</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td className="fw-bold">{u.id}</td>
                <td><DynText text={u.address} lang={lang} /></td>
                <td><DynText text={u.owner} lang={lang} /></td>
                <td className="text-success">{u.tax} ج.م</td>
                <td>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => onSelect(u)}
                  >
                    <i className="fa-solid fa-check"></i>
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="5" className="text-center">لا توجد نتائج</td></tr>}
          </tbody>
        </Table>
      </Modal.Body>
    </Modal>
  );
};

export default SelectUnitModal;