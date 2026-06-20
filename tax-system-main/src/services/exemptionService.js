const saveToStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const getFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const normalizeExemptionData = (data) => {
  if (data instanceof FormData) {
    const file = data.get('file');

    return {
      personId: data.get('personId') || '',
      propertyId: data.get('propertyId') || '',
      exemptionType: data.get('exemptionType') || '',
      clauseNo: data.get('clauseNo') || '',
      exemptionStartDate: data.get('startDate') || '',
      exemptionEndDate: data.get('endDate') || '',
      fileName: file?.name || ''
    };
  }

  return data || {};
};

export const getExemptions = async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getFromStorage('exemptions')), 300);
  });
};

export const createExemption = async (exemptionData, userId) => {
  return new Promise((resolve, reject) => {
    try {
      const exemptions = getFromStorage('exemptions');
      const normalizedData = normalizeExemptionData(exemptionData);
      const now = Date.now();

      const newExemption = {
        id: now,
        refNo: `EX-${now}`,
        ...normalizedData,
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

export const updateExemption = async (id, data) => {
  return new Promise((resolve, reject) => {
    const exemptions = getFromStorage('exemptions');
    const index = exemptions.findIndex((item) => String(item.id) === String(id));

    if (index === -1) {
      reject(new Error('طلب الإعفاء غير موجود'));
      return;
    }

    exemptions[index] = { ...exemptions[index], ...data };
    saveToStorage('exemptions', exemptions);
    resolve(exemptions[index]);
  });
};

export const updateExemptionStatus = async (id, status, note = '') => {
  return updateExemption(id, {
    status,
    managerNote: note,
    managerDecisionDate: new Date().toISOString()
  });
};

export const deleteExemption = async (id) => {
  return new Promise((resolve) => {
    const exemptions = getFromStorage('exemptions');
    const filtered = exemptions.filter((item) => String(item.id) !== String(id));
    saveToStorage('exemptions', filtered);
    resolve(true);
  });
};
