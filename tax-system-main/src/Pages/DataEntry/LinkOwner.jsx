import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { createAssignment, getAssignments } from '../../services/assignmentService';
import SelectCitizenModal from '../../components/UI/SelectCitizenModal';
import SelectPropertyModal from '../../components/UI/SelectPropertyModal';

const LinkOwner = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    propertyId: '',
    personId: '',
    personName: '',
    contactPhone: '',
   // contactEmail: '',
    shareType: 'Full',
    unitId: '',
    unitLabel: '',
    ownershipStartDate: '',
    ownershipEndDate: ''
  });

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [ownerStats, setOwnerStats] = useState({ ownedUnitsCount: 0, existingAssignment: null });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [showCitizenModal, setShowCitizenModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);

  const loadOwnerStats = async (personId) => {
    if (!personId) {
      setOwnerStats({ ownedUnitsCount: 0, existingAssignment: null });
      return;
    }

    const assignments = await getAssignments();
    const ownerAssignments = assignments.filter(a => String(a.personId) === String(personId) && a.roleType === 'Owner');
    const existingAssignment = ownerAssignments.length > 0 ? ownerAssignments[0] : null;

    setOwnerStats({ ownedUnitsCount: ownerAssignments.length, existingAssignment });

    if (existingAssignment) {
      setFormData(prev => ({
        ...prev,
        personName: prev.personName || existingAssignment.name || '',
        contactPhone: prev.contactPhone || existingAssignment.contactPhone || '',
       // contactEmail: prev.contactEmail || existingAssignment.contactEmail || ''
      }));
    }
  };

  const handleSelectCitizen = (citizen) => {
    setFormData({
      ...formData,
      personId: citizen.id,
      personName: citizen.name,
      contactPhone: citizen.phone || ''
     // contactEmail: citizen.email || ''
    });
    setShowCitizenModal(false);
  };

  const handleSelectProperty = (prop) => {
    setFormData({
      ...formData,
      propertyId: prop.id,
      unitId: '',
      unitLabel: ''
    });
    setSelectedProperty(prop);
    setShowPropertyModal(false);
  };

  const handleUnitSelect = (e) => {
    const unitId = e.target.value;
    const selectedUnit = selectedProperty?.units?.find(u => String(u.id) === String(unitId));
    setFormData({
      ...formData,
      unitId,
      unitLabel: selectedUnit ? `دور ${selectedUnit.floor}` : ''
    });
  };

  useEffect(() => {
    loadOwnerStats(formData.personId);
  }, [formData.personId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const cleanValue = value.trim(); 
    setFormData({ ...formData, [name]: cleanValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      if (!formData.personId || !formData.personName || !formData.propertyId || !formData.contactPhone /*|| !formData.contactEmail*/) {
        throw new Error("يجب إدخال الاسم، الرقم القومي، الهاتف، الإيميل، واختيار العقار أولاً");
      }

      if (selectedProperty?.units?.length > 0 && !formData.unitId) {
        throw new Error("يجب اختيار الوحدة داخل العقار قبل الربط");
      }

      const payload = {
        ...formData,
        sharePercentage: 100,
        unitId: formData.unitId || null,
        unitLabel: formData.unitLabel || (selectedProperty?.units?.length ? `دور ${selectedProperty.units[0].floor}` : ''),
      };

      await createAssignment(payload);
      setMessage({ text: 'تم ربط الشخص بالعقار/الوحدة بنجاح', type: 'success' });
      setTimeout(() => navigate('/data-entry/home'), 1500);
    } catch (error) {
      setMessage({ text: error.message || 'حدث خطأ أثناء الربط', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="mt-4">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-sm border-0 border-top border-5 border-primary">
            <Card.Header className="bg-primary text-white py-4">
              <h5 className="mb-0"><i className="fa-solid fa-users-gear me-2"></i> ربط المالك / المستأجر</h5>
            </Card.Header>
            <Card.Body>
              {message.text && <Alert variant={message.type} className="mb-4">{message.text}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <h5 className="text-primary fw-bold border-bottom pb-2 mb-4">بيانات الربط</h5>
                
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-primary fw-bold">رقم العقار (Property ID) <span className="text-danger">*</span></Form.Label>
                      <InputGroup>
                        <InputGroup.Text><i className="fa-solid fa-building"></i></InputGroup.Text>
                        <Form.Control 
                          type="text"
                          placeholder="ابحث واختار العقار من القائمة..."
                          value={formData.propertyId}
                          onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                          required
                        />
                        {/* زر فتح مودال العقار */}
                        <Button variant="outline-primary" onClick={() => setShowPropertyModal(true)}>
                          <i className="fa-solid fa-magnifying-glass"></i> بحث واختيار
                        </Button>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-primary fw-bold">الرقم القومي <span className="text-danger">*</span></Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="text"
                          name="personId"
                          value={formData.personId}
                          onChange={(e) => setFormData({ ...formData, personId: e.target.value.trim() })}
                          placeholder="أدخل الرقم القومي أو اختر مالك"
                          required
                        />
                        <Button variant="outline-primary" onClick={() => setShowCitizenModal(true)}>
                          <i className="fa-solid fa-magnifying-glass"></i>
                        </Button>
                      </InputGroup>
                      <Form.Text className="text-muted">
                        {ownerStats.ownedUnitsCount > 0 
                          ? `هذا الشخص مرتبط بـ ${ownerStats.ownedUnitsCount} وحدة/وحدات حالياً، وسيتم إعادة استخدام بياناته.`
                          : 'يمكنك اختيار مالك موجود أو تسجيل مالك جديد.'}
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-primary fw-bold">اسم المالك <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="personName"
                        value={formData.personName}
                        onChange={handleInputChange}
                        placeholder="أدخل اسم المالك"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              <Row>
  <Col md={12}>
    <Form.Group className="mb-3">
      <Form.Label className="text-primary fw-bold">
        الهاتف <span className="text-danger">*</span>
      </Form.Label>
      <Form.Control
        type="tel"
        name="contactPhone"
        value={formData.contactPhone}
        onChange={handleInputChange}
        placeholder="أدخل رقم الهاتف"
        required
      />
    </Form.Group>
  </Col>
</Row>

                {selectedProperty?.units?.length > 0 && (
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="text-primary fw-bold">اختر الوحدة</Form.Label>
                        <Form.Select
                          value={formData.unitId}
                          onChange={handleUnitSelect}
                          required
                        >
                          <option value="">اختر الوحدة...</option>
                          {selectedProperty.units.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {`${unit.unitType} - دور ${unit.floor} - ${unit.area} م²`}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="text-primary fw-bold">الدور / رقم الشقة</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.unitLabel}
                          onChange={(e) => setFormData({ ...formData, unitLabel: e.target.value })}
                          placeholder="مثال: دور 3 أو شقة 12"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                )}

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-primary fw-bold">نوع العلاقة القانونية</Form.Label>
                      <Form.Select
                        value={formData.shareType}
                        onChange={(e) => setFormData({ ...formData, shareType: e.target.value })}
                      >
                        <option value="Full">تملّك كامل</option>
                        <option value="Inheritance">ميراث</option>
                        <option value="Sale">بيع</option>
                        <option value="Gift">هبة</option>
                        <option value="Rent">إيجار</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-primary fw-bold">تاريخ بداية العلاقة</Form.Label>
                            <Form.Control 
                                type="date" 
                                value={formData.ownershipStartDate}
                                onChange={(e) => setFormData({ ...formData, ownershipStartDate: e.target.value })}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-primary fw-bold">تاريخ نهاية العلاقة (إن وجد)</Form.Label>
                            <Form.Control 
                                type="date" 
                                value={formData.ownershipEndDate}
                                onChange={(e) => setFormData({ ...formData, ownershipEndDate: e.target.value })}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <div className="d-flex justify-content-between gap-2 mt-5">
                  <Button variant="secondary" onClick={() => navigate('/data-entry/home')}>إلغاء</Button>
                  <Button variant="success" type="submit" disabled={loading} className="fw-bold">
                    {loading ? <Spinner size="sm" animation="border" /> : 'تأكيد الربط'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <SelectCitizenModal 
        show={showCitizenModal} 
        handleClose={() => setShowCitizenModal(false)} 
        onSelect={handleSelectCitizen} 
      />
      
      <SelectPropertyModal 
        show={showPropertyModal} 
        handleClose={() => setShowPropertyModal(false)} 
        onSelect={handleSelectProperty} 
      />
    </Container>
  );
};

export default LinkOwner;