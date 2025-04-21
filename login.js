const renderBackendUrl = "https://login-sys-5w4y.onrender.com"; // Define Backend URL

// Login form handler
document.getElementById("login-form").addEventListener("submit", async(e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch(`${renderBackendUrl}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password }),
        });
        

        // First check if the response is ok
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: 'Server error' }));
            throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
        }

        // Try to parse the response as JSON
        const result = await res.json();
        
        if (!result.success) {
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
        const res = await fetch(`${renderBackendUrl}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password, email })
        });

        // Try to parse the response as JSON
        const result = await res.json();
        
        if (!result.success) {
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