import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Table,
  Badge,
  Button,
  Container,
  Form,
  Nav,
  Spinner,
  Tab
} from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext'; // <--- 1. استدعاء اللغة
import { useDynamicTranslation } from '../../utils/useDynamicTranslation'; // <--- 2. استدعاء الأداة

import {
  getProperties,
  deleteProperty,
  getPropertiesWithUnits,
  deleteUnit
} from '../../services/propertyService';
import {
  getExemptionsForHome,
  deleteExemption
} from '../../services/exemptionService';
import { getOwners } from '../../services/assignmentService';
import { getAppeals, deleteAppeal } from '../../services/appealService';
<<<<<<< HEAD

// ════════════════════════════════════════════════════════════════
// 3. مكون مساعد صغير لترجمة البيانات اللي جاية من الداتا بيز
// بنستخدمه جوا الجداول عشان نتجنب مشاكل الـ Hooks في الـ map
// ════════════════════════════════════════════════════════════════
const DynText = ({ text, lang }) => {
  const translated = useDynamicTranslation(text || '', lang);
  return <>{translated || '-'}</>;
};
=======
>>>>>>> main

const DataEntryHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang } = useLanguage(); // <--- 4. جلب اللغة الحالية

  // ── الطلبات والعقارات ──
  const [allRequests, setAllRequests] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── العقارات مع الوحدات (للتبويب الجديد) ──
  const [propertiesWithUnits, setPropertiesWithUnits] = useState([]);

  // ── بحث الطلبات المعلقة ──
  const [requestSearch, setRequestSearch] = useState('');
  const [requestSuggestions, setRequestSuggestions] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showReqDropdown, setShowReqDropdown] = useState(false);
  const reqSearchRef = useRef(null);

  // ── بحث الملاك ──
  const [ownerSearch, setOwnerSearch] = useState('');
  const [ownerSuggestions, setOwnerSuggestions] = useState([]);
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const ownerSearchRef = useRef(null);

  // ── بحث الوحدات ──
  const [unitSearch, setUnitSearch] = useState('');
  const [unitSuggestions, setUnitSuggestions] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const unitSearchRef = useRef(null);

  // ── جلب البيانات ──
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const props         = await getProperties();
      const exemptions    = await getExemptionsForHome();
      const propsWithUnits = await getPropertiesWithUnits();

<<<<<<< HEAD
=======
      // ── جلب الطعون ومعالجتها لتتوافق مع شكل الطلبات ──
