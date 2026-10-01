// ==========================================
// STUDY MATCH - SCRIPT.JS
// ==========================================

// ===============================
// DỮ LIỆU LOCAL STORAGE
// ===============================

let users = JSON.parse(localStorage.getItem("studyUsers")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let messages = JSON.parse(localStorage.getItem("studyMessages")) || [];
let notifications = JSON.parse(localStorage.getItem("studyNotifications")) || [];
let connectionRequests = JSON.parse(localStorage.getItem("studyConnectionRequests")) || [];

let selectedChatUserId = null;


// ===============================
// CHUẨN HÓA DỮ LIỆU CŨ
// ===============================

users = users.map(function(user) {
    if (!Array.isArray(user.connections)) {
        user.connections = [];
    }

    return user;
});

if (currentUser) {
    const savedUser = users.find(function(user) {
        return user.id === currentUser.id;
    });

    if (savedUser) {
        currentUser = savedUser;
    }

    if (!Array.isArray(currentUser.connections)) {
        currentUser.connections = [];
    }
}


// ===============================
// LƯU DỮ LIỆU
// ===============================

function saveUsers() {
    localStorage.setItem("studyUsers", JSON.stringify(users));
}

function saveMessages() {
    localStorage.setItem("studyMessages", JSON.stringify(messages));
}

function saveNotifications() {
    localStorage.setItem("studyNotifications", JSON.stringify(notifications));
}

function saveConnectionRequests() {
    localStorage.setItem(
        "studyConnectionRequests",
        JSON.stringify(connectionRequests)
    );
}

function saveCurrentUser() {
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
}


// ===============================
// ESCAPE HTML
// ===============================

function escapeHTML(text) {
    if (text === undefined || text === null) {
        return "";
    }

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ===============================
// HIỂN THỊ TRANG
// ===============================

function showPage(pageId) {
    const pages = document.querySelectorAll(".page");

    pages.forEach(function(page) {
        page.classList.add("hidden");
    });

    const targetPage = document.getElementById(pageId);

    if (targetPage) {
        targetPage.classList.remove("hidden");
    }

    // Đóng notification khi chuyển trang
    const notificationPanel = document.getElementById("notificationPanel");

    if (notificationPanel) {
        notificationPanel.classList.add("hidden");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ===============================
// ĐĂNG KÝ
// ===============================

function register() {
    const nameInput = document.getElementById("registerName");
    const emailInput = document.getElementById("registerEmail");
    const passwordInput = document.getElementById("registerPassword");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();

    if (!name || !email || !password) {
        alert("Vui lòng nhập đầy đủ thông tin.");
        return;
    }

    if (password.length < 4) {
        alert("Mật khẩu cần ít nhất 4 ký tự.");
        return;
    }

    const existingUser = users.find(function(user) {
        return user.email === email;
    });

    if (existingUser) {
        alert("Email này đã được đăng ký.");
        return;
    }

    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        good: "",
        weak: "",
        time: "",
        connections: []
    };

    users.push(newUser);

    saveUsers();

    alert("Đăng ký thành công! Hãy đăng nhập.");

    nameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";

    showPage("login");
}


// ===============================
// ĐĂNG NHẬP
// ===============================

function login() {
    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();

    const user = users.find(function(item) {
        return item.email === email && item.password === password;
    });

    if (!user) {
        alert("Email hoặc mật khẩu không đúng.");
        return;
    }

    currentUser = user;

    if (!Array.isArray(currentUser.connections)) {
        currentUser.connections = [];
    }

    saveCurrentUser();

    emailInput.value = "";
    passwordInput.value = "";

    loadDashboard();
}


// ===============================
// ĐĂNG XUẤT
// ===============================

function logout() {
    currentUser = null;
    selectedChatUserId = null;

    localStorage.removeItem("currentUser");

    const chatSection = document.getElementById("chatSection");

    if (chatSection) {
        chatSection.classList.add("hidden");
    }

    showPage("home");
}


// ===============================
// LOAD DASHBOARD
// ===============================

function loadDashboard() {
    if (!currentUser) {
        showPage("home");
        return;
    }

    const userName = document.getElementById("userName");

    if (userName) {
        userName.textContent = currentUser.name;
    }

    const profileName = document.getElementById("profileName");
    const goodSubject = document.getElementById("goodSubject");
    const weakSubject = document.getElementById("weakSubject");
    const studyTime = document.getElementById("studyTime");

    if (profileName) {
        profileName.value = currentUser.name || "";
    }

    if (goodSubject) {
        goodSubject.value = currentUser.good || "";
    }

    if (weakSubject) {
        weakSubject.value = currentUser.weak || "";
    }

    if (studyTime) {
        studyTime.value = currentUser.time || "";
    }

    showPage("dashboard");

    renderNotifications();

    const chatSection = document.getElementById("chatSection");

    if (chatSection) {
        chatSection.classList.add("hidden");
    }

    if (
        currentUser.good &&
        currentUser.weak &&
        currentUser.time
    ) {
        createMyStudyPlan();
        findMatches();
    }
}


// ===============================
// LƯU HỒ SƠ
// ===============================

function saveProfile() {
    if (!currentUser) {
        alert("Vui lòng đăng nhập.");
        return;
    }

    const name = document.getElementById("profileName").value.trim();
    const good = document.getElementById("goodSubject").value;
    const weak = document.getElementById("weakSubject").value;
    const time = document.getElementById("studyTime").value;

    if (!name || !good || !weak || !time) {
        alert("Vui lòng điền đầy đủ hồ sơ.");
        return;
    }

    if (good === weak) {
        alert("Môn mạnh và môn yếu nên khác nhau nhé.");
        return;
    }

    currentUser.name = name;
    currentUser.good = good;
    currentUser.weak = weak;
    currentUser.time = time;

    const index = users.findIndex(function(user) {
        return user.id === currentUser.id;
    });

    if (index !== -1) {
        users[index] = currentUser;
    }

    saveUsers();
    saveCurrentUser();

    const userName = document.getElementById("userName");

    if (userName) {
        userName.textContent = currentUser.name;
    }

    alert("Đã lưu hồ sơ!");

    createMyStudyPlan();
    findMatches();
}


// ===============================
// TẠO LỘ TRÌNH HỌC
// ===============================

function createMyStudyPlan() {
    if (!currentUser) {
        return;
    }

    if (
        !currentUser.good ||
        !currentUser.weak ||
        !currentUser.time
    ) {
        return;
    }

    const plan = document.getElementById("studyPlan");
    const planIntro = document.getElementById("planIntro");
    const planContent = document.getElementById("planContent");

    if (!plan || !planIntro || !planContent) {
        return;
    }

    plan.classList.remove("hidden");

    planIntro.innerHTML = `
        Lộ trình được tạo dựa trên môn mạnh
        <strong>${escapeHTML(currentUser.good)}</strong>,
        môn cần cải thiện
        <strong>${escapeHTML(currentUser.weak)}</strong>
        và thời gian học
        <strong>${escapeHTML(currentUser.time)}</strong>.
    `;

    const days = [
        {
            day: "Ngày 1",
            title: "Kiểm tra nền tảng",
            content:
                `Ôn lại kiến thức cơ bản của môn ${currentUser.weak}. Ghi lại những phần bạn chưa chắc.`
        },
        {
            day: "Ngày 2",
            title: "Học kiến thức trọng tâm",
            content:
                `Tập trung vào 1-2 chủ đề quan trọng của môn ${currentUser.weak}.`
        },
        {
            day: "Ngày 3",
            title: "Luyện bài tập",
            content:
                `Làm bài tập từ dễ đến vừa của môn ${currentUser.weak}. Sau mỗi bài, kiểm tra lỗi sai.`
        },
        {
            day: "Ngày 4",
            title: "Củng cố môn mạnh",
            content:
                `Dành một phần thời gian ôn môn ${currentUser.good} để duy trì lợi thế.`
        },
        {
            day: "Ngày 5",
            title: "Luyện tập kết hợp",
            content:
                `Kết hợp ôn ${currentUser.good} và ${currentUser.weak}. Ưu tiên phần bạn còn yếu.`
        },
        {
            day: "Ngày 6",
            title: "Tự kiểm tra",
            content:
                `Làm một bài kiểm tra nhỏ môn ${currentUser.weak} mà không xem tài liệu.`
        },
        {
            day: "Ngày 7",
            title: "Tổng kết",
            content:
                `Xem lại lỗi sai trong tuần và ghi ra 3 kiến thức bạn đã tiến bộ nhất.`
        }
    ];

    planContent.innerHTML = days.map(function(item) {
        return `
            <div class="plan-day">
                <h4>${item.day}: ${item.title}</h4>
                <p>${item.content}</p>
                <span class="time-tag">
                    ⏰ ${escapeHTML(currentUser.time)}
                </span>
            </div>
        `;
    }).join("");
}


// ===============================
// TÍNH ĐIỂM MATCH
// ===============================

function calculateMatchScore(user) {
    if (!currentUser) {
        return 0;
    }

    let score = 0;

    // Người kia giỏi môn mình yếu
    if (user.good === currentUser.weak) {
        score += 60;
    }

    // Người kia yếu môn mình giỏi
    if (user.weak === currentUser.good) {
        score += 25;
    }

    // Cùng thời gian học
    if (user.time === currentUser.time) {
        score += 15;
    }

    if (score > 100) {
        score = 100;
    }

    return score;
}


// ===============================
// TÌM MATCH
// ===============================

function findMatches() {
    const matchesContainer = document.getElementById("matches");

    if (!matchesContainer) {
        return;
    }

    if (!currentUser) {
        matchesContainer.innerHTML = `
            <p>Vui lòng đăng nhập trước.</p>
        `;
        return;
    }

    if (
        !currentUser.good ||
        !currentUser.weak ||
        !currentUser.time
    ) {
        matchesContainer.innerHTML = `
            <p>
                Hãy hoàn thành hồ sơ để tìm người học phù hợp.
            </p>
        `;
        return;
    }

    const matchUsers = users
        .filter(function(user) {
            return user.id !== currentUser.id;
        })
        .map(function(user) {
            return {
                user: user,
                score: calculateMatchScore(user)
            };
        })
        .filter(function(item) {
            return item.score > 0;
        })
        .sort(function(a, b) {
            return b.score - a.score;
        })
        .slice(0, 5);

    if (matchUsers.length === 0) {
        matchesContainer.innerHTML = `
            <p>
                Chưa tìm thấy người phù hợp. Hãy thử lại sau khi có thêm người đăng ký.
            </p>
        `;
        return;
    }

    matchesContainer.innerHTML = matchUsers.map(function(item) {
        const user = item.user;

        const isConnected =
            Array.isArray(currentUser.connections) &&
            currentUser.connections.includes(user.id);

        let buttonHTML = "";

        if (isConnected) {
            buttonHTML = `
                <button onclick="openChat(${user.id})">
                    💬 Nhắn tin
                </button>
            `;
        } else {
            const existingRequest = connectionRequests.find(function(request) {
                return (
                    request.fromId === currentUser.id &&
                    request.toId === user.id &&
                    request.status === "pending"
                );
            });

            if (existingRequest) {
                buttonHTML = `
                    <button disabled>
                        ⏳ Đã gửi yêu cầu
                    </button>
                `;
            } else {
                buttonHTML = `
                    <button onclick="connect(${user.id})">
                        🤝 Gửi yêu cầu
                    </button>
                `;
            }
        }

        return `
            <div class="match-card">
                <div class="match-info">
                    <h3>👤 ${escapeHTML(user.name)}</h3>

                    <p>
                        📚 Giỏi:
                        <strong>${escapeHTML(user.good)}</strong>
                    </p>

                    <p>
                        📖 Cần cải thiện:
                        <strong>${escapeHTML(user.weak)}</strong>
                    </p>

                    <p>
                        ⏰ Thời gian:
                        <strong>${escapeHTML(user.time)}</strong>
                    </p>

                    <div class="match-score">
                        ⭐ ${item.score}% phù hợp
                    </div>
                </div>

                <div class="match-action">
                    ${buttonHTML}
                </div>
            </div>
        `;
    }).join("");
}


// ===============================
// GỬI YÊU CẦU KẾT NỐI
// ===============================

function connect(partnerId) {
    if (!currentUser) {
        alert("Vui lòng đăng nhập.");
        return;
    }

    const partner = users.find(function(user) {
        return user.id === partnerId;
    });

    if (!partner) {
        alert("Không tìm thấy người dùng.");
        return;
    }

    if (partner.id === currentUser.id) {
        return;
    }

    if (!Array.isArray(currentUser.connections)) {
        currentUser.connections = [];
    }

    if (currentUser.connections.includes(partnerId)) {
        alert("Hai bạn đã kết nối rồi.");
        return;
    }

    const existingRequest = connectionRequests.find(function(request) {
        return (
            request.fromId === currentUser.id &&
            request.toId === partnerId &&
            request.status === "pending"
        );
    });

    if (existingRequest) {
        alert("Bạn đã gửi yêu cầu cho người này rồi.");
        return;
    }

    const request = {
        id: String(Date.now() + Math.random()),
        fromId: currentUser.id,
        toId: partnerId,
        status: "pending",
        time: new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit"
        })
    };

    connectionRequests.push(request);

    saveConnectionRequests();

    addNotification(
        partnerId,
        "connection_request",
        `${currentUser.name} đã gửi yêu cầu kết nối với bạn.`,
        request.id
    );

    alert("Đã gửi yêu cầu kết nối!");

    findMatches();
}


// ===============================
// THÊM THÔNG BÁO
// ===============================

function addNotification(
    userId,
    type,
    text,
    relatedId = null
) {
    const notification = {
        id: Date.now() + Math.random(),
        userId: userId,
        type: type,
        text: text,
        relatedId: relatedId,
        read: false,
        time: new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit"
        })
    };

    notifications.push(notification);

    saveNotifications();

    renderNotifications();
}


