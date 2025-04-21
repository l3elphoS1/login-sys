// Login form handler
document.getElementById("login-form").addEventListener("submit", async(e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch("http://localhost:3000/login", {
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
            // redirect ไปยังหน้า landing
            window.location.href = "landing.html";
        } else {
            alert(result.message);
        }
        document.getElementById("login-form").reset();
    } catch (error) {
        alert("Error connecting to server");
    }
});

// Registration form handler
document.getElementById("register-form").addEventListener("submit", async(e) => {
    e.preventDefault();
    const username = document.getElementById("reg-username").value;
    const password = document.getElementById("reg-password").value;

    try {
        const res = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({username, password}),
        });

        const result = await res.json();
        alert(result.message);
        
        if (res.ok) {
            document.getElementById("register-form").reset();
        }
    } catch (error) {
        alert("Error connecting to server");
    }
});