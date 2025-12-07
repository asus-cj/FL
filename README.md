# Excel ID Search Web App

A tiny Node.js + Express app that lets you search records in an Excel (.xlsx) file by ID.

Features
- Upload an Excel file from the browser (saved as `data/data.xlsx` server-side).
- Search for rows by an ID value using a search field.
- Returns matching rows and displays them in a table.

Getting started
1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. Open http://localhost:3000 in your browser.

How to provide data
- Place an Excel file at `data/data.xlsx` (create a `data` directory at the repo root if needed), or
- Upload an Excel (.xlsx) file using the UI (the uploaded file is saved as `data/data.xlsx`).

Notes on format
- The server automatically tries to detect an "ID" column by common header names (ID, idno, identifier, studentId, empId, etc.). If none matches, it uses the first column.
- Comparisons are done on string values (trimmed, case-insensitive).
- The app reads the first sheet of the workbook.

If you want improvements
- Add pagination for very large sheets.
- Add fuzzy/partial matching instead of exact ID match.
- Support multiple file names instead of overwriting `data.xlsx`.
- Add authentication if this will be public-facing.

This is a minimal example meant to be easy to run and extend.