// ===============================
// HIỂN THỊ THÔNG BÁO
// ===============================

function renderNotifications() {
    const list = document.getElementById("notificationList");
    const count = document.getElementById("notificationCount");

    if (!list || !count) {
        return;
    }

    if (!currentUser) {
        list.innerHTML = `
            <p class="no-notification">
                Đăng nhập để xem thông báo.
            </p>
        `;

        count.classList.add("hidden");

        return;
    }

    const myNotifications = notifications
        .filter(function(notification) {
            return notification.userId === currentUser.id;
        })
        .sort(function(a, b) {
            return b.id - a.id;
        });

    const unreadCount = myNotifications.filter(function(notification) {
        return !notification.read;
    }).length;

    if (unreadCount > 0) {
        count.textContent = unreadCount;
        count.classList.remove("hidden");
    } else {
        count.classList.add("hidden");
    }

    if (myNotifications.length === 0) {
        list.innerHTML = `
            <p class="no-notification">
                Chưa có thông báo.
            </p>
        `;

        return;
    }

    list.innerHTML = myNotifications.map(function(notification) {

        let actionHTML = "";

        // Nếu là yêu cầu kết nối
        if (notification.type === "connection_request") {
            actionHTML = `
                <div class="notification-actions">

                    <button
                        class="accept-btn"
                        onclick="acceptConnectionRequest(
                            '${notification.relatedId}',
                            '${notification.id}'
                        )"
                    >
                        Chấp nhận
                    </button>

                    <button
                        class="reject-btn"
                        onclick="rejectConnectionRequest(
                            '${notification.relatedId}',
                            '${notification.id}'
                        )"
                    >
                        Từ chối
                    </button>

                </div>
            `;
        }

        // Nếu là thông báo tin nhắn
        const clickable =
            notification.type === "message"
                ? `onclick="openChatFromNotification(
                    '${notification.relatedId}',
                    '${notification.id}'
                )"`
                : "";

        return `
            <div
                class="notification-item ${notification.read ? "" : "unread"}"
                ${clickable}
            >

                <div class="notification-text">
                    ${escapeHTML(notification.text)}
                </div>

                <div class="notification-time">
                    ${escapeHTML(notification.time)}
                </div>

                ${actionHTML}

            </div>
        `;
    }).join("");
}


