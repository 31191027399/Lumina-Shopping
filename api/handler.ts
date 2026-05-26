import { createClient } from '@supabase/supabase-js';

type Json = Record<string, unknown>;

type UserContext = {
  id: string;
  email: string;
  role: string;
  scopes?: string[];
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
const PLATFORM_API_KEY_KEY = 'platform_api_key';
const INTEGRATION_SCOPES = ['read:catalog', 'read:orders', 'read:users', 'write:cart', 'write:checkout'];
const PROFILE_SELECT_COLUMNS =
  'id,name,email,phone,address_line1,address_line2,address_city,address_state,address_postal_code,role,status,created_at';
const ORDER_UPDATE_REQUEST_ALLOWED_FIELDS = [
  'shippingRecipient',
  'shippingPhone',
  'shippingAddressLine1',
  'shippingAddressLine2',
  'shippingCity',
  'shippingState',
  'shippingPostalCode'
];

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
      'Access-Control-Allow-Headers': 'authorization, x-api-key, x-client-info, apikey, content-type',
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
      'Access-Control-Allow-Headers': 'authorization, x-api-key, x-client-info, apikey, content-type',
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

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

function normalizeGallery(value: unknown, fallbackImage = '') {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return fallbackImage ? [fallbackImage] : [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item || '').trim()).filter(Boolean);
      }
    } catch {
      return [trimmed];
    }
  }
  return fallbackImage ? [fallbackImage] : [];
}

function mapProductRecord(product: Record<string, any>) {
  const gallery = normalizeGallery(product.gallery, product.image);
  return {
    id: product.id,
    name: product.name,
    slug: product.slug || slugify(product.name),
    price: Number(product.price),
    category: product.category,
    image: product.image,
    shortDescription: product.short_description || product.shortDescription || product.description,
    inventoryCount: Number(product.inventory_count ?? product.inventoryCount ?? 0),
    isFeatured: Boolean(product.is_featured ?? product.isFeatured),
    gallery,
    rating: Number(product.rating),
    reviews: Number(product.reviews || 0),
    description: product.description
  };
}

function mapOrderRecord(order: Record<string, any>, items: Array<Record<string, any>> = []) {
  return {
    id: order.id,
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    total: Number(order.total),
    status: order.status,
    paymentMethod: order.payment_method || order.paymentMethod || 'card',
    createdAt: order.created_at || order.createdAt,
    shippingAddress: order.shipping_address || order.shippingAddress || order.shipping_address_line1 || '',
    shippingDetails: {
      recipient: order.shipping_recipient || '',
      phone: order.shipping_phone || '',
      addressLine1: order.shipping_address_line1 || '',
      addressLine2: order.shipping_address_line2 || '',
      city: order.shipping_city || '',
      state: order.shipping_state || '',
      postalCode: order.shipping_postal_code || ''
    },
    items
  };
}

function mapProfileRecord(profile: Record<string, any> | null | undefined, fallback: UserContext, stats: { orderCount?: number; totalSpent?: number } = {}) {
  return {
    id: profile?.id || fallback.id,
    name: profile?.name || fallback.email.split('@')[0],
    email: profile?.email || fallback.email,
    phone: profile?.phone || '',
    addressLine1: profile?.address_line1 || '',
    addressLine2: profile?.address_line2 || '',
    addressCity: profile?.address_city || '',
    addressState: profile?.address_state || '',
    addressPostalCode: profile?.address_postal_code || '',
    role: profile?.role || fallback.role,
    status: profile?.status || 'Active',
    joined: formatShortDate(profile?.created_at),
    orderCount: stats.orderCount ?? 0,
    totalSpent: stats.totalSpent ?? 0
  };
}

function mapOrderUpdateRequestRecord(request: Record<string, any>) {
  return {
    id: request.id,
    orderId: request.order_id,
    userId: request.user_id,
    requestedChanges: request.requested_changes || request.requestedChanges || {},
    reason: request.reason || '',
    status: request.status || 'Pending',
    adminNote: request.admin_note || '',
    reviewedBy: request.reviewed_by || null,
    reviewedAt: request.reviewed_at || null,
    createdAt: request.created_at || null
  };
}

function normalizeOptionalText(value: unknown) {
  if (value === undefined || value === null) return undefined;
  const text = String(value).trim();
  return text.length ? text : null;
}

function collectOrderUpdateChanges(body: Record<string, any>) {
  const requestedChanges: Record<string, string> = {};

  for (const field of ORDER_UPDATE_REQUEST_ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      const value = normalizeOptionalText(body[field]);
      if (value) {
        requestedChanges[field] = value;
      }
    }
  }

  return requestedChanges;
}

