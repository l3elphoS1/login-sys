const renderBackendUrl = "https://login-sys-5w4y.onrender.com"; // Define Backend URL

// Login form handler
document.getElementById("login-form").addEventListener("submit", async(e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch('/login', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({username, password}),
        });

        const result = await res.json();
        
        if (!res.ok) {
            throw new Error(result.message || 'Login failed');
        }
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(result.user));
        alert("Login successful");
        window.location.href = "shop.html";
        
        document.getElementById("login-form").reset();
    } catch (error) {
        console.error("Login error:", error);
        alert(error.message || "Error during login");
    }
});

// Registration form handler
document.getElementById("register-form").addEventListener("submit", async(e) => {
    e.preventDefault();
    const username = document.getElementById("reg-username").value;
    const password = document.getElementById("reg-password").value;
    const email = document.getElementById("reg-email").value;
    
    try {
        const res = await fetch('/register', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({username, password, email}),
        });

        const result = await res.json();
        
        if (!res.ok) {
            throw new Error(result.message || 'Registration failed');
        }
        
        alert("Registration successful! Please login.");
        document.getElementById("register-form").reset();
        toggleForms(); // Switch to login form
    } catch (error) {
        console.error("Registration error:", error);
        alert(error.message || "Error during registration");
    }
});