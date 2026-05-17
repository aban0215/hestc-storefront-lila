"""
Menu model updater v2 - fix API endpoints.
"""
import paramiko, json

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('47.253.227.7', username='root', password='ca%fw3xt', timeout=15)

def ssh_cmd(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode(), stderr.read().decode()

# Get admin JWT
out, _ = ssh_cmd('''curl -s -X POST http://localhost:1337/admin/login -H "Content-Type: application/json" -d '{"email":"admin@hestc-me.site","password":"Admin@2024#Hestc"}' ''')
jwt = json.loads(out).get('data', {}).get('token', '')
print('JWT:', jwt[:30] + '...')

H = f'"Authorization: Bearer {jwt}" "Content-Type: application/json"'
CT = 'api::lila-menu-item.lila-menu-item'
API = f'http://localhost:1337/content-type-builder/content-types/{CT}'

# ============================================================
# STEP 1: Add fields — PUT entire schema
# ============================================================
print('\n=== Step 1: Add fields ===')

# Get current schema
out, _ = ssh_cmd(f'curl -s "{API}" -H {H}')
current = json.loads(out)
schema = current.get('data', {}).get('schema', {})
attrs = schema.get('attributes', {})
print(f'Current fields: {list(attrs.keys())}')

# Add new fields
attrs['link_type'] = {
    "type": "enumeration",
    "enum": ["category", "collection", "blog"],
    "default": "category",
}
attrs['medusaHandle'] = {"type": "string"}
attrs['slug'] = {"type": "string"}

# PUT updated schema
schema['attributes'] = attrs
put_body = json.dumps({"data": {"schema": schema, "uid": CT}}, separators=(',', ':'))
cmd = f'''curl -s -X PUT "{API}" -H {H} -d '{put_body}' '''
out, err = ssh_cmd(cmd)
print('PUT schema:', out[:300])

# Verify
out, _ = ssh_cmd(f'curl -s "{API}" -H {H}')
new_schema = json.loads(out)
new_attrs = new_schema.get('data', {}).get('schema', {}).get('attributes', {})
print(f'Updated fields: {list(new_attrs.keys())}')

# ============================================================
# STEP 2: Verify items are deleted, then create
# ============================================================
print('\n=== Step 2: Create items ===')

def api_post(path, body_dict):
    body = json.dumps(body_dict, separators=(',', ':'))
    cmd = f'''curl -s -X POST "http://localhost:1337{path}" -H {H} -d '{body}' '''
    out, _ = ssh_cmd(cmd)
    return json.loads(out) if out.strip() else {}

def api_get(path):
    out, _ = ssh_cmd(f'curl -s "http://localhost:1337{path}" -H {H}')
    return json.loads(out) if out.strip() else {}

# Check existing
existing = api_get(f'/content-manager/collection-types/{CT}?locale=en-US&pageSize=100')
existing_items = existing.get('results', [])
print(f'Existing items: {len(existing_items)}')

# Delete remaining if any
for item in existing_items:
    doc_id = item['documentId']
    ssh_cmd(f'curl -s -X DELETE "http://localhost:1337/content-manager/collection-types/{CT}/{doc_id}" -H {H}')
print('Cleared all items')

# Menu structure
menu_structure = [
    {"title": "Women", "slug": "women", "link_type": "page", "children": [
        {"title": "Clothing", "slug": "women-clothing", "link_type": "category", "medusaHandle": "women-clothing", "children": [
            {"title": "Dresses", "slug": "dresses", "link_type": "category", "medusaHandle": "dresses"},
            {"title": "Tops", "slug": "tops", "link_type": "category", "medusaHandle": "tops"},
            {"title": "Bottoms", "slug": "bottoms", "link_type": "category", "medusaHandle": "bottoms"},
            {"title": "Outerwear", "slug": "outerwear", "link_type": "category", "medusaHandle": "outerwear"},
            {"title": "Lingerie", "slug": "lingerie", "link_type": "category", "medusaHandle": "lingerie"},
        ]},
        {"title": "Accessories", "slug": "women-accessories", "link_type": "category", "medusaHandle": "women-accessories", "children": [
            {"title": "Bags", "slug": "bags", "link_type": "category", "medusaHandle": "bags"},
            {"title": "Jewelry", "slug": "jewelry", "link_type": "category", "medusaHandle": "jewelry"},
            {"title": "Scarves", "slug": "scarves", "link_type": "category", "medusaHandle": "scarves"},
            {"title": "Hats", "slug": "hats", "link_type": "category", "medusaHandle": "hats"},
            {"title": "Belts", "slug": "belts", "link_type": "category", "medusaHandle": "belts"},
        ]},
    ]},
    {"title": "Men", "slug": "men", "link_type": "page", "children": [
        {"title": "Clothing", "slug": "men-clothing", "link_type": "category", "medusaHandle": "men-clothing", "children": [
            {"title": "Shirts", "slug": "shirts", "link_type": "category", "medusaHandle": "shirts"},
            {"title": "Pants", "slug": "pants", "link_type": "category", "medusaHandle": "pants"},
            {"title": "Jackets", "slug": "jackets", "link_type": "category", "medusaHandle": "jackets"},
            {"title": "Suits", "slug": "suits", "link_type": "category", "medusaHandle": "suits"},
            {"title": "Activewear", "slug": "activewear", "link_type": "category", "medusaHandle": "activewear"},
        ]},
        {"title": "Accessories", "slug": "men-accessories", "link_type": "category", "medusaHandle": "men-accessories", "children": [
            {"title": "Watches", "slug": "watches", "link_type": "category", "medusaHandle": "watches"},
            {"title": "Wallets", "slug": "wallets", "link_type": "category", "medusaHandle": "wallets"},
            {"title": "Ties", "slug": "ties", "link_type": "category", "medusaHandle": "ties"},
            {"title": "Sunglasses", "slug": "sunglasses", "link_type": "category", "medusaHandle": "sunglasses"},
            {"title": "Cufflinks", "slug": "cufflinks", "link_type": "category", "medusaHandle": "cufflinks"},
        ]},
    ]},
    {"title": "Kids", "slug": "kids", "link_type": "page", "children": [
        {"title": "Girls", "slug": "kids-girls", "link_type": "category", "medusaHandle": "kids-girls", "children": [
            {"title": "Dresses", "slug": "girls-dresses", "link_type": "category", "medusaHandle": "girls-dresses"},
            {"title": "Tops", "slug": "girls-tops", "link_type": "category", "medusaHandle": "girls-tops"},
            {"title": "Bottoms", "slug": "girls-bottoms", "link_type": "category", "medusaHandle": "girls-bottoms"},
            {"title": "Sets", "slug": "girls-sets", "link_type": "collection", "medusaHandle": "girls-sets"},
            {"title": "Sleepwear", "slug": "girls-sleepwear", "link_type": "category", "medusaHandle": "girls-sleepwear"},
        ]},
        {"title": "Boys", "slug": "kids-boys", "link_type": "category", "medusaHandle": "kids-boys", "children": [
            {"title": "T-Shirts", "slug": "boys-tshirts", "link_type": "category", "medusaHandle": "boys-tshirts"},
            {"title": "Shorts", "slug": "boys-shorts", "link_type": "category", "medusaHandle": "boys-shorts"},
            {"title": "Jeans", "slug": "boys-jeans", "link_type": "category", "medusaHandle": "boys-jeans"},
            {"title": "Jackets", "slug": "boys-jackets", "link_type": "category", "medusaHandle": "boys-jackets"},
            {"title": "Activewear", "slug": "boys-activewear", "link_type": "category", "medusaHandle": "boys-activewear"},
        ]},
    ]},
    {"title": "Home & Living", "slug": "home-living", "link_type": "page", "children": [
        {"title": "Decor", "slug": "home-decor", "link_type": "category", "medusaHandle": "home-decor", "children": [
            {"title": "Vases", "slug": "vases", "link_type": "category", "medusaHandle": "vases"},
            {"title": "Candles", "slug": "candles", "link_type": "category", "medusaHandle": "candles"},
            {"title": "Mirrors", "slug": "mirrors", "link_type": "category", "medusaHandle": "mirrors"},
            {"title": "Art Prints", "slug": "art-prints", "link_type": "category", "medusaHandle": "art-prints"},
            {"title": "Plants", "slug": "plants", "link_type": "category", "medusaHandle": "plants"},
        ]},
        {"title": "Textiles", "slug": "home-textiles", "link_type": "category", "medusaHandle": "home-textiles", "children": [
            {"title": "Cushions", "slug": "cushions", "link_type": "category", "medusaHandle": "cushions"},
            {"title": "Throws", "slug": "throws", "link_type": "category", "medusaHandle": "throws"},
            {"title": "Rugs", "slug": "rugs", "link_type": "category", "medusaHandle": "rugs"},
            {"title": "Curtains", "slug": "curtains", "link_type": "category", "medusaHandle": "curtains"},
            {"title": "Towels", "slug": "towels", "link_type": "category", "medusaHandle": "towels"},
        ]},
    ]},
]

order = [0]

def create_item(title, slug, link_type, medusa_handle, parent_doc_id):
    order[0] += 1
    body = {
        "title": title,
        "slug": slug,
        "link_type": link_type,
        "url": "/" + slug,
        "order": order[0],
        "visible": True,
        "locale": "en-US",
    }
    if medusa_handle:
        body["medusaHandle"] = medusa_handle
    if parent_doc_id:
        body["parent"] = {"connect": [{"documentId": parent_doc_id}]}

    resp = api_post(f'/content-manager/collection-types/{CT}', body)
    data = resp.get('data', resp)
    doc_id = data.get('documentId', '') if data else ''
    if doc_id:
        print(f'  OK: {title} (lt={link_type})')
    else:
        print(f'  FAIL: {title} -> {json.dumps(resp)[:150]}')
    return doc_id

def create_tree(items, parent_id=None):
    for item in items:
        children = item.pop('children', [])
        doc_id = create_item(
            title=item['title'],
            slug=item['slug'],
            link_type=item.get('link_type', 'page'),
            medusa_handle=item.get('medusaHandle'),
            parent_doc_id=parent_id,
        )
        if children and doc_id:
            create_tree(children, doc_id)

create_tree(menu_structure)

# ============================================================
# Verify
# ============================================================
print(f'\n=== Verify ({order[0]} items created) ===')
resp = api_get(f'/content-manager/collection-types/{CT}?locale=en-US&pageSize=100')
items = resp.get('results', [])
top = [i for i in items if i.get('parent') is None]
print(f'Total items: {len(items)}, Top-level: {len(top)}')
for t in top:
    children = [i for i in items if (i.get('parent') or {}).get('documentId') == t['documentId']]
    print(f'  {t["title"]} (slug={t.get("slug")}, lt={t.get("link_type")}, mh={t.get("medusaHandle")}) -> {len(children)} children')

print('\nDone!')
client.close()
