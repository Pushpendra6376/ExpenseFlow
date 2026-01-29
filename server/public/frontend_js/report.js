const BASE_URL = "http://localhost:5000";
const token = localStorage.getItem("token");

if (!token) window.location.href = "/";

// State for Pagination
let currentPage = 1;
let currentStart = "";
let currentEnd = "";

document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.name) {
        document.querySelector(".user-greeting").innerText = `Welcome, ${user.name.split(' ')[0]}`;
    }
    // Default load logs (in background)
    fetchReportHistory();
});

// === TAB LOGIC ===
window.switchTab = (tab) => {
    const newSec = document.getElementById('new-report-section');
    const histSec = document.getElementById('history-section');
    const btns = document.querySelectorAll('.tab-btn');

    if (tab === 'new') {
        newSec.classList.remove('hidden');
        histSec.classList.add('hidden');
        btns[0].classList.add('active');
        btns[1].classList.remove('active');
    } else {
        newSec.classList.add('hidden');
        histSec.classList.remove('hidden');
        btns[0].classList.remove('active');
        btns[1].classList.add('active');
    }
};

//  SEARCH & PREVIEW 
window.searchReports = async (page = 1) => {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!startDate || !endDate) {
        showToast("Please select Start and End Date");
        return;
    }

    currentStart = startDate;
    currentEnd = endDate;
    currentPage = page;

    try {
        const res = await axios.post(`${BASE_URL}/api/reports/preview`, {
            startDate, endDate, page, limit: 10 
        }, { headers: { Authorization: `Bearer ${token}` } });

        if (res.data.success) {
            document.getElementById('preview-container').classList.remove('hidden');
            renderTable(res.data.data);
            renderPagination(res.data.totalPages, page);
        }

    } catch (err) {
        showToast("No data found or Error");
        console.error(err);
    }
};

function renderTable(data) {
    const tbody = document.getElementById('previewList');
    tbody.innerHTML = "";

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No records found</td></tr>`;
        return;
    }

    data.forEach(txn => {
        const row = `
            <tr>
                <td>${txn.date}</td>
                <td>${txn.category}</td>
                <td>${txn.description || '-'}</td>
                <td style="color:${txn.type === 'income' ? 'green' : 'red'}">₹${txn.amount}</td>
                <td style="text-transform:capitalize;">${txn.type}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function renderPagination(totalPages, page) {
    const container = document.getElementById('paginationControls');
    container.innerHTML = "";

    if (totalPages <= 1) return;

    // Prev Button
    const prevBtn = document.createElement("button");
    prevBtn.innerText = "Prev";
    prevBtn.disabled = page === 1;
    prevBtn.onclick = () => searchReports(page - 1);
    container.appendChild(prevBtn);

    // Page Number
    const pageInfo = document.createElement("span");
    pageInfo.innerText = ` Page ${page} of ${totalPages} `;
    container.appendChild(pageInfo);

    // Next Button
    const nextBtn = document.createElement("button");
    nextBtn.innerText = "Next";
    nextBtn.disabled = page === totalPages;
    nextBtn.onclick = () => searchReports(page + 1);
    container.appendChild(nextBtn);
}

// DOWNLOAD 
window.downloadReport = async () => {
    const btn = document.getElementById('downloadBtn');
    const reportType = document.querySelector('input[name="fileType"]:checked').value;

    btn.innerHTML = 'Downloading...';
    btn.disabled = true;

    try {
        const res = await axios.post(`${BASE_URL}/api/reports/download`, {
            startDate: currentStart,
            endDate: currentEnd,
            reportType
        }, { headers: { Authorization: `Bearer ${token}` } });

        if (res.data.success) {
            showToast("Downloaded Successfully!");
            const link = document.createElement('a');
            link.href = res.data.fileUrl;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            fetchReportHistory(); 
        }
    } catch (err) {
        showToast("Download Failed");
    } finally {
        btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Download';
        btn.disabled = false;
    }
};

// HISTORY 
async function fetchReportHistory() {
    try {
        const res = await axios.get(`${BASE_URL}/api/reports/history`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const tbody = document.getElementById('historyList');
        tbody.innerHTML = "";
        
        if (res.data.logs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No history yet</td></tr>`;
            return;
        }

        res.data.logs.forEach(log => {
            const row = `
                <tr>
                    <td>${new Date(log.createdAt).toLocaleDateString()}</td>
                    <td>${log.reportType}</td>
                    <td>${log.period}</td>
                    <td style="color:green">Success</td>
                    <td><a href="${log.fileUrl}" target="_blank" style="color:#4F46E5">Download</a></td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (err) { console.error(err); }
}

window.logout = () => {
    localStorage.clear();
    window.location.href = "/";
};