>>>>>>> main
      let appealsRaw = [];
      try {
        const appealsResult = await getAppeals({ pageNumber: 1, pageSize: 100 });
        appealsRaw = appealsResult?.items ?? appealsResult?.Items ?? appealsResult ?? [];
      } catch (e) {
        console.warn('فشل تحميل الطعون', e);
      }

      const normalizedAppeals = appealsRaw.map(a => ({
        id:             a.id,
        type:           'طعن',
        unitNumber:     a.unitNumber   ?? a.unitCode   ?? '-',
        ownerName:      a.ownerName    ?? '-',
        nationalId:     a.nationalId   ?? '',
        requestDate:    a.appealDate   ?? a.createdAt  ?? null,
        legalReference: a.legalReference ?? '-',
        status:         a.status       ?? 'Pending'
      }));

      const normalizedExemptions = (exemptions || []).map(ex => ({
        ...ex,
        type: 'إعفاء'
      }));

      setProperties(props || []);
      setAllRequests([...normalizedExemptions, ...normalizedAppeals]);
      setPropertiesWithUnits(propsWithUnits || []);
    } catch (e) {
      console.error('فشل تحميل البيانات', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  useEffect(() => {
    const handler = (e) => {
<<<<<<< HEAD
      if (reqSearchRef.current && !reqSearchRef.current.contains(e.target)) setShowReqDropdown(false);
      if (ownerSearchRef.current && !ownerSearchRef.current.contains(e.target)) setShowOwnerDropdown(false);
      if (unitSearchRef.current && !unitSearchRef.current.contains(e.target)) setShowUnitDropdown(false);
=======
      if (reqSearchRef.current && !reqSearchRef.current.contains(e.target))
        setShowReqDropdown(false);
      if (ownerSearchRef.current && !ownerSearchRef.current.contains(e.target))
        setShowOwnerDropdown(false);
      if (unitSearchRef.current && !unitSearchRef.current.contains(e.target))
        setShowUnitDropdown(false);
>>>>>>> main
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

<<<<<<< HEAD
  const getCurrentDate = () => new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
=======
  const getCurrentDate = () =>
    new Date().toLocaleDateString('ar-EG', {
      weekday: 'long',
      year:    'numeric',
      month:   'long',
      day:     'numeric'
    });
>>>>>>> main

  // ════════════════════════════════════════
  // بحث الطلبات المعلقة
  // ════════════════════════════════════════
  const handleRequestSearchChange = (e) => {
    const val = e.target.value;
    setRequestSearch(val);
    setSelectedRequest(null);
    if (!val.trim()) { setRequestSuggestions([]); setShowReqDropdown(false); return; }

    const q = val.toLowerCase();
<<<<<<< HEAD
    const pending = allRequests.filter(r => ['Pending', 'NeedsMoreInfo'].includes(r.status));
    const matched = pending.filter(r => (r.ownerName && r.ownerName.toLowerCase().includes(q)) || (r.nationalId && r.nationalId.toLowerCase().includes(q)));

    const seen = new Set(); const suggestions = [];
    for (const r of matched) {
      const key = r.ownerName || r.nationalId;
      if (!seen.has(key)) { seen.add(key); suggestions.push({ label: r.ownerName || r.nationalId, nationalId: r.nationalId }); }
=======
    const pending = allRequests.filter(r =>
      ['Pending', 'NeedsMoreInfo'].includes(r.status)
    );

    const matched = pending.filter(r =>
      (r.ownerName  && r.ownerName.toLowerCase().includes(q)) ||
      (r.nationalId && r.nationalId.toLowerCase().includes(q))
    );

    const seen = new Set();
    const suggestions = [];
    for (const r of matched) {
      const key = r.ownerName || r.nationalId;
      if (!seen.has(key)) {
        seen.add(key);
        suggestions.push({ label: r.ownerName || r.nationalId, nationalId: r.nationalId });
      }
>>>>>>> main
    }
    setRequestSuggestions(suggestions); setShowReqDropdown(suggestions.length > 0);
  };

  const handleSelectRequestSuggestion = (suggestion) => { setRequestSearch(suggestion.label); setSelectedRequest(suggestion.label); setShowReqDropdown(false); };

  const getPendingRows = () => {
<<<<<<< HEAD
    const pending = allRequests.filter(r => r.status === "PendingCommittee");
    if (selectedRequest) {
      const q = selectedRequest.toLowerCase();
      return pending.filter(r => (r.ownerName && r.ownerName.toLowerCase().includes(q)) || (r.nationalId && r.nationalId.toLowerCase().includes(q)));
    }
    return [...pending].sort((a, b) => b.id - a.id).slice(0, 5);
  };
=======
  const pending = allRequests.filter(
    r => r.status === "PendingCommittee"
  );

  if (selectedRequest) {
    const q = selectedRequest.toLowerCase();

    return pending.filter(r =>
      (r.ownerName && r.ownerName.toLowerCase().includes(q)) ||
      (r.nationalId && r.nationalId.toLowerCase().includes(q))
    );
  }

  return [...pending]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);
};

    
>>>>>>> main

  // ════════════════════════════════════════
  // بحث الملاك
  // ════════════════════════════════════════
  const handleOwnerSearchChange = async (e) => {
    const val = e.target.value; setOwnerSearch(val);
    if (!val.trim()) { setOwnerSuggestions([]); setShowOwnerDropdown(false); return; }
    try {
      const results = await getOwners(val);
      setOwnerSuggestions((results || []).slice(0, 8)); setShowOwnerDropdown((results || []).length > 0);
    } catch { setOwnerSuggestions([]); setShowOwnerDropdown(false); }
  };

  const handleSelectOwner = (owner) => { setShowOwnerDropdown(false); navigate(`/data-entry/owner/${owner.id}`); };

<<<<<<< HEAD
  const getDecidedRows = () => allRequests.filter(r => r.status === "Approved" || r.status === "Rejected");

  const allUnits = propertiesWithUnits.flatMap(property => (property.units || []).map(unit => ({ ...unit, propertyId: property.id, propertyBuildingNo: property.buildingNo, propertyDescription: property.description, currentPropertyNo: property.currentPropertyNo })));
=======
  // ════════════════════════════════════════
  // الأرشيف
  // ════════════════════════════════════════
  const getDecidedRows = () =>
  allRequests.filter(r =>
    r.status === "Approved" ||
    r.status === "Rejected"
  );
  // ════════════════════════════════════════
  // الوحدات من العقارات
  // ════════════════════════════════════════
  const allUnits = propertiesWithUnits.flatMap(property =>
    (property.units || []).map(unit => ({
      ...unit,
      propertyId:          property.id,
      propertyBuildingNo:  property.buildingNo,
      propertyDescription: property.description,
      currentPropertyNo:   property.currentPropertyNo
    }))
  );
>>>>>>> main

  // ════════════════════════════════════════
  // بحث الوحدات بالكود
  // ════════════════════════════════════════
  const handleUnitSearchChange = (e) => {
    const val = e.target.value; setUnitSearch(val); setSelectedUnit(null);
    if (!val.trim()) { setUnitSuggestions([]); setShowUnitDropdown(false); return; }
    const q = val.toLowerCase();
<<<<<<< HEAD
    const matched = allUnits.filter(u => (u.unitNumber || '').toLowerCase().includes(q));
    const seen = new Set(); const suggestions = [];
    for (const u of matched) { const key = `${u.id}-${u.unitNumber}`; if (!seen.has(key)) { seen.add(key); suggestions.push(u); } }
    setUnitSuggestions(suggestions.slice(0, 10)); setShowUnitDropdown(suggestions.length > 0);
=======
    const matched = allUnits.filter(u =>
      (u.unitNumber || '').toLowerCase().includes(q)
    );

    const seen = new Set();
    const suggestions = [];
    for (const u of matched) {
      const key = `${u.id}-${u.unitNumber}`;
      if (!seen.has(key)) {
        seen.add(key);
        suggestions.push(u);
      }
    }

    setUnitSuggestions(suggestions.slice(0, 10));
    setShowUnitDropdown(suggestions.length > 0);
>>>>>>> main
  };

  const handleSelectUnit = (unit) => { setUnitSearch(unit.unitNumber || ''); setSelectedUnit(unit); setShowUnitDropdown(false); };

  const getDisplayedUnits = () => {
    if (selectedUnit) return allUnits.filter(u => u.id === selectedUnit.id);
<<<<<<< HEAD
    if (unitSearch.trim()) { const q = unitSearch.toLowerCase(); return allUnits.filter(u => (u.unitNumber || '').toLowerCase().includes(q)); }
=======
    if (unitSearch.trim()) {
      const q = unitSearch.toLowerCase();
      return allUnits.filter(u => (u.unitNumber || '').toLowerCase().includes(q));
    }
>>>>>>> main
    return allUnits;
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    try {
<<<<<<< HEAD
      const target = allRequests.find(r => r.id === id); if (!target) return;
      if (target.type === 'طعن') await deleteAppeal(id); else if (target.type === 'إعفاء') await deleteExemption(id);
      setAllRequests(prev => prev.filter(r => r.id !== id)); alert('تم حذف الطلب بنجاح');
    } catch (e) { console.error(e); alert('فشل حذف الطلب'); }
=======
      const target = allRequests.find(r => r.id === id);
      if (!target) return;

      if (target.type === 'طعن') {
        await deleteAppeal(id);
      } else if (target.type === 'إعفاء') {
        await deleteExemption(id);
      }

      setAllRequests(prev => prev.filter(r => r.id !== id));
      alert('تم حذف الطلب بنجاح');
    } catch (e) {
      console.error(e);
      alert('فشل حذف الطلب');
    }
>>>>>>> main
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف بيانات هذا العقار؟')) return;
    try { await deleteProperty(id); setProperties(prev => prev.filter(p => p.id !== id)); setPropertiesWithUnits(prev => prev.filter(p => p.id !== id)); alert('تم حذف العقار بنجاح'); }
    catch (e) { console.error(e); alert('فشل حذف العقار'); }
  };

  const handleDeleteUnit = async (unitId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الوحدة؟')) return;
    try {
      await deleteUnit(unitId);
<<<<<<< HEAD
      setPropertiesWithUnits(prev => prev.map(property => ({ ...property, units: (property.units || []).filter(u => u.id !== unitId) })));
      if (selectedUnit?.id === unitId) { setSelectedUnit(null); setUnitSearch(''); }
      setUnitSuggestions(prev => prev.filter(u => u.id !== unitId)); alert('تم حذف الوحدة بنجاح');
    } catch (e) { console.error(e); alert('فشل حذف الوحدة'); }
=======
      setPropertiesWithUnits(prev =>
        prev.map(property => ({
          ...property,
          units: (property.units || []).filter(u => u.id !== unitId)
        }))
      );
      if (selectedUnit?.id === unitId) {
        setSelectedUnit(null);
        setUnitSearch('');
      }
      setUnitSuggestions(prev => prev.filter(u => u.id !== unitId));
      alert('تم حذف الوحدة بنجاح');
    } catch (e) {
      console.error(e);
      alert('فشل حذف الوحدة');
    }
>>>>>>> main
  };

  const handleEditRequest = (req) => { if (req.type === 'طعن') navigate(`/data-entry/edit-appeal/${req.id}`); else if (req.type === 'إعفاء') navigate(`/data-entry/edit-exemption/${req.id}`); };
  const handleEditProperty = (id) => { navigate(`/data-entry/edit-property/${id}`); };

  const getStatusBadge = (status) => {
<<<<<<< HEAD
    switch (status) {
      case "PendingCommittee": return <Badge bg="warning" text="dark">في انتظار اللجنة</Badge>;
      case "PendingManager": return <Badge bg="info">في انتظار المدير</Badge>;
      case "Approved": return <Badge bg="success">مقبول</Badge>;
      case "Rejected": return <Badge bg="danger">مرفوض</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };
=======
  switch (status) {
    case "PendingCommittee":
      return (
        <Badge bg="warning" text="dark">
          في انتظار اللجنة
        </Badge>
      );

    case "PendingManager":
      return (
        <Badge bg="info">
          في انتظار المدير
        </Badge>
      );

    case "Approved":
      return (
        <Badge bg="success">
          مقبول
        </Badge>
      );

    case "Rejected":
      return (
        <Badge bg="danger">
          مرفوض
        </Badge>
      );

    default:
      return (
        <Badge bg="secondary">
          {status}
        </Badge>
      );
  }
};
>>>>>>> main

  const getTypeBadge = (type) => type === 'طعن' ? (<Badge bg="primary" className="rounded-pill"><i className="fa-solid fa-gavel me-1"></i> طعن</Badge>) : (<Badge bg="secondary" className="rounded-pill"><i className="fa-solid fa-shield-halved me-1"></i> إعفاء</Badge>);

  const getUnitStatusBadge = (status) => {
    switch (status) {
      case 'Available': return <Badge bg="success">متوفر</Badge>;
      case 'Occupied':  return <Badge bg="secondary">مشغول</Badge>;
      default:          return <Badge bg="light" text="dark">{status || '-'}</Badge>;
    }
  };

  const getUsageLabel = (usageType) => {
    switch (usageType) {
      case 'Residential': return 'سكني';
      case 'Commercial':  return 'تجاري';
      default:            return usageType || '-';
    }
  };

  return (
    <Container fluid className="mt-4">
      <Row className="mb-3 justify-content-end">
        <Col xs="auto">
          <div className="bg-light p-2 rounded border border-light d-flex align-items-center gap-2 px-3">
            <i className="fa-regular fa-calendar-days text-primary fs-5"></i>
            <span className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>{getCurrentDate()}</span>
          </div>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col md={3}><Link to="/data-entry/add" className="text-decoration-none"><Card className="h-100 shadow-sm border-0 border-top border-4 border-primary hover-lift"><Card.Body className="d-flex align-items-center p-3"><div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-building text-primary fs-4"></i></div><div><h6 className="fw-bold mb-0 text-dark">إضافة عقار جديد</h6><small className="text-muted">تسجيل عقار + ربط المالك تلقائياً</small></div></Card.Body></Card></Link></Col>
        <Col md={3}><Link to="/data-entry/link" className="text-decoration-none"><Card className="h-100 shadow-sm border-0 border-top border-4 border-info"><Card.Body className="d-flex align-items-center p-3"><div className="bg-info bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-user-plus text-info fs-4"></i></div><div><h6 className="fw-bold mb-0 text-dark">ربط مالك إضافي</h6><small className="text-muted">إضافة شريك ملكية أو تحديث المالك</small></div></Card.Body></Card></Link></Col>
        <Col md={3}><Link to="/data-entry/appeal" className="text-decoration-none"><Card className="h-100 shadow-sm border-0 border-top border-4 border-warning"><Card.Body className="d-flex align-items-center p-3"><div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-gavel text-warning fs-4"></i></div><div><h6 className="fw-bold mb-0 text-dark">تقديم طعن ضريبي</h6><small className="text-muted">اعتراض على القيمة أو تقدير الضرائب</small></div></Card.Body></Card></Link></Col>
        <Col md={3}><Link to="/data-entry/exemption" className="text-decoration-none"><Card className="h-100 shadow-sm border-0 border-top border-4 border-secondary"><Card.Body className="d-flex align-items-center p-3"><div className="bg-secondary bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-shield-halved text-secondary fs-4"></i></div><div><h6 className="fw-bold mb-0 text-dark">طلب إعفاء ضريبي</h6><small className="text-muted">وحدات سكنية أساسية / ذوي إعاقة</small></div></Card.Body></Card></Link></Col>
      </Row>

      <Card className="shadow-sm border-0"><Card.Body>
        <Tab.Container id="main-tabs" defaultActiveKey="pending">
          <Nav variant="pills" className="bg-light rounded p-1 mb-3">
            <Nav.Item><Nav.Link eventKey="pending" className="rounded-pill px-4">الطلبات المعلقة (تحتاج متابعة)</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="decided" className="rounded-pill px-4">القرارات الصادرة (الأرشيف)</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="owners" className="rounded-pill px-4"><i className="fa-solid fa-users me-1"></i> الملاك المسجلون</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="properties" className="rounded-pill px-4"><i className="fa-solid fa-building-circle-check me-1"></i> العقارات والوحدات</Nav.Link></Nav.Item>
          </Nav>

<<<<<<< HEAD
          <Tab.Content>
            {/* تاب الطلبات المعلقة */}
            <Tab.Pane eventKey="pending">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small"><i className="fa-solid fa-circle-info me-1"></i> يُعرض آخر 5 طلبات — ابحث بالاسم أو الرقم القومي لعرض المزيد</span>
                <div ref={reqSearchRef} style={{ width: '300px', position: 'relative' }}>
                  <Form.Control type="text" placeholder="بحث باسم المالك أو الرقم القومي..." size="sm" value={requestSearch} onChange={handleRequestSearchChange} onFocus={() => requestSuggestions.length > 0 && setShowReqDropdown(true)} />
                  {showReqDropdown && (<div className="border rounded bg-white shadow-sm" style={{ position: 'absolute', top: '100%', right: 0, left: 0, zIndex: 1050, maxHeight: '220px', overflowY: 'auto' }}>{requestSuggestions.map((s, i) => (<div key={i} className="px-3 py-2 d-flex align-items-center gap-2" style={{ cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget.style.background = '#f0f4ff')} onMouseLeave={e => (e.currentTarget.style.background = '')} onMouseDown={() => handleSelectRequestSuggestion(s)}><i className="fa-solid fa-user text-primary small"></i><span style={{ fontSize: '0.9rem' }}>{s.label}</span>{s.nationalId && (<span className="text-muted font-monospace ms-auto" style={{ fontSize: '0.78rem' }}>{s.nationalId}</span>)}</div>))}</div>)}
                </div>
              </div>
              <Table hover responsive className="align-middle"><thead className="table-light"><tr><th>النوع</th><th>كود / رقم الوحدة</th><th>اسم المالك</th><th>تاريخ الطلب</th><th>السند القانوني</th><th>الحالة</th><th className="text-end pe-4">إجراءات</th></tr></thead>
                <tbody>
                  {loading ? (<tr><td colSpan="7" className="text-center py-5"><Spinner animation="border" /></td></tr>) : getPendingRows().length > 0 ? (
                    getPendingRows().map(req => (
                      <tr key={`${req.type}-${req.id}`}>
                        <td>{getTypeBadge(req.type)}</td>
                        <td>{req.unitNumber || '-'}</td>
                        {/* 5. ترجمة اسم المالك من الداتا بيز */}
                        <td className="fw-medium"><DynText text={req.ownerName} lang={lang} /></td>
                        <td className="small">{req.requestDate ? new Date(req.requestDate).toLocaleDateString('ar-EG') : '-'}</td>
                        {/* 6. ترجمة السند القانوني لو مكتوب عربي */}
                        <td><DynText text={req.legalReference} lang={lang} /></td>
                        <td>{getStatusBadge(req.status)}</td>
                        <td className="text-end pe-4"><div className="d-flex justify-content-end gap-1"><Button variant="light" size="sm" className="text-primary border" onClick={() => handleEditRequest(req)}><i className="fa-solid fa-pen-to-square"></i></Button><Button variant="light" size="sm" className="text-danger border" onClick={() => handleDeleteRequest(req.id)}><i className="fa-solid fa-trash"></i></Button></div></td>
                      </tr>
                    ))
                  ) : (<tr><td colSpan="7" className="text-center py-4 text-muted">{requestSearch ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد طلبات معلقة حالياً'}</td></tr>)}
                </tbody>
              </Table>
            </Tab.Pane>

            {/* تاب الأرشيف */}
            <Tab.Pane eventKey="decided">
              <Table hover responsive className="align-middle"><thead className="table-light"><tr><th>النوع</th><th>الرقم القومي</th><th>اسم المالك</th><th>تاريخ الطلب</th><th>السند القانوني</th><th>الحالة النهائية</th></tr></thead>
                <tbody>
                  {loading ? (<tr><td colSpan="6" className="text-center py-5"><Spinner animation="border" /></td></tr>) : getDecidedRows().length > 0 ? (
                    getDecidedRows().map(req => (
                      <tr key={`${req.type}-${req.id}`}>
                        <td>{getTypeBadge(req.type)}</td>
                        <td>{req.nationalId || '-'}</td>
                        <td><DynText text={req.ownerName} lang={lang} /></td>
                        <td className="small">{req.requestDate ? new Date(req.requestDate).toLocaleDateString('ar-EG') : '-'}</td>
                        <td><DynText text={req.legalReference} lang={lang} /></td>
                        <td>{getStatusBadge(req.status)}</td>
=======
            <Nav variant="pills" className="bg-light rounded p-1 mb-3">
              <Nav.Item>
                <Nav.Link eventKey="pending" className="rounded-pill px-4">
                  الطلبات المعلقة (تحتاج متابعة)
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="decided" className="rounded-pill px-4">
                  القرارات الصادرة (الأرشيف)
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="owners" className="rounded-pill px-4">
                  <i className="fa-solid fa-users me-1"></i> الملاك المسجلون
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="properties" className="rounded-pill px-4">
                  <i className="fa-solid fa-building-circle-check me-1"></i>
                  العقارات والوحدات
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>

              {/* ══════════════════════════════
                  تاب الطلبات المعلقة
              ══════════════════════════════ */}
              <Tab.Pane eventKey="pending">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted small">
                    <i className="fa-solid fa-circle-info me-1"></i>
                    يُعرض آخر 5 طلبات — ابحث بالاسم أو الرقم القومي لعرض المزيد
                  </span>

                  <div ref={reqSearchRef} style={{ width: '300px', position: 'relative' }}>
                    <Form.Control
                      type="text"
                      placeholder="بحث باسم المالك أو الرقم القومي..."
                      size="sm"
                      value={requestSearch}
                      onChange={handleRequestSearchChange}
                      onFocus={() =>
                        requestSuggestions.length > 0 && setShowReqDropdown(true)
                      }
                    />

                    {showReqDropdown && (
                      <div
                        className="border rounded bg-white shadow-sm"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          left: 0,
                          zIndex: 1050,
                          maxHeight: '220px',
                          overflowY: 'auto'
                        }}
                      >
                        {requestSuggestions.map((s, i) => (
                          <div
                            key={i}
                            className="px-3 py-2 d-flex align-items-center gap-2"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f0f4ff')}
                            onMouseLeave={e => (e.currentTarget.style.background = '')}
                            onMouseDown={() => handleSelectRequestSuggestion(s)}
                          >
                            <i className="fa-solid fa-user text-primary small"></i>
                            <span style={{ fontSize: '0.9rem' }}>{s.label}</span>
                            {s.nationalId && (
                              <span className="text-muted font-monospace ms-auto" style={{ fontSize: '0.78rem' }}>
                                {s.nationalId}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Table hover responsive className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>النوع</th>
                      <th>كود / رقم الوحدة</th>
                      <th>اسم المالك</th>
                      <th>تاريخ الطلب</th>
                      <th>السند القانوني</th>
                      <th>الحالة</th>
                      <th className="text-end pe-4">إجراءات</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5">
                          <Spinner animation="border" />
                        </td>
                      </tr>
                    ) : getPendingRows().length > 0 ? (
                      getPendingRows().map(req => (
                        <tr key={`${req.type}-${req.id}`}>
                          <td>{getTypeBadge(req.type)}</td>
                          <td>{req.unitNumber || 'YYY-8888'}</td>
                          <td className="fw-medium">{req.ownerName || '-'}</td>
                          <td className="small">
                            {req.requestDate
                              ? new Date(req.requestDate).toLocaleDateString('ar-EG')
                              : '-'}
                          </td>
                          <td>{req.legalReference || '-'}</td>
                          <td>{getStatusBadge(req.status)}</td>
                          <td className="text-end pe-4">
                            <div className="d-flex justify-content-end gap-1">
                              <Button
                                variant="light"
                                size="sm"
                                className="text-primary border"
                                onClick={() => handleEditRequest(req)}
                              >
                                <i className="fa-solid fa-pen-to-square"></i>
                              </Button>
                              <Button
                                variant="light"
                                size="sm"
                                className="text-danger border"
                                onClick={() => handleDeleteRequest(req.id)}
                              >
                                <i className="fa-solid fa-trash"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4 text-muted">
                          {requestSearch
                            ? 'لا توجد نتائج مطابقة للبحث'
                            : 'لا توجد طلبات معلقة حالياً'}
                        </td>
>>>>>>> main
                      </tr>
                    ))
                  ) : (<tr><td colSpan="6" className="text-center py-4 text-muted">لا توجد قرارات صادرة حالياً</td></tr>)}
                </tbody>
              </Table>
            </Tab.Pane>

<<<<<<< HEAD
            {/* تاب الملاك المسجلون */}
            <Tab.Pane eventKey="owners">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small"><i className="fa-solid fa-circle-info me-1"></i> ابحث باسم المالك أو رقمه القومي ثم اختره للاطلاع على وحداته</span>
                <div ref={ownerSearchRef} style={{ width: '300px', position: 'relative' }}>
                  <Form.Control type="text" placeholder="بحث باسم المالك أو الرقم القومي..." size="sm" value={ownerSearch} onChange={handleOwnerSearchChange} onFocus={() => ownerSuggestions.length > 0 && setShowOwnerDropdown(true)} />
                  {showOwnerDropdown && (<div className="border rounded bg-white shadow-sm" style={{ position: 'absolute', top: '100%', right: 0, left: 0, zIndex: 1050, maxHeight: '260px', overflowY: 'auto' }}>{ownerSuggestions.map(owner => (<div key={owner.id} className="px-3 py-2 d-flex align-items-center gap-2" style={{ cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget.style.background = '#f0f4ff')} onMouseLeave={e => (e.currentTarget.style.background = '')} onMouseDown={() => handleSelectOwner(owner)}><div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 30, height: 30 }}><i className="fa-solid fa-user text-primary" style={{ fontSize: '0.75rem' }}></i></div><div className="flex-grow-1 overflow-hidden"><div className="fw-semibold text-truncate" style={{ fontSize: '0.88rem' }}><DynText text={owner.fullName} lang={lang} /></div><div className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>{owner.nationalId}</div></div><i className="fa-solid fa-arrow-left text-muted small"></i></div>))}</div>)}
=======
              {/* ══════════════════════════════
                  تاب الأرشيف
              ══════════════════════════════ */}
              <Tab.Pane eventKey="decided">
                <Table hover responsive className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>النوع</th>
                      <th>الرقم القومي</th>
                      <th>اسم المالك</th>
                      <th>تاريخ الطلب</th>
                      <th>السند القانوني</th>
                      <th>الحالة النهائية</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-5">
                          <Spinner animation="border" />
                        </td>
                      </tr>
                    ) : getDecidedRows().length > 0 ? (
                      getDecidedRows().map(req => (
                        <tr key={`${req.type}-${req.id}`}>
                          <td>{getTypeBadge(req.type)}</td>
                          <td>{req.nationalId || '-'}</td>
                          <td>{req.ownerName || '-'}</td>
                          <td className="small">
                            {req.requestDate
                              ? new Date(req.requestDate).toLocaleDateString('ar-EG')
                              : '-'}
                          </td>
                          <td>{req.legalReference || '-'}</td>
                          <td>{getStatusBadge(req.status)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                          لا توجد قرارات صادرة حالياً
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Tab.Pane>

              {/* ══════════════════════════════
                  تاب الملاك المسجلون
              ══════════════════════════════ */}
              <Tab.Pane eventKey="owners">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted small">
                    <i className="fa-solid fa-circle-info me-1"></i>
                    ابحث باسم المالك أو رقمه القومي ثم اختره للاطلاع على وحداته
                  </span>

                  <div ref={ownerSearchRef} style={{ width: '300px', position: 'relative' }}>
                    <Form.Control
                      type="text"
                      placeholder="بحث باسم المالك أو الرقم القومي..."
                      size="sm"
                      value={ownerSearch}
                      onChange={handleOwnerSearchChange}
                      onFocus={() =>
                        ownerSuggestions.length > 0 && setShowOwnerDropdown(true)
                      }
                    />

                    {showOwnerDropdown && (
                      <div
                        className="border rounded bg-white shadow-sm"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          left: 0,
                          zIndex: 1050,
                          maxHeight: '260px',
                          overflowY: 'auto'
                        }}
                      >
                        {ownerSuggestions.map(owner => (
                          <div
                            key={owner.id}
                            className="px-3 py-2 d-flex align-items-center gap-2"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f0f4ff')}
                            onMouseLeave={e => (e.currentTarget.style.background = '')}
                            onMouseDown={() => handleSelectOwner(owner)}
                          >
                            <div
                              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ width: 30, height: 30 }}
                            >
                              <i className="fa-solid fa-user text-primary" style={{ fontSize: '0.75rem' }}></i>
                            </div>
                            <div className="flex-grow-1 overflow-hidden">
                              <div className="fw-semibold text-truncate" style={{ fontSize: '0.88rem' }}>
                                {owner.fullName}
                              </div>
                              <div className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                                {owner.nationalId}
                              </div>
                            </div>
                            <i className="fa-solid fa-arrow-left text-muted small"></i>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
>>>>>>> main
                </div>
              </div>
              <div className="text-center py-5 text-muted"><i className="fa-solid fa-magnifying-glass fa-2x mb-3 d-block text-primary opacity-50"></i><p className="mb-1 fw-semibold">ابدأ بكتابة اسم المالك في خانة البحث</p><small>سيظهر لك اقتراحات، اختر المالك للانتقال إلى صفحة وحداته</small></div>
            </Tab.Pane>

<<<<<<< HEAD
            {/* تاب العقارات والوحدات */}
            <Tab.Pane eventKey="properties">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small"><i className="fa-solid fa-circle-info me-1"></i> ابحث بكود الوحدة لعرض بياناتها أو اترك البحث فارغاً لعرض كل الوحدات</span>
                <div ref={unitSearchRef} style={{ width: '320px', position: 'relative' }}>
                  <Form.Control type="text" placeholder="بحث بكود / رقم الوحدة..." size="sm" value={unitSearch} onChange={handleUnitSearchChange} onFocus={() => unitSuggestions.length > 0 && setShowUnitDropdown(true)} />
                  {showUnitDropdown && (<div className="border rounded bg-white shadow-sm" style={{ position: 'absolute', top: '100%', right: 0, left: 0, zIndex: 1050, maxHeight: '260px', overflowY: 'auto' }}>{unitSuggestions.map(unit => (<div key={unit.id} className="px-3 py-2 d-flex align-items-center gap-2" style={{ cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget.style.background = '#f0f4ff')} onMouseLeave={e => (e.currentTarget.style.background = '')} onMouseDown={() => handleSelectUnit(unit)}><div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 30, height: 30 }}><i className="fa-solid fa-house text-success" style={{ fontSize: '0.75rem' }}></i></div><div className="flex-grow-1 overflow-hidden"><div className="fw-semibold text-truncate" style={{ fontSize: '0.88rem' }}>الوحدة: {unit.unitNumber || '-'}</div><div className="text-muted small text-truncate">العقار #{unit.propertyId} — الدور {unit.floor}</div></div><i className="fa-solid fa-arrow-left text-muted small"></i></div>))}</div>)}
                </div>
              </div>
              <Table hover responsive className="align-middle"><thead className="table-light"><tr><th>رقم العقار</th><th>رقم المبنى</th><th>كود الوحدة</th><th>نوع الوحدة</th><th>الدور</th><th>المساحة</th><th>الاستخدام</th><th>التشطيب</th><th>الحالة</th><th className="text-end pe-4">إجراءات</th></tr></thead>
                <tbody>
                  {loading ? (<tr><td colSpan="10" className="text-center py-5"><Spinner animation="border" /></td></tr>) : getDisplayedUnits().length > 0 ? (
                    getDisplayedUnits().map(unit => (
                      <tr key={unit.id}>
                        <td className="fw-bold text-primary">{unit.propertyId}</td>
                        <td>{unit.propertyBuildingNo || '-'}</td>
                        <td className="fw-semibold">{unit.unitNumber || '-'}</td>
                        {/* 7. ترجمة نوع الوحدة لو هو نص عربي مدخل من الداتا بيز */}
                        <td><DynText text={unit.unitType} lang={lang} /></td>
                        <td>{unit.floor ?? '-'}</td>
                        <td>{unit.area ?? '-'}</td>
                        <td>{getUsageLabel(unit.usageType)}</td>
                        {/* 8. ترجمة نوع التشطيب لو هو نص عربي مدخل من الداتا بيز */}
                        <td><DynText text={unit.finishingType} lang={lang} /></td>
                        <td>{getUnitStatusBadge(unit.status)}</td>
                        <td className="text-end pe-4"><Button variant="light" size="sm" className="text-danger border" onClick={() => handleDeleteUnit(unit.id)}><i className="fa-solid fa-trash"></i></Button></td>
                      </tr>
                    ))
                  ) : (<tr><td colSpan="10" className="text-center py-4 text-muted">{unitSearch ? 'لا توجد وحدة مطابقة لكود البحث' : 'لا توجد وحدات مسجلة حالياً'}</td></tr>)}
                </tbody>
              </Table>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Card.Body></Card>
=======
                <div className="text-center py-5 text-muted">
                  <i className="fa-solid fa-magnifying-glass fa-2x mb-3 d-block text-primary opacity-50"></i>
                  <p className="mb-1 fw-semibold">ابدأ بكتابة اسم المالك في خانة البحث</p>
                  <small>سيظهر لك اقتراحات، اختر المالك للانتقال إلى صفحة وحداته</small>
                </div>
              </Tab.Pane>

              {/* ══════════════════════════════
                  تاب العقارات والوحدات
              ══════════════════════════════ */}
              <Tab.Pane eventKey="properties">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted small">
                    <i className="fa-solid fa-circle-info me-1"></i>
                    ابحث بكود الوحدة لعرض بياناتها أو اترك البحث فارغاً لعرض كل الوحدات
                  </span>

                  <div ref={unitSearchRef} style={{ width: '320px', position: 'relative' }}>
                    <Form.Control
                      type="text"
                      placeholder="بحث بكود / رقم الوحدة..."
                      size="sm"
                      value={unitSearch}
                      onChange={handleUnitSearchChange}
                      onFocus={() =>
                        unitSuggestions.length > 0 && setShowUnitDropdown(true)
                      }
                    />

                    {showUnitDropdown && (
                      <div
                        className="border rounded bg-white shadow-sm"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          left: 0,
                          zIndex: 1050,
                          maxHeight: '260px',
                          overflowY: 'auto'
                        }}
                      >
                        {unitSuggestions.map(unit => (
                          <div
                            key={unit.id}
                            className="px-3 py-2 d-flex align-items-center gap-2"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f0f4ff')}
                            onMouseLeave={e => (e.currentTarget.style.background = '')}
                            onMouseDown={() => handleSelectUnit(unit)}
                          >
                            <div
                              className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ width: 30, height: 30 }}
                            >
                              <i className="fa-solid fa-house text-success" style={{ fontSize: '0.75rem' }}></i>
                            </div>
                            <div className="flex-grow-1 overflow-hidden">
                              <div className="fw-semibold text-truncate" style={{ fontSize: '0.88rem' }}>
                                الوحدة: {unit.unitNumber || '-'}
                              </div>
                              <div className="text-muted small text-truncate">
                                العقار #{unit.propertyId} — الدور {unit.floor}
                              </div>
                            </div>
                            <i className="fa-solid fa-arrow-left text-muted small"></i>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Table hover responsive className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>رقم العقار</th>
                      <th>كود الوحدة</th>
                      <th>نوع الوحدة</th>
                      <th>الدور</th>
                      <th>المساحة</th>
                      <th>الاستخدام</th>
                      <th>التشطيب</th>
                      <th>الحالة</th>
                      <th className="text-end pe-4">إجراءات</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="10" className="text-center py-5">
                          <Spinner animation="border" />
                        </td>
                      </tr>
                    ) : getDisplayedUnits().length > 0 ? (
                      getDisplayedUnits().map(unit => (
                        <tr key={unit.id}>
                          <td className="fw-bold text-primary">{unit.propertyId}</td>
                          <td className="fw-semibold">{unit.unitNumber || '-'}</td>
                          <td>{unit.unitType || '-'}</td>
                          <td>{unit.floor ?? '-'}</td>
                          <td>{unit.area ?? '-'}</td>
                          <td>{getUsageLabel(unit.usageType)}</td>
                          <td>{unit.finishingType || '-'}</td>
                          <td>{getUnitStatusBadge(unit.status)}</td>
                          <td className="text-end pe-4">
                            <Button
                              variant="light"
                              size="sm"
                              className="text-danger border"
                              onClick={() => handleDeleteUnit(unit.id)}
                            >
                              <i className="fa-solid fa-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className="text-center py-4 text-muted">
                          {unitSearch
                            ? 'لا توجد وحدة مطابقة لكود البحث'
                            : 'لا توجد وحدات مسجلة حالياً'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Tab.Pane>

            </Tab.Content>
          </Tab.Container>
        </Card.Body>
      </Card>
>>>>>>> main
    </Container>
  );
};

export default DataEntryHome;