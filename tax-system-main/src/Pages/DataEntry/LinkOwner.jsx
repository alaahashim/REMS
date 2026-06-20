// pages/DataEntry/LinkOwner.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Button,
  Row,
  Col,
  Alert,
  InputGroup,
  Spinner,
  Badge,
  Modal
} from 'react-bootstrap';
import {
  createAssignments,
  getAssignments
} from '../../services/assignmentService';
import api from '../../services/apiClient';
import SelectCitizenModal from '../../components/UI/SelectCitizenModal';
import './LinkOwner.css';

// ─── وحدة فارغة ──────────────────────────────────────────────────────────────
const emptyUnit = () => ({
  _key: Date.now() + Math.random(),
  unitId: '',
  unitLabel: '',
  shareType: 'Full',
  sharePercentage: 100,
  ownershipStartDate: '',
  ownershipEndDate: '',
});

// ════════════════════════════════════════════════════════════════════════════
// مودال اختيار العقار — تم دمجه هنا كمكوّن داخلي بدلاً من ملف منفصل
// ════════════════════════════════════════════════════════════════════════════
const PropertySelectModal = ({ show, handleClose, onSelect }) => {
  const [search, setSearch] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState('');
  const [unitsError, setUnitsError] = useState('');

  // لحماية الطلبات من حالة "السباق" (Race Condition):
  // لو المستخدم كتب بسرعة، نتجاهل أي استجابة قديمة وصلت متأخرة
  const requestIdRef = useRef(0);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (!show) return;

    setSearch('');
    setError('');
    setUnitsError('');
    fetchProperties('');

    // تنظيف أي بحث مؤجل عند إغلاق المودال
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const fetchProperties = async (q = '') => {
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get('/properties', {
        params: q ? { search: q } : undefined,
      });

      // لو وصلت استجابة طلب قديم بعد طلب أحدث، نتجاهلها
      if (currentRequestId !== requestIdRef.current) return;

      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;

      setError(err?.message || 'تعذّر تحميل العقارات');
      setProperties([]);
    } finally {
      if (currentRequestId === requestIdRef.current) setLoading(false);
    }
  };

  // بحث مع تأخير بسيط (debounce) بدل إرسال طلب مع كل ضغطة زر
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => fetchProperties(value), 350);
  };

  const handlePickProperty = async (prop) => {
    setPicking(true);
    setUnitsError('');

    try {
      // 🔥 المصدر الوحيد للـ units
      const { data } = await api.get(`/properties/${prop.id}/units`);

      const units = Array.isArray(data) ? data : [];

      onSelect({
        id: prop.id,
        name: prop.description || prop.name || '',
        address: prop.address || '',
        units,
      });

      handleClose();
    } catch (err) {
      setUnitsError(err?.message || 'تعذّر تحميل الوحدات');
    } finally {
      setPicking(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" dir="rtl">
      <Modal.Header closeButton>
        <Modal.Title>اختيار العقار</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <InputGroup className="mb-3">
          <Form.Control
            placeholder="بحث..."
            value={search}
            onChange={handleSearchChange}
          />
        </InputGroup>

        {error && <Alert variant="danger">{error}</Alert>}
        {unitsError && <Alert variant="danger">{unitsError}</Alert>}

        {(loading || picking) && (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" />
          </div>
        )}

        {!loading && !picking && (
          <div className="list-group">
            {properties.length === 0 ? (
              <div className="text-center text-muted py-3">
                لا توجد عقارات مطابقة
              </div>
            ) : (
              properties.map(prop => (
                <button
                  key={prop.id}
                  type="button"
                  className="list-group-item list-group-item-action"
                  onClick={() => handlePickProperty(prop)}
                >
                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="fw-bold">
                        {prop.description || `عقار #${prop.id}`}
                      </div>
                      <small>{prop.address || ''}</small>
                    </div>

                    <Badge bg="secondary">#{prop.id}</Badge>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// المكوّن الرئيسي
// ════════════════════════════════════════════════════════════════════════════
const LinkOwner = () => {
  const navigate = useNavigate();

  const [ownerData, setOwnerData] = useState({
    personId: '',
    personName: '',
    contactPhone: '',
    address: '',
    propertyId: '',
  });

  const [units, setUnits] = useState([emptyUnit()]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [ownerStats, setOwnerStats] = useState({ ownedUnitsCount: 0 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showCitizenModal, setShowCitizenModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);

  // ────────────────────────────────────────────────────────────────────────────
  // تحميل إحصائيات المالك عند تغيير الرقم القومي
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ownerData.personId) {
      setOwnerStats({ ownedUnitsCount: 0 });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const all = await getAssignments();
        if (cancelled) return;

        const mine = Array.isArray(all)
          ? all.filter(
              a =>
                String(a.personId) === String(ownerData.personId) &&
                a.roleType === 'Owner'
            )
          : [];

        setOwnerStats({ ownedUnitsCount: mine.length });

        // لو المالك موجود سابقاً، نملأ بياناته تلقائياً لو الحقول الحالية فارغة
        if (mine.length > 0) {
          setOwnerData(prev => ({
            ...prev,
            personName: prev.personName || mine[0].personName || '',
            contactPhone: prev.contactPhone || mine[0].contactPhone || '',
            address: prev.address || mine[0].address || '',
          }));
        }
      } catch (err) {
        // لا نوقف الصفحة بسبب الإحصائيات — فقط log للتشخيص
        console.warn('Owner stats fetch failed:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ownerData.personId]);

  // ────────────────────────────────────────────────────────────────────────────
  // اختيار مواطن
  // ────────────────────────────────────────────────────────────────────────────
  const handleSelectCitizen = useCallback((citizen) => {
    setOwnerData(prev => ({
      ...prev,
      personId: citizen.nationalId || '',
      personName: citizen.name || '',
      contactPhone: citizen.phone || '',
      address: citizen.address || '',
    }));
    setShowCitizenModal(false);
  }, []);

  // ────────────────────────────────────────────────────────────────────────────
  // اختيار عقار
  // PropertySelectModal يُمرر العقار بالشكل:
  // { id, name, address, units: [...] }
  // ────────────────────────────────────────────────────────────────────────────
  const handleSelectProperty = useCallback((prop) => {
    setOwnerData(prev => ({
      ...prev,
      propertyId: String(prop.id || ''),
    }));

    setSelectedProperty({
      id: prop.id,
      name: prop.name || '',
      address: prop.address || '',
      units: prop.units || [],
    });

    setUnits([emptyUnit()]);
    setShowPropertyModal(false);
  }, []);

  // ────────────────────────────────────────────────────────────────────────────
  // تحديث حقل داخل سطر وحدة
  // ────────────────────────────────────────────────────────────────────────────
  const updateUnit = useCallback((index, field, value) => {
    setUnits(prev => {
      const next = [...prev];

      next[index] = {
        ...next[index],
        [field]:
          field === 'unitId'
            ? (value === '' ? '' : Number(value))
            : value,
      };

      if (field === 'unitId') {
        const found = selectedProperty?.units?.find(
          u => String(u.id) === String(value)
        );

        next[index].unitLabel = found
          ? `وحدة ${found.unitNumber || '-'} - دور ${found.floor ?? '-'}`
          : '';
      }

      return next;
    });
  }, [selectedProperty]);

  // ────────────────────────────────────────────────────────────────────────────
  // توزيع الحصص بالتساوي
  // ────────────────────────────────────────────────────────────────────────────
  const distributeSharesEvenly = () => {
    if (!units.length) return;

    const perUnit = Math.floor(100 / units.length);
    const remainder = 100 - perUnit * units.length;

    setUnits(prev =>
      prev.map((u, i) => ({
        ...u,
        sharePercentage: i === 0 ? perUnit + remainder : perUnit,
      }))
    );
  };

  // ────────────────────────────────────────────────────────────────────────────
  // إضافة / حذف وحدة
  // ────────────────────────────────────────────────────────────────────────────
  const addUnit = () => {
    setUnits(prev => [...prev, emptyUnit()]);
  };

  const removeUnit = (index) => {
    if (units.length === 1) return;
    setUnits(prev => prev.filter((_, i) => i !== index));
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Validation محلي قبل الإرسال — هذا الآن المصدر الوحيد للتحقق
  // (سابقاً كانت هذه الدالة معرّفة لكن غير مستخدمة، وكان هناك تحقق مكرر
  //  وأقل اكتمالاً داخل handleSubmit، وكان ينقصه التحقق من تاريخ النهاية)
  // ────────────────────────────────────────────────────────────────────────────
  const validateBeforeSubmit = () => {
    const { personId, personName, contactPhone, address, propertyId } = ownerData;

    if (!personId || !personName || !contactPhone || !address || !propertyId) {
      return 'يجب إدخال الرقم القومي، الاسم، الهاتف، العنوان، واختيار العقار أولاً';
    }

    if (!selectedProperty) {
      return 'يجب اختيار عقار أولاً';
    }

    // لو العقار له وحدات مسجلة، لازم كل سطر يختار وحدة فعلية
    if (Array.isArray(selectedProperty.units) && selectedProperty.units.length > 0) {
      const missingUnit = units.some(
        u => !u.unitId || isNaN(Number(u.unitId)) || Number(u.unitId) <= 0
      );

      if (missingUnit) {
        return 'يجب اختيار الوحدة لكل سطر قبل الربط';
      }

      const unitIds = units.map(u => Number(u.unitId));
      const hasDuplicate = unitIds.length !== new Set(unitIds).size;

      if (hasDuplicate) {
        return 'لا يمكن تكرار نفس الوحدة في أكثر من سطر';
      }
    }

    // الحصة لكل سطر
    const invalidShare = units.some(u => {
      const val = Number(u.sharePercentage);
      return isNaN(val) || val < 0 || val > 100;
    });

    if (invalidShare) {
      return 'نسبة الحصة لكل وحدة يجب أن تكون بين 0 و 100';
    }

    // تاريخ البداية مطلوب
    const missingStartDate = units.some(u => !u.ownershipStartDate);
    if (missingStartDate) {
      return 'يجب إدخال تاريخ البداية لكل وحدة';
    }

    // تاريخ النهاية يجب أن يكون بعد البداية
    const invalidEndDate = units.some(u => {
      if (!u.ownershipEndDate) return false;
      return new Date(u.ownershipEndDate) < new Date(u.ownershipStartDate);
    });

    if (invalidEndDate) {
      return 'تاريخ النهاية يجب أن يكون بعد أو يساوي تاريخ البداية';
    }

    return null;
  };

  // ────────────────────────────────────────────────────────────────────────────
  // الإرسال
  // ────────────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    const validationError = validateBeforeSubmit();
    if (validationError) {
      setMessage({ text: validationError, type: 'danger' });
      return;
    }

    setLoading(true);

    try {
      const payload = units.map(u => ({
        personId: ownerData.personId,
        personName: ownerData.personName,
        contactPhone: ownerData.contactPhone,
        address: ownerData.address,
        propertyId: Number(ownerData.propertyId),
        unitId: Number(u.unitId),
        roleType: 'Owner',
        shareType: u.shareType,
        sharePercentage: Number(u.sharePercentage),
        ownershipStartDate: u.ownershipStartDate,
        ownershipEndDate: u.ownershipEndDate || null,
        isActive: true,
      }));

      await createAssignments(payload);

      setMessage({
        text: 'تم ربط المالك بالوحدة/الوحدات بنجاح ✔',
        type: 'success'
      });

      setTimeout(() => navigate('/data-entry/home'), 1500);
    } catch (err) {
      const backendMsg =
        err?.errors?.length
          ? err.errors.join(' | ')
          : err?.message || 'حدث خطأ أثناء الربط';

      setMessage({
        text: backendMsg,
        type: 'danger'
      });

      console.error('Create Assignments Error =>', err);
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // مشتقات واجهة
  // ────────────────────────────────────────────────────────────────────────────
  const totalShare = units.reduce(
    (sum, u) => sum + Number(u.sharePercentage || 0),
    0
  );

  const hasProperty = !!selectedProperty;
  const hasUnits =
    Array.isArray(selectedProperty?.units) &&
    selectedProperty.units.length > 0;

  // ────────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="lo-page" dir="rtl">
      {/* ══ رأس الصفحة ══ */}
      <div className="lo-page-header">
        <h4 className="lo-page-title">
          <i className="fa-solid fa-users-gear lo-icon-title" />
          ربط المالك بالعقار
        </h4>
      </div>

      {message.text && (
        <Alert
          variant={message.type}
          className="lo-alert"
          onClose={() => setMessage({ text: '', type: '' })}
          dismissible
        >
          {message.text}
        </Alert>
      )}

      <Form onSubmit={handleSubmit} noValidate>
        {/* ════ قسم 1: بيانات المالك ════ */}
        <div className="lo-section">
          <div className="lo-section-title">
            <i className="fa-solid fa-user" />
            بيانات المالك
          </div>

          <Row className="g-3">
            {/* الرقم القومي */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="lo-label">
                  الرقم القومي <span className="lo-req">*</span>
                </Form.Label>

                <InputGroup>
                  <Form.Control
                    type="text"
                    value={ownerData.personId}
                    onChange={e =>
                      setOwnerData(prev => ({
                        ...prev,
                        personId: e.target.value.trim(),
                      }))
                    }
                    placeholder="أدخل الرقم القومي أو ابحث..."
                    maxLength={14}
                    className="lo-input"
                  />

                  <Button
                    variant="outline-primary"
                    className="lo-search-btn"
                    onClick={() => setShowCitizenModal(true)}
                    type="button"
                  >
                    <i className="fa-solid fa-magnifying-glass" />
                  </Button>
                </InputGroup>

                <Form.Text className="lo-hint">
                  {ownerStats.ownedUnitsCount > 0 ? (
                    <span className="lo-hint-warn">
                      <i className="fa-solid fa-circle-info me-1" />
                      مرتبط بـ {ownerStats.ownedUnitsCount} وحدة حالياً، سيتم إعادة استخدام بياناته
                    </span>
                  ) : (
                    'يمكنك اختيار مالك موجود أو تسجيل مالك جديد'
                  )}
                </Form.Text>
              </Form.Group>
            </Col>

            {/* اسم المالك */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="lo-label">
                  اسم المالك <span className="lo-req">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={ownerData.personName}
                  onChange={e =>
                    setOwnerData(prev => ({
                      ...prev,
                      personName: e.target.value,
                    }))
                  }
                  placeholder="أدخل اسم المالك"
                  className="lo-input"
                />
              </Form.Group>
            </Col>

            {/* الهاتف */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="lo-label">
                  الهاتف <span className="lo-req">*</span>
                </Form.Label>
                <Form.Control
                  type="tel"
                  value={ownerData.contactPhone}
                  onChange={e =>
                    setOwnerData(prev => ({
                      ...prev,
                      contactPhone: e.target.value,
                    }))
                  }
                  placeholder="مثال: 01012345678"
                  className="lo-input"
                />
              </Form.Group>
            </Col>

            {/* العنوان */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="lo-label">
                  العنوان <span className="lo-req">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={ownerData.address}
                  onChange={e =>
                    setOwnerData(prev => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="أدخل عنوان المالك"
                  className="lo-input"
                />
              </Form.Group>
            </Col>

            {/* العقار */}
            <Col md={12}>
              <Form.Group>
                <Form.Label className="lo-label">
                  العقار <span className="lo-req">*</span>
                </Form.Label>

                <InputGroup>
                  <InputGroup.Text className="lo-input-icon">
                    <i className="fa-solid fa-building" />
                  </InputGroup.Text>

                  <Form.Control
                    type="text"
                    readOnly
                    placeholder="انقر على بحث لاختيار العقار..."
                    value={
                      selectedProperty
                        ? `#${selectedProperty.id} — ${selectedProperty.name || ''} ${selectedProperty.address || ''}`
                        : ownerData.propertyId
                    }
                    className="lo-input"
                  />

                  <Button
                    variant="outline-primary"
                    className="lo-search-btn"
                    onClick={() => setShowPropertyModal(true)}
                    type="button"
                  >
                    <i className="fa-solid fa-magnifying-glass" /> بحث
                  </Button>
                </InputGroup>

                {/* معلومات الوحدات بعد الاختيار */}
                {hasProperty && (
                  <Form.Text className="lo-hint">
                    {hasUnits ? (
                      <span className="text-success">
                        <i className="fa-solid fa-circle-check me-1" />
                        تم تحميل {selectedProperty.units.length} وحدة — اختر منها أدناه
                      </span>
                    ) : (
                      <span className="text-warning">
                        <i className="fa-solid fa-triangle-exclamation me-1" />
                        هذا العقار لا يحتوي على وحدات مسجّلة
                      </span>
                    )}
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* ════ قسم 2: الوحدات والحصص ════ */}
        <div className="lo-section">
          <div className="lo-section-title">
            <i className="fa-solid fa-layer-group" />
            الوحدات والحصص
            <Badge bg="secondary" className="ms-2">
              {units.length} وحدة
            </Badge>
          </div>

          {/* رأس الجدول */}
          <div className="lo-units-header">
            <span style={{ flex: '2' }}>
              {hasUnits ? 'الوحدة' : 'الدور / الشقة'}
            </span>
            <span style={{ flex: '2' }}>نوع العلاقة</span>
            <span style={{ flex: '1', textAlign: 'center' }}>الحصة %</span>
            <span style={{ flex: '2' }}>تاريخ البداية</span>
            <span style={{ flex: '2' }}>تاريخ النهاية</span>
            <span style={{ flex: '0 0 40px' }}></span>
          </div>

          {/* صفوف الوحدات */}
          {units.map((unit, index) => (
            <div key={unit._key} className="lo-unit-row">
              {/* الوحدة */}
              <div className="lo-unit-field" style={{ flex: '2' }}>
                {hasUnits ? (
                  <Form.Select
                    value={unit.unitId}
                    onChange={e => updateUnit(index, 'unitId', e.target.value)}
                    className="lo-input"
                  >
                    <option value="">اختر الوحدة...</option>
                    {selectedProperty?.units?.map(u => (
                      <option
                        key={u.id}
                        value={u.id}
                        disabled={units.some(
                          (otherUnit, otherIndex) =>
                            otherIndex !== index &&
                            otherUnit.unitId !== '' &&
                            Number(otherUnit.unitId) === u.id
                        )}
                      >
                        {`وحدة ${u.unitNumber || '-'} - ${u.unitType || 'وحدة'} - دور ${u.floor ?? '-'} - ${u.area ?? '-'} م²`}
                        {u.status ? ` (${u.status})` : ''}
                      </option>
                    ))}
                  </Form.Select>
                ) : (
                  <Form.Control
                    type="text"
                    value={unit.unitLabel}
                    onChange={e => updateUnit(index, 'unitLabel', e.target.value)}
                    placeholder="مثال: دور 3 أو شقة 12"
                    className="lo-input"
                  />
                )}
              </div>

              {/* نوع العلاقة */}
              <div className="lo-unit-field" style={{ flex: '2' }}>
                <Form.Select
                  value={unit.shareType}
                  onChange={e => updateUnit(index, 'shareType', e.target.value)}
                  className="lo-input"
                >
                  <option value="Full">تملّك كامل</option>
                  <option value="Inheritance">ميراث</option>
                  <option value="Sale">بيع</option>
                  <option value="Gift">هبة</option>
                  <option value="Rent">إيجار</option>
                </Form.Select>
              </div>

              {/* نسبة الحصة */}
              <div className="lo-unit-field" style={{ flex: '1' }}>
                <Form.Control
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={unit.sharePercentage}
                  onChange={e => updateUnit(index, 'sharePercentage', e.target.value)}
                  className="lo-input lo-input-center"
                />
              </div>

              {/* تاريخ البداية */}
              <div className="lo-unit-field" style={{ flex: '2' }}>
                <Form.Control
                  type="date"
                  value={unit.ownershipStartDate}
                  onChange={e => updateUnit(index, 'ownershipStartDate', e.target.value)}
                  className="lo-input"
                />
              </div>

              {/* تاريخ النهاية */}
              <div className="lo-unit-field" style={{ flex: '2' }}>
                <Form.Control
                  type="date"
                  value={unit.ownershipEndDate}
                  min={unit.ownershipStartDate || undefined}
                  onChange={e => updateUnit(index, 'ownershipEndDate', e.target.value)}
                  className="lo-input"
                />
              </div>

              {/* حذف */}
              <div
                className="lo-unit-field lo-unit-del"
                style={{ flex: '0 0 40px' }}
              >
                <button
                  type="button"
                  className="lo-del-btn"
                  onClick={() => removeUnit(index)}
                  disabled={units.length === 1}
                  title="حذف هذه الوحدة"
                >
                  <i className="fa-solid fa-trash-can" />
                </button>
              </div>
            </div>
          ))}

          {/* شريط الإجماليات */}
          <div className="lo-units-footer">
            <div className="d-flex gap-2">
              <button
                type="button"
                className="lo-add-btn"
                onClick={addUnit}
                disabled={hasUnits && units.length >= selectedProperty.units.length}
              >
                <i className="fa-solid fa-plus" /> إضافة وحدة أخرى
              </button>

              {units.length > 1 && (
                <button
                  type="button"
                  className="lo-add-btn lo-add-btn-secondary"
                  onClick={distributeSharesEvenly}
                >
                  <i className="fa-solid fa-percent" /> توزيع متساوٍ
                </button>
              )}
            </div>

            <div className="lo-share-total">
              <span>مجموع الحصص:</span>
              <span className="lo-share-value">{totalShare}%</span>
            </div>
          </div>
        </div>

        {/* ════ أزرار الإجراءات ════ */}
        <div className="lo-actions">
          <Button
            variant="secondary"
            className="lo-btn-cancel"
            onClick={() => navigate('/data-entry/home')}
            type="button"
          >
            إلغاء
          </Button>

          <Button
            variant="success"
            type="submit"
            disabled={loading}
            className="lo-btn-confirm"
          >
            {loading ? (
              <>
                <Spinner size="sm" animation="border" className="me-1" />
                جارٍ الحفظ...
              </>
            ) : (
              <>
                <i className="fa-solid fa-check me-1" />
                تأكيد الربط
              </>
            )}
          </Button>
        </div>
      </Form>

      {/* ══ المودالات ══ */}
      <SelectCitizenModal
        show={showCitizenModal}
        handleClose={() => setShowCitizenModal(false)}
        onSelect={handleSelectCitizen}
      />

      <PropertySelectModal
        show={showPropertyModal}
        handleClose={() => setShowPropertyModal(false)}
        onSelect={handleSelectProperty}
      />
    </div>
  );
};

export default LinkOwner;
