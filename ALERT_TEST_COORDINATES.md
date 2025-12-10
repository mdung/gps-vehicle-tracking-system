# Geofence Alert Test Coordinates

## Vehicle to Use: ABC-1234 (assigned to all geofences)

## Test Scenarios:

### 1. **Customer Site A Entry Alert**
- **Geofence**: Customer Site A (40.75890, -73.98510, 200m radius)
- **Alert Type**: ENTRY_AND_EXIT
- **Test Steps**:
  1. First, position vehicle OUTSIDE: `Lat: 40.75500, Lng: -73.98000`
  2. Then move vehicle INSIDE: `Lat: 40.75890, Lng: -73.98510`
  3. **Expected**: ENTRY alert generated

### 2. **Restricted Zone Unauthorized Entry Alert** ⚠️
- **Geofence**: Restricted Zone (40.75050, -73.99340, 300m radius)
- **Alert Type**: UNAUTHORIZED_ENTRY
- **Test Steps**:
  1. First, position vehicle OUTSIDE: `Lat: 40.74700, Lng: -73.99000`
  2. Then move vehicle INSIDE: `Lat: 40.75050, Lng: -73.99340`
  3. **Expected**: UNAUTHORIZED_ENTRY alert (HIGH severity)

### 3. **Main Depot Entry Alert**
- **Geofence**: Main Depot (40.71280, -74.00600, 500m radius)
- **Alert Type**: ENTRY_AND_EXIT
- **Test Steps**:
  1. First, position vehicle OUTSIDE: `Lat: 40.70800, Lng: -74.01000`
  2. Then move vehicle INSIDE: `Lat: 40.71280, Lng: -74.00600`
  3. **Expected**: ENTRY alert generated

### 4. **Service Area North Entry Alert**
- **Geofence**: Service Area North (40.78310, -73.97120, 1000m radius)
- **Alert Type**: ENTRY_ONLY
- **Test Steps**:
  1. First, position vehicle OUTSIDE: `Lat: 40.77000, Lng: -73.96000`
  2. Then move vehicle INSIDE: `Lat: 40.78310, Lng: -73.97120`
  3. **Expected**: ENTRY alert generated

## Quick Test Instructions:

1. **Go to GPS Tracking page**
2. **Select vehicle: ABC-1234**
3. **For Restricted Zone Alert (easiest to see)**:
   - Set Latitude: `40.74700`
   - Set Longitude: `-73.99000`
   - Click "Update Location"
   - Wait 2 seconds
   - Set Latitude: `40.75050`
   - Set Longitude: `-73.99340`
   - Click "Update Location"
4. **Go to Geofencing & Alerts page**
5. **Click "Active Alerts" tab**
6. **You should see the UNAUTHORIZED_ENTRY alert!**

## Alternative: Use PowerShell Script

Run the automated test script:
```powershell
.\test-geofence-alerts.ps1
```

This will automatically send GPS locations and generate multiple alerts.