// ===============================
// MỞ / ĐÓNG BẢNG THÔNG BÁO
// ===============================

function toggleNotifications() {
    const panel = document.getElementById("notificationPanel");

    if (!panel) {
        return;
    }

    panel.classList.toggle("hidden");

    if (!currentUser) {
        return;
    }

    if (!panel.classList.contains("hidden")) {

        // Thông báo tin nhắn / accepted / rejected
        // sẽ được đánh dấu đã đọc khi mở bảng.
        //
        // Riêng connection_request giữ unread
        // cho đến khi người dùng Chấp nhận / Từ chối.

        notifications.forEach(function(notification) {

            if (
                notification.userId === currentUser.id &&
                notification.type !== "connection_request"
            ) {
                notification.read = true;
            }
        });

        saveNotifications();

        renderNotifications();
    }
}


// ===============================
// BẤM THÔNG BÁO TIN NHẮN
// → MỞ THẲNG ĐOẠN CHAT
// ===============================

function openChatFromNotification(
    partnerId,
    notificationId
) {
    if (!currentUser) {
        return;
    }

    const notification = notifications.find(function(item) {
        return String(item.id) === String(notificationId);
    });

    if (notification) {
        notification.read = true;

        saveNotifications();
    }

    // Đóng bảng thông báo
    const panel = document.getElementById("notificationPanel");

    if (panel) {
        panel.classList.add("hidden");
    }

    // Mở chat
    openChat(Number(partnerId));

    // Cập nhật số thông báo
    renderNotifications();
}


