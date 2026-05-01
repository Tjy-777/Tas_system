// js/checkout.js

// データの読み込み
const checkoutCart = JSON.parse(sessionStorage.getItem('current_cart') || "[]");
let cashInput = ""; 
let totalAmount = 0;

/**
 * 初期化処理
 */
const init = () => {
    // 担当者表示
    const clerk = localStorage.getItem('pos_clerk_id') || "----";
    const label = document.getElementById('clerk-label-checkout');
    if (label) label.textContent = `担当: ${clerk}`;

    updateCheckoutUI();
};

/**
 * 商品一覧の表示更新
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
 * テンキー入力（HTMLのonclickから呼べるようにwindowに登録）
 */
window.pressNum = (num) => {
    if (cashInput.length < 10) {
        cashInput += num;
        document.getElementById('cash-input-val').textContent = Number(cashInput).toLocaleString();
        calculateChange(); 
    }
};

/**
 * 消去
 */
window.pressClear = () => {
    cashInput = "";
    document.getElementById('cash-input-val').textContent = "0";
    document.getElementById('change-val').textContent = "0";
    
    const finishBtn = document.getElementById('btn-finish-cash');
    finishBtn.classList.add('disabled');
    finishBtn.disabled = true;
};

/**
 * お釣り計算
 */
const calculateChange = () => {
    const paid = Number(cashInput);
    const change = paid - totalAmount;
    const changeDisp = document.getElementById('change-val');
    const finishBtn = document.getElementById('btn-finish-cash');

    changeDisp.textContent = change.toLocaleString();

    if (change >= 0 && cashInput !== "") {
        changeDisp.style.color = "#1e293b";
        finishBtn.classList.remove('disabled');
        finishBtn.disabled = false;
    } else {
        changeDisp.style.color = "red";
        finishBtn.classList.add('disabled');
        finishBtn.disabled = true;
    }
};

// HTMLの決定ボタン用にも登録しておく場合
window.calculateChange = calculateChange;

/**
 * 画面切り替え系
 */
window.startCashPayment = () => {
    document.querySelector('.payment-methods-pane:not(#cash-payment-pane)').classList.add('hidden');
    document.getElementById('cash-payment-pane').classList.remove('hidden');
    window.pressClear();
};

window.showMethods = () => {
    document.getElementById('cash-payment-pane').classList.add('hidden');
    document.querySelector('.payment-methods-pane:not(#cash-payment-pane)').classList.remove('hidden');
};

/**
 * 決済完了
 */
window.finishCashPayment = () => {
    alert("お会計が完了しました。");
    sessionStorage.removeItem('current_cart');
    location.href = 'Tas.html';
};

window.finishPayment = (method) => {
    alert(`${method}でお会計が完了しました。`);
    sessionStorage.removeItem('current_cart');
    location.href = 'Tas.html';
};

// 実行
init();