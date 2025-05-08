// Dữ liệu mẫu badges, titles
const BADGES = [
    { id: 'excellent', label: 'Thành viên xuất sắc tháng', img: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png' },
    { id: 'starter', label: 'Khởi đầu mạnh mẽ', img: 'https://cdn-icons-png.flaticon.com/512/190/190411.png' },
    { id: 'idea', label: 'Ý tưởng vàng', img: 'https://cdn-icons-png.flaticon.com/512/190/190406.png' }
];
const TITLES = [
    { id: 'leader', label: 'Leader kỳ cựu' },
    { id: 'report', label: 'Chiến thần báo cáo' }
];

// Tính cấp độ từ XP
function calculateLevel(xp) {
    return Math.floor(0.1 * Math.sqrt(xp));
}

// Lấy danh sách thành viên từ localStorage
function getMembers() {
    const data = localStorage.getItem('membersData');
    if (!data) return {};
    return JSON.parse(data);
}

// Lấy danh sách dự án từ localStorage
function getProjects() {
    const data = localStorage.getItem('projectsData');
    if (!data) return {};
    return JSON.parse(data);
}

// Lấy danh sách sự kiện từ localStorage
function getEvents() {
    const data = localStorage.getItem('eventsData');
    if (!data) return {};
    return JSON.parse(data);
}

// Lấy danh sách bình chọn từ localStorage
function getVotes() {
    const data = localStorage.getItem('votesData');
    if (!data) return {};
    return JSON.parse(data);
}

// Render dropdown chọn thành viên
function renderMemberDropdown(members) {
    const select = document.getElementById('select-member');
    select.innerHTML = '';
    Object.entries(members).forEach(([id, member]) => {
        if (member && member.name) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = member.name;
            select.appendChild(option);
        }
    });
}

// Tính tổng điểm XP của thành viên dựa trên các hoạt động
function getMemberXP(memberId, projects, events, votes) {
    let xp = 0;
    // XP từ dự án
    Object.values(projects).forEach(project => {
        // Leader dự án: +100 XP
        if (project.leader == memberId || (project.leader && project.leader.id == memberId)) {
            xp += 100;
        }
        // Thành viên dự án: +50 XP
        if (project.members && Array.isArray(project.members)) {
            if (project.members.some(m => m.id == memberId || m.id == +memberId)) {
                xp += 50;
            }
        }
        // Báo cáo đúng hạn: +20 XP
        if (project.reports && project.reports.includes(memberId)) {
            xp += 20;
        }
    });
    // XP từ sự kiện
    Object.values(events).forEach(event => {
        if (event.participants && event.participants.includes(memberId)) {
            xp += 30; // Tham gia sự kiện: +30 XP
        }
    });
    // XP từ bình chọn
    Object.values(votes).forEach(vote => {
        if (vote.participants && vote.participants.includes(memberId)) {
            xp += 15; // Tham gia bình chọn: +15 XP
        }
    });
    return xp;
}

