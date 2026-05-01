// --- 1. データベースから商品を取得 ---
let products = {};

async function fetchProducts() {
    try {
        const response = await fetch('api_products.php');
        products = await response.json();
        if (document.getElementById('item-grid')) {
            initItemGrid();
        }
    } catch (error) {
        console.error("商品読み込みエラー:", error);
    }
}
fetchProducts();

// --- 2. 状態管理 ---
let cart = [];
let calcInput = "";

// レジ画面（Tas.html）用の担当者表示
const clerkLabel = document.getElementById('clerk-label');
if (clerkLabel) {
    clerkLabel.textContent = `担当: ${localStorage.getItem('pos_clerk_id') || "----"}`;
}

// --- 3. UI更新関数 (重要：ここで表示を切り替える) ---
function updateUI(itemToShow = null) {
    const list = document.getElementById('receipt-list');
    const nameDisp = document.getElementById('target-item-name');
    const priceDisp = document.getElementById('target-item-price');
    const totalPriceDisp = document.getElementById('total-price');

    if (!list) return;

    // リストの描画
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
                    <span style="margin:0 10px; min-width:20px; display:inline-block; text-align:center;">${item.qty}</span>
                    <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
                </div>
            </div>`;
        list.appendChild(row);
    });

    totalPriceDisp.textContent = total.toLocaleString();

    // --- 上部ディスプレイの表示ロジック修正 ---
    if (cart.length === 0) {
        // カートが完全に空なら、絶対に「いらっしゃいませ」に戻す
        nameDisp.textContent = "ｲﾗｯｼｬｲﾏｾ";
        priceDisp.textContent = "";
    } else if (itemToShow && cart.some(i => i.id === itemToShow.id)) {
        // 引数のアイテムがまだカート内に存在していれば、それを表示
        nameDisp.textContent = itemToShow.kana;
        priceDisp.textContent = `￥${itemToShow.price.toLocaleString()}`;
    } else {
        // 削除されたばかり、または引数がない場合、カートの最後のアイテムを表示
        const lastInCart = cart[cart.length - 1];
        nameDisp.textContent = lastInCart.kana;
        priceDisp.textContent = `￥${lastInCart.price.toLocaleString()}`;
    }
}

// --- 4. カート操作関数 ---
function addToCart(code) {
    const p = products[code];
    if (!p) {
        alert("商品コードが見つかりません");
        return;
    }

    const existing = cart.find(i => i.id === code);
    if (existing) {
        existing.qty++;
        updateUI(existing);
    } else {
        const newItem = {
            id: code,
            name: p.name,
            kana: p.kana,
            price: p.price,
            qty: 1
        };
        cart.push(newItem);
        updateUI(newItem);
    }
}

// 個別数量変更（0になったら削除）
window.changeQty = (id, delta) => {
    const idx = cart.findIndex(i => i.id === id);
    if (idx === -1) return;

    const item = cart[idx];
    item.qty += delta;

    if (item.qty <= 0) {
        // 1. 配列から削除
        cart.splice(idx, 1);
        // 2. 引数なしでUI更新（内部で最後の商品か「いらっしゃいませ」に切り替わる）
        updateUI();
    } else {
        // 数量が残っていればその商品を表示
        updateUI(item);
    }
};

// --- 5. モード切替 ---
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

// --- 6. 商品ボタン生成 ---
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

// --- 7. カテゴリ切り替え ---
document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.dataset.category;
        document.querySelectorAll('.grid-item').forEach(item => {
            if (target === "すべて" || item.dataset.category === target) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    };
});

// --- 8. 電卓入力 ---
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

// --- 9. フッター（全消去・会計） ---
const btnClear = document.getElementById('btn-clear-all');
if (btnClear) {
    btnClear.onclick = () => {
        if (confirm("レシートをすべて消去しますか？")) {
            cart = [];
            updateUI(); // 確実に「いらっしゃいませ」になる
        }
    };
}

// --- 9. フッターボタン（会計ボタンの修正） ---
const btnCheckout = document.getElementById('btn-checkout');
if (btnCheckout) {
    btnCheckout.onclick = () => {
        if (cart.length === 0) {
            alert("カートが空です");
            return;
        }
        // カートの中身を一時保存して遷移
        sessionStorage.setItem('current_cart', JSON.stringify(cart));
        window.location.href = 'checkout.html';
    };
}
