<?php
// api_products.php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

try {
    $stmt = $pdo->query("SELECT * FROM products");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // JSで扱いやすいように item_code をキーにした連想配列に変換する
    $result = [];
    foreach ($products as $row) {
        $result[$row['item_code']] = [
            'name' => $row['name'],
            'kana' => $row['kana'],
            'price' => (int)$row['price'],
            'category' => $row['category']
        ];
    }
    
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
