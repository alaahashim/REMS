<div align="center">

# 🏠 Real Estate Management System (REMS)

### Enterprise Real Estate Tax Management System

A full-stack web application developed to modernize and automate Egypt's Real Estate Tax Administration workflow.

![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?style=for-the-badge&logo=dotnet)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-Web%20API-512BD4?style=for-the-badge&logo=dotnet)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![SQL Server](https://img.shields.io/badge/SQL%20Server-CC2927?style=for-the-badge&logo=microsoftsqlserver)
![Entity Framework](https://img.shields.io/badge/Entity_Framework_Core-5C2D91?style=for-the-badge)

</div>

---

# 📖 Overview

The **Real Estate Management System (REMS)** is an enterprise-level web application that digitizes the complete workflow of the Real Estate Tax Administration.

The system replaces manual processes with a secure, scalable, and role-based platform that manages properties, tax calculations, inspections, exemptions, appeals, payments, and administrative operations.

The project follows modern software engineering principles including **Clean Architecture**, **Repository Pattern**, **Unit of Work**, and **RESTful API Design**.

---

# ✨ Key Features

## 👤 Authentication & Authorization

- JWT Authentication
- ASP.NET Core Identity
- Role-Based Authorization
- Secure Login
- Permission Management

---

## 🏢 Property Management

- Register Properties
- Register Residential Units
- Property Ownership Management
- Owner Linking
- Geographic Location Management
- Property Search & Filtering

---

## 👥 Citizen Management

- National ID Validation
- Owner Information
- Property Ownership History
- Multiple Ownership Support

---

## 💰 Tax Assessment

- Automatic Tax Calculation
- Market Value Evaluation
- Residential & Commercial Tax Rules
- Tax Review Workflow
- Approval Process

---

## 📋 Inspection Management

- Property Inspection
- Inspection Scheduling
- Inspection Reports
- Inspector Assignment

---

## ⚖️ Appeals & Exemptions

- Submit Appeals
- Appeal Review
- Tax Exemption Requests
- Exemption Approval Workflow

---

## 💳 Financial Management

- Installment Plans
- Payment Registration
- Payment Tracking
- Outstanding Balance
- Financial Reports

---

## 📊 Reporting Dashboard

- Statistics
- Tax Reports
- Collection Reports
- Property Reports
- Performance Dashboard

---

# 👨‍💼 User Roles

The system supports multiple user roles:

| Role | Responsibilities |
|------|------------------|
| Administrator | Manage users, permissions, and system settings |
| Data Entry | Register citizens, properties, and ownership |
| Reviewer | Review tax calculations and submitted records |
| Inspector | Perform field inspections |
| Committee Member | Handle appeals and exemptions |
| Finance Officer | Register payments and installments |
| Manager | Monitor reports and overall workflow |

---

# 🏗️ System Architecture

The backend follows **Clean Architecture**.

```
Presentation Layer
        │
        ▼
Application Layer
        │
        ▼
Domain Layer
        │
        ▼
Infrastructure Layer
```

Main Design Patterns:

- Clean Architecture
- Repository Pattern
- Unit of Work
- Dependency Injection
- SOLID Principles

---

# 🛠️ Tech Stack

## Backend

- ASP.NET Core Web API (.NET 9)
- Entity Framework Core
- SQL Server
- ASP.NET Identity
- JWT Authentication
- AutoMapper

## Frontend

- React
- Vite
- Bootstrap
- Axios

## Database

- SQL Server

## Development Tools

- Visual Studio 2022
- Visual Studio Code
- Git
- GitHub
- Postman

---

# 📂 Project Structure

```
REMS
│
├── API
├── Application
├── Domain
├── Infrastructure
├── Frontend
│
└── Database
```

---

# 🔄 System Workflow

```
Citizen Registration
        │
        ▼
Property Registration
        │
        ▼
Ownership Assignment
        │
        ▼
Inspection
        │
        ▼
Tax Calculation
        │
        ▼
Reviewer Approval
        │
        ▼
Payment
        │
        ▼
Reports
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/alaahashim/REMS.git
```

## Backend

```bash
cd Backend

dotnet restore

dotnet ef database update

dotnet run
```

---

## Frontend

```bash
cd Frontend

npm install

npm run dev
```

---

# 🔐 Authentication

The application uses:

- JWT Tokens
- Role-Based Authorization
- Secure Password Hashing
- Identity Framework

---

# 📸 Screenshots

> Screenshots will be added soon.

---

# 📈 Future Improvements

- Email Notifications
- SMS Integration
- GIS Integration
- Digital Signature
- AI-based Property Valuation
- Online Payment Gateway
- Mobile Application

---

# 👩‍💻 Developed By

**Alaa Mohamed**

Backend Software Engineer (.NET)

- ASP.NET Core
- Clean Architecture
- SQL Server
- Entity Framework Core
- React

LinkedIn

GitHub

---

# ⭐ If you found this project useful

Please consider giving it a ⭐ on GitHub.
