// Khởi tạo dữ liệu mẫu
const defaultProjectsData = {
    1: {
        title: 'Website CLB',
        description: 'Xây dựng website quản lý thành viên CLB',
        startDate: '2024-04-20',
        endDate: '2024-05-30',
        status: 'ongoing',
        leader: {
            id: 1,
            name: 'Richard Tyson',
            avatar: 'path/to/leader-avatar.jpg'
        },
        members: [
            {
                id: 2,
                name: 'Daffa Naufal',
                avatar: 'path/to/member1.jpg'
            },
            {
                id: 3,
                name: 'Member 2',
                avatar: 'path/to/member2.jpg'
            }
        ]
    }
};

// Lấy dữ liệu thành viên từ localStorage
function loadMembersData() {
    const savedData = localStorage.getItem('membersData');
    console.log('Dữ liệu thành viên từ localStorage:', savedData);
    if (!savedData) {
        console.log('Không tìm thấy dữ liệu thành viên trong localStorage');
        return [];
    }
    try {
        const parsedData = JSON.parse(savedData);
        console.log('Dữ liệu thành viên sau khi parse:', parsedData);
        
        // Chuyển đổi object thành array
        const membersArray = Object.entries(parsedData).map(([id, member]) => ({
            ...member,
            id: id
        }));
        
        console.log('Mảng thành viên sau khi chuyển đổi:', membersArray);
        return membersArray;
    } catch (error) {
        console.error('Lỗi khi parse dữ liệu thành viên:', error);
        return [];
    }
}

// Xử lý đường dẫn avatar
function getAvatarUrl(avatarPath) {
    if (!avatarPath) return 'https://via.placeholder.com/32';
    if (avatarPath.startsWith('data:')) return avatarPath;
    return 'https://via.placeholder.com/32';
}

// Lưu trữ dữ liệu
function saveProjectsData() {
    localStorage.setItem('projectsData', JSON.stringify(projectsData));
}

// Đọc dữ liệu từ localStorage
function loadProjectsData() {
    const savedData = localStorage.getItem('projectsData');
    return savedData ? JSON.parse(savedData) : defaultProjectsData;
}

// Khởi tạo dữ liệu
let projectsData = loadProjectsData();

// Định nghĩa trạng thái và màu sắc
const projectStatusMap = {
    pending: { text: 'Chờ xử lý', class: 'pending' },
    ongoing: { text: 'Đang thực hiện', class: 'ongoing' },
    completed: { text: 'Hoàn thành', class: 'completed' }
};

// Format date string
function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
}

