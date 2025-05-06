// Khởi tạo dữ liệu mẫu
const defaultMembersData = {
    1: {
        name: 'Richard Tyson',
        position: 'CEO at Tokopedia',
        email: 'richardtyson@gmail.com',
        phone: '+628132513288',
        empId: 'CLT - 001',
        avatar: 'path/to/avatar.jpg',
        address: 'Merdeka Street, Wonosobo',
        department: 'Executive',
        joinDate: '2020-01-01',
        status: 'Active'
    },
    2: {
        name: 'Daffa Naufal',
        position: 'Developer',
        email: 'daffanaufal@gmail.com',
        phone: '+6212345678',
        empId: 'GGL - 001',
        avatar: 'path/to/avatar.jpg',
        address: '123 Tech Street',
        department: 'Engineering',
        joinDate: '2021-03-15',
        status: 'Active'
    }
};

// Xóa toàn bộ dữ liệu trong localStorage
function clearAllData() {
    localStorage.removeItem('members');
    localStorage.removeItem('membersData');
    localStorage.removeItem('nextMemberId');
}

// Hàm để lưu dữ liệu vào localStorage
function saveMembersData() {
    try {
        // Lọc chỉ lưu thành viên hợp lệ
        const validMembers = {};
        Object.entries(membersData).forEach(([id, member]) => {
            if (member && member.name && member.email && member.position) {
                validMembers[id] = member;
            }
        });
        localStorage.removeItem('members');
        localStorage.setItem('membersData', JSON.stringify(validMembers));
        console.log('Đã lưu dữ liệu thành viên:', validMembers);
    } catch (error) {
        console.error('Lỗi khi lưu dữ liệu:', error);
    }
}

// Hàm để đọc dữ liệu từ localStorage
function loadMembersData() {
    try {
        const savedData = localStorage.getItem('membersData');
        console.log('Dữ liệu đọc từ localStorage:', savedData);
        
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            // Kiểm tra xem dữ liệu có đúng định dạng không
            if (typeof parsedData === 'object' && !Array.isArray(parsedData)) {
                return {
                    membersData: parsedData,
                    nextMemberId: Math.max(...Object.keys(parsedData).map(Number), 0) + 1
                };
            }
        }
        // Nếu không có dữ liệu hoặc dữ liệu không hợp lệ, sử dụng dữ liệu mặc định
        return {
            membersData: defaultMembersData,
            nextMemberId: Object.keys(defaultMembersData).length + 1
        };
    } catch (error) {
        console.error('Lỗi khi đọc dữ liệu:', error);
        return {
            membersData: defaultMembersData,
            nextMemberId: Object.keys(defaultMembersData).length + 1
        };
    }
}

// Khởi tạo dữ liệu
const { membersData, nextMemberId: loadedNextMemberId } = loadMembersData();
let nextMemberId = loadedNextMemberId;
let selectedAvatarFile = null;

// Modal functions
function openModal() {
    document.getElementById('addMemberModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('addMemberModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('addMemberModal');
    if (event.target == modal) {
        closeModal();
    }
}

// Hàm để cập nhật giao diện bảng thành viên
function updateMembersTable() {
    const tbody = document.querySelector('.client-table tbody');
    tbody.innerHTML = ''; // Xóa dữ liệu cũ

    // Lọc ra các thành viên có dữ liệu hợp lệ
    const validMembers = Object.entries(membersData).filter(([_, member]) => 
        member && member.name && member.name.trim() !== ''
    );

    // Thêm lại các hàng từ dữ liệu hợp lệ
    validMembers.forEach(([memberId, member]) => {
        const tr = document.createElement('tr');
        tr.dataset.memberId = memberId;
        tr.innerHTML = `
            <td>${member.name || ''}</td>
            <td>${member.position || ''}</td>
            <td>${member.email || ''}</td>
            <td>${member.phone || ''}</td>
            <td>${member.empId || ''}</td>
        `;

        // Thêm event listener cho hàng
        tr.addEventListener('click', () => {
            document.querySelectorAll('.client-table tbody tr').forEach(row => {
                row.classList.remove('selected');
            });
            tr.classList.add('selected');
            showMemberDetail(memberId);
        });

        tbody.appendChild(tr);
    });

    // Cập nhật số lượng thành viên trong localStorage
    const memberCount = validMembers.length;
    localStorage.setItem('validMemberCount', memberCount.toString());
}

// Hiển thị chi tiết thành viên
function showMemberDetail(memberId) {
    const member = membersData[memberId];
    if (!member) return;

    const memberDetail = document.querySelector('.member-detail');
    
    // Cập nhật thông tin
    const avatarImg = memberDetail.querySelector('.member-avatar');
    if (member.avatar && member.avatar !== 'path/to/default-avatar.jpg') {
        avatarImg.src = member.avatar;
    } else {
        avatarImg.src = 'path/to/default-avatar.jpg';
    }
    
    memberDetail.querySelector('.member-basic-info h2').textContent = member.name;
    memberDetail.querySelector('.member-position').textContent = member.position;
    memberDetail.querySelector('.emp-id').textContent = member.empId;
    memberDetail.querySelector('.email').textContent = member.email;
    memberDetail.querySelector('.phone').textContent = member.phone;
    memberDetail.querySelector('.address').textContent = member.address;
    memberDetail.querySelector('.department').textContent = member.department;
    memberDetail.querySelector('.join-date').textContent = member.joinDate;
    memberDetail.querySelector('.status').textContent = member.status;

    // Thêm data-member-id vào nút xóa
    const deleteButton = memberDetail.querySelector('.delete-member-btn');
    if (deleteButton) {
        deleteButton.dataset.memberId = memberId;
    } else {
        const newDeleteButton = document.createElement('button');
        newDeleteButton.className = 'delete-member-btn';
        newDeleteButton.innerHTML = '<i class="fas fa-trash"></i> Xóa thành viên';
        newDeleteButton.dataset.memberId = memberId;
        memberDetail.querySelector('.member-detail-header').appendChild(newDeleteButton);
    }

    // Hiển thị section chi tiết
    memberDetail.classList.add('active');
}

// Xử lý upload avatar
function initializeAvatarUpload() {
    const avatarPreview = document.querySelector('.avatar-preview');
    const avatarInput = document.getElementById('avatarInput');
    const previewImg = document.getElementById('avatarPreview');

    // Click vào preview để mở file input
    avatarPreview.addEventListener('click', () => {
        avatarInput.click();
    });

    // Xử lý khi chọn file
    avatarInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            selectedAvatarFile = file; // Lưu file đã chọn
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    });
}

