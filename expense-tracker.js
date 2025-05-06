// Dữ liệu mẫu cho biểu đồ
const spendingData = {
    labels: ['Jan', 'Feb', 'March', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    income: [25000, 30000, 35000, 40000, 45000, 40000, 35000, 45000, 40000, 45000, 40000, 45000],
    expenses: [20000, 25000, 30000, 35000, 30000, 35000, 30000, 35000, 30000, 35000, 30000, 35000]
};

// Khởi tạo biến toàn cục cho biểu đồ và thời gian hiện tại
let spendingChart = null;
let currentTimeRange = 'month';

// Khởi tạo biến lưu trữ tổng thu chi
let totalIncome = 0;
let totalExpense = 0;
let balance = 0;

// Thêm biến cho phân trang
let currentPage = 1;
const itemsPerPage = 3;

// Hàm lấy dữ liệu giao dịch từ localStorage
function getTransactions() {
    return JSON.parse(localStorage.getItem('transactions') || '[]');
}

// Hàm lưu dữ liệu giao dịch vào localStorage
function saveTransactions(transactions) {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Hàm tính toán tổng thu chi
function calculateTotals() {
    const transactions = getTransactions();
    
    totalIncome = 0;
    totalExpense = 0;
    
    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncome += transaction.amount;
        } else {
            totalExpense += transaction.amount;
        }
    });
    
    balance = totalIncome - totalExpense;
}

// Hàm cập nhật giá trị hiển thị
function updateDisplayValues() {
    document.getElementById('balance-display').textContent = new Intl.NumberFormat('vi-VN').format(balance);
    document.getElementById('income-display').textContent = new Intl.NumberFormat('vi-VN').format(totalIncome);
    document.getElementById('expense-display').textContent = new Intl.NumberFormat('vi-VN').format(totalExpense);
}

// Hàm xử lý giao dịch mới
function handleNewTransaction(e) {
    e.preventDefault();
    
    // Lấy dữ liệu từ form
    const formData = new FormData(e.target);
    const transaction = {
        type: formData.get('type'),
        amount: parseFloat(formData.get('amount')),
        category: formData.get('category'),
        date: formData.get('date'),
        description: formData.get('description')
    };
    
    // Lấy danh sách giao dịch hiện tại
    const transactions = getTransactions();
    
    // Thêm giao dịch mới
    transactions.push(transaction);
    
    // Lưu vào localStorage
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Tính toán lại tổng
    calculateTotals();
    
    // Đóng form và reset animation
    const form = document.getElementById('transactionForm');
    const contentWrapper = document.querySelector('.content-wrapper');
    
    form.classList.remove('active');
    contentWrapper.classList.remove('form-active');
    
    setTimeout(() => {
        form.style.display = 'none';
        e.target.reset();
    }, 300);
    
    // Cập nhật UI
    updateUI();
}

// Hàm cập nhật toàn bộ UI
function updateUI() {
    // Cập nhật số liệu
    updateDisplayValues();
    
    // Cập nhật biểu đồ
    initializeChart(currentTimeRange);
    
    // Cập nhật lịch sử giao dịch
    renderTransactionHistory();
}

// Hàm lấy khoảng thời gian
function getDateRange(timeRange) {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch(timeRange) {
        case 'day':
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'week':
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            startDate = new Date(now.setDate(diff));
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
            break;
        default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    return { startDate, endDate };
}

// Hàm tạo labels cho biểu đồ
function generateLabels(timeRange, startDate, endDate) {
    const labels = [];
    const current = new Date(startDate);

    switch(timeRange) {
        case 'day':
            for(let i = 0; i < 24; i++) {
                labels.push(`${i}:00`);
            }
            break;
        case 'week':
            const weekdays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
            labels.push(...weekdays);
            break;
        case 'month':
            while(current <= endDate) {
                labels.push(current.getDate().toString());
                current.setDate(current.getDate() + 1);
            }
            break;
        case 'year':
            const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
            labels.push(...months);
            break;
        default:
            while(current <= endDate) {
                labels.push(current.getDate().toString());
                current.setDate(current.getDate() + 1);
            }
    }

    return labels;
}

// Hàm tạo dữ liệu cho biểu đồ
function getChartData(transactions, timeRange) {
    const { startDate, endDate } = getDateRange(timeRange);
    const labels = generateLabels(timeRange, startDate, endDate);
    
    const incomeData = new Array(labels.length).fill(0);
    const expenseData = new Array(labels.length).fill(0);

    const filteredTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date >= startDate && date <= endDate;
    });

    filteredTransactions.forEach(t => {
        const date = new Date(t.date);
        let index;

        switch(timeRange) {
            case 'day':
                index = date.getHours();
                break;
            case 'week':
                const day = date.getDay();
                index = day === 0 ? 6 : day - 1;
                break;
            case 'month':
                index = date.getDate() - 1;
                break;
            case 'year':
                index = date.getMonth();
                break;
            default:
                index = date.getDate() - 1;
        }

        if (index >= 0 && index < labels.length) {
            if (t.type === 'income') {
                incomeData[index] += parseFloat(t.amount);
            } else {
                expenseData[index] += parseFloat(t.amount);
            }
        }
    });

    return { labels, incomeData, expenseData };
}

