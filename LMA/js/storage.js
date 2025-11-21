// js/storage.js
// Load data.json, then overlay any localStorage edits.
// Exposes a simple API to get/set and persist.

const STORAGE_KEY = 'libraryData';

async function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  let persisted = null;
  if (raw) {
    try { 
      persisted = JSON.parse(raw); 
    } catch(e) { 
      console.warn('Failed to parse localStorage data:', e);
      persisted = null; 
    }
  }

  const initial = await fetchInitialData();

  // Merge: persisted fields override initial if present
  let records = [];
  
  // Handle both "records" and "borrow_history" formats
  if (initial.records) {
    records = initial.records;
  } else if (initial.borrow_history) {
    // Convert old format to new format
    records = initial.borrow_history.map((item, index) => ({
      id: index + 1,
      book_id: item.book_id,
      borrower_id: item.borrower_id,
      issue_date: item.issue_date,
      due_date: item.due_date,
      return_date: item.returned ? item.issue_date : null // Simple conversion
    }));
  }

  // If persisted data exists, use it instead
  if (persisted && persisted.records) {
    records = persisted.records;
  }

  const data = {
    books: (persisted && persisted.books) || initial.books || [],
    borrowers: (persisted && persisted.borrowers) || initial.borrowers || [],
    records: records,
    settings: (persisted && persisted.settings) || initial.settings || { default_loan_days: 14 }
  };

  // Store to runtime variable
  window.LIB = data;
  
  console.log('✓ Library data loaded:', {
    books: data.books.length,
    borrowers: data.borrowers.length,
    records: data.records.length
  });
  
  return data;
}

function saveData() {
  if (!window.LIB) return;
  const toSave = {
    books: window.LIB.books,
    borrowers: window.LIB.borrowers,
    records: window.LIB.records,
    settings: window.LIB.settings
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  console.log('✓ Data saved to localStorage');
}

// Helper to create a new record id
function nextRecordId() {
  const ids = window.LIB.records.map(r => r.id || 0);
  return ids.length ? Math.max(...ids) + 1 : 1;
}

// Clear all stored data and reload from data.json
function resetData() {
  localStorage.removeItem(STORAGE_KEY);
  console.log('✓ localStorage cleared');
  window.location.reload();
}