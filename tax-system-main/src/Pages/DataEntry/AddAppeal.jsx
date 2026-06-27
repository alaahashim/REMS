import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
<<<<<<< HEAD
  Form, Button, Card, Container, Row, Col, Alert, Spinner, Badge, Table, InputGroup
} from "react-bootstrap";
import { useLanguage } from "../../context/LanguageContext";
import { useDynamicTranslation } from "../../utils/useDynamicTranslation";
import { createAppeal, searchAssessmentsForAppeal } from "../../services/appealService";

// ── مكون مساعد لترجمة الداتا الديناميكية الراجعة من الداتابيز فقط ──
const DynText = ({ text, lang }) => {
  const translated = useDynamicTranslation(text || '', lang);
  return <>{translated || '-'}</>;
};

=======
  Form,
  Button,
  Card,
  Container,
  Row,
  Col,
  Alert,
  Spinner,
  Badge,
  Table,
  InputGroup
} from "react-bootstrap";
import { createAppeal, searchAssessmentsForAppeal } from "../../services/appealService";

>>>>>>> main
const PAGE_SIZE = 8;

const AddAppeal = () => {
  const navigate = useNavigate();
<<<<<<< HEAD
  const { lang, t } = useLanguage();

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [searchText, setSearchText]       = useState("");
  const [taxYearFilter, setTaxYearFilter] = useState("");
  const [assessments, setAssessments]     = useState([]);
  const [totalCount, setTotalCount]       = useState(0);
  const [currentPage, setCurrentPage]     = useState(1);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const [selectedAssessment, setSelectedAssessment] = useState(null);

=======

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // --- Assessment lookup state ---
  const [searchText, setSearchText]     = useState("");
  const [taxYearFilter, setTaxYearFilter] = useState("");
  const [assessments, setAssessments]   = useState([]);
  const [totalCount, setTotalCount]     = useState(0);
  const [currentPage, setCurrentPage]   = useState(1);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // --- Selected assessment ---
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  // --- Form data ---
>>>>>>> main
  const [formData, setFormData] = useState({
    appealDate: new Date().toISOString().split("T")[0],
    appealReason: "",
    file: null
  });

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

<<<<<<< HEAD
=======
  // -------------------------------------------------------
>>>>>>> main
  const fetchAssessments = useCallback(async (page = 1) => {
    setLoadingSearch(true);
    setMessage({ text: "", type: "" });
    try {
      const result = await searchAssessmentsForAppeal({
        search: searchText,
        taxYear: taxYearFilter,
        pageNumber: page,
        pageSize: PAGE_SIZE
      });
<<<<<<< HEAD
      const items = result?.items ?? result?.Items ?? [];
=======
      const items      = result?.items      ?? result?.Items      ?? [];
>>>>>>> main
      const totalItems = result?.totalCount ?? result?.TotalCount ?? result?.total ?? items.length;
      setAssessments(items);
      setTotalCount(totalItems);
      setCurrentPage(page);
      setSearchPerformed(true);
    } catch (err) {
<<<<<<< HEAD
      // نص مطابق لـ phraseTranslations
      setMessage({ text: err.message || "تعذر تحميل الربطات الضريبية", type: "danger" });
    } finally {
      setLoadingSearch(false);
=======
      setMessage({ text: err.message || "تعذر تحميل الربطات الضريبية", type: "danger" });
    } finally {
      setLoadingSearch(false);
    }
  }, [searchText, taxYearFilter]);

  // Search on Enter key
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fetchAssessments(1);
>>>>>>> main
    }
  }, [searchText, taxYearFilter]);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); fetchAssessments(1); }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchAssessments(page);
