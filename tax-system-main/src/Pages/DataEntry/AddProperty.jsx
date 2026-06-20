import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col, Alert, Spinner, Table } from 'react-bootstrap';
import { createProperty } from '../../services/propertyService'; 
import { getGovernorates, getCenters, getStreets, getNeighborhoods } from '../../services/locationService';

const AddProperty = () => {
  const navigate = useNavigate();
  
  const [propertyData, setPropertyData] = useState({
    governorateId: '',
    centerId: '',
    neighborhoodId: '',
    streetId: '',
    buildingNo: '',
    buildYear: '',
    description: '',

  });

  const [governorates, setGovernorates] = useState([]);
  const [centers, setCenters] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [streets, setStreets] = useState([]);
  const [units, setUnits] = useState([
    { unitType: 'Apartment', floor: 1, area: 0, usage: 'Residential' }
  ]);

  const [isSingleOwner, setIsSingleOwner] = useState(false);  
  const [totalArea, setTotalArea] = useState(0);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // تحميل المحافظات
  useEffect(() => {
    getGovernorates().then(data => setGovernorates(data)).catch(err => console.error(err));
  }, []);

  // تحميل المراكز
  useEffect(() => {
    if (propertyData.governorateId) {
      getCenters(Number(propertyData.governorateId)).then(data => {
        setCenters(data);
        setStreets([]); 
      });
    } else {
      setCenters([]);
      setStreets([]);
    }
  }, [propertyData.governorateId]);

  // تحميل الشوارع
  useEffect(() => {
    if (propertyData.centerId) {
      getStreets(Number(propertyData.centerId)).then(data => setStreets(data));
      getNeighborhoods(Number(propertyData.centerId)).then(data => setNeighborhoods(data));
    } else {
      setStreets([]);
      setNeighborhoods([]);
    }
  }, [propertyData.centerId]);

  const handlePropertyChange = (e) => {
    const { name, value, checked } = e.target;
    
    if (name === 'isSingleOwner') {
        setIsSingleOwner(checked);
        if(checked) {
            setUnits([{ unitType: 'Villa/House', floor: 1, area: 0, usage: 'Residential',    status: 'Available'
 }]);
        } else {
            setUnits([{ unitType: 'Apartment', floor: 1, area: 0, usage: 'Residential',    status: 'Available'
 }]);
        }
    } else if (name === 'governorateId') {
        setPropertyData({ ...propertyData, [name]: value, centerId: '', neighborhoodId: '', streetId: '' });
    } else if (name === 'centerId') {
        setPropertyData({ ...propertyData, [name]: value, neighborhoodId: '', streetId: '' });
    } else {
        setPropertyData({ ...propertyData, [name]: value });
    }
  };

  const handleUnitChange = (index, field, value) => {
    const newUnits = [...units];
    newUnits[index][field] = value;
    setUnits(newUnits);
  };

  const addUnitRow = () => {
    setUnits([...units, { unitType: 'Apartment', floor: units.length + 1, area: 0, usage: 'Residential',    status: 'Available'
 }]);
  };

  const removeUnitRow = (index) => {
    if (units.length > 1) {
      const newUnits = units.filter((_, i) => i !== index);
      setUnits(newUnits);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // تجهيز البيانات
      const finalPropertyData = {
        ...propertyData,
        governorateId: Number(propertyData.governorateId),
        centerId: Number(propertyData.centerId),
        neighborhoodId: Number(propertyData.neighborhoodId),
        streetId: Number(propertyData.streetId)
      };

      let unitsToSave = [];
      if (isSingleOwner) {
        unitsToSave = [{
            unitType: 'Villa/House', 
            floor: 1, 
            area: Number(totalArea), 
            usage: units[0]?.usage || 'Residential',
            status: units[0]?.status || 'Available'
        }];
      } else {
        unitsToSave = units.map(u => ({
            ...u,
            area: Number(u.area)
        }));
      }

      // استدعاء دالة الـ Service (تقوم بالحفظ والربط التلقائي)
      const result = await createProperty(finalPropertyData, unitsToSave);
      
      setMessage({ 
        text: `تم تسجيل العقار ورابط المالك بنجاح! رقم العقار: ${result.id}`, 
        type: 'success' 
      });
      
      setTimeout(() => navigate('/data-entry/home'), 3000);
    } catch (error) {
      console.error(error);
      setMessage({ text: 'حدث خطأ أثناء الحفظ', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="mt-4">
      <Row className="justify-content-center">
        <Col md={12} lg={11}>
          <Card className="shadow-sm border-0 border-top border-5 border-primary">
            <Card.Header className="bg-primary text-white py-4">
              <h5 className="mb-0"><i className="fa-solid fa-building me-2"></i> تسجيل عقار جديد</h5>
            </Card.Header>
            <Card.Body>
              {message.text && <Alert variant={message.type} className="mb-4">{message.text}</Alert>}

              <Form onSubmit={handleSubmit}>
                <h5 className="text-primary fw-bold border-bottom pb-2 mb-4">بيانات المبنى والمالك</h5>
                
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-primary fw-bold">المحافظة <span className="text-danger">*</span></Form.Label>
                      <Form.Select name="governorateId" value={propertyData.governorateId} onChange={handlePropertyChange} required>
                        <option value="">اختر المحافظة...</option>
                        {governorates.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-primary fw-bold">المركز <span className="text-danger">*</span></Form.Label>
                      <Form.Select name="centerId" value={propertyData.centerId} onChange={handlePropertyChange} required disabled={!propertyData.governorateId}>
                        <option value="">اختر المركز...</option>
                        {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-primary fw-bold">اسم الشارع <span className="text-danger">*</span></Form.Label>
                      <Form.Select name="streetId" value={propertyData.streetId} onChange={handlePropertyChange} required disabled={!propertyData.centerId}>
                        <option value="">اختر الشارع...</option>
                        {streets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-primary fw-bold">الحي / المنطقة الضريبية <span className="text-danger">*</span></Form.Label>
                      <Form.Select name="neighborhoodId" value={propertyData.neighborhoodId} onChange={handlePropertyChange} required disabled={!propertyData.centerId}>
                        <option value="">اختر الحي...</option>
                        {neighborhoods.map(n => <option key={n.id} value={n.id}>{`${n.name} (منطقة ${n.zone})`}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
          <Col md={4}>
  <Form.Group className="mb-3">
    <Form.Label className="text-primary fw-bold">
      سنة البناء
    </Form.Label>

    <Form.Select
      name="buildYear"
      value={propertyData.buildYear}
      onChange={handlePropertyChange}
    >
      <option value="">اختر سنة البناء</option>

      {Array.from(
        { length: new Date().getFullYear() - 1900 + 1 },
        (_, i) => 1900 + i
      ).reverse().map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </Form.Select>
  </Form.Group>
</Col>
<Col md={8}>
  <Form.Group className="mb-3">
    <Form.Label className="text-primary fw-bold">
      وصف العقار
    </Form.Label>

    <Form.Control
      as="textarea"
      rows={2}
      name="description"
      value={propertyData.description}
      onChange={handlePropertyChange}
      placeholder="اكتب وصف العقار..."
    />
  </Form.Group>
</Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Alert variant="info" className="py-2">
                      <div className="fw-bold">ملاحظة:</div>
                      <div>بيانات المالك لا تُسجّل في هذه المرحلة. سيتم ربط المالك لاحقاً من صفحة "ربط المالك" مع الاسم، الرقم القومي، الهاتف، والإيميل.</div>
                    </Alert>
                  </Col>
                </Row>

                <div className="bg-light p-3 rounded border mb-4 border-primary">
                    <Form.Check 
                        type="switch"
                        id="single-owner-switch"
                        label={<span className="text-primary fw-bold">ملكية فردية للعقار بالكامل (فيلا / منزل)</span>}
                        name="isSingleOwner"
                        checked={isSingleOwner}
                        onChange={handlePropertyChange}
                        className="fw-bold"
                    />
                    <Form.Text className="text-muted d-block ms-4 mt-1">
                        {isSingleOwner 
                            ? "سيتم تسجيل العقار كوحدة ضريبية واحدة (لا داعي لتقسيم شقق)" 
                            : "سيتم تسجيل العقار كمبنى يحتوي على عدة وحدات (شقق/محلات)"}
                    </Form.Text>
                </div>

                {!isSingleOwner ? (
                    <>
                        <h5 className="text-primary fw-bold border-bottom pb-2 mb-3">الوحدات داخل المبنى</h5>
                        <div className="table-responsive">
                        <Table bordered hover size="sm">
                            <thead className="table-light">
                            <tr>
                                <th style={{width: '50px'}}>#</th>
                                <th>نوع الوحدة</th>
                                <th>الدور</th>
                                <th>المساحة (م²)</th>
                                <th>الاستخدام</th>
                                <th>الحالة</th>
                                <th style={{width: '80px'}}>حذف</th>
                            </tr>
                            </thead>
                            <tbody>
                            {units.map((unit, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <Form.Select size="sm" value={unit.unitType} onChange={(e) => handleUnitChange(index, 'unitType', e.target.value)}>
                                            <option value="Apartment">شقة</option>
                                            <option value="Shop">محل تجاري</option>
                                        </Form.Select>
                                    </td>
                                    <td>
                                        <Form.Control type="number" size="sm" value={unit.floor} onChange={(e) => handleUnitChange(index, 'floor', e.target.value)} />
                                    </td>
                                    <td>
                                        <Form.Control type="number" size="sm" placeholder="المساحة" value={unit.area} onChange={(e) => handleUnitChange(index, 'area', e.target.value)} required />
                                    </td>
                                    <td>
                                        <Form.Select size="sm" value={unit.usage} onChange={(e) => handleUnitChange(index, 'usage', e.target.value)}>
                                            <option value="Residential">سكني</option>
                                            <option value="Commercial">تجاري</option>
                                        </Form.Select>
                                    </td>
                                    <td>
                              <Form.Select
                                 size="sm"
                                 value={unit.status}
                                 onChange={(e) =>
                                 handleUnitChange( index,'status', e.target.value )}>
    <option value="Available">
      متوفر
    </option>

    <option value="Occupied">
      مشغول
    </option>
  </Form.Select>
</td>
                                    <td className="text-center">
                                        {units.length > 1 && (
                                            <Button variant="outline-danger" size="sm" onClick={() => removeUnitRow(index)}>
                                                <i className="fa-solid fa-trash"></i>
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                        </div>
                        <Button variant="outline-primary" size="sm" onClick={addUnitRow} className="mb-4">
                            <i className="fa-solid fa-plus me-1"></i> إضافة وحدة أخرى
                        </Button>
                    </>
                ) : (
                    <div className="border border-success p-3 rounded bg-light">
                        <h6 className="text-success fw-bold">بيانات الوحدة الوحيدة (Villa/House)</h6>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>المساحة الكلية للعقار (م²) <span className="text-danger">*</span></Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        value={totalArea} 
                                        onChange={(e) => setTotalArea(e.target.value)} 
                                        placeholder="مثال: 250"
                                        required 
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>الاستخدام</Form.Label>
                                    <Form.Select 
                                        value={units[0]?.usage || 'Residential'} 
                                        onChange={(e) => handleUnitChange(0, 'usage', e.target.value)}
                                    >
                                        <option value="Residential">سكني</option>
                                        <option value="Commercial">تجاري</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                )}

                <div className="d-flex justify-content-between mt-5">
                  <Button variant="secondary" onClick={() => navigate('/data-entry/home')}>إلغاء</Button>
                  <Button variant="success" type="submit" disabled={loading} size="lg" className="fw-bold">
                    {loading ? <><Spinner size="sm" animation="border" /> جاري الحفظ...</> : 'حفظ'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddProperty;