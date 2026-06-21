import React, { createContext, useState, useContext, useEffect } from 'react';

const translations = {
  ar: {
    searchPlaceholder: 'بحث عام...',
    searchByNationalId: 'بحث برقم القومي...',
    searchByProperty: 'بحث بالعقار أو الوحدة...',
    welcome: 'مرحباً بك',
    dashboard: 'الرئيسية',
    addProperty: 'إضافة عقار',
    linkOwner: 'ربط المالك',
    addAppeal: 'تسجيل طعن',
    addExemption: 'تسجيل إعفاءات',
    calcTax: 'حساب وتقدير الضريبة',
    collect: 'تسجيل سداد',
    users: 'إدارة المستخدمين',
    logs: 'سجل النظام',
    verdict: 'قرارات اللجان',
    reports: 'التقارير الإدارية',
    language: 'اللغة',
    logout: 'تسجيل خروج',
    login: 'تسجيل الدخول',
    mainSystem: 'نظام الضرائب العقارية',
    fees: 'رسوم التقديم: 100 ج.م',
    notifications: 'الإشعارات',
    settings: 'الإعدادات',
    profile: 'الملف الشخصي',
    assistant: 'المساعد الذكي',
    noNewNotifications: 'لا توجد إشعارات جديدة حالياً',
    save: 'حفظ',
    cancel: 'إلغاء',
    editProfile: 'تعديل الملف الشخصي',
    back: 'رجوع',
    emailAlerts: 'تنبيهات البريد الإلكتروني',
    compactView: 'عرض مضغوط',
    darkMode: 'الوضع الليلي',
    settingsSaved: 'تم حفظ الإعدادات',
    browserAlerts: 'تنبيهات المتصفح',
    profilePhoto: 'صورة الملف الشخصي',
    changePhoto: 'تغيير الصورة',
    removePhoto: 'حذف الصورة',
    name: 'الاسم',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    usernamePasswordRequired: 'اسم المستخدم وكلمة المرور مطلوبان',
    usernameExists: 'اسم المستخدم موجود بالفعل',
    changesSaved: 'تم حفظ التغييرات بنجاح',
    currentUser: 'مستخدم حالي',
    guest: 'زائر',
    taxSystem: 'نظام الضرائب',
    taxManagementSystem: 'نظام إدارة الضرائب',
    employeeLogin: 'تسجيل دخول الموظفين',
    enter: 'دخول'
  },
  en: {
    searchPlaceholder: 'General search...',
    searchByNationalId: 'Search by National ID...',
    searchByProperty: 'Search by property or unit...',
    welcome: 'Welcome',
    dashboard: 'Dashboard',
    addProperty: 'Add Property',
    linkOwner: 'Link Owner',
    addAppeal: 'Register Appeal',
    addExemption: 'Register Exemption',
    calcTax: 'Calculate Tax',
    collect: 'Collect Payment',
    users: 'Users Management',
    logs: 'System Logs',
    verdict: 'Verdicts',
    reports: 'Administrative Reports',
    language: 'Language',
    logout: 'Logout',
    login: 'Login',
    mainSystem: 'Real Estate Tax System',
    fees: 'Submission Fee: 100 EGP',
    notifications: 'Notifications',
    settings: 'Settings',
    profile: 'Profile',
    assistant: 'Assistant',
    noNewNotifications: 'No new notifications right now',
    save: 'Save',
    cancel: 'Cancel',
    editProfile: 'Edit Profile',
    back: 'Back',
    emailAlerts: 'Email alerts',
    compactView: 'Compact view',
    darkMode: 'Dark mode',
    settingsSaved: 'Settings saved',
    browserAlerts: 'Browser alerts',
    profilePhoto: 'Profile photo',
    changePhoto: 'Change photo',
    removePhoto: 'Remove photo',
    name: 'Name',
    username: 'Username',
    password: 'Password',
    email: 'Email',
    phone: 'Phone Number',
    usernamePasswordRequired: 'Username and password are required',
    usernameExists: 'Username already exists',
    changesSaved: 'Changes saved successfully',
    currentUser: 'Current user',
    guest: 'Guest',
    taxSystem: 'Tax System',
    taxManagementSystem: 'Tax Management System',
    employeeLogin: 'Employee Login',
    enter: 'Login'
  }
};

export const LanguageContext = createContext();

