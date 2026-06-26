import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col, Alert, Spinner, Badge, Table, InputGroup } from 'react-bootstrap';
import { getGovernorates, getCenters, getStreets, getNeighborhoods } from '../../services/locationService';
import { getPropertyById, updateProperty } from '../../services/propertyService';
import { getAssignments } from '../../services/assignmentService';
// 🆕 نفس المودال الشغال في LinkOwner.jsx بالظبط
import SelectCitizenModal from '../../components/UI/SelectCitizenModal';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [propertyData, setPropertyData] = useState({
    governorateId: '',
    centerId: '',
    neighborhoodId: '',
    streetId: '',
    buildingNo: '',
    description: ''
  });

  const [ownersList, setOwnersList] = useState([]);

  const [governorates, setGovernorates] = useState([]);
  const [centers, setCenters] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [streets, setStreets] = useState([]);

  // 🆕 حالة المودال + رقم السطر اللي دوس على زرار البحث
  const [showCitizenModal, setShowCitizenModal] = useState(false);
  const [activeOwnerIndex, setActiveOwnerIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const govs = await getGovernorates();
        setGovernorates(govs);

        const prop = await getPropertyById(id);
        if (!prop) {
          throw new Error('العقار غير موجود');
        }

        setPropertyData({
          governorateId: prop.governorateId || '',
          centerId: prop.centerId || '',
          neighborhoodId: prop.neighborhoodId || '',
          streetId: prop.streetId || '',
          buildingNo: prop.buildingNo || '',
          description: prop.description || ''
        });

        const allAssignments = await getAssignments();
        setOwnersList(allAssignments.filter(a => String(a.propertyId) === String(id)).map(a => ({
          id: a.id,
          personId: a.personId,
          personName: a.name,
          shareType: a.shareType || 'Owner',
          sharePercentage: a.sharePercentage || 100,
          roleType: a.roleType || 'Owner'
        })));

        setLoading(false);
      } catch (error) {
        setMessage({ text: error.message || 'فشل تحميل البيانات', type: 'danger' });
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (propertyData.governorateId) {
      getCenters(Number(propertyData.governorateId)).then(data => setCenters(data));
    }
  }, [propertyData.governorateId]);

  useEffect(() => {
    if (propertyData.centerId) {
      getStreets(Number(propertyData.centerId)).then(data => setStreets(data));
      getNeighborhoods(Number(propertyData.centerId)).then(data => setNeighborhoods(data));
    } else {
      setStreets([]);
      setNeighborhoods([]);
    }
  }, [propertyData.centerId]);

  const addOwnerRow = () => {
    setOwnersList([...ownersList, {
      id: Date.now(),
      personId: '',
      personName: '',
      shareType: 'Sale',
      sharePercentage: 0,
      roleType: 'Owner'
    }]);
  };

  const removeOwnerRow = (index) => {
    if (ownersList.length === 0) return;
    const newOwners = ownersList.filter((_, i) => i !== index);
    setOwnersList(newOwners);
  };

  const handleOwnerChange = (index, field, value) => {
    const newOwners = [...ownersList];
    newOwners[index][field] = value;
    setOwnersList(newOwners);
  };

  // 🆕 فتح مودال البحث لسطر معيّن - بنحفظ رقم السطر عشان لما يختار نعرف نحدّث مين
  const openCitizenSearch = (index) => {
    setActiveOwnerIndex(index);
    setShowCitizenModal(true);
  };

  // 🆕 لما يختار مواطن من المودال - نفس شكل البيانات المستخدم في LinkOwner.jsx
  // (citizen.nationalId, citizen.name, citizen.phone, citizen.address)
  const handleSelectCitizen = (citizen) => {
    if (activeOwnerIndex === null) return;

    setOwnersList(prev => {
      const next = [...prev];
      next[activeOwnerIndex] = {
        ...next[activeOwnerIndex],
        personId: citizen.nationalId || '',
        personName: citizen.name || '',
      };
      return next;
    });

    setShowCitizenModal(false);
    setActiveOwnerIndex(null);
  };

  const handlePropertyChange = (e) => {
    const { name, value } = e.target;
    if (name === 'governorateId') {
      setPropertyData({ ...propertyData, [name]: value, centerId: '', neighborhoodId: '', streetId: '' });
    } else if (name === 'centerId') {
      setPropertyData({ ...propertyData, [name]: value, neighborhoodId: '', streetId: '' });
    } else {
      setPropertyData({ ...propertyData, [name]: value });
    }
  };

  const totalShare = ownersList.reduce((acc, curr) => acc + Number(curr.sharePercentage || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    if (totalShare !== 100) {
      setMessage({ text: `تنبيه: مجموع نسب الملكية الحالي هو ${totalShare}%. يجب أن يكون 100% لتجنب مشاكل الضريبة.`, type: 'warning' });
      setSaving(false);
      return;
    }

    try {
      const dto = {
        governorateId: Number(propertyData.governorateId),
        centerId: Number(propertyData.centerId),
        neighborhoodId: Number(propertyData.neighborhoodId),
        streetId: Number(propertyData.streetId),
        buildingNo: propertyData.buildingNo,
        description: propertyData.description,
      };

      await updateProperty(id, dto);

      // ⚠️ لسه: حفظ تعديلات الملاك (ownersList) محتاج endpoint تحديث في AssignmentService
      // غير موجود عندي حالياً، فحاليًا بيتعرض ويتختار بس وميتحفظش فعليًا للـ DB.

      setMessage({ text: 'تم تحديث بيانات العقار بنجاح!', type: 'success' });
      setTimeout(() => navigate('/data-entry/home'), 1500);
    } catch (error) {
      console.error('Update Property Error:', error);
      setMessage({ text: error.response?.data?.message || 'حدث خطأ أثناء الحفظ', type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container fluid className="mt-4">
      <Row className="justify-content-center">
        <Col md={11} lg={10}>
          <Card className="shadow-sm border-0 border-top border-5 border-primary">
            <Card.Header className="bg-primary text-white py-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0 fw-bold"><i className="fa-solid fa-building me-2"></i> تعديل العقار و الملاك</h5>
                <small>رقم العقار: <Badge bg="light text-dark">{id}</Badge></small>
              </div>
              <Badge bg={totalShare === 100 ? "success" : "warning"} className="fs-6">
                مجموع الملكية: {totalShare}%
              </Badge>
            </Card.Header>

            <Card.Body>
              {message.text && <Alert variant={message.type} dismissible onClose={() => setMessage({ text: '', type: '' })}>{message.text}</Alert>}

              {loading ? (
                <div className="text-center py-5"><Spinner animation="border" /></div>
              ) : (
                <Form onSubmit={handleSubmit}>

                  <h6 className="text-primary fw-bold border-bottom pb-2 mb-3"><i className="fa-solid fa-map-pin me-2"></i> 1. بيانات الموقع</h6>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>المحافظة</Form.Label>
                        <Form.Select name="governorateId" value={propertyData.governorateId} onChange={handlePropertyChange} required>
                          <option value="">اختر المحافظة...</option>
                          {governorates.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>المركز</Form.Label>
                        <Form.Select name="centerId" value={propertyData.centerId} onChange={handlePropertyChange} required disabled={!propertyData.governorateId}>
                          <option value="">اختر المركز...</option>
                          {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>الحي / المنطقة الضريبية</Form.Label>
                        <Form.Select name="neighborhoodId" value={propertyData.neighborhoodId} onChange={handlePropertyChange} required disabled={!propertyData.centerId}>
                          <option value="">اختر الحي...</option>
                          {neighborhoods.map(n => <option key={n.id} value={n.id}>{`${n.name} (منطقة ${n.zone})`}</option>)}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>الشارع</Form.Label>
                        <Form.Select name="streetId" value={propertyData.streetId} onChange={handlePropertyChange} required disabled={!propertyData.centerId}>
                          <option value="">اختر الشارع...</option>
                          {streets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>رقم المبنى</Form.Label>
                        <Form.Control type="text" name="buildingNo" value={propertyData.buildingNo} onChange={handlePropertyChange} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>ملاحظات / وصف</Form.Label>
                        <Form.Control type="text" name="description" value={propertyData.description} onChange={handlePropertyChange} />
                      </Form.Group>
                    </Col>
                  </Row>

                  <h6 className="text-primary fw-bold border-bottom pb-2 mb-3 mt-4"><i className="fa-solid fa-users me-2"></i> 2. الملاك الحاليون</h6>
                  <div className="bg-light p-3 rounded border border-light mb-3">
                    <Table bordered hover size="sm" responsive>
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '40%' }}>اسم المالك</th>
                          <th style={{ width: '120px' }}>نسبة الملكية %</th>
                          <th style={{ width: '130px' }}>سبب التملك</th>
                          <th style={{ width: '80px' }}>حذف</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ownersList.map((owner, index) => (
                          <tr key={owner.id}>
                            <td>
                              <InputGroup size="sm">
                                <Form.Control
                                  value={owner.personName}
                                  readOnly
                                  placeholder="اختر المالك..."
                                  style={{ backgroundColor: '#fff' }}
                                />
                                {/* 🔧 كان الزرار ده من غير onClick خالص - دلوقتي بيفتح نفس مودال LinkOwner.jsx */}
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  type="button"
                                  onClick={() => openCitizenSearch(index)}
                                >
                                  <i className="fa-solid fa-search"></i>
                                </Button>
                              </InputGroup>
                            </td>
                            <td>
                              <Form.Control
                                type="number"
                                size="sm"
                                value={owner.sharePercentage}
                                onChange={(e) => handleOwnerChange(index, 'sharePercentage', e.target.value)}
                                required
                                min="0" max="100"
                              />
                            </td>
                            <td>
                              <Form.Select
                                size="sm"
                                value={owner.shareType}
                                onChange={(e) => handleOwnerChange(index, 'shareType', e.target.value)}
                              >
                                <option value="Full">تملك كامل</option>
                                <option value="Sale">بيع</option>
                                <option value="Inheritance">ميراث</option>
                                <option value="Gift">هبة</option>
                              </Form.Select>
                            </td>
                            <td className="text-center">
                              {ownersList.length > 1 && (
                                <Button variant="outline-danger" size="sm" onClick={() => removeOwnerRow(index)}>
                                  <i className="fa-solid fa-trash"></i>
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {ownersList.length === 0 && (
                          <tr><td colSpan="4" className="text-center text-muted">لا يوجد ملاك مرتبطين حالياً</td></tr>
                        )}
                      </tbody>
                    </Table>
                    <div className="d-flex justify-content-between align-items-center">
                      <Button variant="outline-secondary" size="sm" onClick={addOwnerRow}>
                        <i className="fa-solid fa-plus me-1"></i> إضافة مالك جديد
                      </Button>
                      <small className="text-muted">
                        {totalShare === 100
                          ? <span className="text-success fw-bold">✓ الملكية مكتملة (100%)</span>
                          : <span className="text-danger fw-bold">! النسبة الحالية: {totalShare}%</span>}
                      </small>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-3 mt-5 pt-3 border-top">
                    <Button variant="secondary" onClick={() => navigate('/data-entry/home')} size="lg">إلغاء</Button>
                    <Button variant="success" type="submit" disabled={saving} size="lg" className="fw-bold px-5">
                      {saving ? <><Spinner size="sm" animation="border" /> جاري الحفظ...</> : 'حفظ التعديلات'}
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 🆕 نفس المودال المستخدم في LinkOwner.jsx بالظبط */}
      <SelectCitizenModal
        show={showCitizenModal}
        handleClose={() => { setShowCitizenModal(false); setActiveOwnerIndex(null); }}
        onSelect={handleSelectCitizen}
      />
    </Container>
  );
};

export default EditProperty;