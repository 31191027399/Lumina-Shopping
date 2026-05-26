import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  ShoppingBag, 
  Search, 
  User, 
  Menu, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Filter,
  ChevronRight,
  CreditCard,
  Truck,
  ShieldCheck,
  Facebook,
  Instagram,
  Twitter,
  Settings,
  Package,
  Heart,
  LogOut,
  LayoutDashboard,
  Users as UsersIcon,
  BarChart3,
  MoreVertical,
  Clock,
  ArrowUpRight,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Edit,
  Save,
  Copy,
  KeyRound,
  Info
} from 'lucide-react';

const DEFAULT_CATEGORIES = ["All"];
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:54321/functions/v1/api' : '/api');
const FRONTEND_ORIGIN =
  import.meta.env.VITE_FRONTEND_ORIGIN ||
  (import.meta.env.DEV ? 'http://localhost:5173' : window.location.origin);
const PASSWORD_RESET_REDIRECT_URL =
  import.meta.env.VITE_PASSWORD_RESET_REDIRECT_URL ||
  `${FRONTEND_ORIGIN}/?reset_password=1`;
const INTEGRATION_SCOPE_OPTIONS = [
  { id: 'read:catalog', label: 'Read catalog' },
  { id: 'read:orders', label: 'Read orders' },
  { id: 'read:users', label: 'Read users' },
  { id: 'write:cart', label: 'Write cart' },
  { id: 'write:checkout', label: 'Write checkout' }
];
const toKebab = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';

// --- Helper Modal Component ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return createPortal(
    <div data-testid="fra-modal-overlay" className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div data-testid="fra-modal-content" className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
          <h3 data-testid="txt-modal-title" className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest text-xs">{title}</h3>
          <button data-testid="btn-modal-close" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div data-testid="fra-modal-body" className="p-8">{children}</div>
      </div>
    </div>,
    document.body
  );
};

// --- Shared Components ---

