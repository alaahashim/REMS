import axios from 'axios';
import { getGovernorateById, getCenterById, getStreetById, getNeighborhoodById } from './locationService';

// أدوات مساعدة
const getStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    return [];
  }
};

const setStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// محاكاة تأخير السيرفر
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// 1. دالة جلب الوحدات (لصفحة الـ Dashboard)
// ==========================================
export const getUnits = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const properties = getStorage('properties');
      const units = [];
      properties.forEach(p => {
        if (p.units && Array.isArray(p.units)) {
          const governorateName = getGovernorateById(p.governorateId)?.name || '';
          const centerName = getCenterById(p.centerId)?.name || '';
          const streetName = getStreetById(p.streetId)?.name || '';
          const neighborhoodName = getNeighborhoodById(p.neighborhoodId)?.name || '';

          p.units.forEach(u => {
            units.push({
              ...u,
              propertyId: p.id,
              address: [governorateName, centerName, neighborhoodName, streetName].filter(Boolean).join(' - '),
              ownerName: p.ownerName,
              locationZone: p.locationZone || getNeighborhoodById(p.neighborhoodId)?.zone || 'B'
            });
          });
        }
      });
      resolve(units);
    }, 300);
  });
};

// ==========================================
// 2. جلب العقارات
// ==========================================
export const getProperties = async () => {
  // الوضع المستقبلي: return (await axios.get('http://your-api.com/api/properties')).data;
  return new Promise((resolve) => {
    setTimeout(() => resolve(getStorage('properties')), 300);
  });
};

export const getPropertyById = async (id) => {
  const properties = getStorage('properties');
  return properties.find(p => p.id == id);
};

export const getUnits = async (propertyId) => {
  const res = await axios.get(`${API}/${propertyId}/units`);
  return res.data;
};

// ==========================================
// 4. تعديل عقار
// ==========================================
export const updateProperty = async (id, updatedData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const properties = getStorage('properties');
      const index = properties.findIndex(p => p.id == id);

      if (index !== -1) {
        properties[index] = { ...properties[index], ...updatedData };
        setStorage('properties', properties);
        resolve(properties[index]);
      } else {
        reject(new Error('العقار غير موجود'));
      }
    }, 500);
  });
};

// ==========================================
// 5. حذف عقار
// ==========================================
export const deleteProperty = async (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let properties = getStorage('properties');
      const filtered = properties.filter(p => p.id != id);
      
      if (filtered.length === properties.length) {
        reject(new Error('العقار غير موجود'));
      } else {
        setStorage('properties', filtered);
        resolve(true);
      }
    }, 500);
  });
};

// ==========================================
// 6. دالة مخصصة للمراجعة (Enriched Units)
// ==========================================
export const getEnrichedUnits = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const properties = getStorage('properties');
      const assignments = getStorage('assignments');
      
      const enrichedUnits = [];
      
      properties.forEach(p => {
        if (p.units) {
          const governorateName = getGovernorateById(p.governorateId)?.name || '';
          const centerName = getCenterById(p.centerId)?.name || '';
          const streetName = getStreetById(p.streetId)?.name || '';
          const neighborhoodName = p.neighborhoodName || getNeighborhoodById(p.neighborhoodId)?.name || '';

          p.units.forEach(u => {
            // البحث عن المالكين لهذه الوحدة
            const owners = assignments.filter(a => a.propertyId == p.id);
            
            enrichedUnits.push({
              ...u,
              propertyId: p.id,
              propertyAddress: [governorateName, centerName, neighborhoodName, streetName].filter(Boolean).join(' - '),
              ownerName: owners.length > 0 ? owners[0].name : p.ownerName, // أول مالك
              status: u.status || 'New' // حالة الوحدة (New, Pending, etc)
            });
          });
        }
      });
      resolve(enrichedUnits);
    }, 300);
  });
};

// ==========================================
// 7. تحديث حالة الوحدة (للمدير)
// ==========================================
export const updatePropertyStatus = async (unitId, newStatus) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const properties = getStorage('properties');
        let unitFound = false;

        properties.forEach(property => {
          if (property.units && Array.isArray(property.units)) {
            const index = property.units.findIndex(u => u.id == unitId);
            
            if (index !== -1) {
              property.units[index].status = newStatus;
              property.units[index].lastModified = new Date().toISOString();
              unitFound = true;
            }
          }
        });

        if (unitFound) {
          setStorage('properties', properties);
          resolve({ message: 'تم اعتماد حالة الوحدة بنجاح' });
        } else {
          reject(new Error('الوحدة غير موجودة في أي عقار'));
        }
      } catch (error) {
        reject(error);
      }
    );
  };
export const getPropertiesWithUnits = async () => {
  const res = await axios.get(`${API}/with-units`);
  return res.data;
};

export const updateUnitStatus =
  async (unitId, status) => {

// تحديث بيانات الوحدة داخل جدول العقارات
export const updateUnitData = async (unitId, updates) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const properties = getStorage('properties');
        let unitFound = false;

        properties.forEach(property => {
          if (property.units && Array.isArray(property.units)) {
            const index = property.units.findIndex(u => u.id == unitId);
            if (index !== -1) {
              property.units[index] = {
                ...property.units[index],
                ...updates
              };
              unitFound = true;
            }
          }
        });

        if (!unitFound) return reject(new Error('الوحدة غير موجودة في أي عقار'));

        setStorage('properties', properties);
        resolve({ message: 'تم تحديث بيانات الوحدة بنجاح' });
      } catch (error) {
        reject(error);
      }
    }, 300);
  });
};