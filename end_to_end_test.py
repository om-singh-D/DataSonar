import time
import requests
import json
from datetime import datetime, timezone

# 1. Post to Ingestion Service
print("🚀 Sending payload to Ingestion Service...")
ingestion_url = "http://localhost:3001/api/v1/ingest"

payload = {
    "sourceId": "pipe-demo-999",
    "sourceName": "Demo Pipeline End-to-End",
    "sourceType": "database",
    "eventType": "incremental",
    "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    "data": {
        "schema": {
            "id": "integer",
            "user_name": "string",
            "age": "integer",
            "is_active": "boolean"
        },
        "records": [
            {"id": 1, "user_name": "Alice", "age": 30, "is_active": True},
            {"id": 2, "user_name": "Bob", "age": "twenty", "is_active": False},  # Intentionally bad age
            {"id": 3, "user_name": None, "age": 25, "is_active": True},       # Intentionally missing name
            {"id": 1, "user_name": "Alice", "age": 30, "is_active": True}     # Intentional duplicate
        ],
        "recordCount": 4
    }
}

try:
    resp = requests.post(ingestion_url, json=payload, timeout=5)
    resp.raise_for_status()
    ingest_data = resp.json()
    print("✅ Ingestion successful:", json.dumps(ingest_data, indent=2))
except Exception as e:
    print("❌ Ingestion failed:", e)
    if 'resp' in locals():
        print(resp.text)
    exit(1)

# 2. Wait for Kafka and Quality Engine processing
print("\n⏳ Waiting 5 seconds for Kafka and Quality Engine to process...")
time.sleep(5)

# 3. Check Quality Engine for the score
print("\n📊 Checking Quality Engine for the score...")
qe_url = "http://localhost:8000/api/v1/quality/scores/pipe-demo-999/latest"

try:
    resp = requests.get(qe_url, timeout=5)
    resp.raise_for_status()
    qe_data = resp.json()
    score = qe_data['data']['score']
    print(f"✅ Quality Score Retrieved! Grade: {score['grade']} | Composite: {score['composite_score']:.2f}")
    
    print("\nDimension Breakdown:")
    dims = score['dimensions']
    print(f" - Completeness: {dims['completeness']['score']:.2f} ({dims['completeness']['details']})")
    print(f" - Accuracy:     {dims['accuracy']['score']:.2f} ({dims['accuracy']['details']})")
    print(f" - Consistency:  {dims['consistency']['score']:.2f} ({dims['consistency']['details']})")
    print(f" - Validity:     {dims['validity']['score']:.2f} ({dims['validity']['details']})")
    print(f" - Uniqueness:   {dims['uniqueness']['score']:.2f} ({dims['uniqueness']['details']})")
    print(f" - Timeliness:   {dims['timeliness']['score']:.2f} ({dims['timeliness']['details']})")

except Exception as e:
    print("❌ Failed to fetch Quality Engine score:", e)
    if 'resp' in locals() and hasattr(resp, 'text'):
        print(resp.text)
    exit(1)

print("\n🎉 End-to-End Pipeline Verification Successful!")
