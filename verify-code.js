document.addEventListener('DOMContentLoaded', function() {
    const otpForm = document.getElementById('otpForm');
    const otpInputs = document.querySelectorAll('.otp-input');
    const backButton = document.querySelector('.back-button');

    // Kiểm tra xem có mã OTP đã được gửi không
    const savedOTP = localStorage.getItem('currentOTP');
    const savedEmail = localStorage.getItem('otpEmail');
    
    if (!savedOTP || !savedEmail) {
        alert('Vui lòng yêu cầu mã OTP trước!');
        window.location.href = 'forgot-password.html';
        return;
    }

    // Xử lý input OTP
    otpInputs.forEach((input, index) => {
        // Tự động focus vào ô tiếp theo khi nhập
        input.addEventListener('input', function() {
            if (this.value.length === 1) {
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            }
        });

        // Xử lý phím Backspace
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !this.value && index > 0) {
                otpInputs[index - 1].focus();
            }
        });

        // Chỉ cho phép nhập số
        input.addEventListener('keypress', function(e) {
            if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
            }
        });

        // Xử lý paste
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').trim();
            if (/^\d+$/.test(pastedData)) {
                const digits = pastedData.split('');
                otpInputs.forEach((input, i) => {
                    if (digits[i]) {
                        input.value = digits[i];
                        if (i < otpInputs.length - 1) {
                            otpInputs[i + 1].focus();
                        }
                    }
                });
            }
        });
    });

    // Focus vào ô đầu tiên khi trang load
    otpInputs[0].focus();

    // Xử lý form submit
    otpForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Lấy mã OTP từ các ô input
        const otpValue = Array.from(otpInputs).map(input => input.value).join('');
        
        // Kiểm tra OTP đã nhập đủ chưa
        if (otpValue.length !== 4) {
            alert('Vui lòng nhập đủ mã OTP!');
            return;
        }

        try {
            // Kiểm tra mã OTP có đúng không
            if (otpValue === savedOTP) {
                alert('Xác thực OTP thành công!');
                
                // Xóa OTP đã sử dụng
                localStorage.removeItem('currentOTP');
                
                // Chuyển hướng đến trang đặt lại mật khẩu
                window.location.href = 'reset-password.html';
            } else {
                alert('Mã OTP không chính xác!');
            }
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Có lỗi xảy ra. Vui lòng thử lại sau!');
        }
    });

    // Xử lý nút quay lại
    backButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'forgot-password.html';
    });
}); 