const API_URL = 'http://localhost:5000/api'; 

const saveToStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));
const getFromStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// --- GET ---
export const getExemptions = async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getFromStorage('exemptions')), 300);
  });
};

// --- CREATE (طلب إعفاء) ---
export const createExemption = async (exemptionData, userId) => {
  return new Promise((resolve, reject) => {
    try {
      const exemptions = getFromStorage('exemptions');
      const newExemption = {
        id: Date.now(),
        refNo: `EX-${Date.now()}`,
        ...exemptionData,
        createdBy: userId,
        date: new Date().toISOString(),
        status: 'Pending'
      };
      exemptions.push(newExemption);
      saveToStorage('exemptions', exemptions);
      resolve(newExemption);
    } catch (error) {
      reject(error);
    }
  });
};

// --- UPDATE ---
export const updateExemption = async (id, data) => {
  return new Promise((resolve, reject) => {
    const exemptions = getFromStorage('exemptions');
    const index = exemptions.findIndex(e => e.id == id);
    if (index !== -1) {
      exemptions[index] = { ...exemptions[index], ...data };
      saveToStorage('exemptions', exemptions);
      resolve(exemptions[index]);
    } else {
      reject(new Error('طلب الإعفاء غير موجود'));
    }
  });
};

// --- DELETE ---
export const deleteExemption = async (id) => {
  return new Promise((resolve) => {
    const exemptions = getFromStorage('exemptions');
    const filtered = exemptions.filter(e => e.id != id);
    saveToStorage('exemptions', filtered);
    resolve(true);
  });
};