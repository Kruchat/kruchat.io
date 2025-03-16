// กำหนด username และ password ที่นี่ (แก้ไขได้จุดเดียว)
const VALID_USER = "admin";
const VALID_PASSWORD = "1234";

// ฟังก์ชัน login
function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMessage = document.getElementById("error-message");

    if (username === VALID_USER && password === VALID_PASSWORD) {
        localStorage.setItem("isLoggedIn", "true");
        window.location.href = "documents.html"; // หรือเปลี่ยนเป็น "index.html" ถ้าต้องการให้ไปหน้าหลักก่อน
    } else {
        errorMessage.classList.remove("hidden");
    }
}

// ตรวจสอบสถานะ login
function checkLogin() {
    if (localStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "login.html";
    }
}