const CUSTOMER_CANCELLABLE_STATUSES = new Set(['PLACED', 'PROCESSING']);

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
    updates.slug = String(body?.slug ?? slugify(name)).trim() || slugify(name);
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
  if (has('shortDescription') || has('short_description') || !partial) {
    const shortDescription = String(body?.shortDescription ?? body?.short_description ?? body?.description ?? '').trim();
    if (!shortDescription) throw new Error('Short description is required');
    updates.short_description = shortDescription;
  }
  if (has('inventoryCount') || has('inventory_count') || !partial) {
    const inventoryCount = Number(body?.inventoryCount ?? body?.inventory_count ?? 25);
    if (!Number.isInteger(inventoryCount) || inventoryCount < 0) {
      throw new Error('Inventory count must be a non-negative integer');
    }
    updates.inventory_count = inventoryCount;
  }
  if (has('isFeatured') || has('is_featured') || !partial) {
    updates.is_featured = Boolean(body?.isFeatured ?? body?.is_featured ?? false);
  }
  if (has('gallery') || !partial) {
    const gallery = normalizeGallery(body?.gallery, String(body?.image ?? '').trim());
    updates.gallery = gallery;
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
      slug: slugify(`${baseName} ${sku}`),
      price: randomPrice(19, 399),
      category,
      image: profile?.image || fallback.image,
      short_description: String(profile?.description || fallback.description).slice(0, 96),
      inventory_count: randomInt(12, 60),
      is_featured: idx % 4 === 0,
      gallery: [profile?.image || fallback.image],
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

function getPlatformApiKeyFromRequest(req: Request) {
  const headerKey = req.headers.get('x-api-key') || req.headers.get('apikey') || '';
  if (headerKey.trim()) return headerKey.trim();

  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.startsWith('ApiKey ')) return authHeader.slice('ApiKey '.length).trim();
  if (authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.slice('Bearer '.length).trim();
    if (bearerToken.startsWith('lumina_')) return bearerToken;
  }
  return '';
}

function generatePlatformApiKey() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const encoded = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return `lumina_${encoded}`;
}

function normalizeIntegrationScopes(raw: unknown) {
  if (!Array.isArray(raw)) return [];
  return raw.map((scope) => String(scope || '').trim()).filter((scope) => INTEGRATION_SCOPES.includes(scope));
}

async function sha256Hex(value: string) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function readPlatformApiKeyRecord() {
  const { data, error } = await adminClient
    .from('app_settings')
    .select('value')
    .eq('key', PLATFORM_API_KEY_KEY)
    .maybeSingle();
  if (error) {
    if (isMissingSettingsTableError(error)) return null;
    throw error;
  }

  const value = data?.value;
  if (value && typeof value === 'object' && typeof (value as any).hash === 'string') {
    return value as Record<string, any>;
  }
  return null;
}

function mapPlatformApiKeyRecord(record: Record<string, any> | null) {
  if (!record?.hash) {
    return {
      hasApiKey: false,
      maskedApiKey: '',
      createdAt: '',
      lastUsedAt: '',
      scopes: []
    };
  }

  const prefix = String(record.prefix || '');
  const suffix = String(record.suffix || '');
  return {
    hasApiKey: true,
    maskedApiKey: prefix && suffix ? `${prefix}${'*'.repeat(12)}${suffix}` : 'Saved API key',
    createdAt: String(record.createdAt || ''),
    lastUsedAt: String(record.lastUsedAt || ''),
    scopes: normalizeIntegrationScopes(record.scopes)
  };
}

async function createPlatformApiKey(adminUser: UserContext, scopes: string[] = []) {
  const apiKey = generatePlatformApiKey();
  const hash = await sha256Hex(apiKey);
  const now = new Date().toISOString();
  const value = {
    hash,
    prefix: apiKey.slice(0, 11),
    suffix: apiKey.slice(-4),
    scopes: normalizeIntegrationScopes(scopes),
    createdAt: now,
    createdBy: adminUser.id,
    lastUsedAt: ''
  };

  const { error } = await adminClient.from('app_settings').upsert(
    {
      key: PLATFORM_API_KEY_KEY,
      value
    },
    { onConflict: 'key' }
  );
  if (error) throw error;

  return {
    apiKey,
    ...mapPlatformApiKeyRecord(value)
  };
}

async function revokePlatformApiKey() {
  const { error } = await adminClient.from('app_settings').delete().eq('key', PLATFORM_API_KEY_KEY);
  if (error && !isMissingSettingsTableError(error)) throw error;
  return mapPlatformApiKeyRecord(null);
}

async function updatePlatformApiKeyScopes(rawScopes: unknown) {
  const record = await readPlatformApiKeyRecord();
  if (!record?.hash) return mapPlatformApiKeyRecord(null);
  const value = { ...record, scopes: normalizeIntegrationScopes(rawScopes) };
  const { error } = await adminClient
    .from('app_settings')
    .upsert({ key: PLATFORM_API_KEY_KEY, value }, { onConflict: 'key' });
  if (error) throw error;
  return mapPlatformApiKeyRecord(value);
}

