import React, { useEffect, useMemo, useRef, useState } from 'react';
import LegacyApp from './App';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  CreditCard,
  Filter,
  LoaderCircle,
  MapPin,
  Minus,
  Package,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  User
} from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:54321/functions/v1/api' : '/api');
const FRONTEND_ORIGIN =
  import.meta.env.VITE_FRONTEND_ORIGIN ||
  (import.meta.env.DEV ? 'http://localhost:5173' : window.location.origin);
const PASSWORD_RESET_REDIRECT_URL =
  import.meta.env.VITE_PASSWORD_RESET_REDIRECT_URL ||
  `${FRONTEND_ORIGIN}/reset-password?reset_password=1`;

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

function currency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
}

function parseRoute() {
  return {
    pathname: window.location.pathname,
    search: new URLSearchParams(window.location.search)
  };
}

function loginUrlWithRedirect(targetPath) {
  const redirect = targetPath || `${window.location.pathname}${window.location.search}`;
  return `/login?redirect=${encodeURIComponent(redirect)}`;
}

function parseProductIdFromPath(pathname) {
  const slugId = pathname.split('/product/')[1] || '';
  const match = slugId.match(/(\d+)(?:\/)?$/);
  return match ? Number(match[1]) : null;
}

function parseOrderIdFromPath(pathname) {
  const raw = pathname.split('/orders/')[1] || '';
  const match = raw.match(/^(\d+)/);
  return match ? Number(match[1]) : null;
}

function productUrl(product) {
  return `/product/${slugify(product.slug || product.name)}-${product.id}`;
}

function normalizeProduct(product = {}) {
  return {
    id: product.id,
    name: product.name || '',
    slug: product.slug || slugify(product.name),
    price: Number(product.price || 0),
    category: product.category || '',
    image: product.image || '',
    shortDescription: product.shortDescription || product.short_description || product.description || '',
    inventoryCount: Number(product.inventoryCount ?? product.inventory_count ?? 0),
    isFeatured: Boolean(product.isFeatured ?? product.is_featured),
    gallery: Array.isArray(product.gallery) && product.gallery.length ? product.gallery : [product.image].filter(Boolean),
    rating: Number(product.rating || 0),
    reviews: Number(product.reviews || 0),
    description: product.description || ''
  };
}

function normalizeOrder(order = {}) {
  return {
    id: order.id,
    subtotal: Number(order.subtotal || 0),
    shipping: Number(order.shipping || 0),
    total: Number(order.total || 0),
    status: order.status || 'PLACED',
    paymentMethod: order.paymentMethod || order.payment_method || 'card',
    createdAt: order.createdAt || order.created_at || '',
    shippingAddress: order.shippingAddress || order.shipping_address || '',
    shippingDetails: {
      recipient: order.shippingDetails?.recipient || order.shipping_recipient || '',
      phone: order.shippingDetails?.phone || order.shipping_phone || '',
      addressLine1: order.shippingDetails?.addressLine1 || order.shipping_address_line1 || '',
      addressLine2: order.shippingDetails?.addressLine2 || order.shipping_address_line2 || '',
      city: order.shippingDetails?.city || order.shipping_city || '',
      state: order.shippingDetails?.state || order.shipping_state || '',
      postalCode: order.shippingDetails?.postalCode || order.shipping_postal_code || ''
    },
    items: Array.isArray(order.items) ? order.items : []
  };
}

function canCancelOrder(order) {
  return ['PLACED', 'PROCESSING'].includes(String(order?.status || '').toUpperCase());
}

function orderStatusTone(status) {
  const value = String(status || '').toUpperCase();
  if (value === 'CANCELLED') return 'bg-rose-50 text-rose-700';
  if (value === 'DELIVERED') return 'bg-emerald-50 text-emerald-700';
  if (value === 'SHIPPED') return 'bg-sky-50 text-sky-700';
  return 'bg-amber-50 text-amber-700';
}

