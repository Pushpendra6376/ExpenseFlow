const BASE_URL = "http://localhost:5000"; 

// DOM Elements
const signUpBtn = document.getElementById("showSignUp");
const loginBtn = document.getElementById("showLogin");
const signUpForm = document.querySelector(".sign-up");
const loginForm = document.querySelector(".login");
const forgotForm = document.getElementById("forgot-form");

// Toggle Login/Signup
signUpBtn.addEventListener("click", () => {
    signUpForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    signUpBtn.classList.add("active");
    loginBtn.classList.remove("active");
});

loginBtn.addEventListener("click", () => {
    loginForm.classList.remove("hidden");
    signUpForm.classList.add("hidden");
    loginBtn.classList.add("active");
    signUpBtn.classList.remove("active");
});

// === SIGN UP LOGIC ===
signUpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const res = await axios.post(`${BASE_URL}/api/auth/signup`, { name, email, password });
        
        if (res.data.success) {
            showToast("Account created! Please login.", 3000);
            // Switch to login view automatically
            loginBtn.click();
            signUpForm.reset();
        }
    } catch (err) {
        const msg = err.response?.data?.message || "Signup failed";
        showToast(msg);
    }
});

// === LOGIN LOGIC ===
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const res = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });

        if (res.data.success) {
            // Store Token & User Data
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            showToast("Login Successful!", 2000);
            
            // Redirect to Dashboard
            setTimeout(() => {
                window.location.href = "dashboard.html"; // Adjust filename if different
            }, 1000);
        }
    } catch (err) {
        const msg = err.response?.data?.message || "Invalid Email or Password";
        showToast(msg);
    }
});

// === FORGOT PASSWORD UI LOGIC ===
// Attached to window because HTML uses onclick="showForgotForm()"
window.showForgotForm = () => {
    forgotForm.style.display = 'block';
    window.scrollTo(0, document.body.scrollHeight);
};

// === FORGOT PASSWORD API LOGIC ===
window.forgotPassword = async () => {
    const email = document.getElementById("forgotEmail").value;
    if (!email) return showToast("Please enter your email");

    try {
        const res = await axios.post(`${BASE_URL}/api/auth/forgot-password`, { email });
        if (res.data.success) {
            showToast("Reset link sent to your email!", 4000);
            forgotForm.style.display = 'none';
        }
    } catch (err) {
        const msg = err.response?.data?.message || "Error sending email";
        showToast(msg);
    }
};