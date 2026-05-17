#!/usr/bin/env python3
"""Create menu items directly on the Strapi server via Python urllib — no shell escaping."""
import json, urllib.request, sys, os

BASE = 'http://localhost:1337'
CT = 'api::lila-menu-item.lila-menu-item'
API = f'{BASE}/content-manager/collection-types/{CT}'
LOCALE = 'en-US'

def api_post(path, body_dict, jwt):
    data = json.dumps(body_dict).encode()
    req = urllib.request.Request(f'{BASE}{path}', data=data, headers={
        'Authorization': f'Bearer {jwt}',
        'Content-Type': 'application/json',
    })
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def api_delete(path, jwt):
    req = urllib.request.Request(f'{BASE}{path}', method='DELETE', headers={
        'Authorization': f'Bearer {jwt}',
    })
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def api_get(path, jwt):
    req = urllib.request.Request(f'{BASE}{path}', headers={
        'Authorization': f'Bearer {jwt}',
    })
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

# Login
login_body = json.dumps({'email': 'admin@hestc-me.site', 'password': 'Admin@2024#Hestc'}).encode()
req = urllib.request.Request(f'{BASE}/admin/login', data=login_body, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as resp:
    jwt = json.loads(resp.read().decode())['data']['token']
print(f'JWT: {jwt[:30]}...')

# Clear existing items
print('Clearing existing items...')
try:
    existing = api_get(f'/content-manager/collection-types/{CT}?locale={LOCALE}&pageSize=100', jwt)
    for item in existing.get('results', []):
        doc_id = item['documentId']
        api_delete(f'/content-manager/collection-types/{CT}/{doc_id}', jwt)
    print(f'Deleted {len(existing.get("results", []))} items')
except Exception as e:
    print(f'Clear error (continuing): {e}')

# Menu structure
menu_def = [
    ("Women", "women", [
        ("Clothing", "women-clothing", "category", "women-clothing", [
            ("Dresses", "dresses", "category", "dresses"),
            ("Tops", "tops", "category", "tops"),
            ("Bottoms", "bottoms", "category", "bottoms"),
            ("Outerwear", "outerwear", "category", "outerwear"),
            ("Lingerie", "lingerie", "category", "lingerie"),
        ]),
        ("Accessories", "women-accessories", "category", "women-accessories", [
            ("Bags", "bags", "category", "bags"),
            ("Jewelry", "jewelry", "category", "jewelry"),
            ("Scarves", "scarves", "category", "scarves"),
            ("Hats", "hats", "category", "hats"),
            ("Belts", "belts", "category", "belts"),
        ]),
    ]),
    ("Men", "men", [
        ("Clothing", "men-clothing", "category", "men-clothing", [
            ("Shirts", "shirts", "category", "shirts"),
            ("Pants", "pants", "category", "pants"),
            ("Jackets", "jackets", "category", "jackets"),
            ("Suits", "suits", "category", "suits"),
            ("Activewear", "activewear", "category", "activewear"),
        ]),
        ("Accessories", "men-accessories", "category", "men-accessories", [
            ("Watches", "watches", "category", "watches"),
            ("Wallets", "wallets", "category", "wallets"),
            ("Ties", "ties", "category", "ties"),
            ("Sunglasses", "sunglasses", "category", "sunglasses"),
            ("Cufflinks", "cufflinks", "category", "cufflinks"),
        ]),
    ]),
    ("Kids", "kids", [
        ("Girls", "kids-girls", "category", "kids-girls", [
            ("Dresses", "girls-dresses", "category", "girls-dresses"),
            ("Tops", "girls-tops", "category", "girls-tops"),
            ("Bottoms", "girls-bottoms", "category", "girls-bottoms"),
            ("Sets", "girls-sets", "collection", "girls-sets"),
            ("Sleepwear", "girls-sleepwear", "category", "girls-sleepwear"),
        ]),
        ("Boys", "kids-boys", "category", "kids-boys", [
            ("T-Shirts", "boys-tshirts", "category", "boys-tshirts"),
            ("Shorts", "boys-shorts", "category", "boys-shorts"),
            ("Jeans", "boys-jeans", "category", "boys-jeans"),
            ("Jackets", "boys-jackets", "category", "boys-jackets"),
            ("Activewear", "boys-activewear", "category", "boys-activewear"),
        ]),
    ]),
    ("Home & Living", "home-living", [
        ("Decor", "home-decor", "category", "home-decor", [
            ("Vases", "vases", "category", "vases"),
            ("Candles", "candles", "category", "candles"),
            ("Mirrors", "mirrors", "category", "mirrors"),
            ("Art Prints", "art-prints", "category", "art-prints"),
            ("Plants", "plants", "category", "plants"),
        ]),
        ("Textiles", "home-textiles", "category", "home-textiles", [
            ("Cushions", "cushions", "category", "cushions"),
            ("Throws", "throws", "category", "throws"),
            ("Rugs", "rugs", "category", "rugs"),
            ("Curtains", "curtains", "category", "curtains"),
            ("Towels", "towels", "category", "towels"),
        ]),
    ]),
]

order = [0]
created = [0]

def create_item(title, slug, link_type, medusa_handle=None, parent_doc_id=None):
    order[0] += 1
    body = {
        'title': title,
        'url': '/' + slug,
        'slug': slug,
        'link_type': link_type,
        'order': order[0],
        'visible': True,
        'locale': LOCALE,
    }
    if medusa_handle:
        body['medusaHandle'] = medusa_handle
    if parent_doc_id:
        body['parent'] = {'connect': [{'documentId': parent_doc_id}]}

    try:
        resp = api_post(f'/content-manager/collection-types/{CT}', body, jwt)
        doc_id = (resp.get('data') or {}).get('documentId', '')
        if doc_id:
            created[0] += 1
            print(f'  [{created[0]}] {title} (lt={link_type}, slug={slug})')
            return doc_id
        else:
            err_info = json.dumps(resp.get('error', {}))
            print(f'  FAIL [{title}]: {err_info[:120]}')
            return None
    except Exception as e:
        print(f'  ERROR [{title}]: {e}')
        return None

def create_menu_tree(items, parent_doc_id=None):
    for title, slug, children in items:
        link_type = 'category'
        medusa_handle = slug
        doc_id = create_item(title, slug, link_type, medusa_handle, parent_doc_id)
        if doc_id and children:
            for child_title, child_slug, child_lt, child_mh, grandchildren in children:
                child_doc_id = create_item(child_title, child_slug, child_lt, child_mh, doc_id)
                if child_doc_id and grandchildren:
                    for gc_title, gc_slug, gc_lt, gc_mh in grandchildren:
                        create_item(gc_title, gc_slug, gc_lt, gc_mh, child_doc_id)

print('Creating menu items...')
create_menu_tree(menu_def)

# Verify
print(f'\n=== Verification ===')
verify = api_get(f'/content-manager/collection-types/{CT}?locale={LOCALE}&pageSize=100', jwt)
items = verify.get('results', [])
top = [i for i in items if i.get('parent') is None]
print(f'Total: {len(items)}, Top-level: {len(top)}')
for t in top:
    children = [i for i in items if (i.get('parent') or {}).get('documentId') == t['documentId']]
    print(f'  {t["title"]} (slug={t.get("slug")}, lt={t.get("link_type")}) -> {len(children)} children')

print(f'\nOrder created: {order[0]}, Successful: {created[0]}')
