document.addEventListener('DOMContentLoaded', function() {
    // --- LOGIN PAGE LOGIC ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const togglePassword = document.querySelector('.toggle-password');
        const forgotPasswordLink = document.querySelector('.forgot-password');
        const registerLink = document.querySelector('.register-link');
        const backButton = document.querySelector('.back-button');

        if (togglePassword && passwordInput) {
            togglePassword.addEventListener('click', function() {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                this.classList.toggle('fa-eye');
                this.classList.toggle('fa-eye-slash');
            });
        }

        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            if (!email || !password) {
                alert('Vui lòng nhập đầy đủ thông tin!');
                return;
            }
            try {
                localStorage.setItem('userEmail', email);
                alert('Đăng nhập thành công!');
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error('Lỗi:', error);
                alert('Có lỗi xảy ra. Vui lòng thử lại sau!');
            }
        });

        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'forgot-password.html';
            });
        }
        if (registerLink) {
            registerLink.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'register.html';
            });
        }
        if (backButton) {
            backButton.addEventListener('click', function(e) {
                e.preventDefault();
                window.history.back();
            });
        }
    }
});