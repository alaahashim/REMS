import React from 'react';
import { Modal, Table, Button, Badge } from 'react-bootstrap';
import { getProperties } from '../../services/propertyService';

const SelectPropertyModal = ({ show, handleClose, onSelect }) => {
  const [properties, setProperties] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (show) {
      setLoading(true);
      getProperties().then(data => {
        setProperties(data);
        setLoading(false);
      });
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
            <span className="spinner-border text-primary" role="status"></span>
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
                  <td>{prop.address || `${prop.governorateName || prop.governorateId} - ${prop.centerName || prop.centerId} - ${prop.neighborhoodName || prop.streetName || prop.streetId}`}</td>
                  <td>{prop.ownerName}</td>
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