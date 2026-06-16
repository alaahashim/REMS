// import axios from 'axios'; // إذا ستستخدم API لاحقاً

// أدوات مساعدة
const getStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    return [];
  }
};

const setStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// دالة ذكية لجلب اسم المواطن (تحتوي البحث في الربطات أولاً، ثم العقارات)
const findCitizenName = (personId) => {
  // 1. البحث في الربطات (لأنه الأهم)
  const assignments = getStorage('assignments');
  const foundInAssignments = assignments.find(a => a.personId === personId);
  if (foundInAssignments && foundInAssignments.name) {
    return foundInAssignments.name;
  }

  // 2. إذا لم نجد، نبحث في العقارات (Fallback)
  const properties = getStorage('properties');
  for (const prop of properties) {
    if (prop.ownerNationalId === personId) {
      return prop.ownerName;
    }
  }
  return null; // لم يتم العثور
};

// ==========================================
// 1. جلب الطعون
// ==========================================
export const getAppeals = async () => {
  return new Promise(resolve => setTimeout(() => resolve(getStorage('appeals')), 300));
};

// ==========================================
// 2. إضافة طعن (Auto-Fill Name included)
// ==========================================
export const createAppeal = async (appealData, userId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const appeals = getStorage('appeals');
        
        // ✅ البحث عن اسم المواطن تلقائياً باستخدام findCitizenName
        const personName = findCitizenName(appealData.personId);

        const newAppeal = {
          id: Date.now(),
          refNo: `TN-${Date.now()}`,
          ...appealData,
          // ✅ حقول الاسم يتم إضافته تلقائياً
          citizen: personName || appealData.personName, // نستخدم الاسم المجلوب
          createdBy: userId,
          date: new Date().toISOString(),
          status: 'Pending' // حالة افتراضية
        };
        
        appeals.push(newAppeal);
        setStorage('appeals', appeals);
        resolve(newAppeal);
      } catch (error) {
        reject(error);
      }
    }, 500);
  });
};

// ==========================================
// 3. تعديل طعن
// ==========================================
export const updateAppeal = async (id, data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const appeals = getStorage('appeals');
      const index = appeals.findIndex(a => a.id == id);

      if (index !== -1) {
        appeals[index] = { ...appeals[index], ...data };
        setStorage('appeals', appeals);
        resolve(appeals[index]);
      } else {
        reject(new Error('الطعن غير موجود'));
      }
    }, 500);
  });
};

export const deleteAppeal = async (id) => {
  return new Promise((resolve) => {
    const appeals = getStorage('appeals');
    const filtered = appeals.filter(a => a.id != id);
    setStorage('appeals', filtered);
    resolve(true);
  }, 500);
};