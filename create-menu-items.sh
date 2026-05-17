#!/bin/bash
set -e

JWT=$(curl -s -X POST http://localhost:1337/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hestc-me.site","password":"Admin@2024#Hestc"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('token',''))")

API="http://localhost:1337/content-manager/collection-types/api::lila-menu-item.lila-menu-item"
H_AUTH="Authorization: Bearer $JWT"
H_CT="Content-Type: application/json"
LOCALE="en-US"
ORDER=0

# create_item: prints ONLY documentId to stdout, logs to stderr
create_item() {
  local title="$1" slug="$2" link_type="$3" medusa_handle="$4" parent_doc_id="$5"
  ORDER=$((ORDER + 1))

  # Build JSON body using python3 for proper escaping
  local body
  body=$(python3 -c "
import json, sys
body = {
    'title': sys.argv[1],
    'url': '/' + sys.argv[2],
    'slug': sys.argv[2],
    'link_type': sys.argv[3],
    'order': int(sys.argv[4]),
    'visible': True,
    'locale': sys.argv[5],
}
if len(sys.argv) > 6 and sys.argv[6] and sys.argv[6] != 'None':
    body['medusaHandle'] = sys.argv[6]
if len(sys.argv) > 7 and sys.argv[7] and sys.argv[7] != 'None':
    body['parent'] = {'connect': [{'documentId': sys.argv[7]}]}
print(json.dumps(body))
" "$title" "$slug" "$link_type" "$ORDER" "$LOCALE" "$medusa_handle" "$parent_doc_id")

  local resp
  resp=$(curl -s -X POST "$API" -H "$H_AUTH" -H "$H_CT" -d "$body")

  local doc_id
  doc_id=$(echo "$resp" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('documentId',''))")

  if [ -n "$doc_id" ]; then
    echo "$doc_id"
    echo "  OK: $title (order=$ORDER, lt=$link_type, slug=$slug)" >&2
  else
    echo "  FAIL: $title -> $(echo $resp | python3 -c 'import sys,json; d=json.load(sys.stdin); print(json.dumps(d.get(\"error\",{}))[:150])')" >&2
    echo ""
  fi
}

# ============================================================
echo "=== Clearing existing items ===" >&2
existing=$(curl -s "$API?locale=$LOCALE&pageSize=100" -H "$H_AUTH")
echo "$existing" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for item in data.get('results', []):
    print(item.get('documentId',''))
" | while read doc_id; do
  if [ -n "$doc_id" ]; then
    curl -s -X DELETE "$API/$doc_id" -H "$H_AUTH" > /dev/null
  fi
done
echo "Cleared all existing items" >&2

# ============================================================
echo "=== Creating menu items ===" >&2

# Women
WOMEN=$(create_item "Women" "women" "page" "" "")
W_CLOTHING=$(create_item "Clothing" "women-clothing" "category" "women-clothing" "$WOMEN")
create_item "Dresses" "dresses" "category" "dresses" "$W_CLOTHING" > /dev/null
create_item "Tops" "tops" "category" "tops" "$W_CLOTHING" > /dev/null
create_item "Bottoms" "bottoms" "category" "bottoms" "$W_CLOTHING" > /dev/null
create_item "Outerwear" "outerwear" "category" "outerwear" "$W_CLOTHING" > /dev/null
create_item "Lingerie" "lingerie" "category" "lingerie" "$W_CLOTHING" > /dev/null

W_ACC=$(create_item "Accessories" "women-accessories" "category" "women-accessories" "$WOMEN")
create_item "Bags" "bags" "category" "bags" "$W_ACC" > /dev/null
create_item "Jewelry" "jewelry" "category" "jewelry" "$W_ACC" > /dev/null
create_item "Scarves" "scarves" "category" "scarves" "$W_ACC" > /dev/null
create_item "Hats" "hats" "category" "hats" "$W_ACC" > /dev/null
create_item "Belts" "belts" "category" "belts" "$W_ACC" > /dev/null

# Men
MEN=$(create_item "Men" "men" "page" "" "")
M_CLOTHING=$(create_item "Clothing" "men-clothing" "category" "men-clothing" "$MEN")
create_item "Shirts" "shirts" "category" "shirts" "$M_CLOTHING" > /dev/null
create_item "Pants" "pants" "category" "pants" "$M_CLOTHING" > /dev/null
create_item "Jackets" "jackets" "category" "jackets" "$M_CLOTHING" > /dev/null
create_item "Suits" "suits" "category" "suits" "$M_CLOTHING" > /dev/null
create_item "Activewear" "activewear" "category" "activewear" "$M_CLOTHING" > /dev/null

M_ACC=$(create_item "Accessories" "men-accessories" "category" "men-accessories" "$MEN")
create_item "Watches" "watches" "category" "watches" "$M_ACC" > /dev/null
create_item "Wallets" "wallets" "category" "wallets" "$M_ACC" > /dev/null
create_item "Ties" "ties" "category" "ties" "$M_ACC" > /dev/null
create_item "Sunglasses" "sunglasses" "category" "sunglasses" "$M_ACC" > /dev/null
create_item "Cufflinks" "cufflinks" "category" "cufflinks" "$M_ACC" > /dev/null

# Kids
KIDS=$(create_item "Kids" "kids" "page" "" "")
K_GIRLS=$(create_item "Girls" "kids-girls" "category" "kids-girls" "$KIDS")
create_item "Dresses" "girls-dresses" "category" "girls-dresses" "$K_GIRLS" > /dev/null
create_item "Tops" "girls-tops" "category" "girls-tops" "$K_GIRLS" > /dev/null
create_item "Bottoms" "girls-bottoms" "category" "girls-bottoms" "$K_GIRLS" > /dev/null
create_item "Sets" "girls-sets" "collection" "girls-sets" "$K_GIRLS" > /dev/null
create_item "Sleepwear" "girls-sleepwear" "category" "girls-sleepwear" "$K_GIRLS" > /dev/null

K_BOYS=$(create_item "Boys" "kids-boys" "category" "kids-boys" "$KIDS")
create_item "T-Shirts" "boys-tshirts" "category" "boys-tshirts" "$K_BOYS" > /dev/null
create_item "Shorts" "boys-shorts" "category" "boys-shorts" "$K_BOYS" > /dev/null
create_item "Jeans" "boys-jeans" "category" "boys-jeans" "$K_BOYS" > /dev/null
create_item "Jackets" "boys-jackets" "category" "boys-jackets" "$K_BOYS" > /dev/null
create_item "Activewear" "boys-activewear" "category" "boys-activewear" "$K_BOYS" > /dev/null

# Home & Living
HOME=$(create_item "Home & Living" "home-living" "page" "" "")
H_DECOR=$(create_item "Decor" "home-decor" "category" "home-decor" "$HOME")
create_item "Vases" "vases" "category" "vases" "$H_DECOR" > /dev/null
create_item "Candles" "candles" "category" "candles" "$H_DECOR" > /dev/null
create_item "Mirrors" "mirrors" "category" "mirrors" "$H_DECOR" > /dev/null
create_item "Art Prints" "art-prints" "category" "art-prints" "$H_DECOR" > /dev/null
create_item "Plants" "plants" "category" "plants" "$H_DECOR" > /dev/null

H_TEX=$(create_item "Textiles" "home-textiles" "category" "home-textiles" "$HOME")
create_item "Cushions" "cushions" "category" "cushions" "$H_TEX" > /dev/null
create_item "Throws" "throws" "category" "throws" "$H_TEX" > /dev/null
create_item "Rugs" "rugs" "category" "rugs" "$H_TEX" > /dev/null
create_item "Curtains" "curtains" "category" "curtains" "$H_TEX" > /dev/null
create_item "Towels" "towels" "category" "towels" "$H_TEX" > /dev/null

echo "=== Done: $ORDER items created ===" >&2
