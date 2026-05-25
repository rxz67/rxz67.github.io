const cart = JSON.parse(localStorage.getItem('sm_cart') || '[]');

function saveCart() {
    localStorage.setItem('sm_cart', JSON.stringify(cart));
}

function render() {
    const list       = document.getElementById('cartList');
    const empty      = document.getElementById('emptyState');
    const wrap       = document.querySelector('.cart-wrap');
    const totalQty   = document.getElementById('totalQty');
    const totalPrice = document.getElementById('totalPrice');

    if (cart.length === 0) {
        wrap.style.display  = 'none';
        empty.style.display = 'flex';
        return;
    }

    wrap.style.display  = 'grid';
    empty.style.display = 'none';

    const qty   = cart.reduce((s, i) => s + i.qty, 0);
    const price = cart.reduce((s, i) => s + i.price * i.qty, 0);

    totalQty.textContent   = qty + ' шт.';
    totalPrice.textContent = price.toLocaleString() + ' тг';

    list.innerHTML = cart.map((item, idx) => `
        <div class="cart-item">
            <div class="item-info">
                <span class="item-name">${item.name}</span>
                <span class="item-price">${item.price.toLocaleString()} тг за шт.</span>
            </div>
            <div class="item-controls">
                <button class="qty-btn" onclick="change(${idx}, -1)">−</button>
                <span class="qty">${item.qty}</span>
                <button class="qty-btn" onclick="change(${idx}, 1)">+</button>
                <span class="item-total">${(item.price * item.qty).toLocaleString()} тг</span>
                <button class="remove-btn" onclick="remove(${idx})">✕</button>
            </div>
        </div>
    `).join('');
}

function change(idx, delta) {
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    saveCart();
    render();
}

function remove(idx) {
    cart.splice(idx, 1);
    saveCart();
    render();
}

document.getElementById('clearBtn').addEventListener('click', () => {
    cart.length = 0;
    saveCart();
    render();
});

render();