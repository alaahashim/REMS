// src/pages/Reviewer/Home.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert, Badge, Button, Card, Col, Container,
  Form, InputGroup, Row, Spinner, Table,
} from "react-bootstrap";

import {
  getReviewerTaskDetails,
  getReviewerTaxTasks,
} from "../../services/taxService";
import PaginationBar from "./PaginationBar";
import ReviewerTaskExpandedDetails from "./ReviewerTaskExpandedDetails";

const PAGE_SIZE = 10;

const STATUS_TABS = [
  {
    key: "pending",
    label: "بانتظار الحساب",
    apiValue: "PendingCalculation",
    variant: "warning",
    icon: "fa-clock",
  },
  {
    key: "approved",
    label: "معتمدة",
    apiValue: "Approved",
    variant: "success",
    icon: "fa-circle-check",
  },
];

/* ──────────────────────────────────────────
   مكوّن صغير: بادج الحالة الضريبية
────────────────────────────────────────── */
const TaxStatusBadge = ({ status }) =>
  String(status) === "Approved" ? (
    <Badge bg="success">معتمد</Badge>
  ) : (
    <Badge bg="warning" text="dark">بانتظار الحساب</Badge>
  );

/* ══════════════════════════════════════════
   الصفحة الرئيسية للمراجع
══════════════════════════════════════════ */
const ReviewerHome = () => {
  const navigate = useNavigate();

  const [activeTab,        setActiveTab]        = useState("pending");
  const [loading,          setLoading]          = useState(true);
  const [errorMsg,         setErrorMsg]         = useState("");
  const [pageNumber,       setPageNumber]       = useState(1);
  const [searchInput,      setSearchInput]      = useState("");
  const [ownerSearch,      setOwnerSearch]      = useState("");
  const [expandedUnitId,   setExpandedUnitId]   = useState(null);
  const [detailsLoadingId, setDetailsLoadingId] = useState(null);
  const [detailsMap,       setDetailsMap]       = useState({});
  const [pagedResult,      setPagedResult]      = useState({
    items: [], pageNumber: 1, pageSize: PAGE_SIZE, totalCount: 0, totalPages: 1,
  });

  const activeStatus = useMemo(
    () => STATUS_TABS.find((x) => x.key === activeTab)?.apiValue ?? "PendingCalculation",
    [activeTab],
  );

  /* ── جلب البيانات ── */
  const loadTasks = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const result = await getReviewerTaxTasks({
        status: activeStatus,
        ownerName: ownerSearch || undefined,
        pageNumber,
        pageSize: PAGE_SIZE,
      });
      setPagedResult({
        items:      Array.isArray(result?.items) ? result.items : [],
        pageNumber: result?.pageNumber  ?? pageNumber,
        pageSize:   result?.pageSize    ?? PAGE_SIZE,
        totalCount: result?.totalCount  ?? 0,
        totalPages: result?.totalPages  ?? 1,
      });
    } catch (err) {
      setErrorMsg(err?.message || "حدث خطأ أثناء تحميل الوحدات");
      setPagedResult({ items: [], pageNumber: 1, pageSize: PAGE_SIZE, totalCount: 0, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [activeStatus, ownerSearch, pageNumber]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  /* ── معالجات الأحداث ── */
  const handleTabChange = (key) => {
    if (key === activeTab) return;
    setActiveTab(key);
    setPageNumber(1);
    setExpandedUnitId(null);
  };

  const handleSearch = () => {
    setPageNumber(1);
    setExpandedUnitId(null);
    setOwnerSearch(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput("");
    setOwnerSearch("");
    setPageNumber(1);
    setExpandedUnitId(null);
  };

  const handleToggleDetails = async (task) => {
    const { unitId } = task;
    if (expandedUnitId === unitId) { setExpandedUnitId(null); return; }
    setExpandedUnitId(unitId);
    if (detailsMap[unitId]) return;
    setDetailsLoadingId(unitId);
    try {
      const details = await getReviewerTaskDetails(unitId);
      setDetailsMap((prev) => ({ ...prev, [unitId]: details }));
    } catch (err) {
      setErrorMsg(err?.message || "تعذر تحميل تفاصيل الوحدة");
      setExpandedUnitId(null);
    } finally {
      setDetailsLoadingId(null);
    }
  };

  /* ── الجدول ── */
  const activeTabMeta = STATUS_TABS.find((t) => t.key === activeTab);

  return (
    <Container fluid className="mt-4 mb-5">

      {/* ── رأس الصفحة ── */}
      <Row className="mb-3">
        <Col>
          <h4 className="fw-bold text-primary mb-1">مراجعة الضريبة العقارية</h4>
          <p className="text-muted small mb-0">
            مراجعة الوحدات · حساب الضريبة · اعتماد التقدير وإرساله للمالية
          </p>
        </Col>
      </Row>

      {errorMsg && (
        <Alert variant="danger" dismissible onClose={() => setErrorMsg("")} className="mb-3">
          <i className="fa-solid fa-triangle-exclamation me-2" />
          {errorMsg}
        </Alert>
      )}

      <Card className="shadow-sm border-0">

        {/* ── شريط الفلاتر ── */}
        <Card.Header className="bg-white border-bottom py-3">
          <Row className="g-2 align-items-center">

            {/* تبويبات الحالة */}
            <Col xs={12} md="auto" className="d-flex gap-2 flex-wrap">
              {STATUS_TABS.map((tab) => (
                <Button
                  key={tab.key}
                  size="sm"
                  variant={activeTab === tab.key ? tab.variant : `outline-${tab.variant}`}
                  onClick={() => handleTabChange(tab.key)}
                >
                  <i className={`fa-solid ${tab.icon} me-1`} />
                  {tab.label}
                </Button>
              ))}
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={loadTasks}
                disabled={loading}
                title="تحديث"
              >
                <i className={`fa-solid fa-rotate-right${loading ? " fa-spin" : ""}`} />
              </Button>
            </Col>

            {/* بحث المالك */}
            <Col xs={12} md>
              <InputGroup size="sm">
                <InputGroup.Text>
                  <i className="fa-solid fa-magnifying-glass text-muted" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="بحث باسم المالك..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                {ownerSearch && (
                  <Button variant="outline-secondary" onClick={clearSearch} title="مسح البحث">
                    <i className="fa-solid fa-xmark" />
                  </Button>
                )}
                <Button variant="primary" onClick={handleSearch} disabled={loading}>
                  بحث
                </Button>
              </InputGroup>
            </Col>
          </Row>
        </Card.Header>

        {/* ── شريط الإحصاء ── */}
        <div
          className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom"
          style={{ background: "#f8f9fb", fontSize: "0.82rem" }}
        >
          <span className="text-muted">
            {ownerSearch
              ? <>نتائج البحث عن: <strong className="text-dark">«{ownerSearch}»</strong></>
              : <><i className={`fa-solid ${activeTabMeta?.icon} me-1`} />{activeTabMeta?.label}</>
            }
          </span>
          <span className="text-muted">
            <strong className="text-dark">{pagedResult.totalCount.toLocaleString("ar-EG")}</strong> وحدة ·
            صفحة <strong className="text-dark">{pagedResult.pageNumber}</strong> من{" "}
            <strong className="text-dark">{pagedResult.totalPages}</strong>
          </span>
        </div>

        {/* ── المحتوى ── */}
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <div className="mt-2 text-muted small">جاري تحميل الوحدات...</div>
            </div>
          ) : !pagedResult.items.length ? (
            <div className="text-center py-5 text-muted">
              <i className="fa-solid fa-inbox fa-2x mb-3 d-block opacity-40" />
              <div className="fw-semibold">لا توجد وحدات مطابقة</div>
              <div className="small mt-1">
                {ownerSearch ? "جرّب بحثاً مختلفاً أو امسح الفلتر" : "لا توجد وحدات في هذه الحالة حالياً"}
              </div>
            </div>
          ) : (
            <Table hover responsive className="mb-0 align-middle">
              <thead style={{ background: "#f1f3f5" }}>
                <tr>
                  <th className="text-muted fw-normal small" style={{ width: 48 }}>#</th>
                  <th className="fw-semibold small" style={{ minWidth: 110 }}>المساحة</th>
                  <th className="fw-semibold small" style={{ minWidth: 230 }}>العنوان</th>
                  <th className="fw-semibold small" style={{ minWidth: 160 }}>المالك</th>
                  <th className="fw-semibold small" style={{ minWidth: 110 }}>الاستخدام</th>
                  <th className="fw-semibold small" style={{ minWidth: 120 }}>الحالة</th>
                  <th className="fw-semibold small text-center" style={{ minWidth: 180 }}>الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {pagedResult.items.map((task, index) => {
                  const isExpanded      = expandedUnitId === task.unitId;
                  const isLoadingDet    = detailsLoadingId === task.unitId;
                  const details         = detailsMap[task.unitId];
                  const rowNumber       = (pagedResult.pageNumber - 1) * pagedResult.pageSize + index + 1;

                  return (
                    <React.Fragment key={task.unitId}>
                      <tr style={isExpanded ? { background: "#f0f4ff" } : undefined}>
                        <td className="text-muted small">{rowNumber}</td>

                        <td>
                          <div className="fw-bold text-primary">{task.area ?? 0} م²</div>
                          <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                            {task.unitType || "وحدة"} · دور {task.floor ?? "-"}
                          </div>
                        </td>

                        <td>
                          <div className="fw-semibold">{task.propertyAddress || "-"}</div>
                          {task.unitNumber && (
                            <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                              كود: {task.unitNumber}
                            </div>
                          )}
                        </td>

                        <td className="fw-semibold">{task.ownerName || "-"}</td>

                        <td>
                          <Badge bg="light" text="dark" className="border fw-normal small">
                            {task.usage || "-"}
                          </Badge>
                        </td>

                        <td><TaxStatusBadge status={task.taxStatus} /></td>

                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => navigate(`/reviewer/calc/${task.unitId}`)}
                            >
                              <i className="fa-solid fa-calculator me-1" />
                              حساب
                            </Button>
                            <Button
                              variant={isExpanded ? "secondary" : "outline-secondary"}
                              size="sm"
                              onClick={() => handleToggleDetails(task)}
                              disabled={isLoadingDet}
                            >
                              {isLoadingDet
                                ? <Spinner animation="border" size="sm" />
                                : <><i className={`fa-solid fa-eye${isExpanded ? "-slash" : ""} me-1`} />{isExpanded ? "إخفاء" : "عرض"}</>
                              }
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="p-0">
                            {isLoadingDet ? (
                              <div className="text-center py-4">
                                <Spinner animation="border" size="sm" variant="primary" />
                              </div>
                            ) : (
                              <ReviewerTaskExpandedDetails details={details} />
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>

        <PaginationBar
          pageNumber={pagedResult.pageNumber}
          pageSize={pagedResult.pageSize}
          totalCount={pagedResult.totalCount}
          totalPages={pagedResult.totalPages}
          disabled={loading}
          onPageChange={(p) => { setExpandedUnitId(null); setPageNumber(p); }}
        />
      </Card>
    </Container>
  );
};

export default ReviewerHome;