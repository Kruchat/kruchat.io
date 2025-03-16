// กำหนด username และ password ที่นี่ (แก้ไขได้จุดเดียว)
const VALID_USER = "admin";
const VALID_PASSWORD = "1234";

// ฟังก์ชัน login
function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMessage = document.getElementById("error-message");

    if (username === VALID_USER && password === VALID_PASSWORD) {
        // บันทึกสถานะ login
        localStorage.setItem("isLoggedIn", "true");
        // เปลี่ยนหน้าไป documents.html
        window.location.href = "documents.html";
    } else {
        errorMessage.classList.remove("hidden");
    }
}

// ตรวจสอบสถานะ login เมื่อโหลดหน้า documents.html
function checkLogin() {
    if (localStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "login.html";
    }
}