const phraseTranslations = {
  'نظام الضرائب العقارية': 'Real Estate Tax System',
  'تسجيل دخول الموظفين': 'Employee Login',
  'اسم المستخدم': 'Username',
  'كلمة المرور': 'Password',
  'دخول': 'Login',
  'الرئيسية': 'Home',
  'إضافة عقار': 'Add Property',
  'ربط المالك': 'Link Owner',
  'طعن ضريبي': 'Tax Appeal',
  'طلب إعفاء': 'Exemption Request',
  'المهام اليومية': 'Daily Tasks',
  'حساب الضرائب': 'Tax Calculation',
  'التحصيل والسداد': 'Collection and Payment',
  'تسجيل دفع جديد': 'Register New Payment',
  'الاعتمادات النهائية': 'Final Approvals',
  'التقارير المالية': 'Financial Reports',
  'طعون': 'Appeals',
  'إعفاءات': 'Exemptions',
  'لوحة التحكم': 'Dashboard',
  'إدارة المستخدمين': 'User Management',
  'سجلات المراقبة': 'Audit Logs',
  'تسجيل خروج': 'Logout',
  'مستخدم حالي': 'Current user',
  'زائر': 'Guest',
  'نظام الضرائب': 'Tax System',
  'نظام إدارة الضرائب': 'Tax Management System',
  'لوحة التحكم الموحدة (System Dashboard)': 'Unified System Dashboard',
  'نظرة عامة على المباني والوحدات والنشاطات الضريبية': 'Overview of buildings, units, and tax activity',
  'المباني': 'Buildings',
  'الوحدات': 'Units',
  'الإعفاءات': 'Exemptions',
  'الطعون': 'Appeals',
  'آخر العمليات على النظام': 'Latest System Activity',
  'لا توجد سجلات عمليات حديثة.': 'No recent activity logs.',
  'التاريخ والوقت': 'Date and Time',
  'الموظف': 'Employee',
  'المستخدم': 'User',
  'الإجراء': 'Action',
  'الجهة': 'Entity',
  'التفاصيل': 'Details',
  'سجل النظام الشامل': 'Full System Log',
  'الوحدات الضريبية': 'Tax Units',
  'رقم الوحدة': 'Unit Number',
  'نوع الوحدة': 'Unit Type',
  'العنوان': 'Address',
  'المالك': 'Owner',
  'الحالة': 'Status',
  'لا توجد وحدات.': 'No units.',
  'غير معروف': 'Unknown',
  'مدفوع': 'Paid',
  'جديد': 'New',
  'بانتظار المدير': 'Waiting for Manager',
  'نوع الإعفاء': 'Exemption Type',
  'رقم العقار': 'Property Number',
  'تاريخ الطلب': 'Request Date',
  'المرفق': 'Attachment',
  'الإجراءات': 'Actions',
  'لا توجد طلبات.': 'No requests.',
  'قيد المراجعة': 'Under Review',
  'مقبول': 'Accepted',
  'مرفوض': 'Rejected',
  'مغلق': 'Closed',
  'الملاك': 'Owners',
  'الاسم': 'Name',
  'الرقم': 'Number',
  'الصفة': 'Role',
  'التاريخ': 'Date',
  'لا توجد بيانات.': 'No data.',
  'غير محدد': 'Not specified',
  'مالك': 'Owner',
  'مستأجر': 'Tenant',
  'سبب الطعن': 'Appeal Reason',
  'تاريخ التقديم': 'Submission Date',
  'لا توجد طعون.': 'No appeals.',
  'بانتظار الرسم': 'Waiting for Fee',
  'قيد اللجنة': 'In Committee Review',
  'لا يمكن الحذف': 'Cannot delete',
  'حفظ': 'Save',
  'إلغاء': 'Cancel',
  'رجوع': 'Back',
  'الإعدادات': 'Settings',
  'تنبيهات البريد الإلكتروني': 'Email alerts',
  'عرض مضغوط': 'Compact view',
  'الوضع الليلي': 'Dark mode',
  'اللغة': 'Language',
  'تم حفظ الإعدادات': 'Settings saved',
  'الملف الشخصي': 'Profile',
  'صورة الملف الشخصي': 'Profile photo',
  'تغيير الصورة': 'Change photo',
  'حذف الصورة': 'Remove photo',
  'البريد الإلكتروني': 'Email',
  'رقم الهاتف': 'Phone Number',
  'الإشعارات': 'Notifications',
  'لا توجد إشعارات جديدة حالياً': 'No new notifications right now',
  'تمت إضافة مستخدم جديد إلى النظام': 'A new user was added to the system',
  'يوجد طلبات معلقة تحتاج مراجعة': 'There are pending requests that need review',
  'تم تحديث سياسة الإشعارات': 'Notification policy was updated',
  'منذ 5 دقائق': '5 minutes ago',
  'منذ ساعة': '1 hour ago',
  'منذ يوم': '1 day ago',
  'منذ يومين': '2 days ago',
  'غير مصرح لك بالدخول': 'Access Denied',
  'عذراً، ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة.': 'Sorry, you do not have enough permissions to access this page.',
  'العودة للخلف': 'Go Back',
  'جمهورية مصر العربية': 'Arab Republic of Egypt',
  'وزارة المالية - مصلحة الضرائب العقارية': 'Ministry of Finance - Real Estate Tax Authority',
  'نظام تحصيل وتقدير الضرائب': 'Tax Collection and Assessment System',
  'اختيار مواطن / مالك': 'Select Citizen / Owner',
  'ابحث بالاسم أو الرقم القومي...': 'Search by name or national ID...',
  'الرقم القومي': 'National ID',
  'الهاتف': 'Phone',
  'الإيميل': 'Email',
  'النوع': 'Type',
  'اختيار': 'Select',
  'اعتباري': 'Legal Entity',
  'فرد (طبيعي)': 'Individual',
  'لا توجد نتائج مطابقة للبحث.': 'No matching search results.',
  'اختيار وحدة ضريبية': 'Select Tax Unit',
  'ابحث عن الوحدة (العنوان أو الرقم)...': 'Search for a unit (address or number)...',
  'الضريبة التقديرية': 'Estimated Tax',
  'لا توجد نتائج': 'No results',
  'بحث واختيار عقار': 'Search and Select Property',
  'اسم المالك': 'Owner Name',
  'الوحدات': 'Units',
  'المساحة': 'Area',
  'لا توجد عقارات مسجلة': 'No registered properties',
  'جديد': 'New',
  'عرض كل الإشعارات': 'View all notifications',
  'تم إضافة عقار جديد بنجاح': 'A new property was added successfully',
  'تمت الموافقة على طلب إعفاء سابق': 'A previous exemption request was approved',
  'تنبيه النظام: برجاء مراجعة الطلبات المعلقة': 'System alert: please review pending requests',
  'تعديل طلب': 'Edit Request',
  'تعديل طلب ضريبي': 'Edit Tax Request',
  'تعديل طعن ضريبي': 'Edit Tax Appeal',
  'تعديل طلب إعفاء': 'Edit Exemption Request',
  'تحديث': 'Update',
  'رقم قومي المالك': 'Owner National ID',
  'رقم قومي للممول': 'Taxpayer National ID',
  'رقم الوحدة (Unit ID)': 'Unit ID',
  'أدخل الرقم القومي...': 'Enter national ID...',
  'مثال: 1024': 'Example: 1024',
  'المبلغ المتنازع عليه': 'Disputed Amount',
  'اكتب تفاصيل الاعتراض...': 'Write appeal details...',
  'رفع المستندات': 'Upload Documents',
  'محضر / أدلة': 'Report / Evidence',
  'حفظ التعديلات': 'Save Changes',
  'حفظ الطلب': 'Save Request',
  'طلب إعفاء': 'Exemption Request',
  'نوع الإعفاء': 'Exemption Type',
  'اختر نوع الإعفاء...': 'Select exemption type...',
  'الوحدة السكنية الأساسية': 'Primary Residential Unit',
  'إعفاء ذوي الإعاقة': 'Disability Exemption',
  'ملكيات وقفية': 'Endowment Properties',
  'جمعيات خيرية': 'Charities',
  'رقم المادة القانونية': 'Legal Article Number',
  'مثال: مادة 37': 'Example: Article 37',
  'تاريخ بداية الإعفاء': 'Exemption Start Date',
  'تاريخ نهاية الإعفاء': 'Exemption End Date',
  'اتركه فارغاً إذا كان الإعفاء دائم': 'Leave empty if the exemption is permanent',
  'عقد ملكية / صورة البطاقة': 'Ownership Contract / ID Copy',
  'يمكنك رفع ملف بصيغة PDF أو صورة. الحد الأقصى 5 ميجا.': 'You can upload a PDF or image. Maximum size is 5 MB.',
  'ربط المالك / المستأجر': 'Link Owner / Tenant',
  'بيانات الربط': 'Link Data',
  'ابحث واختار العقار من القائمة...': 'Search and select a property from the list...',
  'بحث واختيار': 'Search and Select',
  'اسم المالك': 'Owner Name',
  'اختر الوحدة': 'Select Unit',
  'الدور / رقم الشقة': 'Floor / Apartment Number',
  'نوع العلاقة القانونية': 'Legal Relationship Type',
  'تاريخ بداية العلاقة': 'Relationship Start Date',
  'تاريخ نهاية العلاقة': 'Relationship End Date',
  'تأكيد الربط': 'Confirm Link',
  'إدارة الموظفين': 'Employee Management',
  'إضافة موظف': 'Add Employee',
  'قائمة الموظفين': 'Employee List',
  'تعديل موظف': 'Edit Employee',
  'حفظ التغييرات': 'Save Changes',
  'سجل نظام التدقيق (Audit Logs)': 'Audit Logs',
  'تحديث': 'Refresh',
  'لا توجد سجلات حالياً.': 'No logs currently.',
  'اسم الموظف': 'Employee Name',
  'نوع الإجراء': 'Action Type',
  'الجدول المتأثر': 'Affected Table',
  'تفاصيل العملية': 'Operation Details',
  'مكتب المدير العام': 'General Manager Office',
  'لوحة متابعة تشغيلية مبنية على الملفات والمدفوعات الحالية': 'Operational dashboard based on current files and payments',
  'الاعتمادات': 'Approvals',
  'التقارير': 'Reports',
  'قرارات معلقة': 'Pending Decisions',
  'تحصيل فعلي': 'Actual Collection',
  'أقساط مستحقة': 'Due Installments',
  'طعون وإعفاءات': 'Appeals and Exemptions',
  'ملفات تحتاج قرار': 'Files Needing Decision',
  'فتح قائمة الاعتماد': 'Open Approval List',
  'لا توجد ملفات معلقة حاليًا': 'No pending files currently',
  'الضريبة': 'Tax',
  'ينتظر توقيع': 'Waiting for Signature',
  'آخر عمليات التحصيل': 'Latest Collections',
  'لا توجد مدفوعات مسجلة بعد': 'No payments recorded yet',
  'الإيصال': 'Receipt',
  'المبلغ': 'Amount',
  'إجمالي المستحق': 'Total Due',
  'إجمالي التحصيل': 'Total Collected',
  'المتبقي للتحصيل': 'Remaining to Collect',
  'بانتظار اعتماد المدير': 'Waiting for Manager Approval',
  'نسبة التحصيل': 'Collection Rate',
  'توزيع الضريبة حسب نوع الوحدة': 'Tax Distribution by Unit Type',
  'لا توجد وحدات مسجلة': 'No registered units',
  'أداء الموظفين': 'Employee Performance',
  'تصدير التقرير PDF': 'Export PDF Report',
  'القسم': 'Department',
  'المهام المنجزة': 'Completed Tasks',
  'الدقة': 'Accuracy',
  'تفاصيل': 'Details',
  'ممتاز': 'Excellent',
  'يحتاج متابعة': 'Needs Follow-up',
  'مكتب الاعتمادات والقرارات': 'Approvals and Decisions Office',
  'اعتماد تقديرات الوحدات، قرارات اللجان، وطلبات الإعفاء': 'Approve unit assessments, committee decisions, and exemption requests',
  'تقديرات المراجع': 'Reviewer Assessments',
  'لا توجد ملفات': 'No files',
  'نوع/دور': 'Type/Floor',
  'توقيع': 'Sign',
  'قرارات اللجان': 'Committee Decisions',
  'لا توجد قرارات معلقة': 'No pending decisions',
  'رقم القضية': 'Case Number',
  'قرار اللجنة': 'Committee Decision',
  'الضريبة الأصلية': 'Original Tax',
  'المبلغ المقترح': 'Proposed Amount',
  'اعتماد': 'Approve',
  'طلبات الإعفاء': 'Exemption Requests',
  'لا توجد طلبات إعفاء معلقة': 'No pending exemption requests',
  'رقم الطلب': 'Request Number',
  'تحميل': 'Download',
  'لا يوجد': 'None',
  'قبول': 'Accept',
  'رفض': 'Reject',
  'اعتماد تقدير': 'Approve Assessment',
  'اعتماد قرار لجنة': 'Approve Committee Decision',
  'اعتماد إعفاء': 'Approve Exemption',
  'القرار': 'Decision',
  'قبول الطعن': 'Accept Appeal',
  'رفض الطعن': 'Reject Appeal',
  'ملاحظات اللجنة': 'Committee Notes',
  'رفض التوصية': 'Reject Recommendation',
  'توقيع وتنفيذ': 'Sign and Execute',
  'بيانات الوحدة والمالك': 'Unit and Owner Data',
  'إجمالي الضريبة السنوية': 'Total Annual Tax',
  'الأقساط المستحقة': 'Due Installments',
  'الرجاء اختيار قسط للدفع': 'Please select an installment to pay',
  'تاريخ الاستحقاق': 'Due Date',
  'المبلغ (ج.م)': 'Amount (EGP)',
  'لا توجد أقساط مستحقة حالياً': 'No installments are currently due',
  'نموذج الدفع': 'Payment Form',
  'رقم الإيصال': 'Receipt Number',
  'اكتب رقم الكاشير...': 'Enter cashier number...',
  'طريقة الدفع': 'Payment Method',
  'نقدي': 'Cash',
  'تحويل بنكي': 'Bank Transfer',
  'مبلغ الدفع': 'Payment Amount',
  'تاريخ السداد': 'Payment Date',
  'تأكيد دفع القسط': 'Confirm Installment Payment',
  'إيصال سداد الضريبة': 'Tax Payment Receipt',
  'المبلغ المدفوع': 'Paid Amount',
  'القسط': 'Installment',
  'طباعة الإيصال': 'Print Receipt',
  'العودة للرئيسية': 'Back to Home',
  'ج.م': 'EGP',
  'م²': 'm²',
  'دور': 'Floor',
  'ملف': 'File',
  'قسط مدفوع': 'Paid Installment'
};

