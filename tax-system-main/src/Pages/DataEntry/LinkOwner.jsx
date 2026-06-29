import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form, Button, Row, Col, Alert, InputGroup, Spinner, Badge, Modal, Container, Card
} from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext'; // <--- 1. استدعاء اللغة
import { useDynamicTranslation } from '../../utils/useDynamicTranslation'; // <--- 2. استدعاء الأداة

import { createAssignments, getAssignments } from '../../services/assignmentService';
import api from '../../services/apiClient';
import SelectCitizenModal from '../../components/UI/SelectCitizenModal';
import './LinkOwner.css';

// ════════════════════════════════════════════════════════════════
// 3. مكونات مساعدة لترجمة الداتا ديناميكياً
// ════════════════════════════════════════════════════════════════
const DynText = ({ text, lang }) => {
  const translated = useDynamicTranslation(text || '', lang);
  return <>{translated || '-'}</>;
};

const TranslatedInput = ({ value, lang, className }) => {
  const translated = useDynamicTranslation(value, lang);
  return <Form.Control type="text" readOnly value={translated} className={className || "lo-input"} />;
};

const TranslatedUnitOption = ({ unit, disabled, lang }) => {
  const unitStr = `وحدة ${unit.unitNumber || '-'} - ${unit.unitType || 'وحدة'} - دور ${unit.floor ?? '-'} - ${unit.area ?? '-'} م²${unit.status ? ` (${unit.status})` : ''}`;
  const translatedStr = useDynamicTranslation(unitStr, lang);
  return <option value={unit.id} disabled={disabled}>{translatedStr}</option>;
};

// ─── وحدة فارغة ──────────────────────────────────────────────────────────────
const emptyUnit = () => ({
  _key: Date.now() + Math.random(),
  unitId: '', unitLabel: '', roleType: 'Owner', shareType: 'Full', sharePercentage: 100, ownershipStartDate: '', ownershipEndDate: '',
});

