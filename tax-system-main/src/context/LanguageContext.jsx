import React, { createContext, useState, useContext } from 'react';

const translations = {
  ar: {
    searchPlaceholder: 'بحث برقم القومي...',
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
    fees: 'رسوم التقديم: 100 ج.م'
  },
  en: {
    searchPlaceholder: 'Search by National ID...',
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
    fees: 'Submission Fee: 100 EGP'
  }
};

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('ar'); // الافتراضي عربي

  const toggleLanguage = () => {
    setLang(prev => prev === 'ar' ? 'en' : 'ar');
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, translations: translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);