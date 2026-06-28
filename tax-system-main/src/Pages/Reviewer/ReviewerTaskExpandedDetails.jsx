import React from "react";
import { Badge, Col, Row, Table } from "react-bootstrap";
import { useLanguage } from "../../context/LanguageContext"; 
import { useDynamicTranslation } from "../../utils/useDynamicTranslation"; 

// ── مكون مساعد لترجمة الداتا الديناميكياً ──
const DynText = ({ text, lang }) => {
  const translated = useDynamicTranslation(text || '', lang);
  return <>{translated || '-'}</>;
};

/** حقل معلوماتي صغير: عنوان + قيمة */
const InfoField = ({ label, children }) => (
  <div>
    <div className="text-muted mb-1" style={{ fontSize: "0.72rem", letterSpacing: "0.02em" }}>
      {label}
    </div>
    <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>
      {children ?? "-"}
    </div>
  </div>
);

const getPersonName = (p) => p?.fullName || p?.ownerName || p?.name || "-";

const ReviewerTaskExpandedDetails = ({ details }) => {
  const { lang } = useLanguage(); 

  if (!details) return null;

  const owners  = Array.isArray(details.owners)  ? details.owners  : [];
  const tenants = Array.isArray(details.tenants) ? details.tenants : [];

  const isApproved = String(details.taxStatus) === "Approved";

  return (
    <div className="px-3 py-3" style={{ background: "#f8f9fb", borderTop: "2px solid #e9ecef" }}>

      {/* ──────── بيانات الوحدة ──────── */}
      <div className="mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
        <i className="fa-solid fa-house text-primary" />
        <span className="fw-bold text-primary small">بيانات الوحدة</span>
      </div>

      <Row className="g-3 mb-4">
        <Col xs={6} sm={3}>
          <InfoField label="رقم الوحدة">{details.unitNumber}</InfoField>
        </Col>
        <Col xs={6} sm={3}>
          <InfoField label="نوع الوحدة">
            {/* ★ داتا ديناميكية */}
            <DynText text={details.unitType} lang={lang} />
          </InfoField>
        </Col>
        <Col xs={6} sm={3}>
          <InfoField label="الدور">{details.floor}</InfoField>
        </Col>
        <Col xs={6} sm={3}>
          <InfoField label="المساحة">
            {details.area != null ? `${details.area} م²` : null}
          </InfoField>
        </Col>
        <Col xs={12} sm={6}>
          <InfoField label="العنوان">
            {/* ★ داتا ديناميكية */}
            <DynText text={details.propertyAddress} lang={lang} />
          </InfoField>
        </Col>
        <Col xs={6} sm={3}>
          <InfoField label="الاستخدام">
            <Badge bg="secondary" className="fw-normal">
              {/* ★ داتا ديناميكية */}
              <DynText text={details.usage} lang={lang} />
            </Badge>
          </InfoField>
        </Col>
        <Col xs={6} sm={3}>
          <InfoField label="الحالة">
            {isApproved
              ? <Badge bg="success">معتمد</Badge>
              : <Badge bg="warning" text="dark">بانتظار الحساب</Badge>
            }
          </InfoField>
        </Col>
      </Row>

      {/* ──────── الملاك / المستأجرون ──────── */}
      <Row className="g-4">
        <Col lg={6}>
          <div className="mb-2 d-flex align-items-center gap-2">
            <i className="fa-solid fa-users text-primary small" />
            <span className="fw-semibold small text-primary">الملاك</span>
          </div>
          {owners.length === 0 ? (
            <p className="text-muted small mb-0">لا يوجد ملاك مسجلون</p>
          ) : (
            <Table size="sm" bordered responsive className="mb-0 bg-white align-middle">
              <thead className="table-light">
                <tr>
                  <th>الاسم</th>
                  <th>نسبة الملكية</th>
                </tr>
              </thead>
              <tbody>
                {owners.map((o, i) => (
                  <tr key={`${o.ownerId ?? "o"}-${i}`}>
                    <td className="fw-semibold">
                      {/* ★ داتا ديناميكية (اسم المالك) */}
                      <DynText text={getPersonName(o)} lang={lang} />
                    </td>
                    <td>{o.sharePercentage != null ? `${o.sharePercentage}%` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>

        <Col lg={6}>
          <div className="mb-2 d-flex align-items-center gap-2">
            <i className="fa-solid fa-user-check text-success small" />
            <span className="fw-semibold small text-success">المستأجرون</span>
          </div>
          {tenants.length === 0 ? (
            <p className="text-muted small mb-0">لا يوجد مستأجرون مسجلون</p>
          ) : (
            <Table size="sm" bordered responsive className="mb-0 bg-white align-middle">
              <thead className="table-light">
                <tr>
                  <th>الاسم</th>
                  <th>نوع العلاقة</th>
                  <th>طريقة العلاقة</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t, i) => (
                  <tr key={`${t.ownerId ?? "t"}-${i}`}>
                    <td className="fw-semibold">
                      {/* ★ داتا ديناميكية (اسم المستأجر) */}
                      <DynText text={getPersonName(t)} lang={lang} />
                    </td>
                    <td className="text-muted small">
                      {/* ★ داتا ديناميكية */}
                      <DynText text={t.roleType} lang={lang} />
                    </td>
                    <td className="text-muted small">
                      {/* ★ داتا ديناميكية */}
                      <DynText text={t.shareType} lang={lang} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ReviewerTaskExpandedDetails;