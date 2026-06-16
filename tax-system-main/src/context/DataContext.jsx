// --- src/context/DataContext.jsx ---
import React, { createContext, useState, useContext } from 'react'; // 1. أضفنا useContext هنا

// محاكاة بيانات أولية (Data Mock)
const INITIAL_DATA = {
  properties: [],
  assignments: [],
  appeals: [],
  exemptions: []
};

// إنشاء الـ Context
export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  // State لتخزين كل البيانات في مكان واحد
  const [data, setData] = useState(INITIAL_DATA);

  // دالة جلب البيانات (Global Fetch)
  const fetchData = async () => {
    try {
      const properties = JSON.parse(localStorage.getItem('tax_properties')) || [];
      const assignments = JSON.parse(localStorage.getItem('tax_assignments')) || [];
      const appeals = JSON.parse(localStorage.getItem('tax_appeals')) || []; 
      const exemptions = JSON.parse(localStorage.getItem('tax_exemptions')) || [];

      setData({ properties, assignments, appeals, exemptions });
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  };

  // دوال مساعدة للحصول على البيانات
  const getProperties = () => data.properties;
  const getAssignments = () => data.assignments;
  const getAppeals = () => data.appeals;
  const getExemptions = () => data.exemptions;

  // دالة حفظ البيانات في LocalStorage
  const saveData = (newData) => {
    setData(newData);
    localStorage.setItem('tax_data', JSON.stringify(newData));
  };

  return (
    <DataContext.Provider value={{
      ...data,
      fetchData,
      saveData,
      getProperties,
      getAssignments,
      getAppeals,
      getExemptions
    }}>
      {children}
    </DataContext.Provider>
  );
};

// ========================================
// 2. هذه هي الدالة المفقودة (أضفها هنا)
// ========================================
export const useDataContext = () => {
  const context = useContext(DataContext);
  
  if (context === undefined) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  
  return context;
};