#!/bin/bash

# Script test WebSocket - Tạo nhiều GPS locations liên tiếp
# Usage: ./test-websocket.sh <VEHICLE_ID>

VEHICLE_ID=$1

if [ -z "$VEHICLE_ID" ]; then
  echo "Usage: ./test-websocket.sh <VEHICLE_ID>"
  echo ""
  echo "First, get a vehicle ID:"
  echo "curl http://localhost:8080/api/vehicles"
  exit 1
fi

echo "Testing WebSocket with Vehicle ID: $VEHICLE_ID"
echo "Make sure you have Dashboard or Tracking page open!"
echo ""

# Test locations around Ho Chi Minh City
locations=(
  "10.762622,106.660172,60,90"
  "10.772622,106.670172,65,95"
  "10.782622,106.680172,70,100"
  "10.792622,106.690172,75,105"
  "10.802622,106.700172,80,110"
)

for i in "${!locations[@]}"; do
  IFS=',' read -r lat lng speed direction <<< "${locations[$i]}"
  
  echo "[$((i+1))/${#locations[@]}] Creating location: Lat=$lat, Lng=$lng, Speed=$speed, Direction=$direction"
  
  curl -X POST http://localhost:8080/api/gps-locations \
    -H "Content-Type: application/json" \
    -d "{
      \"vehicleId\": \"$VEHICLE_ID\",
      \"latitude\": $lat,
      \"longitude\": $lng,
      \"speed\": $speed,
      \"direction\": $direction
    }" \
    -s -o /dev/null
  
  echo "✅ Location created! Check your browser - marker should update automatically!"
  echo ""
  
  sleep 3
done

echo "✅ Test completed! All locations should appear on the map in real-time!"

