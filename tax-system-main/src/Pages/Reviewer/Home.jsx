// src/pages/Reviewer/Home.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert, Badge, Button, Card, Col, Container,
  Form, InputGroup, Row, Spinner, Table,
} from "react-bootstrap";

import { useLanguage } from "../../context/LanguageContext"; 
import { useDynamicTranslation } from "../../utils/useDynamicTranslation"; 

import {
  getReviewerTaskDetails,
  getReviewerTaxTasks,
  deleteUnitTaxAssessment,
  revertApprovedAssessment,
  hasAppealsForAssessment,
} from "../../services/taxService";
import PaginationBar from "./PaginationBar";
import ReviewerTaskExpandedDetails from "./ReviewerTaskExpandedDetails";

// ── مكون مساعد لترجمة الداتا الديناميكياً ──
const DynText = ({ text, lang }) => {
  const translated = useDynamicTranslation(text || '', lang);
  return <>{translated || '-'}</>;
};

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
    label: "معتمد",
    apiValue: "Approved",
    variant: "success",
    icon: "fa-circle-check",
  },
];

const TaxStatusBadge = ({ status }) =>
  String(status) === "Approved" ? (
    <Badge bg="success">معتمد</Badge>
  ) : (
    <Badge bg="warning" text="dark">بانتظار الحساب</Badge>
  );

