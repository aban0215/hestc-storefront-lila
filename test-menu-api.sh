#!/bin/bash
# Get JWT
JWT=$(curl -s -X POST http://localhost:1337/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hestc-me.site","password":"Admin@2024#Hestc"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('token',''))")

echo "=== Test A: Only old fields ==="
cat > /tmp/ta.json << 'EOF'
{"title":"TestA","url":"/testa","order":1,"visible":true,"locale":"en-US"}
EOF
curl -s -X POST "http://localhost:1337/content-manager/collection-types/api::lila-menu-item.lila-menu-item" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d @/tmp/ta.json | python3 -c "import sys,json; d=json.load(sys.stdin); print('A:', d.get('data',{}).get('title','FAILED'), d.get('data',{}).get('documentId','no-id'))"

echo "=== Test B: With slug only ==="
cat > /tmp/tb.json << 'EOF'
{"title":"TestB","url":"/testb","slug":"testb","order":2,"visible":true,"locale":"en-US"}
EOF
curl -s -X POST "http://localhost:1337/content-manager/collection-types/api::lila-menu-item.lila-menu-item" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d @/tmp/tb.json | python3 -c "import sys,json; d=json.load(sys.stdin); dd=d.get('data',{}); print('B:', dd.get('title','FAIL'), 'slug='+str(dd.get('slug','N/A')))"

echo "=== Test C: With link_type ==="
cat > /tmp/tc.json << 'EOF'
{"title":"TestC","url":"/testc","link_type":"category","order":3,"visible":true,"locale":"en-US"}
EOF
curl -s -X POST "http://localhost:1337/content-manager/collection-types/api::lila-menu-item.lila-menu-item" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d @/tmp/tc.json | python3 -c "import sys,json; d=json.load(sys.stdin); dd=d.get('data',{}); print('C:', dd.get('title','FAIL'), 'link_type='+str(dd.get('link_type','N/A')))"

echo "=== Test D: All fields ==="
cat > /tmp/td.json << 'EOF'
{"title":"TestD","url":"/testd","slug":"testd","link_type":"blog","medusaHandle":null,"order":4,"visible":true,"locale":"en-US"}
EOF
curl -s -X POST "http://localhost:1337/content-manager/collection-types/api::lila-menu-item.lila-menu-item" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d @/tmp/td.json | python3 -c "import sys,json; d=json.load(sys.stdin); dd=d.get('data',{}); print('D:', dd.get('title','FAIL'), 'slug='+str(dd.get('slug','X')), 'lt='+str(dd.get('link_type','X')))"

echo "=== Test E: With medusaHandle ==="
cat > /tmp/te.json << 'EOF'
{"title":"TestE","url":"/teste","slug":"teste","link_type":"collection","medusaHandle":"summer-collection","order":5,"visible":true,"locale":"en-US"}
EOF
curl -s -X POST "http://localhost:1337/content-manager/collection-types/api::lila-menu-item.lila-menu-item" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d @/tmp/te.json | python3 -c "import sys,json; d=json.load(sys.stdin); dd=d.get('data',{}); print('E:', dd.get('title','FAIL'), 'mh='+str(dd.get('medusaHandle','X')))"

echo "=== Done ==="
