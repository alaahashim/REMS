import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
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
import { useLanguage } from "../../context/LanguageContext";
import { useDynamicTranslation } from "../../utils/useDynamicTranslation";
import { createAppeal, searchAssessmentsForAppeal } from "../../services/appealService";

// ── مكون مساعد لترجمة الداتا الديناميكية الراجعة من الداتابيز فقط ──
const DynText = ({ text, lang }) => {
  const translated = useDynamicTranslation(text || '', lang);
  return <>{translated || '-'}</>;
};

const PAGE_SIZE = 8;

const AddAppeal = () => {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // --- Assessment lookup state ---
  const [searchText, setSearchText]         = useState("");
  const [taxYearFilter, setTaxYearFilter]   = useState("");
  const [assessments, setAssessments]       = useState([]);
  const [totalCount, setTotalCount]         = useState(0);
  const [currentPage, setCurrentPage]       = useState(1);
  const [loadingSearch, setLoadingSearch]   = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // --- Selected assessment ---
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  // --- Form data ---
  const [formData, setFormData] = useState({
    appealDate: new Date().toISOString().split("T")[0],
    appealReason: "",
    file: null
  });

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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
      const items      = result?.items      ?? result?.Items      ?? [];
      const totalItems = result?.totalCount ?? result?.TotalCount ?? result?.total ?? items.length;
      setAssessments(items);
      setTotalCount(totalItems);
      setCurrentPage(page);
      setSearchPerformed(true);
    } catch (err) {
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
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchAssessments(page);
  };

  const handleSelectAssessment = (item) => {
    setSelectedAssessment(item);
    setTimeout(() => {
      document.getElementById("appeal-form-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      if (!selectedAssessment) throw new Error("اختر ربطاً ضريبياً أولاً");
      if (!formData.appealReason.trim()) throw new Error("الرجاء إدخال سبب الطعن");

      const payload = {
        taxAssessmentId: Number(selectedAssessment.taxAssessmentId ?? selectedAssessment.id),
        appealDate: formData.appealDate,
        appealReason: formData.appealReason.trim()
      };

      const result = await createAppeal(payload);

      setMessage({
        text: result?.message || "تم تسجيل الطعن بنجاح، وتم إضافة رسم الطعن على السجل",
        type: "success"
      });

      setTimeout(() => navigate("/data-entry/home"), 1800);
    } catch (error) {
      const errors = error?.errors || [];
      setMessage({
        text: [error.message, ...errors].filter(Boolean).join(" - "),
        type: "danger"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------
  return (
    <Container fluid className="mt-4">
      <Row className="justify-content-center">
        <Col md={11} lg={10}>

          {/* ══════════ كارت البحث ══════════ */}
          <Card className="shadow-sm border-0 border-top border-5 border-primary mb-4">
            <Card.Header className="bg-primary text-white py-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-white-50">تقديم طلب جديد</small>
                  <Card.Title className="mb-0 fs-4 fw-bold">{t('addAppeal')}</Card.Title>
                </div>
                <Badge bg="success" className="fs-6">إضافة</Badge>
              </div>
            </Card.Header>

            <Card.Body className="pb-2">
              {message.text && (
                <Alert variant={message.type} className="mb-3">{message.text}</Alert>
              )}

              {/* ══════════ الخطوة 1: البحث ══════════ */}
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

              {/* ══════════ نتائج البحث ══════════ */}
              {searchPerformed && (
                <>
                  {assessments.length === 0 ? (
                    <Alert variant="info" className="py-2">لا توجد نتائج مطابقة للبحث</Alert>
                  ) : (
                    <>
                      <div className="table-responsive mb-2">
                        <Table hover bordered size="sm" className="mb-0">
                          <thead className="table-light text-center">
                            <tr>
                              <th>#</th>
                              <th>اسم المالك</th>
                              <th>كود الوحدة</th>
                              <th>عنوان العقار</th>
                              <th>السنة الضريبية</th>
                              <th>الضريبة السنوية</th>
                              <th>اختيار</th>
                            </tr>
                          </thead>
                          <tbody className="text-center">
                            {assessments.map((item, idx) => {
                              const itemId     = item.taxAssessmentId ?? item.id;
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

                                  {/* ★ داتا ديناميكية من الداتابيز */}
                                  <td className="text-start">
                                    <DynText text={item.ownerName} lang={lang} />
                                  </td>

                                  <td>{item.unitNumber || item.unitCode || "-"}</td>

                                  {/* ★ داتا ديناميكية من الداتابيز */}
                                  <td className="text-start">
                                    <DynText text={item.propertyAddress} lang={lang} />
                                  </td>

                                  <td>{item.taxYear || "-"}</td>
                                  <td className="fw-bold text-danger">
                                    {item.annualTax != null ? `${item.annualTax} ج.م` : "-"}
                                  </td>
                                  <td>
                                    {isSelected
                                      ? <Badge bg="success">✓ مختار</Badge>
                                      : <Button
                                          size="sm"
                                          variant="outline-primary"
                                          onClick={(e) => { e.stopPropagation(); handleSelectAssessment(item); }}
                                        >
                                          اختيار
                                        </Button>
                                    }
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <small className="text-muted">
                            إجمالي النتائج: <strong>{totalCount}</strong> — صفحة {currentPage} من {totalPages}
                          </small>
                          <div className="d-flex gap-1">
                            <Button size="sm" variant="outline-secondary" disabled={currentPage === 1} onClick={() => handlePageChange(1)}>«</Button>
                            <Button size="sm" variant="outline-secondary" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>‹</Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter(p => Math.abs(p - currentPage) <= 2)
                              .map(p => (
                                <Button
                                  key={p}
                                  size="sm"
                                  variant={p === currentPage ? "primary" : "outline-secondary"}
                                  onClick={() => handlePageChange(p)}
                                >
                                  {p}
                                </Button>
                              ))}
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

          {/* ══════════ كارت بيانات الطعن ══════════ */}
          <div id="appeal-form-section">
            <Card className={`shadow-sm border-0 border-top border-5 ${selectedAssessment ? "border-success" : "border-secondary"}`}>
              <Card.Header className={`${selectedAssessment ? "bg-success" : "bg-secondary"} text-white py-3`}>
                <h6 className="mb-0 fw-bold">
                  <span className="badge bg-white text-dark me-2">2</span>
                  بيانات الطعن
                  {!selectedAssessment && <small className="ms-2 opacity-75">(اختر ربطاً ضريبياً أولاً)</small>}
                </h6>
              </Card.Header>

              <Card.Body>
                {/* ملخص الربط المختار */}
                {selectedAssessment && (
                  <Card className="mb-4 bg-light border-success border-2">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <Card.Title className="text-success mb-0 h6">✓ الربط الضريبي المختار</Card.Title>
                        <Button size="sm" variant="outline-danger" onClick={() => setSelectedAssessment(null)}>
                          تغيير الاختيار
                        </Button>
                      </div>
                      <Row>
                        <Col md={3} sm={6} className="mb-2">
                          <div className="text-secondary small fw-bold mb-1">اسم المالك</div>
                          {/* ★ داتا ديناميكية */}
                          <div className="fw-bold"><DynText text={selectedAssessment.ownerName} lang={lang} /></div>
                        </Col>
                        <Col md={3} sm={6} className="mb-2">
                          <div className="text-secondary small fw-bold mb-1">كود الوحدة</div>
                          <div className="fw-bold">{selectedAssessment.unitNumber || selectedAssessment.unitCode || "-"}</div>
                        </Col>
                        <Col md={3} sm={6} className="mb-2">
                          <div className="text-secondary small fw-bold mb-1">السنة الضريبية</div>
                          <div className="fw-bold">{selectedAssessment.taxYear || "-"}</div>
                        </Col>
                        <Col md={3} sm={6} className="mb-2">
                          <div className="text-secondary small fw-bold mb-1">الضريبة السنوية</div>
                          <div className="fw-bold text-danger fs-5">
                            {selectedAssessment.annualTax != null ? `${selectedAssessment.annualTax} ج.م` : "-"}
                          </div>
                        </Col>
                        {selectedAssessment.propertyAddress && (
                          <Col md={12} className="mt-1">
                            <div className="text-secondary small fw-bold mb-1">عنوان العقار</div>
                            {/* ★ داتا ديناميكية */}
                            <div className="fw-bold"><DynText text={selectedAssessment.propertyAddress} lang={lang} /></div>
                          </Col>
                        )}
                        {selectedAssessment.annualRentalValue != null && (
                          <Col md={3} sm={6} className="mt-2">
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
                        <Form.Label className="text-primary fw-bold">تاريخ تقديم الطعن</Form.Label>
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
                        <Form.Label className="text-primary fw-bold">رفع المستندات الداعمة</Form.Label>
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
                    <Form.Label className="text-primary fw-bold">
                      تفاصيل وسبب الطعن <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder={
                        selectedAssessment
                          ? "اكتب هنا أسباب الاعتراض على القيمة الضريبية المحسوبة..."
                          : "اختر الربط الضريبي أولاً"
                      }
                      value={formData.appealReason}
                      onChange={(e) => setFormData({ ...formData, appealReason: e.target.value })}
                      required
                      disabled={!selectedAssessment}
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-between gap-3 mt-4">
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
                      {submitting
                        ? <><Spinner size="sm" animation="border" className="me-2" />جاري التسجيل...</>
                        : "تسجيل الطعن"
                      }
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