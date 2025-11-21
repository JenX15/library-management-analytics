// js/ui.js

function populateFilters() {
  const genreEl = document.getElementById('filterGenre');
  const authorEl = document.getElementById('filterAuthor');
  if (!genreEl || !authorEl) return;

  const genres = Array.from(new Set(window.LIB.books.map(b => b.genre))).sort();
  const authors = Array.from(new Set(window.LIB.books.map(b => b.author))).sort();

  genres.forEach(g => {
    const o = document.createElement('option');
    o.value = g;
    o.textContent = g;
    genreEl.appendChild(o);
  });
  
  authors.forEach(a => {
    const o = document.createElement('option');
    o.value = a;
    o.textContent = a;
    authorEl.appendChild(o);
  });
}

function renderTopBooksChart(chartInstance = null) {
  const data = getMostBorrowed(10);
  const labels = data.map(d => d.title);
  const counts = data.map(d => d.count);

  return renderBarChart('topBooksChart', labels, counts, chartInstance);
}

function renderRecentRecords() {
  const container = document.getElementById('recentRecords');
  if (!container) return;
  const recs = getRecentRecords();
  container.innerHTML = buildRecordsTableHTML(recs);
}

function renderOverdueTable() {
  const container = document.getElementById('overdueTable');
  if (!container) return;
  const over = getOverdueRecords();
  container.innerHTML = buildOverdueTableHTML(over);
}

function buildRecordsTableHTML(records) {
  if (!records.length) return '<p style="color: #666; text-align: center; padding: 20px;">No records found.</p>';
  
  const rows = records.map(r => {
    const book = window.LIB.books.find(b => b.id === r.book_id) || {};
    const borrower = window.LIB.borrowers.find(b => b.id === r.borrower_id) || {};
    const overdueStatus = isOverdue(r) ? '<strong style="color:#000; background:#f5f5f5; padding:4px 8px; border-radius:4px; font-size:0.85rem;">OVERDUE</strong>' : '';
    
    return `<tr>
      <td>${r.id}</td>
      <td><strong>${book.title || 'Unknown'}</strong></td>
      <td>${borrower.name || 'Unknown'}</td>
      <td>${r.issue_date}</td>
      <td>${r.due_date}</td>
      <td>${r.return_date || '—'}</td>
      <td>${overdueStatus}</td>
    </tr>`;
  }).join('');
  
  return `<div style="overflow-x: auto;">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Book</th>
          <th>Borrower</th>
          <th>Issue Date</th>
          <th>Due Date</th>
          <th>Return Date</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

function buildOverdueTableHTML(records) {
  if (!records.length) return '<p style="color: #666; text-align: center; padding: 20px;">✓ No overdue books. Great job!</p>';
  
  const rows = records.map(r => {
    const book = window.LIB.books.find(b => b.id === r.book_id) || {};
    const borrower = window.LIB.borrowers.find(b => b.id === r.borrower_id) || {};
    const daysOverdue = Math.floor((new Date() - new Date(r.due_date)) / (1000 * 60 * 60 * 24));
    
    return `<tr>
      <td>${r.id}</td>
      <td><strong>${book.title || 'Unknown'}</strong></td>
      <td>${borrower.name || 'Unknown'}</td>
      <td>${r.issue_date}</td>
      <td>${r.due_date}</td>
      <td style="color: #666;">${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}</td>
      <td><button onclick="returnBook(${r.id}); renderOverdueTable();">Mark Returned</button></td>
    </tr>`;
  }).join('');
  
  return `<div style="overflow-x: auto;">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Book</th>
          <th>Borrower</th>
          <th>Issue Date</th>
          <th>Due Date</th>
          <th>Days Overdue</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

// Search handler (books and borrowers)
function bindSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;
  
  input.addEventListener('input', (e) => {
    const q = (e.target.value || '').toLowerCase().trim();
    
    if (!q) {
      const container = document.getElementById('searchResults');
      if (container) container.innerHTML = '';
      return;
    }
    
    const matches = [];

    // Search books
    window.LIB.books.forEach(b => {
      if (b.title.toLowerCase().includes(q) || (b.author && b.author.toLowerCase().includes(q))) {
        matches.push({ 
          type: 'book', 
          display: `<strong>${b.title}</strong> — ${b.author}`,
          relevance: b.title.toLowerCase().includes(q) ? 2 : 1
        });
      }
    });

    // Search borrowers
    window.LIB.borrowers.forEach(b => {
      if (b.name.toLowerCase().includes(q)) {
        matches.push({ 
          type: 'borrower', 
          display: `Borrower: <strong>${b.name}</strong>`,
          relevance: 1
        });
      }
    });

    // Sort by relevance
    matches.sort((a, b) => b.relevance - a.relevance);

    const container = document.getElementById('searchResults');
    if (!container) return;
    
    container.innerHTML = matches.length 
      ? `<ul>${matches.map(m => `<li>${m.display}</li>`).join('')}</ul>` 
      : '<p style="color: #666; padding: 12px;">No matches found</p>';
  });
}

function bindBorrowerSearch() {
  const input = document.getElementById('borrowerSearch');
  if (!input) return;
  
  input.addEventListener('input', (e) => {
    const q = (e.target.value || '').toLowerCase().trim();
    const list = q 
      ? window.LIB.borrowers.filter(b => b.name.toLowerCase().includes(q))
      : window.LIB.borrowers;
    
    const container = document.getElementById('borrowerList');
    if (!container) return;
    
    container.innerHTML = list.length
      ? list.map(b => `<div><button onclick="selectBorrower(${b.id})">${b.name}</button></div>`).join('')
      : '<p style="color: #666; padding: 12px;">No borrowers found</p>';
  });
}

function selectBorrower(borrowerId) {
  const hist = window.LIB.records
    .filter(r => r.borrower_id === borrowerId)
    .sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date));
  
  const borrower = window.LIB.borrowers.find(b => b.id === borrowerId);
  const borrowerName = borrower ? borrower.name : 'Unknown';
  
  const container = document.getElementById('borrowerHistory');
  if (!container) return;
  
  container.innerHTML = hist.length
    ? `<p style="margin-bottom: 16px; color: #666;">Showing ${hist.length} record${hist.length !== 1 ? 's' : ''} for <strong>${borrowerName}</strong></p>` + buildRecordsTableHTML(hist)
    : `<p style="color: #666; padding: 12px;">No borrowing history for ${borrowerName}</p>`;
}

// Called on initial load for each page
async function initUI() {
  try {
    await loadData();
  } catch (e) {
    console.error('Failed to load data', e);
    alert('Error loading library data. Please check the console.');
    return;
  }

  populateFilters();
  bindSearch();
  bindBorrowerSearch();

  // Render whichever pieces exist in the page
  renderTopBooksChart();
  renderRecentRecords();
  renderOverdueTable();
}

// Expose functions to global scope
window.selectBorrower = selectBorrower;
window.initUI = initUI;
window.returnBook = returnBook;
window.renderOverdueTable = renderOverdueTable;