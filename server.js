const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure data folder exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Multer storage: always save uploaded file as data/data.xlsx (overwrite)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dataDir);
  },
  filename: function (req, file, cb) {
    // Keep uploaded name but also set a predictable file name for search
    cb(null, 'data.xlsx');
  }
});
const upload = multer({ storage });

// Upload endpoint (optional). Upload an .xlsx file from the UI.
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, message: 'No file uploaded' });
  res.json({ ok: true, message: 'File uploaded and saved as data/data.xlsx' });
});

// Utility: read workbook and return array of row objects from the first sheet
function readDataRows(filepath) {
  const workbook = xlsx.readFile(filepath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: null });
  return rows;
}

// Determine the key in row objects that corresponds to an ID column
function findIdKey(sampleRow) {
  const keys = Object.keys(sampleRow);
  const lower = keys.map(k => k.toLowerCase());
  // Common id heuristics
  const candidates = ['id', 'idno', 'id_number', 'identifier', 'studentid', 'empid', 'employeeid', 'code'];
  for (const cand of candidates) {
    const idx = lower.indexOf(cand);
    if (idx >= 0) return keys[idx];
  }
  // fallback: any column with 'id' in name
  for (let i = 0; i < lower.length; i++) {
    if (lower[i].includes('id')) return keys[i];
  }
  // default to first column
  return keys[0];
}

// Search route: GET /search?id=...
app.get('/search', (req, res) => {
  const id = (req.query.id || '').toString().trim();
  if (!id) return res.status(400).json({ ok: false, message: 'Please provide an id query parameter, e.g. /search?id=123' });

  const filepath = path.join(dataDir, 'data.xlsx');
  if (!fs.existsSync(filepath)) {
    return res.status(400).json({ ok: false, message: 'Data file not found. Upload a file via the UI or place data/data.xlsx in the repo.' });
  }

  try {
    const rows = readDataRows(filepath);
    if (!rows || rows.length === 0) {
      return res.json({ ok: true, results: [], message: 'No rows found in the spreadsheet.' });
    }
    const idKey = findIdKey(rows[0]);

    // Compare id as strings (trim, case-insensitive)
    const results = rows.filter(r => {
      const val = r[idKey];
      if (val === null || val === undefined) return false;
      return String(val).trim().toLowerCase() === id.toLowerCase();
    });

    res.json({ ok: true, idKey, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Failed to read or parse Excel file', error: err.message });
  }
});

// Simple health
app.get('/ping', (req, res) => res.send('pong'));

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});