import { createClient } from '@supabase/supabase-js';

type Json = Record<string, unknown>;

type UserContext = {
  id: string;
  email: string;
  role: string;
};

const PRODUCT_TEMPLATE_POOL = [
  {
    name: 'Wireless Earbuds',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800&q=80',
    description: 'High-fidelity earbuds tuned for testing storefront flows.'
  },
  {
    name: 'Laptop Stand',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
    description: 'Ergonomic desk accessory generated for test catalog data.'
  },
  {
    name: 'Travel Backpack',
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80',
    description: 'Synthetic accessory data item used in QA runs.'
  },
  {
    name: 'Running Sneakers',
    category: 'Apparel',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    description: 'Generated apparel item for related order simulations.'
  },
  {
    name: 'Desk Lamp',
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    description: 'Home category record used for test merchandising.'
  },
  {
    name: 'Yoga Block',
    category: 'Fitness',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
    description: 'Fitness category record generated for integration tests.'
  }
];

const CATEGORY_SEED_LIBRARY = [
  {
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
    description: 'Modern electronic essentials designed for daily productivity and entertainment.',
    productNames: ['Wireless Earbuds', 'Portable Monitor', 'Smart Home Hub', 'Noise Cancelling Headphones']
  },
  {
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80',
    description: 'Lifestyle accessories built for convenience, travel, and everyday carry.',
    productNames: ['Travel Backpack', 'Leather Wallet', 'Crossbody Bag', 'Sunglasses Case']
  },
  {
    category: 'Apparel',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80',
    description: 'Comfort-first apparel pieces that balance performance and style.',
    productNames: ['Running Sneakers', 'Cotton Hoodie', 'Performance Joggers', 'Everyday Tee']
  },
  {
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80',
    description: 'Curated home goods that elevate comfort and interior atmosphere.',
    productNames: ['Desk Lamp', 'Aroma Diffuser', 'Ceramic Vase', 'Throw Blanket']
  },
  {
    category: 'Fitness',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    description: 'Training-focused products for movement, recovery, and active routines.',
    productNames: ['Yoga Block', 'Resistance Band Set', 'Foam Roller', 'Water Bottle Pro']
  },
  {
    category: 'Office',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80',
    description: 'Office tools to improve focus, ergonomics, and workflow quality.',
    productNames: ['Ergo Mouse', 'Standing Desk Riser', 'Cable Organizer', 'Notebook Set']
  },
  {
    category: 'Beauty',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
    description: 'Daily beauty products for skincare, grooming, and self-care.',
    productNames: ['Hydrating Serum', 'Facial Cleanser', 'Makeup Brush Kit', 'Body Lotion']
  },
  {
    category: 'Garden',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    description: 'Garden essentials for plant care and outdoor home improvements.',
    productNames: ['Plant Watering Can', 'Garden Tool Set', 'Planter Pot', 'Pruning Shears']
  },
  {
    category: 'Kids',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80',
    description: 'Kid-friendly items built for safety, comfort, and learning.',
    productNames: ['Learning Puzzle Set', 'Kids Backpack', 'Story Book Bundle', 'Play Mat']
  },
  {
    category: 'Automotive',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
    description: 'Automotive accessories for cleaner, safer, and smarter driving.',
    productNames: ['Car Phone Mount', 'Dash Camera', 'Seat Organizer', 'Tire Pressure Kit']
  },
  {
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
    description: 'Books and reading accessories for learning and leisure.',
    productNames: ['Bestseller Collection', 'Hardcover Journal', 'Reading Light', 'Book Stand']
  },
  {
    category: 'Pet Supplies',
    image: 'https://images.unsplash.com/photo-1516734212186-65266f4d6e61?w=800&q=80',
    description: 'Practical pet essentials for feeding, comfort, and enrichment.',
    productNames: ['Pet Feeding Bowl', 'Dog Harness', 'Cat Toy Set', 'Pet Bed']
  },
  {
    category: 'Gaming',
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80',
    description: 'Gaming gear tailored for comfort, speed, and immersive play.',
    productNames: ['Mechanical Keyboard', 'Gaming Mouse', 'RGB Mousepad', 'Controller Stand']
  },
  {
    category: 'Music',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80',
    description: 'Music equipment and accessories for creators and listeners.',
    productNames: ['Studio Microphone', 'Bluetooth Speaker', 'MIDI Keyboard', 'Guitar Capo']
  },
  {
    category: 'Travel',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
    description: 'Travel gear that keeps packing organized and trips hassle-free.',
    productNames: ['Carry-On Organizer', 'Neck Pillow', 'Travel Adapter', 'Luggage Tag Set']
  },
  {
    category: 'Kitchen',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
    description: 'Kitchen tools for prep, storage, and everyday cooking.',
    productNames: ['Chef Knife Set', 'Food Storage Kit', 'Coffee Grinder', 'Cutting Board']
  },
  {
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
    description: 'Sports equipment for training sessions and game-day performance.',
    productNames: ['Training Cone Set', 'Basketball Pro', 'Sports Towel', 'Agility Ladder']
  },
  {
    category: 'Health',
    image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80',
    description: 'Health-focused products for wellness tracking and daily care.',
    productNames: ['Digital Thermometer', 'Pill Organizer', 'Massage Gun', 'Air Purifier']
  },
  {
    category: 'Jewelry',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
    description: 'Elegant jewelry pieces and organizers for personal style.',
    productNames: ['Minimalist Necklace', 'Silver Bracelet', 'Ring Holder', 'Earring Set']
  },
  {
    category: 'Outdoor',
    image: 'https://images.unsplash.com/photo-1473445361085-b9a07f55608b?w=800&q=80',
    description: 'Outdoor equipment for camping, hiking, and weekend adventures.',
    productNames: ['Camping Lantern', 'Hiking Poles', 'Outdoor Blanket', 'Insulated Flask']
  }
];