const sortedPhraseEntries = Object.entries(phraseTranslations)
  .sort(([first], [second]) => second.length - first.length);

const translateArabicText = (text) => {
  return sortedPhraseEntries.reduce(
    (value, [arabic, english]) => value.split(arabic).join(english),
    text
  );
};

const restoreOriginalText = (node) => {
  if (node.nodeType === Node.TEXT_NODE && node.originalArabicText) {
    node.nodeValue = node.originalArabicText;
  }
};

const translateDomText = (root, lang) => {
  if (!root || typeof Node === 'undefined') return;

  const shouldSkip = (node) => {
    const parent = node.parentElement;
    return !parent || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName);
  };

  const translateTextNode = (node) => {
    if (shouldSkip(node)) return;
    const original = node.originalArabicText || node.nodeValue;
    const trimmed = original.trim();
    if (!trimmed) return;

    if (!node.originalArabicText) node.originalArabicText = original;

    if (lang === 'ar') {
      if (node.nodeValue !== node.originalArabicText) {
        node.nodeValue = node.originalArabicText;
      }
      return;
    }

    const nextValue = translateArabicText(original);
    if (node.nodeValue !== nextValue) {
      node.nodeValue = nextValue;
    }
  };

  const translateAttribute = (element, attribute) => {
    const originalAttribute = `data-original-${attribute}`;
    const original = element.getAttribute(originalAttribute) || element.getAttribute(attribute);
    if (!original) return;

    if (!element.hasAttribute(originalAttribute)) {
      element.setAttribute(originalAttribute, original);
    }

    const nextValue = lang === 'ar' ? element.getAttribute(originalAttribute) : translateArabicText(original);
    if (element.getAttribute(attribute) !== nextValue) {
      element.setAttribute(attribute, nextValue);
    }
  };

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (lang === 'ar') restoreOriginalText(node);
    translateTextNode(node);
    node = walker.nextNode();
  }

  root.querySelectorAll('[placeholder], [title], [aria-label]').forEach((element) => {
    ['placeholder', 'title', 'aria-label'].forEach((attribute) => {
      if (element.hasAttribute(attribute)) {
        translateAttribute(element, attribute);
      }
    });
  });
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    const savedLang = localStorage.getItem('tax_lang');
    return savedLang || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('tax_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const root = document.getElementById('root');
    translateDomText(root, lang);

    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(() => translateDomText(root, lang));
    });

    if (root) {
      observer.observe(root, { childList: true, subtree: true, characterData: true });
    }

    return () => observer.disconnect();
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const t = (key) => translations[lang][key] || translations.en[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, translations, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
