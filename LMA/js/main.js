// js/main.js

// Utility: compare dates (YYYY-MM-DD)
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function isOverdue(record) {
  if (record.return_date) return false;
  return record.due_date < todayISO();
}

// ADD a new book to the library
function addBook(title, author, genre) {
  if (!window.LIB) throw new Error('Data not loaded');
  if (!title || !author || !genre) {
    alert('Please fill in all fields');
    return null;
  }
  
  const newBook = {
    id: nextBookId(),
    title: title.trim(),
    author: author.trim(),
    genre: genre.trim()
  };
  
  window.LIB.books.push(newBook);
  saveData();
  console.log('✓ Book added:', newBook);
  return newBook;
}

// BORROW a book (creates a new record)
function borrowBook(bookId, borrowerId, issueDate = todayISO(), loanDays = null) {
  if (!window.LIB) throw new Error('Data not loaded');
  
  // Check if book exists
  const book = window.LIB.books.find(b => b.id === bookId);
  if (!book) {
    alert('Book not found');
    return null;
  }
  
  // Check if book is already borrowed
  const activeLoan = window.LIB.records.find(r => 
    r.book_id === bookId && r.return_date === null
  );
  if (activeLoan) {
    alert('This book is already borrowed and not yet returned');
    return null;
  }
  
  const loan = loanDays || window.LIB.settings.default_loan_days || 14;
  const newRecord = {
    id: nextRecordId(),
    book_id: bookId,
    borrower_id: borrowerId,
    issue_date: issueDate,
    due_date: addDays(issueDate, loan),
    return_date: null
  };
  
  window.LIB.records.push(newRecord);
  saveData();
  console.log('✓ Book borrowed:', newRecord);
  return newRecord;
}

// RETURN a book (set return_date)
function returnBook(recordId, returnDate = todayISO()) {
  const r = window.LIB.records.find(x => x.id === recordId);
  if (!r) return null;
  r.return_date = returnDate;
  saveData();
  console.log('✓ Book returned:', r);
  return r;
}

// Get overdue records
function getOverdueRecords() {
  return window.LIB.records.filter(isOverdue)
    .map(r => ({ ...r }));
}

// Count most borrowed books
function getMostBorrowed(topN = 10) {
  const counts = {};
  window.LIB.records.forEach(r => {
    counts[r.book_id] = (counts[r.book_id] || 0) + 1;
  });
  const arr = Object.entries(counts).map(([bookId, count]) => {
    const book = window.LIB.books.find(b => b.id === Number(bookId));
    return { book_id: Number(bookId), title: book ? book.title : 'Unknown', count };
  });
  arr.sort((a,b) => b.count - a.count);
  return arr.slice(0, topN);
}

// Recent records (sorted newest first)
function getRecentRecords(limit = 20) {
  return window.LIB.records
    .slice()
    .sort((a,b) => new Date(b.issue_date) - new Date(a.issue_date))
    .slice(0, limit)
    .map(r => ({ ...r }));
}

// Helper to get next book ID
function nextBookId() {
  const ids = window.LIB.books.map(b => b.id || 0);
  return ids.length ? Math.max(...ids) + 1 : 1;
}

// Get available books (not currently borrowed)
function getAvailableBooks() {
  const borrowedBookIds = window.LIB.records
    .filter(r => r.return_date === null)
    .map(r => r.book_id);
  
  return window.LIB.books.filter(b => !borrowedBookIds.includes(b.id));
}