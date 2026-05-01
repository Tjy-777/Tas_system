// js/login.js

const btnLogin = document.getElementById('btn-login');
const empIdInput = document.getElementById('emp-id');

/**
 * ログイン処理
 */
const login = () => {
    // 未入力ならデフォルトID "12345"
    const id = empIdInput.value || "12345";
    
    // 担当者IDを保存
    localStorage.setItem('pos_clerk_id', id);
    
    // メイン画面へ遷移
    window.location.href = 'Tas.html';
};

// クリックイベント
if (btnLogin) {
    btnLogin.addEventListener('click', login);
}

// Enterキーでのログイン対応
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        login();
    }
});

// 全角数字を半角に変換する処理（入力ミス防止）
if (empIdInput) {
    empIdInput.addEventListener('blur', () => {
        let val = empIdInput.value;
        val = val.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => 
            String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
        );
        empIdInput.value = val;
    });
}