// Hàm tạo biểu đồ
function initializeChart(timeRange = 'month') {
    const ctx = document.getElementById('spendingChart').getContext('2d');
    const transactions = getTransactions();
    const { labels, incomeData, expenseData } = getChartData(transactions, timeRange);
    
    if (spendingChart) {
        spendingChart.destroy();
    }

    spendingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Thu nhập',
                    data: incomeData,
                    borderColor: '#2ed573',
                    backgroundColor: 'rgba(46, 213, 115, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Chi tiêu',
                    data: expenseData,
                    borderColor: '#ff4757',
                    backgroundColor: 'rgba(255, 71, 87, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#2d3436',
                    bodyColor: '#2d3436',
                    borderColor: '#dfe6e9',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(context.parsed.y);
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(value);
                        },
                        font: {
                            size: 11
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Hàm cập nhật hiển thị thống kê
function updateStats(stats) {
    const formatNumber = num => new Intl.NumberFormat('vi-VN').format(num);
    
    // Cập nhật tổng tiền
    const totalElement = document.querySelector('.stat-card:first-child .value');
    if (totalElement) totalElement.textContent = formatNumber(stats.balance);
    
    // Cập nhật thu nhập
    const incomeElement = document.querySelector('.stat-card.highlight .value');
    if (incomeElement) incomeElement.textContent = formatNumber(stats.totalIncome);
    
    // Cập nhật chi tiêu
    const expenseElement = document.querySelector('.stat-card:last-child .value');
    if (expenseElement) expenseElement.textContent = formatNumber(stats.totalExpense);
}

// Hàm hiển thị/ẩn form giao dịch
function toggleTransactionForm() {
    const form = document.getElementById('transactionForm');
    const contentWrapper = document.querySelector('.content-wrapper');
    
    if (form.style.display === 'none') {
        // Hiển thị form
        form.style.display = 'block';
        contentWrapper.classList.add('form-active');
        
        // Animation mượt mà
        setTimeout(() => {
            form.classList.add('active');
        }, 10);
    } else {
        // Ẩn form
        form.classList.remove('active');
        contentWrapper.classList.remove('form-active');
        
        // Đợi animation hoàn thành rồi mới ẩn form
        setTimeout(() => {
            form.style.display = 'none';
        }, 300);
    }
}

// Khởi tạo các event listener
document.addEventListener('DOMContentLoaded', function() {
    // Tính toán tổng thu chi ban đầu
    calculateTotals();
    
    // Cập nhật toàn bộ UI
    updateUI();
    
    // Lắng nghe sự kiện submit form
    const addTransactionForm = document.getElementById('addTransactionForm');
    if (addTransactionForm) {
        addTransactionForm.addEventListener('submit', handleNewTransaction);
        
        // Tự động điền ngày giờ hiện tại
        const dateInput = document.getElementById('date');
        if (dateInput) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            dateInput.value = now.toISOString().slice(0, 16);
        }
        
        // Xử lý khi chọn loại giao dịch
        const typeInputs = document.querySelectorAll('input[name="type"]');
        const categorySelect = document.getElementById('category');
        typeInputs.forEach(input => {
            input.addEventListener('change', function() {
                const type = this.value;
                const options = categorySelect.querySelectorAll('optgroup');
                options.forEach(group => {
                    if (type === 'income' && group.label === 'Thu' ||
                        type === 'expense' && group.label === 'Chi') {
                        group.style.display = 'block';
                    } else {
                        group.style.display = 'none';
                    }
                });
                categorySelect.value = '';
            });
        });
    }
    
    // Xử lý thay đổi khoảng thời gian cho biểu đồ
    const timeRangeSelect = document.querySelector('.time-range-select');
    if (timeRangeSelect) {
        timeRangeSelect.addEventListener('change', function(e) {
            currentTimeRange = e.target.value;
            initializeChart(currentTimeRange);
        });
    }

    // Thêm event listeners cho nút phân trang
    document.getElementById('prevPage').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderTransactionHistory();
        }
    });

    document.getElementById('nextPage').addEventListener('click', function() {
        const transactions = getTransactions();
        const totalPages = Math.ceil(transactions.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTransactionHistory();
        }
    });
});

// Hàm render lịch sử giao dịch với phân trang
function renderTransactionHistory() {
    const transactions = getTransactions();
    const container = document.querySelector('.transactions');
    container.innerHTML = '';
    
    // Sắp xếp giao dịch theo thời gian mới nhất
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Tính toán số trang
    const totalPages = Math.ceil(transactions.length / itemsPerPage);
    document.getElementById('totalPages').textContent = totalPages;
    document.getElementById('currentPage').textContent = currentPage;
    
    // Enable/disable nút phân trang
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
    
    // Lấy các giao dịch của trang hiện tại
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTransactions = transactions.slice(startIndex, endIndex);
    
    // Render các giao dịch
    currentTransactions.forEach(transaction => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        
        item.innerHTML = `
            <div class="transaction-info">
                <div class="service-icon" style="background: ${transaction.type === 'income' ? '#e1f8e9' : '#ffebee'}">
                    <i class="fas ${transaction.type === 'income' ? 'fa-arrow-down' : 'fa-arrow-up'}" 
                       style="color: ${transaction.type === 'income' ? '#2ed573' : '#ff4757'}"></i>
                </div>
                <div class="service-details">
                    <div class="service-name">${transaction.category}</div>
                    <div class="transaction-id">${transaction.description || 'Giao dịch không có mô tả'}</div>
                </div>
            </div>
            <div class="transaction-details">
                <div class="transaction-amount ${transaction.type === 'income' ? 'positive' : 'negative'}">
                    ${transaction.type === 'income' ? '+' : '-'}${new Intl.NumberFormat('vi-VN').format(transaction.amount)} VNĐ
                </div>
                <div class="transaction-date">${new Date(transaction.date).toLocaleDateString('vi-VN')}</div>
            </div>
        `;
        
        container.appendChild(item);
    });
}

// Hàm xóa tất cả dữ liệu
function clearAllData() {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu giao dịch không?')) {
        localStorage.removeItem('transactions');
        totalIncome = 0;
        totalExpense = 0;
        balance = 0;
        updateUI();
        alert('Đã xóa tất cả dữ liệu giao dịch thành công!');
    }
} 