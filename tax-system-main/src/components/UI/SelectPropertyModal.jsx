import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, Badge, Spinner } from 'react-bootstrap';
import { getProperties } from '../../services/propertyService';
import { useLanguage } from '../../context/LanguageContext';
import { useDynamicTranslation } from '../../utils/useDynamicTranslation';

// ── مكون مساعد لترجمة البيانات اللي جاية من الداتا بيز ──
const DynText = ({ text, lang }) => {
  const translated = useDynamicTranslation(text || '', lang);
  return <>{translated || '-'}</>;
};

const SelectPropertyModal = ({ show, handleClose, onSelect }) => {
  const { lang } = useLanguage();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      setLoading(true);
      getProperties().then(data => {
        setProperties(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [show]);

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>بحث واختيار عقار</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
        ) : (
          <Table hover responsive size="sm">
            <thead className="table-light">
              <tr>
                <th>رقم العقار</th>
                <th>العنوان</th>
                <th>اسم المالك</th>
                <th>الوحدات</th>
                <th>المساحة</th>
                <th>اختيار</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((prop) => (
                <tr key={prop.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(prop)}>
                  <td className="fw-bold text-primary">{prop.id}</td>
                  <td>
                    <DynText 
                      text={prop.address || `${prop.governorateName || prop.governorateId} - ${prop.centerName || prop.centerId} - ${prop.neighborhoodName || prop.streetName || prop.streetId}`} 
                      lang={lang} 
                    />
                  </td>
                  <td><DynText text={prop.ownerName} lang={lang} /></td>
                  <td>{prop.units?.length || '-'}</td>
                  <td>{prop.area || (prop.units ? prop.units.reduce((sum, u) => sum + Number(u.area || 0), 0) : '-')} م²</td>
                  <td className="text-center">
                    <Button variant="outline-primary" size="sm">
                      <i className="fa-solid fa-check"></i> اختيار
                    </Button>
                  </td>
                </tr>
              ))}
              {properties.length === 0 && (
                <tr><td colSpan="4" className="text-center text-muted">لا توجد عقارات مسجلة</td></tr>
              )}
            </tbody>
          </Table>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default SelectPropertyModal;