const express = require('express');
const mysql   = require('mysql2');
const cors    = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host:     'localhost',
    user:     'root',
    password: '',
    database: 'statmarket'
});

db.connect(err => {
    if (err) {
        console.log('Ошибка подключения к БД:', err);
        return;
    }
    console.log('База данных подключена!');
});

app.post('/api/register', (req, res) => {
    const { name, username, password, role } = req.body;
    const sql = 'INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, username, password, role], (err) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.json({ success: false, message: 'Логин уже занят' });
            }
            return res.json({ success: false, message: 'Ошибка сервера' });
        }
        res.json({ success: true });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(sql, [username, password], (err, results) => {
        if (err) return res.json({ success: false });
        if (results.length === 0) return res.json({ success: false, message: 'Неверный логин или пароль' });
        res.json({ success: true, user: results[0] });
    });
});

app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) return res.json([]);
        res.json(results);
    });
});

app.get('/api/products/:seller', (req, res) => {
    db.query('SELECT * FROM products WHERE seller = ?', [req.params.seller], (err, results) => {
        if (err) return res.json([]);
        res.json(results);
    });
});


app.post('/api/products', (req, res) => {
    const { name, price, qty, seller } = req.body;
    const sql = 'INSERT INTO products (name, price, qty, seller) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE qty = qty + VALUES(qty)';
    db.query(sql, [name, price, qty, seller], (err) => {
        if (err) return res.json({ success: false });
        res.json({ success: true });
    });
});


app.put('/api/products/restock', (req, res) => {
    const { name, seller, qty } = req.body;
    db.query('UPDATE products SET qty = qty + ? WHERE name = ? AND seller = ?', [qty, name, seller], (err) => {
        if (err) return res.json({ success: false });
        res.json({ success: true });
    });
});


app.delete('/api/products/:name/:seller', (req, res) => {
    db.query('DELETE FROM products WHERE name = ? AND seller = ?', [req.params.name, req.params.seller], (err) => {
        if (err) return res.json({ success: false });
        res.json({ success: true });
    });
});

app.post('/api/orders', (req, res) => {
    const { code, buyer, items, total } = req.body;
    db.query('INSERT INTO orders (code, buyer, total) VALUES (?, ?, ?)', [code, buyer, total], (err) => {
        if (err) return res.json({ success: false });
        const itemSql = 'INSERT INTO order_items (order_code, product_name, price, qty) VALUES ?';
        const values  = items.map(i => [code, i.name, i.price, i.qty]);
        db.query(itemSql, [values], (err2) => {
            if (err2) return res.json({ success: false });
            res.json({ success: true, code });
        });
    });
});


app.get('/api/orders/buyer/:username', (req, res) => {
    db.query('SELECT * FROM orders WHERE buyer = ?', [req.params.username], (err, orders) => {
        if (err) return res.json([]);
        if (orders.length === 0) return res.json([]);
        const codes   = orders.map(o => o.code);
        db.query('SELECT * FROM order_items WHERE order_code IN (?)', [codes], (err2, items) => {
            if (err2) return res.json([]);
            const result = orders.map(o => ({
                ...o,
                items: items.filter(i => i.order_code === o.code)
            }));
            res.json(result);
        });
    });
});


app.get('/api/orders/seller/:username', (req, res) => {
    db.query('SELECT * FROM products WHERE seller = ?', [req.params.username], (err, products) => {
        if (err) return res.json([]);
        if (products.length === 0) return res.json([]);
        const productNames = products.map(p => p.name);
        db.query('SELECT DISTINCT order_code FROM order_items WHERE product_name IN (?)', [productNames], (err2, codes) => {
            if (err2) return res.json([]);
            if (codes.length === 0) return res.json([]);
            const orderCodes = codes.map(c => c.order_code);
            db.query('SELECT * FROM orders WHERE code IN (?)', [orderCodes], (err3, orders) => {
                if (err3) return res.json([]);
                db.query('SELECT * FROM order_items WHERE order_code IN (?)', [orderCodes], (err4, items) => {
                    if (err4) return res.json([]);
                    const result = orders.map(o => ({
                        ...o,
                        items: items.filter(i => i.order_code === o.code)
                    }));
                    res.json(result);
                });
            });
        });
    });
});


app.put('/api/orders/status', (req, res) => {
    const { code, status } = req.body;
    db.query('UPDATE orders SET status = ? WHERE code = ?', [status, code], (err) => {
        if (err) return res.json({ success: false });
        res.json({ success: true });
    });
});


app.put('/api/products/deduct', (req, res) => {
    const { items, seller } = req.body;
    let completed = 0;
    for (const item of items) {
        db.query('UPDATE products SET qty = qty - ? WHERE name = ? AND seller = ?', [item.qty, item.name, seller], () => {
            completed++;
            if (completed === items.length) res.json({ success: true });
        });
    }
});

app.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000');
});