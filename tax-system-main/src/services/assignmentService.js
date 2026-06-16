// محاكاة API
const API_URL = 'http://localhost:5000/api'; 

const saveToStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));
const getFromStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// --- GET ---
export const getAssignments = async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getFromStorage('assignments')), 300);
  });
};

// --- CREATE (ربط مالك جديد) ---
export const createAssignment = async (assignmentData) => {
  return new Promise((resolve, reject) => {
    try {
      const assignments = getFromStorage('assignments');
      const newAssignment = {
        id: Date.now(),
        ...assignmentData
      };
      assignments.push(newAssignment);
      saveToStorage('assignments', assignments);
      resolve(newAssignment);
    } catch (error) {
      reject(error);
    }
  });
};

// --- UPDATE (تعديل نسبة الملكية) ---
export const updateAssignment = async (id, data) => {
  return new Promise((resolve, reject) => {
    try {
      const assignments = getFromStorage('assignments');
      const index = assignments.findIndex(a => a.id == id);
      if (index !== -1) {
        assignments[index] = { ...assignments[index], ...data };
        saveToStorage('assignments', assignments);
        resolve(assignments[index]);
      } else {
        reject(new Error('الربط غير موجود'));
      }
    } catch (error) {
      reject(error);
    }
  });
};

// --- DELETE (حذف رابط مالك) ---
export const deleteAssignment = async (id) => {
  return new Promise((resolve) => {
    const assignments = getFromStorage('assignments');
    const filtered = assignments.filter(a => a.id != id);
    saveToStorage('assignments', filtered);
    resolve(true);
  });
};

// ... بقية الكود
export const getAssignmentById = async (personId) => {
  return new Promise((resolve) => {
    const assignments = getFromStorage('assignments');
    // البحث عن الربط الأول لهذا الشخص
    const found = assignments.find(a => a.personId === personId);
    resolve(found || null); // إرجاع كائن المالك أو null
  });
};