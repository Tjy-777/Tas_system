<?php
// api_products.php (商品データ取得用)
header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';

try {
    // itemsテーブルから全ての商品を取得
    $stmt = $pdo->query("SELECT * FROM items");
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $products = [];
    foreach ($items as $item) {
        // JavaScript側で扱いやすいように、キーを「item_id」にします
        // （もしレジのコード入力で barcode を使う場合は、ここを $item['barcode'] にしてください）
        $code = $item['item_id']; 
        
        $products[$code] = [
            'name' => $item['item_name'],      // JSの .name に対応
            'price' => (int)$item['price'],    // JSの .price に対応
            'category' => $item['category'],   // JSの .category に対応
            'barcode' => $item['barcode'],
            'tax_rate' => (float)$item['tax_rate'],
            'stock' => (int)$item['stock_quantity']
        ];
    }

    // JSON形式でJavaScriptに返す
    echo json_encode($products, JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DBエラーが発生しました: ' . $e->getMessage()]);
}