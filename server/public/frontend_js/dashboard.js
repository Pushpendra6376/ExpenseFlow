const BASE_URL = "http://localhost:5000";

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token) {
    window.location.href = "login_signup.html";
}

document.addEventListener("DOMContentLoaded", async () => {
    setupNavbar();
    fetchDashboardData();
    
    if (user && user.name) {
        document.querySelector(".user-greeting").innerText = `Welcome, ${user.name.split(' ')[0]}`;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');

    if (orderId) {
        await verifyPayment(orderId);
    }
});

async function verifyPayment(orderId) {
    try {
        const token = localStorage.getItem("token"); // Token nikalo
        
        const res = await axios.post('http://localhost:5000/api/payment/verify', 
            { orderId: orderId }, 
            { headers: { Authorization: `Bearer ${token}` } } 
        );

        if (res.data.success) {
            window.history.replaceState({}, document.title, "dashboard.html");
            
            let user = JSON.parse(localStorage.getItem("user"));
            if(user) {
                user.isPremium = true;
                localStorage.setItem("user", JSON.stringify(user));
            }

            alert("Congratulations! Premium Activated 👑");
            
            location.reload();
        }
    } catch (error) {
        console.error("Verification Failed", error);
        alert("Payment verification failed. Please contact support.");
    }
}

function setupNavbar() {
    const navActions = document.getElementById("navActions");
    const isPremium = user && user.isPremium;

    const actionBtn = document.createElement("button");

    if (isPremium) {
        actionBtn.className = "leaderboard-btn";
        actionBtn.innerHTML = '<i class="fa-solid fa-trophy"></i> Leaderboard';
        actionBtn.onclick = () => window.location.href = "leaderboard.html";
    } else {
        actionBtn.className = "premium-btn";
        actionBtn.innerHTML = '<i class="fa-solid fa-crown"></i> Buy Premium';
        actionBtn.onclick = () => buyPremium();
    }

    navActions.insertBefore(actionBtn, navActions.firstChild);
}

async function fetchDashboardData() {
    try {
        const res = await axios.get(`${BASE_URL}/api/dashboard/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
            updateUI(res.data);
        }

    } catch (err) {
        console.error("Dashboard Error:", err);
        if(err.response && err.response.status === 401) {
            logout(); // Token expired
        }
    }
}

function updateUI(data) {
    const { totalIncome, totalExpense, balance } = data.userTotals;
    const transactions = data.recentTransactions;

    document.getElementById("totalIncome").innerText = `₹${totalIncome}`;
    document.getElementById("totalExpense").innerText = `₹${totalExpense}`;
    document.getElementById("totalBalance").innerText = `₹${balance}`;

    const list = document.getElementById("transactionList");
    list.innerHTML = ""; // Clear loader

    if (transactions.length === 0) {
        list.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#888;">No transactions found</td></tr>`;
        return;
    }

    const latestSix = transactions.slice(0, 6);

    latestSix.forEach(txn => {
        const row = document.createElement("tr");
        const isIncome = txn.type === 'income';
        const sign = isIncome ? "+" : "-";
        const colorClass = isIncome ? "income" : "expense";

        row.innerHTML = `
            <td style="font-weight: 500;">${txn.description || "No Description"}</td>
            <td><span class="badge">${txn.category}</span></td>
            <td style="color:#666; font-size:0.85rem;">${new Date(txn.date).toLocaleDateString()}</td>
            <td class="amount ${colorClass}">${sign}₹${Number(txn.amount).toFixed(2)}</td>
            <td style="text-transform: capitalize;">${txn.type}</td>
        `;
        list.appendChild(row);
    });
}

// logout function
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
}