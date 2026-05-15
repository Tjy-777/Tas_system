// js/checkout.js

const checkoutCart = JSON.parse(sessionStorage.getItem('current_cart') || "[]");
let cashInput = ""; 
let totalAmount = 0;
let changeAmount = 0; 

const init = () => {
    const clerk = localStorage.getItem('pos_clerk_id') || "----";
    const label = document.getElementById('clerk-label-checkout');
    if (label) label.textContent = `担当: ${clerk}`;


    updateCheckoutUI();
};

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
    
    calculateChange();
};

// テンキー入力
window.pressNum = (num) => {
    cashInput += num;
    updateCashDisplay();
};

// 消去ボタン
window.pressClear = () => {
    cashInput = "";
    updateCashDisplay();
};

// お預かり金額の表示
const updateCashDisplay = () => {
    const paidDisp = document.getElementById('paid-val');
    if (paidDisp) {
        paidDisp.textContent = cashInput === "" ? "0" : Number(cashInput).toLocaleString();
    }
    calculateChange();
};

// お釣り計算とボタン制御
const calculateChange = () => {
    const paid = Number(cashInput);
    changeAmount = paid - totalAmount;
    const changeDisp = document.getElementById('change-val');
    const finishBtn = document.getElementById('btn-finish-cash');

    if (!changeDisp) return;

    changeDisp.textContent = changeAmount.toLocaleString();

    // changeAmount を使って正しく判定
    if (changeAmount >= 0 && cashInput !== "") {
        changeDisp.style.color = "#1e293b";
        if (finishBtn) {
            finishBtn.classList.remove('disabled');
            finishBtn.disabled = false;
        }
    } else {
        changeDisp.style.color = "red";
        if (finishBtn) {
            finishBtn.classList.add('disabled');
            finishBtn.disabled = true;
        }
    }
};

// 支払い方法選択画面から現金払い画面への切り替え
window.startCashPayment = () => {
    const mainPane = document.querySelector('.payment-methods-pane:not(#cash-payment-pane)');
    const cashPane = document.getElementById('cash-payment-pane');
    if (mainPane) mainPane.classList.add('hidden');
    if (cashPane) cashPane.classList.remove('hidden');
    window.pressClear();
};

// 現金払い画面から支払い方法選択画面へ戻る
window.showMethods = () => {
    const cashPane = document.getElementById('cash-payment-pane');
    const mainPane = document.querySelector('.payment-methods-pane:not(#cash-payment-pane)');
    if (cashPane) cashPane.classList.add('hidden');
    if (mainPane) mainPane.classList.remove('hidden');
};

// 決済完了処理（アラート表示）
window.finishCashPayment = () => {
    const paid = Number(cashInput);
    alert(`お会計完了\nお預かり: ¥${paid.toLocaleString()}\nお釣り: ¥${changeAmount.toLocaleString()}`);
    sessionStorage.removeItem('current_cart');
    window.location.href = 'Tas.html';
};

// ページ読み込み時に初期化を確実に実行する
document.addEventListener('DOMContentLoaded', init);