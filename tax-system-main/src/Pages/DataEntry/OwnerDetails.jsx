import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Card, Row, Col, Table,
  Button, Badge, Spinner
} from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext'; // <--- 1. استدعاء اللغة
import { useDynamicTranslation } from '../../utils/useDynamicTranslation'; // <--- 2. استدعاء الأداة

import { getOwnerById, getOwnerUnits, deleteOwner, deleteAssignment } from '../../services/assignmentService';

// ── مكون مساعد لترجمة الداتا ديناميكياً ──
const DynText = ({ text, lang }) => {
  const translated = useDynamicTranslation(text || '', lang);
  return <>{translated || '-'}</>;
};

const OwnerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage(); // <--- 3. جلب اللغة الحالية

  const [owner,        setOwner]        = useState(null);
  const [units,        setUnits]        = useState([]);
  const [loadingOwner, setLoadingOwner] = useState(true);
  const [loadingUnits, setLoadingUnits] = useState(true);

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const data = await getOwnerById(id);
        setOwner(data);
      } catch (e) {
        console.error('فشل تحميل بيانات المالك', e);
      } finally {
        setLoadingOwner(false);
      }
    };

    const fetchUnits = async () => {
      try {
        const data = await getOwnerUnits(id);
        setUnits(data);
      } catch (e) {
        console.error('فشل تحميل الوحدات', e);
      } finally {
        setLoadingUnits(false);
      }
    };

    fetchOwner();
    fetchUnits();
  }, [id]);

  const handleDeleteOwner = async () => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المالك؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    try {
      await deleteOwner(owner.id);
      alert('تم حذف المالك بنجاح');
      navigate(-1);
    } catch (error) {
      console.error(error);
      alert('فشل حذف المالك، حاول مرة أخرى');
    }
  };

  const handleDeleteUnit = async (assignmentId) => {
    if (!window.confirm('هل أنت متأكد من حذف ربط هذه الوحدة بهذا المالك؟')) return;
    try {
      await deleteAssignment(assignmentId);
      setUnits(prev => prev.filter(u => u.assignmentId !== assignmentId));
      alert('تم حذف الربط بنجاح');
    } catch (error) {
      console.error(error);
      alert(error?.message || 'فشل حذف الربط، حاول مرة أخرى');
    }
  };

  if (loadingOwner) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!owner) {
    return (
      <Container className="mt-5 text-center text-muted">
        <i className="fa-solid fa-triangle-exclamation fa-2x mb-3 d-block"></i>
        لم يتم العثور على بيانات المالك
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">

      {/* ── زر الرجوع ── */}
      <Button
        variant="light"
        className="border mb-3 d-flex align-items-center gap-2"
        onClick={() => navigate(-1)}
      >
        <i className="fa-solid fa-arrow-right"></i>
        رجوع
      </Button>

      {/* ── بيانات المالك ── */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-white border-bottom py-3">
          <div className="d-flex align-items-center gap-2">
            <div
              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 42, height: 42 }}
            >
              <i className="fa-solid fa-user text-primary"></i>
            </div>
            <div>
              {/* 4. ترجمة اسم المالك الجاي من الداتا بيز */}
              <h5 className="mb-0 fw-bold"><DynText text={owner.fullName} lang={lang} /></h5>
              <small className="text-muted">بيانات المالك</small>
            </div>
            <div className="ms-auto d-flex gap-2">
              <Button
                variant="light" size="sm" className="text-primary border" title="تعديل بيانات المالك"
                onClick={() => navigate(`/data-entry/edit-owner/${owner.id}`)}
              >
                <i className="fa-solid fa-pen-to-square me-1"></i> تعديل
              </Button>
              <Button variant="light" size="sm" className="text-danger border" title="حذف المالك" onClick={handleDeleteOwner}>
                <i className="fa-solid fa-trash me-1"></i> حذف
              </Button>
            </div>
          </div>
        </Card.Header>

        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <div className="text-muted small mb-1">
                <i className="fa-solid fa-id-card me-1"></i> الرقم القومي
              </div>
              {/* الأرقام لا نترجمها */}
              <div className="fw-semibold font-monospace">{owner.nationalId || '-'}</div>
            </Col>
            <Col md={3}>
              <div className="text-muted small mb-1">
                <i className="fa-solid fa-phone me-1"></i> رقم الهاتف
              </div>
              {/* الأرقام لا نترجمها */}
              <div className="fw-semibold">{owner.phone || '-'}</div>
            </Col>
            <Col md={4}>
              <div className="text-muted small mb-1">
                <i className="fa-solid fa-location-dot me-1"></i> العنوان
              </div>
              {/* 5. ترجمة العنوان لو هو نص عربي جاي من الداتا بيز */}
              <div className="fw-semibold"><DynText text={owner.address} lang={lang} /></div>
            </Col>
            <Col md={2}>
              <div className="text-muted small mb-1">
                <i className="fa-solid fa-tag me-1"></i> نوع المالك
              </div>
              <Badge
                bg={owner.ownerType === 'Legal' ? 'info' : 'light'}
                text={owner.ownerType === 'Legal' ? 'white' : 'dark'}
                className="border"
              >
                {owner.ownerType === 'Legal' ? 'اعتباري' : 'طبيعي'}
              </Badge>
            </Col>
          </Row>
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

      {/* ── جدول الوحدات ── */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          {loadingUnits ? (
            <div className="text-center py-5"><Spinner animation="border" /></div>
          ) : units.length > 0 ? (
            <Table hover responsive className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>كود الوحدة</th>
                  <th>عنوان الوحدة</th>
                  <th>المساحة (م²)</th>
                  <th>تاريخ بداية الملكية</th>
                  <th className="text-end pe-4">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {units.map(unit => (
                  <tr key={unit.assignmentId ?? unit.unitId}>
                    <td className="fw-bold text-primary">{unit.unitNumber || '-'}</td>
                    {/* 6. ترجمة عنوان الوحدة في الجدول */}
                    <td className="text-muted"><DynText text={unit.address} lang={lang} /></td>
                    <td>{unit.area ?? '-'}</td>
                    <td className="small text-muted">
                      {unit.startDate ? new Date(unit.startDate).toLocaleDateString('ar-EG') : '-'}
                    </td>
                    <td className="text-end pe-4">
                      <Button
                        variant="light" size="sm" className="text-danger border"
                        title="حذف الربط"
                        onClick={() => handleDeleteUnit(unit.assignmentId)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-5 text-muted">
              <i className="fa-solid fa-inbox fa-2x mb-3 d-block"></i>
              لا توجد وحدات مرتبطة بهذا المالك
            </div>
          )}
        </Card.Body>
      </Card>

    </Container>
  );
};

export default OwnerDetails;