// ===============================
// CHẤP NHẬN YÊU CẦU
// ===============================

function acceptConnectionRequest(
    requestId,
    notificationId
) {
    if (!currentUser) {
        return;
    }

    const request = connectionRequests.find(function(item) {
        return (
            String(item.id) === String(requestId) &&
            item.status === "pending"
        );
    });

    if (!request) {
        alert("Yêu cầu này không còn tồn tại.");
        return;
    }

    const sender = users.find(function(user) {
        return user.id === request.fromId;
    });

    if (!sender) {
        alert("Không tìm thấy người gửi.");
        return;
    }

    const receiver = users.find(function(user) {
        return user.id === currentUser.id;
    });

    if (!receiver) {
        return;
    }

    if (!Array.isArray(receiver.connections)) {
        receiver.connections = [];
    }

    if (!Array.isArray(sender.connections)) {
        sender.connections = [];
    }

    // Thêm kết nối 2 chiều
    if (!receiver.connections.includes(sender.id)) {
        receiver.connections.push(sender.id);
    }

    if (!sender.connections.includes(receiver.id)) {
        sender.connections.push(receiver.id);
    }

    // Cập nhật trạng thái request
    request.status = "accepted";

    saveUsers();
    saveConnectionRequests();

    // Đồng bộ currentUser
    currentUser = receiver;

    saveCurrentUser();

    // Đánh dấu thông báo cũ
    const notification = notifications.find(function(item) {
        return String(item.id) === String(notificationId);
    });

    if (notification) {
        notification.read = true;
    }

    saveNotifications();

    // Báo cho người gửi
    addNotification(
        sender.id,
        "connection_accepted",
        `${currentUser.name} đã chấp nhận yêu cầu kết nối của bạn.`
    );

    alert(
        `Đã kết nối với ${sender.name}!`
    );

    renderNotifications();
    findMatches();

    // Mở chat luôn
    openChat(sender.id);
}


