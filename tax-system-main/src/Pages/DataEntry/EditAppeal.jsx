import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  Button,
  Card,
  Container,
  Row,
  Col,
  Alert,
  Spinner,
  Badge
} from "react-bootstrap";
import { useLanguage } from "../../context/LanguageContext";
import { useDynamicTranslation } from "../../utils/useDynamicTranslation";
import { getAppealById, updateAppeal } from "../../services/appealService";

// ── مكون مساعد لترجمة الداتا ديناميكياً ──
const DynText = ({ text, lang }) => {
  const translated = useDynamicTranslation(text || '', lang);
  return <>{translated || '-'}</>;
};

const EditAppeal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage]       = useState({ text: "", type: "" });
  const [appeal, setAppeal]         = useState(null);

  const [formData, setFormData] = useState({
    appealDate: "",
    appealReason: "",
    file: null
  });

  useEffect(() => {
    const loadAppeal = async () => {
      try {
        setLoading(true);
        const data = await getAppealById(id);
        setAppeal(data);
        setFormData({
          appealDate:   data.appealDate?.split("T")[0] || "",
          appealReason: data.appealReason || "",
          file: null
        });
      } catch (error) {
        setMessage({ text: error.message || "حدث خطأ أثناء تحميل بيانات الطعن", type: "danger" });
      } finally {
        setLoading(false);
      }
    };
    loadAppeal();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const payload = {
        appealDate:   formData.appealDate,
        appealReason: formData.appealReason.trim()
      };
      const result = await updateAppeal(id, payload);
      setMessage({ text: result?.message || "تم تحديث بيانات الطعن بنجاح", type: "success" });
      setTimeout(() => navigate("/data-entry/home"), 1500);
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

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!appeal) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">تعذر تحميل بيانات الطعن</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-sm border-0 border-top border-5 border-primary">

            {/* Header */}
            <Card.Header className="bg-primary text-white py-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-white-50">تعديل طلب</small>
                  <Card.Title className="mb-0 fs-4 fw-bold">
                    تعديل طعن ضريبي (رقم: {id})
                  </Card.Title>
                </div>
                <Badge bg="warning" text="dark" className="fs-6">تحديث</Badge>
              </div>
            </Card.Header>

            <Card.Body>
              {message.text && (
                <Alert variant={message.type} className="mb-4">{message.text}</Alert>
              )}

              <Form onSubmit={handleSubmit}>

                {/* ===== بيانات الربط الضريبي (قراءة فقط) ===== */}
                <Card className="mb-4 bg-light border-secondary">
                  <Card.Body>
                    <Card.Title className="text-muted mb-3 h6">
                      بيانات الربط الضريبي (لا يمكن تعديلها)
                    </Card.Title>
                    <Row>
                      <Col md={4} sm={6} className="mb-3">
                        <Form.Label className="text-secondary fw-bold small">اسم المالك</Form.Label>
                        {/* داتا ديناميكية — DynText للترجمة */}
                        <div className="form-control-plaintext fw-bold fs-5">
                          <DynText text={appeal.ownerName} lang={lang} />
                        </div>
                      </Col>
                      <Col md={4} sm={6} className="mb-3">
                        <Form.Label className="text-secondary fw-bold small">كود الوحدة</Form.Label>
                        <Form.Control
                          type="text"
                          value={appeal.unitNumber || appeal.unitCode || "-"}
                          readOnly plaintext
                          className="fw-bold fs-5"
                        />
                      </Col>
                      <Col md={4} sm={6} className="mb-3">
                        <Form.Label className="text-secondary fw-bold small">السنة الضريبية</Form.Label>
                        <Form.Control
                          type="text"
                          value={appeal.taxYear || "-"}
                          readOnly plaintext
                          className="fw-bold fs-5"
                        />
                      </Col>
                      <Col md={4} sm={6} className="mb-3">
                        <Form.Label className="text-secondary fw-bold small">الضريبة السنوية</Form.Label>
                        <Form.Control
                          type="text"
                          value={appeal.annualTax != null ? `${appeal.annualTax} ج.م` : "-"}
                          readOnly plaintext
                          className="fw-bold fs-5 text-danger"
                        />
                      </Col>
                      {appeal.annualRentalValue != null && (
                        <Col md={4} sm={6} className="mb-3">
                          <Form.Label className="text-secondary fw-bold small">القيمة الإيجارية السنوية</Form.Label>
                          <Form.Control
                            type="text"
                            value={`${appeal.annualRentalValue} ج.م`}
                            readOnly plaintext
                            className="fw-bold fs-5"
                          />
                        </Col>
                      )}
                      {appeal.propertyAddress && (
                        <Col md={8} className="mb-3">
                          <Form.Label className="text-secondary fw-bold small">عنوان العقار</Form.Label>
                          {/* داتا ديناميكية — DynText للترجمة */}
                          <div className="form-control-plaintext fw-bold">
                            <DynText text={appeal.propertyAddress} lang={lang} />
                          </div>
                        </Col>
                      )}
                    </Row>
                  </Card.Body>
                </Card>

                {/* ===== الحقول القابلة للتعديل ===== */}
                <Row className="mt-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-primary fw-bold">تاريخ تقديم الطعن</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.appealDate}
                        onChange={(e) => setFormData({ ...formData, appealDate: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-primary fw-bold">تحديث المستندات</Form.Label>
                      <Form.Control
                        type="file"
                        onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label className="text-primary fw-bold">
                    سبب الطعن <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={formData.appealReason}
                    onChange={(e) => setFormData({ ...formData, appealReason: e.target.value })}
                    required
                  />
                </Form.Group>

                <div className="d-flex justify-content-between gap-3 mt-5">
                  <Button variant="secondary" size="lg" onClick={() => navigate("/data-entry/home")}>
                    إلغاء
                  </Button>
                  <Button variant="success" type="submit" disabled={submitting} size="lg" className="fw-bold">
                    {submitting
                      ? <Spinner size="sm" animation="border" />
                      : "حفظ التعديلات"}
                  </Button>
                </div>

              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditAppeal;