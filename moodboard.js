// Dữ liệu mẫu cho demo (bạn có thể thay bằng API/backend thực tế)
let moodData = [
    // {name: "Nguyễn Văn A", mood: "happy", status: "Hôm nay rất vui!", date: "2024-05-07"},
    // {name: "Trần Thị B", mood: "sad", status: "Mệt mỏi quá...", date: "2024-05-07"},
];

// Lưu trạng thái emoji được chọn
let selectedMood = null;

// Xử lý chọn emoji
document.querySelectorAll('.emoji').forEach(e => {
    e.onclick = function() {
        document.querySelectorAll('.emoji').forEach(em => em.classList.remove('selected'));
        this.classList.add('selected');
        selectedMood = this.getAttribute('data-mood');
    }
});

// Gửi tâm trạng
document.getElementById('submit-mood').onclick = function() {
    const status = document.getElementById('mood-status').value.trim();
    if (!selectedMood) {
        alert('Vui lòng chọn một biểu cảm!');
        return;
    }
    // Giả lập tên thành viên (bạn thay bằng tên đăng nhập thực tế)
    const name = "Ẩn danh";
    const today = new Date().toISOString().slice(0,10);
    moodData.push({name, mood: selectedMood, status, date: today});
    document.getElementById('mood-status').value = '';
    document.querySelectorAll('.emoji').forEach(em => em.classList.remove('selected'));
    selectedMood = null;
    renderChart();
    renderStats();
    alert('Đã gửi tâm trạng!');
};

// Vẽ biểu đồ tâm trạng
let moodChart = null;
function renderChart() {
    const period = document.getElementById('mood-period').value;
    let labels = [], happy = [], neutral = [], sad = [], excited = [];
    if (period === 'day') {
        // Thống kê theo ngày
        let days = {};
        moodData.forEach(item => {
            days[item.date] = days[item.date] || {happy:0,neutral:0,sad:0,excited:0};
            days[item.date][item.mood]++;
        });
        labels = Object.keys(days);
        labels.forEach(d => {
            happy.push(days[d].happy);
            neutral.push(days[d].neutral);
            sad.push(days[d].sad);
            excited.push(days[d].excited);
        });
    } else {
        // Thống kê theo tuần
        let weeks = {};
        moodData.forEach(item => {
            const week = getWeek(item.date);
            weeks[week] = weeks[week] || {happy:0,neutral:0,sad:0,excited:0};
            weeks[week][item.mood]++;
        });
        labels = Object.keys(weeks);
        labels.forEach(w => {
            happy.push(weeks[w].happy);
            neutral.push(weeks[w].neutral);
            sad.push(weeks[w].sad);
            excited.push(weeks[w].excited);
        });
    }
    if (moodChart) moodChart.destroy();
    const ctx = document.getElementById('moodChart').getContext('2d');
    moodChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {label: '😃 Vui', data: happy, backgroundColor: '#4caf50'},
                {label: '😐 Bình thường', data: neutral, backgroundColor: '#ffc107'},
                {label: '😢 Buồn', data: sad, backgroundColor: '#2196f3'},
                {label: '🔥 Hăng hái', data: excited, backgroundColor: '#ff5722'},
            ]
        },
        options: {
            responsive: true,
            plugins: {legend: {position: 'top'}},
            scales: {y: {beginAtZero: true}}
        }
    });
}

// Lấy tuần từ ngày
function getWeek(dateStr) {
    const d = new Date(dateStr);
    const onejan = new Date(d.getFullYear(),0,1);
    return d.getFullYear() + '-Tuần ' + Math.ceil((((d - onejan) / 86400000) + onejan.getDay()+1)/7);
}

// Thống kê ai stress, ai hăng hái...
function renderStats() {
    let today = new Date().toISOString().slice(0,10);
    let todayMoods = moodData.filter(m => m.date === today);
    let stats = todayMoods.map(m => {
        let moodText = '';
        if (m.mood === 'sad') moodText = 'Đang stress 😢';
        else if (m.mood === 'excited') moodText = 'Rất hăng hái 🔥';
        else if (m.mood === 'happy') moodText = 'Tâm trạng tốt 😃';
        else moodText = 'Bình thường 😐';
        return `<li><b>${m.name}</b>: ${moodText} <i>(${m.status || 'Không có trạng thái'})</i></li>`;
    });
    document.getElementById('mood-stats-list').innerHTML = stats.join('') || '<li>Chưa có dữ liệu hôm nay.</li>';
}

// Đổi chế độ xem biểu đồ
document.getElementById('mood-period').onchange = renderChart;

// Khởi tạo
renderChart();
renderStats(); 