async function validatePlatformApiKey(req: Request) {
  const apiKey = getPlatformApiKeyFromRequest(req);
  if (!apiKey) return null;

  const record = await readPlatformApiKeyRecord();
  if (!record?.hash) return null;

  const incomingHash = await sha256Hex(apiKey);
  if (incomingHash !== String(record.hash)) return null;

  const now = new Date().toISOString();
  await adminClient
    .from('app_settings')
    .upsert({ key: PLATFORM_API_KEY_KEY, value: { ...record, lastUsedAt: now } }, { onConflict: 'key' });

  return {
    id: 'platform-api-key',
    email: '',
    role: 'Integration',
    scopes: normalizeIntegrationScopes(record.scopes)
  };
}

async function readAdminSettings() {
  const [topCategoryLimit, platformApiKeyRecord] = await Promise.all([readTopCategoryLimit(), readPlatformApiKeyRecord()]);
  return {
    topCategoryLimit,
    platformApiKey: mapPlatformApiKeyRecord(platformApiKeyRecord)
  };
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

async function requirePlatformIntegration(req: Request, scope: string) {
  const integrationUser = await validatePlatformApiKey(req);
  if (!integrationUser) {
    throw new Error('Unauthorized');
  }
  if (!integrationUser.scopes?.includes(scope)) {
    throw new Error('Forbidden');
  }
  return integrationUser;
}

async function getAdminOrderList() {
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

  return { items, count: items.length };
}

async function getIntegrationCustomer(input: Record<string, any>, url?: URL) {
  const customerId = String(input.customerId || url?.searchParams.get('customerId') || '').trim();
  const customerEmail = String(input.customerEmail || url?.searchParams.get('customerEmail') || '').trim().toLowerCase();

  if (!customerId && !customerEmail) {
    throw new Error('customerEmail or customerId is required');
  }

  let query = adminClient.from('profiles').select(PROFILE_SELECT_COLUMNS);
  if (customerId) {
    query = query.eq('id', customerId);
  } else {
    query = query.eq('email', customerEmail);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  if (!data) {
    throw new Error('Customer not found');
  }
  return data as Record<string, any>;
}

async function addIntegrationCartItem(customerId: string, productId: number, quantity: number) {
  if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) {
    throw new Error('Invalid productId or quantity');
  }

  const { data: product } = await adminClient.from('products').select('id').eq('id', productId).maybeSingle();
  if (!product) throw new Error('Product not found');

  const { data: existing } = await adminClient
    .from('cart_items')
    .select('quantity')
    .eq('user_id', customerId)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    const { error } = await adminClient
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('user_id', customerId)
      .eq('product_id', productId);
    if (error) throw error;
  } else {
    const { error } = await adminClient
      .from('cart_items')
      .insert({ user_id: customerId, product_id: productId, quantity });
    if (error) throw error;
  }

  return getCartSummary(customerId);
}

async function updateIntegrationCartItem(customerId: string, productId: number, quantity: number) {
  if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) {
    throw new Error('Invalid productId or quantity');
  }

  const { data, error } = await adminClient
    .from('cart_items')
    .update({ quantity })
    .eq('user_id', customerId)
    .eq('product_id', productId)
    .select('product_id');
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Cart item not found');
  return getCartSummary(customerId);
}

async function removeIntegrationCartItem(customerId: string, productId: number) {
  if (!Number.isInteger(productId)) throw new Error('Invalid productId');
  const { data, error } = await adminClient
    .from('cart_items')
    .delete()
    .eq('user_id', customerId)
    .eq('product_id', productId)
    .select('product_id');
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Cart item not found');
  return getCartSummary(customerId);
}

async function checkoutIntegrationCart(customerId: string, body: Record<string, any>) {
  const shippingAddress = body.shippingAddress ? String(body.shippingAddress) : String(body.shippingAddressLine1 || '');
  const paymentMethod = body.paymentMethod ? String(body.paymentMethod) : 'card';

  const { data, error } = await adminClient.rpc('create_order_from_cart', {
    p_user_id: customerId,
    p_shipping_address: shippingAddress,
    p_payment_method: paymentMethod
  });

  if (error) {
    if (error.message.toLowerCase().includes('cart is empty')) {
      throw new Error('Cart is empty');
    }
    throw error;
  }

  return { order: data };
}

