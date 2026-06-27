import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { createExemption } from '../../services/exemptionService';
import { getOwnerByNationalId } from '../../services/assignmentService';
import { useLanguage } from '../../context/LanguageContext'; // <--- جلب اللغة
import { useDynamicTranslation } from '../../utils/useDynamicTranslation'; // <--- الأداة

// ── مكون مساعد لترجمة الداتا ديناميكياً ──
const DynText = ({ text, lang }) => {
  const translated = useDynamicTranslation(text || '', lang);
  return <>{translated || '-'}</>;
};

const INITIAL_FORM = {
  nationalId: '',
  ownerId: '',
  unitId: '',
  unitNumber: '',
  exemptionType: '',
  legalReference: '',
  exemptionDate: new Date().toISOString().split('T')[0],
  exemptionStartDate: '',
  exemptionEndDate: '',
  exemptionReason: '',
  inspectionResult: '',
  notes: '',
  file: null
};

// نصوص مطابقة لـ phraseTranslations
const REQUIRED_FIELDS = [
  { field: 'ownerId', message: 'الرجاء البحث عن المالك بالرقم القومي أولًا' },
  { field: 'unitId', message: 'الرجاء اختيار الوحدة' },
  { field: 'exemptionType', message: 'الرجاء اختيار نوع الإعفاء' },
  { field: 'exemptionDate', message: 'الرجاء إدخال تاريخ الإعفاء' }
];

