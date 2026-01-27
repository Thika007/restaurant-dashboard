# Danu Dashboard v2.0 - Setup Instructions

Welcome to the Danu Dashboard! Follow these steps to set up the system on your environment.

## 1. Prerequisites
- **Node.js**: Install Node.js (version 16 or higher) from [nodejs.org](https://nodejs.org/).
- **Database**: Ensure you have access to the MSSQL Database.

---

## 2. Backend Setup
1. Open the `backend` folder in a terminal.
2. Run the following command to install dependencies:
   ```bash
   npm install
   ```
3. Update Database Credentials:
   - Open `backend/src/config/db.js`.
   - Update `server`, `database`, `user`, and `password` with your SQL server details.
4. Start the Backend Server:
   ```bash
   npm start
   ```
   *Note: The server will run on `http://localhost:5000`.*

---

## 3. Frontend Setup
The frontend is already built and located in the `frontend` folder.

1. Configure Connection:
   - Open `frontend/connection.txt`.
   - Update the `URL=` to point to your backend API. 
   - *Example (Local):* `URL=http://localhost:5000/api`
   - *Example (LAN):* `URL=http://192.168.1.100:5000/api` (Replace with Server IP)
   - Update `REFRESH=` to your desired refresh rate in milliseconds.
2. Hosting:
   - You can serve the `frontend` folder using any static web server (like Nginx, IIS, or a simple Node server).

---

## 4. Support
Developed by **RR Theekshana**.
© 2026 RR Theekshana. All rights reserved.

---

# පිහිටුවීමේ උපදෙස් (Sinhala)

## 1. පූර්ව අවශ්‍යතා
- **Node.js**: [nodejs.org](https://nodejs.org/) වෙතින් Node.js (version 16 හෝ ඉහළ) ස්ථාපනය කරන්න.
- **Database**: MSSQL Database එක සූදානම් කර තබා ගන්න.

## 2. Backend සැකසීම
1. Terminal එකක් මගින් `backend` folder එක විවෘත කරන්න.
2. මෙම කේතය ක්‍රියාත්මක කරන්න: `npm install`
3. දත්ත සමුදාය (Database) විස්තර යාවත්කාලීන කරන්න:
   - `backend/src/config/db.js` ගොනුව විවෘත කර ඔබේ SQL server විස්තර ඇතුළත් කරන්න.
4. Backend එක ආරම්භ කරන්න: `npm start`

## 3. Frontend සැකසීම
1. `frontend/connection.txt` ගොනුව විවෘත කර API URL එක සහ Refresh කාලය අවශ්‍ය පරිදි වෙනස් කරන්න.
2. `frontend` folder එක ඕනෑම static web server එකක් හරහා host කරන්න.

---
© 2026 RR Theekshana. සියලුම හිමිකම් ඇවිරිණි.
