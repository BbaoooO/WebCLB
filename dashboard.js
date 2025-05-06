document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo biểu đồ chi tiêu
    let spendingChart;

    function initializeSpendingChart() {
        const ctx = document.getElementById('spendingChart').getContext('2d');
        
        spendingChart = new Chart(ctx, {
            type: 'line',
        data: {
                labels: [],
            datasets: [
                {
                        label: 'Thu nhập',
                        data: [],
                        borderColor: '#4CAF50',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        pointRadius: 4,
                        pointBackgroundColor: '#4CAF50',
                        tension: 0.1,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Chi tiêu',
                        data: [],
                        borderColor: '#FF5252',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        pointRadius: 4,
                        pointBackgroundColor: '#FF5252',
                        tension: 0.1,
                        pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#fff',
                        titleColor: '#333',
                        bodyColor: '#666',
                        borderColor: '#ddd',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            title: function(tooltipItems) {
                                return tooltipItems[0].label;
                            },
                            label: function(context) {
                                let label = context.dataset.label || '';
                                let value = context.parsed.y || 0;
                                return `${label}: ${value.toLocaleString()}đ`;
                            }
                        }
                    }
                },
            scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#666',
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        display: false,
                    beginAtZero: true,
                    ticks: {
                            callback: function(value) {
                                return value.toLocaleString() + 'đ';
                            }
                        }
                    }
                }
            }
        });

        // Lấy dữ liệu từ localStorage khi khởi tạo
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const timeSelect = document.querySelector('.time-filter select');
        updateChartFromTransactions(transactions, timeSelect.value);

        // Lắng nghe sự kiện thay đổi từ expense-tracker
        window.addEventListener('storage', function(e) {
            if (e.key === 'transactions') {
                const transactions = JSON.parse(e.newValue) || [];
                updateChartFromTransactions(transactions, timeSelect.value);
            }
        });

        // Xử lý sự kiện khi chọn thời gian
        const viewReportBtn = document.querySelector('.view-report');

        if (timeSelect && viewReportBtn) {
            timeSelect.addEventListener('change', function() {
                const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
                updateChartFromTransactions(transactions, this.value);
            });

            viewReportBtn.addEventListener('click', function() {
                const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
                updateChartFromTransactions(transactions, timeSelect.value);
            });
        }
    }

    function updateChartFromTransactions(transactions, timeRange = 'month') {
        if (!spendingChart) return;

        let data;
        const today = new Date();

        switch(timeRange) {
            case 'day':
                data = processTransactionsForDay(transactions);
                break;
            case 'week':
                data = processTransactionsForWeek(transactions);
                break;
            case 'month':
                data = processTransactionsForMonth(transactions);
                break;
            case 'year':
                data = processTransactionsForYear(transactions);
                break;
        }

        if (data) {
            // Tìm giá trị lớn nhất trong cả income và expense
            const maxIncome = Math.max(...data.income);
            const maxExpense = Math.max(...data.expense);
            const maxValue = Math.max(maxIncome, maxExpense);

            // Tính toán stepSize và max cho trục y
            const stepSize = calculateStepSize(maxValue);
            const yAxisMax = Math.ceil(maxValue / stepSize) * stepSize;

            // Cập nhật options cho trục y
            spendingChart.options.scales.y.max = yAxisMax;
            spendingChart.options.scales.y.ticks.stepSize = stepSize;

            // Cập nhật labels và data
            spendingChart.data.labels = data.labels;
            spendingChart.data.datasets[0].data = data.income;
            spendingChart.data.datasets[1].data = data.expense;

            // Cập nhật y-axis labels
            updateYAxisLabels(yAxisMax);

            spendingChart.update();
            updateSummary(data.income, data.expense);
        }
    }

    function calculateStepSize(maxValue) {
        // Tính toán stepSize phù hợp dựa trên maxValue
        const log10 = Math.floor(Math.log10(maxValue));
        const power10 = Math.pow(10, log10);
        
        if (maxValue / power10 <= 2) return power10 / 2;
        if (maxValue / power10 <= 5) return power10;
        return power10 * 2;
    }

    function updateYAxisLabels(maxValue) {
        const yAxisDiv = document.querySelector('.y-axis');
        if (!yAxisDiv) return;

        // Xóa các label cũ
        yAxisDiv.innerHTML = '';

        // Tạo 11 mốc giá trị từ 0 đến maxValue
        const step = maxValue / 10;
        for (let i = 10; i >= 0; i--) {
            const value = Math.round(step * i);
            const label = document.createElement('span');
            label.textContent = value.toLocaleString() + 'đ';
            yAxisDiv.appendChild(label);
        }
    }

    function processTransactionsForMonth(transactions) {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        const income = Array(daysInMonth).fill(0);
        const expense = Array(daysInMonth).fill(0);
        const labels = Array.from({length: daysInMonth}, (_, i) => `Ngày ${i + 1}`);

        transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                const day = date.getDate() - 1;
                if (transaction.type === 'income') {
                    income[day] += parseFloat(transaction.amount);
                } else {
                    expense[day] += parseFloat(transaction.amount);
                }
            }
        });

        return { labels, income, expense };
    }

    function processTransactionsForWeek(transactions) {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Bắt đầu từ thứ 2
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const labels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
        const income = Array(7).fill(0);
        const expense = Array(7).fill(0);

        transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            if (date >= startOfWeek && date <= endOfWeek) {
                const dayIndex = (date.getDay() + 6) % 7; // Chuyển đổi để thứ 2 = 0
                if (transaction.type === 'income') {
                    income[dayIndex] += parseFloat(transaction.amount);
                } else {
                    expense[dayIndex] += parseFloat(transaction.amount);
                }
            }
        });

        return { labels, income, expense };
    }

    function processTransactionsForDay(transactions) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const labels = Array.from({length: 24}, (_, i) => `${i}:00`);
        const income = Array(24).fill(0);
        const expense = Array(24).fill(0);

        transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            if (date.toDateString() === today.toDateString()) {
                const hour = date.getHours();
                if (transaction.type === 'income') {
                    income[hour] += parseFloat(transaction.amount);
                } else {
                    expense[hour] += parseFloat(transaction.amount);
                }
            }
        });

        return { labels, income, expense };
    }

    function processTransactionsForYear(transactions) {
        const today = new Date();
        const currentYear = today.getFullYear();
        
        const labels = [
            'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
            'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
        ];
        const income = Array(12).fill(0);
        const expense = Array(12).fill(0);

        transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            if (date.getFullYear() === currentYear) {
                const month = date.getMonth();
                if (transaction.type === 'income') {
                    income[month] += parseFloat(transaction.amount);
                } else {
                    expense[month] += parseFloat(transaction.amount);
            }
        }
    });

        return { labels, income, expense };
    }

    function updateSummary(incomeData, expenseData) {
        const totalIncome = incomeData.reduce((a, b) => a + b, 0);
        const totalExpense = expenseData.reduce((a, b) => a + b, 0);
        const balance = totalIncome - totalExpense;

        const values = document.querySelectorAll('.legend-item .value');
        values[0].textContent = totalIncome.toLocaleString() + 'đ';
        values[1].textContent = totalExpense.toLocaleString() + 'đ';
        values[2].textContent = balance.toLocaleString() + 'đ';
    }

    // Khởi tạo biểu đồ phân tích công việc
    function renderTaskAnalysisChart() {
        const taskProgressChartContainer = document.getElementById('taskProgressChart');
        taskProgressChartContainer.innerHTML = '';
        const taskProgressCtx = document.createElement('canvas');
        taskProgressChartContainer.appendChild(taskProgressCtx);

        // Lấy dữ liệu dự án từ localStorage
        const projectsDataObj = JSON.parse(localStorage.getItem('projectsData')) || {};
        const projects = Object.values(projectsDataObj);
        const pendingCount = projects.filter(p => p.status === 'pending').length;
        const ongoingCount = projects.filter(p => p.status === 'ongoing').length;
        const completedCount = projects.filter(p => p.status === 'completed').length;

        new Chart(taskProgressCtx, {
            type: 'doughnut',
            data: {
                labels: ['Đang xét', 'Đang thực hiện', 'Đã hoàn thành'],
                datasets: [{
                    data: [pendingCount, ongoingCount, completedCount],
                    backgroundColor: [
                        '#FFC107', // Đang xét (vàng)
                        '#2196F3', // Đang thực hiện (xanh dương)
                        '#4CAF50'  // Đã hoàn thành (xanh lá)
                    ]
                }]
            },
            options: {
                responsive: true,
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        // Cập nhật số lượng công việc
        document.querySelector('.task-stat-item .stat-value').textContent = projects.length;
        // Render legend mới
        renderTaskLegend(pendingCount, ongoingCount, completedCount);
        // Cập nhật số lượng đang thực hiện
        const ongoingCountSpan = document.getElementById('ongoing-count');
        if (ongoingCountSpan) ongoingCountSpan.textContent = ongoingCount;
    }

    function renderTaskLegend(pendingCount, ongoingCount, completedCount) {
        const legendContainer = document.querySelector('.task-legend');
        if (!legendContainer) return;
        legendContainer.innerHTML = `
            <div class="legend-item">
                <span class="legend-color" style="background:#FFC107;"></span>
                <span>Đang xét</span>
                <span class="legend-value">${pendingCount}</span>
            </div>
            <div class="legend-item">
                <span class="legend-color" style="background:#2196F3;"></span>
                <span>Đang thực hiện</span>
                <span class="legend-value">${ongoingCount}</span>
            </div>
            <div class="legend-item">
                <span class="legend-color" style="background:#4CAF50;"></span>
                <span>Đã hoàn thành</span>
                <span class="legend-value">${completedCount}</span>
            </div>
        `;
    }

    // Gọi hàm khi trang load
    renderTaskAnalysisChart();
    // Lắng nghe sự kiện storage để cập nhật khi có thay đổi
    window.addEventListener('storage', function(e) {
        if (e.key === 'projectsData') {
            renderTaskAnalysisChart();
        }
    });

    // Xử lý nút chuyển trang trong bảng thành viên
    const prevPageBtn = document.querySelector('.prev-page');
    const nextPageBtn = document.querySelector('.next-page');
    const currentPageSpan = document.querySelector('.current-page');
    let currentPage = 1;
    const totalPages = 1;

    if (prevPageBtn && nextPageBtn && currentPageSpan) {
    prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
        }
    });

    nextPageBtn.addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination();
        }
    });
    }

    function updatePagination() {
        currentPageSpan.textContent = currentPage;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
    }

    // Xử lý nút xóa và chỉnh sửa thành viên
    const deleteButtons = document.querySelectorAll('.delete-btn');
    const editButtons = document.querySelectorAll('.edit-btn');

    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (confirm('Bạn có chắc chắn muốn xóa thành viên này?')) {
                const row = this.closest('tr');
                row.remove();
            }
        });
    });

    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const name = row.querySelector('.user-info span').textContent;
            alert(`Chỉnh sửa thông tin của ${name}`);
        });
    });

    // Xử lý điều hướng lịch
    const prevMonthBtn = document.querySelector('.prev-month');
    const nextMonthBtn = document.querySelector('.next-month');
    const currentMonthSpan = document.querySelector('.current-month');
    let currentDate = new Date();

    if (prevMonthBtn && nextMonthBtn && currentMonthSpan) {
    prevMonthBtn.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendar();
    });

    nextMonthBtn.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendar();
    });
    }

    function updateCalendar() {
        const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                       'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
        currentMonthSpan.textContent = `${months[currentDate.getMonth()]}, ${currentDate.getFullYear()}`;
    }

    // Khởi tạo calendar
    if (currentMonthSpan) {
    updateCalendar();
    }

    // Hàm format ngày tháng theo định dạng Việt Nam
    function formatVietnameseDate(date) {
        const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        const day = days[date.getDay()];
        const dateNum = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}, ${dateNum}/${month}/${year}`;
    }

    // Cập nhật ngày hiện tại
    function updateCurrentDate() {
        const currentDateElement = document.getElementById('current-date');
        if (currentDateElement) {
            const currentDate = new Date();
            currentDateElement.textContent = formatVietnameseDate(currentDate);
        }
    }

    // Đếm số dự án đang thực hiện
    function countOngoingProjects() {
        const ongoingProjectsElement = document.getElementById('ongoing-count');
        const ongoingProjectsElement2 = document.getElementById('ongoing-projects');
        try {
            const projectsDataObj = JSON.parse(localStorage.getItem('projectsData')) || {};
            const ongoingCountObj = Object.values(projectsDataObj)
                .filter(project => project.status === 'ongoing').length;
            if (ongoingProjectsElement) ongoingProjectsElement.textContent = ongoingCountObj;
            if (ongoingProjectsElement2) ongoingProjectsElement2.textContent = ongoingCountObj;
        } catch (error) {
            console.error('Lỗi khi đếm dự án:', error);
            if (ongoingProjectsElement) ongoingProjectsElement.textContent = '0';
            if (ongoingProjectsElement2) ongoingProjectsElement2.textContent = '0';
        }
    }

    // Đếm tổng số thành viên
    function countTotalMembers() {
        const totalMembersElement = document.getElementById('total-members');
        if (totalMembersElement) {
            try {
                const validMemberCount = parseInt(localStorage.getItem('validMemberCount')) || 0;
                totalMembersElement.textContent = validMemberCount;
            } catch (error) {
                console.error('Lỗi khi đếm thành viên:', error);
                totalMembersElement.textContent = '0';
            }
        }
    }

    // Hàm khởi tạo dashboard
    function initializeDashboard() {
        updateCurrentDate();
        countOngoingProjects();
        countTotalMembers();
        initializeSpendingChart();
        renderLeaveRequests();
        
        // Cập nhật ngày mỗi phút
        setInterval(updateCurrentDate, 60000);
    }

    // Lắng nghe sự kiện storage change
    window.addEventListener('storage', function(e) {
        if (e.key === 'projectsData') {
            countOngoingProjects();
        } else if (e.key === 'members') {
            countTotalMembers();
        } else if (e.key === 'leaveHistory') {
            renderLeaveRequests();
        }
    });

    // Hiển thị các dự án đang thực hiện lên phần lịch
    function renderOngoingProjectsCalendar() {
        const calendarBody = document.querySelector('.calendar-body');
        if (!calendarBody) return;
        calendarBody.innerHTML = '';
        // Lấy dữ liệu dự án từ localStorage
        const projectsDataObj = JSON.parse(localStorage.getItem('projectsData')) || {};
        const membersDataObj = JSON.parse(localStorage.getItem('membersData')) || {};
        const ongoingProjects = Object.values(projectsDataObj).filter(project => project.status === 'ongoing');
        if (ongoingProjects.length === 0) {
            calendarBody.innerHTML = '<div style="color:#888;text-align:center;padding:24px 0;">Không có dự án đang thực hiện</div>';
            return;
        }
        ongoingProjects.forEach(project => {
            let leaderName = 'Không rõ nhóm trưởng';
            if (project.leader) {
                if (typeof project.leader === 'object' && project.leader.name) {
                    leaderName = project.leader.name;
                } else if (typeof project.leader === 'string' && membersDataObj[project.leader] && membersDataObj[project.leader].name) {
                    leaderName = membersDataObj[project.leader].name;
                } else if (typeof project.leader === 'string') {
                    leaderName = project.leader;
                }
            }
            const eventDiv = document.createElement('div');
            eventDiv.className = 'calendar-event';
            eventDiv.innerHTML = `
                <div class=\"event-date\">${project.startDate ? new Date(project.startDate).toLocaleDateString('vi-VN') : ''} - ${project.endDate ? new Date(project.endDate).toLocaleDateString('vi-VN') : ''}</div>
                <div class=\"event-content\">
                    <h4>${project.title || 'Không rõ tên dự án'}</h4>
                    <p>${leaderName}</p>
                </div>
            `;
            // Thêm sự kiện click để chuyển hướng sang trang projects
            eventDiv.style.cursor = 'pointer';
            eventDiv.addEventListener('click', function() {
                window.location.href = 'projects.html';
            });
            calendarBody.appendChild(eventDiv);
        });
    }

    // Gọi hàm khi trang load
    renderOngoingProjectsCalendar();
    // Lắng nghe sự kiện storage để cập nhật lịch khi có thay đổi
    window.addEventListener('storage', function(e) {
        if (e.key === 'projectsData') {
            renderOngoingProjectsCalendar();
        }
    });

    // Hàm hiển thị đơn xin vắng mặt
    function renderLeaveRequests() {
        const leaveList = document.querySelector('.leave-list');
        if (!leaveList) return;

        // Lấy dữ liệu từ localStorage
        const leaveHistory = JSON.parse(localStorage.getItem('leaveHistory')) || [];
        const membersData = JSON.parse(localStorage.getItem('membersData')) || {};

        // Sắp xếp theo createdAt hoặc startDate (mới nhất lên đầu)
        const sortedLeaves = leaveHistory.slice().sort((a, b) => {
            if (a.createdAt && b.createdAt) {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else {
                return new Date(b.startDate) - new Date(a.startDate);
            }
        });

        // Cập nhật số lượng đơn trong badge
        const badge = document.querySelector('.leave-requests .badge');
        if (badge) {
            badge.textContent = leaveHistory.length;
        }

        // Nếu không có đơn nào
        if (sortedLeaves.length === 0) {
            leaveList.innerHTML = '<div class="no-leaves">Không có đơn xin vắng mặt nào</div>';
            return;
        }

        // Hiển thị tối đa 3 đơn mới nhất
        const showLeaves = sortedLeaves.slice(0, 3);
        leaveList.innerHTML = showLeaves.map(leave => {
            let member = null;
            if (leave.handover && membersData[leave.handover]) {
                member = membersData[leave.handover];
            } else if (leave.memberId && membersData[leave.memberId]) {
                member = membersData[leave.memberId];
            } else if (leave.userId && membersData[leave.userId]) {
                member = membersData[leave.userId];
            }
            return `
                <div class="leave-box-detail" style="margin-bottom: 18px;">
                    <div class="leave-box-header">
                        <img src="${member && member.avatar ? member.avatar : 'https://via.placeholder.com/48'}" alt="User" class="leave-box-avatar">
                        <div class="leave-box-user">
                            <h4>${member && member.name ? member.name : 'Ẩn danh'}</h4>
                            <span>${member && (member.role || member.position) ? (member.role || member.position) : 'Không rõ'}</span>
                        </div>
                    </div>
                    <div class="leave-box-info">
                        <div><b>Loại nghỉ phép:</b> ${getLeaveTypeName(leave.leaveType) || ''}</div>
                        <div><b>Thời gian:</b> ${formatDate(leave.startDate)} - ${formatDate(leave.endDate)}</div>
                        <div><b>Trạng thái:</b> <span class="leave-status ${leave.status}">${getStatusName(leave.status)}</span></div>
                        ${leave.reason ? `<div><b>Lý do:</b> ${leave.reason}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Nếu có nhiều hơn 3 đơn, thêm nút Xem tất cả
        if (sortedLeaves.length > 3) {
            leaveList.innerHTML += `<div style="text-align:center;margin-top:8px;">
                <button class="see-all-leave-btn" style="padding:8px 20px;border-radius:8px;background:#F15A24;color:#fff;border:none;font-weight:600;cursor:pointer;transition:background 0.2s;">Xem tất cả</button>
            </div>`;
            // Thêm sự kiện click cho nút
            setTimeout(() => {
                const btn = document.querySelector('.see-all-leave-btn');
                if (btn) btn.onclick = () => window.location.href = 'leave-request.html';
            }, 0);
        }
    }

    // Hàm helper để lấy tên trạng thái
    function getStatusName(status) {
        const statuses = {
            'pending': 'Đang xét',
            'approved': 'Đã duyệt',
            'rejected': 'Từ chối'
        };
        return statuses[status] || status;
    }

    // Hàm helper để lấy tên loại nghỉ phép
    function getLeaveTypeName(type) {
        const types = {
            'annual': 'Nghỉ phép năm',
            'sick': 'Nghỉ ốm',
            'personal': 'Việc cá nhân',
            'other': 'Khác'
        };
        return types[type] || type || '';
    }

    // Hàm helper để format ngày tháng theo định dạng Việt Nam
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date)) return dateString;
        return date.toLocaleDateString('vi-VN');
    }

    // Khởi tạo dashboard
    initializeDashboard();

    function renderMemberContributions() {
        const tableBody = document.querySelector('.member-contributions tbody');
        if (!tableBody) return;
        // Lấy dữ liệu thành viên và dự án
        const membersDataObj = JSON.parse(localStorage.getItem('membersData')) || {};
        const projectsDataObj = JSON.parse(localStorage.getItem('projectsData')) || {};
        const projects = Object.values(projectsDataObj);
        // Xóa nội dung cũ
        tableBody.innerHTML = '';
        // Duyệt từng thành viên
        Object.entries(membersDataObj).forEach(([memberId, member]) => {
            // Đếm số dự án có mặt
            let joinedCount = 0;
            let absentCount = 0;
            projects.forEach(project => {
                if (project.members && Array.isArray(project.members)) {
                    const isJoined = project.members.some(m => m.id == memberId);
                    if (isJoined) joinedCount++;
                    else absentCount++;
                } else {
                    absentCount++;
                }
            });
            // Render từng dòng
            tableBody.innerHTML += `
                <tr>
                    <td>
                        <div class="user-info">
                            <img src="${member.avatar || 'https://via.placeholder.com/40'}" alt="User">
                            <span>${member.name || ''}</span>
                        </div>
                    </td>
                    <td>${member.email || ''}</td>
                    <td>${joinedCount}</td>
                    <td>${absentCount}</td>
                    <td>${member.position || ''}</td>
                    <td><span class="status online">Hoạt động</span></td>
                    <td>
                        <div class="actions">
                            <button class="delete-btn"><i class="fas fa-trash"></i></button>
                            <button class="edit-btn"><i class="fas fa-edit"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    // Gọi khi trang load
    renderMemberContributions();
    // Lắng nghe sự kiện storage để cập nhật khi có thay đổi
    window.addEventListener('storage', function(e) {
        if (e.key === 'membersData' || e.key === 'projectsData') {
            renderMemberContributions();
        }
    });
}); 