const AddExemption = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage(); // <--- جلب اللغة الحالية

  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [owner, setOwner] = useState(null);
  const [units, setUnits] = useState([]);

  const [formData, setFormData] = useState(INITIAL_FORM);

  const updateField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // ======================
  // البحث بالرقم القومي
  // ======================
  const handleSearchOwner = async () => {
    // نص مطابق لـ phraseTranslations
    if (!formData.nationalId.trim()) {
      setMessage({ text: 'الرجاء إدخال الرقم القومي', type: 'warning' });
      return;
    }

    setSearchLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const data = await getOwnerByNationalId(formData.nationalId.trim());
      setOwner(data);
      setUnits(data.units || []);
      setFormData((prev) => ({
        ...prev,
        ownerId: data.id,
        unitId: '',
        unitNumber: ''
      }));
      // نص مطابق لـ phraseTranslations
      setMessage({ text: 'تم العثور على المالك بنجاح', type: 'success' });
    } catch (err) {
      setOwner(null);
      setUnits([]);
      setFormData((prev) => ({ ...prev, ownerId: '', unitId: '', unitNumber: '' }));
      // نص مطابق لـ phraseTranslations
      setMessage({ text: err.message || 'لم يتم العثور على المالك', type: 'danger' });
    } finally {
      setSearchLoading(false);
    }
  };

  // ======================
  // اختيار وحدة
  // ======================
  const handleUnitSelect = (unitIdValue) => {
    const selected = units.find((u) => String(u.id) === unitIdValue);
    setFormData((prev) => ({
      ...prev,
      unitId: selected ? selected.id : '',
      unitNumber: selected ? selected.unitNumber : ''
    }));
  };

  // ======================
  // رفع ملف
  // ======================
  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      updateField('file', e.target.files[0]);
    }
  };

  const validate = () => {
    for (const { field, message: msg } of REQUIRED_FIELDS) {
      if (!formData[field]) {
        setMessage({ text: msg, type: 'warning' });
        return false;
      }
    }
    return true;
  };

  // ======================
  // إرسال البيانات
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    if (!validate()) return;

    setLoading(true);
    try {
      await createExemption({
        OwnerId: formData.ownerId,
        UnitId: formData.unitId,
        UnitNumber: formData.unitNumber,
        ExemptionType: formData.exemptionType,
        LegalReference: formData.legalReference,
        ExemptionDate: formData.exemptionDate,
        ExemptionStartDate: formData.exemptionStartDate,
        ExemptionEndDate: formData.exemptionEndDate,
        ExemptionReason: formData.exemptionReason,
        InspectionResult: formData.inspectionResult,
        Notes: formData.notes,
        file: formData.file
      });
      // نص مطابق لـ phraseTranslations
      setMessage({ text: 'تم حفظ طلب الإعفاء بنجاح', type: 'success' });
      setTimeout(() => navigate('/data-entry/home'), 1500);
    } catch (err) {
      // نص مطابق لـ phraseTranslations
      setMessage({ text: err.message || 'حدث خطأ أثناء الحفظ', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="mt-4">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-sm border-0 border-top border-5 border-primary">

            <Card.Header className="bg-primary text-white py-3">
              {/* نص ثابت — مطابق في phraseTranslations */}
              <h5 className="mb-0">طلب إعفاء جديد</h5>
            </Card.Header>

            <Card.Body>
              {message.text && (
                <Alert variant={message.type}>{message.text}</Alert>
              )}

              <Form onSubmit={handleSubmit}>

                {/* ===================== */}
                {/* الرقم القومي */}
                {/* ===================== */}
                <Form.Group className="mb-3">
                  {/* نص ثابت — مطابق في phraseTranslations */}
                  <Form.Label>الرقم القومي</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      value={formData.nationalId}
                      onChange={(e) => updateField('nationalId', e.target.value)}
                    />
                    {/* نص ثابت — مطابق في phraseTranslations */}
                    <Button
                      variant="primary"
                      onClick={handleSearchOwner}
                      disabled={searchLoading}
                    >
                      {searchLoading ? <Spinner size="sm" /> : 'بحث'}
                    </Button>
                  </div>
                </Form.Group>

                {/* ★ اسم المالك — داتا ديناميكية من الداتابيز */}
                {owner && (
                  <Alert variant="info">
                    {/* النص الثابت "اسم المالك:" سيُترجم بالـ Observer */}
                    {/* الاسم نفسه يُترجم بـ DynText */}
                    اسم المالك: <DynText text={owner.fullName} lang={lang} />
                  </Alert>
                )}

                {/* ===================== */}
                {/* الوحدات */}
                {/* ===================== */}
                <Form.Group className="mb-3">
                  {/* نص ثابت — مطابق في phraseTranslations */}
                  <Form.Label>كود الوحدة</Form.Label>

                  <Form.Select
                    value={formData.unitId}
                    onChange={(e) => handleUnitSelect(e.target.value)}
                    disabled={!units.length}
                  >
                    {/* نص ثابت — مطابق في phraseTranslations */}
                    <option value="">اختر الوحدة...</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {/* النصوص الثابتة هنا سيُترجمها الـ Observer */}
                        {/* قيم الداتا الرقمية لا تحتاج ترجمة */}
                        {/* u.usageType لو "سكني"/"تجاري" موجودين في phraseTranslations ويتم ترجمتهم تلقائياً */}
                        كود: {u.unitNumber}
                        | الدور: {u.floor}
                        | المساحة: {u.area} م²
                        | الاستخدام: {u.usageType}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* عرض كود الوحدة المختار */}
                {formData.unitNumber && (
                  <Alert variant="secondary">
                    {/* نص ثابت — سيُضاف لـ phraseTranslations */}
                    كود الوحدة المختار: {formData.unitNumber}
                  </Alert>
                )}

                {/* نوع الإعفاء */}
                <Form.Group className="mb-3">
                  {/* نص ثابت — مطابق في phraseTranslations */}
                  <Form.Label>نوع الإعفاء</Form.Label>
                  <Form.Select
                    value={formData.exemptionType}
                    onChange={(e) => updateField('exemptionType', e.target.value)}
                  >
                    {/* نص ثابت — سيُضاف لـ phraseTranslations */}
                    <option value="">اختر</option>
                    {/* نصوص ثابتة — سيُضاف لـ phraseTranslations */}
                    <option value="PrimaryResidence">سكن أساسي</option>
                    <option value="disability">إعاقة</option>
                    <option value="charity">جمعيات</option>
                  </Form.Select>
                </Form.Group>

                {/* المرجع القانوني */}
                <Form.Group className="mb-3">
                  {/* نص ثابت — سيُضاف لـ phraseTranslations */}
                  <Form.Label>المرجع القانوني</Form.Label>
                  <Form.Control
                    value={formData.legalReference}
                    onChange={(e) => updateField('legalReference', e.target.value)}
                  />
                </Form.Group>

                {/* سبب الإعفاء */}
                <Form.Group className="mb-3">
                  {/* نص ثابت — سيُضاف لـ phraseTranslations */}
                  <Form.Label>سبب الإعفاء</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.exemptionReason}
                    onChange={(e) => updateField('exemptionReason', e.target.value)}
                  />
                </Form.Group>

                {/* التواريخ */}
                <Row>
                  <Col>
                    <Form.Group>
                      {/* نص ثابت — سيُضاف لـ phraseTranslations */}
                      <Form.Label>تاريخ الإعفاء</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.exemptionDate}
                        onChange={(e) => updateField('exemptionDate', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      {/* نص ثابت — سيُضاف لـ phraseTranslations */}
                      <Form.Label>البداية</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.exemptionStartDate}
                        onChange={(e) => updateField('exemptionStartDate', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      {/* نص ثابت — سيُضاف لـ phraseTranslations */}
                      <Form.Label>النهاية</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.exemptionEndDate}
                        onChange={(e) => updateField('exemptionEndDate', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* ملاحظات */}
                <Form.Group className="mt-3">
                  {/* نص ثابت — سيُضاف لـ phraseTranslations */}
                  <Form.Label>ملاحظات</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                  />
                </Form.Group>

                {/* مرفق */}
                <Form.Group className="mt-3">
                  {/* نص ثابت — مطابق في phraseTranslations */}
                  <Form.Label>المرفق</Form.Label>
                  <Form.Control type="file" onChange={handleFileChange} />
                </Form.Group>

                {/* أزرار */}
                <div className="mt-4 d-flex justify-content-between">
                  {/* نص ثابت — مطابق في phraseTranslations */}
                  <Button variant="secondary" onClick={() => navigate(-1)}>
                    إلغاء
                  </Button>
                  {/* نص ثابت — مطابق في phraseTranslations */}
                  <Button type="submit" variant="success" disabled={loading}>
                    {loading ? <Spinner size="sm" /> : 'حفظ'}
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

export default AddExemption;