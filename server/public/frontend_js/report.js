const BASE_URL = "http://localhost:5000";
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "/";
}

document.addEventListener("DOMContentLoaded", () => {

    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.name) {
        document.querySelector(".user-greeting").innerText = `Welcome, ${user.name.split(' ')[0]}`;
    }
    fetchReportHistory();
});

function toggleCustomDate() {
    const frequency = document.getElementById('frequency').value;
    const dateBox = document.getElementById('custom-date-box');
    
    if (frequency === 'custom') {
        dateBox.classList.remove('hidden');
    } else {
        dateBox.classList.add('hidden');
    }
}

async function downloadReport() {
    const btn = document.getElementById('downloadBtn');
    const frequency = document.getElementById('frequency').value;
    const reportType = document.querySelector('input[name="fileType"]:checked').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    // Validation for Custom Date
    if (frequency === 'custom' && (!startDate || !endDate)) {
        showToast("Please select Start and End dates");
        return;
    }

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
    btn.disabled = true;

    try {
        const res = await axios.post(`${BASE_URL}/api/reports/download`, {
            reportType,
            frequency,
            startDate,
            endDate
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
            showToast("Report Generated! Downloading...");
            
            // Auto Download Trigger
            const link = document.createElement('a');
            link.href = res.data.fileUrl;
            link.target = "_blank"; //(S3 link)
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Refresh History
            fetchReportHistory();
        }

    } catch (err) {
        console.error("Download Error:", err);
        showToast(err.response?.data?.message || "Failed to generate report");
    } finally {
        btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Download Report';
        btn.disabled = false;
    }
}

async function fetchReportHistory() {
    try {
        const res = await axios.get(`${BASE_URL}/api/reports/history`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
            const list = document.getElementById('historyList');
            list.innerHTML = ""; // Clear existing

            if(res.data.logs.length === 0) {
                list.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color:#888;">No reports downloaded yet</td></tr>`;
                return;
            }

            res.data.logs.forEach(log => {
                const date = new Date(log.createdAt).toLocaleDateString();
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${date}</td>
                    <td style="text-transform: uppercase; font-weight:bold;">${log.reportType}</td>
                    <td style="text-transform: capitalize;">${log.period}</td>
                    <td><span style="color:green;">${log.status}</span></td>
                    <td>
                        <a href="${log.fileUrl}" class="btn-link" target="_blank">
                            <i class="fa-solid fa-download"></i> Download
                        </a>
                    </td>
                `;
                list.appendChild(row);
            });
        }
    } catch (err) {
        console.error("History Error:", err);
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
}