const FIRST_NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Riley', 'Casey', 'Avery', 'Cameron', 'Finley', 'Reese'];
const LAST_NAMES = ['Nguyen', 'Tran', 'Pham', 'Le', 'Hoang', 'Vo', 'Do', 'Bui', 'Dang', 'Huynh'];
const DEFAULT_TOP_CATEGORY_LIMIT = 3;
const TOP_CATEGORY_LIMIT_KEY = 'homepage_top_categories_limit';

function readEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key];
    if (value) return value;
  }
  return '';
}

const SUPABASE_URL = readEnv(
  'APP_SUPABASE_URL',
  'SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PROJECT_URL'
);
const SUPABASE_ANON_KEY = readEnv(
  'APP_SUPABASE_ANON_KEY',
  'SUPABASE_ANON_KEY',
  'SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
);
const SUPABASE_SERVICE_ROLE_KEY = readEnv(
  'APP_SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SECRET_KEY',
  'SUPABASE_SERVICE_ROLE'
);
const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_SERVICE_ROLE_KEY);
const missingSupabaseEnv = [
  !SUPABASE_URL ? 'APP_SUPABASE_URL/SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL' : '',
  !SUPABASE_ANON_KEY
    ? 'APP_SUPABASE_ANON_KEY/SUPABASE_ANON_KEY/SUPABASE_PUBLISHABLE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY'
    : '',
  !SUPABASE_SERVICE_ROLE_KEY
    ? 'APP_SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SECRET_KEY'
    : ''
].filter(Boolean);

const adminClient = hasSupabaseConfig
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  : null;

const authClient = hasSupabaseConfig
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  : null;

function response(status: number, data: Json) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS'
    }
  });
}

function noContent() {
  return new Response(null, {
    status: 204,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS'
    }
  });
}

function parseSort(sort: string | null) {
  switch (sort) {
    case 'price-low':
      return { column: 'price', ascending: true };
    case 'price-high':
      return { column: 'price', ascending: false };
    case 'rating':
      return { column: 'rating', ascending: false };
    default:
      return { column: 'id', ascending: true };
  }
}

async function getUserFromAuth(req: Request): Promise<UserContext> {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await adminClient.auth.getUser(token);
  if (error || !data.user) {
    throw new Error('Unauthorized');
  }

  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileError) throw profileError;

  return {
    id: data.user.id,
    email: data.user.email || '',
    role: profile?.role || 'Customer'
  };
}

async function readJson(req: Request) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

function formatShortDate(input: string | Date | null | undefined) {
  if (!input) return '';
  const date = input instanceof Date ? input : new Date(input);
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function parseOrderId(raw: string) {
  const input = String(raw || '').trim();
  let decoded = input;
  try {
    decoded = decodeURIComponent(input);
  } catch {
    decoded = input;
  }

  if (/^\d+$/.test(decoded)) {
    const numeric = Number(decoded);
    return Number.isInteger(numeric) && numeric > 0 ? numeric : NaN;
  }

  const match = decoded.match(/^#?ORD-(\d+)$/i);
  if (!match) return NaN;

  const numeric = Number(match[1]);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : NaN;
}

function parseProductId(raw: string) {
  const numeric = Number(String(raw).replace(/[^0-9]/g, ''));
  return Number.isInteger(numeric) && numeric > 0 ? numeric : NaN;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPrice(min: number, max: number) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

function normalizeTargetSet(payload: any): Set<string> {
  const rawTargets = Array.isArray(payload?.targets)
    ? payload.targets
    : payload?.target
      ? [payload.target]
      : [];

  const set = new Set<string>(
    rawTargets
      .map((target: unknown) => String(target || '').toLowerCase().trim())
      .filter((target): target is string => target.length > 0)
  );

  if (set.has('all')) {
    set.delete('all');
    ['orders', 'products', 'users'].forEach((t) => set.add(t));
  }

  if (set.has('catalog')) {
    set.delete('catalog');
    ['orders', 'products'].forEach((t) => set.add(t));
  }

  return set;
}

function randomFrom<T>(items: T[]) {
  return items[randomInt(0, items.length - 1)];
}

function normalizeProductPayload(body: any, partial = false) {
  const updates: Record<string, any> = {};
  const has = (key: string) => Object.prototype.hasOwnProperty.call(body || {}, key);

  if (!partial || has('name')) {
    const name = String(body?.name ?? '').trim();
    if (!name) throw new Error('Product name is required');
    updates.name = name;
  }
  if (!partial || has('category')) {
    const category = String(body?.category ?? '').trim();
    if (!category) throw new Error('Category is required');
    updates.category = category;
  }
  if (!partial || has('description')) {
    const description = String(body?.description ?? '').trim();
    if (!description) throw new Error('Description is required');
    updates.description = description;
  }
  if (!partial || has('image')) {
    const image = String(body?.image ?? '').trim();
    if (!image) throw new Error('Image URL is required');
    updates.image = image;
  }
  if (!partial || has('price')) {
    const price = Number(body?.price);
    if (!Number.isFinite(price) || price < 0) throw new Error('Invalid price value');
    updates.price = Number(price.toFixed(2));
  }
  if (has('rating') || !partial) {
    const rating = Number(body?.rating ?? 4.5);
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) throw new Error('Rating must be between 0 and 5');
    updates.rating = Number(rating.toFixed(2));
  }
  if (has('reviews') || !partial) {
    const reviews = Number(body?.reviews ?? 0);
    if (!Number.isInteger(reviews) || reviews < 0) throw new Error('Reviews must be a non-negative integer');
    updates.reviews = reviews;
  }

  return updates;
}

async function nextProductId() {
  const { data } = await adminClient.from('products').select('id').order('id', { ascending: false }).limit(1);
  return (data?.[0]?.id || 0) + 1;
}

function buildCategoryPool(count: number) {
  const pool = CATEGORY_SEED_LIBRARY.map((item) => item.category);
  return pool.slice(0, Math.min(count, pool.length));
}

function buildDummyProducts(startId: number, count: number, categoryCount: number) {
  const categories = buildCategoryPool(Math.max(1, Math.min(categoryCount, CATEGORY_SEED_LIBRARY.length)));
  return Array.from({ length: count }).map((_, idx) => {
    const sku = startId + idx;
    const category = categories[idx % categories.length];
    const profile = CATEGORY_SEED_LIBRARY.find((item) => item.category === category);
    const fallback = randomFrom(PRODUCT_TEMPLATE_POOL);
    const baseName = profile?.productNames?.length ? randomFrom(profile.productNames) : fallback.name;
    return {
      id: sku,
      name: `${baseName} ${sku}`,
      price: randomPrice(19, 399),
      category,
      image: profile?.image || fallback.image,
      rating: randomPrice(3.6, 5.0),
      reviews: randomInt(8, 500),
      description: profile?.description || fallback.description
    };
  });
}

async function createDummyUsers(count: number) {
  const createdUsers: Array<{ id: string; name: string; email: string }> = [];
  for (let i = 0; i < count; i += 1) {
    const first = randomFrom(FIRST_NAMES);
    const last = randomFrom(LAST_NAMES);
    const name = `${first} ${last}`;
    const email = `${first}.${last}.${Date.now()}${i}@seed.local`.toLowerCase();
    const password = `SeedUser${randomInt(1000, 9999)}!`;

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });
    if (createError) throw createError;

    const userId = created.user?.id;
    if (!userId) continue;

    const role = randomInt(0, 9) > 7 ? 'Manager' : 'Customer';
    const status = randomInt(0, 9) > 8 ? 'Inactive' : 'Active';

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .update({ name, role, status })
      .eq('id', userId)
      .select('id,name,email')
      .maybeSingle();
    if (profileError) throw profileError;
    if (profile) createdUsers.push(profile);
  }

  return createdUsers;
}

