# Danu Dashboard - Deployment Guide

Welcome to the **Danu Dashboard**. This application is a comprehensive restaurant management tool featuring real-time sales tracking, historical analytics, and secure user access.

## Prerequisites

Before setting up the dashboard, ensure you have the following installed:
1.  **Node.js** (v18 or higher recommended)
2.  **Microsoft SQL Server** (MS SQL) with the `RESTDB28` database attached.

---

## 🚀 Setup Instructions

### 1. Backend Configuration
1.  Navigate to the `backend` folder.
2.  Rename `.env.example` to `.env`.
3.  Open the `.env` file and update the database connection details:
    *   `DB_USER`: Your SQL Server username (default: `sa`).
    *   `DB_PASSWORD`: Your SQL Server password.
    *   `DB_SERVER`: Your SQL Server address (default: `localhost`).
    *   `DB_NAME`: The database name (default: `RESTDB28`).
    *   `JWT_SECRET`: A secure random string for authentication.

### 2. Installations
Open your terminal (Command Prompt or PowerShell) and run the following command inside the `backend` folder to install dependencies:
```bash
npm install
```

### 3. Running the Application
To start the dashboard, run:
```bash
npm start
```
The application will start on **port 5000**.

---

## 🌐 Accessing the Dashboard

Once the backend is running, you can access the dashboard by opening your web browser and going to:
**http://localhost:5000**

> [!NOTE]
> This single port (5000) serves both the backend API and the frontend user interface for a simplified experience.

---

## 🔑 Login Information
*   **System Admin**: Use the credentials created during the database setup.
*   **Default Users**: Ensure users are registered in the `user_file` table in your database.

---

## 🛠 Features
- **Real-time Overview**: Track today's revenue, bills, and orders.
- **Historical Analysis**: Filter and analyze past sales data by date range.
- **Multi-language Support**: Switch between English and Sinhala.
- **Responsive Design**: Accessible on both desktop and mobile devices.

---
© 2026 Danu Dashboard. All rights reserved.