// Lấy danh sách huy hiệu của thành viên dựa trên thành tích
function getMemberBadges(memberId, xp, projects, events, votes) {
    const badges = [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    // Thành viên xuất sắc tháng: XP cao nhất trong tháng
    const monthlyXP = calculateMonthlyXP(memberId, projects, events, votes, currentMonth, currentYear);
    if (isTopPerformer(memberId, monthlyXP, currentMonth, currentYear)) {
        badges.push(BADGES[0]);
    }
    // Khởi đầu mạnh mẽ: Tạo tài khoản & hoàn tất hồ sơ
    const member = getMembers()[memberId];
    if (member && member.createdAt && member.profileCompleted) {
        badges.push(BADGES[1]);
    }
    // Ý tưởng vàng: Đề xuất dự án được duyệt
    if (hasApprovedProject(memberId, projects)) {
        badges.push(BADGES[2]);
    }
    return badges;
}

// Lấy danh hiệu của thành viên dựa trên thành tích
function getMemberTitles(memberId, xp, projects) {
    const titles = [];
    // Leader kỳ cựu: Dẫn dắt nhiều dự án
    const leaderCount = countLeaderProjects(memberId, projects);
    if (leaderCount >= 3) {
        titles.push(TITLES[0]);
    }
    // Chiến thần báo cáo: Nhiều báo cáo đúng hạn
    const reportCount = countOnTimeReports(memberId, projects);
    if (reportCount >= 5) {
        titles.push(TITLES[1]);
    }
    return titles;
}

// Tính XP của thành viên trong một tháng cụ thể
function calculateMonthlyXP(memberId, projects, events, votes, month, year) {
    let xp = 0;
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    // Tính XP từ dự án trong tháng
    Object.values(projects).forEach(project => {
        const projectDate = new Date(project.startDate);
        if (projectDate >= startDate && projectDate <= endDate) {
            if (project.leader == memberId || (project.leader && project.leader.id == memberId)) {
                xp += 100;
            }
            if (project.members && project.members.some(m => m.id == memberId || m.id == +memberId)) {
                xp += 50;
            }
            if (project.reports && project.reports.includes(memberId)) {
                xp += 20;
            }
        }
    });
    // Tính XP từ sự kiện trong tháng
    Object.values(events).forEach(event => {
        const eventDate = new Date(event.date);
        if (eventDate >= startDate && eventDate <= endDate && 
            event.participants && event.participants.includes(memberId)) {
            xp += 30;
        }
    });
    // Tính XP từ bình chọn trong tháng
    Object.values(votes).forEach(vote => {
        const voteDate = new Date(vote.date);
        if (voteDate >= startDate && voteDate <= endDate && 
            vote.participants && vote.participants.includes(memberId)) {
            xp += 15;
        }
    });
    return xp;
}

// Kiểm tra thành viên có phải là người xuất sắc nhất tháng không
function isTopPerformer(memberId, monthlyXP, month, year) {
    const members = getMembers();
    let maxXP = monthlyXP;
    let isTop = true;
    Object.keys(members).forEach(id => {
        if (id !== memberId) {
            const otherXP = calculateMonthlyXP(id, getProjects(), getEvents(), getVotes(), month, year);
            if (otherXP > maxXP) {
                isTop = false;
            }
        }
    });
    return isTop;
}

// Kiểm tra thành viên có dự án được duyệt không (ý tưởng vàng)
function hasApprovedProject(memberId, projects) {
    return Object.values(projects).some(project => 
        (project.leader == memberId || (project.leader && project.leader.id == memberId)) && project.status === 'ongoing'
    );
}

// Đếm số dự án thành viên làm leader
function countLeaderProjects(memberId, projects) {
    return Object.values(projects).filter(project => 
        project.leader == memberId || (project.leader && project.leader.id == memberId)
    ).length;
}

// Đếm số báo cáo đúng hạn của thành viên
function countOnTimeReports(memberId, projects) {
    return Object.values(projects).filter(project => 
        project.reports && project.reports.includes(memberId)
    ).length;
}

// Lấy lịch sử đóng góp của thành viên
function getMemberHistory(memberId, projects, events, votes) {
    const history = [];
    // Thêm lịch sử từ dự án
    Object.values(projects).forEach(project => {
        if (project.members && Array.isArray(project.members) && 
            project.members.some(m => m.id == memberId || m.id == +memberId)) {
            history.push({
                date: project.startDate,
                desc: `Tham gia dự án "${project.title}"`
            });
        }
        if (project.leader == memberId || (project.leader && project.leader.id == memberId)) {
            history.push({
                date: project.startDate,
                desc: `Dẫn dắt dự án "${project.title}"`
            });
        }
    });
    // Thêm lịch sử từ sự kiện
    Object.values(events).forEach(event => {
        if (event.participants && event.participants.includes(memberId)) {
            history.push({
                date: event.date,
                desc: `Tham gia sự kiện "${event.title}"`
            });
        }
    });
    // Thêm lịch sử từ bình chọn
    Object.values(votes).forEach(vote => {
        if (vote.participants && vote.participants.includes(memberId)) {
            history.push({
                date: vote.date,
                desc: `Tham gia bình chọn "${vote.title}"`
            });
        }
    });
    // Sắp xếp mới nhất lên đầu
    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Render toàn bộ hồ sơ thành viên khi chọn
function renderProfile(memberId) {
    const members = getMembers();
    const projects = getProjects();
    const events = getEvents();
    const votes = getVotes();
    const member = members[memberId];
    if (!member) return;
    // Avatar, tên, vai trò
    document.getElementById('profile-avatar').src = member.avatar || 'https://via.placeholder.com/100';
    document.getElementById('profile-name').textContent = member.name;
    document.getElementById('profile-role').textContent = 'Vai trò: ' + (member.position || 'Thành viên');
    // XP, level
    const xp = getMemberXP(memberId, projects, events, votes);
    const level = calculateLevel(xp);
    document.getElementById('profile-xp').textContent = xp;
    document.getElementById('profile-level').textContent = level;
    // Thanh tiến độ
    const nextLevelXP = Math.pow(level + 1, 2) * 100;
    const percent = Math.min(100, Math.round((xp / nextLevelXP) * 100));
    document.getElementById('xp-bar').style.width = percent + '%';
    // Badges
    const badges = getMemberBadges(memberId, xp, projects, events, votes);
    const badgesList = document.getElementById('badges-list');
    badgesList.innerHTML = '';
    badges.forEach(badge => {
        badgesList.innerHTML += `<div class="badge-item"><img src="${badge.img}" alt="${badge.label}"><div class="badge-label">${badge.label}</div></div>`;
    });
    // Titles
    const titles = getMemberTitles(memberId, xp, projects);
    const titlesList = document.getElementById('titles-list');
    titlesList.innerHTML = '';
    titles.forEach(title => {
        titlesList.innerHTML += `<div class="title-item">${title.label}</div>`;
    });
    // History
    const history = getMemberHistory(memberId, projects, events, votes);
    const historyTimeline = document.getElementById('history-timeline');
    historyTimeline.innerHTML = '';
    history.forEach(item => {
        historyTimeline.innerHTML += `<div class="timeline-item"><div class="timeline-date">${item.date || ''}</div><div class="timeline-desc">${item.desc}</div></div>`;
    });
    // Leaderboard
    renderLeaderboard(members, projects, events, votes);
}

// Render bảng xếp hạng top 5 thành viên nhiều XP nhất
function renderLeaderboard(members, projects, events, votes) {
    const arr = Object.entries(members).map(([id, m]) => ({
        id, 
        name: m.name, 
        avatar: m.avatar, 
        xp: getMemberXP(id, projects, events, votes)
    }));
    arr.sort((a, b) => b.xp - a.xp);
    const tbody = document.querySelector('#leaderboard-table tbody');
    tbody.innerHTML = '';
    arr.slice(0, 5).forEach((m, idx) => {
        tbody.innerHTML += `<tr><td>${idx + 1}</td><td><img src="${m.avatar || 'https://via.placeholder.com/32'}" style="width:28px;height:28px;border-radius:50%;vertical-align:middle;margin-right:8px;">${m.name}</td><td>${m.xp}</td></tr>`;
    });
}

// Khởi tạo khi load trang
window.addEventListener('DOMContentLoaded', () => {
    const members = getMembers();
    renderMemberDropdown(members);
    const select = document.getElementById('select-member');
    if (select.options.length > 0) {
        renderProfile(select.value);
    }
    select.addEventListener('change', function() {
        renderProfile(this.value);
    });
}); 