const Navbar = ({ cartCount, onNavigate, currentPage, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAdmin = user?.role === 'Admin';
  const navigateTo = (page) => {
    setIsMenuOpen(false);
    onNavigate(page);
  };

  const navLinks = [
    { name: 'home', label: 'Home' },
    { name: 'shop', label: 'Shop' },
    ...(isAdmin ? [{ name: 'admin', label: 'Admin' }] : []),
  ];

  return (
    <nav data-testid="fra-navbar-main" className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8 flex-shrink-0">
            <button 
              type="button"
              data-testid="btn-nav-home-logo"
              onClick={() => navigateTo('home')}
              className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"
            >
              LUMINA
            </button>
            <div data-testid="fra-nav-desktop-links" className="hidden md:flex items-center gap-6 flex-shrink-0">
              {navLinks.map((link) => (
                <button
                  type="button"
                  key={link.name}
                  data-testid={`btn-nav-${toKebab(link.name)}`}
                  aria-label={`Navigate to ${link.label}`}
                  aria-current={currentPage === link.name ? 'page' : undefined}
                  onClick={() => navigateTo(link.name)}
                  className={`relative z-10 px-1 py-2 text-sm font-bold transition-colors uppercase tracking-widest ${
                    currentPage === link.name ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 min-w-0">
            <div className="hidden sm:flex items-center relative">
              <input 
                data-testid="txt-nav-search-products"
                type="text" 
                placeholder="Search products..." 
                className="pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 lg:w-64"
              />
              <Search size={18} className="absolute left-3 text-gray-400 pointer-events-none" />
            </div>
            
            <button 
              type="button"
              data-testid="btn-nav-profile"
              onClick={() => navigateTo(user ? 'profile' : 'login')}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-600 relative group"
              title={user ? "Profile" : "Login"}
            >
              <User size={22} />
              {user && <span data-testid="txt-nav-user-indicator" className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-500 border-2 border-white rounded-full"></span>}
            </button>

            <button 
              type="button"
              data-testid="btn-nav-cart"
              onClick={() => navigateTo('cart')}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-600 relative"
              title="Cart"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span data-testid="txt-nav-cart-count" className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

            <button type="button" data-testid="btn-nav-mobile-menu" className="md:hidden p-2 text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div data-testid="fra-nav-mobile-menu" className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-xl">
          <button type="button" data-testid="btn-nav-mobile-home" onClick={() => navigateTo('home')} className="block w-full text-left py-2 text-gray-600 font-medium tracking-widest uppercase text-xs">Home</button>
          <button type="button" data-testid="btn-nav-mobile-shop" onClick={() => navigateTo('shop')} className="block w-full text-left py-2 text-gray-600 font-medium tracking-widest uppercase text-xs">Shop</button>
          {isAdmin && <button type="button" data-testid="btn-nav-mobile-admin" onClick={() => navigateTo('admin')} className="block w-full text-left py-2 text-indigo-600 font-bold tracking-widest uppercase text-xs">Admin</button>}
          <div className="pt-4 border-t border-gray-100">
            {user ? (
              <div className="space-y-4">
                <button type="button" data-testid="btn-nav-mobile-profile" onClick={() => navigateTo('profile')} className="block w-full text-left text-gray-600 font-medium">My Profile</button>
                <button type="button" data-testid="btn-nav-mobile-logout" onClick={() => {onLogout(); setIsMenuOpen(false);}} className="text-red-500 font-bold">Logout</button>
              </div>
            ) : (
              <button type="button" data-testid="btn-nav-mobile-sign-in" onClick={() => navigateTo('login')} className="text-indigo-600 font-bold">Sign In</button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer = () => (
  <footer data-testid="fra-footer-main" className="bg-gray-900 text-gray-400 py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="space-y-6">
        <h3 data-testid="txt-footer-brand-title" className="text-white text-2xl font-bold tracking-tight">LUMINA</h3>
        <p data-testid="txt-footer-brand-description" className="text-sm leading-relaxed">
          Crafting premium essentials for the modern lifestyle. Quality and design at the core of everything we do.
        </p>
        <div className="flex gap-5">
          <Facebook size={20} className="hover:text-white cursor-pointer transition-colors" />
          <Instagram size={20} className="hover:text-white cursor-pointer transition-colors" />
          <Twitter size={20} className="hover:text-white cursor-pointer transition-colors" />
        </div>
      </div>
      <div>
        <h4 data-testid="txt-footer-shop-title" className="text-white font-bold mb-6">Shop</h4>
        <ul className="space-y-3 text-sm">
          <li className="hover:text-white cursor-pointer transition-colors">New Arrivals</li>
          <li className="hover:text-white cursor-pointer transition-colors">Best Sellers</li>
          <li className="hover:text-white cursor-pointer transition-colors">Gift Cards</li>
          <li className="hover:text-white cursor-pointer transition-colors">Sale</li>
        </ul>
      </div>
      <div>
        <h4 data-testid="txt-footer-support-title" className="text-white font-bold mb-6">Support</h4>
        <ul className="space-y-3 text-sm">
          <li className="hover:text-white cursor-pointer transition-colors">Order Tracking</li>
          <li className="hover:text-white cursor-pointer transition-colors">Returns</li>
          <li className="hover:text-white cursor-pointer transition-colors">Contact Us</li>
          <li className="hover:text-white cursor-pointer transition-colors">Shipping Info</li>
        </ul>
      </div>
      <div>
        <h4 data-testid="txt-footer-newsletter-title" className="text-white font-bold mb-6">Newsletter</h4>
        <p data-testid="txt-footer-newsletter-description" className="text-sm mb-4">Get the latest updates on new collections and special offers.</p>
        <div className="flex bg-gray-800 rounded-xl p-1">
          <input data-testid="txt-footer-newsletter-email" type="email" placeholder="Your email" className="bg-transparent border-none px-4 py-2 text-sm w-full focus:ring-0 text-white" />
          <button data-testid="btn-footer-newsletter-join" className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-bold">
            Join
          </button>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
      <p data-testid="txt-footer-copyright">&copy; 2024 Lumina Retail Group. All rights reserved.</p>
      <div className="flex gap-6">
        <span data-testid="txt-footer-privacy-policy" className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
        <span data-testid="txt-footer-terms-of-service" className="cursor-pointer hover:text-white transition-colors">Terms of Service</span>
      </div>
    </div>
  </footer>
);

// --- View Components ---

const Home = ({ onNavigate, topCategories }) => (
  <div className="space-y-24">
    {/* Hero Section */}
    <section data-testid="fra-home-hero" className="relative h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          data-testid="img-home-hero-background"
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80" 
          className="w-full h-full object-cover brightness-[0.4]"
          alt="Hero background"
        />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
          <span data-testid="txt-home-hero-badge" className="inline-block px-4 py-1.5 bg-indigo-600 text-xs font-bold tracking-[0.2em] uppercase rounded-full leading-none">Summer 2024</span>
          <h1 data-testid="txt-home-hero-title" className="text-6xl md:text-8xl font-black leading-[1.1]">
            Define Your <br /> Essentials.
          </h1>
          <p data-testid="txt-home-hero-description" className="text-xl text-gray-300 leading-relaxed">
            Minimalist aesthetics meet premium functionality. Explore the curated collection for those who appreciate the details.
          </p>
          <div className="flex flex-wrap gap-5 pt-4">
            <button 
              data-testid="btn-home-explore-collection"
              onClick={() => onNavigate('shop')}
              className="bg-white text-gray-900 px-10 py-5 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center gap-3 group text-lg shadow-2xl shadow-white/10"
            >
              Explore Collection <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>

    {/* Featured Categories */}
    <section data-testid="fra-home-top-categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div className="space-y-2">
          <h2 data-testid="txt-home-top-categories-title" className="text-4xl font-black text-gray-900 tracking-tight">Top Categories</h2>
          <p data-testid="txt-home-top-categories-description" className="text-gray-500 text-lg">Curated collections for every lifestyle.</p>
        </div>
        <button data-testid="btn-home-browse-all-products" onClick={() => onNavigate('shop')} className="px-6 py-3 border-2 border-gray-100 rounded-2xl font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all">
          Browse All Products
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {topCategories.map((cat) => (
          <div key={cat.name} data-testid={`fra-home-category-card-${toKebab(cat.name)}`} className="group relative h-80 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl transition-transform hover:-translate-y-2" onClick={() => onNavigate('shop')}>
            <img data-testid={`img-home-category-${toKebab(cat.name)}`} src={cat.img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-8 left-8 text-white">
              <h3 data-testid={`txt-home-category-name-${toKebab(cat.name)}`} className="text-3xl font-black mb-1 leading-none">{cat.name}</h3>
              <p data-testid={`txt-home-category-count-${toKebab(cat.name)}`} className="text-sm font-medium opacity-80">{cat.count} Products</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

const Shop = ({ onAddToCart, onProductClick, products, categories }) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");

  const filteredProducts = useMemo(() => {
    let result = activeCategory === "All" 
      ? products 
      : products.filter(p => p.category === activeCategory);
    
    if (sortBy === "price-low") result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === "rating") result = [...result].sort((a, b) => b.rating - a.rating);
    
    return result;
  }, [activeCategory, sortBy, products]);

  return (
    <div data-testid="fra-shop-main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
        <div>
          <h1 data-testid="txt-shop-title" className="text-5xl font-black text-gray-900 tracking-tight">Catalog</h1>
          <p data-testid="txt-shop-description" className="text-gray-500 mt-2 text-lg">Browse our latest collection of premium products.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="relative group">
            <div className="flex items-center gap-3 bg-white border-2 border-gray-100 px-6 py-3 rounded-2xl hover:border-indigo-600 transition-all cursor-pointer">
              <Filter size={18} className="text-gray-400 group-hover:text-indigo-600" />
              <select 
                data-testid="cbo-shop-sort-products"
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm font-bold bg-transparent focus:outline-none cursor-pointer appearance-none pr-6"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Lowest Price</option>
                <option value="price-high">Highest Price</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-12 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            data-testid={`btn-shop-filter-category-${toKebab(cat)}`}
            onClick={() => setActiveCategory(cat)}
            className={`px-8 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all uppercase tracking-widest ${
              activeCategory === cat 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'bg-white text-gray-500 border-2 border-gray-50 hover:border-indigo-100 hover:text-gray-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {filteredProducts.map(product => (
          <div key={product.id} data-testid={`fra-shop-product-card-${toKebab(product.id)}`} className="group flex flex-col h-full bg-white rounded-[2rem] border-2 border-gray-50 overflow-hidden hover:border-indigo-50 transition-all duration-300 hover:shadow-2xl">
            <div data-testid={`btn-shop-open-product-${toKebab(product.id)}`} className="relative h-72 overflow-hidden cursor-pointer" onClick={() => onProductClick(product)}>
              <img 
                data-testid={`img-shop-product-${toKebab(product.id)}`}
                src={product.image} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt={product.name}
              />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex justify-between items-center mb-2">
                <span data-testid={`txt-shop-product-category-${toKebab(product.id)}`} className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{product.category}</span>
                <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
                  <Star size={12} fill="currentColor" className="text-yellow-400" />
                  {product.rating}
                </div>
              </div>
              <h3 data-testid={`txt-shop-product-name-${toKebab(product.id)}`} className="font-bold text-gray-900 text-lg mb-2 leading-tight cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => onProductClick(product)}>
                {product.name}
              </h3>
              <p data-testid={`txt-shop-product-description-${toKebab(product.id)}`} className="text-gray-400 text-sm line-clamp-2 mb-6 flex-grow leading-relaxed">{product.description}</p>
              <div className="flex items-center justify-between mt-auto">
                <span data-testid={`txt-shop-product-price-${toKebab(product.id)}`} className="text-2xl font-black text-gray-900 tracking-tight">${product.price.toFixed(2)}</span>
                <button 
                  data-testid={`btn-shop-add-cart-${toKebab(product.id)}`}
                  onClick={() => onAddToCart(product)}
                  className="bg-gray-900 text-white p-3.5 rounded-2xl hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-200"
                >
                  <Plus size={22} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard = ({
  products,
  categories,
  users,
  orders,
  orderUpdateRequests = [],
  topCategoryLimit,
  platformApiKeyMeta,
  onSaveAppSettings,
  onGenerateApiKey,
  onRevokeApiKey,
  currentUserId,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onUpdateOrder,
  onDeleteOrder,
  onUpdateOrderUpdateRequest,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  onDataClear,
  onDataSeed,
  onNotify
}) => {
  const [activeTab, setActiveTab] = useState('statistics');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [editingItem, setEditingItem] = useState(null); // { type: 'user' | 'order' | 'product', data: object }
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Customer',
    status: 'Active'
  });
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: '',
    price: 0,
    image: '',
    rating: 4.5,
    reviews: 0,
    description: ''
  });
  const [createUserFeedback, setCreateUserFeedback] = useState({ type: '', text: '' });
  const [createProductFeedback, setCreateProductFeedback] = useState({ type: '', text: '' });
  const [isMutating, setIsMutating] = useState(false);
  const [dataControlLoading, setDataControlLoading] = useState(false);
  const [dataControlTargets, setDataControlTargets] = useState(['catalog']);
  const [seedCounts, setSeedCounts] = useState({ productCount: 8, categoryCount: 4, userCount: 6, orderCount: 12 });
  const [environmentLabel] = useState('Staging-01');
  const [pulseRange, setPulseRange] = useState('12d');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userSort, setUserSort] = useState('name-asc');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSort, setOrderSort] = useState('latest');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState('all');
  const [catalogSort, setCatalogSort] = useState('id-asc');
  const [requestSearch, setRequestSearch] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState('all');
  const [requestReviewDrafts, setRequestReviewDrafts] = useState({});
  const [appSettingsForm, setAppSettingsForm] = useState({ topCategoryLimit });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isMutatingApiKey, setIsMutatingApiKey] = useState(false);
  const [generatedApiKey, setGeneratedApiKey] = useState('');
  const [integrationScopeDraft, setIntegrationScopeDraft] = useState(platformApiKeyMeta?.scopes || []);

  useEffect(() => {
    setAppSettingsForm({ topCategoryLimit });
  }, [topCategoryLimit]);

  useEffect(() => {
    setIntegrationScopeDraft(platformApiKeyMeta?.scopes || []);
  }, [platformApiKeyMeta?.scopes]);

  const parseNumericId = (raw) => {
    const parsed = Number(String(raw ?? '').replace(/[^0-9]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const compareText = (left, right) =>
    String(left ?? '').localeCompare(String(right ?? ''), undefined, { sensitivity: 'base' });
  const compareNumber = (left, right) => Number(left ?? 0) - Number(right ?? 0);
  const getSortIcon = (currentSort, key) => {
    if (currentSort === `${key}-asc`) return <ChevronUp size={14} className="text-indigo-600" />;
    if (currentSort === `${key}-desc`) return <ChevronDown size={14} className="text-indigo-600" />;
    return <ArrowUpDown size={14} className="text-gray-300" />;
  };

  const visibleUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    const scoped = users.filter((item) => {
      const roleMatch = userRoleFilter === 'all' || (item.role || '').toLowerCase() === userRoleFilter;
      const statusMatch = userStatusFilter === 'all' || (item.status || '').toLowerCase() === userStatusFilter;
      const text = `${item.name || ''} ${item.email || ''}`.toLowerCase();
      const textMatch = !term || text.includes(term);
      return roleMatch && statusMatch && textMatch;
    });

    return [...scoped].sort((a, b) => {
      switch (userSort) {
        case 'name-desc':
          return compareText(b.name, a.name);
        case 'email-asc':
          return compareText(a.email, b.email);
        case 'email-desc':
          return compareText(b.email, a.email);
        case 'role-asc':
          return compareText(a.role, b.role);
        case 'role-desc':
          return compareText(b.role, a.role);
        case 'status-asc':
          return compareText(a.status, b.status);
        case 'status-desc':
          return compareText(b.status, a.status);
        case 'name-asc':
        default:
          return compareText(a.name, b.name);
      }
    });
  }, [users, userSearch, userRoleFilter, userStatusFilter, userSort]);

  const visibleOrders = useMemo(() => {
    const term = orderSearch.trim().toLowerCase();
    const scoped = orders.filter((item) => {
      const statusMatch = orderStatusFilter === 'all' || (item.status || '').toLowerCase() === orderStatusFilter;
      const text = `${item.id || ''} ${item.customer || ''}`.toLowerCase();
      const textMatch = !term || text.includes(term);
      return statusMatch && textMatch;
    });

    return [...scoped].sort((a, b) => {
      switch (orderSort) {
        case 'id-asc':
          return parseNumericId(a.id) - parseNumericId(b.id);
        case 'id-desc':
          return parseNumericId(b.id) - parseNumericId(a.id);
        case 'total-asc':
          return compareNumber(a.total, b.total);
        case 'total-desc':
          return compareNumber(b.total, a.total);
        case 'customer-asc':
          return compareText(a.customer, b.customer);
        case 'customer-desc':
          return compareText(b.customer, a.customer);
        case 'status-asc':
          return compareText(a.status, b.status);
        case 'status-desc':
          return compareText(b.status, a.status);
        case 'oldest': {
          const left = new Date(a.createdAt || a.date || 0).getTime();
          const right = new Date(b.createdAt || b.date || 0).getTime();
          return left - right;
        }
        case 'latest':
        default: {
          const left = new Date(a.createdAt || a.date || 0).getTime();
          const right = new Date(b.createdAt || b.date || 0).getTime();
          return right - left;
        }
      }
    });
  }, [orders, orderSearch, orderStatusFilter, orderSort]);

  const visibleProducts = useMemo(() => {
    const term = catalogSearch.trim().toLowerCase();
    const scoped = products.filter((item) => {
      const categoryMatch =
        catalogCategoryFilter === 'all' || (item.category || '').toLowerCase() === catalogCategoryFilter;
      const text = `${item.id || ''} ${item.name || ''} ${item.category || ''}`.toLowerCase();
      const textMatch = !term || text.includes(term);
      return categoryMatch && textMatch;
    });

    return [...scoped].sort((a, b) => {
      switch (catalogSort) {
        case 'id-desc':
          return parseNumericId(b.id) - parseNumericId(a.id);
        case 'name-asc':
          return compareText(a.name, b.name);
        case 'name-desc':
          return compareText(b.name, a.name);
        case 'category-asc':
          return compareText(a.category, b.category);
        case 'category-desc':
          return compareText(b.category, a.category);
        case 'price-asc':
          return compareNumber(a.price, b.price);
        case 'price-desc':
          return compareNumber(b.price, a.price);
        case 'rating-asc':
          return compareNumber(a.rating, b.rating);
        case 'rating-desc':
          return compareNumber(b.rating, a.rating);
        case 'id-asc':
        default:
          return parseNumericId(a.id) - parseNumericId(b.id);
      }
    });
  }, [products, catalogSearch, catalogCategoryFilter, catalogSort]);

  const visibleOrderUpdateRequests = useMemo(() => {
    const term = requestSearch.trim().toLowerCase();
    const scoped = orderUpdateRequests.filter((item) => {
      const statusMatch = requestStatusFilter === 'all' || String(item.status || '').toLowerCase() === requestStatusFilter;
      const text = `${item.id || ''} ${item.orderId || ''} ${item.userId || ''} ${item.reason || ''} ${Object.values(item.requestedChanges || {}).join(' ')}`.toLowerCase();
      return statusMatch && (!term || text.includes(term));
    });

    return [...scoped].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [orderUpdateRequests, requestSearch, requestStatusFilter]);

  const requestCounts = useMemo(() => {
    return orderUpdateRequests.reduce(
      (acc, request) => {
        acc.total += 1;
        const status = String(request.status || 'Pending').toLowerCase();
        if (status === 'pending') acc.pending += 1;
        if (status === 'approved') acc.approved += 1;
        if (status === 'rejected') acc.rejected += 1;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0 }
    );
  }, [orderUpdateRequests]);

  const formatRequestFieldLabel = (field) =>
    String(field || '')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (char) => char.toUpperCase())
      .trim();

  // Statistics (computed from live API data)
  const normalizedUsers = useMemo(
    () => users.filter((user) => (user?.role || '').toLowerCase() !== 'admin'),
    [users]
  );
  const normalizedOrders = useMemo(
    () =>
      orders.map((order) => ({
        ...order,
        status: String(order?.status || '').toLowerCase(),
        total: Number(order?.total || 0)
      })),
    [orders]
  );
  const totalRevenue = normalizedOrders
    .filter((order) => order.status !== 'cancelled')
    .reduce((sum, order) => sum + (Number.isFinite(order.total) ? order.total : 0), 0);
  const activeOrdersCount = normalizedOrders.filter((order) =>
    ['processing', 'shipped', 'pending'].includes(order.status)
  ).length;
  const convertedOrdersCount = normalizedOrders.filter((order) =>
    ['delivered', 'completed'].includes(order.status)
  ).length;
  const conversionRate = normalizedUsers.length
    ? (convertedOrdersCount / normalizedUsers.length) * 100
    : 0;

  const stats = [
    { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: <BarChart3 />, color: "indigo" },
    { label: "Total Users", value: normalizedUsers.length, icon: <UsersIcon />, color: "violet" },
    { label: "Active Orders", value: activeOrdersCount, icon: <ShoppingBag />, color: "emerald" },
    { label: "Conversion", value: `${conversionRate.toFixed(1)}%`, icon: <ArrowUpRight />, color: "amber" },
  ];
  const pulseSeries = useMemo(() => {
    const bucketCount = pulseRange === '1y' ? 12 : pulseRange === '1m' ? 30 : 12;
    const buckets = Array.from({ length: bucketCount }, () => 0);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    const currentMonthIndex = now.getFullYear() * 12 + now.getMonth();

    orders.forEach((order) => {
      const rawDate = order.createdAt || order.date;
      if (!rawDate) return;
      const parsed = new Date(rawDate);
      if (Number.isNaN(parsed.getTime())) return;

      if (pulseRange === '1y') {
        const orderMonthIndex = parsed.getFullYear() * 12 + parsed.getMonth();
        const monthDiff = currentMonthIndex - orderMonthIndex;
        if (monthDiff >= 0 && monthDiff < bucketCount) {
          const index = bucketCount - 1 - monthDiff;
          buckets[index] += 1;
        }
        return;
      }

      const orderDayStart = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime();
      const dayDiff = Math.floor((todayStart - orderDayStart) / dayMs);
      if (dayDiff >= 0 && dayDiff < bucketCount) {
        const index = bucketCount - 1 - dayDiff;
        buckets[index] += 1;
      }
    });

    const max = Math.max(...buckets, 0);
    if (max === 0) {
      return buckets.map(() => ({ count: 0, height: 8 }));
    }

    return buckets.map((count) => ({
      count,
      height: Math.max(10, Math.round((count / max) * 100))
    }));
  }, [orders, pulseRange]);
  const pulseRangeLabel = useMemo(() => {
    if (pulseRange === '1y') return 'Last 12 months of order volume';
    if (pulseRange === '1m') return 'Last 30 days of order volume';
    return 'Last 12 days of order volume';
  }, [pulseRange]);
  const hasPulseActivity = useMemo(
    () => pulseSeries.some((point) => point.count > 0),
    [pulseSeries]
  );
  const dataManagerTargets = [
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'products', label: 'Products', icon: '🏷️' },
    { id: 'catalog', label: 'Catalog', icon: '📚' },
    { id: 'users', label: 'Non-Admin Users', icon: '👥' }
  ];

  const selectedDataTargetCount = dataControlTargets.length;
  const allDataTargetsSelected = dataManagerTargets.every((target) => dataControlTargets.includes(target.id));

  const getDataTargetCount = (targetId) => {
    if (targetId === 'orders') return orders.length;
    if (targetId === 'products') return products.length;
    if (targetId === 'catalog') return Math.max(categories.filter((category) => category !== 'All').length, 0);
    return users.filter((item) => item.role !== 'Admin').length;
  };

  const getSeedAmountValue = (targetId) => {
    if (targetId === 'orders') return seedCounts.orderCount;
    if (targetId === 'users') return seedCounts.userCount;
    return seedCounts.productCount;
  };

  const updateSeedAmountValue = (targetId, rawValue) => {
    const value = Math.max(Number(rawValue || 0), 0);
    setSeedCounts((prev) => {
      if (targetId === 'orders') return { ...prev, orderCount: value };
      if (targetId === 'users') return { ...prev, userCount: value };
      return { ...prev, productCount: value };
    });
  };

  // User Actions
  const toggleUserSelection = (id) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
  };
  const toggleAllUsers = () => {
    const visibleIds = visibleUsers.map((item) => item.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedUsers.includes(id));
    if (allVisibleSelected) {
      setSelectedUsers((prev) => prev.filter((id) => !visibleIds.includes(id)));
      return;
    }
    setSelectedUsers((prev) => [...new Set([...prev, ...visibleIds])]);
  };
  const deleteSelectedUsers = async () => {
    const deletableIds = selectedUsers.filter((id) => id !== currentUserId);
    if (deletableIds.length !== selectedUsers.length) {
      onNotify?.('Your own admin account cannot be deleted');
    }
    setIsMutating(true);
    try {
      await Promise.all(deletableIds.map((id) => onDeleteUser(id)));
      setSelectedUsers([]);
    } catch (err) {
      onNotify?.(err.message || 'Failed to delete selected users');
    } finally {
      setIsMutating(false);
    }
  };
  const deleteAllUsers = async () => {
    if (confirm("Are you sure you want to delete EVERY user?")) {
      const deletableUsers = users.filter((u) => u.id !== currentUserId);
      if (deletableUsers.length !== users.length) {
        onNotify?.('Your own admin account cannot be deleted');
      }
      setIsMutating(true);
      try {
        await Promise.all(deletableUsers.map((u) => onDeleteUser(u.id)));
        setSelectedUsers([]);
      } catch (err) {
        onNotify?.(err.message || 'Failed to delete users');
      } finally {
        setIsMutating(false);
      }
    }
  };

  // Order Actions
  const toggleOrderSelection = (id) => {
    setSelectedOrders(prev => prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]);
  };
  const toggleAllOrders = () => {
    const visibleIds = visibleOrders.map((item) => item.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedOrders.includes(id));
    if (allVisibleSelected) {
      setSelectedOrders((prev) => prev.filter((id) => !visibleIds.includes(id)));
      return;
    }
    setSelectedOrders((prev) => [...new Set([...prev, ...visibleIds])]);
  };
  const deleteSelectedOrders = async () => {
    const isCancelledStatus = (status) => {
      const normalized = String(status || '').trim().toLowerCase();
      return normalized === 'cancelled' || normalized === 'canceled';
    };

    const nonCancelledOrders = selectedOrders
      .map((id) => orders.find((order) => order.id === id))
      .filter((order) => order && !isCancelledStatus(order.status));

    if (nonCancelledOrders.length > 0) {
      const shouldDelete = confirm(
        `This will delete ${nonCancelledOrders.length} non-cancelled order(s). Do you want to continue?`
      );
      if (!shouldDelete) return;
    }

    setIsMutating(true);
    try {
      await Promise.all(selectedOrders.map((id) => onDeleteOrder(id)));
      setSelectedOrders([]);
    } catch (err) {
      onNotify?.(err.message || 'Failed to delete selected orders');
    } finally {
      setIsMutating(false);
    }
  };
  const toggleProductSelection = (id) => {
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
  };
  const toggleAllProducts = () => {
    const visibleIds = visibleProducts.map((item) => item.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedProducts.includes(id));
    if (allVisibleSelected) {
      setSelectedProducts((prev) => prev.filter((id) => !visibleIds.includes(id)));
      return;
    }
    setSelectedProducts((prev) => [...new Set([...prev, ...visibleIds])]);
  };
  const deleteSelectedProducts = async () => {
    setIsMutating(true);
    try {
      await Promise.all(selectedProducts.map((id) => onDeleteProduct(id)));
      setSelectedProducts([]);
    } catch (err) {
      onNotify?.(err.message || 'Failed to delete selected products');
    } finally {
      setIsMutating(false);
    }
  };

  const deleteSingleUser = async (id) => {
    if (id === currentUserId) {
      onNotify?.('Your own admin account cannot be deleted');
      return;
    }
    setIsMutating(true);
    try {
      await onDeleteUser(id);
      setSelectedUsers((prev) => prev.filter((userId) => userId !== id));
    } catch (err) {
      onNotify?.(err.message || 'Failed to delete user');
    } finally {
      setIsMutating(false);
    }
  };

  const deleteSingleOrder = async (id) => {
    const targetOrder = orders.find((order) => order.id === id);
    const normalizedStatus = String(targetOrder?.status || '').trim().toLowerCase();
    const isCancelled = normalizedStatus === 'cancelled' || normalizedStatus === 'canceled';
    if (!isCancelled) {
      const shouldDelete = confirm('This order is not cancelled. Do you want to delete it?');
      if (!shouldDelete) return;
    }

    setIsMutating(true);
    try {
      await onDeleteOrder(id);
      setSelectedOrders((prev) => prev.filter((orderId) => orderId !== id));
    } catch (err) {
      onNotify?.(err.message || 'Failed to delete order');
    } finally {
      setIsMutating(false);
    }
  };
  const deleteSingleProduct = async (id) => {
    setIsMutating(true);
    try {
      await onDeleteProduct(id);
      setSelectedProducts((prev) => prev.filter((productId) => productId !== id));
    } catch (err) {
      onNotify?.(err.message || 'Failed to delete product');
    } finally {
      setIsMutating(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateUserFeedback({ type: '', text: '' });
    setIsMutating(true);
    try {
      await onCreateUser(newUserForm);
      setCreateUserFeedback({ type: 'success', text: 'User created successfully.' });
      setNewUserForm({
        name: '',
        email: '',
        password: '',
        role: 'Customer',
        status: 'Active'
      });
    } catch (err) {
      const message = err.message || 'Failed to create user';
      setCreateUserFeedback({ type: 'error', text: message });
      onNotify?.(message);
    } finally {
      setIsMutating(false);
    }
  };
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setCreateProductFeedback({ type: '', text: '' });
    setIsMutating(true);
    try {
      await onCreateProduct({
        ...newProductForm,
        price: Number(newProductForm.price || 0),
        rating: Number(newProductForm.rating || 0),
        reviews: Number(newProductForm.reviews || 0)
      });
      setCreateProductFeedback({ type: 'success', text: 'Product created successfully.' });
      setNewProductForm({
        name: '',
        category: '',
        price: 0,
        image: '',
        rating: 4.5,
        reviews: 0,
        description: ''
      });
    } catch (err) {
      const message = err.message || 'Failed to create product';
      setCreateProductFeedback({ type: 'error', text: message });
      onNotify?.(message);
    } finally {
      setIsMutating(false);
    }
  };

  const handleReviewOrderUpdateRequest = async (request) => {
    setIsMutating(true);
    try {
      const draft = requestReviewDrafts[request.id] || { status: 'Approved', adminNote: '' };
      await onUpdateOrderUpdateRequest?.(request.id, draft);
      onNotify?.('Order update request reviewed');
      setRequestReviewDrafts((prev) => {
        const next = { ...prev };
        delete next[request.id];
        return next;
      });
    } catch (err) {
      onNotify?.(err.message || 'Failed to review order update request');
    } finally {
      setIsMutating(false);
    }
  };

  const runDataControl = async (type, payload) => {
    if (!payload.targets?.length) {
      onNotify?.('Please select at least one target.');
      return;
    }
    setDataControlLoading(true);
    try {
      if (type === 'clear') {
        await onDataClear(payload.targets);
      } else {
        await onDataSeed(payload);
      }
    } catch (err) {
      onNotify?.(err.message || 'Data control action failed');
    } finally {
      setDataControlLoading(false);
    }
  };

  const copyGeneratedApiKey = async () => {
    if (!generatedApiKey) return;
    try {
      await navigator.clipboard.writeText(generatedApiKey);
      onNotify?.('API key copied');
    } catch (_err) {
      onNotify?.('Copy failed. Select the key manually.');
    }
  };

  const generateApiKey = async () => {
    const shouldRotate = !platformApiKeyMeta?.hasApiKey || confirm('Generate a new API key? The existing key will stop working.');
    if (!shouldRotate) return;
    setIsMutatingApiKey(true);
    try {
      const data = await onGenerateApiKey?.(integrationScopeDraft);
      setGeneratedApiKey(data?.apiKey || '');
      onNotify?.('API key generated');
    } catch (err) {
      onNotify?.(err.message || 'Failed to generate API key');
    } finally {
      setIsMutatingApiKey(false);
    }
  };

  const toggleIntegrationScope = (scopeId) => {
    setIntegrationScopeDraft((prev) =>
      prev.includes(scopeId) ? prev.filter((scope) => scope !== scopeId) : [...prev, scopeId]
    );
  };

  const revokeApiKey = async () => {
    if (!confirm('Revoke the current API key? External platforms using it will lose access.')) return;
    setIsMutatingApiKey(true);
    try {
      await onRevokeApiKey?.();
      setGeneratedApiKey('');
      onNotify?.('API key revoked');
    } catch (err) {
      onNotify?.(err.message || 'Failed to revoke API key');
    } finally {
      setIsMutatingApiKey(false);
    }
  };

  // Edit Handlers
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsMutating(true);
    try {
      if (editingItem.type === 'user') {
        const payload = {
          role: editingItem.data.role,
          status: editingItem.data.status
        };
        if (editingItem.data.password) {
          payload.password = editingItem.data.password;
        }
        await onUpdateUser(editingItem.data.id, payload);
      } else if (editingItem.type === 'order') {
        await onUpdateOrder(editingItem.data.id, { status: editingItem.data.status });
      } else {
        await onUpdateProduct(editingItem.data.id, {
          name: editingItem.data.name,
          category: editingItem.data.category,
          price: Number(editingItem.data.price || 0),
          image: editingItem.data.image,
          rating: Number(editingItem.data.rating || 0),
          reviews: Number(editingItem.data.reviews || 0),
          description: editingItem.data.description
        });
      }
      setEditingItem(null);
    } catch (err) {
      onNotify?.(err.message || 'Failed to save changes');
    } finally {
      setIsMutating(false);
    }
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'statistics':
        return (
          <div data-testid="fra-admin-tab-statistics" className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((s, idx) => (
                <div key={idx} data-testid={`fra-admin-stat-card-${toKebab(s.label)}`} className="bg-white p-8 rounded-[2rem] border-2 border-gray-50 shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-gray-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {React.cloneElement(s.icon, { size: 24 })}
                    </div>
                  </div>
                  <p data-testid={`txt-admin-stat-label-${toKebab(s.label)}`} className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">{s.label}</p>
                  <h4 data-testid={`txt-admin-stat-value-${toKebab(s.label)}`} className="text-3xl font-black text-gray-900 tracking-tighter">{s.value}</h4>
                </div>
              ))}
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-50">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 data-testid="txt-admin-system-pulse-title" className="text-[10px] font-black uppercase tracking-widest text-gray-400">System Pulse</h3>
                  <select
                    data-testid="cbo-admin-pulse-range"
                    value={pulseRange}
                    onChange={(e) => setPulseRange(e.target.value)}
                    className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-[11px] font-black uppercase tracking-wider text-gray-500 outline-none"
                  >
                    <option value="12d">Last 12 Days</option>
                    <option value="1m">Last Month</option>
                    <option value="1y">Last Year</option>
                  </select>
                </div>
                <div className="h-64 flex items-end gap-3">
                  {pulseSeries.map((point, i) => (
                    <div key={i} data-testid={`fra-admin-pulse-bar-${i + 1}`} className="h-full flex-1 bg-gray-50 rounded-xl relative group" title={`${point.count} order(s)`}>
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-indigo-600 rounded-xl group-hover:bg-indigo-400 transition-all duration-500"
                        style={{ height: `${point.height}%` }}
                      ></div>
                    </div>
                  ))}
                </div>
                <p data-testid="txt-admin-pulse-caption" className="text-[11px] font-bold text-gray-400 mt-4">
                  {pulseRangeLabel}
                  {!hasPulseActivity ? ' (no activity yet)' : ''}
                </p>
            </div>

          </div>
        );
      case 'data-manager':
        return (
          <div data-testid="fra-admin-tab-data-manager" className="bg-slate-100/80 border border-slate-200 rounded-[2.5rem] overflow-hidden animate-in fade-in duration-500">
            <div className="px-8 py-7 border-b border-slate-200 bg-white/70">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <h3 data-testid="txt-admin-data-control-title" className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Data Control Center</h3>
                  <p data-testid="txt-admin-data-control-description" className="text-sm md:text-base text-slate-600 font-medium">Quickly manage database states for testing environments.</p>
                </div>
                <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-100 border border-slate-200 rounded-full px-4 py-2">
                  <Info size={14} />
                  Environment: <span data-testid="txt-admin-environment-label" className="text-amber-600">{environmentLabel}</span>
                </div>
              </div>
            </div>

            <div className="px-8 py-7 space-y-5">
              <div className="hidden md:grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,160px)] px-4 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                <div className="flex items-center gap-4">
                  <button
                    data-testid="btn-admin-data-toggle-all"
                    onClick={() =>
                      setDataControlTargets(allDataTargetsSelected ? [] : dataManagerTargets.map((target) => target.id))
                    }
                    className="hover:text-indigo-600 transition-colors"
                  >
                    {allDataTargetsSelected ? 'Deselect All' : 'Select All'}
                  </button>
                  <span data-testid="txt-admin-data-header-category">Category</span>
                </div>
                <span data-testid="txt-admin-data-header-status" className="justify-self-end">Current Status</span>
                <span data-testid="txt-admin-data-header-seed" className="justify-self-end">Seed Amount</span>
              </div>

              <div className="space-y-3">
                {dataManagerTargets.map((target) => {
                  const selected = dataControlTargets.includes(target.id);
                  return (
                    <div
                      data-testid={`fra-admin-data-target-${toKebab(target.id)}`}
                      key={target.id}
                      className={`grid grid-cols-1 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,160px)] items-center gap-4 px-5 py-4 rounded-2xl border transition-colors ${
                        selected ? 'border-indigo-200 bg-indigo-50/40' : 'border-slate-200 bg-slate-100/80'
                      }`}
                    >
                      <label data-testid={`lbl-admin-data-target-${toKebab(target.id)}`} className="flex items-center gap-4 min-w-0">
                        <input
                          data-testid={`chk-admin-data-target-${toKebab(target.id)}`}
                          type="checkbox"
                          checked={selected}
                          onChange={(e) => {
                            setDataControlTargets((prev) =>
                              e.target.checked
                                ? [...new Set([...prev, target.id])]
                                : prev.filter((item) => item !== target.id)
                            );
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 w-6 h-6"
                        />
                        <span data-testid={`txt-admin-data-target-icon-${toKebab(target.id)}`} className="text-xl">{target.icon}</span>
                        <span data-testid={`txt-admin-data-target-label-${toKebab(target.id)}`} className={`text-sm md:text-xl font-black tracking-tight truncate ${selected ? 'text-slate-900' : 'text-slate-500'}`}>{target.label}</span>
                      </label>

                      <div className="justify-self-start md:justify-self-end flex items-center gap-2">
                        <span data-testid={`txt-admin-data-target-count-${toKebab(target.id)}`} className="text-emerald-600 font-black text-xl md:text-3xl tracking-tight">
                          {getDataTargetCount(target.id).toLocaleString()}
                        </span>
                        <span data-testid={`txt-admin-data-target-records-${toKebab(target.id)}`} className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Records</span>
                      </div>

                      <div className="justify-self-start md:justify-self-end">
                        <input
                          data-testid={`txt-admin-seed-amount-${toKebab(target.id)}`}
                          type="number"
                          min={0}
                          value={getSeedAmountValue(target.id)}
                          disabled={!selected}
                          onChange={(e) => updateSeedAmountValue(target.id, e.target.value)}
                          className={`w-32 px-4 py-3 rounded-xl border text-lg font-black outline-none ${
                            selected
                              ? 'border-slate-300 bg-white text-slate-900'
                              : 'border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-8 py-6 border-t border-slate-200 bg-slate-100/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 text-sm font-black">
                  <CheckCircle size={16} />
                  {selectedDataTargetCount} Categories Selected
                </div>
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-black uppercase tracking-wider text-slate-500">
                  Catalog Category Variety
                  <input
                    data-testid="txt-admin-seed-category-count"
                    type="number"
                    min={1}
                    max={20}
                    value={seedCounts.categoryCount}
                    onChange={(e) =>
                      setSeedCounts((prev) => ({
                        ...prev,
                        categoryCount: Math.min(Math.max(Number(e.target.value || 1), 1), 20)
                      }))
                    }
                    className="w-16 px-2 py-1 rounded-lg border border-slate-300 bg-white text-slate-800 text-center outline-none"
                  />
                </label>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <button
                  data-testid="btn-admin-clear-selected-data"
                  disabled={dataControlLoading || selectedDataTargetCount === 0}
                  onClick={() => runDataControl('clear', { targets: dataControlTargets })}
                  className="px-6 py-3 bg-rose-50 border-2 border-rose-100 text-rose-600 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-rose-100 disabled:opacity-40"
                >
                  Clear Selected
                </button>
                <button
                  data-testid="btn-admin-seed-selected-data"
                  disabled={dataControlLoading || selectedDataTargetCount === 0}
                  onClick={() =>
                    runDataControl('seed', {
                      targets: dataControlTargets,
                      productCount: seedCounts.productCount,
                      categoryCount: seedCounts.categoryCount,
                      userCount: seedCounts.userCount,
                      orderCount: seedCounts.orderCount
                    })
                  }
                  className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-40"
                >
                  Seed Selected
                </button>
              </div>
            </div>
          </div>
        );
      case 'app-settings':
        return (
          <div className="bg-white rounded-[2.5rem] border-2 border-gray-50 shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="p-8 border-b border-gray-100">
              <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest text-xs">App Settings</h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="max-w-xl space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Homepage Top Categories
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={appSettingsForm.topCategoryLimit}
                  onChange={(e) =>
                    setAppSettingsForm((prev) => ({
                      ...prev,
                      topCategoryLimit: Math.min(Math.max(Number(e.target.value || 1), 1), 12)
                    }))
                  }
                  className="w-32 px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-lg font-black outline-none"
                />
                <p className="text-xs text-gray-400">Controls how many top categories are shown on homepage for all users.</p>
              </div>
              <div className="max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <KeyRound size={18} className="text-indigo-600" />
                      <h4 className="text-sm font-black uppercase tracking-widest text-gray-700">Platform API Key</h4>
                    </div>
                    <p className="text-xs font-medium text-gray-400">
                      External platforms can call protected backend endpoints with this key in the x-api-key header.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isMutatingApiKey}
                      onClick={generateApiKey}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-40"
                    >
                      {platformApiKeyMeta?.hasApiKey ? 'Rotate Key' : 'Generate Key'}
                    </button>
                    {generatedApiKey ? (
                      <button
                        type="button"
                        onClick={copyGeneratedApiKey}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 hover:border-slate-300 hover:text-slate-950"
                      >
                        <Copy size={14} /> Copy Key
                      </button>
                    ) : null}
                    {platformApiKeyMeta?.hasApiKey ? (
                      <button
                        type="button"
                        disabled={isMutatingApiKey}
                        onClick={revokeApiKey}
                        className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 text-xs font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100 disabled:opacity-40"
                      >
                        Revoke
                      </button>
                    ) : null}
                  </div>
                </div>
                {platformApiKeyMeta?.hasApiKey ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-white px-4 py-3 border border-slate-200">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Current Key</p>
                      <p className="mt-1 break-all text-sm font-black text-gray-800">{platformApiKeyMeta.maskedApiKey}</p>
                    </div>
                    <div className="rounded-xl bg-white px-4 py-3 border border-slate-200">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Created</p>
                      <p className="mt-1 text-sm font-bold text-gray-700">
                        {platformApiKeyMeta.createdAt ? new Date(platformApiKeyMeta.createdAt).toLocaleString() : 'Unknown'}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white px-4 py-3 border border-slate-200">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Last Used</p>
                      <p className="mt-1 text-sm font-bold text-gray-700">
                        {platformApiKeyMeta.lastUsedAt ? new Date(platformApiKeyMeta.lastUsedAt).toLocaleString() : 'Never'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-semibold text-slate-500">
                    No platform API key has been generated yet.
                  </div>
                )}
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Allowed Scopes</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {INTEGRATION_SCOPE_OPTIONS.map((scope) => (
                      <label
                        key={scope.id}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                          integrationScopeDraft.includes(scope.id)
                            ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 bg-white text-slate-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={integrationScopeDraft.includes(scope.id)}
                          onChange={() => toggleIntegrationScope(scope.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <span>{scope.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {generatedApiKey ? (
                  <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-amber-700">New key shown once</p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <code className="min-w-0 flex-1 break-all rounded-xl bg-white px-4 py-3 text-xs font-bold text-slate-800">
                        {generatedApiKey}
                      </code>
                      <button
                        type="button"
                        onClick={copyGeneratedApiKey}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-black"
                      >
                        <Copy size={14} /> Copy
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
              <div>
                <button
                  disabled={isSavingSettings}
                  onClick={async () => {
                    setIsSavingSettings(true);
                    try {
                      await onSaveAppSettings?.({
                        topCategoryLimit: appSettingsForm.topCategoryLimit,
                        platformApiKeyScopes: integrationScopeDraft
                      });
                    } finally {
                      setIsSavingSettings(false);
                    }
                  }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-40"
                >
                  {isSavingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        );
      case 'users':
        return (
          <div data-testid="fra-admin-tab-users" className="bg-white rounded-[2.5rem] border-2 border-gray-50 shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="p-8 border-b border-gray-100 space-y-4">
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                <h3 data-testid="txt-admin-users-title" className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest text-xs">Users</h3>
                <button
                  data-testid="btn-admin-open-create-user"
                  disabled={isMutating}
                  onClick={() => {
                    setCreateUserFeedback({ type: '', text: '' });
                    setIsCreateUserOpen(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-40"
                >
                  <Plus size={14} /> New User
                </button>
                {selectedUsers.length > 0 && (
                  <>
                    <button data-testid="btn-admin-delete-selected-users" disabled={isMutating} onClick={deleteSelectedUsers} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-100 transition-colors disabled:opacity-40 animate-in slide-in-from-left-4">
                      <Trash2 size={14} /> Delete Selected ({selectedUsers.length})
                    </button>
                    <button data-testid="btn-admin-delete-all-users" disabled={isMutating} onClick={deleteAllUsers} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-colors disabled:opacity-40">
                      Delete All
                    </button>
                  </>
                )}
              </div>
              <div className="relative w-full xl:w-72 2xl:w-80 shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    data-testid="txt-admin-user-search"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-12 pr-4 py-3 bg-gray-50 rounded-2xl text-sm outline-none border border-transparent w-full"
                    placeholder="Search name/email..."
                  />
              </div>
            </div>
              <div className="flex flex-wrap gap-3">
                <select
                  data-testid="cbo-admin-user-role-filter"
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold outline-none border border-gray-100"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="customer">Customer</option>
                </select>
                <select
                  data-testid="cbo-admin-user-status-filter"
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold outline-none border border-gray-100"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  data-testid="cbo-admin-user-sort"
                  value={userSort}
                  onChange={(e) => setUserSort(e.target.value)}
                  className="px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold outline-none border border-gray-100"
                >
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="email-asc">Email A-Z</option>
                  <option value="email-desc">Email Z-A</option>
                  <option value="role-asc">Role A-Z</option>
                  <option value="role-desc">Role Z-A</option>
                  <option value="status-asc">Status A-Z</option>
                  <option value="status-desc">Status Z-A</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table data-testid="tbl-admin-users" className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <th className="px-8 py-5">
                      <input
                        data-testid="chk-admin-users-select-all"
                        type="checkbox"
                        checked={visibleUsers.length > 0 && visibleUsers.every((item) => selectedUsers.includes(item.id))}
                        onChange={toggleAllUsers}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4"
                      />
                    </th>
                    <th
                      onClick={() => setUserSort(userSort === 'name-asc' ? 'name-desc' : 'name-asc')}
                      className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      <div className="inline-flex items-center gap-1">Identity {getSortIcon(userSort, 'name')}</div>
                    </th>
                    <th
                      onClick={() => setUserSort(userSort === 'role-asc' ? 'role-desc' : 'role-asc')}
                      className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      <div className="inline-flex items-center gap-1">Role {getSortIcon(userSort, 'role')}</div>
                    </th>
                    <th
                      onClick={() => setUserSort(userSort === 'status-asc' ? 'status-desc' : 'status-asc')}
                      className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      <div className="inline-flex items-center gap-1">Status {getSortIcon(userSort, 'status')}</div>
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visibleUsers.map(user => (
                    <tr key={user.id} data-testid={`row-admin-user-${toKebab(user.id)}`} className={`group hover:bg-gray-50/50 transition-colors ${selectedUsers.includes(user.id) ? 'bg-indigo-50/30' : ''}`}>
                      <td className="px-8 py-6">
                        <input data-testid={`chk-admin-user-select-${toKebab(user.id)}`} type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => toggleUserSelection(user.id)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4" />
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-500">{user.name.charAt(0)}</div>
                          <div>
                            <p data-testid={`txt-admin-user-name-${toKebab(user.id)}`} className="font-bold text-gray-900">{user.name}</p>
                            <p data-testid={`txt-admin-user-email-${toKebab(user.id)}`} className="text-xs text-gray-400 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span data-testid={`txt-admin-user-role-${toKebab(user.id)}`} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${user.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                          <span data-testid={`txt-admin-user-status-${toKebab(user.id)}`} className="text-xs font-bold text-gray-600">{user.status}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            data-testid={`btn-admin-edit-user-${toKebab(user.id)}`}
                            onClick={() => setEditingItem({ type: 'user', data: { ...user, password: '' } })}
                            className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            data-testid={`btn-admin-delete-user-${toKebab(user.id)}`}
                            disabled={isMutating}
                            onClick={() => deleteSingleUser(user.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 disabled:opacity-40"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="block sm:hidden text-right group-hover:hidden">
                          <MoreVertical size={16} className="text-gray-300 ml-auto" />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {visibleUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-10 text-center text-sm font-medium text-gray-400">
                        No users match current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'orders':
        return (
          <div data-testid="fra-admin-tab-orders" className="bg-white rounded-[2.5rem] border-2 border-gray-50 shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="p-8 border-b border-gray-100 space-y-4">
              <div className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-6">
                  <h3 data-testid="txt-admin-orders-title" className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest text-xs">Orders</h3>
                  {selectedOrders.length > 0 && (
                     <button data-testid="btn-admin-delete-selected-orders" disabled={isMutating} onClick={deleteSelectedOrders} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-100 transition-colors disabled:opacity-40">
                        <Trash2 size={14} /> Delete Selected ({selectedOrders.length})
                      </button>
                  )}
                </div>
                <input
                  data-testid="chk-admin-orders-select-all"
                  type="checkbox"
                  checked={visibleOrders.length > 0 && visibleOrders.every((item) => selectedOrders.includes(item.id))}
                  onChange={toggleAllOrders}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="relative min-w-[220px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    data-testid="txt-admin-order-search"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="pl-12 pr-4 py-3 bg-gray-50 rounded-2xl text-sm outline-none border border-transparent w-full"
                    placeholder="Search order/customer..."
                  />
                </div>
                <select
                  data-testid="cbo-admin-order-status-filter"
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold outline-none border border-gray-100"
                >
                  <option value="all">All Status</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  data-testid="cbo-admin-order-sort"
                  value={orderSort}
                  onChange={(e) => setOrderSort(e.target.value)}
                  className="px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold outline-none border border-gray-100"
                >
                  <option value="latest">Date Latest</option>
                  <option value="oldest">Date Oldest</option>
                  <option value="id-asc">ID Asc</option>
                  <option value="id-desc">ID Desc</option>
                  <option value="total-asc">Total Low-High</option>
                  <option value="total-desc">Total High-Low</option>
                  <option value="customer-asc">Customer A-Z</option>
                  <option value="customer-desc">Customer Z-A</option>
                  <option value="status-asc">Status A-Z</option>
                  <option value="status-desc">Status Z-A</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table data-testid="tbl-admin-orders" className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <th className="px-8 py-5">#</th>
                    <th
                      onClick={() => setOrderSort(orderSort === 'id-asc' ? 'id-desc' : 'id-asc')}
                      className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      <div className="inline-flex items-center gap-1">ID {getSortIcon(orderSort, 'id')}</div>
                    </th>
                    <th
                      onClick={() => setOrderSort(orderSort === 'customer-asc' ? 'customer-desc' : 'customer-asc')}
                      className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      <div className="inline-flex items-center gap-1">Customer {getSortIcon(orderSort, 'customer')}</div>
                    </th>
                    <th
                      onClick={() => setOrderSort(orderSort === 'total-asc' ? 'total-desc' : 'total-asc')}
                      className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      <div className="inline-flex items-center gap-1">Total {getSortIcon(orderSort, 'total')}</div>
                    </th>
                    <th
                      onClick={() => setOrderSort(orderSort === 'status-asc' ? 'status-desc' : 'status-asc')}
                      className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      <div className="inline-flex items-center gap-1">Status {getSortIcon(orderSort, 'status')}</div>
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visibleOrders.map(order => (
                    <tr key={order.id} data-testid={`row-admin-order-${toKebab(order.id)}`} className={`group hover:bg-gray-50/50 transition-colors ${selectedOrders.includes(order.id) ? 'bg-indigo-50/30' : ''}`}>
                      <td className="px-8 py-6">
                        <input data-testid={`chk-admin-order-select-${toKebab(order.id)}`} type="checkbox" checked={selectedOrders.includes(order.id)} onChange={() => toggleOrderSelection(order.id)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4" />
                      </td>
                      <td className="px-8 py-6 font-black text-xs text-indigo-600 tracking-tight">{order.id}</td>
                      <td className="px-8 py-6 text-sm font-bold text-gray-900">{order.customer}</td>
                      <td className="px-8 py-6 font-black text-gray-900 tracking-tighter">${order.total.toFixed(2)}</td>
                      <td className="px-8 py-6">
                        <span data-testid={`txt-admin-order-status-${toKebab(order.id)}`} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                          order.status === 'Shipped' ? 'bg-indigo-100 text-indigo-700' :
                          order.status === 'Processing' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            data-testid={`btn-admin-edit-order-${toKebab(order.id)}`}
                            onClick={() => setEditingItem({ type: 'order', data: order })}
                            className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            data-testid={`btn-admin-delete-order-${toKebab(order.id)}`}
                            disabled={isMutating}
                            onClick={() => deleteSingleOrder(order.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 disabled:opacity-40"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="block sm:hidden text-right group-hover:hidden">
                          <MoreVertical size={16} className="text-gray-300 ml-auto" />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {visibleOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-8 py-10 text-center text-sm font-medium text-gray-400">
                        No orders match current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'requests':
        return (
          <div data-testid="fra-admin-tab-order-requests" className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-[2.5rem] border-2 border-gray-50 shadow-sm p-8">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest text-xs">Order Update Requests</h3>
                  <p className="text-sm text-gray-400 mt-2">Review customer changes to shipping and order info.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-full bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest border border-gray-100">
                    {requestCounts.total} total
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest border border-amber-100">
                    {requestCounts.pending} pending
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    {requestCounts.approved} approved
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-widest border border-rose-100">
                    {requestCounts.rejected} rejected
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <input
                    value={requestSearch}
                    onChange={(e) => setRequestSearch(e.target.value)}
                    placeholder="Search requests..."
                    className="px-4 py-3 bg-gray-50 rounded-2xl text-sm outline-none border border-gray-100"
                  />
                  <select
                    value={requestStatusFilter}
                    onChange={(e) => setRequestStatusFilter(e.target.value)}
                    className="px-4 py-3 bg-gray-50 rounded-2xl text-sm outline-none border border-gray-100"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
            {visibleOrderUpdateRequests.length ? (
              <div className="space-y-4">
                {visibleOrderUpdateRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-lg font-black text-gray-900">Request #{request.id}</h4>
                          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">{request.status}</span>
                        </div>
                        <p className="text-sm text-gray-500">Order #{request.orderId} · User {request.userId}</p>
                        <p className="text-sm text-gray-600">{request.reason || 'No reason provided.'}</p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {Object.entries(request.requestedChanges || {}).map(([field, value]) => (
                            <span key={field} className="rounded-full bg-gray-50 px-3 py-1 text-[11px] font-bold text-gray-500 border border-gray-200">
                              {formatRequestFieldLabel(field)}: {String(value)}
                            </span>
                          ))}
                        </div>
                        {request.adminNote && <p className="text-xs font-medium text-gray-400">Admin note: {request.adminNote}</p>}
                      </div>
                      <div className="space-y-3 min-w-[260px]">
                        <select
                          value={(requestReviewDrafts[request.id] || { status: 'Approved' }).status}
                          onChange={(e) =>
                            setRequestReviewDrafts((prev) => ({
                              ...prev,
                              [request.id]: {
                                ...(prev[request.id] || { adminNote: '' }),
                                status: e.target.value
                              }
                            }))
                          }
                          className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm outline-none border border-gray-100"
                        >
                          <option value="Approved">Approve</option>
                          <option value="Rejected">Reject</option>
                          <option value="Pending">Reset to Pending</option>
                        </select>
                        <textarea
                          value={(requestReviewDrafts[request.id] || { adminNote: '' }).adminNote}
                          onChange={(e) =>
                            setRequestReviewDrafts((prev) => ({
                              ...prev,
                              [request.id]: {
                                ...(prev[request.id] || { status: 'Approved' }),
                                adminNote: e.target.value
                              }
                            }))
                          }
                          placeholder="Admin note"
                          rows={3}
                          className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm outline-none border border-gray-100 resize-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleReviewOrderUpdateRequest(request)}
                          disabled={isMutating}
                          className="w-full px-4 py-3 rounded-2xl bg-gray-900 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-600 disabled:opacity-40"
                        >
                          Save Review
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
                No order update requests found.
              </div>
            )}
          </div>
        );
      case 'catalog':
        return (
          <div data-testid="fra-admin-tab-catalog" className="bg-white rounded-[2.5rem] border-2 border-gray-50 shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="p-8 border-b border-gray-100 space-y-4">
              <div className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-4">
                <h3 data-testid="txt-admin-catalog-title" className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest text-xs">Catalog</h3>
                <span data-testid="txt-admin-catalog-count" className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                  {visibleProducts.length} / {products.length} Items
                </span>
                {selectedProducts.length > 0 && (
                  <button
                    data-testid="btn-admin-delete-selected-products"
                    disabled={isMutating}
                    onClick={deleteSelectedProducts}
                    className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-100 transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={14} /> Delete Selected ({selectedProducts.length})
                  </button>
                )}
                </div>
                <button
                  data-testid="btn-admin-open-create-product"
                  disabled={isMutating}
                  onClick={() => {
                    setCreateProductFeedback({ type: '', text: '' });
                    setIsCreateProductOpen(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-40"
                >
                  <Plus size={14} /> New Product
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="relative min-w-[240px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    data-testid="txt-admin-catalog-search"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className="pl-12 pr-4 py-3 bg-gray-50 rounded-2xl text-sm outline-none border border-transparent w-full"
                    placeholder="Search product/category..."
                  />
                </div>
                <select
                  data-testid="cbo-admin-catalog-category-filter"
                  value={catalogCategoryFilter}
                  onChange={(e) => setCatalogCategoryFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold outline-none border border-gray-100"
                >
                  <option value="all">All Categories</option>
                  {categories
                    .filter((category) => category !== 'All')
                    .map((category) => (
                      <option key={category} value={String(category).toLowerCase()}>
                        {category}
                      </option>
                    ))}
                </select>
                <select
                  data-testid="cbo-admin-catalog-sort"
                  value={catalogSort}
                  onChange={(e) => setCatalogSort(e.target.value)}
                  className="px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold outline-none border border-gray-100"
                >
                  <option value="id-asc">ID Asc</option>
                  <option value="id-desc">ID Desc</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="category-asc">Category A-Z</option>
                  <option value="category-desc">Category Z-A</option>
                  <option value="price-asc">Price Low-High</option>
                  <option value="price-desc">Price High-Low</option>
                  <option value="rating-asc">Rating Low-High</option>
                  <option value="rating-desc">Rating High-Low</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table data-testid="tbl-admin-catalog" className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <th className="px-8 py-5">
                      <input
                        data-testid="chk-admin-products-select-all"
                        type="checkbox"
                        checked={visibleProducts.length > 0 && visibleProducts.every((item) => selectedProducts.includes(item.id))}
                        onChange={toggleAllProducts}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4"
                      />
                    </th>
                    <th
                      onClick={() => setCatalogSort(catalogSort === 'id-asc' ? 'id-desc' : 'id-asc')}
                      className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      <div className="inline-flex items-center gap-1">ID {getSortIcon(catalogSort, 'id')}</div>
                    </th>
                    <th
                      onClick={() => setCatalogSort(catalogSort === 'name-asc' ? 'name-desc' : 'name-asc')}
                      className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      <div className="inline-flex items-center gap-1">Product {getSortIcon(catalogSort, 'name')}</div>
                    </th>
                    <th
                      onClick={() => setCatalogSort(catalogSort === 'category-asc' ? 'category-desc' : 'category-asc')}
                      className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      <div className="inline-flex items-center gap-1">Category {getSortIcon(catalogSort, 'category')}</div>
                    </th>
                    <th
                      onClick={() => setCatalogSort(catalogSort === 'price-asc' ? 'price-desc' : 'price-asc')}
                      className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      <div className="inline-flex items-center gap-1">Price {getSortIcon(catalogSort, 'price')}</div>
                    </th>
                    <th
                      onClick={() => setCatalogSort(catalogSort === 'rating-asc' ? 'rating-desc' : 'rating-asc')}
                      className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      <div className="inline-flex items-center gap-1">Rating {getSortIcon(catalogSort, 'rating')}</div>
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visibleProducts.map((product) => (
                    <tr key={product.id} data-testid={`row-admin-product-${toKebab(product.id)}`} className={`group hover:bg-gray-50/50 transition-colors ${selectedProducts.includes(product.id) ? 'bg-indigo-50/30' : ''}`}>
                      <td className="px-8 py-6">
                        <input
                          data-testid={`chk-admin-product-select-${toKebab(product.id)}`}
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4"
                        />
                      </td>
                      <td className="px-8 py-6 font-black text-xs text-indigo-600 tracking-tight">{product.id}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <img
                            data-testid={`img-admin-product-${toKebab(product.id)}`}
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                          />
                          <span data-testid={`txt-admin-product-name-${toKebab(product.id)}`} className="text-sm font-bold text-gray-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span data-testid={`txt-admin-product-category-${toKebab(product.id)}`} className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter bg-gray-100 text-gray-500">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-8 py-6 font-black text-gray-900 tracking-tighter">${Number(product.price || 0).toFixed(2)}</td>
                      <td className="px-8 py-6 text-sm font-bold text-amber-600">{product.rating ?? 'N/A'}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            data-testid={`btn-admin-edit-product-${toKebab(product.id)}`}
                            onClick={() => setEditingItem({ type: 'product', data: product })}
                            className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            data-testid={`btn-admin-delete-product-${toKebab(product.id)}`}
                            disabled={isMutating}
                            onClick={() => deleteSingleProduct(product.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 disabled:opacity-40"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="block sm:hidden text-right group-hover:hidden">
                          <MoreVertical size={16} className="text-gray-300 ml-auto" />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {visibleProducts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-8 py-10 text-center text-sm font-medium text-gray-400">
                        No products match current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div data-testid="fra-admin-dashboard" className="max-w-7xl mx-auto px-4 py-16 animate-in slide-in-from-top-10 duration-500">
      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="lg:w-64 space-y-2">
          <div className="mb-10 pl-4">
            <h1 data-testid="txt-admin-dashboard-title" className="text-3xl font-black text-gray-900 tracking-tighter">Admin</h1>
            <p data-testid="txt-admin-dashboard-subtitle" className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Management Suite</p>
          </div>
          {[
            { id: 'statistics', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
            { id: 'data-manager', label: 'Data Manager', icon: <Package size={20} /> },
            { id: 'app-settings', label: 'App Settings', icon: <Settings size={20} /> },
            { id: 'catalog', label: 'Catalog', icon: <Package size={20} /> },
            { id: 'requests', label: 'Requests', icon: <Clock size={20} /> },
            { id: 'users', label: 'Users', icon: <UsersIcon size={20} /> },
            { id: 'orders', label: 'Orders', icon: <ShoppingBag size={20} /> },
          ].map((item) => (
            <button
              key={item.id}
              data-testid={`btn-admin-tab-${toKebab(item.id)}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all text-sm ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
                  : 'text-gray-400 hover:bg-gray-50 hover:text-indigo-600'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </aside>

        <div className="flex-grow space-y-8">
          {renderTabContent()}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal 
        isOpen={!!editingItem} 
        onClose={() => setEditingItem(null)} 
        title={`Edit ${
          editingItem?.type === 'user'
            ? 'User Identity'
            : editingItem?.type === 'order'
              ? 'Order Status'
              : 'Product'
        }`}
      >
        <form data-testid="frm-admin-edit-item" onSubmit={handleSaveEdit} className="space-y-6">
          {editingItem?.type === 'user' ? (
            <>
              <div>
                <label data-testid="lbl-admin-edit-user-role" className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Role</label>
                <select 
                  data-testid="cbo-admin-edit-user-role"
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
                  value={editingItem.data.role}
                  onChange={(e) => setEditingItem({...editingItem, data: { ...editingItem.data, role: e.target.value }})}
                >
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>Customer</option>
                </select>
              </div>
              <div>
                <label data-testid="lbl-admin-edit-user-status" className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Status</label>
                <select 
                  data-testid="cbo-admin-edit-user-status"
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
                  value={editingItem.data.status}
                  onChange={(e) => setEditingItem({...editingItem, data: { ...editingItem.data, status: e.target.value }})}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              {editingItem?.data.role === 'Customer' && (
                <div>
                  <label data-testid="lbl-admin-edit-user-password" className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">New Password (Customer)</label>
                  <input
                    data-testid="txt-admin-edit-user-password"
                    type="password"
                    minLength={6}
                    placeholder="Leave blank to keep current password"
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
                    value={editingItem?.data.password || ''}
                    onChange={(e) => setEditingItem({...editingItem, data: { ...editingItem.data, password: e.target.value }})}
                  />
                </div>
              )}
            </>
          ) : editingItem?.type === 'order' ? (
            <div>
              <label data-testid="lbl-admin-edit-order-status" className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Order Status</label>
              <select 
                data-testid="cbo-admin-edit-order-status"
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
                value={editingItem?.data.status}
                onChange={(e) => setEditingItem({...editingItem, data: { ...editingItem.data, status: e.target.value }})}
              >
                <option>Processing</option>
                <option>Shipped</option>
                <option>Delivered</option>
                <option>Cancelled</option>
              </select>
            </div>
          ) : (
            <>
              <input
                data-testid="txt-admin-edit-product-name"
                required
                type="text"
                placeholder="Product Name"
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
                value={editingItem?.data.name || ''}
                onChange={(e) => setEditingItem({...editingItem, data: { ...editingItem.data, name: e.target.value }})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  data-testid="txt-admin-edit-product-category"
                  required
                  type="text"
                  placeholder="Category"
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
                  value={editingItem?.data.category || ''}
                  onChange={(e) => setEditingItem({...editingItem, data: { ...editingItem.data, category: e.target.value }})}
                />
                <input
                  data-testid="txt-admin-edit-product-price"
                  required
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Price"
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
                  value={editingItem?.data.price ?? 0}
                  onChange={(e) => setEditingItem({...editingItem, data: { ...editingItem.data, price: Number(e.target.value || 0) }})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  data-testid="txt-admin-edit-product-rating"
                  type="number"
                  min={0}
                  max={5}
                  step="0.1"
                  placeholder="Rating"
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
                  value={editingItem?.data.rating ?? 0}
                  onChange={(e) => setEditingItem({...editingItem, data: { ...editingItem.data, rating: Number(e.target.value || 0) }})}
                />
                <input
                  data-testid="txt-admin-edit-product-reviews"
                  type="number"
                  min={0}
                  step="1"
                  placeholder="Reviews"
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
                  value={editingItem?.data.reviews ?? 0}
                  onChange={(e) => setEditingItem({...editingItem, data: { ...editingItem.data, reviews: Number(e.target.value || 0) }})}
                />
              </div>
              <input
                data-testid="txt-admin-edit-product-image"
                required
                type="url"
                placeholder="Image URL"
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
                value={editingItem?.data.image || ''}
                onChange={(e) => setEditingItem({...editingItem, data: { ...editingItem.data, image: e.target.value }})}
              />
              <textarea
                data-testid="txt-admin-edit-product-description"
                required
                rows={4}
                placeholder="Description"
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold resize-none"
                value={editingItem?.data.description || ''}
                onChange={(e) => setEditingItem({...editingItem, data: { ...editingItem.data, description: e.target.value }})}
              />
            </>
          )}
          <button data-testid="btn-admin-save-edit" disabled={isMutating} type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 disabled:opacity-40">
            <Save size={18} /> {isMutating ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={isCreateUserOpen}
        onClose={() => {
          setIsCreateUserOpen(false);
          setCreateUserFeedback({ type: '', text: '' });
        }}
        title="Create New User"
      >
        <form data-testid="frm-admin-create-user" onSubmit={handleCreateUser} className="space-y-4">
          <input
            data-testid="txt-admin-create-user-name"
            required
            type="text"
            placeholder="Full Name"
            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
            value={newUserForm.name}
            onChange={(e) => setNewUserForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <input
            data-testid="txt-admin-create-user-email"
            required
            type="email"
            placeholder="Email"
            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
            value={newUserForm.email}
            onChange={(e) => setNewUserForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <input
            data-testid="txt-admin-create-user-password"
            required
            minLength={6}
            type="password"
            placeholder="Password (min 6 chars)"
            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
            value={newUserForm.password}
            onChange={(e) => setNewUserForm((prev) => ({ ...prev, password: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <select
              data-testid="cbo-admin-create-user-role"
              className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
              value={newUserForm.role}
              onChange={(e) => setNewUserForm((prev) => ({ ...prev, role: e.target.value }))}
            >
              <option>Admin</option>
              <option>Manager</option>
              <option>Customer</option>
            </select>
            <select
              data-testid="cbo-admin-create-user-status"
              className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
              value={newUserForm.status}
              onChange={(e) => setNewUserForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <button
            data-testid="btn-admin-create-user-submit"
            disabled={isMutating}
            type="submit"
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 disabled:opacity-40"
          >
            <Save size={18} /> {isMutating ? 'Creating...' : 'Create User'}
          </button>
          {createUserFeedback.text && (
            <p
              data-testid="txt-admin-create-user-feedback"
              className={`text-xs font-bold ${
                createUserFeedback.type === 'success' ? 'text-emerald-600' : 'text-rose-500'
              }`}
            >
              {createUserFeedback.text}
            </p>
          )}
        </form>
      </Modal>

      <Modal
        isOpen={isCreateProductOpen}
        onClose={() => {
          setIsCreateProductOpen(false);
          setCreateProductFeedback({ type: '', text: '' });
        }}
        title="Create New Product"
      >
        <form data-testid="frm-admin-create-product" onSubmit={handleCreateProduct} className="space-y-4">
          <input
            data-testid="txt-admin-create-product-name"
            required
            type="text"
            placeholder="Product Name"
            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
            value={newProductForm.name}
            onChange={(e) => setNewProductForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              data-testid="txt-admin-create-product-category"
              required
              type="text"
              placeholder="Category"
              className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
              value={newProductForm.category}
              onChange={(e) => setNewProductForm((prev) => ({ ...prev, category: e.target.value }))}
            />
            <input
              data-testid="txt-admin-create-product-price"
              required
              type="number"
              min={0}
              step="0.01"
              placeholder="Price"
              className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
              value={newProductForm.price}
              onChange={(e) => setNewProductForm((prev) => ({ ...prev, price: Number(e.target.value || 0) }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              data-testid="txt-admin-create-product-rating"
              type="number"
              min={0}
              max={5}
              step="0.1"
              placeholder="Rating"
              className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
              value={newProductForm.rating}
              onChange={(e) => setNewProductForm((prev) => ({ ...prev, rating: Number(e.target.value || 0) }))}
            />
            <input
              data-testid="txt-admin-create-product-reviews"
              type="number"
              min={0}
              step="1"
              placeholder="Reviews"
              className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
              value={newProductForm.reviews}
              onChange={(e) => setNewProductForm((prev) => ({ ...prev, reviews: Number(e.target.value || 0) }))}
            />
          </div>
          <input
            data-testid="txt-admin-create-product-image"
            required
            type="url"
            placeholder="Image URL"
            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
            value={newProductForm.image}
            onChange={(e) => setNewProductForm((prev) => ({ ...prev, image: e.target.value }))}
          />
          <textarea
            data-testid="txt-admin-create-product-description"
            required
            rows={4}
            placeholder="Description"
            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold resize-none"
            value={newProductForm.description}
            onChange={(e) => setNewProductForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <button
            data-testid="btn-admin-create-product-submit"
            disabled={isMutating}
            type="submit"
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 disabled:opacity-40"
          >
            <Save size={18} /> {isMutating ? 'Creating...' : 'Create Product'}
          </button>
          {createProductFeedback.text && (
            <p
              data-testid="txt-admin-create-product-feedback"
              className={`text-xs font-bold ${
                createProductFeedback.type === 'success' ? 'text-emerald-600' : 'text-rose-500'
              }`}
            >
              {createProductFeedback.text}
            </p>
          )}
        </form>
      </Modal>
    </div>
  );
};

// --- Main App Logic ---

export default function App({ initialPage = 'home', embedded = false }) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [topCategoryLimit, setTopCategoryLimit] = useState(3);
  const [platformApiKeyMeta, setPlatformApiKeyMeta] = useState({
    hasApiKey: false,
    maskedApiKey: '',
    createdAt: '',
    lastUsedAt: '',
    scopes: []
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [orderUpdateRequests, setOrderUpdateRequests] = useState([]);
  const [adminOrderUpdateRequests, setAdminOrderUpdateRequests] = useState([]);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('lumina_access_token') || '');
  const [recoveryTokens, setRecoveryTokens] = useState(null);
  const [toast, setToast] = useState(null);
  const categoryImageMap = useMemo(
    () => ({
      Electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
      Accessories: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80',
      Apparel: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80',
      Fitness: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
      Home: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80',
      Office: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80',
      Beauty: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
      Garden: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
      Kids: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80',
      Automotive: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
      Books: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
      'Pet Supplies': 'https://images.unsplash.com/photo-1516734212186-65266f4d6e61?w=800&q=80',
      Gaming: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80',
      Music: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80',
      Travel: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
      Kitchen: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
      Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
      Health: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80',
      Jewelry: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
      Outdoor: 'https://images.unsplash.com/photo-1473445361085-b9a07f55608b?w=800&q=80'
    }),
    []
  );
  const topCategories = useMemo(() => {
    const categoryStats = products.reduce((acc, product) => {
      const category = String(product?.category || '').trim();
      if (!category) return acc;
      const rating = Number(product?.rating || 0);
      if (!acc[category]) {
        acc[category] = { count: 0, ratingSum: 0 };
      }
      acc[category].count += 1;
      acc[category].ratingSum += Number.isFinite(rating) ? rating : 0;
      return acc;
    }, {});

    return Object.entries(categoryStats)
      .sort((a, b) => {
        const avgA = a[1].count ? a[1].ratingSum / a[1].count : 0;
        const avgB = b[1].count ? b[1].ratingSum / b[1].count : 0;
        if (avgB !== avgA) return avgB - avgA;
        return b[1].count - a[1].count;
      })
      .slice(0, topCategoryLimit)
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        img:
          categoryImageMap[name] ||
          'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80'
      }));
  }, [products, categoryImageMap, topCategoryLimit]);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const apiRequest = async (path, options = {}) => {
    if (!API_BASE_URL) {
      throw new Error('Missing VITE_API_BASE_URL for this environment.');
    }
    const { method = 'GET', body, token = authToken } = options;
    const res = await fetch(`${API_BASE_URL}${path}`, {
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
      data = await res.json();
    } catch (_err) {
      data = null;
    }

    if (!res.ok) {
      throw new Error(data?.error || 'Request failed');
    }
    return data;
  };

  const fetchAdminData = async (token = authToken) => {
    if (!token) return;
    const [usersData, ordersData, requestData, settingsData] = await Promise.all([
      apiRequest('/admin/users', { token }),
      apiRequest('/admin/orders', { token }),
      apiRequest('/admin/order-update-requests', { token }),
      apiRequest('/admin/settings', { token })
    ]);
    setUsers(usersData.items || []);
    setOrders(ordersData.items || []);
    setAdminOrderUpdateRequests(requestData.items || []);
    const rawLimit = Number(settingsData?.topCategoryLimit);
    const normalizedLimit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.floor(rawLimit), 1), 12) : 3;
    setTopCategoryLimit(normalizedLimit);
    setPlatformApiKeyMeta({
      hasApiKey: Boolean(settingsData?.platformApiKey?.hasApiKey),
      maskedApiKey: String(settingsData?.platformApiKey?.maskedApiKey || ''),
      createdAt: String(settingsData?.platformApiKey?.createdAt || ''),
      lastUsedAt: String(settingsData?.platformApiKey?.lastUsedAt || ''),
      scopes: Array.isArray(settingsData?.platformApiKey?.scopes) ? settingsData.platformApiKey.scopes : []
    });
  };

  const fetchCatalogData = async () => {
      const [productData, categoryData] = await Promise.all([
        apiRequest('/products', { token: '' }),
        apiRequest('/products/categories', { token: '' })
      ]);
    setProducts(productData.items || []);
    setCategories(categoryData.items?.length ? categoryData.items : DEFAULT_CATEGORIES);
  };

  const fetchStorefrontSettings = async () => {
    const data = await apiRequest('/settings', { token: '' });
    const raw = Number(data?.topCategoryLimit);
    const normalized = Number.isFinite(raw) ? Math.min(Math.max(Math.floor(raw), 1), 12) : 3;
    setTopCategoryLimit(normalized);
  };

  const fetchCartData = async (token = authToken) => {
    if (!token) return;
    const data = await apiRequest('/cart', { token });
    setCart(data.items || []);
  };

  const fetchUserOrders = async (token = authToken) => {
    if (!token) return;
    const data = await apiRequest('/orders', { token });
    setUserOrders(data.items || []);
  };

  const fetchOrderUpdateRequests = async (token = authToken) => {
    if (!token) return;
    const data = await apiRequest('/order-update-requests', { token });
    setOrderUpdateRequests(data.items || []);
  };

  const refreshAllData = async (token = authToken) => {
    await Promise.all([fetchCatalogData(), fetchStorefrontSettings()]);
    if (token) {
      await Promise.all([fetchCartData(token), fetchUserOrders(token), fetchOrderUpdateRequests(token)]);
      if (user?.role === 'Admin') {
        await fetchAdminData(token);
      }
    } else if (user?.role === 'Admin') {
      await fetchAdminData(token);
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const accessToken = hash.get('access_token') || '';
    const refreshToken = hash.get('refresh_token') || '';
    const recoveryType = hash.get('type') || query.get('type') || '';
    const shouldOpenResetPage =
      query.get('reset_password') === '1' || recoveryType === 'recovery' || Boolean(accessToken);

    if (accessToken && refreshToken) {
      setRecoveryTokens({ accessToken, refreshToken });
    }
    if (shouldOpenResetPage) {
      setCurrentPage('resetPassword');
    }
  }, []);

  useEffect(() => {
    const bootstrapUser = async () => {
      try {
        await Promise.all([fetchCatalogData(), fetchStorefrontSettings()]);
      } catch (err) {
        setToast(err.message || 'Failed to load catalog');
      }
      if (!authToken) return;
      try {
        const me = await apiRequest('/auth/me', { token: authToken });
        setUser(me.user);
        await Promise.all([fetchCartData(authToken), fetchUserOrders(authToken), fetchOrderUpdateRequests(authToken)]);
      } catch (_err) {
        localStorage.removeItem('lumina_access_token');
        setAuthToken('');
        setUser(null);
      }
    };

    bootstrapUser();
  }, []);

  useEffect(() => {
    if (currentPage === 'admin' && user?.role === 'Admin' && authToken) {
      fetchAdminData().catch((err) => setToast(err.message));
    }
  }, [currentPage, user?.role, authToken]);

  const addToCart = async (product) => {
    if (!authToken) {
      setToast('Please sign in to add products to cart');
      navigateTo('login');
      return;
    }
    try {
      const data = await apiRequest('/cart/items', {
        method: 'POST',
        body: { productId: product.id, quantity: 1 }
      });
      setCart(data.items || []);
      setToast(`${product.name} added to cart`);
    } catch (err) {
      setToast(err.message || 'Failed to add item');
    }
  };

  const updateCartQty = async (id, qty) => {
    if (qty < 1 || !authToken) return;
    try {
      const data = await apiRequest(`/cart/items/${id}`, {
        method: 'PATCH',
        body: { quantity: qty }
      });
      setCart(data.items || []);
    } catch (err) {
      setToast(err.message || 'Failed to update item quantity');
    }
  };

  const removeFromCart = async (id) => {
    if (!authToken) return;
    try {
      const data = await apiRequest(`/cart/items/${id}`, { method: 'DELETE' });
      setCart(data.items || []);
    } catch (err) {
      setToast(err.message || 'Failed to remove item');
    }
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    navigateTo('productDetail');
  };

  const handleLogout = async () => {
    try {
      if (authToken) {
        await apiRequest('/auth/logout', { method: 'POST' });
      }
    } catch (_err) {
      // Ignore logout network failures and clear local auth state.
    }
    localStorage.removeItem('lumina_access_token');
    setAuthToken('');
    setUser(null);
    setUsers([]);
    setOrders([]);
    setUserOrders([]);
    setOrderUpdateRequests([]);
    setAdminOrderUpdateRequests([]);
    setPlatformApiKeyMeta({
      hasApiKey: false,
      maskedApiKey: '',
      createdAt: '',
      lastUsedAt: '',
      scopes: []
    });
    setCart([]);
    navigateTo('home');
  };

  const handleAuth = async ({ email, password, name, isLogin }) => {
    const payload = isLogin ? { email, password } : { email, password, name };
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    let data = await apiRequest(endpoint, { method: 'POST', body: payload, token: '' });
    let token = data?.session?.access_token || '';

    // Supabase can return null session on signup when email confirmation is enabled.
    if (!token && !isLogin) {
      data = await apiRequest('/auth/login', { method: 'POST', body: { email, password }, token: '' });
      token = data?.session?.access_token || '';
    }

    if (!token) {
      throw new Error('Authentication succeeded but no session is available yet.');
    }

    localStorage.setItem('lumina_access_token', token);
    setAuthToken(token);
    setUser(data.user);
    await Promise.all([fetchCartData(token), fetchUserOrders(token), fetchOrderUpdateRequests(token)]);
    setToast(isLogin ? 'Logged in successfully' : 'Account created');
    navigateTo('home');
  };

  const handlePasswordResetRequest = async (email) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      throw new Error('Email is required');
    }

    const redirectTo = PASSWORD_RESET_REDIRECT_URL;
    await apiRequest('/auth/password-reset', {
      method: 'POST',
      body: { email: normalizedEmail, redirectTo },
      token: ''
    });
    setToast('If the account exists, a reset email has been sent');
  };

  const handleProfilePasswordChange = async ({ oldPassword, newPassword }) => {
    await apiRequest('/auth/password-change', {
      method: 'POST',
      body: { oldPassword, newPassword }
    });
    setToast('Password updated');
  };

  const handleAccountUpdate = async (payload) => {
    const data = await apiRequest('/auth/me', {
      method: 'PATCH',
      body: payload
    });
    setUser(data.user);
    setToast('Account info updated');
    return data.user;
  };

  const handleOrderUpdateRequestCreate = async (orderId, payload) => {
    const data = await apiRequest(`/orders/${encodeURIComponent(orderId)}/update-request`, {
      method: 'POST',
      body: payload
    });
    await fetchOrderUpdateRequests();
    setToast('Order update request submitted');
    return data.request;
  };

  const handlePasswordResetConfirm = async ({ accessToken, refreshToken, password }) => {
    await apiRequest('/auth/password-reset/confirm', {
      method: 'POST',
      body: { accessToken, refreshToken, password },
      token: ''
    });
    setRecoveryTokens(null);
    setToast('Password updated. Please sign in.');
    window.history.replaceState({}, '', window.location.pathname);
    navigateTo('login');
  };

  const handleAdminUserUpdate = async (userId, updates) => {
    const data = await apiRequest(`/admin/users/${userId}`, { method: 'PATCH', body: updates });
    setUsers((prev) => prev.map((item) => (item.id === userId ? data.user : item)));
  };

  const handleAdminUserCreate = async (payload) => {
    const data = await apiRequest('/admin/users', { method: 'POST', body: payload });
    setUsers((prev) => [data.user, ...prev]);
    setToast('User created');
  };

  const handleAdminUserDelete = async (userId) => {
    await apiRequest(`/admin/users/${userId}`, { method: 'DELETE' });
    setUsers((prev) => prev.filter((item) => item.id !== userId));
  };

  const handleAdminOrderUpdate = async (orderId, updates) => {
    const data = await apiRequest(`/admin/orders/${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      body: updates
    });
    setOrders((prev) => prev.map((item) => (item.id === orderId ? data.order : item)));
  };

  const handleAdminOrderDelete = async (orderId) => {
    await apiRequest(`/admin/orders/${encodeURIComponent(orderId)}`, { method: 'DELETE' });
    setOrders((prev) => prev.filter((item) => item.id !== orderId));
  };

  const handleAdminOrderUpdateRequest = async (requestId, updates) => {
    const data = await apiRequest(`/admin/order-update-requests/${requestId}`, {
      method: 'PATCH',
      body: updates
    });
    setAdminOrderUpdateRequests((prev) => prev.map((item) => (item.id === requestId ? data.request : item)));
  };

  const handleAdminProductCreate = async (payload) => {
    const data = await apiRequest('/admin/products', { method: 'POST', body: payload });
    setProducts((prev) => [data.product, ...prev]);
    setCategories((prev) => (prev.includes(data.product.category) ? prev : [...prev, data.product.category]));
    setToast('Product created');
  };

  const handleAdminProductUpdate = async (productId, updates) => {
    const data = await apiRequest(`/admin/products/${encodeURIComponent(productId)}`, {
      method: 'PATCH',
      body: updates
    });
    setProducts((prev) => prev.map((item) => (item.id === productId ? data.product : item)));
    setCategories((prev) => (prev.includes(data.product.category) ? prev : [...prev, data.product.category]));
  };

  const handleAdminProductDelete = async (productId) => {
    await apiRequest(`/admin/products/${encodeURIComponent(productId)}`, { method: 'DELETE' });
    setProducts((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleDataControlClear = async (targets) => {
    await apiRequest('/admin/data-control/clear', { method: 'POST', body: { targets } });
    await refreshAllData();
    setToast(`Cleared: ${targets.join(', ')}`);
  };

  const handleDataControlSeed = async ({ targets, productCount, categoryCount, userCount, orderCount }) => {
    const data = await apiRequest('/admin/data-control/seed', {
      method: 'POST',
      body: { targets, productCount, categoryCount, userCount, orderCount }
    });
    await refreshAllData();
    setToast(
      `Seeded ${data.insertedProducts ?? 0} products across ${data.seededCategoryCount ?? categoryCount ?? 0} categories, ${data.insertedUsers ?? 0} users, ${data.insertedOrders ?? 0} orders`
    );
  };

  const handleAppSettingsSave = async ({ topCategoryLimit: rawValue, platformApiKeyScopes }) => {
    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed)) return;
    const normalized = Math.min(Math.max(Math.floor(parsed), 1), 12);
    try {
      const data = await apiRequest('/admin/settings', {
        method: 'PATCH',
        body: { topCategoryLimit: normalized, platformApiKeyScopes }
      });
      const saved = Number(data?.topCategoryLimit);
      setTopCategoryLimit(Number.isFinite(saved) ? Math.min(Math.max(Math.floor(saved), 1), 12) : normalized);
      setPlatformApiKeyMeta({
        hasApiKey: Boolean(data?.platformApiKey?.hasApiKey),
        maskedApiKey: String(data?.platformApiKey?.maskedApiKey || ''),
        createdAt: String(data?.platformApiKey?.createdAt || ''),
        lastUsedAt: String(data?.platformApiKey?.lastUsedAt || ''),
        scopes: Array.isArray(data?.platformApiKey?.scopes) ? data.platformApiKey.scopes : []
      });
      setToast('Admin settings updated');
    } catch (err) {
      setToast(err.message || 'Failed to update admin settings');
      throw err;
    }
  };

  const handleApiKeyGenerate = async (scopes = []) => {
    const data = await apiRequest('/admin/api-key', { method: 'POST', body: { scopes } });
    setPlatformApiKeyMeta({
      hasApiKey: Boolean(data?.hasApiKey),
      maskedApiKey: String(data?.maskedApiKey || ''),
      createdAt: String(data?.createdAt || ''),
      lastUsedAt: String(data?.lastUsedAt || ''),
      scopes: Array.isArray(data?.scopes) ? data.scopes : []
    });
    return data;
  };

  const handleApiKeyRevoke = async () => {
    const data = await apiRequest('/admin/api-key', { method: 'DELETE' });
    setPlatformApiKeyMeta({
      hasApiKey: Boolean(data?.hasApiKey),
      maskedApiKey: String(data?.maskedApiKey || ''),
      createdAt: String(data?.createdAt || ''),
      lastUsedAt: String(data?.lastUsedAt || ''),
      scopes: Array.isArray(data?.scopes) ? data.scopes : []
    });
    return data;
  };

  const handleOrderComplete = async () => {
    if (!authToken) {
      setToast('Please sign in to complete checkout');
      navigateTo('login');
      return;
    }

    try {
      await apiRequest('/orders/checkout', { method: 'POST', body: { paymentMethod: 'card' } });
      await Promise.all([fetchCartData(), fetchUserOrders(), fetchOrderUpdateRequests()]);
      setToast('Order placed successfully');
      if (user?.role === 'Admin') {
        await fetchAdminData();
      }
      navigateTo('success');
    } catch (err) {
      setToast(err.message || 'Checkout failed');
    }
  };

  const renderContent = () => {
    switch(currentPage) {
      case 'home': return <Home onNavigate={navigateTo} topCategories={topCategories} />;
      case 'shop': return <Shop products={products} categories={categories} onAddToCart={addToCart} onProductClick={handleProductClick} />;
      case 'admin': return (
        <AdminDashboard
          products={products}
          categories={categories}
          users={users}
          orders={orders}
          orderUpdateRequests={adminOrderUpdateRequests}
          topCategoryLimit={topCategoryLimit}
          platformApiKeyMeta={platformApiKeyMeta}
          onSaveAppSettings={handleAppSettingsSave}
          onGenerateApiKey={handleApiKeyGenerate}
          onRevokeApiKey={handleApiKeyRevoke}
          currentUserId={user?.id}
          onCreateUser={handleAdminUserCreate}
          onUpdateUser={handleAdminUserUpdate}
          onDeleteUser={handleAdminUserDelete}
          onUpdateOrder={handleAdminOrderUpdate}
          onDeleteOrder={handleAdminOrderDelete}
          onUpdateOrderUpdateRequest={handleAdminOrderUpdateRequest}
          onCreateProduct={handleAdminProductCreate}
          onUpdateProduct={handleAdminProductUpdate}
          onDeleteProduct={handleAdminProductDelete}
          onDataClear={handleDataControlClear}
          onDataSeed={handleDataControlSeed}
          onNotify={setToast}
        />
      );
      case 'cart': return (
        <Cart 
          cart={cart} 
          onUpdateQty={updateCartQty} 
          onRemove={removeFromCart} 
          onCheckout={() => navigateTo('checkout')} 
          onNavigate={navigateTo} 
        />
      );
      case 'login': return (
        <Login 
          onLoginSuccess={handleAuth}
          onRequestPasswordReset={handlePasswordResetRequest}
          onNavigate={navigateTo} 
        />
      );
      case 'resetPassword': return (
        <ResetPassword
          onResetPassword={handlePasswordResetConfirm}
          onNavigate={navigateTo}
          recoveryTokens={recoveryTokens}
        />
      );
      case 'profile': return (
        <Profile
          user={user}
          orders={userOrders}
          orderUpdateRequests={orderUpdateRequests}
          onLogout={handleLogout}
          onSaveAccountInfo={handleAccountUpdate}
          onChangePassword={handleProfilePasswordChange}
          onRequestOrderUpdate={handleOrderUpdateRequestCreate}
        />
      );
      case 'checkout': return <Checkout cart={cart} onComplete={handleOrderComplete} onNavigate={navigateTo} />;
      case 'success': return <Success onNavigate={navigateTo} />;
      case 'productDetail': return selectedProduct ? (
        <div data-testid="fra-product-detail-main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-in fade-in duration-500">
          <button data-testid="btn-product-detail-back-catalog" onClick={() => navigateTo('shop')} className="flex items-center gap-2 text-gray-400 font-bold mb-12 hover:text-indigo-600 transition-colors uppercase text-xs tracking-widest">
            <ArrowRight className="rotate-180" size={16} /> Back to Catalog
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="rounded-[3rem] overflow-hidden shadow-2xl h-[600px] bg-gray-50 border-8 border-white">
              <img data-testid={`img-product-detail-${toKebab(selectedProduct.id)}`} src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
            </div>
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-4">
                <span data-testid={`txt-product-detail-category-${toKebab(selectedProduct.id)}`} className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-black rounded-full uppercase tracking-widest leading-none">{selectedProduct.category}</span>
                <h1 data-testid={`txt-product-detail-name-${toKebab(selectedProduct.id)}`} className="text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">{selectedProduct.name}</h1>
              </div>
              <p data-testid={`txt-product-detail-price-${toKebab(selectedProduct.id)}`} className="text-4xl font-black text-indigo-600 tracking-tighter">${selectedProduct.price.toFixed(2)}</p>
              <p data-testid={`txt-product-detail-description-${toKebab(selectedProduct.id)}`} className="text-gray-500 leading-relaxed text-lg font-medium">{selectedProduct.description}</p>
              <button 
                data-testid={`btn-product-detail-add-cart-${toKebab(selectedProduct.id)}`}
                onClick={() => addToCart(selectedProduct)}
                className="w-full bg-gray-900 text-white py-6 rounded-3xl font-black hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 shadow-2xl hover:shadow-indigo-200 text-xl tracking-widest uppercase"
              >
                <ShoppingBag size={24} /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      ) : <Shop products={products} categories={categories} onAddToCart={addToCart} onProductClick={handleProductClick} />;
      default: return <Home onNavigate={navigateTo} />;
    }
  };

  return (
    <div data-testid="fra-app-root" className="min-h-screen bg-white text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {!embedded ? (
        <Navbar
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          onNavigate={navigateTo}
          currentPage={currentPage}
          user={user}
          onLogout={handleLogout}
        />
      ) : null}
      <main data-testid="fra-app-content" className={embedded ? 'min-h-screen' : 'pt-16 min-h-[calc(100vh-64px)]'}>
        {renderContent()}
      </main>
      {toast && (
        <div data-testid="fra-app-toast" className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-md text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-12 z-[300] border border-white/10">
          <div className="bg-green-500 p-1.5 rounded-full"><CheckCircle size={16} /></div>
          <span data-testid="txt-app-toast-message" className="text-xs font-black uppercase tracking-widest">{toast}</span>
        </div>
      )}
      {!embedded ? <Footer /> : null}
    </div>
  );
}

// Reuse previously defined Success, Checkout, Login, Cart, Profile for brevity and consistency...
const Cart = ({ cart, onUpdateQty, onRemove, onCheckout, onNavigate }) => {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = total > 150 ? 0 : 15;
  if (cart.length === 0) return (
    <div data-testid="fra-cart-empty" className="max-w-7xl mx-auto px-4 py-32 text-center animate-in zoom-in duration-700">
      <div className="w-32 h-32 bg-indigo-50 rounded-[3rem] flex items-center justify-center mx-auto mb-10 text-indigo-600"><ShoppingBag size={56} /></div>
      <h2 data-testid="txt-cart-empty-title" className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Bag is Empty</h2>
      <button data-testid="btn-cart-empty-explore-catalog" onClick={() => onNavigate('shop')} className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl uppercase tracking-widest text-xs">Explore Catalog</button>
    </div>
  );
  return (
    <div data-testid="fra-cart-main" className="max-w-7xl mx-auto px-4 py-16">
      <h1 data-testid="txt-cart-title" className="text-5xl font-black text-gray-900 mb-16 tracking-tight">Bag</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-8">
          {cart.map(item => (
            <div key={item.id} data-testid={`fra-cart-item-${toKebab(item.id)}`} className="flex flex-col sm:flex-row gap-8 p-8 bg-white rounded-[2.5rem] border-2 border-gray-50 hover:border-indigo-50 transition-all group">
              <div className="w-32 h-32 rounded-3xl overflow-hidden flex-shrink-0 border-4 border-white shadow-md">
                <img data-testid={`img-cart-item-${toKebab(item.id)}`} src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex-grow flex flex-col sm:flex-row justify-between gap-6">
                <div>
                  <h3 data-testid={`txt-cart-item-name-${toKebab(item.id)}`} className="font-black text-gray-900 text-xl mb-1">{item.name}</h3>
                  <div className="flex items-center gap-5 bg-gray-50 w-max rounded-2xl p-1.5 border border-gray-100">
                    <button data-testid={`btn-cart-qty-decrease-${toKebab(item.id)}`} onClick={() => onUpdateQty(item.id, item.quantity - 1)} className="p-2 hover:bg-white rounded-xl transition-all" disabled={item.quantity <= 1}><Minus size={16} /></button>
                    <span data-testid={`txt-cart-item-quantity-${toKebab(item.id)}`} className="text-sm font-black w-8 text-center">{item.quantity}</span>
                    <button data-testid={`btn-cart-qty-increase-${toKebab(item.id)}`} onClick={() => onUpdateQty(item.id, item.quantity + 1)} className="p-2 hover:bg-white rounded-xl transition-all"><Plus size={16} /></button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between py-1">
                  <span data-testid={`txt-cart-item-total-${toKebab(item.id)}`} className="text-2xl font-black text-gray-900 tracking-tighter">${(item.price * item.quantity).toFixed(2)}</span>
                  <button data-testid={`btn-cart-remove-item-${toKebab(item.id)}`} onClick={() => onRemove(item.id)} className="text-gray-300 hover:text-red-500 p-3 rounded-2xl hover:bg-red-50"><Trash2 size={20} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className="bg-gray-900 text-white rounded-[2.5rem] p-10 sticky top-24 shadow-2xl overflow-hidden">
            <h3 data-testid="txt-cart-summary-title" className="text-2xl font-black mb-10 tracking-tight uppercase tracking-widest text-xs opacity-50">Summary</h3>
            <div className="space-y-6 mb-10">
              <div className="flex justify-between text-gray-400 font-bold uppercase tracking-widest text-[10px]"><span data-testid="txt-cart-summary-subtotal-label">Subtotal</span><span data-testid="txt-cart-summary-subtotal-value" className="text-white text-sm">${total.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-400 font-bold uppercase tracking-widest text-[10px]"><span data-testid="txt-cart-summary-shipping-label">Shipping</span><span data-testid="txt-cart-summary-shipping-value" className="text-white text-sm">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
              <div className="pt-6 border-t border-white/10 flex justify-between items-end"><span data-testid="txt-cart-summary-total-value" className="text-3xl font-black text-indigo-400 tracking-tighter">${(total + shipping).toFixed(2)}</span></div>
            </div>
            <button data-testid="btn-cart-checkout" onClick={onCheckout} className="w-full bg-white text-gray-900 py-5 rounded-2xl font-black hover:bg-indigo-400 hover:text-white transition-all uppercase tracking-[0.2em] text-xs">Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Profile = ({ user, orders = [], orderUpdateRequests = [], onLogout, onChangePassword, onSaveAccountInfo, onRequestOrderUpdate }) => {
  const buildAccountForm = (currentUser) => ({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    addressLine1: currentUser?.addressLine1 || '',
    addressLine2: currentUser?.addressLine2 || '',
    addressCity: currentUser?.addressCity || '',
    addressState: currentUser?.addressState || '',
    addressPostalCode: currentUser?.addressPostalCode || ''
  });

  const buildRequestForm = (currentOrder) => ({
    shippingRecipient: currentOrder?.shippingDetails?.recipient || user?.name || '',
    shippingPhone: currentOrder?.shippingDetails?.phone || user?.phone || '',
    shippingAddressLine1: currentOrder?.shippingDetails?.addressLine1 || user?.addressLine1 || '',
    shippingAddressLine2: currentOrder?.shippingDetails?.addressLine2 || user?.addressLine2 || '',
    shippingCity: currentOrder?.shippingDetails?.city || user?.addressCity || '',
    shippingState: currentOrder?.shippingDetails?.state || user?.addressState || '',
    shippingPostalCode: currentOrder?.shippingDetails?.postalCode || user?.addressPostalCode || '',
    reason: ''
  });

  const [accountForm, setAccountForm] = useState(() => buildAccountForm(user));
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountMessage, setAccountMessage] = useState('');
  const [accountError, setAccountError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [requestForm, setRequestForm] = useState(() => buildRequestForm(null));
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestError, setRequestError] = useState('');

  useEffect(() => {
    setAccountForm(buildAccountForm(user));
  }, [user]);

  useEffect(() => {
    if (!selectedOrder) return;
    setRequestForm(buildRequestForm(selectedOrder));
  }, [selectedOrder, user]);

  const latestRequestsByOrder = useMemo(() => {
    const map = new Map();
    (orderUpdateRequests || []).forEach((request) => {
      if (!map.has(request.orderId)) {
        map.set(request.orderId, request);
      }
    });
    return map;
  }, [orderUpdateRequests]);

  const formatChangeLabel = (field) =>
    String(field || '')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (char) => char.toUpperCase())
      .trim();

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setAccountMessage('');
    setAccountError('');

    if (!accountForm.name.trim() || !accountForm.email.trim()) {
      setAccountError('Name and email are required.');
      return;
    }

    setIsSavingAccount(true);
    try {
      const updatedUser = await onSaveAccountInfo({
        name: accountForm.name.trim(),
        email: accountForm.email.trim(),
        phone: accountForm.phone.trim(),
        addressLine1: accountForm.addressLine1.trim(),
        addressLine2: accountForm.addressLine2.trim(),
        addressCity: accountForm.addressCity.trim(),
        addressState: accountForm.addressState.trim(),
        addressPostalCode: accountForm.addressPostalCode.trim()
      });
      if (updatedUser) {
        setAccountForm(buildAccountForm(updatedUser));
      }
      setAccountMessage('Account info saved.');
    } catch (err) {
      setAccountError(err.message || 'Failed to update account info');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (!oldPassword || !newPassword) {
      setPasswordError('Old password and new password are required.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await onChangePassword({ oldPassword, newPassword });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('Password updated successfully.');
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const openRequestModal = (order) => {
    setSelectedOrder(order);
    setRequestError('');
    setRequestForm(buildRequestForm(order));
  };

  const closeRequestModal = () => {
    setSelectedOrder(null);
    setRequestError('');
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setRequestError('');

    const requestedChanges = {
      shippingRecipient: requestForm.shippingRecipient.trim(),
      shippingPhone: requestForm.shippingPhone.trim(),
      shippingAddressLine1: requestForm.shippingAddressLine1.trim(),
      shippingAddressLine2: requestForm.shippingAddressLine2.trim(),
      shippingCity: requestForm.shippingCity.trim(),
      shippingState: requestForm.shippingState.trim(),
      shippingPostalCode: requestForm.shippingPostalCode.trim()
    };

    if (!Object.values(requestedChanges).some(Boolean)) {
      setRequestError('Add at least one order detail to request an update.');
      return;
    }

    setIsSubmittingRequest(true);
    try {
      await onRequestOrderUpdate(selectedOrder.id, {
        reason: requestForm.reason.trim(),
        requestedChanges
      });
      setSelectedOrder(null);
    } catch (err) {
      setRequestError(err.message || 'Failed to submit request');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <div data-testid="fra-profile-main" className="max-w-6xl mx-auto px-4 py-16 animate-in slide-in-from-bottom-8">
      <div className="bg-white rounded-[3rem] border-2 border-gray-50 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 h-48 relative">
          <div className="absolute -bottom-16 left-12 w-32 h-32 rounded-[2.5rem] bg-white p-1.5 shadow-xl">
            <div className="w-full h-full rounded-[2rem] bg-indigo-50 flex items-center justify-center text-indigo-600">
              <User size={48} />
            </div>
          </div>
        </div>
        <div className="pt-20 px-8 md:px-12 pb-12 space-y-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-gray-100 pb-10">
            <div>
              <h1 data-testid="txt-profile-name" className="text-4xl font-black text-gray-900 tracking-tight">{user?.name}</h1>
              <p data-testid="txt-profile-email" className="text-gray-500 font-medium">{user?.email}</p>
              <span data-testid="txt-profile-role" className="inline-block mt-3 px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest">{user?.role}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl bg-gray-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-500">
                {orders?.length || 0} orders
              </div>
              <div className="rounded-2xl bg-gray-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-500">
                ${Number(user?.totalSpent || 0).toFixed(2)} spent
              </div>
              <button data-testid="btn-profile-sign-out" onClick={onLogout} className="px-6 py-3 bg-red-50 rounded-2xl font-bold text-red-600 hover:bg-red-100 flex items-center gap-2">
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-8">
            <div className="bg-gray-50 rounded-[2.5rem] p-8 shadow-inner space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 data-testid="txt-profile-account-title" className="text-2xl font-black text-gray-900">Account Info</h3>
                  <p data-testid="txt-profile-account-description" className="text-sm text-gray-400 mt-1">
                    Update your own profile details.
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Customer</span>
              </div>
              <form data-testid="frm-profile-account-info" onSubmit={handleAccountSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    data-testid="txt-profile-account-name"
                    type="text"
                    placeholder="Full name"
                    value={accountForm.name}
                    onChange={(e) => setAccountForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-white rounded-xl outline-none border border-gray-200 text-sm"
                  />
                  <input
                    data-testid="txt-profile-account-email"
                    type="email"
                    placeholder="Email address"
                    value={accountForm.email}
                    onChange={(e) => setAccountForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-white rounded-xl outline-none border border-gray-200 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    data-testid="txt-profile-account-phone"
                    type="text"
                    placeholder="Phone number"
                    value={accountForm.phone}
                    onChange={(e) => setAccountForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-white rounded-xl outline-none border border-gray-200 text-sm"
                  />
                  <input
                    data-testid="txt-profile-account-address-line1"
                    type="text"
                    placeholder="Address line 1"
                    value={accountForm.addressLine1}
                    onChange={(e) => setAccountForm((prev) => ({ ...prev, addressLine1: e.target.value }))}
                    className="w-full px-4 py-3 bg-white rounded-xl outline-none border border-gray-200 text-sm"
                  />
                </div>
                <input
                  data-testid="txt-profile-account-address-line2"
                  type="text"
                  placeholder="Address line 2"
                  value={accountForm.addressLine2}
                  onChange={(e) => setAccountForm((prev) => ({ ...prev, addressLine2: e.target.value }))}
                  className="w-full px-4 py-3 bg-white rounded-xl outline-none border border-gray-200 text-sm"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    data-testid="txt-profile-account-city"
                    type="text"
                    placeholder="City"
                    value={accountForm.addressCity}
                    onChange={(e) => setAccountForm((prev) => ({ ...prev, addressCity: e.target.value }))}
                    className="w-full px-4 py-3 bg-white rounded-xl outline-none border border-gray-200 text-sm"
                  />
                  <input
                    data-testid="txt-profile-account-state"
                    type="text"
                    placeholder="State / Province"
                    value={accountForm.addressState}
                    onChange={(e) => setAccountForm((prev) => ({ ...prev, addressState: e.target.value }))}
                    className="w-full px-4 py-3 bg-white rounded-xl outline-none border border-gray-200 text-sm"
                  />
                  <input
                    data-testid="txt-profile-account-postal-code"
                    type="text"
                    placeholder="Postal code"
                    value={accountForm.addressPostalCode}
                    onChange={(e) => setAccountForm((prev) => ({ ...prev, addressPostalCode: e.target.value }))}
                    className="w-full px-4 py-3 bg-white rounded-xl outline-none border border-gray-200 text-sm"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    data-testid="btn-profile-account-save"
                    type="submit"
                    disabled={isSavingAccount}
                    className="px-5 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-40"
                  >
                    {isSavingAccount ? 'Saving...' : 'Save Account Info'}
                  </button>
                  <p className="text-xs text-gray-400 font-medium">Your changes are limited to your own account.</p>
                </div>
              </form>
              {accountMessage && <p data-testid="txt-profile-account-success" className="text-xs font-bold text-emerald-600">{accountMessage}</p>}
              {accountError && <p data-testid="txt-profile-account-error" className="text-xs font-bold text-rose-500">{accountError}</p>}
            </div>

            <div className="bg-gray-50 rounded-[2.5rem] p-8 shadow-inner space-y-6">
              <div>
                <h3 data-testid="txt-profile-settings-title" className="text-2xl font-black">Security</h3>
                <p data-testid="txt-profile-settings-description" className="text-sm text-gray-400 mt-1">Change your password.</p>
              </div>
              <form data-testid="frm-profile-change-password" onSubmit={handlePasswordChange} className="space-y-3">
                <input
                  data-testid="txt-profile-old-password"
                  type="password"
                  placeholder="Old password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-xl outline-none border border-gray-200 text-sm"
                />
                <input
                  data-testid="txt-profile-new-password"
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-xl outline-none border border-gray-200 text-sm"
                />
                <input
                  data-testid="txt-profile-confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-xl outline-none border border-gray-200 text-sm"
                />
                <button
                  data-testid="btn-profile-update-password"
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-5 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-40"
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
              {passwordMessage && <p data-testid="txt-profile-password-success" className="text-xs font-bold text-emerald-600">{passwordMessage}</p>}
              {passwordError && <p data-testid="txt-profile-password-error" className="text-xs font-bold text-rose-500">{passwordError}</p>}
            </div>
          </div>

          <div className="bg-gray-50 rounded-[2.5rem] p-8 shadow-inner space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h3 data-testid="txt-profile-orders-title" className="text-2xl font-black text-gray-900">Orders</h3>
                <p data-testid="txt-profile-orders-summary" className="text-sm text-gray-400 mt-1">
                  {orders?.length ? `${orders.length} order(s) in history` : 'No orders yet'}
                </p>
              </div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-gray-400">Update requests live here too</p>
            </div>

            {orders?.length ? (
              <div className="space-y-4">
                {orders.map((order) => {
                  const latestRequest = latestRequestsByOrder.get(order.id);
                  const shippingDetails = order.shippingDetails || {};
                  const shippingLines = [
                    shippingDetails.recipient,
                    shippingDetails.addressLine1,
                    shippingDetails.addressLine2,
                    [shippingDetails.city, shippingDetails.state, shippingDetails.postalCode].filter(Boolean).join(', ')
                  ].filter(Boolean);
                  const orderLabel = `#ORD-${String(order.id).padStart(4, '0')}`;
                  const requestDisabled = latestRequest?.status === 'Pending';
                  return (
                    <div key={order.id} data-testid={`fra-profile-order-${toKebab(order.id)}`} className="rounded-[2rem] bg-white border border-gray-100 p-6 shadow-sm">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h4 data-testid={`txt-profile-order-id-${toKebab(order.id)}`} className="text-xl font-black text-gray-900">{orderLabel}</h4>
                            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                              {order.status}
                            </span>
                            {latestRequest && (
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${latestRequest.status === 'Pending' ? 'bg-amber-50 text-amber-700' : latestRequest.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                Request {latestRequest.status}
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-gray-500">
                            Placed {order.createdAt ? formatShortDate(order.createdAt) : 'recently'} · ${Number(order.total || 0).toFixed(2)}
                          </p>
                          {shippingLines.length > 0 && (
                            <p className="mt-2 text-sm text-gray-400">
                              {shippingLines.join(' · ')}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          data-testid={`btn-profile-order-request-${toKebab(order.id)}`}
                          onClick={() => openRequestModal(order)}
                          disabled={requestDisabled}
                          className="px-5 py-3 rounded-2xl bg-gray-900 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {requestDisabled ? 'Request Pending' : 'Request Order Update'}
                        </button>
                      </div>

                      {latestRequest && (
                        <div className="mt-5 rounded-[1.5rem] border border-gray-100 bg-gray-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-black uppercase tracking-[0.25em] text-gray-400">Latest update request</p>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{latestRequest.status}</span>
                          </div>
                          <p className="mt-2 text-sm text-gray-600">{latestRequest.reason || 'No reason provided.'}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {Object.entries(latestRequest.requestedChanges || {}).map(([field, value]) => (
                              <span key={field} className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-gray-500 border border-gray-200">
                                {formatChangeLabel(field)}: {String(value)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-gray-200 bg-white p-8 text-center">
                <p className="text-sm text-gray-400">No orders yet. Once you check out, they’ll appear here with request options.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={closeRequestModal}
        title={selectedOrder ? `Update #ORD-${String(selectedOrder.id).padStart(4, '0')}` : 'Order Update'}
      >
        {selectedOrder && (
          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <p className="text-sm text-gray-500 leading-relaxed">
              Request a review for shipping or order information changes. The order itself is not edited directly here.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Recipient"
                value={requestForm.shippingRecipient}
                onChange={(e) => setRequestForm((prev) => ({ ...prev, shippingRecipient: e.target.value }))}
                className="w-full px-4 py-3 bg-white rounded-xl outline-none border border-gray-200 text-sm"
              />
              <input
                type="text"
                placeholder="Phone"
                value={requestForm.shippingPhone}
                onChange={(e) => setRequestForm((prev) => ({ ...prev, shippingPhone: e.target.value }))}
                className="w-full px-4 py-3 bg-white rounded-xl outline-none border border-gray-200 text-sm"
              />
            </div>
            <input
              type="text"
              placeholder="Address line 1"
              value={requestForm.shippingAddressLine1}
              onChange={(e) => setRequestForm((prev) => ({ ...prev, shippingAddressLine1: e.target.value }))}
              className="w-full px-4 py-3 bg-white rounded-xl outline-none border border-gray-200 text-sm"
            />
            <input
              type="text"
              placeholder="Address line 2"
              value={requestForm.shippingAddressLine2}
              onChange={(e) => setRequestForm((prev) => ({ ...prev, shippingAddressLine2: e.target.value }))}
              className="w-full px-4 py-3 bg-white rounded-xl outline-none border border-gray-200 text-sm"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="City"
                value={requestForm.shippingCity}
                onChange={(e) => setRequestForm((prev) => ({ ...prev, shippingCity: e.target.value }))}
                className="w-full px-4 py-3 bg-white rounded-xl outline-none border border-gray-200 text-sm"
              />
              <input
                type="text"
                placeholder="State"
                value={requestForm.shippingState}
                onChange={(e) => setRequestForm((prev) => ({ ...prev, shippingState: e.target.value }))}
                className="w-full px-4 py-3 bg-white rounded-xl outline-none border border-gray-200 text-sm"
              />
              <input
                type="text"
                placeholder="Postal code"
                value={requestForm.shippingPostalCode}
                onChange={(e) => setRequestForm((prev) => ({ ...prev, shippingPostalCode: e.target.value }))}
                className="w-full px-4 py-3 bg-white rounded-xl outline-none border border-gray-200 text-sm"
              />
            </div>
            <textarea
              placeholder="Reason for update"
              value={requestForm.reason}
              onChange={(e) => setRequestForm((prev) => ({ ...prev, reason: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 bg-white rounded-xl outline-none border border-gray-200 text-sm resize-none"
            />
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmittingRequest}
                className="px-5 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-40"
              >
                {isSubmittingRequest ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                type="button"
                onClick={closeRequestModal}
                className="px-5 py-3 bg-white text-gray-700 rounded-2xl text-xs font-black uppercase tracking-widest border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
            {requestError && <p className="text-xs font-bold text-rose-500">{requestError}</p>}
          </form>
        )}
      </Modal>
    </div>
  );
};

const Login = ({ onLoginSuccess, onNavigate, onRequestPasswordReset }) => {
  const [view, setView] = useState('login'); // 'login' | 'forgot-password' | 'success'
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await onLoginSuccess({
        email: formData.email,
        password: formData.password,
        name: formData.name || 'Alex Johnson',
        isLogin
      });
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetRequest = async (e) => {
    e.preventDefault();
    const email = String(formData.email || '').trim();
    if (!email) {
      setError('Enter your email first to reset password');
      return;
    }

    setError('');
    setIsResetLoading(true);
    try {
      await onRequestPasswordReset(email);
      setView('success');
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div data-testid="fra-login-main" className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[440px] bg-white rounded-[48px] shadow-2xl shadow-slate-200/50 p-10 md:p-14 border border-slate-50 relative overflow-hidden">
        {view === 'login' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 data-testid="txt-login-title" className="text-4xl font-extrabold text-slate-900 mb-10 tracking-tight">
              {isLogin ? 'Login' : 'Join'}
            </h1>

            <form data-testid="frm-login-auth" onSubmit={handleLogin} className="space-y-4">
              {!isLogin && (
                <input
                  data-testid="txt-login-name"
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 text-lg outline-none"
                />
              )}
              <input
                data-testid="txt-login-email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 text-lg outline-none placeholder:text-slate-300"
              />
              <input
                data-testid="txt-login-password"
                type="password"
                placeholder="........"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 text-lg outline-none placeholder:text-slate-300 tracking-widest"
              />

              {isLogin && (
                <button
                  data-testid="btn-login-open-forgot-password"
                  type="button"
                  onClick={() => {
                    setError('');
                    setView('forgot-password');
                  }}
                  className="block text-[11px] font-black text-indigo-600 tracking-widest uppercase hover:text-indigo-700 transition-colors pt-2"
                >
                  Forgot Password? Send Reset Email
                </button>
              )}

              <button
                data-testid="btn-login-submit-auth"
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0F172A] text-white font-bold py-5 rounded-2xl text-sm tracking-widest uppercase mt-6 hover:bg-slate-800 transition-all disabled:opacity-70"
              >
                {isLoading ? 'Please wait...' : isLogin ? 'Sign In' : 'Join'}
              </button>

              {error && (
                <div className="flex items-center gap-2 mt-4">
                  <span data-testid="txt-login-error-message" className="text-rose-500 text-sm font-semibold">{error}</span>
                </div>
              )}
            </form>

            <div className="mt-12 text-center">
              <p data-testid="txt-login-switch-caption" className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">
                {isLogin ? 'New?' : 'Member?'}{' '}
                <button
                  data-testid="btn-login-switch-mode"
                  onClick={() => {
                    setError('');
                    setIsLogin(!isLogin);
                  }}
                  className="text-indigo-600 underline underline-offset-4 decoration-2"
                >
                  Switch
                </button>
              </p>
            </div>
          </div>
        )}

        {view === 'forgot-password' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              data-testid="btn-login-back"
              onClick={() => {
                setError('');
                setView('login');
              }}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-6 group"
            >
              <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
              <span data-testid="txt-login-reset-back-label" className="text-xs font-bold uppercase tracking-widest">Back</span>
            </button>

            <h1 data-testid="txt-login-reset-title" className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Reset</h1>
            <p data-testid="txt-login-reset-description" className="text-slate-500 text-sm mb-10 leading-relaxed">
              Enter your email address and we&apos;ll send you a secure link to reset your password.
            </p>

            <form data-testid="frm-login-reset-request" onSubmit={handleResetRequest} className="space-y-6">
              <input
                data-testid="txt-login-reset-email"
                type="email"
                placeholder="email@example.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 text-lg outline-none placeholder:text-slate-300"
              />

              <button
                data-testid="btn-login-send-reset-link"
                type="submit"
                disabled={isResetLoading}
                className="w-full bg-[#0F172A] text-white font-bold py-5 rounded-2xl text-sm tracking-widest uppercase hover:bg-slate-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isResetLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            {error && <p data-testid="txt-login-reset-error" className="text-xs text-rose-500 font-bold mt-4">{error}</p>}
          </div>
        )}

        {view === 'success' && (
          <div className="text-center py-8 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-100">
              <CheckCircle size={40} className="text-emerald-500" />
            </div>
            <h2 data-testid="txt-login-reset-success-title" className="text-2xl font-extrabold text-slate-900 mb-4">Email Sent!</h2>
            <p data-testid="txt-login-reset-success-message" className="text-slate-500 text-sm mb-10 px-4">
              Check your inbox for <b>{formData.email}</b>. We&apos;ve sent a link to reset your password.
            </p>
            <button
              data-testid="btn-login-return-to-login"
              onClick={() => setView('login')}
              className="w-full bg-slate-50 text-slate-900 font-bold py-5 rounded-2xl text-sm tracking-widest uppercase hover:bg-slate-100 transition-all"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ResetPassword = ({ onResetPassword, onNavigate, recoveryTokens }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!recoveryTokens?.accessToken || !recoveryTokens?.refreshToken) {
      setError('Recovery session is missing. Open the newest reset link from your email.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await onResetPassword({
        accessToken: recoveryTokens.accessToken,
        refreshToken: recoveryTokens.refreshToken,
        password
      });
      setSuccess('Password updated successfully. You can sign in now.');
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div data-testid="fra-reset-password-main" className="flex items-center justify-center py-24 px-4 bg-gray-50/50">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 animate-in slide-in-from-top-4">
        <h2 data-testid="txt-reset-password-title" className="text-4xl font-black text-gray-900 mb-2">Set New Password</h2>
        <p data-testid="txt-reset-password-description" className="text-sm text-gray-400 mb-8">Use a strong password for your account.</p>
        <form data-testid="frm-reset-password" className="space-y-6" onSubmit={handleSubmit}>
          <input
            data-testid="txt-reset-password-new"
            type="password"
            placeholder="New password"
            className="w-full px-6 py-4 rounded-2xl bg-gray-50 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            data-testid="txt-reset-password-confirm"
            type="password"
            placeholder="Confirm new password"
            className="w-full px-6 py-4 rounded-2xl bg-gray-50 outline-none"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            data-testid="btn-reset-password-submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs disabled:opacity-40"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
        {error && <p data-testid="txt-reset-password-error" className="text-xs text-rose-500 font-bold mt-4">{error}</p>}
        {success && <p data-testid="txt-reset-password-success" className="text-xs text-emerald-600 font-bold mt-4">{success}</p>}
        <button
          data-testid="btn-reset-password-back-login"
          onClick={() => onNavigate('login')}
          className="text-xs font-black uppercase tracking-widest text-indigo-600 underline mt-8"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

const Checkout = ({ cart, onComplete }) => {
  const [step, setStep] = useState(1);
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return (
    <div data-testid="fra-checkout-main" className="max-w-4xl mx-auto px-4 py-16 animate-in slide-in-from-bottom-8">
      <div className="bg-white rounded-[3rem] p-12 shadow-2xl">
        {step === 1 && (
          <div className="space-y-8"><h2 data-testid="txt-checkout-address-title" className="text-3xl font-black tracking-tight uppercase tracking-widest text-xs">Address</h2>
            <div className="grid grid-cols-2 gap-4"><input data-testid="txt-checkout-first-name" className="px-6 py-4 bg-gray-50 rounded-2xl outline-none" placeholder="First" /><input data-testid="txt-checkout-last-name" className="px-6 py-4 bg-gray-50 rounded-2xl outline-none" placeholder="Last" /></div>
            <input data-testid="txt-checkout-full-address" className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none" placeholder="Full Address" />
            <button data-testid="btn-checkout-proceed-confirm" onClick={() => setStep(2)} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs">Proceed</button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-8"><h2 data-testid="txt-checkout-confirm-title" className="text-3xl font-black tracking-tight uppercase tracking-widest text-xs">Confirm</h2>
            <div className="bg-gray-50 p-8 rounded-[2rem]"><div className="flex justify-between font-black text-2xl"><span data-testid="txt-checkout-total-label">Total</span><span data-testid="txt-checkout-total-value">${(total > 150 ? total : total + 15).toFixed(2)}</span></div></div>
            <button data-testid="btn-checkout-complete-purchase" onClick={onComplete} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-100">Complete Purchase</button>
          </div>
        )}
      </div>
    </div>
  );
};

const Success = ({ onNavigate }) => (
  <div data-testid="fra-success-main" className="max-w-xl mx-auto px-4 py-32 text-center animate-in zoom-in">
    <div className="w-32 h-32 bg-green-100 rounded-[3rem] flex items-center justify-center mx-auto mb-12 text-green-600 shadow-xl"><CheckCircle size={64} /></div>
    <h1 data-testid="txt-success-title" className="text-5xl font-black text-gray-900 mb-6">Success!</h1>
    <p data-testid="txt-success-description" className="text-gray-400 text-lg mb-16">Your order is being prepared.</p>
    <button data-testid="btn-success-shop-more" onClick={() => onNavigate('shop')} className="bg-gray-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl">Shop More</button>
  </div>
);
