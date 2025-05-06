document.addEventListener('DOMContentLoaded', function() {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const emailInput = document.getElementById('email');
    const backButton = document.querySelector('.back-button');

    // Xử lý form quên mật khẩu
    forgotPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        // Kiểm tra validation
        if (!email) {
            alert('Vui lòng nhập email!');
            return;
        }

        // Kiểm tra định dạng email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Vui lòng nhập email hợp lệ!');
            return;
        }

        try {
            // Giả lập gửi mã OTP
            const otp = Math.floor(1000 + Math.random() * 9000); // Tạo mã OTP 4 số
            
            // Lưu mã OTP vào localStorage để kiểm tra sau này
            localStorage.setItem('currentOTP', otp);
            localStorage.setItem('otpEmail', email);
            
            // Hiển thị thông báo
            alert(`Mã reset mật khẩu đã được gửi đến email của bạn!\nMã OTP của bạn là: ${otp}`);
            
            // Chuyển hướng đến trang nhập mã OTP
            window.location.href = 'verify-code.html';
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Có lỗi xảy ra. Vui lòng thử lại sau!');
        }
    });

    // Xử lý nút quay lại
    backButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'index.html';
    });
}); 