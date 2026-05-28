const defaultStock = [
    { name: 'Набор ручек',      price: 1200, qty: 15 },
    { name: 'Набор тетрадей',   price: 900,  qty: 23 },
    { name: 'Карандаши цветные',price: 700,  qty: 7},
    { name: 'Набор маркеров',   price: 3000, qty: 10 },
    { name: 'Бумага',           price: 2000, qty: 21 },
    { name: 'Папки',            price: 700,  qty: 35 }, 
];

function getStock() {
    return JSON.parse(localStorage.getItem('sm_stock') || JSON.stringify(defaultStock));
}

function saveStock(stock) {
    localStorage.setItem('sm_stock', JSON.stringify(stock));
}

function getOrders() {
    return JSON.parse(localStorage.getItem('sm_orders') || '[]');
}

function saveOrders(orders) {
    localStorage.setItem('sm_orders', JSON.stringify(orders));
}

function renderStock() {
    const stock = getStock();
    const grid  = document.getElementById('stockGrid');

    grid.innerHTML = stock.map((item, idx) => `
        <div class="stock-card ${item.qty <= 5 ? 'low' : ''}">
            <div class="stock-name">${item.name}</div>
            <div class="stock-qty ${item.qty <= 5 ? 'qty-low' : ''}">${item.qty} шт.</div>
            <div class="stock-controls">
                <input type="number" class="stock-input" id="add-${idx}" min="1" value="1">
                <button class="add-btn" onclick="addStock(${idx})">+ Пополнить</button>
            </div>
        </div>
    `).join('');
}

function addStock(idx) {
    const stock = getStock();
    const input = document.getElementById('add-' + idx);
    const amount = parseInt(input.value) || 0;
    if (amount <= 0) return;
    stock[idx].qty += amount;
    saveStock(stock);
    renderStock();
}

function renderOrders() {
    const orders = getOrders();
    const list   = document.getElementById('ordersList');

    if (orders.length === 0) {
        list.innerHTML = '<p class="no-orders">Заказов пока нет</p>';
        return;
    }

    list.innerHTML = orders.map((order, idx) => `
        <div class="order-card status-card-${order.status === 'Новый' ? 'new' : order.status === 'В сборке' ? 'assembly' : 'sent'}">
            <div class="order-top">
                <span class="order-code">#${order.code}</span>
                <span class="order-badge badge-${order.status === 'Новый' ? 'new' : order.status === 'В сборке' ? 'assembly' : 'sent'}">${order.status}</span>
            </div>
            <div class="order-buyer">👤 Покупатель: ${order.buyer}</div>
            <div class="order-date">🕐 ${order.date}</div>
            <div class="order-items">
                ${order.items.map(i => `
                    <div class="order-item-row">
                        <span>${i.name}</span>
                        <span>${i.qty} шт.</span>
                        <span>${(i.price * i.qty).toLocaleString()} тг</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">Итого: <strong>${order.total.toLocaleString()} тг</strong></div>
            <div class="order-actions">
                ${order.status === 'Новый' ? `
                    <button class="action-btn assemble-btn" onclick="assembleOrder(${idx})">🔧 Начать сборку</button>
                ` : ''}
                ${order.status === 'В сборке' ? `
                    <button class="action-btn ship-btn" onclick="shipOrder(${idx})">📦 Передать на отправку</button>
                ` : ''}
                ${order.status === 'Отправлен' ? `
                    <p class="sent-label">Отправлен</p>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function assembleOrder(idx) {
    const orders = getOrders();
    const stock  = getStock();
    const order  = orders[idx];

    for (const item of order.items) {
        const stockItem = stock.find(s => s.name === item.name);
        if (!stockItem || stockItem.qty < item.qty) {
            alert(`Недостаточно товара на складе: ${item.name}\nНа складе: ${stockItem ? stockItem.qty : 0} шт.\nНужно: ${item.qty} шт.`);
            return;
        }
    }

    for (const item of order.items) {
        const stockItem = stock.find(s => s.name === item.name);
        stockItem.qty -= item.qty;
    }

    orders[idx].status = 'В сборке';
    saveOrders(orders);
    saveStock(stock);
    renderStock();
    renderOrders();
}

function shipOrder(idx) {
    const orders = getOrders();
    orders[idx].status = 'Отправлен';
    saveOrders(orders);
    renderOrders();
}

renderStock();
renderOrders();