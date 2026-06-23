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

// 1. جلب الطعون
export const getAppeals = async () => {
  return new Promise(resolve => setTimeout(() => resolve(getStorage('appeals')), 300));
};

// 2. إضافة طعن (البيانات تجي من الفورم الجديد مباشرة)
export const createAppeal = async (appealData, userId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const appeals = getStorage('appeals');
        
        const newAppeal = {
          id: Date.now(),
          refNo: `TN-${Date.now()}`,
          ...appealData, // يحتوي على: taxAssessmentId, appealDate, appealReason, status
          createdBy: userId,
          createdAt: new Date().toISOString()
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

// 3. تعديل طعن (يحدث سبب الطعن والتاريخ فقط، لا يغير الربط الضريبي)
export const updateAppeal = async (id, data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const appeals = getStorage('appeals');
      const index = appeals.findIndex(a => a.id == id);

      if (index !== -1) {
        appeals[index] = { 
          ...appeals[index], 
          appealDate: data.appealDate || appeals[index].appealDate,
          appealReason: data.appealReason || appeals[index].appealReason,
          fileName: data.fileName || appeals[index].fileName
        };
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