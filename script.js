// --- 1. 簡易データベース（カテゴリを自動割り振り） ---
const products = {};
const categories = ["野菜", "肉・魚", "飲料", "その他"];

for (let i = 1; i <= 16; i++) {
    const catIndex = Math.floor((i - 1) / 4); 
    products[`10${i}`] = { 
        name: `商品${i}`, 
        kana: `ｼｮｳﾋﾝ${i}`, 
        price: 100 + (i * 15),
        category: categories[catIndex]
    };
}

// --- 2. 状態管理 ---
let cart = [];
let calcInput = "";

// --- 3. 要素の取得 ---
const viewSingle = document.getElementById('view-single');
const viewCode = document.getElementById('view-code');
const btnModeSingle = document.getElementById('btn-mode-single');
const btnModeCode = document.getElementById('btn-mode-code');

// --- 4. ログイン機能 (IME対応 ＆ Enterキー対応) ---
const empIdInput = document.getElementById('emp-id');
let isComposing = false;

// 全角を半角英数字に変換する処理
if (empIdInput) {
    const formatEmpId = () => {
        let value = empIdInput.value;
        value = value.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
        value = value.replace(/[^a-zA-Z0-9]/g, '');
        if (empIdInput.value !== value) empIdInput.value = value;
    };
    empIdInput.addEventListener('compositionstart', () => { isComposing = true; });
    empIdInput.addEventListener('compositionend', () => { isComposing = false; formatEmpId(); });
    empIdInput.addEventListener('input', () => { if (!isComposing) formatEmpId(); });
}

// ログインボタンを押したときの処理
document.getElementById('btn-login').addEventListener('click', () => {
    const id = document.getElementById('emp-id').value || "12345";
    document.getElementById('clerk-label').textContent = `担当: ${id}`;
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('pos-screen').classList.remove('hidden');
    initItemGrid();
});

// 画面全体でEnterキーを監視（ログイン画面ならログイン実行）
document.addEventListener('keydown', (e) => {
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen && !loginScreen.classList.contains('hidden')) {
        if (e.key === 'Enter' && !isComposing) {
            e.preventDefault(); 
            document.getElementById('btn-login').click();
        }
    }
});

// --- 5. モード切替 ---
btnModeSingle.addEventListener('click', () => {
    btnModeSingle.classList.add('active');
    btnModeCode.classList.remove('active');
    viewSingle.classList.remove('hidden');
    viewCode.classList.add('hidden');
});

btnModeCode.addEventListener('click', () => {
    btnModeCode.classList.add('active');
    btnModeSingle.classList.remove('active');
    viewCode.classList.remove('hidden');
    viewSingle.classList.add('hidden');
    calcInput = "";
    updateCalcDisplay();
});

// --- 6. 商品ボタン生成 ---
function initItemGrid() {
    const grid = document.getElementById('item-grid');
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

// --- 7. カテゴリタブ切り替え ---
const catBtns = document.querySelectorAll('.cat-btn');
catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        catBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const targetCategory = btn.dataset.category;
        const items = document.querySelectorAll('#item-grid .grid-item');
        items.forEach(item => {
            if (targetCategory === "すべて" || item.dataset.category === targetCategory) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// --- 8. カート・UI更新 ---
function addToCart(code) {
    const p = products[code];
    if (!p) return alert("登録がありません");

    const exist = cart.find(i => i.id === code);
    if (exist) { exist.qty++; } 
    else { cart.push({ id: code, ...p, qty: 1 }); }

    updateUI(p);
}

function updateUI(lastItem) {
    const list = document.getElementById('receipt-list');
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
                <span>￥${item.price.toLocaleString()}</span>
                <div>
                    <button class="qty-btn" onclick="changeQty('${item.id}', -1)">-</button>
                    ${item.qty}
                    <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
                </div>
            </div>`;
        list.appendChild(row);
    });

    document.getElementById('total-price').textContent = total.toLocaleString();
    
    // お客様ディスプレイの更新
    if (lastItem) {
        document.getElementById('target-item-name').textContent = lastItem.kana;
        document.getElementById('target-item-price').textContent = `￥${lastItem.price.toLocaleString()}`;
    }
    list.scrollTop = list.scrollHeight;
}

window.changeQty = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
        updateUI();
    }
};

// --- 9. 電卓ロジック ---
document.querySelectorAll('.num').forEach(b => {
    b.onclick = () => {
        if (calcInput.length < 13) {
            calcInput += b.textContent;
            updateCalcDisplay();
        }
    };
});

document.getElementById('btn-calc-del').onclick = () => {
    calcInput = calcInput.slice(0, -1);
    updateCalcDisplay();
};

document.getElementById('btn-calc-enter').onclick = () => {
    if (calcInput) {
        addToCart(calcInput);
        calcInput = "";
        updateCalcDisplay();
    }
};

function updateCalcDisplay() {
    document.getElementById('calc-display').textContent = calcInput;
}

// --- 10. フッターボタン ---
document.getElementById('btn-clear-all').onclick = () => {
    if (confirm("全消去しますか？")) { 
        cart = []; 
        updateUI(); 
        
        // お客様用画面もリセット
        document.getElementById('target-item-name').textContent = "ｲﾗｯｼｬｲﾏｾ";
        document.getElementById('target-item-price').textContent = "";
    }
};

document.getElementById('btn-checkout').onclick = () => {
    if (cart.length === 0) return;
    alert("お会計完了");
    cart = [];
    updateUI();
    
    // お客様用画面もリセット
    document.getElementById('target-item-name').textContent = "ｱﾘｶﾞﾄｳｺﾞｻﾞｲﾏｼﾀ";
    document.getElementById('target-item-price').textContent = "";
};

