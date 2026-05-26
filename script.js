const users = JSON.parse(localStorage.getItem('sm_users') || '[]');

function saveUsers() {
    localStorage.setItem('sm_users', JSON.stringify(users));
}

function getCurrentUser() {
    const username = localStorage.getItem('sm_current');
    if (!username) return null;
    return users.find(u => u.username === username) || null;
}

function setCurrentUser(user) {
    localStorage.setItem('sm_current', user.username);
}

function logout() {
    localStorage.removeItem('sm_current');
}

const overlay      = document.getElementById('modalOverlay');
const modalBg      = document.getElementById('modalBg');
const openBtn      = document.getElementById('openModal');
const panelLogin   = document.getElementById('panelLogin');
const panelReg     = document.getElementById('panelReg');
const panelProfile = document.getElementById('panelProfile');

function showPanel(name) {
    panelLogin.style.display   = name === 'login'   ? 'block' : 'none';
    panelReg.style.display     = name === 'reg'     ? 'block' : 'none';
    panelProfile.style.display = name === 'profile' ? 'block' : 'none';
}

function openModal() {
    overlay.classList.add('open');
    const user = getCurrentUser();
    if (user) {
        showPanel('profile');
        updateProfilePanel(user);
    } else {
        showPanel('login');
    }
}

function closeModal() {
    overlay.classList.remove('open');
}

function shipOrder(idx) {
    const orders = JSON.parse(localStorage.getItem('sm_orders') || '[]');
    orders[idx].status = 'Отправлен';
    localStorage.setItem('sm_orders', JSON.stringify(orders));
    const user = getCurrentUser();
    updateProfilePanel(user);
}

function updateProfilePanel(user) {
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileRole').textContent =
        user.role === 'buyer' ? 'Покупатель' : 'Продавец';
    document.getElementById('profileBadge').textContent =
        user.role === 'buyer' ? '🛍 Покупатель' : '🏪 Продавец';
    document.getElementById('profileBadge').className =
        'profile-badge ' + (user.role === 'buyer' ? 'badge-buyer' : 'badge-seller');

    const orders  = JSON.parse(localStorage.getItem('sm_orders') || '[]');
    const ordersBox = document.getElementById('ordersBox');

    if (user.role === 'buyer') {
        const myOrders = orders.filter(o => o.buyer === user.username);
        if (myOrders.length === 0) {
            ordersBox.innerHTML = '<p class="no-orders">Заказов пока нет</p>';
        } else {
            ordersBox.innerHTML = myOrders.map(o => `
                <div class="order-item">
                    <div class="order-header">
                        <span class="order-code">#${o.code}</span>
                        <span class="order-status status-${o.status === 'Новый' ? 'new' : o.status === 'В сборке' ? 'assembly' : 'sent'}">${o.status}</span>
                    </div>
                    <div class="order-goods">${o.items.map(i => `${i.name} × ${i.qty}`).join(', ')}</div>
                    <div class="order-total">${o.total.toLocaleString()} тг</div>
                    <div class="order-date">${o.date}</div>
                </div>
            `).join('');
        }
    } else {
        if (orders.length === 0) {
            ordersBox.innerHTML = '<p class="no-orders">Заказов пока нет</p>';
        } else {
            ordersBox.innerHTML = orders.map((o, idx) => `
                <div class="order-item">
                    <div class="order-header">
                        <span class="order-code">#${o.code}</span>
                        <span class="order-status status-${o.status === 'Новый' ? 'new' : o.status === 'В сборке' ? 'assembly' : 'sent'}">${o.status}</span>
                    </div>
                    <div class="order-buyer">👤 ${o.buyer}</div>
                    <div class="order-goods">${o.items.map(i => `${i.name} × ${i.qty}`).join(', ')}</div>
                    <div class="order-total">${o.total.toLocaleString()} тг</div>
                    <div class="order-date">${o.date}</div>
                    ${o.status !== 'Отправлен' ? `<button class="ship-btn" onclick="shipOrder(${idx})">📦 Передать на отправку</button>` : '<p class="shipped-label">✅ Отправлен</p>'}
                </div>
            `).join('');
        }
    }
}

function updateHeaderBtn() {
    const user = getCurrentUser();
    if (user) {
        openBtn.textContent = user.name;
        openBtn.style.background = user.role === 'buyer' ? '#2563eb' : '#f59e0b';
    } else {
        openBtn.textContent = 'Войти';
        openBtn.style.background = '#2563eb';
    }
}

openBtn.addEventListener('click', openModal);
modalBg.addEventListener('click', closeModal);
document.getElementById('closeLogin').addEventListener('click', closeModal);
document.getElementById('closeReg').addEventListener('click', closeModal);
document.getElementById('closeProfile').addEventListener('click', closeModal);

document.getElementById('goToReg').addEventListener('click', () => showPanel('reg'));
document.getElementById('goToLogin').addEventListener('click', () => showPanel('login'));

document.getElementById('tabBuyerBtn').addEventListener('click', () => {
    document.getElementById('formBuyer').style.display = 'block';
    document.getElementById('formSeller').style.display = 'none';
    document.getElementById('tabBuyerBtn').classList.add('active');
    document.getElementById('tabSellerBtn').classList.remove('active');
});

document.getElementById('tabSellerBtn').addEventListener('click', () => {
    document.getElementById('formBuyer').style.display = 'none';
    document.getElementById('formSeller').style.display = 'block';
    document.getElementById('tabSellerBtn').classList.add('active');
    document.getElementById('tabBuyerBtn').classList.remove('active');
});

document.getElementById('loginBtn').addEventListener('click', () => {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const err = document.getElementById('loginError');

    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        err.textContent = 'Неверный логин или пароль';
        return;
    }
    err.textContent = '';
    setCurrentUser(user);
    updateHeaderBtn();
    updateProfilePanel(user);
    showPanel('profile');
});

document.getElementById('regBuyerBtn').addEventListener('click', () => {
    const name     = document.getElementById('regName').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const err      = document.getElementById('regError');

    if (!name || !username || !password) {
        err.textContent = 'Заполните все поля';
        return;
    }
    if (users.find(u => u.username === username)) {
        err.textContent = 'Логин уже занят';
        return;
    }
    const user = { name, username, password, role: 'buyer' };
    users.push(user);
    saveUsers();
    setCurrentUser(user);
    updateHeaderBtn();
    updateProfilePanel(user);
    showPanel('profile');
});

document.getElementById('regSellerBtn').addEventListener('click', () => {
    const name     = document.getElementById('regShop').value.trim();
    const username = document.getElementById('regSellerUsername').value.trim();
    const password = document.getElementById('regSellerPassword').value;
    const err      = document.getElementById('regSellerError');

    if (!name || !username || !password) {
        err.textContent = 'Заполните все поля';
        return;
    }
    if (users.find(u => u.username === username)) {
        err.textContent = 'Логин уже занят';
        return;
    }
    const user = { name, username, password, role: 'seller' };
    users.push(user);
    saveUsers();
    setCurrentUser(user);
    updateHeaderBtn();
    updateProfilePanel(user);
    showPanel('profile');
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    logout();
    updateHeaderBtn();
    showPanel('login');
});

updateHeaderBtn();