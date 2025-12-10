#!/bin/bash

echo "Testing Fuel Management API..."

# Test health check
echo "1. Testing health check..."
curl -X GET "http://localhost:8080/api/fuel/health" -H "accept: */*"
echo -e "\n"

# Test get all fuel records
echo "2. Testing get all fuel records..."
curl -X GET "http://localhost:8080/api/fuel/records?page=0&size=20" -H "accept: application/json"
echo -e "\n"

# Test get all vehicles (to check if basic system is working)
echo "3. Testing get all vehicles..."
curl -X GET "http://localhost:8080/api/vehicles" -H "accept: application/json"
echo -e "\n"

echo "API tests completed."