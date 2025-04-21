const renderBackendUrl = "https://login-sys-5w4y.onrender.com"; // Define Backend URL

// Login form handler
document.getElementById("login-form").addEventListener("submit", async(e) => {
    e.preventDefault();
    const username = document.getElementById("username").value; // This now holds username or email
    const password = document.getElementById("password").value;

    try {
        console.log("Sending login request to:", `${renderBackendUrl}/login`);
        const res = await fetch(`${renderBackendUrl}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({username, password}),
        });

        console.log("Login response status:", res.status);
        
        // Get the response text first for debugging
        const responseText = await res.text();
        console.log("Login response text:", responseText);
        
        // Try to parse the response as JSON
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            throw new Error("Invalid response from server");
        }
        
        // Check if the response is ok
        if (!res.ok) {
            throw new Error(result.message || `HTTP error! status: ${res.status}`);
        }
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(result.user));
        alert("Login successful");
        window.location.href = "shop.html";
        
        document.getElementById("login-form").reset();
    } catch (error) {
        console.error("Login error:", error);
        alert(error.message || "Error connecting to server during login");
    }
});

// Registration form handler
document.getElementById("register-form").addEventListener("submit", async(e) => {
    e.preventDefault();
    const username = document.getElementById("reg-username").value;
    const password = document.getElementById("reg-password").value;
    const email = document.getElementById("reg-email").value;
    
    try {
        console.log("Sending registration request to:", `${renderBackendUrl}/register`);
        const res = await fetch(`${renderBackendUrl}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({username, password, email}),
        });

        console.log("Registration response status:", res.status);
        
        // Get the response text first for debugging
        const responseText = await res.text();
        console.log("Registration response text:", responseText);
        
        // Try to parse the response as JSON
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            throw new Error("Invalid response from server");
        }
        
        // Check if the response is ok
        if (!res.ok) {
            throw new Error(result.message || `HTTP error! status: ${res.status}`);
        }
        
        alert(result.message || "Registration successful");
        
        if (res.ok) {
            document.getElementById("register-form").reset();
        }
    } catch (error) {
        console.error("Registration error:", error);
        alert(error.message || "Error connecting to server during registration");
    }
});