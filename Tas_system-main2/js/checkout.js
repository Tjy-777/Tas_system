// js/checkout.js

// データの読み込み
const checkoutCart = JSON.parse(sessionStorage.getItem('current_cart') || "[]");
let cashInput = ""; // 入力されたお預かり金額
let totalAmount = 0; // 合計金額
let changeAmount = 0; // 計算されたお釣り

/**
 * 初期化処理
 */
const init = () => {
    const clerk = localStorage.getItem('pos_clerk_id') || "----";
    const label = document.getElementById('clerk-label-checkout');
    if (label) label.textContent = `担当: ${clerk}`;

    updateCheckoutUI();
};

/**
 * 商品一覧と合計金額の表示更新
 */
const updateCheckoutUI = () => {
    const list = document.getElementById('checkout-list');
    const totalDisp = document.getElementById('checkout-total-val');
    if (!list || !totalDisp) return;

    list.innerHTML = "";
    totalAmount = 0;

    checkoutCart.forEach((item) => {
        const sub = item.price * item.qty;
        totalAmount += sub;
        const row = document.createElement('div');
        row.className = 'receipt-item';
        row.innerHTML = `
            <div class="top"><span>${item.name}</span><span>¥${sub.toLocaleString()}</span></div>
            <div class="bottom"><span>@${item.price.toLocaleString()} x ${item.qty}個</span></div>`;
        list.appendChild(row);
    });
    totalDisp.textContent = totalAmount.toLocaleString();
};

/**
 * 【現金以外の決済】以前と同じように即座に完了させる
 * （HTML側の onclick="finishPayment(...)" に名前を合わせました）
 */
window.finishPayment = (methodName) => {
    alert(`${methodName}でお会計が完了しました。`);
    
    // カートを空にしてメイン画面へ
    sessionStorage.removeItem('current_cart');
    location.href = 'Tas.html';
};

/**
 * 【現金決済】画面切り替えとテンキー処理
 */
window.startCashPayment = () => {
    // 支払い方法選択を隠し、現金入力画面を出す
    const mainPane = document.querySelector('.payment-methods-pane:not(#cash-payment-pane)');
    const cashPane = document.getElementById('cash-payment-pane');
    if (mainPane) mainPane.classList.add('hidden');
    if (cashPane) cashPane.classList.remove('hidden');
    window.pressClear(); // 金額をリセット
};

window.showMethods = () => {
    // 現金画面を隠し、選択画面に戻す
    const cashPane = document.getElementById('cash-payment-pane');
    const mainPane = document.querySelector('.payment-methods-pane:not(#cash-payment-pane)');
    if (cashPane) cashPane.classList.add('hidden');
    if (mainPane) mainPane.classList.remove('hidden');
};

// テンキー入力
window.pressNum = (num) => {
    if (cashInput.length >= 8) return;
    cashInput += num;
    updateCashDisplay();
};

// 消去ボタン
window.pressClear = () => {
    cashInput = "";
    updateCashDisplay();
};

/**
 * お預かり金額とお釣りの表示更新
 */
const updateCashDisplay = () => {
    // ★HTML側の id="cash-val" に名前を合わせました
    const paidDisp = document.getElementById('cash-val');
    const changeDisp = document.getElementById('change-val');
    const finishBtn = document.getElementById('btn-finish-cash');

    // 1. お預かり金額の表示を更新
    if (paidDisp) {
        const displayVal = cashInput === "" ? "0" : Number(cashInput).toLocaleString();
        paidDisp.textContent = displayVal;
    }

    // 2. お釣りの計算
    const paidNum = Number(cashInput);
    changeAmount = paidNum - totalAmount;

    // 3. お釣りの表示とボタンの活性化
    if (changeDisp) {
        changeDisp.textContent = changeAmount.toLocaleString();
        
        // 足りている場合
        if (changeAmount >= 0 && cashInput !== "") {
            changeDisp.style.color = "#1e293b";
            if (finishBtn) {
                finishBtn.disabled = false;
                finishBtn.classList.remove('disabled');
            }
        } else {
            // 足りない場合
            changeDisp.style.color = "red";
            if (finishBtn) {
                finishBtn.disabled = true;
                finishBtn.classList.add('disabled');
            }
        }
    }
};

/**
 * 現金決済完了
 */
window.finishCashPayment = () => {
    const paid = Number(cashInput);
    alert(`お会計完了\nお預かり：¥${paid.toLocaleString()}\nお釣り：¥${changeAmount.toLocaleString()}`);
    
    sessionStorage.removeItem('current_cart');
    location.href = 'Tas.html';
};

// 起動
document.addEventListener('DOMContentLoaded', init);