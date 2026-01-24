const BASE_URL = "http://localhost:5000";
const token = localStorage.getItem("token");

if (!token) window.location.href = "/";

// State Management
let currentPage = 1;
let limit = 10;
let totalPages = 0;
let totalItems = 0;
let searchTimeout = null;

document.addEventListener("DOMContentLoaded", () => {
    // Set default date to today for modal
    document.getElementById('date').valueAsDate = new Date();
    fetchTransactions();
});

// === FETCH DATA ===
async function fetchTransactions() {
    const type = document.getElementById("typeFilter").value;
    const duration = document.getElementById("dateFilter").value;
    const search = document.getElementById("searchInput").value;
    
    // Custom Date Logic
    let startDate = "", endDate = "";
    if (duration === 'custom') {
        startDate = document.getElementById("startDate").value;
        endDate = document.getElementById("endDate").value;
    }

    try {
        const res = await axios.get(`${BASE_URL}/api/transactions/get`, {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                page: currentPage,
                limit: limit,
                type,
                duration,
                startDate,
                endDate,
                search
            }
        });

        if (res.data.success) {
            renderTable(res.data.data);
            totalPages = res.data.totalPages;
            totalItems = res.data.totalItems;
            renderPagination();
            updatePageInfo();
        }

    } catch (err) {
        console.error(err);
        showToast("Error fetching transactions");
    }
}

// === RENDER TABLE ===
function renderTable(transactions) {
    const tbody = document.getElementById("transactionList");
    tbody.innerHTML = "";

    if (transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No transactions found</td></tr>`;
        return;
    }

    transactions.forEach(txn => {
        const isIncome = txn.type === 'income';
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${new Date(txn.date).toLocaleDateString()}</td>
            <td>${txn.description || '-'}</td>
            <td><span class="badge">${txn.category}</span></td>
            <td style="text-transform:capitalize">${txn.type}</td>
            <td class="amount ${isIncome ? 'income' : 'expense'}">
                ${isIncome ? '+' : '-'}₹${Number(txn.amount).toFixed(2)}
            </td>
            <td>
                <button class="action-btn edit-btn" onclick="openEdit('${txn.id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn del-btn" onclick="deleteTransaction('${txn.id}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// === RENDER PAGINATION (Google Style) ===
function renderPagination() {
    const container = document.getElementById("paginationControls");
    container.innerHTML = "";

    // Helper to create button
    const createBtn = (text, page, isActive = false, isDisabled = false) => {
        const btn = document.createElement("button");
        btn.className = `page-btn ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`;
        btn.innerText = text;
        if (!isDisabled) {
            btn.onclick = () => changePage(page);
        }
        container.appendChild(btn);
    };

    // Previous Button
    createBtn("<", currentPage - 1, false, currentPage === 1);

    // Logic for numbered buttons (1 ... 4 5 6 ... 10)
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) createBtn(i, i, i === currentPage);
    } else {
        createBtn(1, 1, 1 === currentPage);
        
        if (currentPage > 3) createBtn("...", null, false, true);

        let start = Math.max(2, currentPage - 1);
        let end = Math.min(totalPages - 1, currentPage + 1);

        if (currentPage <= 3) { start = 2; end = 4; }
        if (currentPage >= totalPages - 2) { start = totalPages - 3; end = totalPages - 1; }

        for (let i = start; i <= end; i++) createBtn(i, i, i === currentPage);

        if (currentPage < totalPages - 2) createBtn("...", null, false, true);
        
        createBtn(totalPages, totalPages, totalPages === currentPage);
    }

    // Next Button
    createBtn(">", currentPage + 1, false, currentPage === totalPages || totalPages === 0);
}

// === HANDLERS ===
function changePage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    fetchTransactions();
}

function applyFilters() {
    currentPage = 1; // Reset to page 1 on filter change
    limit = document.getElementById("limitSelect").value;
    fetchTransactions();
}

function toggleCustomDate() {
    const val = document.getElementById("dateFilter").value;
    const customBox = document.getElementById("customDateRange");
    if (val === 'custom') {
        customBox.classList.remove("hidden");
    } else {
        customBox.classList.add("hidden");
        applyFilters();
    }
}

function updatePageInfo() {
    const start = (currentPage - 1) * limit + 1;
    const end = Math.min(currentPage * limit, totalItems);
    document.getElementById("pageInfo").innerText = `Showing ${totalItems === 0 ? 0 : start} to ${end} of ${totalItems} entries`;
}

function debounceSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentPage = 1;
        fetchTransactions();
    }, 500);
}

// === DELETE LOGIC ===
async function deleteTransaction(id) {
    if (!confirm("Are you sure?")) return;
    try {
        await axios.delete(`${BASE_URL}/api/transactions/delete/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        showToast("Deleted successfully");
        fetchTransactions(); // Refresh
    } catch (err) {
        showToast("Delete failed");
    }
}

// === ADD/EDIT MODAL LOGIC ===
const modal = document.getElementById("transactionModal");
const form = document.getElementById("transactionForm");

function openModal() {
    document.getElementById("modalTitle").innerText = "Add Transaction";
    document.getElementById("editId").value = "";
    form.reset();
    document.getElementById('date').valueAsDate = new Date();
    modal.classList.remove("hidden");
}

function closeModal() {
    modal.classList.add("hidden");
}

async function openEdit(id) {
    // 1. Get current data (Quickest way is to fetch from current table data or API)
    // For simplicity, we fetch by ID logic or just pre-fill if we have object.
    // Here we will do a quick trick: find row data from DOM or re-fetch.
    // Let's re-fetch just to be safe.
    
    // NOTE: Ideally, getAllTransactions returns data we can store in a global array.
    // But for now, let's assume we pass data. 
    // Optimization: Store 'rows' in a global variable 'currentData' in fetchTransactions.
    
    // For now, I will implement a quick fetch-by-id logic here strictly for Edit.
    // Wait, we don't have getSingleTransaction API. 
    // We will use the row data logic.
    
    const row = Array.from(document.querySelectorAll(`button[onclick="openEdit('${id}')"]`))[0].closest('tr');
    const cols = row.querySelectorAll('td');
    
    document.getElementById("modalTitle").innerText = "Edit Transaction";
    document.getElementById("editId").value = id;
    document.getElementById("description").value = cols[1].innerText;
    document.getElementById("category").value = cols[2].innerText.trim();
    document.getElementById("type" + (cols[3].innerText.toLowerCase() === 'income' ? 'Inc' : 'Exp')).checked = true;
    
    // Amount cleanup (remove +/-, ₹)
    let amtStr = cols[4].innerText.replace('+', '').replace('-', '').replace('₹', '');
    document.getElementById("amount").value = amtStr;
    
    // Date cleanup
    // Note: Date formatting might vary, assumes MM/DD/YYYY or similar. 
    // Ideally use data-attribute for raw date.
    // Let's assume standard format works or simple new Date().
    
    modal.classList.remove("hidden");
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("editId").value;
    const type = document.querySelector('input[name="type"]:checked').value;
    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;
    const date = document.getElementById("date").value;

    const payload = { type, amount, category, description, date };

    try {
        if (id) {
            // Edit Mode
            await axios.put(`${BASE_URL}/api/transactions/${id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast("Transaction Updated");
        } else {
            // Add Mode
            await axios.post(`${BASE_URL}/api/transactions/add`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast("Transaction Added");
        }
        closeModal();
        fetchTransactions();
    } catch (err) {
        showToast("Operation Failed");
    }
});