<<<<<<< HEAD
  };

  const handleSelectAssessment = (item) => {
    setSelectedAssessment(item);
    setTimeout(() => {
      document.getElementById("appeal-form-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
=======
>>>>>>> main
  };

  // -------------------------------------------------------
  const handleSelectAssessment = (item) => {
    setSelectedAssessment(item);
    // Scroll down to form
    setTimeout(() => {
      document.getElementById("appeal-form-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // -------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: "", type: "" });
<<<<<<< HEAD
    try {
      // نصوص مطابقة لـ phraseTranslations
      if (!selectedAssessment) throw new Error("اختر ربطاً ضريبياً أولاً");
      if (!formData.appealReason.trim()) throw new Error("الرجاء إدخال سبب الطعن");
=======

    try {
      if (!selectedAssessment) throw new Error("يجب اختيار الربط الضريبي أولاً");
      if (!formData.appealReason.trim()) throw new Error("سبب الطعن مطلوب");
>>>>>>> main

      const payload = {
        taxAssessmentId: Number(selectedAssessment.taxAssessmentId ?? selectedAssessment.id),
        appealDate: formData.appealDate,
        appealReason: formData.appealReason.trim()
      };

      const result = await createAppeal(payload);
<<<<<<< HEAD
      // نص مطابق لـ phraseTranslations
=======

>>>>>>> main
      setMessage({
        text: result?.message || "تم تسجيل الطعن بنجاح، وتم إضافة رسم الطعن على السجل",
        type: "success"
      });
<<<<<<< HEAD
      setTimeout(() => navigate("/data-entry/home"), 1800);
    } catch (error) {
      const errors = error?.errors || [];
      setMessage({ text: [error.message, ...errors].filter(Boolean).join(" - "), type: "danger" });
=======

      setTimeout(() => navigate("/data-entry/home"), 1800);
    } catch (error) {
      const errors = error?.errors || [];
      setMessage({
        text: [error.message, ...errors].filter(Boolean).join(" - "),
        type: "danger"
      });
>>>>>>> main
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------
  return (
    <Container fluid className="mt-4">
      <Row className="justify-content-center">
        <Col md={11} lg={10}>

<<<<<<< HEAD
          {/* ══════════ كارت البحث ══════════ */}
=======
          {/* ===== Page Header ===== */}
>>>>>>> main
          <Card className="shadow-sm border-0 border-top border-5 border-primary mb-4">
            <Card.Header className="bg-primary text-white py-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
<<<<<<< HEAD
                  {/* نص ثابت — مطابق في phraseTranslations */}
                  <small className="text-white-50">تقديم طلب جديد</small>
                  {/* استخدام t() لأن المفتاح موجود في translations object */}
                  <Card.Title className="mb-0 fs-4 fw-bold">{t('addAppeal')}</Card.Title>
                </div>
                {/* نص ثابت — سيُضاف لـ phraseTranslations */}
=======
                  <small className="text-white-50">تقديم طلب جديد</small>
                  <Card.Title className="mb-0 fs-4 fw-bold">تسجيل طعن ضريبي</Card.Title>
                </div>
>>>>>>> main
                <Badge bg="success" className="fs-6">إضافة</Badge>
              </div>
            </Card.Header>

            <Card.Body className="pb-2">
              {message.text && (
                <Alert variant={message.type} className="mb-3">{message.text}</Alert>
              )}
<<<<<<< HEAD

              <h6 className="text-primary fw-bold mb-3">
                <span className="badge bg-primary me-2">1</span>
                {/* نص ثابت — سيُضاف لـ phraseTranslations */}
                ابحث عن الربط الضريبي المراد الطعن عليه
              </h6>

              <Row className="g-2 mb-3">
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text><i className="bi bi-search" /></InputGroup.Text>
                    {/* نص ثابت — مطابق في phraseTranslations */}
                    <Form.Control
                      placeholder="اسم المالك، الرقم القومي، أو كود الوحدة..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                    />
                  </InputGroup>
                </Col>
                <Col md={3}>
                  {/* نص ثابت — مطابق في phraseTranslations */}
                  <Form.Control
                    type="number"
                    placeholder="السنة الضريبية (اختياري)"
                    value={taxYearFilter}
                    onChange={(e) => setTaxYearFilter(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    min={2000} max={2100}
                  />
                </Col>
                <Col md={3}>
                  {/* نص ثابت — مطابق في phraseTranslations */}
                  <Button variant="primary" className="w-100" onClick={() => fetchAssessments(1)} disabled={loadingSearch}>
                    {loadingSearch
                      ? <><Spinner size="sm" animation="border" className="me-1" />جاري البحث...</>
                      : "بحث"
                    }
                  </Button>
                </Col>
              </Row>

              {searchPerformed && (
                <>
                  {assessments.length === 0 ? (
                    /* نص ثابت — مطابق في phraseTranslations */
=======

              {/* ===== STEP 1: Search ===== */}
              <h6 className="text-primary fw-bold mb-3">
                <span className="badge bg-primary me-2">1</span>
                ابحث عن الربط الضريبي المراد الطعن عليه
              </h6>

              <Row className="g-2 mb-3">
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text><i className="bi bi-search" /></InputGroup.Text>
                    <Form.Control
                      placeholder="اسم المالك، الرقم القومي، أو كود الوحدة..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                    />
                  </InputGroup>
                </Col>
                <Col md={3}>
                  <Form.Control
                    type="number"
                    placeholder="السنة الضريبية (اختياري)"
                    value={taxYearFilter}
                    onChange={(e) => setTaxYearFilter(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    min={2000}
                    max={2100}
                  />
                </Col>
                <Col md={3}>
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={() => fetchAssessments(1)}
                    disabled={loadingSearch}
                  >
                    {loadingSearch
                      ? <><Spinner size="sm" animation="border" className="me-1" />جاري البحث...</>
                      : "بحث"}
                  </Button>
                </Col>
              </Row>

              {/* ===== Search Results Table ===== */}
              {searchPerformed && (
                <>
                  {assessments.length === 0 ? (
>>>>>>> main
                    <Alert variant="info" className="py-2">لا توجد نتائج مطابقة للبحث</Alert>
                  ) : (
                    <>
                      <div className="table-responsive mb-2">
                        <Table hover bordered size="sm" className="mb-0">
                          <thead className="table-light text-center">
                            <tr>
                              <th>#</th>
<<<<<<< HEAD
                              {/* نصوص ثابتة — مطابقة أو ستُضاف لـ phraseTranslations */}
=======
>>>>>>> main
                              <th>اسم المالك</th>
                              <th>كود الوحدة</th>
                              <th>عنوان العقار</th>
                              <th>السنة الضريبية</th>
                              <th>القيمة الإيجارية</th>
                              <th>الضريبة السنوية</th>
                              <th>اختيار</th>
                            </tr>
                          </thead>
                          <tbody className="text-center">
                            {assessments.map((item, idx) => {
                              const itemId = item.taxAssessmentId ?? item.id;
                              const selectedId = selectedAssessment?.taxAssessmentId ?? selectedAssessment?.id;
                              const isSelected = String(itemId) === String(selectedId);
                              return (
                                <tr
                                  key={itemId}
                                  className={isSelected ? "table-success" : ""}
                                  style={{ cursor: "pointer" }}
                                  onClick={() => handleSelectAssessment(item)}
                                >
                                  <td>{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
<<<<<<< HEAD

                                  {/* ★ داتا ديناميكية من الداتابيز — نستخدم DynText */}
                                  <td className="text-start">
                                    <DynText text={item.ownerName} lang={lang} />
                                  </td>

                                  <td>{item.unitNumber || item.unitCode || "-"}</td>

                                  {/* ★ داتا ديناميكية من الداتابيز — نستخدم DynText */}
                                  <td className="text-start">
                                    <DynText text={item.propertyAddress} lang={lang} />
                                  </td>

                                  <td>{item.taxYear || "-"}</td>
                                  {/* ج.م موجود في phraseTransactions كـ 'EGP' */}
                                  <td>{item.annualRentalValue != null ? `${item.annualRentalValue} ج.م` : "-"}</td>
                                  <td className="fw-bold text-danger">{item.annualTax != null ? `${item.annualTax} ج.م` : "-"}</td>
                                  <td>
                                    {isSelected
                                      ? /* نص ثابت — مطابق في phraseTranslations */
                                        <Badge bg="success">✓ مختار</Badge>
                                      : /* نص ثابت — مطابق في phraseTranslations */
                                        <Button size="sm" variant="outline-primary" onClick={(e) => { e.stopPropagation(); handleSelectAssessment(item); }}>اختيار</Button>
=======
                                  <td className="text-start">{item.ownerName || "-"}</td>
                                  <td>{item.unitNumber || item.unitCode || "-"}</td>
                                  <td className="text-start">{item.propertyAddress || "-"}</td>
                                  <td>{item.taxYear || "-"}</td>
                                  <td>{item.annualRentalValue != null ? `${item.annualRentalValue} ج.م` : "-"}</td>
                                  <td className="fw-bold text-danger">
                                    {item.annualTax != null ? `${item.annualTax} ج.م` : "-"}
                                  </td>
                                  <td>
                                    {isSelected
                                      ? <Badge bg="success">✓ مختار</Badge>
                                      : <Button size="sm" variant="outline-primary" onClick={(e) => { e.stopPropagation(); handleSelectAssessment(item); }}>اختيار</Button>
>>>>>>> main
                                    }
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>

<<<<<<< HEAD
                      {totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          {/* نصوص ثابتة — مطابقة في phraseTranslations */}
=======
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mb-3">
>>>>>>> main
                          <small className="text-muted">
                            إجمالي النتائج: <strong>{totalCount}</strong> — صفحة {currentPage} من {totalPages}
                          </small>
                          <div className="d-flex gap-1">
                            <Button size="sm" variant="outline-secondary" disabled={currentPage === 1} onClick={() => handlePageChange(1)}>«</Button>
                            <Button size="sm" variant="outline-secondary" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>‹</Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter(p => Math.abs(p - currentPage) <= 2)
                              .map(p => (
<<<<<<< HEAD
                                <Button key={p} size="sm" variant={p === currentPage ? "primary" : "outline-secondary"} onClick={() => handlePageChange(p)}>{p}</Button>
                              ))
                            }
=======
                                <Button
                                  key={p}
                                  size="sm"
                                  variant={p === currentPage ? "primary" : "outline-secondary"}
                                  onClick={() => handlePageChange(p)}
                                >
                                  {p}
                                </Button>
                              ))}
>>>>>>> main
                            <Button size="sm" variant="outline-secondary" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>›</Button>
                            <Button size="sm" variant="outline-secondary" disabled={currentPage === totalPages} onClick={() => handlePageChange(totalPages)}>»</Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </Card.Body>
          </Card>

<<<<<<< HEAD
          {/* ══════════ كارت بيانات الطعن ══════════ */}
=======
          {/* ===== STEP 2: Appeal Form ===== */}
>>>>>>> main
          <div id="appeal-form-section">
            <Card className={`shadow-sm border-0 border-top border-5 ${selectedAssessment ? "border-success" : "border-secondary"}`}>
              <Card.Header className={`${selectedAssessment ? "bg-success" : "bg-secondary"} text-white py-3`}>
                <h6 className="mb-0 fw-bold">
                  <span className="badge bg-white text-dark me-2">2</span>
<<<<<<< HEAD
                  {/* نص ثابت — مطابق في phraseTranslations */}
                  بيانات الطعن
                  {/* نص ثابت — مطابق في phraseTranslations */}
=======
                  بيانات الطعن
>>>>>>> main
                  {!selectedAssessment && <small className="ms-2 opacity-75">(اختر ربطاً ضريبياً أولاً)</small>}
                </h6>
              </Card.Header>

              <Card.Body>
<<<<<<< HEAD
=======
                {/* Selected assessment summary */}
>>>>>>> main
                {selectedAssessment && (
                  <Card className="mb-4 bg-light border-success border-2">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
<<<<<<< HEAD
                        {/* نص ثابت — سيُضاف لـ phraseTranslations */}
                        <Card.Title className="text-success mb-0 h6">✓ الربط الضريبي المختار</Card.Title>
                        {/* نص ثابت — مطابق في phraseTranslations */}
                        <Button size="sm" variant="outline-danger" onClick={() => setSelectedAssessment(null)}>تغيير الاختيار</Button>
                      </div>
                      <Row>
                        <Col md={3} sm={6} className="mb-2">
                          {/* نص ثابت — مطابق في phraseTranslations */}
                          <div className="text-secondary small fw-bold mb-1">اسم المالك</div>
                          {/* ★ داتا ديناميكية — DynText */}
                          <div className="fw-bold"><DynText text={selectedAssessment.ownerName} lang={lang} /></div>
                        </Col>
                        <Col md={3} sm={6} className="mb-2">
                          {/* نص ثابت — سيُضاف لـ phraseTranslations */}
=======
                        <Card.Title className="text-success mb-0 h6">✓ الربط الضريبي المختار</Card.Title>
                        <Button size="sm" variant="outline-danger" onClick={() => setSelectedAssessment(null)}>
                          تغيير الاختيار
                        </Button>
                      </div>
                      <Row>
                        <Col md={3} sm={6} className="mb-2">
                          <div className="text-secondary small fw-bold mb-1">اسم المالك</div>
                          <div className="fw-bold">{selectedAssessment.ownerName || "-"}</div>
                        </Col>
                        <Col md={3} sm={6} className="mb-2">
>>>>>>> main
                          <div className="text-secondary small fw-bold mb-1">كود الوحدة</div>
                          <div className="fw-bold">{selectedAssessment.unitNumber || selectedAssessment.unitCode || "-"}</div>
                        </Col>
                        <Col md={3} sm={6} className="mb-2">
<<<<<<< HEAD
                          {/* نص ثابت — سيُضاف لـ phraseTranslations */}
=======
>>>>>>> main
                          <div className="text-secondary small fw-bold mb-1">السنة الضريبية</div>
                          <div className="fw-bold">{selectedAssessment.taxYear || "-"}</div>
                        </Col>
                        <Col md={3} sm={6} className="mb-2">
<<<<<<< HEAD
                          {/* نص ثابت — مطابق في phraseTranslations */}
                          <div className="text-secondary small fw-bold mb-1">الضريبة السنوية</div>
                          <div className="fw-bold text-danger fs-5">
                            {selectedAssessment.annualTax != null ? `${selectedAssessment.annualTax} ج.م` : "-"}
                          </div>
                        </Col>
                        {selectedAssessment.propertyAddress && (
                          <Col md={12} className="mt-1">
                            {/* نص ثابت — سيُضاف لـ phraseTranslations */}
                            <div className="text-secondary small fw-bold mb-1">عنوان العقار</div>
                            {/* ★ داتا ديناميكية — DynText */}
                            <div className="fw-bold"><DynText text={selectedAssessment.propertyAddress} lang={lang} /></div>
=======
                          <div className="text-secondary small fw-bold mb-1">الضريبة السنوية</div>
                          <div className="fw-bold text-danger fs-5">{selectedAssessment.annualTax != null ? `${selectedAssessment.annualTax} ج.م` : "-"}</div>
                        </Col>
                        {selectedAssessment.propertyAddress && (
                          <Col md={12} className="mt-1">
                            <div className="text-secondary small fw-bold mb-1">عنوان العقار</div>
                            <div className="fw-bold">{selectedAssessment.propertyAddress}</div>
>>>>>>> main
                          </Col>
                        )}
                        {selectedAssessment.annualRentalValue != null && (
                          <Col md={3} sm={6} className="mt-2">
<<<<<<< HEAD
                            {/* نص ثابت — مطابق في phraseTranslations */}
=======
>>>>>>> main
                            <div className="text-secondary small fw-bold mb-1">القيمة الإيجارية السنوية</div>
                            <div className="fw-bold">{selectedAssessment.annualRentalValue} ج.م</div>
                          </Col>
                        )}
                      </Row>
                    </Card.Body>
                  </Card>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row className="mt-2">
                    <Col md={6}>
                      <Form.Group className="mb-3">
<<<<<<< HEAD
                        {/* نص ثابت — سيُضاف لـ phraseTranslations */}
                        <Form.Label className="text-primary fw-bold">تاريخ تقديم الطعن</Form.Label>
=======
                        <Form.Label className="text-primary fw-bold">
                          تاريخ تقديم الطعن
                        </Form.Label>
>>>>>>> main
                        <Form.Control
                          type="date"
                          value={formData.appealDate}
                          onChange={(e) => setFormData({ ...formData, appealDate: e.target.value })}
                          required
                          disabled={!selectedAssessment}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
<<<<<<< HEAD
                        {/* نص ثابت — مطابق في phraseTranslations */}
                        <Form.Label className="text-primary fw-bold">رفع المستندات الداعمة</Form.Label>
=======
                        <Form.Label className="text-primary fw-bold">
                          رفع المستندات الداعمة
                        </Form.Label>
>>>>>>> main
                        <Form.Control
                          type="file"
                          onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                          accept=".pdf,.jpg,.jpeg,.png"
                          disabled={!selectedAssessment}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
<<<<<<< HEAD
                    {/* نص ثابت — سيُضاف لـ phraseTranslations */}
=======
>>>>>>> main
                    <Form.Label className="text-primary fw-bold">
                      تفاصيل وسبب الطعن <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
<<<<<<< HEAD
                      /* نصوص ثابتة — مطابقة في phraseTranslations */
                      placeholder={
                        selectedAssessment
                          ? "اكتب هنا أسباب الاعتراض على القيمة الضريبية المحسوبة..."
                          : "اختر الربط الضريبي أولاً"
                      }
=======
                      placeholder={selectedAssessment ? "اكتب هنا أسباب الاعتراض على القيمة الضريبية المحسوبة..." : "اختر الربط الضريبي أولاً"}
>>>>>>> main
                      value={formData.appealReason}
                      onChange={(e) => setFormData({ ...formData, appealReason: e.target.value })}
                      required
                      disabled={!selectedAssessment}
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-between gap-3 mt-4">
<<<<<<< HEAD
                    {/* نص ثابت — مطابق في phraseTranslations */}
                    <Button variant="secondary" onClick={() => navigate("/data-entry/home")}>إلغاء والعودة</Button>
                    {/* نصوص ثابتة — مطابقة في phraseTranslations */}
                    <Button variant="success" type="submit" disabled={submitting || !selectedAssessment} size="lg" className="fw-bold px-5">
                      {submitting
                        ? <><Spinner size="sm" animation="border" className="me-2" />جاري التسجيل...</>
                        : "تسجيل الطعن"
                      }
=======
                    <Button variant="secondary" onClick={() => navigate("/data-entry/home")}>
                      إلغاء والعودة
                    </Button>
                    <Button
                      variant="success"
                      type="submit"
                      disabled={submitting || !selectedAssessment}
                      size="lg"
                      className="fw-bold px-5"
                    >
                      {submitting ? (
                        <><Spinner size="sm" animation="border" className="me-2" />جاري التسجيل...</>
                      ) : (
                        "تسجيل الطعن"
                      )}
>>>>>>> main
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </div>

        </Col>
      </Row>
    </Container>
  );
};

export default AddAppeal;