// Handle form submission
function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    // Kiểm tra dữ liệu bắt buộc
    if (!data.name || !data.email || !data.position) {
        alert('Vui lòng nhập đầy đủ Họ tên, Email và Chức vụ!');
        return;
    }
    // Xử lý avatar
    let avatarUrl = 'path/to/default-avatar.jpg';
    if (selectedAvatarFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const avatarBase64 = e.target.result;
            const newMemberId = nextMemberId++;
            membersData[newMemberId] = {
                name: data.name,
                position: data.position,
                email: data.email,
                phone: data.phone,
                empId: data.empId,
                avatar: avatarBase64,
                address: data.address,
                department: data.department,
                joinDate: data.joinDate,
                status: 'Active'
            };
            saveMembersData();
            updateMembersTable();
            selectedAvatarFile = null;
            event.target.reset();
            document.getElementById('avatarPreview').src = 'path/to/default-avatar.jpg';
            closeModal();
        };
        reader.readAsDataURL(selectedAvatarFile);
        return;
    }
    // Nếu không có avatar
    const newMemberId = nextMemberId++;
    membersData[newMemberId] = {
        name: data.name,
        position: data.position,
        email: data.email,
        phone: data.phone,
        empId: data.empId,
        avatar: avatarUrl,
        address: data.address,
        department: data.department,
        joinDate: data.joinDate,
        status: 'Active'
    };
    saveMembersData();
    updateMembersTable();
    selectedAvatarFile = null;
    event.target.reset();
    document.getElementById('avatarPreview').src = 'path/to/default-avatar.jpg';
    closeModal();
}

// Hàm xóa thành viên
function deleteMember(memberId) {
    try {
        if (confirm('Bạn có chắc chắn muốn xóa thành viên này không?')) {
            // Xóa thành viên khỏi dữ liệu
            delete membersData[memberId];
            
            // Lưu vào localStorage
            saveMembersData();
            
            // Cập nhật giao diện
            updateMembersTable();
            
            // Ẩn chi tiết thành viên
            const memberDetail = document.querySelector('.member-detail');
            memberDetail.classList.remove('active');
            
            console.log('Đã xóa thành viên:', memberId);
            console.log('Dữ liệu sau khi xóa:', membersData);
        }
    } catch (error) {
        console.error('Lỗi khi xóa thành viên:', error);
    }
}

// Khởi tạo event listeners khi trang được load
document.addEventListener('DOMContentLoaded', () => {
    // Cập nhật bảng với dữ liệu từ localStorage
    updateMembersTable();
    
    // Khởi tạo upload avatar
    initializeAvatarUpload();
    
    // Thêm event listener cho form
    const addMemberForm = document.getElementById('addMemberForm');
    if (addMemberForm) {
        addMemberForm.addEventListener('submit', handleSubmit);
    }

    // Thêm event listener cho nút đóng chi tiết thành viên
    const closeDetailBtn = document.querySelector('.member-detail .close-btn');
    if (closeDetailBtn) {
        closeDetailBtn.addEventListener('click', () => {
            document.querySelector('.member-detail').classList.remove('active');
            document.querySelectorAll('.client-table tbody tr').forEach(row => {
                row.classList.remove('selected');
            });
        });
    }

    // Thêm event listener cho nút xóa thành viên
    document.addEventListener('click', function(e) {
        if (e.target.closest('.delete-member-btn')) {
            const deleteBtn = e.target.closest('.delete-member-btn');
            const memberId = deleteBtn.dataset.memberId;
            if (memberId) {
                deleteMember(memberId);
            }
        }
    });
});

// Hàm thêm thành viên mới
function saveMember(memberData) {
    try {
        // Kiểm tra dữ liệu hợp lệ
        if (!memberData.name || memberData.name.trim() === '') {
            console.error('Tên thành viên không được để trống');
            return;
        }

        const newMemberId = nextMemberId++;
        membersData[newMemberId] = {
            ...memberData,
            status: 'Active'
        };
        
        // Lưu vào localStorage
        saveMembersData();
        
        // Cập nhật giao diện
        updateMembersTable();
        
        console.log('Đã thêm thành viên mới:', memberData);
        console.log('Dữ liệu sau khi thêm:', membersData);
    } catch (error) {
        console.error('Lỗi khi thêm thành viên:', error);
    }
}