async function createDummyOrders(users: Array<{ id: string }>, products: Array<{ id: number; name: string; category: string; price: number }>, count: number) {
  if (!users.length || !products.length || count <= 0) return 0;
  const statuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
  let inserted = 0;

  for (let i = 0; i < count; i += 1) {
    const user = randomFrom(users);
    const lineCount = randomInt(1, 3);
    const items: any[] = [];
    let subtotal = 0;

    for (let j = 0; j < lineCount; j += 1) {
      const p = randomFrom(products);
      const quantity = randomInt(1, 4);
      const totalPrice = Number((Number(p.price) * quantity).toFixed(2));
      subtotal += totalPrice;
      items.push({
        product_id: p.id,
        product_name: p.name,
        product_category: p.category,
        unit_price: p.price,
        quantity,
        total_price: totalPrice
      });
    }

    const shipping = subtotal > 150 ? 0 : 15;
    const total = Number((subtotal + shipping).toFixed(2));
    const status = randomFrom(statuses);

    const { data: orderRow, error: orderError } = await adminClient
      .from('orders')
      .insert({
        user_id: user.id,
        subtotal: Number(subtotal.toFixed(2)),
        shipping,
        total,
        payment_method: 'card',
        status
      })
      .select('id')
      .single();
    if (orderError) throw orderError;

    const orderItems = items.map((item) => ({
      order_id: orderRow.id,
      ...item
    }));

    const { error: itemError } = await adminClient.from('order_items').insert(orderItems);
    if (itemError) throw itemError;
    inserted += 1;
  }

  return inserted;
}

async function clearNonAdminUsers(currentAdminId: string) {
  const { data: profiles, error } = await adminClient.from('profiles').select('id,role');
  if (error) throw error;
  const removable = (profiles || []).filter((p: any) => p.id !== currentAdminId && p.role !== 'Admin');
  for (const profile of removable) {
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(profile.id);
    if (deleteError) throw deleteError;
  }
  return removable.length;
}

function normalizeTopCategoryLimit(raw: unknown) {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return DEFAULT_TOP_CATEGORY_LIMIT;
  return Math.min(Math.max(Math.floor(parsed), 1), 12);
}

function isMissingSettingsTableError(error: any) {
  return (
    error?.code === '42P01' ||
    String(error?.message || '').toLowerCase().includes('app_settings')
  );
}

async function readTopCategoryLimit() {
  const { data, error } = await adminClient
    .from('app_settings')
    .select('value')
    .eq('key', TOP_CATEGORY_LIMIT_KEY)
    .maybeSingle();
  if (error) {
    if (isMissingSettingsTableError(error)) return DEFAULT_TOP_CATEGORY_LIMIT;
    throw error;
  }

  const value = data?.value;
  if (typeof value === 'number') return normalizeTopCategoryLimit(value);
  if (value && typeof value === 'object' && 'count' in value) {
    return normalizeTopCategoryLimit((value as any).count);
  }
  return DEFAULT_TOP_CATEGORY_LIMIT;
}

