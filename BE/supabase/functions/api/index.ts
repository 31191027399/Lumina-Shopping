import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2';

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

const FIRST_NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Riley', 'Casey', 'Avery', 'Cameron', 'Finley', 'Reese'];
const LAST_NAMES = ['Nguyen', 'Tran', 'Pham', 'Le', 'Hoang', 'Vo', 'Do', 'Bui', 'Dang', 'Huynh'];
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
    const value = Deno.env.get(key);
    if (value) return value;
  }
  return '';
}

const SUPABASE_URL = readEnv('APP_SUPABASE_URL', 'SUPABASE_URL');
const SUPABASE_ANON_KEY = readEnv(
  'APP_SUPABASE_ANON_KEY',
  'SUPABASE_ANON_KEY',
  'SUPABASE_PUBLISHABLE_KEY'
);
const SUPABASE_SERVICE_ROLE_KEY = readEnv(
  'APP_SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SECRET_KEY'
);

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

function response(status: number, data: Json) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
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
    shortDescription: product.short_description || product.description,
    inventoryCount: Number(product.inventory_count ?? 0),
    isFeatured: Boolean(product.is_featured),
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
    paymentMethod: order.payment_method || 'card',
    createdAt: order.created_at,
    shippingAddress: order.shipping_address || order.shipping_address_line1 || '',
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

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPrice(min: number, max: number) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

function normalizeTargetSet(payload: any) {
  const rawTargets = Array.isArray(payload?.targets)
    ? payload.targets
    : payload?.target
      ? [payload.target]
      : [];

  const set = new Set(
    rawTargets
      .map((target: unknown) => String(target || '').toLowerCase().trim())
      .filter(Boolean)
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

async function nextProductId() {
  const { data } = await adminClient.from('products').select('id').order('id', { ascending: false }).limit(1);
  return (data?.[0]?.id || 0) + 1;
}

function buildDummyProducts(startId: number, count: number) {
  return Array.from({ length: count }).map((_, idx) => {
    const base = PRODUCT_TEMPLATE_POOL[idx % PRODUCT_TEMPLATE_POOL.length];
    const sku = startId + idx;
    return {
      id: sku,
      name: `${base.name} ${sku}`,
      slug: slugify(`${base.name} ${sku}`),
      price: randomPrice(19, 399),
      category: base.category,
      image: base.image,
      short_description: base.description.slice(0, 96),
      inventory_count: randomInt(12, 60),
      is_featured: idx % 4 === 0,
      gallery: [base.image],
      rating: randomPrice(3.6, 5.0),
      reviews: randomInt(8, 500),
      description: base.description
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

async function requireAdmin(req: Request) {
  const user = await getUserFromAuth(req);
  if (user.role !== 'Admin') {
    throw new Error('Forbidden');
  }
  return user;
}

async function getCartSummary(userId: string) {
  let data = null;
  let error = null;

  ({ data, error } = await adminClient
    .from('cart_items')
    .select('quantity, product:products(id,name,slug,price,category,image,short_description,inventory_count,is_featured,gallery,rating,reviews,description)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false }));

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return noContent();
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

      const { data, error } = await authClient.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) return response(400, { error: error.message });

      let profile = null;
      if (data.user?.id) {
        const profileResult = await adminClient
          .from('profiles')
          .select(PROFILE_SELECT_COLUMNS)
          .eq('id', data.user.id)
          .maybeSingle();
        profile = profileResult.data;
      }

      return response(201, {
        user: profile || data.user,
        session: data.session
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

      return response(200, { user: mapProfileRecord(profile, user, { orderCount, totalSpent }) });
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
      const rawEmail = normalizeOptionalText(body.email);
      const email = typeof rawEmail === 'string' ? rawEmail.toLowerCase() : rawEmail;
      const phone = normalizeOptionalText(body.phone);
      const addressLine1 = normalizeOptionalText(body.addressLine1);
      const addressLine2 = normalizeOptionalText(body.addressLine2);
      const addressCity = normalizeOptionalText(body.addressCity);
      const addressState = normalizeOptionalText(body.addressState);
      const addressPostalCode = normalizeOptionalText(body.addressPostalCode);
      let emailChanged = false;

      if (name !== undefined) {
        if (!name) return response(400, { error: 'name cannot be empty' });
        profileUpdates.name = name;
      }

      if (email !== undefined) {
        if (!email) return response(400, { error: 'email cannot be empty' });
        if (email !== String(currentProfile.email || '').toLowerCase()) {
          const { data: existingEmailOwner, error: emailLookupError } = await adminClient
            .from('profiles')
            .select('id')
            .eq('email', email)
            .neq('id', user.id)
            .maybeSingle();
          if (emailLookupError) throw emailLookupError;
          if (existingEmailOwner) return response(409, { error: 'Email is already in use' });

          const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(user.id, { email });
          if (authUpdateError) return response(400, { error: authUpdateError.message });
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
        user: mapProfileRecord(updatedProfile, user, { orderCount, totalSpent })
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

        const { data: items, error: itemError } = await adminClient
          .from('order_items')
          .select('product_id,product_name,product_category,unit_price,quantity,total_price')
          .eq('order_id', orderId)
          .order('id', { ascending: true });
        if (itemError) throw itemError;

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

      if (Object.keys(updates).length === 0) {
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

      let insertedProducts = 0;
      let insertedUsers = 0;
      let insertedOrders = 0;

      if (targets.has('products') && productCount > 0) {
        const startId = await nextProductId();
        const productsToInsert = buildDummyProducts(startId, productCount);
        const { error } = await adminClient.from('products').insert(productsToInsert);
        if (error) throw error;
        insertedProducts = productsToInsert.length;
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
        insertedOrders
      });
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
});
