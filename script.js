// --- 1. データベースから商品を取得 ---
let products = {};

async function fetchProducts() {
    try {
        const response = await fetch('api_products.php');
        products = await response.json();
        console.log("商品データを読み込みました:", products);
        // 商品一覧を表示する場所があれば初期化
        if (document.getElementById('item-grid')) {
            initItemGrid();
        }
    } catch (error) {
        console.error("商品データの読み込みに失敗しました:", error);
    }
}
fetchProducts();

// --- 2. 状態管理 ---
let cart = [];
let calcInput = "";

// --- 3. ログイン・担当者表示機能 ---
// ログイン画面（index.html）用の処理
const btnLogin = document.getElementById('btn-login');
const empIdInput = document.getElementById('emp-id');

if (btnLogin && empIdInput) {
    btnLogin.onclick = () => {
        const id = empIdInput.value || "12345";
        localStorage.setItem('pos_clerk_id', id);
        window.location.href = 'Tas.html';
    };
}

// レジ画面（Tas.html）用の担当者表示
const clerkLabel = document.getElementById('clerk-label');
if (clerkLabel) {
    clerkLabel.textContent = `担当: ${localStorage.getItem('pos_clerk_id') || "----"}`;
}

// --- 4. モード切替（単品 / コード入力） ---
const btnModeSingle = document.getElementById('btn-mode-single');
const btnModeCode = document.getElementById('btn-mode-code');
const viewSingle = document.getElementById('view-single');
const viewCode = document.getElementById('view-code');

if (btnModeSingle && btnModeCode) {
    btnModeSingle.onclick = () => {
        btnModeSingle.classList.add('active');
        btnModeCode.classList.remove('active');
        viewSingle.classList.remove('hidden');
        viewCode.classList.add('hidden');
    };
    btnModeCode.onclick = () => {
        btnModeCode.classList.add('active');
        btnModeSingle.classList.remove('active');
        viewCode.classList.remove('hidden');
        viewSingle.classList.add('hidden');
        calcInput = "";
        updateCalcDisplay();
    };
}

// --- 5. 商品ボタン生成 ---
function initItemGrid() {
    const grid = document.getElementById('item-grid');
    if (!grid) return;
    grid.innerHTML = "";
    Object.keys(products).forEach(code => {
        const p = products[code];
        const btn = document.createElement('div');
        btn.className = "grid-item";
        btn.textContent = p.name;
        btn.dataset.category = p.category; 
        btn.onclick = () => addToCart(code);
        grid.appendChild(btn);
    });
}

// --- 6. カテゴリ切り替え ---
document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.dataset.category;
        document.querySelectorAll('.grid-item').forEach(item => {
            item.style.display = (target === "すべて" || item.dataset.category === target) ? '' : 'none';
        });
    };
});

// --- 7. カート処理 ---
function addToCart(code) {
    const p = products[code];
    if (!p) {
        alert("商品コード " + code + " は登録されていません");
        return;
    }
    const exist = cart.find(i => i.id === code);
    if (exist) { exist.qty++; } else { cart.push({ id: code, ...p, qty: 1 }); }
    updateUI(p);
}

function updateUI(lastItem) {
    const list = document.getElementById('receipt-list');
    if (!list) return;
    list.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const sub = item.price * item.qty;
        total += sub;
        const row = document.createElement('div');
        row.className = 'receipt-item';
        row.innerHTML = `
            <div class="top"><span>${item.name}</span><span>¥${sub.toLocaleString()}</span></div>
            <div class="bottom">
                <span>@${item.price.toLocaleString()}</span>
                <div>
                    <button class="qty-btn" onclick="changeQty('${item.id}', -1)">-</button>
                    ${item.qty}
                    <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
                </div>
            </div>`;
        list.appendChild(row);
    });

    document.getElementById('total-price').textContent = total.toLocaleString();
    if (lastItem) {
        document.getElementById('target-item-name').textContent = lastItem.kana;
        document.getElementById('target-item-price').textContent = `￥${lastItem.price.toLocaleString()}`;
    }
}

window.changeQty = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
        updateUI();
    }
};

// --- 8. 電卓ロジック ---
document.querySelectorAll('.num').forEach(b => {
    b.onclick = () => {
        if (calcInput.length < 13) {
            calcInput += b.textContent;
            updateCalcDisplay();
        }
    };
});

const btnDel = document.getElementById('btn-calc-del');
if (btnDel) {
    btnDel.onclick = () => {
        calcInput = calcInput.slice(0, -1);
        updateCalcDisplay();
    };
}

const btnEnter = document.getElementById('btn-calc-enter');
if (btnEnter) {
    btnEnter.onclick = () => {
        if (calcInput) {
            addToCart(calcInput);
            calcInput = "";
            updateCalcDisplay();
        }
    };
}

function updateCalcDisplay() {
    const display = document.getElementById('calc-display');
    if (display) display.textContent = calcInput;
}

// --- 9. フッターボタン（全消去・会計） ---
const btnClear = document.getElementById('btn-clear-all');
if (btnClear) {
    btnClear.onclick = () => {
        if (confirm("レシートをすべて消去しますか？")) { 
            cart = []; 
            updateUI(); 
            document.getElementById('target-item-name').textContent = "ｲﾗｯｼｬｲﾏｾ";
            document.getElementById('target-item-price').textContent = "";
        }
    };
}

const btnCheckout = document.getElementById('btn-checkout');
if (btnCheckout) {
    btnCheckout.onclick = () => {
        if (cart.length === 0) {
            alert("カートが空です");
            return;
        }
        alert("お会計が完了しました！");
        cart = [];
        updateUI();
        document.getElementById('target-item-name').textContent = "ｱﾘｶﾞﾄｳｺﾞｻﾞｲﾏｼﾀ";
        document.getElementById('target-item-price').textContent = "";
    };
}