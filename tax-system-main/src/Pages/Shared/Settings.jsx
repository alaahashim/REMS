import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';

const BACKUP_KEYS = [
  'tax_admin_profile',
  'tax_assignments',
  'tax_current_user',
  'tax_notifications',
  'tax_settings',
  'tax_users',
  'tax_lang',
  'users',
  'properties',
  'assignments',
  'appeals',
  'exemptions',
  'tax_properties',
  'tax_units',
  'tax_exemptions',
  'tax_appeals',
  'tax_payments',
  'tax_installments',
  'tax_audit_logs'
];

const EXPORT_TABLES = [
  { key: 'tax_users', label: 'Users' },
  { key: 'users', label: 'Legacy Users' },
  { key: 'properties', label: 'Properties' },
  { key: 'tax_properties', label: 'Tax Properties' },
  { key: 'tax_units', label: 'Units' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'tax_assignments', label: 'Assignments' },
  { key: 'exemptions', label: 'Exemptions' },
  { key: 'tax_exemptions', label: 'Exemptions' },
  { key: 'appeals', label: 'Appeals' },
  { key: 'tax_appeals', label: 'Appeals' },
  { key: 'tax_payments', label: 'Payments' }
];

const readStorageValue = (key) => {
  const value = localStorage.getItem(key);
  if (value === null) return null;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const downloadTextFile = (filename, content, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const escapeCsvCell = (value) => {
  if (value === null || value === undefined) return '';
  const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
};

const arrayToCsv = (rows) => {
  if (!rows.length) return '';
  const headers = Array.from(rows.reduce((set, row) => {
    Object.keys(row || {}).forEach((key) => set.add(key));
    return set;
  }, new Set()));

  return [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => headers.map((header) => escapeCsvCell(row?.[header])).join(','))
  ].join('\n');
};

const SettingsPage = () => {
  const { lang, toggleLanguage, t } = useLanguage();
  const [message, setMessage] = useState('');
  const [preferences, setPreferences] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('tax_settings') || '{}');
    return {
      emailAlerts: saved.emailAlerts ?? true,
      darkMode: saved.darkMode ?? false,
      compactView: saved.compactView ?? false
    };
  });

  useEffect(() => {
    document.body.classList.toggle('dark-mode', preferences.darkMode);
    document.body.classList.toggle('compact-view', preferences.compactView);
    localStorage.setItem('tax_settings', JSON.stringify(preferences));
    window.dispatchEvent(new CustomEvent('tax-settings-changed', { detail: preferences }));
  }, [preferences]);

  const storageSummary = useMemo(() => {
    return BACKUP_KEYS.reduce((summary, key) => {
      const value = readStorageValue(key);
      if (Array.isArray(value)) return { ...summary, records: summary.records + value.length };
      if (value && typeof value === 'object') return { ...summary, records: summary.records + 1 };
      return summary;
    }, { sources: BACKUP_KEYS.length, records: 0 });
  }, []);

  const updatePreference = async (key) => {
    if (key === 'emailAlerts' && !preferences.emailAlerts && 'Notification' in window) {
      try {
        await Notification.requestPermission();
      } catch {
        // Permission prompts can be blocked by the browser; the in-app setting still works.
      }
    }
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
  };

  const handleSave = () => {
    localStorage.setItem('tax_settings', JSON.stringify(preferences));
    setMessage(t('settingsSaved'));
  };

  const handleBackup = () => {
    const backup = {
      app: 'tax-system',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: BACKUP_KEYS.reduce((data, key) => {
        data[key] = readStorageValue(key);
        return data;
      }, {})
    };

    downloadTextFile(
      `tax-system-backup-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(backup, null, 2),
      'application/json;charset=utf-8'
    );
    setMessage(lang === 'ar' ? 'تم إنشاء نسخة احتياطية بنجاح' : 'Backup created successfully');
  };

  const handleExport = () => {
    const sections = EXPORT_TABLES.map(({ key, label }) => {
      const value = readStorageValue(key);
      const rows = Array.isArray(value) ? value : value ? [value] : [];
      return [`# ${label}`, arrayToCsv(rows)].filter(Boolean).join('\n');
    }).filter(Boolean);

    downloadTextFile(
      `tax-system-export-${new Date().toISOString().slice(0, 10)}.csv`,
      sections.join('\n\n'),
      'text/csv;charset=utf-8'
    );
    setMessage(lang === 'ar' ? 'تم تصدير البيانات بنجاح' : 'Data exported successfully');
  };

  return (
    <div className="settings-page p-3 p-md-4">
      <div className="settings-hero mb-4">
        <div>
          <div className="settings-kicker">{lang === 'ar' ? 'مركز التحكم' : 'Control Center'}</div>
          <h3 className="mb-1">{t('settings')}</h3>
          <p className="mb-0 text-muted">
            {lang === 'ar'
              ? 'تحكم في شكل النظام، اللغة، والتنبيهات مع أدوات حفظ وتصدير البيانات.'
              : 'Manage appearance, language, alerts, backup, and exports.'}
          </p>
        </div>
        <Badge bg="light" text="dark" className="settings-status">
          <i className="fa-solid fa-database"></i>
          {storageSummary.records} {lang === 'ar' ? 'سجل محفوظ' : 'saved records'}
        </Badge>
      </div>

      {message && (
        <Alert variant="success" dismissible onClose={() => setMessage('')} className="settings-alert">
          {message}
        </Alert>
      )}

      <Row className="g-3">
        <Col lg={7}>
          <Card className="settings-panel h-100">
            <Card.Body>
              <div className="settings-panel-title">
                <span className="settings-icon"><i className="fa-solid fa-sliders"></i></span>
                <div>
                  <h5>{lang === 'ar' ? 'تفضيلات الواجهة' : 'Interface Preferences'}</h5>
                  <p>{lang === 'ar' ? 'اختاري شكل وتجربة الاستخدام المناسبة.' : 'Choose the display and interaction style.'}</p>
                </div>
              </div>

              <div className="settings-option">
                <div>
                  <strong>{t('emailAlerts')}</strong>
                  <small>{lang === 'ar' ? 'تفعيل تنبيهات المتصفح عند توفرها.' : 'Enable browser alerts when available.'}</small>
                </div>
                <Form.Check type="switch" id="email-alerts" checked={preferences.emailAlerts} onChange={() => updatePreference('emailAlerts')} />
              </div>

              <div className="settings-option">
                <div>
                  <strong>{t('compactView')}</strong>
                  <small>{lang === 'ar' ? 'تقليل المسافات لعرض بيانات أكثر.' : 'Reduce spacing to show more data.'}</small>
                </div>
                <Form.Check type="switch" id="compact-view" checked={preferences.compactView} onChange={() => updatePreference('compactView')} />
              </div>

              <div className="settings-option">
                <div>
                  <strong>{t('darkMode')}</strong>
                  <small>{lang === 'ar' ? 'تبديل ألوان النظام للوضع الليلي.' : 'Switch the system colors to dark mode.'}</small>
                </div>
                <Form.Check type="switch" id="dark-mode" checked={preferences.darkMode} onChange={() => updatePreference('darkMode')} />
              </div>

              <Button className="mt-3" variant="primary" onClick={handleSave}>
                <i className="fa-solid fa-floppy-disk"></i>
                {t('save')}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="settings-panel h-100">
            <Card.Body>
              <div className="settings-panel-title">
                <span className="settings-icon"><i className="fa-solid fa-language"></i></span>
                <div>
                  <h5>{t('language')}</h5>
                  <p>{lang === 'ar' ? 'تغيير اللغة والاتجاه لكل النظام.' : 'Change language and layout direction.'}</p>
                </div>
              </div>

              <div className="language-card">
                <span>{lang === 'ar' ? 'العربية مفعلة الآن' : 'English is active'}</span>
                <Button variant="outline-primary" onClick={() => toggleLanguage()}>
                  <i className="fa-solid fa-globe"></i>
                  {lang === 'ar' ? 'English' : 'العربية'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={12}>
          <Card className="settings-panel settings-data-panel">
            <Card.Body>
              <div className="settings-panel-title">
                <span className="settings-icon"><i className="fa-solid fa-shield-halved"></i></span>
                <div>
                  <h5>{lang === 'ar' ? 'النسخ الاحتياطي والتصدير' : 'Backup & Export'}</h5>
                  <p>{lang === 'ar' ? 'احتفظي بنسخة كاملة أو صدّري الجداول الأساسية.' : 'Keep a full backup or export the main tables.'}</p>
                </div>
              </div>

              <Row className="g-3">
                <Col md={6}>
                  <div className="data-action">
                    <i className="fa-solid fa-box-archive"></i>
                    <div>
                      <h6>{lang === 'ar' ? 'Backup' : 'Backup'}</h6>
                      <p>{lang === 'ar' ? 'تنزيل ملف JSON يحتوي على بيانات النظام المحفوظة محليًا.' : 'Download a JSON file with locally stored system data.'}</p>
                    </div>
                    <Button variant="success" onClick={handleBackup}>
                      <i className="fa-solid fa-download"></i>
                      {lang === 'ar' ? 'إنشاء نسخة' : 'Create Backup'}
                    </Button>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="data-action">
                    <i className="fa-solid fa-file-export"></i>
                    <div>
                      <h6>{lang === 'ar' ? 'Export' : 'Export'}</h6>
                      <p>{lang === 'ar' ? 'تصدير البيانات الأساسية في ملف CSV قابل للفتح في Excel.' : 'Export main data as a CSV file for Excel.'}</p>
                    </div>
                    <Button variant="outline-primary" onClick={handleExport}>
                      <i className="fa-solid fa-file-arrow-down"></i>
                      {lang === 'ar' ? 'تصدير CSV' : 'Export CSV'}
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SettingsPage;
