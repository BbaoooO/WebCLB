document.addEventListener('DOMContentLoaded', function() {
    const resetForm = document.getElementById('resetForm');
    const emailInput = document.getElementById('email');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const toggleButtons = document.querySelectorAll('.toggle-password');
    const strengthBars = document.querySelectorAll('.bar');
    const strengthText = document.querySelector('.strength-text');
    const backButton = document.querySelector('.back-button');

    // Kiểm tra email đã được xác thực
    const savedEmail = localStorage.getItem('otpEmail');
    if (!savedEmail) {
        alert('Vui lòng xác thực email trước!');
        window.location.href = 'forgot-password.html';
        return;
    }

    // Xử lý hiển thị/ẩn mật khẩu
    toggleButtons.forEach((toggle, index) => {
        toggle.addEventListener('click', function() {
            // Thay đổi loại input
            const input = document.querySelectorAll('input[type="password"]')[index];
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            // Thay đổi icon
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
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
    newPasswordInput.addEventListener('input', function() {
        updatePasswordStrength(this.value);
    });

    // Xử lý form reset password
    resetForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        
        // Kiểm tra validation
        if (!email || !newPassword || !confirmPassword) {
            alert('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        // Kiểm tra độ dài mật khẩu
        if (newPassword.length < 8) {
            alert('Mật khẩu phải có ít nhất 8 kí tự!');
            return;
        }

        // Kiểm tra mật khẩu khớp
        if (newPassword !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }

        try {
            // TODO: Gửi request đến server để cập nhật mật khẩu
            console.log('Cập nhật mật khẩu cho email:', email);
            
            // Xóa dữ liệu đã lưu
            localStorage.removeItem('otpEmail');
            
            alert('Đặt lại mật khẩu thành công!');
            
            // Chuyển hướng về trang đăng nhập
            window.location.href = 'login.html';
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