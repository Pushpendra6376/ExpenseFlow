const BASE_URL = "http://localhost:5000";

// 1. Auth Check (Protect the Route)
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token) {
    window.location.href = "login_signup.html";
}

// 2. Initial Setup
document.addEventListener("DOMContentLoaded", () => {
    setupNavbar();
    fetchDashboardData();
    
    // Set Name
    if (user && user.name) {
        document.querySelector(".user-greeting").innerText = `Welcome, ${user.name.split(' ')[0]}`;
    }
});

// 3. Navbar Logic (Premium vs Standard)
function setupNavbar() {
    const navActions = document.getElementById("navActions");
    const isPremium = user && user.isPremium;

    const actionBtn = document.createElement("button");

    if (isPremium) {
        // Show Leaderboard Button
        actionBtn.className = "leaderboard-btn";
        actionBtn.innerHTML = '<i class="fa-solid fa-trophy"></i> Leaderboard';
        actionBtn.onclick = () => window.location.href = "leaderboard.html";
    } else {
        // Show Membership Button
        actionBtn.className = "premium-btn";
        actionBtn.innerHTML = '<i class="fa-solid fa-crown"></i> Buy Premium';
        actionBtn.onclick = () => window.location.href = "premium.html"; // Make payment page later
    }

    // Insert before Logout button
    navActions.insertBefore(actionBtn, navActions.firstChild);
}

// 4. Fetch Stats & Transactions
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

// 5. Update UI Elements
function updateUI(data) {
    const { totalIncome, totalExpense, balance } = data.userTotals;
    const transactions = data.recentTransactions;

    // Update Stats
    document.getElementById("totalIncome").innerText = `₹${totalIncome}`;
    document.getElementById("totalExpense").innerText = `₹${totalExpense}`;
    document.getElementById("totalBalance").innerText = `₹${balance}`;

    // Update Transaction Table (Limit to 6)
    const list = document.getElementById("transactionList");
    list.innerHTML = ""; // Clear loader

    if (transactions.length === 0) {
        list.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#888;">No transactions found</td></tr>`;
        return;
    }

    // Slice to show only latest 6
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

// 6. Logout Function
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
}