async function getCartSummary(userId: string) {
  let data = null;
  let error = null;

  ({ data, error } = await adminClient
    .from('cart_items')
    .select('quantity, product:products(id,name,slug,price,category,image,short_description,inventory_count,is_featured,gallery,rating,reviews,description)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false }));

  // Fallback for older schemas before the ecommerce parity migration is applied.
  if (error && /column .* does not exist/i.test(String(error.message || ''))) {
    ({ data, error } = await adminClient
      .from('cart_items')
      .select('quantity, product:products(id,name,price,category,image,rating,reviews,description)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }));
  }

  if (error) throw error;

  const items = (data || []).map((row: any) => {
    const product = mapProductRecord(row.product || {});
    const lineTotal = Number(product.price) * row.quantity;
    return {
      ...product,
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
      const minPrice = url.searchParams.get('minPrice');
      const maxPrice = url.searchParams.get('maxPrice');
      const page = Math.max(Number(url.searchParams.get('page') || 1), 1);
      const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 12), 1), 48);
      const order = parseSort(sort);

      let query = adminClient.from('products').select('*', { count: 'exact' });

      if (category && category !== 'All') {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (minPrice) {
        query = query.gte('price', Number(minPrice));
      }

      if (maxPrice) {
        query = query.lte('price', Number(maxPrice));
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      const { data, error, count } = await query.order(order.column, { ascending: order.ascending }).range(from, to);
      if (error) throw error;

      const items = (data || []).map((item: any) => mapProductRecord(item));
      const totalItems = Number(count || 0);
      return response(200, {
        items,
        count: items.length,
        page,
        limit,
        totalItems,
        totalPages: Math.max(Math.ceil(totalItems / limit), 1)
      });
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

    if (path === '/admin/settings' && req.method === 'GET') {
      await requireAdmin(req);
      return response(200, await readAdminSettings());
    }

    if (path.startsWith('/products/') && req.method === 'GET') {
      if (path.endsWith('/related')) {
        const id = Number(path.split('/')[2]);
        const { data: current, error: currentError } = await adminClient
          .from('products')
          .select('id,category')
          .eq('id', id)
          .maybeSingle();
        if (currentError) throw currentError;
        if (!current) return response(404, { error: 'Product not found' });

        const { data: related, error: relatedError } = await adminClient
          .from('products')
          .select('*')
          .eq('category', current.category)
          .neq('id', current.id)
          .order('rating', { ascending: false })
          .limit(4);
        if (relatedError) throw relatedError;

        return response(200, { items: (related || []).map((item: any) => mapProductRecord(item)), count: (related || []).length });
      }

      const id = Number(path.split('/')[2]);
      const { data, error } = await adminClient.from('products').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      if (!data) return response(404, { error: 'Product not found' });
      return response(200, mapProductRecord(data as Record<string, any>));
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
              .select(PROFILE_SELECT_COLUMNS)
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
          .select(PROFILE_SELECT_COLUMNS)
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
          .select(PROFILE_SELECT_COLUMNS)
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

    if (path === '/auth/me' && req.method === 'PATCH') {
      const user = await getUserFromAuth(req);
      const body = await readJson(req);
      const { data: currentProfile, error: currentProfileError } = await adminClient
        .from('profiles')
        .select(PROFILE_SELECT_COLUMNS)
        .eq('id', user.id)
        .maybeSingle();
      if (currentProfileError) throw currentProfileError;
      if (!currentProfile) return response(404, { error: 'Profile not found' });

      const profileUpdates: Record<string, string | null> = {};
      const name = normalizeOptionalText(body.name);
      const email = normalizeOptionalText(body.email)?.toLowerCase();
      const phone = normalizeOptionalText(body.phone);
      const addressLine1 = normalizeOptionalText(body.addressLine1);
      const addressLine2 = normalizeOptionalText(body.addressLine2);
      const addressCity = normalizeOptionalText(body.addressCity);
      const addressState = normalizeOptionalText(body.addressState);
      const addressPostalCode = normalizeOptionalText(body.addressPostalCode);
      let emailChanged = false;

      if (name !== undefined) {
        if (!name) {
          return response(400, { error: 'name cannot be empty' });
        }
        profileUpdates.name = name;
      }

      if (email !== undefined) {
        if (!email) {
          return response(400, { error: 'email cannot be empty' });
        }

        if (email !== String(currentProfile.email || '').toLowerCase()) {
          const { data: existingEmailOwner, error: emailLookupError } = await adminClient
            .from('profiles')
            .select('id')
            .eq('email', email)
            .neq('id', user.id)
            .maybeSingle();
          if (emailLookupError) throw emailLookupError;
          if (existingEmailOwner) {
            return response(409, { error: 'Email is already in use' });
          }

          const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(user.id, {
            email
          });
          if (authUpdateError) {
            return response(400, { error: authUpdateError.message });
          }

          emailChanged = true;
        }

        profileUpdates.email = email;
      }

      if (phone !== undefined) profileUpdates.phone = phone;
      if (addressLine1 !== undefined) profileUpdates.address_line1 = addressLine1;
      if (addressLine2 !== undefined) profileUpdates.address_line2 = addressLine2;
      if (addressCity !== undefined) profileUpdates.address_city = addressCity;
      if (addressState !== undefined) profileUpdates.address_state = addressState;
      if (addressPostalCode !== undefined) profileUpdates.address_postal_code = addressPostalCode;

      if (Object.keys(profileUpdates).length === 0) {
        return response(400, { error: 'No valid fields to update' });
      }

      const { data: updatedProfile, error: updateError } = await adminClient
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id)
        .select(PROFILE_SELECT_COLUMNS)
        .maybeSingle();

      if (updateError) {
        if (emailChanged) {
          await adminClient.auth.admin.updateUserById(user.id, {
            email: String(currentProfile.email || user.email)
          }).catch(() => null);
        }
        throw updateError;
      }

      const [{ data: orderTotals }, { data: orderIds }] = await Promise.all([
        adminClient.from('orders').select('total').eq('user_id', user.id),
        adminClient.from('orders').select('id').eq('user_id', user.id)
      ]);
      const totalSpent = (orderTotals || []).reduce((sum: number, order: any) => sum + Number(order.total), 0);
      const orderCount = (orderIds || []).length;

      return response(200, {
        user: mapProfileRecord(updatedProfile as Record<string, any>, user, { orderCount, totalSpent })
      });
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
          .select(PROFILE_SELECT_COLUMNS)
          .eq('id', user.id)
          .maybeSingle(),
        adminClient.from('orders').select('id,total').eq('user_id', user.id)
      ]);

      const orderCount = (orders || []).length;
      const totalSpent = (orders || []).reduce((sum: number, o: any) => sum + Number(o.total), 0);

      return response(200, {
        user: mapProfileRecord(profile, user, { orderCount, totalSpent })
      });
    }

    if (path === '/order-update-requests' && req.method === 'GET') {
      const user = await getUserFromAuth(req);
      const { data, error } = await adminClient
        .from('order_update_requests')
        .select('id,order_id,user_id,requested_changes,reason,status,admin_note,reviewed_by,reviewed_at,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      return response(200, {
        items: (data || []).map((request: any) => mapOrderUpdateRequestRecord(request)),
        count: (data || []).length
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
      const shippingAddress = body.shippingAddress ? String(body.shippingAddress) : String(body.shippingAddressLine1 || '');
      const paymentMethod = body.paymentMethod ? String(body.paymentMethod) : 'card';
      const shippingRecipient = String(body.shippingRecipient || '');
      const shippingPhone = String(body.shippingPhone || '');
      const shippingAddressLine1 = String(body.shippingAddressLine1 || '');
      const shippingAddressLine2 = String(body.shippingAddressLine2 || '');
      const shippingCity = String(body.shippingCity || '');
      const shippingState = String(body.shippingState || '');
      const shippingPostalCode = String(body.shippingPostalCode || '');

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

      const orderId = (data as any)?.id;
      if (orderId) {
        const { error: updateError } = await adminClient
          .from('orders')
          .update({
            shipping_recipient: shippingRecipient,
            shipping_phone: shippingPhone,
            shipping_address_line1: shippingAddressLine1,
            shipping_address_line2: shippingAddressLine2,
            shipping_city: shippingCity,
            shipping_state: shippingState,
            shipping_postal_code: shippingPostalCode
          })
          .eq('id', orderId);
        if (updateError) throw updateError;

        const { data: order, error: orderError } = await adminClient
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .maybeSingle();
        if (orderError) throw orderError;

        const { data: items, error: itemsError } = await adminClient
          .from('order_items')
          .select('product_id,product_name,product_category,unit_price,quantity,total_price')
          .eq('order_id', orderId)
          .order('id', { ascending: true });
        if (itemsError) throw itemsError;

        return response(
          201,
          {
            order: mapOrderRecord(
              order as Record<string, any>,
              (items || []).map((item: any) => ({
                productId: item.product_id,
                productName: item.product_name,
                productCategory: item.product_category,
                unitPrice: Number(item.unit_price),
                quantity: item.quantity,
                totalPrice: Number(item.total_price)
              }))
            )
          }
        );
      }

      return response(201, { order: data });
    }

    if (path.startsWith('/orders/') && path.endsWith('/update-request') && req.method === 'POST') {
      const user = await getUserFromAuth(req);
      const orderId = Number(path.split('/')[2]);
      const body = await readJson(req);
      const reason = normalizeOptionalText(body.reason) || '';
      const requestedChanges = collectOrderUpdateChanges(
        body.requestedChanges && typeof body.requestedChanges === 'object' ? body.requestedChanges : body
      );

      if (!Number.isInteger(orderId) || orderId < 1) {
        return response(400, { error: 'Invalid order id' });
      }

      if (Object.keys(requestedChanges).length === 0) {
        return response(400, { error: 'At least one order update field is required' });
      }

      const { data: order, error: orderError } = await adminClient
        .from('orders')
        .select('id,status')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (orderError) throw orderError;
      if (!order) return response(404, { error: 'Order not found' });
      if (String(order.status || '').toLowerCase() === 'cancelled') {
        return response(400, { error: 'Cancelled orders cannot be updated' });
      }

      const { data: existingPending, error: pendingError } = await adminClient
        .from('order_update_requests')
        .select('id')
        .eq('order_id', orderId)
        .eq('user_id', user.id)
        .eq('status', 'Pending')
        .maybeSingle();
      if (pendingError) throw pendingError;
      if (existingPending) {
        return response(409, { error: 'A pending update request already exists for this order' });
      }

      const { data: request, error } = await adminClient
        .from('order_update_requests')
        .insert({
          order_id: orderId,
          user_id: user.id,
          requested_changes: requestedChanges,
          reason,
          status: 'Pending'
        })
        .select('id,order_id,user_id,requested_changes,reason,status,admin_note,reviewed_by,reviewed_at,created_at')
        .maybeSingle();
      if (error) throw error;

      return response(201, { request: mapOrderUpdateRequestRecord(request as Record<string, any>) });
    }

    if (path === '/admin/users' && req.method === 'GET') {
      await requireAdmin(req);
      const { data, error } = await adminClient
        .from('profiles')
        .select(PROFILE_SELECT_COLUMNS)
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

    if (path === '/admin/order-update-requests' && req.method === 'GET') {
      await requireAdmin(req);
      const { data, error } = await adminClient
        .from('order_update_requests')
        .select('id,order_id,user_id,requested_changes,reason,status,admin_note,reviewed_by,reviewed_at,created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;

      return response(200, {
        items: (data || []).map((request: any) => mapOrderUpdateRequestRecord(request)),
        count: (data || []).length
      });
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
        .select(PROFILE_SELECT_COLUMNS)
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
            .select(PROFILE_SELECT_COLUMNS)
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
        .select(PROFILE_SELECT_COLUMNS)
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

    if (path.startsWith('/admin/order-update-requests/') && req.method === 'PATCH') {
      const adminUser = await requireAdmin(req);
      const requestId = Number(path.split('/')[3]);
      const body = await readJson(req);
      const status = String(body.status || '').trim();
      const adminNote = normalizeOptionalText(body.adminNote);

      if (!Number.isInteger(requestId) || requestId < 1) {
        return response(400, { error: 'Invalid request id' });
      }

      if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
        return response(400, { error: 'Invalid status value' });
      }

      const reviewFields: Record<string, unknown> = {
        status,
        admin_note: adminNote || null
      };

      if (status === 'Pending') {
        reviewFields.reviewed_by = null;
        reviewFields.reviewed_at = null;
      } else {
        reviewFields.reviewed_by = adminUser.id;
        reviewFields.reviewed_at = new Date().toISOString();
      }

      const { data, error } = await adminClient
        .from('order_update_requests')
        .update(reviewFields)
        .eq('id', requestId)
        .select('id,order_id,user_id,requested_changes,reason,status,admin_note,reviewed_by,reviewed_at,created_at')
        .maybeSingle();
      if (error) throw error;
      if (!data) return response(404, { error: 'Request not found' });

      return response(200, { request: mapOrderUpdateRequestRecord(data as Record<string, any>) });
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
      return response(200, await getAdminOrderList());
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

      return response(201, { product: mapProductRecord(data as Record<string, any>) });
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

      return response(200, { product: mapProductRecord(data as Record<string, any>) });
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
      const [topCategoryLimit, platformApiKey] = await Promise.all([
        writeTopCategoryLimit(body.topCategoryLimit),
        Object.prototype.hasOwnProperty.call(body, 'platformApiKeyScopes')
          ? updatePlatformApiKeyScopes(body.platformApiKeyScopes)
          : Promise.resolve(mapPlatformApiKeyRecord(await readPlatformApiKeyRecord()))
      ]);
      return response(200, {
        topCategoryLimit,
        platformApiKey
      });
    }

    if (path === '/admin/api-key' && req.method === 'POST') {
      const adminUser = await requireAdmin(req);
      const body = await readJson(req);
      return response(201, await createPlatformApiKey(adminUser, normalizeIntegrationScopes(body.scopes)));
    }

    if (path === '/admin/api-key' && req.method === 'DELETE') {
      await requireAdmin(req);
      return response(200, await revokePlatformApiKey());
    }

    if (path === '/integrations/orders' && req.method === 'GET') {
      await requirePlatformIntegration(req, 'read:orders');
      return response(200, await getAdminOrderList());
    }

    if (path === '/integrations/products' && req.method === 'GET') {
      await requirePlatformIntegration(req, 'read:catalog');
      const category = url.searchParams.get('category');
      const search = url.searchParams.get('search');
      const sort = url.searchParams.get('sort');
      const minPrice = url.searchParams.get('minPrice');
      const maxPrice = url.searchParams.get('maxPrice');
      const page = Math.max(Number(url.searchParams.get('page') || 1), 1);
      const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 12), 1), 48);
      const order = parseSort(sort);

      let query = adminClient.from('products').select('*', { count: 'exact' });
      if (category && category !== 'All') query = query.eq('category', category);
      if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      if (minPrice) query = query.gte('price', Number(minPrice));
      if (maxPrice) query = query.lte('price', Number(maxPrice));

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      const { data, error, count } = await query.order(order.column, { ascending: order.ascending }).range(from, to);
      if (error) throw error;
      const items = (data || []).map((item: any) => mapProductRecord(item));
      const totalItems = Number(count || 0);
      return response(200, {
        items,
        count: items.length,
        page,
        limit,
        totalItems,
        totalPages: Math.max(Math.ceil(totalItems / limit), 1)
      });
    }

    if (path === '/integrations/categories' && req.method === 'GET') {
      await requirePlatformIntegration(req, 'read:catalog');
      const { data, error } = await adminClient.from('products').select('category').order('category');
      if (error) throw error;
      return response(200, { items: ['All', ...Array.from(new Set((data || []).map((x: any) => x.category)))] });
    }

    if (path === '/integrations/settings' && req.method === 'GET') {
      await requirePlatformIntegration(req, 'read:catalog');
      const topCategoryLimit = await readTopCategoryLimit();
      return response(200, { topCategoryLimit });
    }

    if (path === '/integrations/users' && req.method === 'GET') {
      await requirePlatformIntegration(req, 'read:users');
      const { data, error } = await adminClient
        .from('profiles')
        .select(PROFILE_SELECT_COLUMNS)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const items = (data || []).map((profile: any) =>
        mapProfileRecord(profile, { id: profile.id, email: profile.email || '', role: profile.role || 'Customer' })
      );
      return response(200, { items, count: items.length });
    }

    if (path === '/integrations/cart' && req.method === 'GET') {
      await requirePlatformIntegration(req, 'write:cart');
      const customer = await getIntegrationCustomer({}, url);
      return response(200, await getCartSummary(String(customer.id)));
    }

    if (path === '/integrations/cart/items' && req.method === 'POST') {
      await requirePlatformIntegration(req, 'write:cart');
      const body = await readJson(req);
      const customer = await getIntegrationCustomer(body, url);
      return response(201, await addIntegrationCartItem(String(customer.id), Number(body.productId), Number(body.quantity || 1)));
    }

    if (path.startsWith('/integrations/cart/items/') && req.method === 'PATCH') {
      await requirePlatformIntegration(req, 'write:cart');
      const body = await readJson(req);
      const customer = await getIntegrationCustomer(body, url);
      const productId = Number(path.split('/')[4]);
      return response(200, await updateIntegrationCartItem(String(customer.id), productId, Number(body.quantity)));
    }

    if (path.startsWith('/integrations/cart/items/') && req.method === 'DELETE') {
      await requirePlatformIntegration(req, 'write:cart');
      const body = await readJson(req);
      const customer = await getIntegrationCustomer(body, url);
      const productId = Number(path.split('/')[4]);
      return response(200, await removeIntegrationCartItem(String(customer.id), productId));
    }

    if (path === '/integrations/checkout' && req.method === 'POST') {
      await requirePlatformIntegration(req, 'write:checkout');
      const body = await readJson(req);
      const customer = await getIntegrationCustomer(body, url);
      return response(201, await checkoutIntegrationCart(String(customer.id), body));
    }

    if (path === '/orders' && req.method === 'GET') {
      const user = await getUserFromAuth(req);
      let data = null;
      let error = null;
      ({ data, error } = await adminClient
        .from('orders')
        .select('id,subtotal,shipping,total,shipping_address,shipping_recipient,shipping_phone,shipping_address_line1,shipping_address_line2,shipping_city,shipping_state,shipping_postal_code,payment_method,status,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }));
      if (error && /column .* does not exist/i.test(String(error.message || ''))) {
        ({ data, error } = await adminClient
          .from('orders')
          .select('id,subtotal,shipping,total,shipping_address,payment_method,status,created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }));
      }
      if (error) throw error;

      const items = (data || []).map((item: any) => mapOrderRecord(item));
      return response(200, { items, count: items.length });
    }

    if (path.startsWith('/orders/') && req.method === 'GET') {
      const user = await getUserFromAuth(req);
      const orderId = Number(path.split('/')[2]);

      let order = null;
      let orderError = null;
      ({ data: order, error: orderError } = await adminClient
        .from('orders')
        .select('id,subtotal,shipping,total,shipping_address,shipping_recipient,shipping_phone,shipping_address_line1,shipping_address_line2,shipping_city,shipping_state,shipping_postal_code,payment_method,status,created_at')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .maybeSingle());
      if (orderError && /column .* does not exist/i.test(String(orderError.message || ''))) {
        ({ data: order, error: orderError } = await adminClient
          .from('orders')
          .select('id,subtotal,shipping,total,shipping_address,payment_method,status,created_at')
          .eq('id', orderId)
          .eq('user_id', user.id)
          .maybeSingle());
      }

      if (orderError) throw orderError;
      if (!order) return response(404, { error: 'Order not found' });

      const { data: items, error: itemError } = await adminClient
        .from('order_items')
        .select('product_id,product_name,product_category,unit_price,quantity,total_price')
        .eq('order_id', orderId)
        .order('id', { ascending: true });

      if (itemError) throw itemError;

      return response(
        200,
        mapOrderRecord(
          order as Record<string, any>,
          (items || []).map((item: any) => ({
            productId: item.product_id,
            productName: item.product_name,
            productCategory: item.product_category,
            unitPrice: Number(item.unit_price),
            quantity: item.quantity,
            totalPrice: Number(item.total_price)
          }))
        )
      );
    }

    if (path.startsWith('/orders/') && req.method === 'PATCH') {
      const user = await getUserFromAuth(req);
      const orderId = Number(path.split('/')[2]);
      const body = await readJson(req);
      const action = String(body.action || '').trim().toLowerCase();

      const { data: order, error: orderError } = await adminClient
        .from('orders')
        .select('id,status')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (orderError) throw orderError;
      if (!order) return response(404, { error: 'Order not found' });
      if (action !== 'cancel') return response(400, { error: 'Unsupported order action' });
      if (!CUSTOMER_CANCELLABLE_STATUSES.has(String(order.status || '').toUpperCase())) {
        return response(400, { error: 'Only placed or processing orders can be cancelled' });
      }

      const { data: updated, error: updateError } = await adminClient
        .from('orders')
        .update({ status: 'Cancelled' })
        .eq('id', orderId)
        .eq('user_id', user.id)
        .select('id,subtotal,shipping,total,shipping_address,shipping_recipient,shipping_phone,shipping_address_line1,shipping_address_line2,shipping_city,shipping_state,shipping_postal_code,payment_method,status,created_at')
        .maybeSingle();
      if (updateError && /column .* does not exist/i.test(String(updateError.message || ''))) {
        const { data: fallback, error: fallbackError } = await adminClient
          .from('orders')
          .update({ status: 'Cancelled' })
          .eq('id', orderId)
          .eq('user_id', user.id)
          .select('id,subtotal,shipping,total,shipping_address,payment_method,status,created_at')
          .maybeSingle();
        if (fallbackError) throw fallbackError;
        return response(200, { order: mapOrderRecord(fallback as Record<string, any>) });
      }
      if (updateError) throw updateError;

      return response(200, { order: mapOrderRecord(updated as Record<string, any>) });
    }

    if (path.startsWith('/orders/') && path.endsWith('/reorder') && req.method === 'POST') {
      const user = await getUserFromAuth(req);
      const orderId = Number(path.split('/')[2]);

      const { data: order, error: orderError } = await adminClient
        .from('orders')
        .select('id')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (orderError) throw orderError;
      if (!order) return response(404, { error: 'Order not found' });

      const { data: items, error: itemsError } = await adminClient
        .from('order_items')
        .select('product_id,quantity')
        .eq('order_id', orderId);
      if (itemsError) throw itemsError;

      for (const item of items || []) {
        const { data: existing, error: existingError } = await adminClient
          .from('cart_items')
          .select('quantity')
          .eq('user_id', user.id)
          .eq('product_id', item.product_id)
          .maybeSingle();
        if (existingError) throw existingError;

        if (existing) {
          const { error: updateCartError } = await adminClient
            .from('cart_items')
            .update({ quantity: Number(existing.quantity || 0) + Number(item.quantity || 0) })
            .eq('user_id', user.id)
            .eq('product_id', item.product_id);
          if (updateCartError) throw updateCartError;
        } else {
          const { error: insertCartError } = await adminClient
            .from('cart_items')
            .insert({ user_id: user.id, product_id: item.product_id, quantity: item.quantity });
          if (insertCartError) throw insertCartError;
        }
      }

      return response(201, { ok: true });
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