// ===============================
// TỪ CHỐI YÊU CẦU
// ===============================

function rejectConnectionRequest(
    requestId,
    notificationId
) {
    if (!currentUser) {
        return;
    }

    const request = connectionRequests.find(function(item) {
        return (
            String(item.id) === String(requestId) &&
            item.status === "pending"
        );
    });

    if (!request) {
        alert("Yêu cầu này không còn tồn tại.");
        return;
    }

    const sender = users.find(function(user) {
        return user.id === request.fromId;
    });

    if (!sender) {
        return;
    }

    request.status = "rejected";

    saveConnectionRequests();

    // Đánh dấu thông báo cũ
    const notification = notifications.find(function(item) {
        return String(item.id) === String(notificationId);
    });

    if (notification) {
        notification.read = true;
    }

    saveNotifications();

    // Báo cho người gửi
    addNotification(
        sender.id,
        "connection_rejected",
        `${currentUser.name} đã từ chối yêu cầu kết nối của bạn.`
    );

    alert("Đã từ chối yêu cầu.");

    renderNotifications();
    findMatches();
}


// ===============================
// MỞ CHAT
// ===============================

function openChat(partnerId) {
    if (!currentUser) {
        alert("Vui lòng đăng nhập.");
        return;
    }

    const partner = users.find(function(user) {
        return user.id === partnerId;
    });

    if (!partner) {
        alert("Không tìm thấy người dùng.");
        return;
    }

    if (!Array.isArray(currentUser.connections)) {
        currentUser.connections = [];
    }

    if (!currentUser.connections.includes(partnerId)) {
        alert("Hai bạn chưa kết nối với nhau.");
        return;
    }

    selectedChatUserId = partnerId;

    const chatSection = document.getElementById("chatSection");
    const chatPartnerName = document.getElementById("chatPartnerName");

    if (chatSection) {
        chatSection.classList.remove("hidden");
    }

    if (chatPartnerName) {
        chatPartnerName.textContent = partner.name;
    }

    renderChatMessages();

    const chatInput = document.getElementById("chatInput");

    if (chatInput) {
        setTimeout(function() {
            chatInput.focus();
        }, 100);
    }

    const chatSectionElement = document.getElementById("chatSection");

    if (chatSectionElement) {
        chatSectionElement.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


// ===============================
// ĐÓNG CHAT
// ===============================

function closeChat() {
    selectedChatUserId = null;

    const chatSection = document.getElementById("chatSection");

    if (chatSection) {
        chatSection.classList.add("hidden");
    }
}


// ===============================
// HIỂN THỊ TIN NHẮN
// ===============================

function renderChatMessages() {
    const chatMessages = document.getElementById("chatMessages");

    if (!chatMessages) {
        return;
    }

    if (!currentUser || !selectedChatUserId) {
        chatMessages.innerHTML = "";
        return;
    }

    const chatData = messages.filter(function(message) {
        return (
            (
                message.fromId === currentUser.id &&
                message.toId === selectedChatUserId
            )
            ||
            (
                message.fromId === selectedChatUserId &&
                message.toId === currentUser.id
            )
        );
    });

    if (chatData.length === 0) {
        chatMessages.innerHTML = `
            <div class="no-messages">
                Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện nhé! 💬
            </div>
        `;

        return;
    }

    chatMessages.innerHTML = chatData.map(function(message) {

        const isMine =
            message.fromId === currentUser.id;

        return `
            <div class="message-row ${isMine ? "mine" : "theirs"}">

                <div class="message ${isMine ? "mine" : "theirs"}">
                    ${escapeHTML(message.text)}
                </div>

                <span class="message-time">
                    ${escapeHTML(message.time)}
                </span>

            </div>
        `;
    }).join("");

    // Cuộn xuống tin nhắn mới nhất
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


// ===============================
// GỬI TIN NHẮN
// ===============================

function sendMessage() {
    if (!currentUser) {
        alert("Vui lòng đăng nhập.");
        return;
    }

    if (!selectedChatUserId) {
        alert("Hãy chọn một người để nhắn tin.");
        return;
    }

    const chatInput = document.getElementById("chatInput");

    if (!chatInput) {
        return;
    }

    const text = chatInput.value.trim();

    if (!text) {
        return;
    }

    const partner = users.find(function(user) {
        return user.id === selectedChatUserId;
    });

    if (!partner) {
        alert("Không tìm thấy người nhận.");
        return;
    }

    const message = {
        id: Date.now(),
        fromId: currentUser.id,
        toId: selectedChatUserId,
        text: text,
        time: new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit"
        })
    };

    messages.push(message);

    saveMessages();

    // =====================================
    // THÔNG BÁO CHO NGƯỜI NHẬN
    // relatedId = ID của người gửi
    // =====================================

    addNotification(
        selectedChatUserId,
        "message",
        `${currentUser.name} đã gửi cho bạn một tin nhắn mới.`,
        currentUser.id
    );

    chatInput.value = "";

    renderChatMessages();

    chatInput.focus();
}


// ===============================
// ENTER ĐỂ GỬI TIN NHẮN
// ===============================

function handleChatKey(event) {
    if (event.key === "Enter") {
        event.preventDefault();

        sendMessage();
    }
}


// ===============================
// CẬP NHẬT DỮ LIỆU KHI TAB KHÁC THAY ĐỔI
// ===============================

window.addEventListener("storage", function(event) {

    if (event.key === "studyUsers") {
        users = JSON.parse(
            event.newValue || "[]"
        );

        users = users.map(function(user) {

            if (!Array.isArray(user.connections)) {
                user.connections = [];
            }

            return user;
        });

        if (currentUser) {
            const updatedUser = users.find(function(user) {
                return user.id === currentUser.id;
            });

            if (updatedUser) {
                currentUser = updatedUser;
            }
        }

        renderNotifications();
        findMatches();
    }


    if (event.key === "studyNotifications") {
        notifications = JSON.parse(
            event.newValue || "[]"
        );

        renderNotifications();
    }


    if (event.key === "studyMessages") {
        messages = JSON.parse(
            event.newValue || "[]"
        );

        renderChatMessages();
    }


    if (event.key === "studyConnectionRequests") {
        connectionRequests = JSON.parse(
            event.newValue || "[]"
        );

        renderNotifications();
        findMatches();
    }

});


// ===============================
// KHI TRANG ĐƯỢC LOAD
// ===============================

document.addEventListener("DOMContentLoaded", function() {

    if (currentUser) {
        loadDashboard();
    } else {
        showPage("home");
    }

    renderNotifications();
});