// Hiển thị danh sách dự án
function renderProjects() {
    const projectsGrid = document.querySelector('.projects-grid');
    projectsGrid.innerHTML = '';

    Object.entries(projectsData).forEach(([id, project]) => {
        // Tạo card dự án
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.dataset.projectId = id;

        // Xác định class cho trạng thái
        const statusClass = project.status || 'pending';
        const statusText = {
            'pending': 'Chờ xử lý',
            'ongoing': 'Đang thực hiện',
            'completed': 'Hoàn thành'
        }[project.status] || 'Chờ xử lý';

        projectCard.innerHTML = `
            <div class="project-header">
                <div class="project-status ${statusClass}">${statusText}</div>
                <div class="project-menu">
                    <i class="fas fa-ellipsis-v"></i>
                    <div class="project-menu-dropdown">
                        <div class="menu-item status-item" data-status="pending">
                            <i class="fas fa-clock"></i> Chờ xử lý
                        </div>
                        <div class="menu-item status-item" data-status="ongoing">
                            <i class="fas fa-tasks"></i> Đang thực hiện
                        </div>
                        <div class="menu-item status-item" data-status="completed">
                            <i class="fas fa-check-circle"></i> Hoàn thành
                        </div>
                        <div class="menu-item delete-item">
                            <i class="fas fa-trash-alt"></i> Xóa dự án
                        </div>
                    </div>
                </div>
            </div>
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description || ''}</p>
            <div class="project-info">
                <div class="project-dates">
                    <div class="date-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Bắt đầu: ${formatDate(project.startDate)}</span>
                    </div>
                    <div class="date-item">
                        <i class="fas fa-calendar-check"></i>
                        <span>Kết thúc: ${formatDate(project.endDate)}</span>
                    </div>
                </div>
                <div class="project-team">
                    <div class="team-leader">
                        <label>Nhóm trưởng:</label>
                        <div class="member-avatar" title="${project.leader || 'Chưa có'}">
                            <img src="${getAvatarUrl(project.leaderAvatar)}" alt="Leader">
                        </div>
                    </div>
                    <div class="team-members">
                        <label>Thành viên:</label>
                        <div class="member-avatars">
                            ${project.members ? project.members.slice(0, 2).map(member => `
                                <div class="member-avatar" title="${member.name || ''}">
                                    <img src="${getAvatarUrl(member.avatar)}" alt="${member.name || ''}">
                                </div>
                            `).join('') : ''}
                            ${project.members && project.members.length > 2 ? `
                                <div class="member-count">+${project.members.length - 2}</div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Thêm sự kiện cho menu
        const menuIcon = projectCard.querySelector('.project-menu i');
        const dropdown = projectCard.querySelector('.project-menu-dropdown');
        
        menuIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            // Nếu menu đã mở thì đóng lại, chưa mở thì mở ra
            const isActive = dropdown.classList.contains('active');
            closeAllProjectMenus();
            if (!isActive) {
                dropdown.classList.add('active');
            }
        });

        // Thêm sự kiện cho các nút trạng thái
        const statusItems = projectCard.querySelectorAll('.status-item');
        statusItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const newStatus = item.dataset.status;
                updateProjectStatus(id, newStatus);
                dropdown.classList.remove('active');
            });
        });

        // Thêm sự kiện cho nút xóa
        const deleteItem = projectCard.querySelector('.delete-item');
        deleteItem.addEventListener('click', (e) => {
            e.stopPropagation();
            confirmDeleteProject(id);
            dropdown.classList.remove('active');
        });

        projectsGrid.appendChild(projectCard);
    });

    // Cập nhật số lượng dự án trong localStorage
    const projectCount = Object.keys(projectsData).length;
    localStorage.setItem('projectCount', projectCount.toString());
}

// Cập nhật trạng thái dự án
function updateProjectStatus(projectId, newStatus) {
    console.log('Bắt đầu cập nhật trạng thái:', { projectId, newStatus });
    try {
        // Cập nhật trong projectsData
        if (projectsData[projectId]) {
            projectsData[projectId].status = newStatus;
            localStorage.setItem('projectsData', JSON.stringify(projectsData));
            window.dispatchEvent(new Event('storage'));
            console.log('Đã cập nhật projectsData');
        }
        // Cập nhật lại giao diện
        renderProjects();
        console.log('Đã cập nhật giao diện');
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái:', error);
    }
}

// Đóng tất cả menu dự án
function closeAllProjectMenus() {
    document.querySelectorAll('.project-menu-dropdown.active').forEach(menu => {
        menu.classList.remove('active');
    });
}

// Xác nhận xóa dự án
function confirmDeleteProject(projectId) {
    console.log('Bắt đầu xóa dự án:', projectId);
    if (confirm('Bạn có chắc chắn muốn xóa dự án này không?')) {
        try {
            // Xóa dự án khỏi dữ liệu
            delete projectsData[projectId];
            // Lưu vào localStorage
            localStorage.setItem('projectsData', JSON.stringify(projectsData));
            window.dispatchEvent(new Event('storage'));
            // Cập nhật lại giao diện
            renderProjects();
            console.log('Đã xóa dự án thành công:', projectId);
            console.log('Dữ liệu sau khi xóa:', projectsData);
        } catch (error) {
            console.error('Lỗi khi xóa dự án:', error);
        }
    }
}

