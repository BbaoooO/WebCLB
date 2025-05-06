// Lấy các elements từ DOM
const leaveRequestForm = document.getElementById('leaveRequestForm');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const durationInput = document.getElementById('duration');
const handoverSelect = document.getElementById('handover');
const historyList = document.querySelector('.history-list');

// Thiết lập ngày tối thiểu cho input date là ngày hiện tại
const today = new Date().toISOString().split('T')[0];
startDateInput.min = today;
endDateInput.min = today;

// Tính số ngày nghỉ khi thay đổi ngày bắt đầu hoặc kết thúc
function calculateDuration() {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    
    if (startDate && endDate) {
        // Đặt giờ về 00:00:00 để so sánh chính xác ngày
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        // Tính tổng số ngày nghỉ, bao gồm cả ngày bắt đầu và kết thúc
        const diffTime = endDate.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        durationInput.value = diffDays > 0 ? diffDays : 0;
    }
}

// Event listeners cho input date
startDateInput.addEventListener('change', () => {
    endDateInput.min = startDateInput.value;
    calculateDuration();
});

endDateInput.addEventListener('change', calculateDuration);

// Lấy danh sách thành viên từ localStorage để điền vào select handover
function populateHandoverSelect() {
    // Lấy dữ liệu từ localStorage đúng chuẩn như trang members lưu
    const membersData = JSON.parse(localStorage.getItem('membersData')) || {};
    // Chuyển object thành array
    const members = Object.entries(membersData).map(([id, member]) => ({ ...member, id }));
    handoverSelect.innerHTML = '<option value="">Chọn người bàn giao</option>';

    members.forEach(member => {
        if (member && member.id && member.name) {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = member.name;
            handoverSelect.appendChild(option);
        }
    });
}

// Hiển thị lịch sử nghỉ phép
function displayLeaveHistory() {
    const leaveHistory = JSON.parse(localStorage.getItem('leaveHistory')) || [];
    
    historyList.innerHTML = '';
    
    if (leaveHistory.length === 0) {
        historyList.innerHTML = '<p class="no-history">Chưa có lịch sử nghỉ phép</p>';
        return;
    }
    
    leaveHistory.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
                .slice(0, 5) // Chỉ hiển thị 5 đơn gần nhất
                .forEach((leave, idx) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        historyItem.innerHTML = `
            <div class="leave-type">${getLeaveTypeName(leave.leaveType)}</div>
            <div class="leave-date">${formatDate(leave.startDate)} - ${formatDate(leave.endDate)}</div>
            <div class="leave-status status-${leave.status}">${getStatusName(leave.status)}</div>
            <div class="status-select-group">
                <label for="status-select-${leave.id}" style="font-size:12px;margin-right:6px;">Đổi trạng thái:</label>
                <select class="status-select" id="status-select-${leave.id}" data-idx="${idx}">
                    <option value="pending" ${leave.status==='pending'?'selected':''}>Chờ duyệt</option>
                    <option value="approved" ${leave.status==='approved'?'selected':''}>Đã duyệt</option>
                    <option value="rejected" ${leave.status==='rejected'?'selected':''}>Không được duyệt</option>
                </select>
            </div>
        `;
        
        historyList.appendChild(historyItem);
        // Thêm event cho select
        const select = historyItem.querySelector('.status-select');
        select.addEventListener('change', function() {
            leaveHistory[idx].status = this.value;
            localStorage.setItem('leaveHistory', JSON.stringify(leaveHistory));
            displayLeaveHistory();
        });
    });
}

// Hàm helper để format ngày
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

// Hàm helper để lấy tên loại nghỉ phép
function getLeaveTypeName(type) {
    const types = {
        'annual': 'Nghỉ phép năm',
        'sick': 'Nghỉ ốm',
        'personal': 'Việc cá nhân',
        'other': 'Khác'
    };
    return types[type] || type;
}

// Hàm helper để lấy tên trạng thái
function getStatusName(status) {
    const statuses = {
        'pending': 'Chờ duyệt',
        'approved': 'Đã duyệt',
        'rejected': 'Từ chối'
    };
    return statuses[status] || status;
}

// Xử lý submit form
leaveRequestForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
        id: Date.now(),
        leaveType: document.getElementById('leaveType').value,
        startDate: startDateInput.value,
        endDate: endDateInput.value,
        duration: parseInt(durationInput.value),
        reason: document.getElementById('reason').value,
        handover: handoverSelect.value,
        contactInfo: document.getElementById('contactInfo').value,
        status: 'pending', // Luôn mặc định là chờ duyệt
        createdAt: new Date().toISOString()
    };
    
    // Lưu đơn xin nghỉ phép vào localStorage
    const leaveHistory = JSON.parse(localStorage.getItem('leaveHistory')) || [];
    leaveHistory.unshift(formData);
    localStorage.setItem('leaveHistory', JSON.stringify(leaveHistory));
    
    // Hiển thị thông báo thành công
    alert('Đơn xin nghỉ phép đã được gửi thành công!');
    
    // Reset form và cập nhật lịch sử
    leaveRequestForm.reset();
    displayLeaveHistory();
});

// Xử lý nút hủy
document.querySelector('.cancel-btn').addEventListener('click', () => {
    leaveRequestForm.reset();
});

// Khởi tạo trang
document.addEventListener('DOMContentLoaded', () => {
    populateHandoverSelect();
    displayLeaveHistory();
}); 