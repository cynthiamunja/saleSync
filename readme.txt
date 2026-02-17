

# 🏥 POS & Inventory Management System

A role-based Point-of-Sale (POS) and Inventory Management System designed to manage products, sales, users, and reporting in a secure and structured way. This system is built with **Node.js**, **Express**, **MongoDB**, and **JWT-based authentication**, supporting full role-based access control and operational reporting.

---

## Features

* **Role-based access control**: Admin, Manager, Cashier.
* **User management**: Admin/Manager can create, update, activate/deactivate, and search users.
* **Product & category management**: Admin/Manager can create/update/deactivate products and categories.
* **Sales tracking**: Cashiers can create sales, and stock is automatically adjusted.
* **Soft deletes**: Users, products, and sales are never permanently deleted.
* **Revenue & profit reporting**: Daily, monthly, yearly, and top-selling products.
* **Export functionality**: PDF and Excel reports.
* **Secure authentication**: JWT tokens with role-based authorization.

---

## Technologies

* Node.js
* Express.js
* MongoDB & Mongoose
* JSON Web Tokens (JWT)
* Bcrypt for password hashing
* PDFKit & ExcelJS for report exports

---

## System Architecture

The system follows a **modular MVC architecture**:

```
src/
├─ controllers/        # Business logic for users, sales, products, etc.
├─ models/             # Mongoose schemas for Users, Products, Sales, Categories
├─ routes/             # API routes for each module
├─ middleware/         # Authorization, authentication, error handling
├─ utils/              # Helper functions (email normalization, password strength, etc.)
└─ config/             # Constants and configuration (JWT secret, DB URI)
```

---

## User & Role Management

### Roles

| Role    | Description                                                                                           |
| ------- | ----------------------------------------------------------------------------------------------------- |
| Admin   | Full control over system and users. Can create any user, manage all modules, view/export all reports. |
| Manager | Partial control. Can manage cashiers, products, categories, and view/export reports.                  |
| Cashier | Limited. Can only create sales and view their own sales history.                                      |

### Key Features

* **Admins**: Create/update any user, assign roles, activate/deactivate users, search users.
* **Managers**: Create/update cashiers, activate/deactivate cashiers, view reports.
* **Cashiers**: View and update own profile, create sales, view personal sales.

---

## Modules

### 1️⃣ User & Authentication Module

**Routes:**

* `/registerCashier` → Register a new cashier (via admin/manager).
* `/adminCreateUser` → Admin-only creation of users.
* `/managerCreateUser` → Manager-only creation (cashiers).
* `/login` → Login for all users.

**Features:**

* JWT authentication with token expiration.
* Password hashing with Bcrypt.
* Profile updates for users, with email & phone uniqueness validation.
* Self-deactivation restricted.

---

### 2️⃣ Categories Module

**Routes:**

* `/createCategory` → Admin/Manager only.
* `/getAllCategories` → Any authorized user.
* `/getOneCategory/:id` → Any authorized user.
* `/updateCategory/:id` → Admin/Manager only.
* `/activateCategory/:id` & `/deactivateCategory/:id` → Admin/Manager only.
* `/searchCategories` → Any authorized user.

**Purpose:**

* Categorize products for easy filtering and reporting.
* Admins/managers control creation, updates, activation.
* Cashiers can only view or search.

---

### 3️⃣ Products Module

**Routes:**

* `/createProduct` → Admin/Manager only.
* `/updateProduct/:id` → Manager.
* `/updateStock/:id` → Manager.
* `/deactivateProduct/:id` & `/activateProduct/:id` → Admin/Manager.
* `/getProducts`, `/getProductById/:id`, `/searchProducts` → All authorized users.

**Features:**

* Products include **name, stock, price, costPrice, category**.
* Admins: full creation and activation control.
* Managers: edit details, update stock.
* Cashiers: view-only for sales purposes.

---

### 4️⃣ Sales Module

**Routes:**

* `/createSale` → Cashiers only.
* `/my-sales` → Cashiers view own sales.
* `/getAllSales`, `/getActiveSales` → Admin/Manager.
* `/deactivateSale/:id` → Admin/Manager (soft delete).

**Features:**

* Sales reduce product stock automatically.
* Admins/Managers can filter by cashier, date, or category.
* Soft delete ensures auditing without data loss.

---

### 5️⃣ Reports Module

**Routes:**

* `/DailyRevenue` → Any authorized user.
* `/monthSalesSummary`, `/MonthlyBreakdown` → Admin/Manager.
* `/ProfitReport` → Admin/Manager.
* `/TopSellingProducts` → Admin/Manager.
* `/getYearlySummary` → Admin/Manager.
* `/SalesByPaymentMethod` → Admin/Manager.
* `/exportSalesToExcel`, `/exportSalesToPDF` → Admin/Manager.

**Purpose:**

* Analyze revenue and profits at daily, monthly, yearly levels.
* Track top-selling products.
* Export data for accounting or management reports.
* Cashiers only see their own sales summaries.

---

## Role Responsibilities Matrix

| Module     | Admin                             | Manager                | Cashier                     |
| ---------- | --------------------------------- | ---------------------- | --------------------------- |
| Users      | Create/Update/Activate/Deactivate | Manage cashiers only   | View self only              |
| Categories | Create/Update/Activate            | Create/Update/Activate | View/Search                 |
| Products   | Create/Activate/Deactivate        | Update/Stock/Edit      | View only                   |
| Sales      | View/Deactivate/Filter            | View/Deactivate/Filter | Create/View Own             |
| Reports    | View all & export                 | View all & export      | Only personal sales summary |

---

## Authorization & Security

* **JWT-based authentication** for all routes.
* Role-based access enforced via `authorize([roles])` middleware.
* Users must be active (`isActive = true`) to access the system.
* Passwords hashed with Bcrypt.
* Self-deactivation restricted.
* Admins **can create other admins**; managers cannot create admins.

---

## Database Structure (MongoDB)

* **Users**: `_id, fullName, email, phoneNumber, password, role, isActive, lastLogin`
* **Products**: `_id, name, stockQuantity, price, costPrice, category, isActive`
* **Categories**: `_id, name, description, isActive`
* **Sales**: `_id, receiptNumber, products[{product, quantity, price}], totalAmount, cashier, paymentMethod, isActive, createdAt`
* **Counters**: `_id, month, year, sequence` (for receipt numbers)

---

## Setup & Installation

```bash
# Clone repository
git clone <repo-url>
cd <project-folder>

# Install dependencies
npm install

# Configure environment variables (.env)
PORT=5000
MONGO_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES_IN=1d

# Run server
npm run dev
```

---

## Usage

1. **Register/Login** users.
2. **Admin** can create/manage all users, products, categories, and sales.
3. **Manager** can manage cashiers, update products/categories, and generate reports.
4. **Cashiers** create sales and view their own sales history.
5. Reports can be **exported as PDF or Excel**.

---