// Cập nhật select nhóm trưởng và danh sách thành viên
function updateMemberSelections() {
    const members = loadMembersData();
    console.log('Danh sách thành viên sau khi xử lý:', members);
    
    const leaderSelect = document.getElementById('projectLeader');
    const memberSelection = document.querySelector('.member-selection');
    
    if (!leaderSelect || !memberSelection) {
        console.error('Không tìm thấy elements cần thiết:', { leaderSelect, memberSelection });
        return;
    }
    
    // Cập nhật select nhóm trưởng
    leaderSelect.innerHTML = '<option value="">Chọn nhóm trưởng</option>';
    if (members.length > 0) {
        members.forEach(member => {
            if (member && member.id && member.name) {
                leaderSelect.innerHTML += `
                    <option value="${member.id}">${member.name}</option>
                `;
            }
        });
    }
    
    // Cập nhật danh sách chọn thành viên
    memberSelection.innerHTML = '';
    if (members.length === 0) {
        memberSelection.innerHTML = '<p>Chưa có thành viên nào</p>';
    } else {
        members.forEach(member => {
            if (member && member.id && member.name) {
                const avatarUrl = getAvatarUrl(member.avatar);
                memberSelection.innerHTML += `
                    <div class="member-checkbox">
                        <input type="checkbox" id="member${member.id}" name="projectMembers" value="${member.id}">
                        <label for="member${member.id}">
                            <img src="${avatarUrl}" alt="${member.name}" class="member-avatar-small">
                            <span class="member-name">${member.name}</span>
                        </label>
                    </div>
                `;
            }
        });
    }
}

// DOM Elements
const createProjectForm = document.getElementById('createProjectForm');
const modalOverlay = document.getElementById('modalOverlay');
const projectForm = document.getElementById('projectForm');

// Show create project form
function showCreateProjectForm() {
    createProjectForm.classList.add('active');
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateMemberSelections(); // Cập nhật danh sách thành viên khi mở form
}

// Hide create project form
function hideCreateProjectForm() {
    createProjectForm.classList.remove('active');
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    projectForm.reset();
}

// Close modal when clicking outside
modalOverlay.addEventListener('click', hideCreateProjectForm);

// Prevent form closing when clicking inside the form
createProjectForm.addEventListener('click', (e) => {
    e.stopPropagation();
});

// Hàm lưu dự án mới
function saveProject(projectData) {
    try {
        // Tạo ID mới cho dự án
        const projectId = Date.now().toString();
        // Lấy dữ liệu dự án hiện có
        const currentProjects = JSON.parse(localStorage.getItem('projectsData')) || {};
        // Thêm dự án mới
        currentProjects[projectId] = {
            ...projectData,
            status: 'pending' // Trạng thái mặc định khi tạo
        };
        // Lưu vào localStorage
        localStorage.setItem('projectsData', JSON.stringify(currentProjects));
        window.dispatchEvent(new Event('storage'));
        // Cập nhật biến toàn cục
        projectsData = currentProjects;
        // Cập nhật giao diện
        renderProjects();
        console.log('Đã tạo dự án mới:', projectData);
        console.log('Dữ liệu sau khi thêm:', projectsData);
        return true;
    } catch (error) {
        console.error('Lỗi khi tạo dự án:', error);
        return false;
    }
}

// Xử lý form tạo dự án
document.getElementById('projectForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    try {
        // Thu thập dữ liệu từ form
        const projectData = {
            title: document.getElementById('projectName').value,
            description: document.getElementById('projectDescription').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            leader: document.getElementById('projectLeader').value,
            members: Array.from(document.querySelectorAll('input[name="projectMembers"]:checked')).map(cb => ({
                id: cb.value,
                name: cb.nextElementSibling.querySelector('.member-name').textContent,
                avatar: cb.nextElementSibling.querySelector('img').src
            }))
        };
        
        console.log('Dữ liệu dự án được thu thập:', projectData);
        
        // Kiểm tra dữ liệu
        if (!projectData.title || !projectData.startDate || !projectData.endDate) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }
        
        // Lưu dự án
        if (saveProject(projectData)) {
            // Đóng form và reset
            hideCreateProjectForm();
            this.reset();
        } else {
            alert('Có lỗi xảy ra khi tạo dự án');
        }
    } catch (error) {
        console.error('Lỗi khi xử lý form:', error);
        alert('Có lỗi xảy ra khi xử lý form');
    }
});

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', () => {
    renderProjects();
    
    // Đóng menu khi click ra ngoài
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.project-menu')) {
            closeAllProjectMenus();
        }
    });
}); 