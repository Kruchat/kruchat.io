const STORAGE_KEY = 'teacherDevelopment';

function loadEntries() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
        console.error('Error loading entries', e);
        return [];
    }
}

function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function renderTable() {
    const tbody = document.querySelector('#developmentTable tbody');
    tbody.innerHTML = '';
    const entries = loadEntries();
    entries.forEach((entry, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${entry.date}</td>
            <td>${entry.activity}</td>
            <td>${entry.hours}</td>
            <td>${entry.note || ''}</td>
            <td><button class="btn btn-xs btn-error" data-index="${index}">ลบ</button></td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('developmentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const date = document.getElementById('devDate').value;
    const activity = document.getElementById('devActivity').value.trim();
    const hours = document.getElementById('devHours').value;
    const note = document.getElementById('devNote').value.trim();

    if (!date || !activity || hours === '') {
        return;
    }

    const entries = loadEntries();
    entries.push({ date, activity, hours: parseFloat(hours), note });
    saveEntries(entries);
    this.reset();
    renderTable();
});

// handle delete
const tableBody = document.querySelector('#developmentTable tbody');
tableBody.addEventListener('click', function(e) {
    if (e.target.matches('button[data-index]')) {
        const index = parseInt(e.target.getAttribute('data-index'), 10);
        const entries = loadEntries();
        entries.splice(index, 1);
        saveEntries(entries);
        renderTable();
    }
});

renderTable();
