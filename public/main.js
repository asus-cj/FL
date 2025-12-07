// UI logic for uploading and searching
document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('uploadForm');
  const fileInput = document.getElementById('fileInput');
  const uploadStatus = document.getElementById('uploadStatus');
  const searchBtn = document.getElementById('searchBtn');
  const idInput = document.getElementById('idInput');
  const resultsDiv = document.getElementById('results');

  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!fileInput.files || fileInput.files.length === 0) {
      uploadStatus.textContent = 'Select a file first';
      return;
    }
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    uploadStatus.textContent = 'Uploading...';
    try {
      const res = await fetch('/upload', { method: 'POST', body: formData });
      const json = await res.json();
      if (json.ok) {
        uploadStatus.textContent = 'Uploaded successfully.';
      } else {
        uploadStatus.textContent = 'Upload failed: ' + (json.message || JSON.stringify(json));
      }
    } catch (err) {
      uploadStatus.textContent = 'Upload error: ' + err.message;
    }
  });

  searchBtn.addEventListener('click', async () => {
    const id = idInput.value.trim();
    resultsDiv.innerHTML = '';
    if (!id) {
      resultsDiv.textContent = 'Please enter an ID to search.';
      return;
    }
    resultsDiv.textContent = 'Searching...';
    try {
      const res = await fetch('/search?id=' + encodeURIComponent(id));
      const json = await res.json();
      if (!json.ok) {
        resultsDiv.textContent = 'Error: ' + (json.message || JSON.stringify(json));
        return;
      }
      const results = json.results || [];
      if (results.length === 0) {
        resultsDiv.textContent = 'No matching records found.';
        return;
      }
      // Build table
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tbody = document.createElement('tbody');

      // headers from keys of first row
      const keys = Object.keys(results[0]);
      const trh = document.createElement('tr');
      keys.forEach(k => {
        const th = document.createElement('th');
        th.textContent = k;
        trh.appendChild(th);
      });
      thead.appendChild(trh);

      results.forEach(row => {
        const tr = document.createElement('tr');
        keys.forEach(k => {
          const td = document.createElement('td');
          td.textContent = row[k] === null || row[k] === undefined ? '' : row[k];
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });

      table.appendChild(thead);
      table.appendChild(tbody);
      resultsDiv.innerHTML = '';
      resultsDiv.appendChild(table);
    } catch (err) {
      resultsDiv.textContent = 'Search error: ' + err.message;
    }
  });
});