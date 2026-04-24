// --- 1. 簡易データベース（カテゴリを自動割り振り） ---
const products = {};
const categories = ["野菜", "肉・魚", "飲料", "その他"]; // 4つのカテゴリ

for (let i = 1; i <= 16; i++) {
    // 順番にカテゴリを割り当てる (1~4は野菜、5~8は肉・魚...)
    const catIndex = Math.floor((i - 1) / 4); 
    products[`10${i}`] = { 
        name: `商品${i}`, 
        kana: `ｼｮｳﾋﾝ${i}`, 
        price: 100 + (i * 15),
        category: categories[catIndex] // カテゴリ情報を追加
    };
}

let cart = [];
let calcInput = "";

// 要素
const viewSingle = document.getElementById('view-single');
const viewCode = document.getElementById('view-code');
const btnModeSingle = document.getElementById('btn-mode-single');
const btnModeCode = document.getElementById('btn-mode-code');

// --- 遷移処理 ---
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

// --- ログイン ---
document.getElementById('btn-login').addEventListener('click', () => {
    const id = document.getElementById('emp-id').value || "12345";
    document.getElementById('clerk-label').textContent = `担当: ${id}`;
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('pos-screen').classList.remove('hidden');
    initItemGrid();
});

// --- Enterキーでのログイン実行 ---
// （※empIdInput はすでにある「IME対応版」の変数を使用します）
const empPassInput = document.getElementById('emp-pass');
const btnLogin = document.getElementById('btn-login');

// 社員番号の入力欄でEnterが押されたときの処理
if (empIdInput) {
    empIdInput.addEventListener('keydown', (e) => {
        // 日本語入力の変換確定時のEnterは無視する
        if (e.isComposing) return;
        
        if (e.key === 'Enter') {
            btnLogin.click(); // ログインボタンを押したことにする
        }
    });
}

// パスワードの入力欄でEnterが押されたときの処理
if (empPassInput) {
    empPassInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            btnLogin.click(); // ログインボタンを押したことにする
        }
    });
}

// --- 2. 商品ボタン生成（カテゴリ情報を埋め込む） ---
// 既存の initItemGrid() をこれに書き換えてください
function initItemGrid() {
    const grid = document.getElementById('item-grid');
    grid.innerHTML = "";
    Object.keys(products).forEach(code => {
        const p = products[code];
        const btn = document.createElement('div');
        btn.className = "grid-item";
        btn.textContent = p.name;
        
        // HTMLの属性としてカテゴリをこっそり持たせておく
        btn.dataset.category = p.category; 
        
        btn.onclick = () => addToCart(code);
        grid.appendChild(btn);
    });
}

// --- カート・UI更新 ---
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
            <div class="top"><span>${item.name}</span><span>¥${sub}</span></div>
            <div class="bottom">
                <span>@${item.price}</span>
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
        document.getElementById('target-item-price').textContent = `￥${lastItem.price}`;
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

// --- 電卓ロジック ---
document.querySelectorAll('.num').forEach(b => {
    b.onclick = () => {
        if (calcInput.length < 10) {
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

// --- フッターボタン ---
document.getElementById('btn-clear-all').onclick = () => {
    if (confirm("全消去しますか？")) { 
        cart = []; 
        updateUI(); 
        
        // ▼▼▼ 追加：お客様用画面の表示を初期状態に戻す ▼▼▼
        document.getElementById('target-item-name').textContent = "ｲﾗｯｼｬｲﾏｾ";
        document.getElementById('target-item-price').textContent = "";
    }
};

document.getElementById('btn-checkout').onclick = () => {
    if (cart.length === 0) return;
    alert("お会計完了");
    cart = [];
    updateUI();
    
    // ▼▼▼ 追加：お会計完了時もお客様用画面をリセットする ▼▼▼
    document.getElementById('target-item-name').textContent = "ｱﾘｶﾞﾄｳｺﾞｻﾞｲﾏｼﾀ";
    document.getElementById('target-item-price').textContent = "";
};

// --- 社員番号の入力制御 (IME対応版：全角英数字を半角にし、英数字のみ許可) ---
const empIdInput = document.getElementById('emp-id');

if (empIdInput) {
    let isComposing = false; // 日本語入力で変換中かどうかを判定するフラグ

    // 値をきれいに整形する処理をまとめた関数
    const formatEmpId = () => {
        let value = empIdInput.value;

        // 1. 全角英数字を半角に変換
        value = value.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
        });

        // 2. 半角英数字以外の文字を削除
        value = value.replace(/[^a-zA-Z0-9]/g, '');

        // 値が変わった場合のみ入力欄を更新する
        if (empIdInput.value !== value) {
            empIdInput.value = value;
        }
    };

    // 日本語の入力（変換）が始まったとき
    empIdInput.addEventListener('compositionstart', () => {
        isComposing = true;
    });

    // 日本語の入力（変換）が確定したとき
    empIdInput.addEventListener('compositionend', () => {
        isComposing = false;
        formatEmpId(); // 確定した瞬間に、半角変換＆記号削除を実行！
    });

    // 文字が入力されたとき（直接半角で打っている時や、コピペした時）
    empIdInput.addEventListener('input', () => {
        if (isComposing) return; // 変換中（下線が引かれている状態）なら何もしない
        formatEmpId();
    });
}

// --- 3. カテゴリタブの絞り込み機能（ファイルの一番下に追加） ---
// 前回の検索バーのスクリプトを消して、こちらに差し替えてください
const catBtns = document.querySelectorAll('.cat-btn');

catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // ① 全部のタブから「選択中(active)」の色を外し、押されたタブだけ色をつける
        catBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // ② 押されたタブのカテゴリ名を取得
        const targetCategory = btn.dataset.category;
        
        // ③ 全商品ボタンを取得して、表示・非表示を切り替える
        const items = document.querySelectorAll('#item-grid .grid-item');
        items.forEach(item => {
            if (targetCategory === "すべて" || item.dataset.category === targetCategory) {
                item.style.display = ''; // 表示する
            } else {
                item.style.display = 'none'; // 隠す
            }
        });
    });
});

