import api from "./apiClient";

export const getArabicRoleName = (role = "") => {
  const value = String(role || "").trim().toLowerCase();

  if (value.includes("admin") || value.includes("مدير النظام")) return "مدير النظام";
  if ((value.includes("data") && value.includes("entry")) || value.includes("مدخل")) return "مدخل بيانات";
  if (value.includes("review") || value.includes("مراجع")) return "مراجع";
  if (value.includes("finance") || value.includes("مالي")) return "مالي";
  if (value.includes("manager") || value.includes("مأمورية")) return "مدير مأمورية";
  if (value.includes("committee") || value.includes("طعون")) return "لجنة الطعون";

  return role || "موظف";
};

const normalizeEmployee = (employee) => {
  if (!employee) return null;

  const role = employee.department || employee.Department || employee.jobTitle || employee.JobTitle || "User";
  const roleNameArabic =
    employee.roleNameArabic ||
    employee.RoleNameArabic ||
    getArabicRoleName(role);
  const fullName = employee.fullName || employee.FullName || employee.name || employee.username || employee.Username;
  const picturePath = employee.picturePath || employee.PicturePath || "";

  return {
    ...employee,
    id: employee.id || employee.Id,
    employeeCode: employee.employeeCode || employee.EmployeeCode || "",
    name: fullName,
    fullName,
    nationalId: employee.nationalId || employee.NationalId || employee.nationalID || employee.NationalID || "",
    jobTitle: employee.jobTitle || employee.JobTitle || "",
    department: employee.department || employee.Department || "",
    officeId: employee.officeId || employee.OfficeId || "",
    username: employee.username || employee.Username,
    email: employee.email || employee.Email || "",
    phone: employee.phone || employee.Phone || "",
    isActive: employee.isActive ?? employee.IsActive ?? true,
    role,
    roleNameArabic,
    avatar: picturePath ? `http://localhost:5179${picturePath}` : "",
    picturePath,
    createdAt: employee.createdAt || employee.CreatedAt || "",
    createdBy: employee.createdBy || employee.CreatedBy || "",
    createdByName: employee.createdByName || employee.CreatedByName || "Admin",
    updatedBy: employee.updatedBy || employee.UpdatedBy || "",
    updatedByName: employee.updatedByName || employee.UpdatedByName || "Admin",
  };
};

export const loginUser = async (usernameOrNationalId, password) => {
  const response = await api.post("/Account/login", {
    usernameOrNationalId,
    password,
  });

  const token = response.data?.token || response.data?.Token;
  const employee = normalizeEmployee(response.data?.employee || response.data?.Employee);

  if (!token || !employee) {
    throw new Error("Login response did not include a token or employee data.");
  }

  localStorage.setItem("token", token);
  localStorage.setItem("tax_current_user", JSON.stringify(employee));

  return {
    success: true,
    token,
    expiresAt: response.data?.expiresAt || response.data?.ExpiresAt,
    user: employee,
  };
};

export const getCurrentProfile = async () => {
  const response = await api.get("/Account/profile");
  const employee = normalizeEmployee(response.data);

  if (employee) {
    localStorage.setItem("tax_current_user", JSON.stringify(employee));
  }

  return employee;
};

export const getUserById = async (id) => {
  const response = await api.get(`/AdminEmployees/${id}`);
  return normalizeEmployee(response.data);
};

export const updateUserById = async (id, profile) => {
  const response = await api.put(`/AdminEmployees/${id}`, {
    FullName: profile.name,
    NationalId: profile.nationalId,
    JobTitle: profile.jobTitle,
    Department: profile.department || profile.role,
    OfficeId: profile.officeId,
    Email: profile.email,
    Phone: profile.phone,
    PicturePath: profile.picturePath,
  });

  return normalizeEmployee(response.data?.data || response.data?.Data || response.data);
};

export const uploadProfilePicture = async (id, file) => {
  const payload = new FormData();
  payload.append("profilePicture", file);

  const response = await api.put(`/AdminEmployees/${id}/profile-picture`, payload);
  return normalizeEmployee(response.data?.data || response.data?.Data || response.data);
};

export const forgotPassword = async (username) => {
  const response = await api.post("/Account/forgot-password-request", { username });
  return response.data;
};

export const verifyPasswordOtp = async (username, otp) => {
  const response = await api.post("/Account/verify-otp", {
    username,
    otp,
  });
  return response.data;
};

export const resetPassword = async (username, otp, newPassword) => {
  const response = await api.post("/Account/reset-password", {
    username,
    otp,
    newPassword,
  });
  return response.data;
};