// ════════════════════════════════════════════════════════════════
// مودال اختيار العقار
// ════════════════════════════════════════════════════════════════
const PropertySelectModal = ({ show, handleClose, onSelect, lang }) => {
  const [search, setSearch] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState('');
  const [unitsError, setUnitsError] = useState('');
  const requestIdRef = useRef(0);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (!show) return;
    setSearch(''); setError(''); setUnitsError(''); fetchProperties('');
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [show]);

  const fetchProperties = async (q = '') => {
    const currentRequestId = ++requestIdRef.current;
    setLoading(true); setError('');
    try {
      const { data } = await api.get('/properties', { params: q ? { search: q } : undefined });
      if (currentRequestId !== requestIdRef.current) return;
      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;
      setError(err?.message || 'تعذّر تحميل العقارات'); setProperties([]);
    } finally { if (currentRequestId === requestIdRef.current) setLoading(false); }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value; setSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => fetchProperties(value), 350);
  };

  const handlePickProperty = async (prop) => {
    setPicking(true); setUnitsError('');
    try {
      const { data } = await api.get(`/properties/${prop.id}/units`);
      onSelect({ id: prop.id, name: prop.description || prop.name || '', address: prop.address || '', units: Array.isArray(data) ? data : [] });
      handleClose();
    } catch (err) { setUnitsError(err?.message || 'تعذّر تحميل الوحدات'); }
    finally { setPicking(false); }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" dir="rtl">
      <Modal.Header closeButton><Modal.Title>اختيار العقار</Modal.Title></Modal.Header>
      <Modal.Body>
        <InputGroup className="mb-3">
          <Form.Control placeholder="بحث..." value={search} onChange={handleSearchChange} />
        </InputGroup>
        {error && <Alert variant="danger">{error}</Alert>}
        {unitsError && <Alert variant="danger">{unitsError}</Alert>}
        {(loading || picking) && (<div className="text-center py-3"><Spinner animation="border" size="sm" /></div>)}
        {!loading && !picking && (
          <div className="list-group">
            {properties.length === 0 ? (
              <div className="text-center text-muted py-3">لا توجد عقارات مطابقة</div>
            ) : (
              properties.map(prop => (
                <button key={prop.id} type="button" className="list-group-item list-group-item-action" onClick={() => handlePickProperty(prop)}>
                  <div className="d-flex justify-content-between">
                    <div>
                      {/* 4. ترجمة اسم ووصف العقار في المودال */}
                      <div className="fw-bold"><DynText text={prop.description || `عقار #${prop.id}`} lang={lang} /></div>
                      <small><DynText text={prop.address || ''} lang={lang} /></small>
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

// ════════════════════════════════════════════════════════════════
// المكوّن الرئيسي
// ════════════════════════════════════════════════════════════════
const LinkOwner = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage(); // <--- 5. جلب اللغة الحالية

  const [ownerData, setOwnerData] = useState({ personId: '', personName: '', contactPhone: '', address: '', propertyId: '' });
  const [units, setUnits] = useState([emptyUnit()]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [ownerStats, setOwnerStats] = useState({ ownedUnitsCount: 0 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showCitizenModal, setShowCitizenModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);

  useEffect(() => {
    if (!ownerData.personId) { setOwnerStats({ ownedUnitsCount: 0 }); return; }
    let cancelled = false;
    (async () => {
      try {
        const all = await getAssignments(); if (cancelled) return;
        const mine = Array.isArray(all) ? all.filter(a => String(a.personId) === String(ownerData.personId) && a.roleType === 'Owner') : [];
        setOwnerStats({ ownedUnitsCount: mine.length });
        if (mine.length > 0) {
          setOwnerData(prev => ({ ...prev, personName: prev.personName || mine[0].personName || '', contactPhone: prev.contactPhone || mine[0].contactPhone || '', address: prev.address || mine[0].address || '' }));
        }
      } catch (err) { console.warn('Owner stats fetch failed:', err); }
    })();
    return () => { cancelled = true; };
  }, [ownerData.personId]);

  const handleSelectCitizen = useCallback((citizen) => {
    setOwnerData(prev => ({ ...prev, personId: citizen.nationalId || '', personName: citizen.name || '', contactPhone: citizen.phone || '', address: citizen.address || '' }));
    setShowCitizenModal(false);
  }, []);

  const handleSelectProperty = useCallback((prop) => {
    setOwnerData(prev => ({ ...prev, propertyId: String(prop.id || '') }));
    setSelectedProperty({ id: prop.id, name: prop.name || '', address: prop.address || '', units: prop.units || [] });
    setUnits([emptyUnit()]); setShowPropertyModal(false);
  }, []);

  const updateUnit = useCallback((index, field, value) => {
    setUnits(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: field === 'unitId' ? (value === '' ? '' : Number(value)) : value };
      if (field === 'unitId') {
        const found = selectedProperty?.units?.find(u => String(u.id) === String(value));
        next[index].unitLabel = found ? `وحدة ${found.unitNumber || '-'} - دور ${found.floor ?? '-'}` : '';
      }
      return next;
    });
  }, [selectedProperty]);

  const distributeSharesEvenly = () => {
    if (!units.length) return;
    const perUnit = Math.floor(100 / units.length); const remainder = 100 - perUnit * units.length;
    setUnits(prev => prev.map((u, i) => ({ ...u, sharePercentage: i === 0 ? perUnit + remainder : perUnit })));
  };

  const addUnit = () => { setUnits(prev => [...prev, emptyUnit()]); };
  const removeUnit = (index) => { if (units.length === 1) return; setUnits(prev => prev.filter((_, i) => i !== index)); };

  const validateBeforeSubmit = () => {
    const { personId, personName, contactPhone, address, propertyId } = ownerData;
    if (!personId || !personName || !contactPhone || !address || !propertyId) return 'يجب إدخال الرقم القومي، الاسم، الهاتف، العنوان، واختيار العقار أولاً';
    if (!selectedProperty) return 'يجب اختيار عقار أولاً';
    if (Array.isArray(selectedProperty.units) && selectedProperty.units.length > 0) {
      if (units.some(u => !u.unitId || isNaN(Number(u.unitId)) || Number(u.unitId) <= 0)) return 'يجب اختيار الوحدة لكل سطر قبل الربط';
      const unitIds = units.map(u => Number(u.unitId)); if (unitIds.length !== new Set(unitIds).size) return 'لا يمكن تكرار نفس الوحدة في أكثر من سطر';
    }
    if (units.some(u => { const val = Number(u.sharePercentage); return isNaN(val) || val < 0 || val > 100; })) return 'نسبة الحصة لكل وحدة يجب أن تكون بين 0 و 100';
    if (units.some(u => !u.ownershipStartDate)) return 'يجب إدخال تاريخ البداية لكل وحدة';
    if (units.some(u => { if (!u.ownershipEndDate) return false; return new Date(u.ownershipEndDate) < new Date(u.ownershipStartDate); })) return 'تاريخ النهاية يجب أن يكون بعد أو يساوي تاريخ البداية';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setMessage({ text: '', type: '' });
    const validationError = validateBeforeSubmit();
    if (validationError) { setMessage({ text: validationError, type: 'danger' }); return; }
    setLoading(true);
    try {
      const payload = units.map(u => ({ personId: ownerData.personId, personName: ownerData.personName, contactPhone: ownerData.contactPhone, address: ownerData.address, propertyId: Number(ownerData.propertyId), unitId: Number(u.unitId), roleType: u.roleType, shareType: u.shareType, sharePercentage: Number(u.sharePercentage), ownershipStartDate: u.ownershipStartDate, ownershipEndDate: u.ownershipEndDate || null, isActive: true }));
      await createAssignments(payload);
      setMessage({ text: 'تم ربط المالك بالوحدة/الوحدات بنجاح ✔', type: 'success' });
      setTimeout(() => navigate('/data-entry/home'), 1500);
    } catch (err) {
      const backendMsg = err?.errors?.length ? err.errors.join('\n') : err?.message || 'حدث خطأ أثناء الربط';
      setMessage({ text: backendMsg, type: 'danger' }); console.error('Create Assignments Error =>', err);
    } finally { setLoading(false); }
  };

  const totalShare = units.reduce((sum, u) => sum + Number(u.sharePercentage || 0), 0);
  const hasProperty = !!selectedProperty;
  const hasUnits = Array.isArray(selectedProperty?.units) && selectedProperty.units.length > 0;

  return (
    <Container fluid className="mt-4">
      <Row className="justify-content-center">
        <Col md={12} lg={11}>
          <Card className="shadow-sm border-0 border-top border-5 border-primary">
            <Card.Header className="bg-primary text-white py-4">
              <h5 className="mb-0"><i className="fa-solid fa-users-gear me-2"></i> ربط المالك بالعقار</h5>
            </Card.Header>
            <Card.Body>
              {message.text && (<Alert variant={message.type} className="mb-4" onClose={() => setMessage({ text: '', type: '' })} dismissible style={{ whiteSpace: 'pre-line' }}>{message.text}</Alert>)}
              <Form onSubmit={handleSubmit} noValidate>
                
                <h5 className="text-primary fw-bold border-bottom pb-2 mb-4"><i className="fa-solid fa-user me-2" /> بيانات المالك</h5>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="lo-label">الرقم القومي <span className="lo-req">*</span></Form.Label>
                      <InputGroup>
                        <Form.Control type="text" value={ownerData.personId} onChange={e => setOwnerData(prev => ({ ...prev, personId: e.target.value.trim() }))} placeholder="أدخل الرقم القومي أو ابحث..." maxLength={14} className="lo-input" />
                        <Button variant="outline-primary" className="lo-search-btn" onClick={() => setShowCitizenModal(true)} type="button"><i className="fa-solid fa-magnifying-glass" /></Button>
                      </InputGroup>
                      <Form.Text className="lo-hint">
                        {ownerStats.ownedUnitsCount > 0 ? (
                          <span className="lo-hint-warn"><i className="fa-solid fa-circle-info me-1" /> مرتبط بـ {ownerStats.ownedUnitsCount} وحدة حالياً، سيتم إعادة استخدام بياناته</span>
                        ) : 'يمكنك اختيار مالك موجود أو تسجيل مالك جديد'}
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}><Form.Group><Form.Label className="lo-label">اسم المالك <span className="lo-req">*</span></Form.Label><Form.Control type="text" value={ownerData.personName} onChange={e => setOwnerData(prev => ({ ...prev, personName: e.target.value }))} placeholder="أدخل اسم المالك" className="lo-input" /></Form.Group></Col>
                  <Col md={6}><Form.Group><Form.Label className="lo-label">الهاتف <span className="lo-req">*</span></Form.Label><Form.Control type="tel" value={ownerData.contactPhone} onChange={e => setOwnerData(prev => ({ ...prev, contactPhone: e.target.value }))} placeholder="مثال: 01012345678" className="lo-input" /></Form.Group></Col>
                  <Col md={6}><Form.Group><Form.Label className="lo-label">العنوان <span className="lo-req">*</span></Form.Label><Form.Control type="text" value={ownerData.address} onChange={e => setOwnerData(prev => ({ ...prev, address: e.target.value }))} placeholder="أدخل عنوان المالك" className="lo-input" /></Form.Group></Col>
                  
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="lo-label">العقار <span className="lo-req">*</span></Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="lo-input-icon"><i className="fa-solid fa-building" /></InputGroup.Text>
                        {/* 6. ترجمة بيانات العقار المختار في الـ Input */}
                        {selectedProperty ? (
                          <TranslatedInput value={`#${selectedProperty.id} — ${selectedProperty.name || ''} ${selectedProperty.address || ''}`} lang={lang} />
                        ) : (
                          <Form.Control type="text" readOnly placeholder="انقر على بحث لاختيار العقار..." value={ownerData.propertyId} className="lo-input" />
                        )}
                        <Button variant="outline-primary" className="lo-search-btn" onClick={() => setShowPropertyModal(true)} type="button"><i className="fa-solid fa-magnifying-glass" /> بحث</Button>
                      </InputGroup>
                      {hasProperty && (
                        <Form.Text className="lo-hint">
                          {hasUnits ? (
                            <span className="text-success"><i className="fa-solid fa-circle-check me-1" /> تم تحميل {selectedProperty.units.length} وحدة — اختر منها أدناه</span>
                          ) : (
                            <span className="text-warning"><i className="fa-solid fa-triangle-exclamation me-1" /> هذا العقار لا يحتوي على وحدات مسجّلة</span>
                          )}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <div className="lo-section mt-4">
                  <h5 className="text-primary fw-bold border-bottom pb-2 mb-4"><i className="fa-solid fa-layer-group me-2" /> الوحدات والحصص <Badge bg="secondary" className="ms-2">{units.length} وحدة</Badge></h5>
                  
                  <div className="lo-units-header">
                    <span style={{ flex: '2' }}>{hasUnits ? 'الوحدة' : 'الدور / الشقة'}</span>
                    <span style={{ flex: '2' }}>نوع العلاقة</span>
                    <span style={{ flex: '1', textAlign: 'center' }}>الحصة %</span>
                    <span style={{ flex: '2' }}>تاريخ البداية</span>
                    <span style={{ flex: '2' }}>تاريخ النهاية</span>
                    <span style={{ flex: '0 0 40px' }}></span>
                  </div>

                  {units.map((unit, index) => (
                    <div key={unit._key} className="lo-unit-row">
                      <div className="lo-unit-field" style={{ flex: '2' }}>
                        {hasUnits ? (
                          <Form.Select value={unit.unitId} onChange={e => updateUnit(index, 'unitId', e.target.value)} className="lo-input">
                            <option value="">اختر الوحدة...</option>
                            {/* 7. ترجمة نصوص الوحدات المعقدة في الـ Dropdown */}
                            {selectedProperty?.units?.map(u => (
                              <TranslatedUnitOption
                                key={u.id}
                                unit={u}
                                disabled={units.some((otherUnit, otherIndex) => otherIndex !== index && otherUnit.unitId !== '' && Number(otherUnit.unitId) === u.id)}
                                lang={lang}
                              />
                            ))}
                          </Form.Select>
                        ) : (
                          <Form.Control type="text" value={unit.unitLabel} onChange={e => updateUnit(index, 'unitLabel', e.target.value)} placeholder="مثال: دور 3 أو شقة 12" className="lo-input" />
                        )}
                      </div>
                      <div className="lo-unit-field" style={{ flex: '2' }}>
                        <Form.Select value={unit.roleType} onChange={e => updateUnit(index, 'roleType', e.target.value)} className="lo-input">
                          <option value="Owner">مالك</option><option value="Tenant">مستأجر</option>
                        </Form.Select>
                      </div>
                      <div className="lo-unit-field" style={{ flex: '1' }}><Form.Control type="number" min="0" max="100" step="0.01" value={unit.sharePercentage} onChange={e => updateUnit(index, 'sharePercentage', e.target.value)} className="lo-input lo-input-center" /></div>
                      <div className="lo-unit-field" style={{ flex: '2' }}><Form.Control type="date" value={unit.ownershipStartDate} onChange={e => updateUnit(index, 'ownershipStartDate', e.target.value)} className="lo-input" /></div>
                      <div className="lo-unit-field" style={{ flex: '2' }}><Form.Control type="date" value={unit.ownershipEndDate} min={unit.ownershipStartDate || undefined} onChange={e => updateUnit(index, 'ownershipEndDate', e.target.value)} className="lo-input" /></div>
                      <div className="lo-unit-field lo-unit-del" style={{ flex: '0 0 40px' }}>
                        <button type="button" className="lo-del-btn" onClick={() => removeUnit(index)} disabled={units.length === 1} title="حذف هذه الوحدة"><i className="fa-solid fa-trash-can" /></button>
                      </div>
                    </div>
                  ))}

                  <div className="lo-units-footer">
                    <div className="d-flex gap-2">
                      <button type="button" className="lo-add-btn" onClick={addUnit} disabled={hasUnits && units.length >= selectedProperty.units.length}><i className="fa-solid fa-plus" /> إضافة وحدة أخرى</button>
                      {units.length > 1 && (<button type="button" className="lo-add-btn lo-add-btn-secondary" onClick={distributeSharesEvenly}><i className="fa-solid fa-percent" /> توزيع متساوٍ</button>)}
                    </div>
                    <div className="lo-share-total"><span>مجموع الحصص:</span><span className="lo-share-value">{totalShare}%</span></div>
                  </div>
                </div>

                <div className="lo-actions mt-4">
                  <Button variant="secondary" className="lo-btn-cancel" onClick={() => navigate('/data-entry/home')} type="button">إلغاء</Button>
                  <Button variant="success" type="submit" disabled={loading} className="lo-btn-confirm">
                    {loading ? (<><Spinner size="sm" animation="border" className="me-1" /> جارٍ الحفظ...</>) : (<><i className="fa-solid fa-check me-1" /> تأكيد الربط</>)}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* تمرير اللغة للمودال */}
      <SelectCitizenModal show={showCitizenModal} handleClose={() => setShowCitizenModal(false)} onSelect={handleSelectCitizen} />
      <PropertySelectModal show={showPropertyModal} handleClose={() => setShowPropertyModal(false)} onSelect={handleSelectProperty} lang={lang} />
    </Container>
  );
};

export default LinkOwner;