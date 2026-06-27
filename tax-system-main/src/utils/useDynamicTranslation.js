// src/utils/useDynamicTranslation.js
import { useState, useEffect } from 'react';

// كاش صغير عشان مش نعمل طلب إنترنت لنفس الكلمة مرتين
const translationCache = {};

export const useDynamicTranslation = (text, lang) => {
  const [translatedText, setTranslatedText] = useState(text);

  useEffect(() => {
    // لو مفيش نص، أو اللغة عربي، رجّع النص الأصلي فوراً
    if (!text || typeof text !== 'string' || lang === 'ar') {
      setTranslatedText(text);
      return;
    }

    // مفتاح الكاش (مثال: "en_أحمد محمد")
    const cacheKey = `${lang}_${text}`;

    // لو الكلمة مترجمة قبل كده، جيبها من الكاش (سرعة خارقة)
    if (translationCache[cacheKey]) {
      setTranslatedText(translationCache[cacheKey]);
      return;
    }

    let isCancelled = false;

    // استدعاء خدمة الترجمة المجانية
    const translate = async () => {
      try {
        const response = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ar|${lang}`
        );
        const data = await response.json();

        if (!isCancelled && data.responseStatus === 200) {
          const result = data.responseData.translatedText;
          translationCache[cacheKey] = result; // احفظها في الكاش
          setTranslatedText(result);
        }
      } catch (error) {
        if (!isCancelled) setTranslatedText(text); // لو النت فصل، اطبع الأصل
      }
    };

    translate();

    // تنظيف إذا المكون اتحذف قبل ما الترجمة تيجي
    return () => { isCancelled = true; };
  }, [text, lang]);

  return translatedText;
};