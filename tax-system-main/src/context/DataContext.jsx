import React, { createContext, useCallback, useContext, useState } from 'react';
import { getEmployees as fetchEmployeesFromApi, getSystemLogs } from '../services/adminService';

const INITIAL_DATA = {
  properties: [],
  assignments: [],
  appeals: [],
  exemptions: [],
  employees: [],
  auditLogs: [],
};

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(INITIAL_DATA);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);

  const refreshEmployees = useCallback(async (searchQuery = '') => {
    setEmployeesLoading(true);
    try {
      const employees = await fetchEmployeesFromApi(searchQuery);
      const normalizedEmployees = Array.isArray(employees) ? employees : [];
      setData((prevData) => ({ ...prevData, employees: normalizedEmployees }));
      return normalizedEmployees;
    } catch (error) {
      console.error('Error loading employees:', error);
      setData((prevData) => ({ ...prevData, employees: [] }));
      throw error;
    } finally {
      setEmployeesLoading(false);
    }
  }, []);

  const refreshAuditLogs = useCallback(async () => {
    setAuditLogsLoading(true);
    try {
      const auditLogs = await getSystemLogs();
      const normalizedLogs = Array.isArray(auditLogs) ? auditLogs : [];
      setData((prevData) => ({ ...prevData, auditLogs: normalizedLogs }));
      return normalizedLogs;
    } catch (error) {
      console.error('Error loading audit logs:', error);
      setData((prevData) => ({ ...prevData, auditLogs: [] }));
      throw error;
    } finally {
      setAuditLogsLoading(false);
    }
  }, []);

  const refreshAdminData = useCallback(async () => {
    const [employees, auditLogs] = await Promise.all([
      refreshEmployees(),
      refreshAuditLogs(),
    ]);

    return { employees, auditLogs };
  }, [refreshEmployees, refreshAuditLogs]);

  const fetchData = useCallback(async () => {
    try {
      const properties = JSON.parse(localStorage.getItem('tax_properties')) || [];
      const assignments = JSON.parse(localStorage.getItem('tax_assignments')) || [];
      const appeals = JSON.parse(localStorage.getItem('tax_appeals')) || [];
      const exemptions = JSON.parse(localStorage.getItem('tax_exemptions')) || [];

      setData((prevData) => ({
        ...prevData,
        properties,
        assignments,
        appeals,
        exemptions,
      }));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  }, []);

  const getProperties = () => data.properties;
  const getAssignments = () => data.assignments;
  const getAppeals = () => data.appeals;
  const getExemptions = () => data.exemptions;

  const saveData = (newData) => {
    setData((prevData) => ({ ...prevData, ...newData }));
    localStorage.setItem('tax_data', JSON.stringify(newData));
  };

  return (
    <DataContext.Provider value={{
      ...data,
      employeesLoading,
      auditLogsLoading,
      fetchData,
      refreshEmployees,
      refreshAuditLogs,
      refreshAdminData,
      saveData,
      getProperties,
      getAssignments,
      getAppeals,
      getExemptions,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);

  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }

  return context;
};