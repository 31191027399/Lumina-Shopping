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

const FIRST_NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Riley', 'Casey', 'Avery', 'Cameron', 'Finley', 'Reese'];
const LAST_NAMES = ['Nguyen', 'Tran', 'Pham', 'Le', 'Hoang', 'Vo', 'Do', 'Bui', 'Dang', 'Huynh'];

function readEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key];
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
  const numeric = Number(String(raw).replace(/[^0-9]/g, ''));
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
      price: randomPrice(19, 399),
      category: base.category,
      image: base.image,
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
          .select('id,name,email,role,status,created_at')
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

      if (Object.keys(updates).length === 0) {
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
