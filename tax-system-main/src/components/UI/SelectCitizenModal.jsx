import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Table, Spinner, Badge, Alert } from 'react-bootstrap';
import { getOwners } from '../../services/assignmentService';

const SelectCitizenModal = ({ show, handleClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ─────────────────────────────
  // تحميل البيانات عند فتح المودال
  // ─────────────────────────────
  useEffect(() => {
    if (!show) return;

    setSearchTerm('');
    setError('');
    loadOwners('');
  }, [show]);

  // ─────────────────────────────
  // جلب الملاك من الـ API
  // ─────────────────────────────
  const loadOwners = async (search = '') => {
    setLoading(true);
    setError('');

    try {
      const data = await getOwners(search);
      setCitizens(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.message ||
        'حدث خطأ أثناء تحميل البيانات'
      );
      setCitizens([]);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────
  // البحث
  // ─────────────────────────────
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    loadOwners(value);
  };

  // ─────────────────────────────
  // اختيار مالك
  // ─────────────────────────────
  const handleSelect = (owner) => {
    onSelect({
      id: owner.id,
      name: owner.fullName,
      phone: owner.phone,
      address: owner.address,
      nationalId: owner.nationalId,
      type: owner.ownerType || 'Natural'
    });

    setSearchTerm('');
    handleClose();
  };

  // ─────────────────────────────
  // reset عند الإغلاق
  // ─────────────────────────────
  const handleCloseModal = () => {
    setSearchTerm('');
    setCitizens([]);
    setError('');
    handleClose();
  };

  return (
    <Modal
      show={show}
      onHide={handleCloseModal}
      size="lg"
      centered
      dir="rtl"
    >
      {/* ───── Header ───── */}
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fa-solid fa-user me-2" />
          اختيار مالك / مواطن
        </Modal.Title>
      </Modal.Header>

      {/* ───── Body ───── */}
      <Modal.Body>

        {/* بحث */}
        <Form.Control
          type="text"
          placeholder="ابحث بالاسم أو الرقم القومي أو الهاتف..."
          className="mb-3"
          value={searchTerm}
          onChange={handleSearch}
        />

        {/* Error */}
        {error && (
          <Alert variant="danger" className="py-2">
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" className="me-2" />
            جارٍ تحميل البيانات...
          </div>
        )}

        {/* Table */}
        {!loading && (
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>الرقم القومي</th>
                <th>الاسم</th>
                <th>الهاتف</th>
                <th>العنوان</th>
                <th>النوع</th>
                <th>اختيار</th>
              </tr>
            </thead>

            <tbody>
              {citizens.length > 0 ? (
                citizens.map((owner) => (
                  <tr key={owner.id}>
                    <td>{owner.nationalId}</td>
                    <td>{owner.fullName}</td>
                    <td>{owner.phone}</td>
                    <td>{owner.address}</td>
                    <td>
                      <Badge
                        bg={owner.ownerType === 'Legal' ? 'info' : 'secondary'}
                      >
                        {owner.ownerType === 'Legal' ? 'اعتباري' : 'طبيعي'}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSelect(owner)}
                      >
                        اختيار
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    لا توجد نتائج
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Modal.Body>

      {/* ───── Footer ───── */}
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal}>
          إغلاق
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SelectCitizenModal;