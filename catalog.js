const cart = JSON.parse(localStorage.getItem('sm_cart') || '[]');

function saveCart() {
    localStorage.setItem('sm_cart', JSON.stringify(cart));
}

function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    const el = document.getElementById('cartCount');
    if (el) el.textContent = total;
}
const defaultProducts = [
    { name: 'Набор ручек',       price: 1200, qty: 15, image: 'img/Ручки.jpg',      seller: 'OfficeStore' },
    { name: 'Набор тетрадей',    price: 900,  qty: 23, image: 'img/Тетради.jpg',    seller: 'PaperWorld'  },
    { name: 'Карандаши цветные', price: 700,  qty: 7,  image: 'img/Карандаши.jpg',  seller: 'StatMarket'  },
    { name: 'Набор маркеров',    price: 3000, qty: 10, image: 'img/Маркеры.webp',   seller: 'SchoolShop'  },
    { name: 'Бумага',            price: 2000, qty: 21, image: 'img/Бумага.webp',    seller: 'OfficeStore' },
    { name: 'Папки',             price: 700,  qty: 35, image: 'img/Папки.jpg',      seller: 'StatMarket'  },
];

function getAllProducts() {
    const base = [...defaultProducts];
    const sellerProducts = JSON.parse(localStorage.getItem('sm_products') || '[]');

    sellerProducts.forEach(p => {
        const exists = base.find(b => b.name === p.name);
        if (!exists) {
            base.push(p);
        }
    });

    return base;
}

function renderProducts() {
    const products = getAllProducts();
    const grid     = document.getElementById('productsGrid');

    grid.innerHTML = products.map(item => `
        <div class="product-card">
            <img src="${item.image || 'img/Ручки.jpg'}" alt="${item.name}">
            <h2>${item.name}</h2>
            <p>от ${item.price.toLocaleString()} тг</p>
            <button class="buy-btn"
                data-name="${item.name}"
                data-price="${item.price}"
                data-seller="${item.seller || 'Stationery Market'}">Купить</button>
            <p class="seller-name">Продавец: ${item.seller || 'Stationery Market'}</p>
        </div>
    `).join('');

    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const name   = btn.dataset.name;
            const price  = parseInt(btn.dataset.price);
            const seller = btn.dataset.seller || 'Stationery Market';

            const existing = cart.find(i => i.name === name);
            if (existing) {
                existing.qty++;
            } else {
                cart.push({ name, price, qty: 1, seller });
            }

            saveCart();
            updateCartCount();

            btn.textContent = '✓ Добавлено';
            btn.style.background = '#16a34a';
            setTimeout(() => {
                btn.textContent = 'Купить';
                btn.style.background = '';
            }, 1000);
        });
    });
}

renderProducts();
updateCartCount();