async function writeTopCategoryLimit(raw: unknown) {
  const topCategoryLimit = normalizeTopCategoryLimit(raw);
  const { error } = await adminClient
    .from('app_settings')
    .upsert({ key: TOP_CATEGORY_LIMIT_KEY, value: { count: topCategoryLimit } }, { onConflict: 'key' });
  if (error) throw error;
  return topCategoryLimit;
}

async function requireAdmin(req: Request) {
  const user = await getUserFromAuth(req);
  if (user.role !== 'Admin') {
    throw new Error('Forbidden');
  }
  return user;
}

async function getCartSummary(userId: string) {
  const { data, error } = await adminClient
    .from('cart_items')
    .select('quantity, product:products(id,name,price,category,image,rating,reviews,description)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const items = (data || []).map((row: any) => {
    const product = row.product;
    const lineTotal = Number(product.price) * row.quantity;
    return {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      category: product.category,
      image: product.image,
      rating: Number(product.rating),
      reviews: product.reviews,
      description: product.description,
      quantity: row.quantity,
      lineTotal
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    summary: {
      subtotal,
      shipping,
      total: subtotal + shipping,
      itemCount
    }
  };
}

async function handleRequest(req: Request) {
  if (req.method === 'OPTIONS') {
    return noContent();
  }

  if (!hasSupabaseConfig || !adminClient || !authClient) {
    return response(500, {
      error: 'Server configuration error',
      missingEnv: missingSupabaseEnv
    });
  }

  try {
    const url = new URL(req.url);
    const path =
      url.pathname.replace(/^\/functions\/v1\/api/, '').replace(/^\/api/, '') || '/';

    if (path === '/health' && req.method === 'GET') {
      return response(200, { status: 'ok', service: 'lumina-supabase-api' });
    }

    if (path === '/products' && req.method === 'GET') {
      const category = url.searchParams.get('category');
      const search = url.searchParams.get('search');
      const sort = url.searchParams.get('sort');
      const order = parseSort(sort);

      let query = adminClient.from('products').select('*');

      if (category && category !== 'All') {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await query.order(order.column, { ascending: order.ascending });
      if (error) throw error;

      return response(200, { items: data || [], count: (data || []).length });
    }

    if (path === '/products/categories' && req.method === 'GET') {
      const { data, error } = await adminClient.from('products').select('category').order('category');
      if (error) throw error;

      const categories = ['All', ...Array.from(new Set((data || []).map((x: any) => x.category)))];
      return response(200, { items: categories });
    }

    if (path === '/settings' && req.method === 'GET') {
      const topCategoryLimit = await readTopCategoryLimit();
      return response(200, { topCategoryLimit });
    }

    if (path.startsWith('/products/') && req.method === 'GET') {
      const id = Number(path.split('/')[2]);
      const { data, error } = await adminClient.from('products').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      if (!data) return response(404, { error: 'Product not found' });
      return response(200, data as Json);
    }

    if (path === '/auth/register' && req.method === 'POST') {
      const body = await readJson(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const name = String(body.name || '').trim();

      if (!email || !password || !name) {
        return response(400, { error: 'name, email and password are required' });
      }

      const { data: createdData, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name }
      });

      if (createError) {
        const message = String(createError.message || '');
        const lower = message.toLowerCase();

        // Existing account or signup throttled: try login and continue.
        if (
          lower.includes('already') ||
          lower.includes('registered') ||
          lower.includes('exists') ||
          lower.includes('rate limit')
        ) {
          const { data: loginData, error: loginError } = await authClient.auth.signInWithPassword({
            email,
            password
          });

          if (!loginError && loginData.user) {
            const profileResult = await adminClient
              .from('profiles')
              .select('id,name,email,role,status,created_at')
              .eq('id', loginData.user.id)
              .maybeSingle();

            return response(200, {
              user: profileResult.data || loginData.user,
              session: loginData.session
            });
          }
        }

        return response(400, { error: message });
      }

      const { data: loginData, error: loginError } = await authClient.auth.signInWithPassword({
        email,
        password
      });

      if (loginError) {
        return response(400, { error: loginError.message });
      }

      let profile = null;
      if (createdData.user?.id) {
        const profileResult = await adminClient
          .from('profiles')
          .select('id,name,email,role,status,created_at')
          .eq('id', createdData.user.id)
          .maybeSingle();
        profile = profileResult.data;
      }

      return response(201, {
        user: profile || createdData.user,
        session: loginData.session
      });
    }

    if (path === '/auth/login' && req.method === 'POST') {
      const body = await readJson(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');

      if (!email || !password) {
        return response(400, { error: 'email and password are required' });
      }

      const { data, error } = await authClient.auth.signInWithPassword({ email, password });
      if (error) return response(401, { error: error.message });

      let profile = null;
      if (data.user?.id) {
        const profileResult = await adminClient
          .from('profiles')
          .select('id,name,email,role,status,created_at')
          .eq('id', data.user.id)
          .maybeSingle();
        profile = profileResult.data;
      }

      return response(200, {
        user: profile || data.user,
        session: data.session
      });
    }

    if (path === '/auth/password-reset' && req.method === 'POST') {
      const body = await readJson(req);
      const email = String(body.email || '').trim().toLowerCase();
      const redirectTo = String(body.redirectTo || '').trim();

      if (!email) {
        return response(400, { error: 'email is required' });
      }

      const { error } = await authClient.auth.resetPasswordForEmail(
        email,
        redirectTo ? { redirectTo } : undefined
      );

      if (error) {
        return response(400, { error: error.message });
      }

      return response(200, {
        ok: true,
        message: 'If the account exists, a password reset email has been sent.'
      });
    }

    if (path === '/auth/password-change' && req.method === 'POST') {
      const user = await getUserFromAuth(req);
      const body = await readJson(req);
      const oldPassword = String(body.oldPassword || '');
      const newPassword = String(body.newPassword || '');

      if (!oldPassword || !newPassword) {
        return response(400, { error: 'oldPassword and newPassword are required' });
      }
      if (newPassword.length < 6) {
        return response(400, { error: 'New password must be at least 6 characters' });
      }
      if (oldPassword === newPassword) {
        return response(400, { error: 'New password must be different from old password' });
      }

      const { error: verifyError } = await authClient.auth.signInWithPassword({
        email: user.email,
        password: oldPassword
      });
      if (verifyError) {
        return response(401, { error: 'Old password is incorrect' });
      }

      const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
        password: newPassword
      });
      if (updateError) {
        return response(400, { error: updateError.message });
      }

      return response(200, { ok: true });
    }

    if (path === '/auth/password-reset/confirm' && req.method === 'POST') {
      const body = await readJson(req);
      const accessToken = String(body.accessToken || '').trim();
      const refreshToken = String(body.refreshToken || '').trim();
      const password = String(body.password || '');

      if (!accessToken || !refreshToken) {
        return response(400, { error: 'Recovery tokens are required' });
      }
      if (password.length < 6) {
        return response(400, { error: 'Password must be at least 6 characters' });
      }

      const { error: sessionError } = await authClient.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      if (sessionError) {
        return response(400, { error: sessionError.message });
      }

      const { data, error } = await authClient.auth.updateUser({ password });
      if (error) {
        return response(400, { error: error.message });
      }

      return response(200, {
        ok: true,
        user: data.user || null
      });
    }

    if (path === '/auth/me' && req.method === 'GET') {
      const user = await getUserFromAuth(req);

      const [{ data: profile }, { data: orders }] = await Promise.all([
        adminClient
          .from('profiles')
          .select('id,name,email,role,status,created_at')
          .eq('id', user.id)
          .maybeSingle(),
        adminClient.from('orders').select('id,total').eq('user_id', user.id)
      ]);

      const orderCount = (orders || []).length;
      const totalSpent = (orders || []).reduce((sum: number, o: any) => sum + Number(o.total), 0);

      return response(200, {
        user: {
          id: user.id,
          name: profile?.name || user.email.split('@')[0],
          email: profile?.email || user.email,
          role: profile?.role || user.role,
          status: profile?.status || 'Active',
          joined: formatShortDate(profile?.created_at),
          orderCount,
          totalSpent
        }
      });
    }

    if (path === '/auth/logout' && req.method === 'POST') {
      return noContent();
    }

    if (path === '/cart' && req.method === 'GET') {
      const user = await getUserFromAuth(req);
      return response(200, await getCartSummary(user.id));
    }

    if (path === '/cart' && req.method === 'DELETE') {
      const user = await getUserFromAuth(req);
      const { error } = await adminClient.from('cart_items').delete().eq('user_id', user.id);
      if (error) throw error;
      return noContent();
    }

    if (path === '/cart/items' && req.method === 'POST') {
      const user = await getUserFromAuth(req);
      const body = await readJson(req);
      const productId = Number(body.productId);
      const quantity = Number(body.quantity || 1);

      if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) {
        return response(400, { error: 'Invalid productId or quantity' });
      }

      const { data: product } = await adminClient.from('products').select('id').eq('id', productId).maybeSingle();
      if (!product) return response(404, { error: 'Product not found' });

      const { data: existing } = await adminClient
        .from('cart_items')
        .select('quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existing) {
        const { error } = await adminClient
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('user_id', user.id)
          .eq('product_id', productId);
        if (error) throw error;
      } else {
        const { error } = await adminClient
          .from('cart_items')
          .insert({ user_id: user.id, product_id: productId, quantity });
        if (error) throw error;
      }

      return response(201, await getCartSummary(user.id));
    }

    if (path.startsWith('/cart/items/') && req.method === 'PATCH') {
      const user = await getUserFromAuth(req);
      const productId = Number(path.split('/')[3]);
      const body = await readJson(req);
      const quantity = Number(body.quantity);

      if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) {
        return response(400, { error: 'Invalid productId or quantity' });
      }

      const { data, error } = await adminClient
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .select('product_id');

      if (error) throw error;
      if (!data || data.length === 0) return response(404, { error: 'Cart item not found' });

      return response(200, await getCartSummary(user.id));
    }

    if (path.startsWith('/cart/items/') && req.method === 'DELETE') {
      const user = await getUserFromAuth(req);
      const productId = Number(path.split('/')[3]);

      if (!Number.isInteger(productId)) {
        return response(400, { error: 'Invalid productId' });
      }

      const { data, error } = await adminClient
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .select('product_id');

      if (error) throw error;
      if (!data || data.length === 0) return response(404, { error: 'Cart item not found' });

      return response(200, await getCartSummary(user.id));
    }

    if (path === '/orders/checkout' && req.method === 'POST') {
      const user = await getUserFromAuth(req);
      const body = await readJson(req);
      const shippingAddress = body.shippingAddress ? String(body.shippingAddress) : null;
      const paymentMethod = body.paymentMethod ? String(body.paymentMethod) : 'card';

      const { data, error } = await adminClient.rpc('create_order_from_cart', {
        p_user_id: user.id,
        p_shipping_address: shippingAddress,
        p_payment_method: paymentMethod
      });

      if (error) {
        if (error.message.toLowerCase().includes('cart is empty')) {
          return response(400, { error: 'Cart is empty' });
        }
        throw error;
      }

      return response(201, { order: data });
    }

    if (path === '/admin/users' && req.method === 'GET') {
      await requireAdmin(req);
      const { data, error } = await adminClient
        .from('profiles')
        .select('id,name,email,role,status,created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const items = (data || []).map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role || 'Customer',
        status: u.status || 'Active',
        joined: formatShortDate(u.created_at)
      }));

      return response(200, { items, count: items.length });
    }

    if (path === '/admin/users' && req.method === 'POST') {
      await requireAdmin(req);
      const body = await readJson(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const name = String(body.name || '').trim();
      const role = String(body.role || 'Customer');
      const status = String(body.status || 'Active');

      if (!email || !password || !name) {
        return response(400, { error: 'name, email and password are required' });
      }
      if (password.length < 6) {
        return response(400, { error: 'Password must be at least 6 characters' });
      }
      if (!['Admin', 'Manager', 'Customer'].includes(role)) {
        return response(400, { error: 'Invalid role value' });
      }
      if (!['Active', 'Inactive'].includes(status)) {
        return response(400, { error: 'Invalid status value' });
      }

      const { data: created, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name }
      });
      if (createError) {
        return response(400, { error: createError.message });
      }

      const userId = created.user?.id;
      if (!userId) {
        return response(500, { error: 'Failed to create user' });
      }

      const { data, error } = await adminClient
        .from('profiles')
        .update({ name, role, status })
        .eq('id', userId)
        .select('id,name,email,role,status,created_at')
        .maybeSingle();

      if (error) throw error;
      if (!data) return response(404, { error: 'User profile not found after creation' });

      return response(201, {
        user: {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          status: data.status,
          joined: formatShortDate(data.created_at)
        }
      });
    }

    if (path.startsWith('/admin/users/') && req.method === 'PATCH') {
      await requireAdmin(req);
      const userId = path.split('/')[3];
      const body = await readJson(req);
      const updates: Record<string, string> = {};

      if (body.role) {
        const role = String(body.role);
        if (!['Admin', 'Manager', 'Customer'].includes(role)) {
          return response(400, { error: 'Invalid role value' });
        }
        updates.role = role;
      }

      if (body.status) {
        const status = String(body.status);
        if (!['Active', 'Inactive'].includes(status)) {
          return response(400, { error: 'Invalid status value' });
        }
        updates.status = status;
      }

      if (body.name) {
        updates.name = String(body.name);
      }

      const password = body.password ? String(body.password) : '';
      if (password) {
        if (password.length < 6) {
          return response(400, { error: 'Password must be at least 6 characters' });
        }
        const { data: targetProfile, error: profileLookupError } = await adminClient
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle();

        if (profileLookupError) throw profileLookupError;
        if (!targetProfile) return response(404, { error: 'User not found' });
        if (targetProfile.role !== 'Customer') {
          return response(400, { error: 'Password update is only allowed for customer accounts' });
        }

        const { error: passwordError } = await adminClient.auth.admin.updateUserById(userId, { password });
        if (passwordError) {
          return response(400, { error: passwordError.message });
        }
      }

      if (Object.keys(updates).length === 0) {
        if (password) {
          const { data } = await adminClient
            .from('profiles')
            .select('id,name,email,role,status,created_at')
            .eq('id', userId)
            .maybeSingle();
          if (!data) return response(404, { error: 'User not found' });
          return response(200, {
            user: {
              id: data.id,
              name: data.name,
              email: data.email,
              role: data.role,
              status: data.status,
              joined: formatShortDate(data.created_at)
            }
          });
        }
        return response(400, { error: 'No valid fields to update' });
      }

      const { data, error } = await adminClient
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select('id,name,email,role,status,created_at')
        .maybeSingle();

      if (error) throw error;
      if (!data) return response(404, { error: 'User not found' });

      return response(200, {
        user: {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          status: data.status,
          joined: formatShortDate(data.created_at)
        }
      });
    }

    if (path.startsWith('/admin/users/') && req.method === 'DELETE') {
      const adminUser = await requireAdmin(req);
      const userId = path.split('/')[3];

      if (userId === adminUser.id) {
        return response(400, { error: 'Cannot delete your own admin account' });
      }

      const { error } = await adminClient.auth.admin.deleteUser(userId);
      if (error) throw error;

      return noContent();
    }

    if (path === '/admin/orders' && req.method === 'GET') {
      await requireAdmin(req);
      const { data, error } = await adminClient
        .from('orders')
        .select('id,total,status,created_at,user_id')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const userIds = Array.from(new Set((data || []).map((o: any) => o.user_id))).filter(Boolean);
      const { data: profiles } = userIds.length
        ? await adminClient.from('profiles').select('id,name,email').in('id', userIds)
        : { data: [] as any[] };
      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      const items = (data || []).map((o: any) => {
        const profile = profileMap.get(o.user_id);
        return {
        id: `#ORD-${String(o.id).padStart(4, '0')}`,
        orderId: o.id,
        customer: profile?.name || profile?.email || 'Unknown',
        createdAt: o.created_at,
        date: formatShortDate(o.created_at),
        total: Number(o.total),
        status: o.status
        };
      });

      return response(200, { items, count: items.length });
    }

    if (path.startsWith('/admin/orders/') && req.method === 'PATCH') {
      await requireAdmin(req);
      const orderId = parseOrderId(path.split('/')[3]);
      const body = await readJson(req);
      const status = String(body.status || '');

      if (!Number.isInteger(orderId)) {
        return response(400, { error: 'Invalid order id' });
      }
      if (!['Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
        return response(400, { error: 'Invalid status value' });
      }

      const { data, error } = await adminClient
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select('id,total,status,created_at,user_id')
        .maybeSingle();

      if (error) throw error;
      if (!data) return response(404, { error: 'Order not found' });

      const { data: profile } = await adminClient
        .from('profiles')
        .select('id,name,email')
        .eq('id', data.user_id)
        .maybeSingle();

      return response(200, {
        order: {
          id: `#ORD-${String(data.id).padStart(4, '0')}`,
          orderId: data.id,
          customer: profile?.name || profile?.email || 'Unknown',
          createdAt: data.created_at,
          date: formatShortDate(data.created_at),
          total: Number(data.total),
          status: data.status
        }
      });
    }

    if (path.startsWith('/admin/orders/') && req.method === 'DELETE') {
      await requireAdmin(req);
      const orderId = parseOrderId(path.split('/')[3]);
      if (!Number.isInteger(orderId)) {
        return response(400, { error: 'Invalid order id' });
      }

      const { data, error } = await adminClient
        .from('orders')
        .delete()
        .eq('id', orderId)
        .select('id');
      if (error) throw error;
      if (!data || data.length === 0) return response(404, { error: 'Order not found' });

      return noContent();
    }

    if (path === '/admin/products' && req.method === 'POST') {
      await requireAdmin(req);
      const body = await readJson(req);
      let payload: Record<string, any> = {};
      try {
        payload = normalizeProductPayload(body, false);
      } catch (err) {
        return response(400, { error: err instanceof Error ? err.message : 'Invalid product payload' });
      }

      const productId = await nextProductId();
      const { data, error } = await adminClient
        .from('products')
        .insert({ id: productId, ...payload })
        .select('*')
        .maybeSingle();

      if (error) throw error;
      if (!data) return response(500, { error: 'Failed to create product' });

      return response(201, { product: data });
    }

    if (path.startsWith('/admin/products/') && req.method === 'PATCH') {
      await requireAdmin(req);
      const productId = parseProductId(path.split('/')[3]);
      if (!Number.isInteger(productId)) {
        return response(400, { error: 'Invalid product id' });
      }

      const body = await readJson(req);
      let updates: Record<string, any> = {};
      try {
        updates = normalizeProductPayload(body, true);
      } catch (err) {
        return response(400, { error: err instanceof Error ? err.message : 'Invalid product payload' });
      }

      if (Object.keys(updates).length === 0) {
        return response(400, { error: 'No valid fields to update' });
      }

      const { data, error } = await adminClient
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select('*')
        .maybeSingle();

      if (error) throw error;
      if (!data) return response(404, { error: 'Product not found' });

      return response(200, { product: data });
    }

    if (path.startsWith('/admin/products/') && req.method === 'DELETE') {
      await requireAdmin(req);
      const productId = parseProductId(path.split('/')[3]);
      if (!Number.isInteger(productId)) {
        return response(400, { error: 'Invalid product id' });
      }

      const { count: orderItemCount, error: orderItemError } = await adminClient
        .from('order_items')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', productId);
      if (orderItemError) throw orderItemError;
      if ((orderItemCount || 0) > 0) {
        return response(400, { error: 'Cannot delete a product that exists in order history' });
      }

      const { error: cartError } = await adminClient.from('cart_items').delete().eq('product_id', productId);
      if (cartError) throw cartError;

      const { data, error } = await adminClient
        .from('products')
        .delete()
        .eq('id', productId)
        .select('id');
      if (error) throw error;
      if (!data || data.length === 0) return response(404, { error: 'Product not found' });

      return noContent();
    }

    if (path === '/admin/data-control/clear' && req.method === 'POST') {
      const adminUser = await requireAdmin(req);
      const body = await readJson(req);
      const targets = normalizeTargetSet(body);
      const valid = new Set(['orders', 'products', 'users']);
      if (!targets.size || [...targets].some((target) => !valid.has(target))) {
        return response(400, {
          error: 'Invalid targets. Use targets array with: orders, products, catalog, users, all.'
        });
      }

      const result: Record<string, number> = {
        deletedOrders: 0,
        deletedProducts: 0,
        deletedUsers: 0
      };

      const { data: cartRows } = await adminClient.from('cart_items').select('user_id,product_id');
      if (targets.has('orders') || targets.has('products')) {
        if ((cartRows || []).length) {
          const { error: cartError } = await adminClient.from('cart_items').delete().gt('quantity', 0);
          if (cartError) throw cartError;
        }
      }

      if (targets.has('orders') || targets.has('products')) {
        const { data: existingOrders, error: getOrderError } = await adminClient.from('orders').select('id');
        if (getOrderError) throw getOrderError;
        if ((existingOrders || []).length) {
          const { error: orderError } = await adminClient.from('orders').delete().gt('id', 0);
          if (orderError) throw orderError;
          result.deletedOrders = existingOrders!.length;
        }
      }

      if (targets.has('products')) {
        const { data: existingProducts, error: getProductError } = await adminClient.from('products').select('id');
        if (getProductError) throw getProductError;
        if ((existingProducts || []).length) {
          const { error: productError } = await adminClient.from('products').delete().gt('id', 0);
          if (productError) throw productError;
          result.deletedProducts = existingProducts!.length;
        }
      }

      if (targets.has('users')) {
        result.deletedUsers = await clearNonAdminUsers(adminUser.id);
      }

      return response(200, { ok: true, action: 'clear', targets: [...targets], ...result });
    }

    if (path === '/admin/data-control/seed' && req.method === 'POST') {
      await requireAdmin(req);
      const body = await readJson(req);
      const targets = normalizeTargetSet(body);
      const valid = new Set(['orders', 'products', 'users']);
      if (!targets.size || [...targets].some((target) => !valid.has(target))) {
        return response(400, {
          error: 'Invalid targets. Use targets array with: orders, products, catalog, users, all.'
        });
      }

      const productCount = Math.min(Math.max(Number(body.productCount || 8), 0), 100);
      const orderCount = Math.min(Math.max(Number(body.orderCount || 12), 0), 200);
      const userCount = Math.min(Math.max(Number(body.userCount || 6), 0), 100);
      const categoryCount = Math.min(Math.max(Number(body.categoryCount || 4), 1), 20);

      let insertedProducts = 0;
      let insertedUsers = 0;
      let insertedOrders = 0;
      let seededCategoryCount = 0;
      let seededCategories: string[] = [];

      if (targets.has('products') && productCount > 0) {
        // Ensure category variety is respected: at least one product per requested category.
        const effectiveProductCount = Math.max(productCount, categoryCount);
        const startId = await nextProductId();
        const productsToInsert = buildDummyProducts(startId, effectiveProductCount, categoryCount);
        const { error } = await adminClient.from('products').insert(productsToInsert);
        if (error) throw error;
        insertedProducts = productsToInsert.length;
        seededCategories = [...new Set(productsToInsert.map((item) => item.category))];
        seededCategoryCount = seededCategories.length;
      }

      if (targets.has('users') && userCount > 0) {
        const createdUsers = await createDummyUsers(userCount);
        insertedUsers = createdUsers.length;
      }

      if (targets.has('orders') && orderCount > 0) {
        const { data: users, error: userError } = await adminClient
          .from('profiles')
          .select('id,role,status')
          .neq('role', 'Admin')
          .eq('status', 'Active')
          .limit(500);
        if (userError) throw userError;

        const { data: products, error: productsError } = await adminClient
          .from('products')
          .select('id,name,category,price')
          .limit(500);
        if (productsError) throw productsError;

        insertedOrders = await createDummyOrders(
          (users || []).map((u: any) => ({ id: u.id })),
          (products || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: Number(p.price)
          })),
          orderCount
        );
      }

      return response(200, {
        ok: true,
        action: 'seed',
        targets: [...targets],
        insertedProducts,
        insertedUsers,
        insertedOrders,
        seededCategoryCount,
        seededCategories
      });
    }

    if (path === '/admin/settings' && req.method === 'PATCH') {
      await requireAdmin(req);
      const body = await readJson(req);
      const topCategoryLimit = await writeTopCategoryLimit(body.topCategoryLimit);
      return response(200, { topCategoryLimit });
    }

    if (path === '/orders' && req.method === 'GET') {
      const user = await getUserFromAuth(req);
      const { data, error } = await adminClient
        .from('orders')
        .select('id,subtotal,shipping,total,shipping_address,payment_method,status,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      return response(200, { items: data || [], count: (data || []).length });
    }

    if (path.startsWith('/orders/') && req.method === 'GET') {
      const user = await getUserFromAuth(req);
      const orderId = Number(path.split('/')[2]);

      const { data: order, error: orderError } = await adminClient
        .from('orders')
        .select('id,subtotal,shipping,total,shipping_address,payment_method,status,created_at')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (orderError) throw orderError;
      if (!order) return response(404, { error: 'Order not found' });

      const { data: items, error: itemError } = await adminClient
        .from('order_items')
        .select('product_id,product_name,product_category,unit_price,quantity,total_price')
        .eq('order_id', orderId)
        .order('id', { ascending: true });

      if (itemError) throw itemError;

      return response(200, { ...order, items: items || [] });
    }

    return response(404, { error: 'Route not found' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') {
      return response(401, { error: 'Unauthorized' });
    }
    if (message === 'Forbidden') {
      return response(403, { error: 'Forbidden' });
    }
    console.error(error);
    return response(500, { error: message });
  }
}

