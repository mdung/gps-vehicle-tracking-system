# Hướng dẫn Test WebSocket Real-time

## Cách 1: Test bằng Form trên UI (Đơn giản nhất)

1. **Mở 2 tab trình duyệt:**
   - Tab 1: `http://localhost:3000/tracking`
   - Tab 2: `http://localhost:3000` (Dashboard)

2. **Kiểm tra WebSocket Status:**
   - Cả 2 tab đều phải hiển thị: 🟢 Connected

3. **Tạo location mới ở Tab 1:**
   - Điền form "Update Location"
   - Click "Update Location"

4. **Quan sát:**
   - Tab 1: Marker xuất hiện ngay
   - Tab 2: Marker tự động cập nhật (KHÔNG cần refresh!)

---

## Cách 2: Test bằng API (Postman/curl)

### Bước 1: Lấy Vehicle ID

```bash
# Lấy danh sách vehicles
curl http://localhost:8080/api/vehicles
```

Copy `id` của một vehicle (ví dụ: `abc-123-def-456`)

### Bước 2: Tạo GPS Location mới

```bash
curl -X POST http://localhost:8080/api/gps-locations \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "PASTE_VEHICLE_ID_HERE",
    "latitude": 10.762622,
    "longitude": 106.660172,
    "speed": 60,
    "direction": 90
  }'
```

### Bước 3: Quan sát Frontend
- Mở Dashboard hoặc Tracking page
- Marker sẽ tự động xuất hiện/cập nhật ngay lập tức!

---

## Cách 3: Test với nhiều locations liên tiếp

Tạo script test tự động:

```bash
# Test script (chạy trong terminal)
for i in {1..5}; do
  curl -X POST http://localhost:8080/api/gps-locations \
    -H "Content-Type: application/json" \
    -d "{
      \"vehicleId\": \"YOUR_VEHICLE_ID\",
      \"latitude\": $((106 + i * 0.01)),
      \"longitude\": $((10 + i * 0.01)),
      \"speed\": $((50 + i * 10)),
      \"direction\": $((i * 30))
    }"
  sleep 2
done
```

---

## Kiểm tra WebSocket hoạt động:

1. **Mở Browser Console (F12)**
2. **Xem logs:**
   - `WebSocket connected` - Kết nối thành công
   - `Received location update: {...}` - Nhận được update

3. **Test disconnect:**
   - Dừng backend → WebSocket status chuyển sang 🔴
   - Khởi động lại backend → Tự động reconnect 🟢

---

## Troubleshooting:

- **WebSocket không connect:**
  - Kiểm tra backend đang chạy tại `http://localhost:8080`
  - Kiểm tra console có lỗi gì không

- **Không nhận được update:**
  - Kiểm tra WebSocket status phải là 🟢
  - Kiểm tra console có log "Received location update" không
  - Kiểm tra vehicleId có đúng không

