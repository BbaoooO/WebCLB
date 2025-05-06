document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const termsCheckbox = document.getElementById('terms');
    const togglePassword = document.querySelector('.toggle-password');
    const backButton = document.querySelector('.back-button');
    const strengthBars = document.querySelectorAll('.bar');
    const strengthText = document.querySelector('.strength-text');

    // Xử lý hiển thị/ẩn mật khẩu
    togglePassword.addEventListener('click', function() {
        // Thay đổi loại input
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Thay đổi icon
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    // Kiểm tra độ mạnh mật khẩu
    function checkPasswordStrength(password) {
        // Kiểm tra độ dài tối thiểu
        if (password.length < 8) {
            return 'tooShort';
        }

        // Kiểm tra trường hợp yếu: 6 số giống nhau
        const weakPattern = /^(\d)\1{5,}/;
        
        // Kiểm tra trường hợp trung bình: 4 số giống nhau
        const mediumPattern = /^(\d)\1{3,}/;
        
        if (weakPattern.test(password)) {
            return 'weak';
        } else if (mediumPattern.test(password)) {
            return 'medium';
        } else {
            return 'strong';
        }
    }

    // Cập nhật thanh độ mạnh mật khẩu
    function updatePasswordStrength(password) {
        const strength = checkPasswordStrength(password);
        
        // Reset tất cả các thanh
        strengthBars.forEach(bar => {
            bar.className = 'bar';
        });

        // Cập nhật màu và số thanh theo độ mạnh
        if (strength === 'tooShort') {
            strengthText.textContent = 'Vui lòng nhập ít nhất 8 kí tự';
        } else if (strength === 'weak') {
            strengthBars[0].classList.add('weak');
            strengthText.textContent = 'Yếu';
        } else if (strength === 'medium') {
            strengthBars[0].classList.add('medium');
            strengthBars[1].classList.add('medium');
            strengthText.textContent = 'Trung bình';
        } else {
            strengthBars.forEach(bar => bar.classList.add('strong'));
            strengthText.textContent = 'Mạnh';
        }
    }

    // Theo dõi thay đổi mật khẩu
    passwordInput.addEventListener('input', function() {
        updatePasswordStrength(this.value);
    });

    // Xử lý form đăng ký
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Kiểm tra validation
        if (!email || !password) {
            alert('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        // Kiểm tra độ dài mật khẩu
        if (password.length < 8) {
            alert('Mật khẩu phải có ít nhất 8 kí tự!');
            return;
        }

        // Kiểm tra điều khoản
        if (!termsCheckbox.checked) {
            alert('Vui lòng đồng ý với điều khoản và điều kiện!');
            return;
        }

        try {
            // TODO: Thêm logic đăng ký với server ở đây
            // Giả lập đăng ký thành công
            localStorage.setItem('userEmail', email);
            
            alert('Đăng ký thành công!');
            
            // Chuyển hướng đến trang chủ
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Có lỗi xảy ra. Vui lòng thử lại sau!');
        }
    });

    // Xử lý nút quay lại
    backButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'login.html';
    });
}); 