export default async function handler(nodeReq: any, nodeRes: any) {
  const proto = (nodeReq.headers['x-forwarded-proto'] || 'https') as string;
  const host =
    (nodeReq.headers['x-forwarded-host'] as string) ||
    (nodeReq.headers.host as string) ||
    'localhost';
  const url = new URL(nodeReq.url || '/', `${proto}://${host}`);

  const headers = new Headers();
  for (const [key, value] of Object.entries(nodeReq.headers || {})) {
    if (Array.isArray(value)) {
      headers.set(key, value.join(','));
    } else if (value != null) {
      headers.set(key, String(value));
    }
  }

  const method = String(nodeReq.method || 'GET').toUpperCase();
  let body: BodyInit | undefined;
  if (method !== 'GET' && method !== 'HEAD' && nodeReq.body != null) {
    if (typeof nodeReq.body === 'string' || nodeReq.body instanceof Uint8Array) {
      body = nodeReq.body;
    } else {
      body = JSON.stringify(nodeReq.body);
      if (!headers.has('content-type')) {
        headers.set('content-type', 'application/json');
      }
    }
  }

  const request = new Request(url.toString(), { method, headers, body });
  const response = await handleRequest(request);

  nodeRes.statusCode = response.status;
  response.headers.forEach((value, key) => {
    nodeRes.setHeader(key, value);
  });

  if (response.status === 204) {
    nodeRes.end();
    return;
  }

  const responseText = await response.text();
  nodeRes.end(responseText);
}
