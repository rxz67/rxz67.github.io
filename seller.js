const defaultStock = [
    { name: 'Набор ручек',       price: 1200, qty: 15, image: 'img/Ручки.jpg' },
    { name: 'Набор тетрадей',    price: 900,  qty: 23, image: 'img/Тетради.jpg' },
    { name: 'Карандаши цветные', price: 700,  qty: 7,  image: 'img/Карандаши.jpg' },
    { name: 'Набор маркеров',    price: 3000, qty: 10, image: 'img/Маркеры.webp' },
    { name: 'Бумага',            price: 2000, qty: 21, image: 'img/Бумага.webp' },
    { name: 'Папки',             price: 700,  qty: 35, image: 'img/Папки.jpg' },
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

document.getElementById('productImage').addEventListener('change', function() {
    const file    = this.files[0];
    const preview = document.getElementById('imagePreview');
    if (!file) {
        preview.innerHTML = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        preview.innerHTML = `<img src="${e.target.result}" alt="preview">`;
    };
    reader.readAsDataURL(file);
});


document.getElementById('addProductBtn').addEventListener('click', () => {
    const name  = document.getElementById('productName').value.trim();
    const price = parseInt(document.getElementById('productPrice').value);
    const qty   = parseInt(document.getElementById('productQty').value);
    const file  = document.getElementById('productImage').files[0];
    const err   = document.getElementById('productError');

    if (!name || !price || !qty) {
        err.textContent = 'Заполните все поля';
        return;
    }
    if (price <= 0 || qty <= 0) {
        err.textContent = 'Цена и количество должны быть больше 0';
        return;
    }

    err.textContent = '';

    const stock = getStock();

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const image = e.target.result;
            saveProduct(stock, name, price, qty, image);
        };
        reader.readAsDataURL(file);
    } else {
        saveProduct(stock, name, price, qty, '');
    }
});

function saveProduct(stock, name, price, qty, image) {
    const existing = stock.find(p => p.name === name);
    if (existing) {
        existing.qty += qty;
        if (image) existing.image = image;
    } else {
        stock.push({ name, price, qty, image });
    }
    saveStock(stock);

    document.getElementById('productName').value  = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productQty').value   = '';
    document.getElementById('productImage').value = '';
    document.getElementById('imagePreview').innerHTML = '';

    renderStock();
}

function renderStock() {
    const stock = getStock();
    const grid  = document.getElementById('stockGrid');

    grid.innerHTML = stock.map((item, idx) => `
        <div class="stock-card ${item.qty <= 5 ? 'low' : ''}">
            ${item.image ? `<img class="stock-img" src="${item.image}" alt="${item.name}">` : ''}
            <div class="stock-name">${item.name}</div>
            <div class="stock-price">${item.price.toLocaleString()} тг</div>
            <div class="stock-qty ${item.qty <= 5 ? 'qty-low' : ''}">${item.qty} шт.</div>
            <div class="stock-controls">
                <input type="number" class="stock-input" id="add-${idx}" min="1" value="1">
                <button class="add-btn" onclick="addStock(${idx})">+ Пополнить</button>
            </div>
            <button class="delete-btn" onclick="deleteProduct(${idx})">🗑 Удалить</button>
        </div>
    `).join('');
}

function addStock(idx) {
    const stock  = getStock();
    const input  = document.getElementById('add-' + idx);
    const amount = parseInt(input.value) || 0;
    if (amount <= 0) return;
    stock[idx].qty += amount;
    saveStock(stock);
    renderStock();
}

function deleteProduct(idx) {
    const stock = getStock();
    stock.splice(idx, 1);
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
                    <p class="sent-label">✅ Отправлен</p>
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
            alert(`Недостаточно товара: ${item.name}\nЕсть: ${stockItem ? stockItem.qty : 0} шт. Нужно: ${item.qty} шт.`);
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