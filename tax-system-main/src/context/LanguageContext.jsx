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
    enter: 'دخول',
    forgotPassword: 'نسيت كلمة المرور؟',
    resetPassword: 'إعادة تعيين كلمة المرور',
    verificationCode: 'رمز التحقق',
    newPassword: 'كلمة المرور الجديدة',
    confirmNewPassword: 'تأكيد كلمة المرور الجديدة',
    sendVerification: 'إرسال رمز التحقق',
    backToLogin: 'العودة لصفحة تسجيل الدخول'
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
    enter: 'Login',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    verificationCode: 'Verification Code',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    sendVerification: 'Send Verification Code',
    backToLogin: 'Back to Login Page'
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
  'قسط مدفوع': 'Paid Installment',
  // --- New Translation Keys ---
  'ربط المالك بالعقار': 'Link Owner to Property',
  'بيانات المالك': 'Owner Details',
  'أدخل الرقم القومي أو ابحث...': 'Enter National ID or search...',
  'مرتبط بـ': 'Currently linked to',
  'وحدة حالياً، سيتم إعادة استخدام بياناته': 'unit(s), their data will be reused',
  'يمكنك اختيار مالك موجود أو تسجيل مالك جديد': 'You can select an existing owner or register a new one',
  'أدخل اسم المالك': 'Enter owner name',
  'أدخل عنوان المالك': 'Enter owner address',
  'انقر على بحث لاختيار العقار...': 'Click search to select property...',
  'تم تحميل': 'Loaded',
  'وحدة — اختر منها أدناه': 'unit(s) — select from below',
  'هذا العقار لا يحتوي على وحدات مسجّلة': 'This property has no registered units',
  'الوحدات والحصص': 'Units and Shares',
  'الوجهة': 'Destination',
  'نوع العلاقة': 'Relationship Type',
  'الحصة %': 'Share %',
  'تاريخ البداية': 'Start Date',
  'تاريخ النهاية': 'End Date',
  'اختر الوحدة...': 'Select unit...',
  'إضافة وحدة أخرى': 'Add Another Unit',
  'توزيع متساوٍ': 'Even Distribution',
  'مجموع الحصص:': 'Total Shares:',
  'تأكيد الربط': 'Confirm Link',
  'اختيار العقار': 'Select Property',
  'بحث...': 'Search...',
  'تعذّر تحميل العقارات': 'Failed to load properties',
  'تعذّر تحميل الوحدات': 'Failed to load units',
  'لا توجد عقارات مطابقة': 'No matching properties',
  'عقار #': 'Property #',
  'تم ربط المالك بالوحدة/الوحدات بنجاح ✔': 'Owner successfully linked to unit(s) ✔',
  'يجب إدخال الرقم القومي، الاسم، الهاتف، العنوان، واختيار العقار أولاً': 'National ID, Name, Phone, Address, and Property selection are required',
  'يجب اختيار عقار أولاً': 'Property must be selected first',
  'يجب اختيار الوحدة لكل سطر قبل الربط': 'Please select a unit for each row before linking',
  'لا يمكن تكرار نفس الوحدة في أكثر من سطر': 'Cannot select the same unit in multiple rows',
  'نسبة الحصة لكل وحدة يجب أن تكون بين 0 و 100': 'Share percentage for each unit must be between 0 and 100',
  'يجب إدخال تاريخ البداية لكل وحدة': 'Start date is required for each unit',
  'تاريخ النهاية يجب أن يكون بعد أو يساوي تاريخ البداية': 'End date must be after or equal to start date',
  'نسيت كلمة المرور؟': 'Forgot Password?',
  'نسيت كلمة المرور': 'Forgot Password',
  'إعادة تعيين كلمة المرور': 'Reset Password',
  'أدخل البريد الإلكتروني': 'Enter email address',
  'إرسال رمز التحقق': 'Send Verification Code',
  'تم إرسال رمز التحقق إلى بريدك الإلكتروني': 'Verification code sent to your email',
  'رمز التحقق': 'Verification Code',
  'رمز التحقق غير صحيح': 'Invalid verification code',
  'كلمة المرور الجديدة': 'New Password',
  'تأكيد كلمة المرور الجديدة': 'Confirm New Password',
  'تغيير كلمة المرور': 'Change Password',
  'تم تغيير كلمة المرور بنجاح! جاري التوجيه لصفحة الدخول...': 'Password changed successfully! Redirecting to login...',
  'البريد الإلكتروني غير مسجل في النظام': 'Email is not registered in the system',
  'كلمتا المرور غير متطابقتين': 'Passwords do not match',
  'العودة لصفحة تسجيل الدخول': 'Back to Login Page',
  'الرجاء إدخال الرقم القومي': 'Please enter National ID',
  'الرجاء البحث عن الممول بالرقم القومي أولًا': 'Please search for taxpayer by National ID first',
  'الرجاء البحث عن المالك بالرقم القومي أولًا': 'Please search for owner by National ID first',
  'الرجاء اختيار الوحدة': 'Please select a unit',
  'الرجاء إدخال المبلغ المتنازع عليه': 'Please enter the disputed amount',
  'الرجاء إدخال سبب الطعن': 'Please enter the reason for appeal',
  'تم حفظ طلب الطعن بنجاح': 'Appeal request saved successfully',
  'تم تسجيل العقار وربط بياناته بنجاح! رقم العقار:': 'Property successfully registered and linked! Property ID:',
  'تم العثور على المالك بنجاح': 'Owner found successfully',
  'لم يتم العثور على المالك': 'Owner not found',
  'طلب إعفاء جديد': 'New Exemption Request',
  'الرجاء إدخال تاريخ الإعفاء': 'Please enter exemption date',
  'الرجاء اختيار نوع الإعفاء': 'Please select exemption type',
  'تم حفظ طلب الإعفاء بنجاح': 'Exemption request saved successfully',
  'تسجيل عقار جديد': 'Register New Property',
  'بيانات المبنى والمالك': 'Building and Owner Details',
  'المحافظة': 'Governorate',
  'المركز': 'Center',
  'اسم الشارع': 'Street Name',
  'الحي / المنطقة الضريبية': 'Neighborhood / Tax Zone',
  'سنة البناء': 'Build Year',
  'وصف العقار': 'Property Description',
  'ملكية فردية للعقار بالكامل (فيلا / منزل)': 'Single ownership of the entire property (Villa / House)',
  'سيتم تسجيل العقار كوحدة ضريبية واحدة (لا داعي لتقسيم شقق)': 'The property will be registered as a single tax unit (no need to divide apartments)',
  'سيتم تسجيل العقار كمبنى يحتوي على عدة وحدات (شقق/محلات)': 'The property will be registered as a building containing multiple units (apartments/shops)',
  'الوحدات داخل المبنى': 'Units inside building',
  'كود / رقم الوحدة': 'Unit Code / Number',
  'نوع الوحدة': 'Unit Type',
  'الدور': 'Floor',
  'الاستخدام': 'Usage',
  'متاح': 'Available',
  'إضافة وحدة': 'Add Unit',
  'حفظ العقار': 'Save Property',
  'عقد ملكية / صورة البطاقة': 'Ownership Contract / ID Copy',
  'يمكنك رفع ملف بصيغة PDF أو صورة. الحد الأقصى 5 ميجا.': 'You can upload a PDF or image. Maximum size 5 MB.',
  'الرجاء اختيار قسط للدفع': 'Please select an installment to pay',
  'لا توجد أقساط مستحقة حالياً': 'No installments are currently due',
  'نموذج الدفع': 'Payment Form',
  'رقم الإيصال': 'Receipt Number',
  'طريقة الدفع': 'Payment Method',
  'نقدي': 'Cash',
  'تحويل بنكي': 'Bank Transfer',
  'مبلغ الدفع': 'Payment Amount',
  'تاريخ السداد': 'Payment Date',
  'تأكيد دفع القسط': 'Confirm Installment Payment',
  'إيصال سداد الضريبة': 'Tax Payment Receipt',
  'طباعة الإيصال': 'Print Receipt',
  'العودة للرئيسية': 'Back to Home',
  'أهلاً بك في نظام المساعدة الذكي. كيف أساعدك اليوم؟': 'Welcome to the Smart Assistant system. How can I help you today?',
  'شكراً لسؤالك': 'Thank you for your question',
  'مساعد النظام (': 'System Assistant (',
  'متصل الآن للرد على استفساراتك': 'Online now to answer your questions',
  'اكتب استفسارك هنا...': 'Type your question here...',
  'إرسال': 'Send',
  'هل أنت متأكد من حذف طلب الإعفاء هذا؟': 'Are you sure you want to delete this exemption request?',
  'فشل الحذف': 'Delete failed',
  'هل أنت متأكد من حذف طلب الطعن هذا؟': 'Are you sure you want to delete this appeal request?',
  'تم حذف الطعن بنجاح': 'Appeal deleted successfully',
  'تفضيلات الواجهة': 'Interface Preferences',
  'اختاري شكل وتجربة الاستخدام المناسبة.': 'Choose the layout and experience that suits you.',
  'تفعيل تنبيهات المتصفح عند توفرها.': 'Enable browser notifications when available.',
  'تقليل المسافات لعرض بيانات أكثر.': 'Reduce spacing to show more data.',
  'تبديل ألوان النظام للوضع الليلي.': 'Toggle system colors to dark mode.',
  'النسخ الاحتياطي والتصدير': 'Backup and Export',
  'احتفظي بنسخة كاملة أو صدّري الجداول الأساسية.': 'Keep a full backup or export key tables.',
  'يحتوي على بيانات النظام المحفوظة محليًا.': 'Contains system data saved locally.',
  'إنشاء نسخة': 'Create Backup',
  'تم إرسال توصية اللجنة للمدير': 'Committee recommendation sent to manager',
  'فشلت العملية': 'Operation failed',
  'معلقة للجنة': 'Pending Committee',
  'معروضة على المدير': 'Presented to Manager',
  'إصدار توصية': 'Issue Recommendation',
  'تم الإرسال': 'Sent',
  'توصية لجنة الطعن': 'Appeal Committee Recommendation',
  'اسم المستخدم أو البريد الالكتروني': 'Username or Email'
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

    if (node.nodeValue !== node.lastTranslatedValue) {
      node.originalArabicText = node.nodeValue;
    }

    const original = node.originalArabicText;
    if (!original) return;
    const trimmed = original.trim();
    if (!trimmed) return;

    if (lang === 'ar') {
      if (node.nodeValue !== original) {
        node.nodeValue = original;
      }
      node.lastTranslatedValue = original;
      return;
    }

    const nextValue = translateArabicText(original);
    if (node.nodeValue !== nextValue) {
      node.nodeValue = nextValue;
    }
    node.lastTranslatedValue = nextValue;
  };

  const translateAttribute = (element, attribute) => {
    const lastTranslatedAttr = `data-last-translated-${attribute}`;
    const original = element.getAttribute(attribute);
    if (!original) return;

    if (original !== element.getAttribute(lastTranslatedAttr)) {
      element.setAttribute(`data-original-${attribute}`, original);
    }

    const originalVal = element.getAttribute(`data-original-${attribute}`);
    if (!originalVal) return;

    if (lang === 'ar') {
      if (element.getAttribute(attribute) !== originalVal) {
        element.setAttribute(attribute, originalVal);
      }
      element.setAttribute(lastTranslatedAttr, originalVal);
      return;
    }

    const nextValue = translateArabicText(originalVal);
    if (element.getAttribute(attribute) !== nextValue) {
      element.setAttribute(attribute, nextValue);
    }
    element.setAttribute(lastTranslatedAttr, nextValue);
  };

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
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

    // Dynamically update Bootstrap theme stylesheet
    let bootstrapLink = document.getElementById('bootstrap-theme');
    if (!bootstrapLink) {
      bootstrapLink = document.createElement('link');
      bootstrapLink.id = 'bootstrap-theme';
      bootstrapLink.rel = 'stylesheet';
      document.head.insertBefore(bootstrapLink, document.head.firstChild);
    }
    bootstrapLink.href = lang === 'ar' ? '/bootstrap.rtl.min.css' : '/bootstrap.min.css';
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
