const readStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

const writeStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const getAppealsStorageKey = () => {
  const taxAppeals = readStorage('tax_appeals');
  return taxAppeals.length > 0 ? 'tax_appeals' : 'appeals';
};

export const getAppeals = () => {
  return new Promise((resolve) => {
    const taxAppeals = readStorage('tax_appeals');
    const appeals = readStorage('appeals');
    setTimeout(() => resolve(taxAppeals.length > 0 ? taxAppeals : appeals), 300);
  });
};

export const committeeDecision = (appealId, decisionData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const storageKey = getAppealsStorageKey();
      const appeals = readStorage(storageKey);
      const appealIndex = appeals.findIndex((item) => String(item.id) === String(appealId));

      if (appealIndex === -1) {
        reject({ success: false, message: 'الطعن غير موجود' });
        return;
      }

      appeals[appealIndex] = {
        ...appeals[appealIndex],
        status: 'Pending_Manager_Appeal',
        verdict: decisionData.verdict,
        committeeNote: decisionData.note,
        reviewDate: new Date().toISOString(),
        proposedTax: decisionData.verdict === 'Accept' ? Number(decisionData.newTaxAmount || 0) : undefined
      };

      writeStorage(storageKey, appeals);
      resolve({ success: true, message: 'تم إحالة قرار اللجنة للمدير للاعتماد النهائي' });
    }, 500);
  });
};

export const committeeExemptionDecision = (exemptionId, decisionData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const exemptions = readStorage('exemptions');
      const exemptionIndex = exemptions.findIndex((item) => String(item.id) === String(exemptionId));

      if (exemptionIndex === -1) {
        reject({ success: false, message: 'طلب الإعفاء غير موجود' });
        return;
      }

      exemptions[exemptionIndex] = {
        ...exemptions[exemptionIndex],
        status: 'Pending_Manager_Exemption',
        committeeVerdict: decisionData.verdict,
        committeeNote: decisionData.note,
        committeeReviewDate: new Date().toISOString()
      };

      writeStorage('exemptions', exemptions);
      resolve({ success: true, message: 'تم إحالة توصية الإعفاء للمدير للاعتماد النهائي' });
    }, 500);
  });
};
