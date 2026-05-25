const cart = JSON.parse(localStorage.getItem('sm_cart') || '[]');

function saveCart() {
    localStorage.setItem('sm_cart', JSON.stringify(cart));
}

function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    const el = document.getElementById('cartCount');
    if (el) el.textContent = total;
}

document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const name  = btn.dataset.name;
        const price = parseInt(btn.dataset.price);

        const existing = cart.find(i => i.name === name);
        if (existing) {
            existing.qty++;
        } else {
            cart.push({ name, price, qty: 1 });
        }

        saveCart();
        window.location = 'cart.html';
    });
});

updateCartCount();