function SectionTitle({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="space-y-3">
        {eyebrow ? <p className="text-[11px] font-black uppercase tracking-[0.3em] text-sky-600">{eyebrow}</p> : null}
        <h2 className="text-4xl font-black tracking-tight text-slate-900">{title}</h2>
        {description ? <p className="max-w-2xl text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

function NavBar({ cartCount, user, onNavigate, onLogout }) {
  const route = parseRoute();
  const [search, setSearch] = useState(route.search.get('search') || '');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  useEffect(() => {
    const current = parseRoute();
    setSearch(current.search.get('search') || '');
  }, [route.pathname, window.location.search]);

  useEffect(() => {
    if (!accountMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [accountMenuOpen]);

  const submit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    onNavigate(`/shop${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const navLink = (href, label) => {
    const isActive = route.pathname === href || (href === '/shop' && route.pathname.startsWith('/product/'));
    return (
      <button
        type="button"
        onClick={() => onNavigate(href)}
        className={`text-xs font-black uppercase tracking-[0.25em] transition-colors ${isActive ? 'text-sky-600' : 'text-slate-400 hover:text-slate-900'}`}
      >
        {label}
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <button type="button" onClick={() => onNavigate('/')} className="text-2xl font-black tracking-[0.2em] text-slate-950">
          LUMINA
        </button>
        <nav className="hidden items-center gap-6 md:flex">
          {navLink('/', 'Home')}
          {navLink('/shop', 'Shop')}
          {user?.role === 'Admin' ? navLink('/admin', 'Admin') : null}
        </nav>
        <form onSubmit={submit} className="hidden min-w-0 flex-1 items-center justify-end md:flex">
          <div className="flex w-full max-w-md items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search catalog"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </form>
        <div className="flex items-center gap-3">
          <div ref={accountMenuRef} className="relative">
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  onNavigate('/login');
                  return;
                }
                setAccountMenuOpen((open) => !open);
              }}
              className="rounded-full border border-slate-200 p-3 text-slate-600 transition hover:border-sky-200 hover:text-sky-600"
              aria-haspopup="menu"
              aria-expanded={accountMenuOpen}
            >
              <User className="h-5 w-5" />
            </button>
          {user && accountMenuOpen ? (
              <div className="absolute right-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)]">
                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    onNavigate('/account');
                  }}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-sky-600"
                >
                  <span>Account</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    onLogout?.();
                  }}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  <span>Sign out</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.22em]">Logout</span>
                </button>
              </div>
            ) : null}
          </div>
          <button type="button" onClick={() => onNavigate('/cart')} className="relative rounded-full border border-slate-200 p-3 text-slate-600">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-[10px] font-black text-white">
                {cartCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 bg-slate-950 text-slate-400">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <p className="text-xl font-black tracking-[0.2em] text-white">LUMINA</p>
          <p className="text-sm leading-6">
            Modern essentials for home, motion, work, and daily rituals. Built to feel like a real storefront, not a demo.
          </p>
        </div>
        <div>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-white">Shop</p>
          <div className="space-y-2 text-sm">
            <p>New arrivals</p>
            <p>Top rated</p>
            <p>Featured edits</p>
          </div>
        </div>
        <div>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-white">Support</p>
          <div className="space-y-2 text-sm">
            <p>Order tracking</p>
            <p>Returns</p>
            <p>Shipping info</p>
          </div>
        </div>
        <div>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-white">Promise</p>
          <div className="space-y-2 text-sm">
            <p>Free shipping over $150</p>
            <p>Secure checkout</p>
            <p>Curated premium catalog</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function HomePage({ featuredProducts, categories, onNavigate }) {
  const topCategories = categories.filter((item) => item !== 'All').slice(0, 4);
  return (
    <div className="space-y-24 pb-8">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_#0ea5e9,_#0f172a_45%,_#020617_85%)] text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80')] bg-cover bg-center opacity-20" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-24 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-32">
          <div className="space-y-8">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-200">Storefront Refresh</p>
            <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Commerce flows that feel polished, fast, and shippable.
            </h1>
            <p className="max-w-2xl text-lg text-slate-200">
              Browse a fuller Lumina storefront with product pages, real URL navigation, richer checkout, and customer account flows that match a modern ecommerce experience.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => onNavigate('/shop')}
                className="rounded-full bg-white px-7 py-4 text-sm font-black uppercase tracking-[0.22em] text-slate-950 transition hover:bg-sky-100"
              >
                Shop Collection
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/account')}
                className="rounded-full border border-white/25 px-7 py-4 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-white/10"
              >
                View Account
              </button>
            </div>
          </div>
          <div className="grid gap-5 self-end sm:grid-cols-3 lg:grid-cols-1">
            {[
              ['Fast Discovery', 'Filter by price, category, search, and shareable URLs.'],
              ['Real PDPs', 'Dedicated product pages with quantity, gallery, and related items.'],
              ['Shaped Checkout', 'Structured shipping details and order confirmation views.']
            ].map(([title, description]) => (
              <div key={title} className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
                <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-sky-100">{title}</p>
                <p className="text-sm text-slate-200">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            [Truck, 'Free shipping', 'Orders above $150 ship free across the catalog.'],
            [ShieldCheck, 'Secure checkout', 'Structured customer details and payment method selection.'],
            [Package, 'Track orders', 'Customers can view history and order detail from account pages.']
          ].map(([Icon, title, description]) => (
            <div key={title} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
              <Icon className="mb-5 h-8 w-8 text-sky-600" />
              <p className="mb-2 text-lg font-black text-slate-900">{title}</p>
              <p className="text-sm leading-6 text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Popular categories"
          title="Shop by category"
          description="The catalog is no longer just a flat grid. Start from curated category doors and move into a filterable storefront."
          action={
            <button type="button" onClick={() => onNavigate('/shop')} className="text-sm font-black uppercase tracking-[0.2em] text-sky-600">
              Browse All
            </button>
          }
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {topCategories.map((category, index) => (
            <button
              type="button"
              key={category}
              onClick={() => onNavigate(`/shop?category=${encodeURIComponent(category)}`)}
              className="group overflow-hidden rounded-[2.25rem] bg-slate-900 text-left text-white"
            >
              <div className="h-56 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(https://images.unsplash.com/photo-${1490000000000 + index}?w=900&q=80)` }} />
              <div className="space-y-3 p-6">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-300">Category</p>
                <p className="text-2xl font-black">{category}</p>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  Explore <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Featured selection"
          title="Bestsellers and highlighted products"
          description="The homepage now merchandises standout products instead of sending every user straight into the same static view."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product, onNavigate, onAddToCart, compact = false }) {
  return (
    <div className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_-40px_rgba(15,23,42,0.25)]">
      <button type="button" onClick={() => onNavigate(productUrl(product))} className="block h-72 w-full overflow-hidden bg-slate-100">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </button>
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-sky-600">{product.category}</p>
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>{product.rating.toFixed(1)}</span>
          </div>
        </div>
        <button type="button" onClick={() => onNavigate(productUrl(product))} className="block text-left text-xl font-black tracking-tight text-slate-900 transition hover:text-sky-600">
          {product.name}
        </button>
        <p className={`text-sm leading-6 text-slate-500 ${compact ? '' : 'min-h-[3rem]'}`}>{product.shortDescription}</p>
        <div className="flex items-center justify-between gap-3">
          <p className="text-2xl font-black tracking-tight text-slate-950">{currency(product.price)}</p>
          {onAddToCart ? (
            <button
              type="button"
              onClick={() => onAddToCart(product, 1)}
              className="rounded-full bg-slate-950 px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-white transition hover:bg-sky-600"
            >
              Add
            </button>
          ) : (
            <button type="button" onClick={() => onNavigate(productUrl(product))} className="rounded-full border border-slate-200 px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-slate-700 transition hover:border-sky-200 hover:text-sky-600">
              View
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ShopPage({ state, categories, loading, onNavigate, onApplyFilters, onAddToCart }) {
  const [draftSearch, setDraftSearch] = useState(state.filters.search || '');
  useEffect(() => {
    setDraftSearch(state.filters.search || '');
  }, [state.filters.search]);

  const submitSearch = (event) => {
    event.preventDefault();
    onApplyFilters({ search: draftSearch, page: 1 });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-14 sm:px-6 lg:px-8">
      <SectionTitle
        eyebrow="Catalog"
        title="Shop the Lumina storefront"
        description="Browse a filterable catalog with search, price controls, sort order, shareable query params, and pagination metadata coming from the backend."
      />
      <div className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.25)] lg:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))]">
        <form onSubmit={submitSearch} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Search products" className="w-full bg-transparent text-sm outline-none" />
        </form>
        <select value={state.filters.category} onChange={(event) => onApplyFilters({ category: event.target.value, page: 1 })} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none">
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input type="number" min="0" value={state.filters.minPrice} onChange={(event) => onApplyFilters({ minPrice: event.target.value, page: 1 })} placeholder="Min price" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" />
        <input type="number" min="0" value={state.filters.maxPrice} onChange={(event) => onApplyFilters({ maxPrice: event.target.value, page: 1 })} placeholder="Max price" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" />
        <select value={state.filters.sort} onChange={(event) => onApplyFilters({ sort: event.target.value, page: 1 })} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none">
          <option value="featured">Featured</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
          <option value="rating">Top rated</option>
        </select>
        <button type="button" onClick={() => onApplyFilters({ search: '', category: 'All', minPrice: '', maxPrice: '', sort: 'featured', page: 1 })} className="rounded-2xl bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-[0.22em] text-white">
          Reset
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-sky-600" />
          <span>
            Showing {state.items.length} of {state.totalItems} products
          </span>
        </div>
        <span>Page {state.page} of {state.totalPages}</span>
      </div>

      {loading ? (
        <div className="flex min-h-[16rem] items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-slate-50">
          <LoaderCircle className="h-8 w-8 animate-spin text-sky-600" />
        </div>
      ) : state.items.length ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {state.items.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} onAddToCart={onAddToCart} />
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <p className="text-xl font-black text-slate-900">No products match those filters.</p>
          <p className="mt-2 text-sm text-slate-500">Try removing a search term or widening the price range.</p>
        </div>
      )}

      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => onApplyFilters({ page: Math.max(1, state.page - 1) })}
          disabled={state.page <= 1}
          className="rounded-full border border-slate-200 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-slate-700 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onApplyFilters({ page: Math.min(state.totalPages, state.page + 1) })}
          disabled={state.page >= state.totalPages}
          className="rounded-full border border-slate-200 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-slate-700 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function ProductDetailPage({ product, relatedProducts, quantity, setQuantity, onAddToCart, onNavigate }) {
  const [activeImage, setActiveImage] = useState(product?.gallery?.[0] || product?.image || '');
  useEffect(() => {
    setActiveImage(product?.gallery?.[0] || product?.image || '');
  }, [product?.id]);

  if (!product) return null;

  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-14 sm:px-6 lg:px-8">
      <button type="button" onClick={() => onNavigate('/shop')} className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-slate-500 transition hover:text-sky-600">
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </button>
      <div className="grid gap-12 lg:grid-cols-[1fr_0.95fr]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-slate-100">
            <img src={activeImage} alt={product.name} className="h-[32rem] w-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.gallery.map((image) => (
              <button key={image} type="button" onClick={() => setActiveImage(image)} className={`overflow-hidden rounded-[1.5rem] border ${activeImage === image ? 'border-sky-500' : 'border-slate-200'}`}>
                <img src={image} alt={product.name} className="h-24 w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <p className="rounded-full bg-sky-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-sky-700">{product.category}</p>
              <p className="rounded-full bg-emerald-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-emerald-700">
                {product.inventoryCount > 0 ? 'In stock' : 'Out of stock'}
              </p>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-slate-950">{product.name}</h1>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-slate-700">{product.rating.toFixed(1)}</span>
              </div>
              <span>{product.reviews} reviews</span>
            </div>
          </div>
          <p className="text-4xl font-black tracking-tight text-slate-950">{currency(product.price)}</p>
          <p className="text-base leading-7 text-slate-600">{product.description}</p>
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Quick facts</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FactCard icon={Truck} title="Shipping" value={product.price > 150 ? 'Free' : '$15 flat rate'} />
              <FactCard icon={ShieldCheck} title="Checkout" value="Secure payment flow" />
              <FactCard icon={Package} title="Inventory" value={`${product.inventoryCount} available`} />
              <FactCard icon={MapPin} title="Dispatch" value="Ships in 1-2 business days" />
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex items-center justify-between rounded-full border border-slate-200 px-4 py-3 sm:w-44">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-slate-600">
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-sm font-black">{quantity}</span>
              <button type="button" onClick={() => setQuantity(quantity + 1)} className="text-slate-600">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => onAddToCart(product, quantity)}
              className="rounded-full bg-slate-950 px-8 py-4 text-sm font-black uppercase tracking-[0.24em] text-white transition hover:bg-sky-600"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <SectionTitle eyebrow="Related items" title="You may also like" description="These recommendations come from the backend and stay within the same category as the current product." />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {relatedProducts.map((item) => (
            <ProductCard key={item.id} product={item} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FactCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-[1.5rem] bg-white p-4">
      <Icon className="mb-3 h-5 w-5 text-sky-600" />
      <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">{title}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function CartPage({ items, summary, onNavigate, onUpdateQty, onRemove }) {
  if (!items.length) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-sky-50 text-sky-600">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-slate-950">Your bag is empty</h1>
        <p className="mt-3 text-slate-500">Add a few products from the new storefront to test cart and checkout flows.</p>
        <button type="button" onClick={() => onNavigate('/shop')} className="mt-8 rounded-full bg-slate-950 px-7 py-4 text-sm font-black uppercase tracking-[0.22em] text-white">
          Explore catalog
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_24rem] lg:px-8">
      <div className="space-y-5">
        <SectionTitle eyebrow="Cart" title="Review your bag" description="Cart updates stay in sync with the backend and carry through to checkout." />
        {items.map((item) => (
          <div key={item.id} className="flex flex-col gap-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.25)] sm:flex-row">
            <img src={item.image} alt={item.name} className="h-32 w-full rounded-[1.5rem] object-cover sm:w-32" />
            <div className="flex flex-1 flex-col justify-between gap-4 sm:flex-row">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-sky-600">{item.category}</p>
                <button type="button" onClick={() => onNavigate(productUrl(item))} className="mt-2 text-left text-xl font-black text-slate-950 transition hover:text-sky-600">
                  {item.name}
                </button>
                <p className="mt-2 text-sm text-slate-500">{item.shortDescription || item.description}</p>
              </div>
              <div className="flex flex-col items-start gap-4 sm:items-end">
                <p className="text-2xl font-black text-slate-950">{currency(item.lineTotal)}</p>
                <div className="flex items-center justify-between rounded-full border border-slate-200 px-4 py-3 sm:w-40">
                  <button type="button" onClick={() => onUpdateQty(item.id, Math.max(1, item.quantity - 1))}>
                    <Minus className="h-4 w-4 text-slate-600" />
                  </button>
                  <span className="text-sm font-black">{item.quantity}</span>
                  <button type="button" onClick={() => onUpdateQty(item.id, item.quantity + 1)}>
                    <Plus className="h-4 w-4 text-slate-600" />
                  </button>
                </div>
                <button type="button" onClick={() => onRemove(item.id)} className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <aside className="h-fit rounded-[2.25rem] bg-slate-950 p-8 text-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.75)]">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Order summary</p>
        <div className="mt-8 space-y-4 text-sm text-slate-300">
          <SummaryRow label="Items" value={summary.itemCount} />
          <SummaryRow label="Subtotal" value={currency(summary.subtotal)} />
          <SummaryRow label="Shipping" value={summary.shipping === 0 ? 'Free' : currency(summary.shipping)} />
        </div>
        <div className="mt-6 border-t border-white/10 pt-6">
          <SummaryRow label="Total" value={currency(summary.total)} emphasis />
        </div>
        <button type="button" onClick={() => onNavigate('/checkout')} className="mt-8 w-full rounded-full bg-white px-6 py-4 text-xs font-black uppercase tracking-[0.24em] text-slate-950">
          Continue to checkout
        </button>
      </aside>
    </div>
  );
}

function SummaryRow({ label, value, emphasis = false }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`uppercase tracking-[0.18em] ${emphasis ? 'text-xs font-black text-slate-400' : 'text-[11px] font-black text-slate-400'}`}>{label}</span>
      <span className={emphasis ? 'text-2xl font-black text-white' : 'font-semibold text-white'}>{value}</span>
    </div>
  );
}

function CheckoutPage({ cart, summary, onSubmit, submitting, error }) {
  const [form, setForm] = useState({
    shippingRecipient: '',
    shippingPhone: '',
    shippingAddressLine1: '',
    shippingAddressLine2: '',
    shippingCity: '',
    shippingState: '',
    shippingPostalCode: '',
    paymentMethod: 'card'
  });
  const [validationError, setValidationError] = useState('');

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const required = ['shippingRecipient', 'shippingPhone', 'shippingAddressLine1', 'shippingCity', 'shippingState', 'shippingPostalCode'];
    const missing = required.find((field) => !String(form[field]).trim());
    if (missing) {
      setValidationError('Please complete all required shipping fields.');
      return;
    }
    setValidationError('');
    await onSubmit({
      ...form,
      shippingAddress: [form.shippingAddressLine1, form.shippingAddressLine2, form.shippingCity, form.shippingState, form.shippingPostalCode].filter(Boolean).join(', ')
    });
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_24rem] lg:px-8">
      <form onSubmit={submit} className="space-y-8 rounded-[2.25rem] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.25)]">
        <SectionTitle eyebrow="Checkout" title="Complete your order" description="Structured shipping data now gets stored with the order instead of a single free-text address line." />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Recipient" value={form.shippingRecipient} onChange={(value) => update('shippingRecipient', value)} required />
          <Field label="Phone" value={form.shippingPhone} onChange={(value) => update('shippingPhone', value)} required />
          <Field label="Address line 1" value={form.shippingAddressLine1} onChange={(value) => update('shippingAddressLine1', value)} required className="sm:col-span-2" />
          <Field label="Address line 2" value={form.shippingAddressLine2} onChange={(value) => update('shippingAddressLine2', value)} className="sm:col-span-2" />
          <Field label="City" value={form.shippingCity} onChange={(value) => update('shippingCity', value)} required />
          <Field label="State" value={form.shippingState} onChange={(value) => update('shippingState', value)} required />
          <Field label="Postal code" value={form.shippingPostalCode} onChange={(value) => update('shippingPostalCode', value)} required />
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            <span>Payment method</span>
            <select value={form.paymentMethod} onChange={(event) => update('paymentMethod', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none">
              <option value="card">Credit card</option>
              <option value="banking">Bank transfer</option>
              <option value="cod">Cash on delivery</option>
            </select>
          </label>
        </div>
        {validationError ? <p className="text-sm font-semibold text-rose-500">{validationError}</p> : null}
        {error ? <p className="text-sm font-semibold text-rose-500">{error}</p> : null}
        <button type="submit" disabled={submitting || !cart.length} className="rounded-full bg-slate-950 px-7 py-4 text-sm font-black uppercase tracking-[0.22em] text-white disabled:cursor-not-allowed disabled:opacity-50">
          {submitting ? 'Placing order...' : 'Place order'}
        </button>
      </form>

      <aside className="h-fit rounded-[2.25rem] bg-slate-950 p-8 text-white">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Order summary</p>
        <div className="mt-6 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 text-sm">
              <span>{item.name} x {item.quantity}</span>
              <span className="font-semibold">{currency(item.lineTotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-3">
          <SummaryRow label="Subtotal" value={currency(summary.subtotal)} />
          <SummaryRow label="Shipping" value={summary.shipping === 0 ? 'Free' : currency(summary.shipping)} />
          <SummaryRow label="Total" value={currency(summary.total)} emphasis />
        </div>
      </aside>
    </div>
  );
}

function Field({ label, value, onChange, required = false, className = '' }) {
  return (
    <label className={`space-y-2 text-sm font-semibold text-slate-700 ${className}`}>
      <span>
        {label}
        {required ? ' *' : ''}
      </span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none" />
    </label>
  );
}

function AccountPage({ user, orders, onNavigate, onLogout, onChangePassword, passwordState, onCancelOrder, onReorderOrder, orderActionState }) {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  const submitPassword = async (event) => {
    event.preventDefault();
    if (form.newPassword.length < 6) return;
    if (form.newPassword !== form.confirmPassword) return;
    await onChangePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword });
    setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2.25rem] bg-[linear-gradient(135deg,#0f172a,#0ea5e9)] p-8 text-white">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-100">Account</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">{user?.name}</h1>
          <p className="mt-2 text-sky-100">{user?.email}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => onNavigate('/')} className="rounded-full border border-white/20 px-5 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-white transition hover:bg-white/10">
              Back to store
            </button>
            <button type="button" onClick={onLogout} className="rounded-full border border-white/20 px-5 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-white transition hover:bg-white/10">
              Sign out
            </button>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatCard label="Orders" value={orders.length} />
            <StatCard label="Spent" value={currency(orders.reduce((sum, item) => sum + Number(item.total || 0), 0))} />
            <StatCard label="Role" value={user?.role || 'Customer'} />
          </div>
        </div>

        <div className="rounded-[2.25rem] border border-slate-200 bg-white p-8">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Security</p>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">Change password</h2>
          <form onSubmit={submitPassword} className="mt-6 space-y-4">
            <Field label="Current password" value={form.oldPassword} onChange={(value) => setForm((prev) => ({ ...prev, oldPassword: value }))} />
            <Field label="New password" value={form.newPassword} onChange={(value) => setForm((prev) => ({ ...prev, newPassword: value }))} />
            <Field label="Confirm password" value={form.confirmPassword} onChange={(value) => setForm((prev) => ({ ...prev, confirmPassword: value }))} />
            {passwordState.message ? <p className="text-sm font-semibold text-emerald-600">{passwordState.message}</p> : null}
            {passwordState.error ? <p className="text-sm font-semibold text-rose-500">{passwordState.error}</p> : null}
            <button type="submit" className="rounded-full bg-slate-950 px-6 py-3 text-xs font-black uppercase tracking-[0.22em] text-white">
              Update password
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-[2.25rem] border border-slate-200 bg-white p-8">
        <SectionTitle eyebrow="Orders" title="Order history" description="Customers can now review past orders and open a full detail page with shipping and line items." />
        <div className="mt-8 space-y-4">
          {orders.length ? (
            orders.map((order) => (
              <button key={order.id} type="button" onClick={() => onNavigate(`/orders/${order.id}`)} className="flex w-full flex-col gap-4 rounded-[1.75rem] border border-slate-200 p-5 text-left transition hover:border-sky-300 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Order #{order.id}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <p className="text-lg font-black text-slate-950">{order.status}</p>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${orderStatusTone(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xl font-black text-slate-950">{currency(order.total)}</p>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onReorderOrder(order.id);
                    }}
                    disabled={orderActionState.reorderingId === order.id}
                    className="rounded-full border border-slate-200 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700 disabled:opacity-50"
                  >
                    {orderActionState.reorderingId === order.id ? 'Adding...' : 'Buy again'}
                  </button>
                  {canCancelOrder(order) ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onCancelOrder(order.id);
                      }}
                      disabled={orderActionState.cancellingId === order.id}
                      className="rounded-full border border-rose-200 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-rose-600 disabled:opacity-50"
                    >
                      {orderActionState.cancellingId === order.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  ) : null}
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </div>
              </button>
            ))
          ) : (
            <p className="text-sm text-slate-500">No orders yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-sky-100">{label}</p>
      <p className="mt-2 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function OrderDetailPage({ order, onNavigate, onCancelOrder, onReorderOrder, orderActionState }) {
  if (!order) {
    return <div className="mx-auto max-w-4xl px-4 py-24 text-center text-slate-500">Loading order...</div>;
  }
  const success = parseRoute().search.get('placed') === '1';
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-14 sm:px-6 lg:px-8">
      {success ? (
        <div className="flex items-start gap-4 rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
          <CheckCircle className="mt-0.5 h-6 w-6 flex-none" />
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em]">Order placed</p>
            <p className="mt-2 text-sm">Checkout completed successfully and the order is now visible through the account and order detail flows.</p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Order detail</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Order #{order.id}</h1>
          <p className="mt-2 text-slate-500">{new Date(order.createdAt || Date.now()).toLocaleString()}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onReorderOrder(order.id)}
            disabled={orderActionState.reorderingId === order.id}
            className="rounded-full border border-slate-200 px-6 py-3 text-xs font-black uppercase tracking-[0.22em] text-slate-700 disabled:opacity-50"
          >
            {orderActionState.reorderingId === order.id ? 'Adding to cart...' : 'Buy again'}
          </button>
          {canCancelOrder(order) ? (
            <button
              type="button"
              onClick={() => onCancelOrder(order.id)}
              disabled={orderActionState.cancellingId === order.id}
              className="rounded-full border border-rose-200 px-6 py-3 text-xs font-black uppercase tracking-[0.22em] text-rose-600 disabled:opacity-50"
            >
              {orderActionState.cancellingId === order.id ? 'Cancelling...' : 'Cancel order'}
            </button>
          ) : null}
          <button type="button" onClick={() => onNavigate('/account')} className="rounded-full border border-slate-200 px-6 py-3 text-xs font-black uppercase tracking-[0.22em] text-slate-700">
            Back to account
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-5 rounded-[2.25rem] border border-slate-200 bg-white p-8">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Items</p>
          {order.items.map((item, index) => (
            <div key={`${item.productId}-${index}`} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="font-black text-slate-950">{item.productName}</p>
                <p className="text-sm text-slate-500">{item.productCategory} x {item.quantity}</p>
              </div>
              <p className="font-semibold text-slate-950">{currency(item.totalPrice)}</p>
            </div>
          ))}
        </div>

        <div className="space-y-5 rounded-[2.25rem] bg-slate-950 p-8 text-white">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Summary</p>
            <div className="mt-5 space-y-3">
              <SummaryRow label="Status" value={order.status} />
              <SummaryRow label="Payment" value={order.paymentMethod} />
              <SummaryRow label="Subtotal" value={currency(order.subtotal)} />
              <SummaryRow label="Shipping" value={order.shipping === 0 ? 'Free' : currency(order.shipping)} />
              <SummaryRow label="Total" value={currency(order.total)} emphasis />
            </div>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Shipping</p>
            <div className="mt-4 space-y-1 text-sm text-slate-200">
              <p>{order.shippingDetails.recipient}</p>
              <p>{order.shippingDetails.phone}</p>
              <p>{order.shippingDetails.addressLine1}</p>
              {order.shippingDetails.addressLine2 ? <p>{order.shippingDetails.addressLine2}</p> : null}
              <p>{[order.shippingDetails.city, order.shippingDetails.state, order.shippingDetails.postalCode].filter(Boolean).join(', ')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginPage({ onAuth, onRequestPasswordReset, onNavigate, loading }) {
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      if (mode === 'forgot') {
        await onRequestPasswordReset(form.email);
        setMode('login');
        return;
      }
      await onAuth({ ...form, isLogin: mode === 'login' });
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="mx-auto flex max-w-xl items-center justify-center px-4 py-24">
      <div className="w-full rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-[0_25px_80px_-45px_rgba(15,23,42,0.35)]">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-600">{mode === 'forgot' ? 'Password reset' : 'Account access'}</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">{mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create account' : 'Reset password'}</h1>
        <p className="mt-3 text-slate-500">
          {mode === 'forgot'
            ? 'Enter your email and we will send a reset link.'
            : 'Use the updated auth flow to sign in, register, and reach protected customer routes.'}
        </p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          {mode === 'register' ? <Field label="Name" value={form.name} onChange={(value) => setForm((prev) => ({ ...prev, name: value }))} /> : null}
          <Field label="Email" value={form.email} onChange={(value) => setForm((prev) => ({ ...prev, email: value }))} />
          {mode !== 'forgot' ? <Field label="Password" value={form.password} onChange={(value) => setForm((prev) => ({ ...prev, password: value }))} /> : null}
          {error ? <p className="text-sm font-semibold text-rose-500">{error}</p> : null}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-slate-950 px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-white disabled:opacity-50">
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Send reset link'}
          </button>
        </form>
        <div className="mt-6 flex flex-wrap gap-4 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
          <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Create account' : 'Have an account?'}
          </button>
          <button type="button" onClick={() => setMode('forgot')}>Forgot password</button>
          <button type="button" onClick={() => onNavigate('/')}>Back home</button>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordPage({ recoveryTokens, onResetPassword, onNavigate, loading }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await onResetPassword({ ...recoveryTokens, password });
      setMessage('Password updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update password');
    }
  };

  return (
    <div className="mx-auto flex max-w-xl items-center justify-center px-4 py-24">
      <div className="w-full rounded-[2.5rem] border border-slate-200 bg-white p-10">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-600">Password reset</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Set a new password</h1>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <Field label="New password" value={password} onChange={setPassword} />
          <Field label="Confirm password" value={confirmPassword} onChange={setConfirmPassword} />
          {message ? <p className="text-sm font-semibold text-emerald-600">{message}</p> : null}
          {error ? <p className="text-sm font-semibold text-rose-500">{error}</p> : null}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-slate-950 px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-white">
            Update password
          </button>
        </form>
        <button type="button" onClick={() => onNavigate('/login')} className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-sky-600">
          Back to login
        </button>
      </div>
    </div>
  );
}

function AdminPage({ users, orders, products, onRefresh, onCreateProduct, onUpdateOrder, onDeleteOrder, onUpdateUser, onDeleteUser }) {
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Electronics',
    price: '99.99',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    shortDescription: 'New featured product for the storefront.',
    description: 'New featured product for the storefront.',
    inventoryCount: '25'
  });

  const submitProduct = async (event) => {
    event.preventDefault();
    await onCreateProduct({
      ...productForm,
      price: Number(productForm.price),
      inventoryCount: Number(productForm.inventoryCount),
      isFeatured: true,
      gallery: [productForm.image]
    });
    setProductForm((prev) => ({ ...prev, name: '' }));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-14 sm:px-6 lg:px-8">
      <SectionTitle eyebrow="Admin" title="Commerce operations" description="A lighter admin surface stays available so the new product fields and order statuses can still be exercised." action={<button type="button" onClick={onRefresh} className="rounded-full border border-slate-200 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-slate-700">Refresh</button>} />
      <div className="grid gap-8 lg:grid-cols-3">
        <AdminPanel title="Users">
          {users.map((item) => (
            <div key={item.id} className="space-y-3 rounded-[1.5rem] border border-slate-200 p-4">
              <div>
                <p className="font-black text-slate-950">{item.name}</p>
                <p className="text-sm text-slate-500">{item.email}</p>
              </div>
              <div className="flex gap-3">
                <select defaultValue={item.role} onChange={(event) => onUpdateUser(item.id, { role: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-xs">
                  <option>Customer</option>
                  <option>Manager</option>
                  <option>Admin</option>
                </select>
                <select defaultValue={item.status} onChange={(event) => onUpdateUser(item.id, { status: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-xs">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              <button type="button" onClick={() => onDeleteUser(item.id)} className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">
                Delete
              </button>
            </div>
          ))}
        </AdminPanel>

        <AdminPanel title="Orders">
          {orders.map((item) => (
            <div key={item.id} className="space-y-3 rounded-[1.5rem] border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-black text-slate-950">{item.id}</p>
                <p className="text-sm font-semibold text-slate-500">{currency(item.total)}</p>
              </div>
              <p className="text-sm text-slate-500">{item.customer}</p>
              <div className="flex gap-3">
                <select defaultValue={item.status} onChange={(event) => onUpdateOrder(item.id, { status: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-xs">
                  <option>Processing</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
                <button type="button" onClick={() => onDeleteOrder(item.id)} className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </AdminPanel>

        <AdminPanel title="Create featured product">
          <form onSubmit={submitProduct} className="space-y-3">
            <Field label="Name" value={productForm.name} onChange={(value) => setProductForm((prev) => ({ ...prev, name: value }))} />
            <Field label="Category" value={productForm.category} onChange={(value) => setProductForm((prev) => ({ ...prev, category: value }))} />
            <Field label="Price" value={productForm.price} onChange={(value) => setProductForm((prev) => ({ ...prev, price: value }))} />
            <Field label="Image URL" value={productForm.image} onChange={(value) => setProductForm((prev) => ({ ...prev, image: value }))} />
            <Field label="Short description" value={productForm.shortDescription} onChange={(value) => setProductForm((prev) => ({ ...prev, shortDescription: value, description: value }))} />
            <Field label="Inventory count" value={productForm.inventoryCount} onChange={(value) => setProductForm((prev) => ({ ...prev, inventoryCount: value }))} />
            <button type="submit" className="rounded-full bg-slate-950 px-6 py-3 text-xs font-black uppercase tracking-[0.22em] text-white">
              Create product
            </button>
          </form>
          <div className="mt-6 space-y-3">
            {products.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-[1.25rem] border border-slate-200 p-3 text-sm">
                <p className="font-black text-slate-950">{item.name}</p>
                <p className="text-slate-500">{item.category} · {currency(item.price)}</p>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}

function AdminPanel({ title, children }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.25)]">
      <p className="mb-5 text-xs font-black uppercase tracking-[0.22em] text-slate-400">{title}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function RequireAuth({ user, authReady, onNavigate, children }) {
  useEffect(() => {
    if (authReady && !user) onNavigate(loginUrlWithRedirect(`${window.location.pathname}${window.location.search}`), { replace: true });
  }, [authReady, user, onNavigate]);
  if (!authReady) {
    return <div className="mx-auto max-w-3xl px-4 py-24 text-center text-slate-500">Checking session...</div>;
  }
  if (!user) {
    return <div className="mx-auto max-w-3xl px-4 py-24 text-center text-slate-500">Redirecting to login...</div>;
  }
  return children;
}

export default function StorefrontApp() {
  const [route, setRoute] = useState(() => parseRoute());
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('lumina_access_token') || '');
  const [recoveryTokens, setRecoveryTokens] = useState(null);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [categories, setCategories] = useState(['All']);
  const [shopState, setShopState] = useState({ items: [], page: 1, limit: 12, totalPages: 1, totalItems: 0, filters: { search: '', category: 'All', minPrice: '', maxPrice: '', sort: 'featured' } });
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartSummary, setCartSummary] = useState({ subtotal: 0, shipping: 0, total: 0, itemCount: 0 });
  const [orders, setOrders] = useState([]);
  const [orderDetail, setOrderDetail] = useState(null);
  const [productDetail, setProductDetail] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [productQuantity, setProductQuantity] = useState(1);
  const [toast, setToast] = useState('');
  const [loadingShop, setLoadingShop] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [passwordState, setPasswordState] = useState({ message: '', error: '' });
  const [orderActionState, setOrderActionState] = useState({ cancellingId: null, reorderingId: null });
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0), [cart]);
  const isLegacyAdminRoute = route.pathname === '/admin';

  const navigate = (path, options = {}) => {
    if (options.replace) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }
    setRoute(parseRoute());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const apiRequest = async (path, options = {}) => {
    const { method = 'GET', body, token = authToken } = options;
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    if (!response.ok) {
      throw new Error(data?.error || 'Request failed');
    }
    return data;
  };

  const fetchCategories = async () => {
    const data = await apiRequest('/products/categories', { token: '' });
    setCategories(Array.isArray(data.items) && data.items.length ? data.items : ['All']);
  };

  const fetchFeatured = async () => {
    const data = await apiRequest('/products?sort=featured&limit=8', { token: '' });
    const items = (data.items || []).map(normalizeProduct);
    setFeaturedProducts(items.filter((item) => item.isFeatured).length ? items.filter((item) => item.isFeatured).slice(0, 4) : items.slice(0, 4));
  };

  const fetchShop = async () => {
    const current = parseRoute();
    const filters = {
      search: current.search.get('search') || '',
      category: current.search.get('category') || 'All',
      minPrice: current.search.get('minPrice') || '',
      maxPrice: current.search.get('maxPrice') || '',
      sort: current.search.get('sort') || 'featured'
    };
    const page = Math.max(Number(current.search.get('page') || 1), 1);
    const params = new URLSearchParams();
    Object.entries({ ...filters, page: String(page), limit: '12' }).forEach(([key, value]) => {
      if (value && value !== 'All') params.set(key, value);
      if (key === 'category' && value === 'All') return;
    });
    if (!params.has('page')) params.set('page', String(page));
    if (!params.has('limit')) params.set('limit', '12');
    setLoadingShop(true);
    try {
      const data = await apiRequest(`/products?${params.toString()}`, { token: '' });
      setShopState({
        items: (data.items || []).map(normalizeProduct),
        page: Number(data.page || page),
        limit: Number(data.limit || 12),
        totalPages: Number(data.totalPages || 1),
        totalItems: Number(data.totalItems || 0),
        filters
      });
    } finally {
      setLoadingShop(false);
    }
  };

  const fetchCart = async (token = authToken) => {
    if (!token) {
      setCart([]);
      setCartSummary({ subtotal: 0, shipping: 0, total: 0, itemCount: 0 });
      return;
    }
    const data = await apiRequest('/cart', { token });
    setCart((data.items || []).map(normalizeProduct).map((item, index) => ({ ...item, ...(data.items || [])[index] })));
    setCartSummary(data.summary || { subtotal: 0, shipping: 0, total: 0, itemCount: 0 });
  };

  const fetchOrders = async (token = authToken) => {
    if (!token) {
      setOrders([]);
      return;
    }
    const data = await apiRequest('/orders', { token });
    setOrders((data.items || []).map(normalizeOrder));
  };

  const fetchAdmin = async (token = authToken) => {
    if (!token) return;
    const [usersData, ordersData] = await Promise.all([
      apiRequest('/admin/users', { token }),
      apiRequest('/admin/orders', { token })
    ]);
    setAdminUsers(usersData.items || []);
    setAdminOrders(ordersData.items || []);
  };

  useEffect(() => {
    const syncRoute = () => setRoute(parseRoute());
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const query = new URLSearchParams(window.location.search);
    const accessToken = hash.get('access_token') || '';
    const refreshToken = hash.get('refresh_token') || '';
    const recoveryType = hash.get('type') || query.get('type') || '';
    if (accessToken && refreshToken) {
      setRecoveryTokens({ accessToken, refreshToken });
      navigate('/reset-password?reset_password=1', { replace: true });
    } else if (query.get('reset_password') === '1' || recoveryType === 'recovery') {
      navigate('/reset-password?reset_password=1', { replace: true });
    }
  }, []);

  useEffect(() => {
    fetchCategories().catch((err) => setToast(err.message));
    fetchFeatured().catch((err) => setToast(err.message));
  }, []);

  useEffect(() => {
    const bootstrapUser = async () => {
      if (!authToken) {
        setUser(null);
        await fetchCart('');
        await fetchOrders('');
        setAuthReady(true);
        return;
      }
      try {
        const data = await apiRequest('/auth/me', { token: authToken });
        setUser(data.user);
        const results = await Promise.allSettled([fetchCart(authToken), fetchOrders(authToken)]);
        const failed = results.find((result) => result.status === 'rejected');
        if (failed && failed.reason) {
          setToast(failed.reason.message || 'Some account data could not be loaded');
        }
        if (data.user?.role === 'Admin') {
          try {
            await fetchAdmin(authToken);
          } catch (err) {
            setToast(err.message || 'Admin data could not be loaded');
          }
        }
      } catch {
        localStorage.removeItem('lumina_access_token');
        setAuthToken('');
        setUser(null);
      } finally {
        setAuthReady(true);
      }
    };
    setAuthReady(false);
    bootstrapUser().catch((err) => setToast(err.message || 'Failed to load session'));
  }, [authToken]);

  useEffect(() => {
    if (route.pathname === '/shop') {
      fetchShop().catch((err) => setToast(err.message));
    }
    if (route.pathname.startsWith('/product/')) {
      const productId = parseProductIdFromPath(route.pathname);
      if (!productId) return;
      Promise.all([
        apiRequest(`/products/${productId}`, { token: '' }),
        apiRequest(`/products/${productId}/related`, { token: '' })
      ])
        .then(([productData, relatedData]) => {
          setProductDetail(normalizeProduct(productData));
          setRelatedProducts((relatedData.items || []).map(normalizeProduct));
          setProductQuantity(1);
        })
        .catch((err) => setToast(err.message));
    }
    if (route.pathname.startsWith('/orders/')) {
      const orderId = parseOrderIdFromPath(route.pathname);
      if (!orderId || !authToken) return;
      apiRequest(`/orders/${orderId}`, { token: authToken })
        .then((data) => setOrderDetail(normalizeOrder(data)))
        .catch((err) => setToast(err.message));
    }
    if (route.pathname === '/admin' && user?.role === 'Admin' && authToken) {
      fetchAdmin(authToken).catch((err) => setToast(err.message));
    }
  }, [route.pathname, window.location.search, user?.role, authToken]);

  const applyShopFilters = (updates) => {
    const current = parseRoute();
    const params = new URLSearchParams(current.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === undefined || value === null || value === 'All') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    navigate(`/shop${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const addToCart = async (product, quantity) => {
    if (!authToken) {
      navigate('/login');
      setToast('Please sign in to add items to cart');
      return;
    }
    const data = await apiRequest('/cart/items', {
      method: 'POST',
      body: { productId: product.id, quantity }
    });
    setCart((data.items || []).map(normalizeProduct).map((item, index) => ({ ...item, ...(data.items || [])[index] })));
    setCartSummary(data.summary || cartSummary);
    setToast(`${product.name} added to cart`);
  };

  const updateCartQty = async (id, quantity) => {
    const data = await apiRequest(`/cart/items/${id}`, { method: 'PATCH', body: { quantity } });
    setCart((data.items || []).map(normalizeProduct).map((item, index) => ({ ...item, ...(data.items || [])[index] })));
    setCartSummary(data.summary || cartSummary);
  };

  const removeFromCart = async (id) => {
    const data = await apiRequest(`/cart/items/${id}`, { method: 'DELETE' });
    setCart((data.items || []).map(normalizeProduct).map((item, index) => ({ ...item, ...(data.items || [])[index] })));
    setCartSummary(data.summary || cartSummary);
  };

  const handleAuth = async ({ email, password, name, isLogin }) => {
    setLoadingAuth(true);
    try {
      let data = await apiRequest(isLogin ? '/auth/login' : '/auth/register', {
        method: 'POST',
        body: isLogin ? { email, password } : { email, password, name },
        token: ''
      });
      let token = data?.session?.access_token || data?.session?.token || '';
      if (!token && !isLogin) {
        data = await apiRequest('/auth/login', { method: 'POST', body: { email, password }, token: '' });
        token = data?.session?.access_token || data?.session?.token || '';
      }
      if (!token) throw new Error('Authentication succeeded but no session token was returned.');
      localStorage.setItem('lumina_access_token', token);
      setAuthToken(token);
      setUser(data.user);
      const redirectTarget = parseRoute().search.get('redirect') || (data.user?.role === 'Admin' ? '/admin' : '/account');
      navigate(redirectTarget);
      setToast(isLogin ? 'Logged in successfully' : 'Account created');
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (authToken) await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore logout failures while clearing local state.
    }
    localStorage.removeItem('lumina_access_token');
    setAuthToken('');
    setUser(null);
    setOrders([]);
    setCart([]);
    setCartSummary({ subtotal: 0, shipping: 0, total: 0, itemCount: 0 });
    navigate('/');
  };

  const handlePasswordResetRequest = async (email) => {
    await apiRequest('/auth/password-reset', {
      method: 'POST',
      body: { email, redirectTo: PASSWORD_RESET_REDIRECT_URL },
      token: ''
    });
    setToast('If the account exists, a reset email has been sent');
  };

  const handlePasswordChange = async ({ oldPassword, newPassword }) => {
    setPasswordState({ message: '', error: '' });
    try {
      await apiRequest('/auth/password-change', { method: 'POST', body: { oldPassword, newPassword } });
      setPasswordState({ message: 'Password updated successfully.', error: '' });
    } catch (err) {
      setPasswordState({ message: '', error: err.message || 'Failed to update password' });
    }
  };

  const handlePasswordResetConfirm = async ({ accessToken, refreshToken, password }) => {
    await apiRequest('/auth/password-reset/confirm', {
      method: 'POST',
      body: { accessToken, refreshToken, password },
      token: ''
    });
    setRecoveryTokens(null);
    setToast('Password updated. Please sign in.');
    navigate('/login', { replace: true });
  };

  const handleCheckout = async (payload) => {
    setCheckoutError('');
    setLoadingCheckout(true);
    try {
      const data = await apiRequest('/orders/checkout', { method: 'POST', body: payload });
      await Promise.all([fetchCart(authToken), fetchOrders(authToken)]);
      const order = normalizeOrder(data.order);
      setOrderDetail(order);
      navigate(`/orders/${order.id}?placed=1`);
    } catch (err) {
      setCheckoutError(err.message || 'Checkout failed');
    } finally {
      setLoadingCheckout(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    setOrderActionState((prev) => ({ ...prev, cancellingId: orderId }));
    try {
      const data = await apiRequest(`/orders/${orderId}`, { method: 'PATCH', body: { action: 'cancel' } });
      const updated = normalizeOrder(data.order);
      setOrders((prev) => prev.map((item) => (item.id === orderId ? updated : item)));
      setOrderDetail((prev) => (prev?.id === orderId ? { ...prev, ...updated } : prev));
      setToast(`Order #${orderId} cancelled`);
    } finally {
      setOrderActionState((prev) => ({ ...prev, cancellingId: null }));
    }
  };

  const handleReorderOrder = async (orderId) => {
    setOrderActionState((prev) => ({ ...prev, reorderingId: orderId }));
    try {
      await apiRequest(`/orders/${orderId}/reorder`, { method: 'POST', body: {} });
      await fetchCart(authToken);
      setToast(`Order #${orderId} added to cart`);
      navigate('/cart');
    } finally {
      setOrderActionState((prev) => ({ ...prev, reorderingId: null }));
    }
  };

  const handleCreateProduct = async (payload) => {
    const data = await apiRequest('/admin/products', { method: 'POST', body: payload });
    setFeaturedProducts((prev) => [normalizeProduct(data.product), ...prev].slice(0, 4));
    await fetchShop().catch(() => {});
    setToast('Product created');
  };

  const handleUpdateOrder = async (orderId, updates) => {
    await apiRequest(`/admin/orders/${encodeURIComponent(orderId)}`, { method: 'PATCH', body: updates });
    await fetchAdmin(authToken);
  };

  const handleDeleteOrder = async (orderId) => {
    await apiRequest(`/admin/orders/${encodeURIComponent(orderId)}`, { method: 'DELETE' });
    await fetchAdmin(authToken);
  };

  const handleUpdateUser = async (userId, updates) => {
    await apiRequest(`/admin/users/${userId}`, { method: 'PATCH', body: updates });
    await fetchAdmin(authToken);
  };

  const handleDeleteUser = async (userId) => {
    await apiRequest(`/admin/users/${userId}`, { method: 'DELETE' });
    await fetchAdmin(authToken);
  };

  let content = <HomePage featuredProducts={featuredProducts} categories={categories} onNavigate={navigate} />;

  if (route.pathname === '/shop') {
    content = <ShopPage state={shopState} categories={categories} loading={loadingShop} onNavigate={navigate} onApplyFilters={applyShopFilters} onAddToCart={addToCart} />;
  } else if (route.pathname.startsWith('/product/')) {
    content = productDetail ? <ProductDetailPage product={productDetail} relatedProducts={relatedProducts} quantity={productQuantity} setQuantity={setProductQuantity} onAddToCart={addToCart} onNavigate={navigate} /> : <div className="py-24 text-center text-slate-500">Loading product...</div>;
  } else if (route.pathname === '/cart') {
    content = <CartPage items={cart} summary={cartSummary} onNavigate={navigate} onUpdateQty={updateCartQty} onRemove={removeFromCart} />;
  } else if (route.pathname === '/checkout') {
    content = (
      <RequireAuth user={user} authReady={authReady} onNavigate={navigate}>
        <CheckoutPage cart={cart} summary={cartSummary} onSubmit={handleCheckout} submitting={loadingCheckout} error={checkoutError} />
      </RequireAuth>
    );
  } else if (route.pathname === '/account') {
    content = (
      <RequireAuth user={user} authReady={authReady} onNavigate={navigate}>
        <AccountPage
          user={user}
          orders={orders}
          onNavigate={navigate}
          onLogout={handleLogout}
          onChangePassword={handlePasswordChange}
          passwordState={passwordState}
          onCancelOrder={handleCancelOrder}
          onReorderOrder={handleReorderOrder}
          orderActionState={orderActionState}
        />
      </RequireAuth>
    );
  } else if (route.pathname.startsWith('/orders/')) {
    content = (
      <RequireAuth user={user} authReady={authReady} onNavigate={navigate}>
        <OrderDetailPage
          order={orderDetail}
          onNavigate={navigate}
          onCancelOrder={handleCancelOrder}
          onReorderOrder={handleReorderOrder}
          orderActionState={orderActionState}
        />
      </RequireAuth>
    );
  } else if (route.pathname === '/login') {
    content = <LoginPage onAuth={handleAuth} onRequestPasswordReset={handlePasswordResetRequest} onNavigate={navigate} loading={loadingAuth} />;
  } else if (route.pathname === '/reset-password') {
    content = <ResetPasswordPage recoveryTokens={recoveryTokens || {}} onResetPassword={handlePasswordResetConfirm} onNavigate={navigate} loading={loadingAuth} />;
  } else if (route.pathname === '/admin') {
    content = (
      <RequireAuth user={user} authReady={authReady} onNavigate={navigate}>
        {user?.role === 'Admin' ? (
          <LegacyApp initialPage="admin" embedded />
        ) : (
          <div className="py-24 text-center text-slate-500">Admin access required.</div>
        )}
      </RequireAuth>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {!isLegacyAdminRoute ? <NavBar cartCount={cartCount} user={user} onNavigate={navigate} onLogout={handleLogout} /> : null}
      {route.pathname === '/admin' && user?.role === 'Admin' ? (
        <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/97 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex rounded-full bg-slate-950 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-white">
                Admin workspace
              </span>
              <span className="text-xs font-semibold text-slate-500">Use the controls below to leave or sign out.</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-slate-600 transition hover:border-sky-200 hover:text-sky-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to store
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-slate-600 transition hover:border-rose-200 hover:text-rose-600"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <main>{content}</main>
      {toast && !isLegacyAdminRoute ? (
        <div className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-slate-950 px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      ) : null}
      {!isLegacyAdminRoute ? <Footer /> : null}
    </div>
  );
}
