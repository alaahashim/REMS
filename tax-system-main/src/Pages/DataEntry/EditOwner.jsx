import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Card, Row, Col, Form,
  Button, Table, Badge, Spinner, Alert
} from 'react-bootstrap';
import {
  getOwnerById,
  getOwnerUnitsForEdit,
  updateOwner,
  updateAssignment
} from '../../services/assignmentService';

// ── usageType options ──
const USAGE_OPTIONS = [
  { value: 'Residential', label: 'سكني' },
  { value: 'Commercial',  label: 'تجاري' },
  { value: 'Industrial',  label: 'صناعي' },
  { value: 'Administrative', label: 'إداري' },
];

const EditOwner = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  // ── بيانات المالك ──
  const [owner,        setOwner]        = useState(null);
  const [phone,        setPhone]        = useState('');
  const [address,      setAddress]      = useState('');
  const [savingOwner,  setSavingOwner]  = useState(false);
  const [ownerSuccess, setOwnerSuccess] = useState(false);
  const [ownerError,   setOwnerError]   = useState('');

  // ── الوحدات ──
  const [units,       setUnits]       = useState([]);
  const [editingUnit, setEditingUnit] = useState(null); // { assignmentId, startDate, endDate, usageType }
  const [savingUnit,  setSavingUnit]  = useState(false);
  const [unitSuccess, setUnitSuccess] = useState(null); // assignmentId
  const [unitError,   setUnitError]   = useState('');

  // ── loading ──
  const [loadingOwner, setLoadingOwner] = useState(true);
  const [loadingUnits, setLoadingUnits] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const o = await getOwnerById(id);
        setOwner(o);
        setPhone(o.phone   || '');
        setAddress(o.address || '');
      } catch {
        setOwnerError('فشل تحميل بيانات المالك');
      } finally {
        setLoadingOwner(false);
      }
    };

    const loadUnits = async () => {
      try {
        const u = await getOwnerUnitsForEdit(id);
        setUnits(u);
      } catch {
        setUnitError('فشل تحميل الوحدات');
      } finally {
        setLoadingUnits(false);
      }
    };

    load();
    loadUnits();
  }, [id]);

  // ════════════════════════
  // حفظ بيانات المالك
  // ════════════════════════
  const handleSaveOwner = async () => {
    if (!phone.trim() || !address.trim()) {
      setOwnerError('رقم الهاتف والعنوان مطلوبان');
      return;
    }
    setSavingOwner(true);
    setOwnerError('');
    setOwnerSuccess(false);
    try {
      await updateOwner(id, { phone, address });
      setOwnerSuccess(true);
      setTimeout(() => setOwnerSuccess(false), 3000);
    } catch {
      setOwnerError('فشل حفظ بيانات المالك');
    } finally {
      setSavingOwner(false);
    }
  };

  // ════════════════════════
  // بدء تعديل وحدة
  // ════════════════════════
  const handleStartEditUnit = (unit) => {
    setEditingUnit({
      assignmentId: unit.assignmentId,
      startDate:    unit.startDate ? unit.startDate.split('T')[0] : '',
      endDate:      unit.endDate   ? unit.endDate.split('T')[0]   : '',
      usageType:    unit.usageType || 'Residential',
    });
    setUnitError('');
    setUnitSuccess(null);
  };

  const handleCancelEditUnit = () => setEditingUnit(null);

  // ════════════════════════
  // حفظ تعديل الوحدة
  // ════════════════════════
  const handleSaveUnit = async () => {
    if (!editingUnit.startDate) {
      setUnitError('تاريخ بداية الملكية مطلوب');
      return;
    }
    if (editingUnit.endDate && editingUnit.endDate < editingUnit.startDate) {
      setUnitError('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
      return;
    }

    setSavingUnit(true);
    setUnitError('');
    try {
      await updateAssignment(editingUnit.assignmentId, {
        startDate: editingUnit.startDate,
        endDate:   editingUnit.endDate || null,
        usageType: editingUnit.usageType,
      });

      // تحديث الوحدة محلياً
      setUnits(prev => prev.map(u =>
        u.assignmentId === editingUnit.assignmentId
          ? { ...u,
              startDate: editingUnit.startDate,
              endDate:   editingUnit.endDate || null,
              usageType: editingUnit.usageType }
          : u
      ));

      setUnitSuccess(editingUnit.assignmentId);
      setEditingUnit(null);
      setTimeout(() => setUnitSuccess(null), 3000);
    } catch {
      setUnitError('فشل حفظ بيانات الوحدة');
    } finally {
      setSavingUnit(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('ar-EG') : '-';

  const usageLabel = (val) =>
    USAGE_OPTIONS.find(o => o.value === val)?.label || val || '-';

  // ════════════════════════
  // Render
  // ════════════════════════
  if (loadingOwner) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4" style={{ maxWidth: '960px' }}>

      {/* ── زر الرجوع ── */}
      <Button
        variant="light"
        className="border mb-3 d-flex align-items-center gap-2"
        onClick={() => navigate(-1)}
      >
        <i className="fa-solid fa-arrow-right"></i>
        رجوع
      </Button>

      {/* ══════════════════════════════════════
          قسم بيانات المالك
      ══════════════════════════════════════ */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-white border-bottom py-3">
          <div className="d-flex align-items-center gap-2">
            <div
              className="bg-primary bg-opacity-10 rounded-circle d-flex
                         align-items-center justify-content-center"
              style={{ width: 40, height: 40 }}
            >
              <i className="fa-solid fa-user text-primary"></i>
            </div>
            <div>
              <h6 className="mb-0 fw-bold">{owner?.fullName}</h6>
              <small className="text-muted">تعديل بيانات المالك</small>
            </div>
            <Badge
              bg={owner?.ownerType === 'Legal' ? 'info' : 'light'}
              text={owner?.ownerType === 'Legal' ? 'white' : 'dark'}
              className="border ms-2"
            >
              {owner?.ownerType === 'Legal' ? 'اعتباري' : 'طبيعي'}
            </Badge>
          </div>
        </Card.Header>

        <Card.Body>
          {/* حقول القراءة فقط */}
          <Row className="g-3 mb-3">
            <Col md={6}>
              <Form.Label className="text-muted small mb-1">
                <i className="fa-solid fa-id-card me-1"></i> الرقم القومي
              </Form.Label>
              <Form.Control
                value={owner?.nationalId || ''}
                readOnly
                className="bg-light border-0 text-muted font-monospace"
              />
            </Col>
            <Col md={6}>
              <Form.Label className="text-muted small mb-1">
                <i className="fa-solid fa-signature me-1"></i> الاسم الكامل
              </Form.Label>
              <Form.Control
                value={owner?.fullName || ''}
                readOnly
                className="bg-light border-0 text-muted"
              />
            </Col>
          </Row>

          {/* حقول قابلة للتعديل */}
          <Row className="g-3 mb-3">
            <Col md={6}>
              <Form.Label className="fw-semibold small mb-1">
                <i className="fa-solid fa-phone me-1 text-primary"></i>
                رقم الهاتف
                <span className="text-danger ms-1">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="01xxxxxxxxx"
              />
            </Col>
            <Col md={6}>
              <Form.Label className="fw-semibold small mb-1">
                <i className="fa-solid fa-location-dot me-1 text-primary"></i>
                العنوان
                <span className="text-danger ms-1">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="المحافظة، المدينة، الشارع..."
              />
            </Col>
          </Row>

          {ownerError   && <Alert variant="danger"  className="py-2">{ownerError}</Alert>}
          {ownerSuccess && <Alert variant="success" className="py-2">تم حفظ بيانات المالك بنجاح ✓</Alert>}

          <div className="d-flex justify-content-end">
            <Button
              variant="primary"
              onClick={handleSaveOwner}
              disabled={savingOwner}
              className="d-flex align-items-center gap-2"
            >
              {savingOwner
                ? <><Spinner size="sm" /><span>جاري الحفظ...</span></>
                : <><i className="fa-solid fa-floppy-disk"></i><span>حفظ التعديلات</span></>
              }
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* ── عازل ── */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="flex-grow-1 border-top"></div>
        <div className="d-flex align-items-center gap-2 text-primary fw-bold">
          <i className="fa-solid fa-layer-group"></i>
          الوحدات المملوكة
        </div>
        <div className="flex-grow-1 border-top"></div>
      </div>

      {/* ══════════════════════════════════════
          قسم الوحدات
      ══════════════════════════════════════ */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">

          {unitError && (
            <Alert variant="danger" className="m-3 py-2">{unitError}</Alert>
          )}
          {unitSuccess && (
            <Alert variant="success" className="m-3 py-2">
              تم حفظ بيانات الوحدة بنجاح ✓
            </Alert>
          )}

          {loadingUnits ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : units.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="fa-solid fa-inbox fa-2x mb-3 d-block"></i>
              لا توجد وحدات مرتبطة بهذا المالك
            </div>
          ) : (
            <Table hover responsive className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>كود الوحدة</th>
                  <th>عنوان الوحدة</th>
                  <th>المساحة (م²)</th>
                  <th>نوع الاستخدام</th>
                  <th>تاريخ البداية</th>
                  <th>تاريخ النهاية</th>
                  <th className="text-end pe-4">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {units.map(unit => (
                  <React.Fragment key={unit.assignmentId}>

                    {/* ── صف العرض ── */}
                    <tr className={
                      editingUnit?.assignmentId === unit.assignmentId
                        ? 'd-none' : ''
                    }>
                      <td className="fw-bold text-primary">{unit.unitNumber || '-'}</td>
                      <td className="text-muted small">{unit.address || '-'}</td>
                      <td>{unit.area ?? '-'}</td>
                      <td>
                        <Badge bg="light" text="dark" className="border">
                          {usageLabel(unit.usageType)}
                        </Badge>
                      </td>
                      <td className="small">{formatDate(unit.startDate)}</td>
                      <td className="small text-muted">{formatDate(unit.endDate)}</td>
                      <td className="text-end pe-4">
                        <Button
                          variant="light"
                          size="sm"
                          className="text-primary border"
                          onClick={() => handleStartEditUnit(unit)}
                          title="تعديل"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </Button>
                      </td>
                    </tr>

                    {/* ── صف التعديل (inline) ── */}
                    {editingUnit?.assignmentId === unit.assignmentId && (
                      <tr className="table-warning">
                        <td className="fw-bold text-primary">{unit.unitNumber}</td>
                        <td className="text-muted small">{unit.address || '-'}</td>
                        <td>{unit.area ?? '-'}</td>

                        {/* نوع الاستخدام */}
                        <td>
                          <Form.Select
                            size="sm"
                            value={editingUnit.usageType}
                            onChange={e => setEditingUnit(p =>
                              ({ ...p, usageType: e.target.value })
                            )}
                          >
                            {USAGE_OPTIONS.map(o => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </Form.Select>
                        </td>

                        {/* تاريخ البداية */}
                        <td>
                          <Form.Control
                            type="date"
                            size="sm"
                            value={editingUnit.startDate}
                            onChange={e => setEditingUnit(p =>
                              ({ ...p, startDate: e.target.value })
                            )}
                          />
                        </td>

                        {/* تاريخ النهاية */}
                        <td>
                          <Form.Control
                            type="date"
                            size="sm"
                            value={editingUnit.endDate || ''}
                            onChange={e => setEditingUnit(p =>
                              ({ ...p, endDate: e.target.value })
                            )}
                          />
                        </td>

                        {/* أزرار الحفظ / الإلغاء */}
                        <td className="text-end pe-4">
                          <div className="d-flex justify-content-end gap-1">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={handleSaveUnit}
                              disabled={savingUnit}
                              title="حفظ"
                            >
                              {savingUnit
                                ? <Spinner size="sm" />
                                : <i className="fa-solid fa-check"></i>
                              }
                            </Button>
                            <Button
                              variant="light"
                              size="sm"
                              className="border"
                              onClick={handleCancelEditUnit}
                              title="إلغاء"
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}

                  </React.Fragment>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

    </Container>
  );
};

export default EditOwner;