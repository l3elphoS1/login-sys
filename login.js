const renderBackendUrl = "https://login-sys-5w4y.onrender.com"; // Define Backend URL

// Login form handler
document.getElementById("login-form").addEventListener("submit", async(e) => {
    e.preventDefault();
    const username = document.getElementById("username").value; // This now holds username or email
    const password = document.getElementById("password").value;

    try {
        const res = await fetch(`${renderBackendUrl}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({username, password}),
        });

        const result = await res.json();

        if (res.ok) {
            // เก็บข้อมูล user ใน localStorage
            localStorage.setItem('user', JSON.stringify(result.user));
            // แสดง alert ก่อน redirect
            alert("Login successful");
            // redirect ไปยังหน้า shop
            window.location.href = "shop.html";
        } else {
            alert(result.message);
        }
        document.getElementById("login-form").reset();
    } catch (error) {
        console.error("Login error:", error);
        alert("Error connecting to server during login");
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
            body: JSON.stringify({username, password, email}),
        });

        const result = await res.json();
        alert(result.message);
        
        if (res.ok) {
            document.getElementById("register-form").reset();
        }
    } catch (error) {
        console.error("Registration error:", error); // Log registration errors
        alert("Error connecting to server during registration");
    }
});