const ReviewerHome = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage(); 

  const [activeTab,        setActiveTab]        = useState("pending");
  const [loading,          setLoading]          = useState(true);
  const [errorMsg,         setErrorMsg]         = useState("");
  const [pageNumber,       setPageNumber]       = useState(1);
  const [searchInput,      setSearchInput]      = useState("");
  const [ownerSearch,      setOwnerSearch]      = useState("");
  const [expandedUnitId,   setExpandedUnitId]   = useState(null);
  const [detailsLoadingId, setDetailsLoadingId] = useState(null);
  const [detailsMap,       setDetailsMap]       = useState({});
  const [deletingUnitId,   setDeletingUnitId]   = useState(null);

  const [suggestions,      setSuggestions]      = useState([]);
  const [suggestLoading,   setSuggestLoading]   = useState(false);
  const [showDropdown,     setShowDropdown]     = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const debounceRef = useRef(null);
  const wrapperRef  = useRef(null);

  const [pagedResult, setPagedResult] = useState({
    items: [], pageNumber: 1, pageSize: PAGE_SIZE, totalCount: 0, totalPages: 1,
  });

  const activeStatus = useMemo(
    () => STATUS_TABS.find((x) => x.key === activeTab)?.apiValue ?? "PendingCalculation",
    [activeTab],
  );

  /* ── إغلاق الـ dropdown عند الضغط خارجه ── */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ── جلب الاقتراحات (debounce 300ms) ── */
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (!trimmed) { setSuggestions([]); setShowDropdown(false); return; }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        setSuggestLoading(true);
        const result = await getReviewerTaxTasks({
          ownerName: trimmed, pageNumber: 1, pageSize: 8,
        });
        const items = Array.isArray(result?.items) ? result.items : [];
        const seen  = new Set();
        const unique = [];
        for (const item of items) {
          const name = item.ownerName?.trim();
          if (name && !seen.has(name)) {
            seen.add(name);
            unique.push({ ownerName: name, unitId: item.unitId, taxStatus: item.taxStatus });
          }
        }
        setSuggestions(unique);
        setShowDropdown(unique.length > 0);
        setActiveSuggestion(-1);
      } catch {
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setSuggestLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  /* ── دالة مساعدة: التحقق من وجود طعون ── */
  const checkHasAppeals = async (unitId, taxYear) => {
    try {
      return await hasAppealsForAssessment(unitId, taxYear);
    } catch {
      return false;
    }
  };

  /* ── حذف التقييم ── */
  const handleDeleteAssessment = async (task) => {
    const { unitId, taxYear } = task;

    if (!taxYear) {
      setErrorMsg("لا يمكن حذف التقييم لأن السنة الضريبية غير متوفرة لهذه الوحدة");
      return;
    }

    const hasAppeals = await checkHasAppeals(unitId, taxYear);

    let deleteRelatedAppeals = false;
    if (hasAppeals) {
      const confirmAppeals = window.confirm(
        "هذا التقييم مرتبط بطعون. هل تريد حذف الطعون المرتبطة أيضاً؟"
      );
      if (!confirmAppeals) return;
      deleteRelatedAppeals = true;
    } else {
      const confirmed = window.confirm(
        `هل أنت متأكد من حذف التقييم الضريبي للوحدة رقم ${unitId} لسنة ${taxYear}؟`
      );
      if (!confirmed) return;
    }

    setDeletingUnitId(unitId);
    setErrorMsg("");

    try {
      await deleteUnitTaxAssessment(unitId, taxYear, deleteRelatedAppeals);
      if (expandedUnitId === unitId) setExpandedUnitId(null);
      setDetailsMap((prev) => { const u = { ...prev }; delete u[unitId]; return u; });
      await loadTasks();
    } catch (err) {
      setErrorMsg(err?.message || "حدث خطأ أثناء حذف التقييم الضريبي");
    } finally {
      setDeletingUnitId(null);
    }
  };

  /* ── إرجاع التقييم ── */
  const handleRevertAssessment = async (task) => {
    const { unitId, taxYear } = task;

    if (!taxYear) {
      setErrorMsg("لا يمكن إرجاع التقييم لأن السنة الضريبية غير متوفرة لهذه الوحدة");
      return;
    }

    const hasAppeals = await checkHasAppeals(unitId, taxYear);

    let deleteRelatedAppeals = false;
    if (hasAppeals) {
      const confirmAppeals = window.confirm(
        "هذا التقييم مرتبط بطعون. هل تريد حذف الطعون المرتبطة أيضاً؟"
      );
      if (!confirmAppeals) return;
      deleteRelatedAppeals = true;
    } else {
      const confirmed = window.confirm(
        `هل أنت متأكد من إرجاع التقييم الضريبي للوحدة رقم ${unitId} لسنة ${taxYear} إلى انتظار الحساب؟`
      );
      if (!confirmed) return;
    }

    setDeletingUnitId(unitId);
    setErrorMsg("");

    try {
      await revertApprovedAssessment(unitId, taxYear, deleteRelatedAppeals);
      if (expandedUnitId === unitId) setExpandedUnitId(null);
      setDetailsMap((prev) => { const u = { ...prev }; delete u[unitId]; return u; });
      await loadTasks();
    } catch (err) {
      setErrorMsg(err?.message || "حدث خطأ أثناء إرجاع التقييم إلى انتظار الحساب");
    } finally {
      setDeletingUnitId(null);
    }
  };

  /* ── جلب بيانات الجدول ── */
  const loadTasks = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const result = await getReviewerTaxTasks({
        status:    activeStatus,
        ownerName: ownerSearch || undefined,
        pageNumber,
        pageSize:  PAGE_SIZE,
      });
      setPagedResult({
        items:      Array.isArray(result?.items) ? result.items : [],
        pageNumber: result?.pageNumber ?? pageNumber,
        pageSize:   result?.pageSize   ?? PAGE_SIZE,
        totalCount: result?.totalCount ?? 0,
        totalPages: result?.totalPages ?? 1,
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

  const applySearch = (name) => {
    setSearchInput(name);
    setOwnerSearch(name);
    setPageNumber(1);
    setExpandedUnitId(null);
    setShowDropdown(false);
    setSuggestions([]);
  };

  const handleSearch = () => {
    setShowDropdown(false);
    applySearch(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput("");
    setOwnerSearch("");
    setPageNumber(1);
    setExpandedUnitId(null);
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === "Enter") handleSearch();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
        applySearch(suggestions[activeSuggestion].ownerName);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
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

  const activeTabMeta = STATUS_TABS.find((t) => t.key === activeTab);

  return (
    <Container fluid className="mt-4 mb-5">

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

            {/* ── بحث المالك مع Autocomplete ── */}
            <Col xs={12} md>
              <div ref={wrapperRef} style={{ position: "relative" }}>
                <InputGroup size="sm">
                  <InputGroup.Text>
                    {suggestLoading
                      ? <Spinner animation="border" size="sm" style={{ width: "0.8rem", height: "0.8rem" }} />
                      : <i className="fa-solid fa-magnifying-glass text-muted" />
                    }
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="بحث باسم المالك..."
                    value={searchInput}
                    onChange={(e) => { setSearchInput(e.target.value); setActiveSuggestion(-1); }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
                    autoComplete="off"
                  />
                  {(ownerSearch || searchInput) && (
                    <Button variant="outline-secondary" onClick={clearSearch} title="مسح البحث">
                      <i className="fa-solid fa-xmark" />
                    </Button>
                  )}
                  <Button variant="primary" onClick={handleSearch} disabled={loading}>
                    بحث
                  </Button>
                </InputGroup>

                {showDropdown && suggestions.length > 0 && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                    zIndex: 1050, background: "#fff", border: "1px solid #dee2e6",
                    borderRadius: "0.375rem", boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                    maxHeight: "260px", overflowY: "auto",
                  }}>
                    {suggestions.map((s, idx) => {
                      const isActive = idx === activeSuggestion;
                      const approved = String(s.taxStatus) === "Approved";
                      return (
                        <div
                          key={`${s.ownerName}-${idx}`}
                          onMouseDown={(e) => { e.preventDefault(); applySearch(s.ownerName); }}
                          onMouseEnter={() => setActiveSuggestion(idx)}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "8px 14px", cursor: "pointer",
                            background: isActive ? "#f0f4ff" : "transparent",
                            borderBottom: idx < suggestions.length - 1 ? "1px solid #f1f3f5" : "none",
                            transition: "background 0.1s",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <i className="fa-solid fa-user" style={{ color: "#6c757d", fontSize: "0.75rem" }} />
                            {/* ★ داتا ديناميكية من الداتا بيز */}
                            <span style={{ fontSize: "0.88rem", fontWeight: 500 }}><DynText text={s.ownerName} lang={lang} /></span>
                          </div>
                          <Badge
                            bg={approved ? "success" : "warning"}
                            text={approved ? undefined : "dark"}
                            style={{ fontSize: "0.68rem" }}
                          >
                            {approved ? "معتمد" : "بانتظار الحساب"}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
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
                  const isExpanded   = expandedUnitId === task.unitId;
                  const isLoadingDet = detailsLoadingId === task.unitId;
                  const details      = detailsMap[task.unitId];
                  const rowNumber    = (pagedResult.pageNumber - 1) * pagedResult.pageSize + index + 1;

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
                          {/* ★ داتا ديناميكية من الداتا بيز */}
                          <div className="fw-semibold"><DynText text={task.propertyAddress} lang={lang} /></div>
                          {task.unitNumber && (
                            <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                              كود: {task.unitNumber}
                            </div>
                          )}
                        </td>

                        <td className="fw-semibold">
                          {/* ★ داتا ديناميكية من الداتا بيز */}
                          <DynText text={task.ownerName} lang={lang} />
                        </td>

                        <td>
                          <Badge bg="light" text="dark" className="border fw-normal small">
                            {/* ★ داتا ديناميكية من الداتا بيز */}
                            <DynText text={task.usage} lang={lang} />
                          </Badge>
                        </td>

                        <td><TaxStatusBadge status={task.taxStatus} /></td>

                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2 flex-wrap">
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
                              {isLoadingDet ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <>
                                  <i className={`fa-solid fa-eye${isExpanded ? "-slash" : ""} me-1`} />
                                  {isExpanded ? "إخفاء" : "عرض"}
                                </>
                              )}
                            </Button>

                            {activeTab === "pending" ? (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteAssessment(task)}
                                disabled={deletingUnitId === task.unitId || !task.taxYear}
                                title={!task.taxYear ? "لا يوجد تقييم ضريبي مرتبط بهذه الوحدة" : "حذف التقييم الضريبي"}
                              >
                                {deletingUnitId === task.unitId ? (
                                  <Spinner animation="border" size="sm" />
                                ) : (
                                  <>
                                    <i className="fa-solid fa-trash me-1" />
                                    حذف
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => handleRevertAssessment(task)}
                                disabled={deletingUnitId === task.unitId || !task.taxYear}
                                title={!task.taxYear ? "لا يوجد تقييم ضريبي مرتبط بهذه الوحدة" : "إرجاع التقييم إلى انتظار الحساب"}
                              >
                                {deletingUnitId === task.unitId ? (
                                  <Spinner animation="border" size="sm" />
                                ) : (
                                  <>
                                    <i className="fa-solid fa-rotate-left me-1" />
                                    إرجاع للحساب
                                  </>
                                )}
                              </Button>
                            )}
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