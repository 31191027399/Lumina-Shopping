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
  Edit,
  Save
} from 'lucide-react';

const DEFAULT_CATEGORIES = ["All"];
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:54321/functions/v1/api' : '/api');

// --- Helper Modal Component ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest text-xs">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>,
    document.body
  );
};

// --- Shared Components ---

const Navbar = ({ cartCount, onNavigate, currentPage, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAdmin = user?.role === 'Admin';

  const navLinks = [
    { name: 'home', label: 'Home' },
    { name: 'shop', label: 'Shop' },
    ...(isAdmin ? [{ name: 'admin', label: 'Admin' }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => onNavigate('home')} 
              className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"
            >
              LUMINA
            </button>
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => onNavigate(link.name)}
                  className={`text-sm font-bold transition-colors uppercase tracking-widest ${
                    currentPage === link.name ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center relative">
              <input 
                type="text" 
                placeholder="Search products..." 
                className="pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 lg:w-64"
              />
              <Search size={18} className="absolute left-3 text-gray-400" />
            </div>
            
            <button 
              onClick={() => user ? onNavigate('profile') : onNavigate('login')}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-600 relative group"
              title={user ? "Profile" : "Login"}
            >
              <User size={22} />
              {user && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-500 border-2 border-white rounded-full"></span>}
            </button>

            <button 
              onClick={() => onNavigate('cart')}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-600 relative"
              title="Cart"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

            <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-xl">
          <button onClick={() => {onNavigate('home'); setIsMenuOpen(false);}} className="block w-full text-left py-2 text-gray-600 font-medium tracking-widest uppercase text-xs">Home</button>
          <button onClick={() => {onNavigate('shop'); setIsMenuOpen(false);}} className="block w-full text-left py-2 text-gray-600 font-medium tracking-widest uppercase text-xs">Shop</button>
          {isAdmin && <button onClick={() => {onNavigate('admin'); setIsMenuOpen(false);}} className="block w-full text-left py-2 text-indigo-600 font-bold tracking-widest uppercase text-xs">Admin</button>}
          <div className="pt-4 border-t border-gray-100">
            {user ? (
              <div className="space-y-4">
                <button onClick={() => {onNavigate('profile'); setIsMenuOpen(false);}} className="block w-full text-left text-gray-600 font-medium">My Profile</button>
                <button onClick={() => {onLogout(); setIsMenuOpen(false);}} className="text-red-500 font-bold">Logout</button>
              </div>
            ) : (
              <button onClick={() => {onNavigate('login'); setIsMenuOpen(false);}} className="text-indigo-600 font-bold">Sign In</button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="space-y-6">
        <h3 className="text-white text-2xl font-bold tracking-tight">LUMINA</h3>
        <p className="text-sm leading-relaxed">
          Crafting premium essentials for the modern lifestyle. Quality and design at the core of everything we do.
        </p>
        <div className="flex gap-5">
          <Facebook size={20} className="hover:text-white cursor-pointer transition-colors" />
          <Instagram size={20} className="hover:text-white cursor-pointer transition-colors" />
          <Twitter size={20} className="hover:text-white cursor-pointer transition-colors" />
        </div>
      </div>
      <div>
        <h4 className="text-white font-bold mb-6">Shop</h4>
        <ul className="space-y-3 text-sm">
          <li className="hover:text-white cursor-pointer transition-colors">New Arrivals</li>
          <li className="hover:text-white cursor-pointer transition-colors">Best Sellers</li>
          <li className="hover:text-white cursor-pointer transition-colors">Gift Cards</li>
          <li className="hover:text-white cursor-pointer transition-colors">Sale</li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-bold mb-6">Support</h4>
        <ul className="space-y-3 text-sm">
          <li className="hover:text-white cursor-pointer transition-colors">Order Tracking</li>
          <li className="hover:text-white cursor-pointer transition-colors">Returns</li>
          <li className="hover:text-white cursor-pointer transition-colors">Contact Us</li>
          <li className="hover:text-white cursor-pointer transition-colors">Shipping Info</li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-bold mb-6">Newsletter</h4>
        <p className="text-sm mb-4">Get the latest updates on new collections and special offers.</p>
        <div className="flex bg-gray-800 rounded-xl p-1">
          <input type="email" placeholder="Your email" className="bg-transparent border-none px-4 py-2 text-sm w-full focus:ring-0 text-white" />
          <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-bold">
            Join
          </button>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
      <p>&copy; 2024 Lumina Retail Group. All rights reserved.</p>
      <div className="flex gap-6">
        <span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
        <span className="cursor-pointer hover:text-white transition-colors">Terms of Service</span>
      </div>
    </div>
  </footer>
);

// --- View Components ---

const Home = ({ onNavigate, topCategories }) => (
  <div className="space-y-24">
    {/* Hero Section */}
    <section className="relative h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80" 
          className="w-full h-full object-cover brightness-[0.4]"
          alt="Hero background"
        />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
          <span className="inline-block px-4 py-1.5 bg-indigo-600 text-xs font-bold tracking-[0.2em] uppercase rounded-full leading-none">Summer 2024</span>
          <h1 className="text-6xl md:text-8xl font-black leading-[1.1]">
            Define Your <br /> Essentials.
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Minimalist aesthetics meet premium functionality. Explore the curated collection for those who appreciate the details.
          </p>
          <div className="flex flex-wrap gap-5 pt-4">
            <button 
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Top Categories</h2>
          <p className="text-gray-500 text-lg">Curated collections for every lifestyle.</p>
        </div>
        <button onClick={() => onNavigate('shop')} className="px-6 py-3 border-2 border-gray-100 rounded-2xl font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all">
          Browse All Products
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {topCategories.map((cat) => (
          <div key={cat.name} className="group relative h-80 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl transition-transform hover:-translate-y-2" onClick={() => onNavigate('shop')}>
            <img src={cat.img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="text-3xl font-black mb-1 leading-none">{cat.name}</h3>
              <p className="text-sm font-medium opacity-80">{cat.count} Products</p>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">Catalog</h1>
          <p className="text-gray-500 mt-2 text-lg">Browse our latest collection of premium products.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="relative group">
            <div className="flex items-center gap-3 bg-white border-2 border-gray-100 px-6 py-3 rounded-2xl hover:border-indigo-600 transition-all cursor-pointer">
              <Filter size={18} className="text-gray-400 group-hover:text-indigo-600" />
              <select 
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
          <div key={product.id} className="group flex flex-col h-full bg-white rounded-[2rem] border-2 border-gray-50 overflow-hidden hover:border-indigo-50 transition-all duration-300 hover:shadow-2xl">
            <div className="relative h-72 overflow-hidden cursor-pointer" onClick={() => onProductClick(product)}>
              <img 
                src={product.image} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt={product.name}
              />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{product.category}</span>
                <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
                  <Star size={12} fill="currentColor" className="text-yellow-400" />
                  {product.rating}
                </div>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2 leading-tight cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => onProductClick(product)}>
                {product.name}
              </h3>
              <p className="text-gray-400 text-sm line-clamp-2 mb-6 flex-grow leading-relaxed">{product.description}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-2xl font-black text-gray-900 tracking-tight">${product.price.toFixed(2)}</span>
                <button 
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
  currentUserId,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onUpdateOrder,
  onDeleteOrder,
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
  const [seedCounts, setSeedCounts] = useState({ productCount: 8, userCount: 6, orderCount: 12 });
  const [environmentLabel] = useState('Staging-01');

  // Statistics
  const stats = [
    { label: "Total Revenue", value: `$${orders.filter(o => o.status !== 'Cancelled').reduce((a,b) => a + b.total, 0).toFixed(2)}`, icon: <BarChart3 />, trend: "+12.5%", color: "indigo" },
    { label: "Total Users", value: users.length, icon: <UsersIcon />, trend: "+3.2%", color: "violet" },
    { label: "Active Orders", value: orders.filter(o => o.status === 'Processing' || o.status === 'Shipped').length, icon: <ShoppingBag />, trend: "+18.1%", color: "emerald" },
    { label: "Conversion", value: "4.8%", icon: <ArrowUpRight />, trend: "-0.4%", color: "amber" },
  ];
  const pulseSeries = useMemo(() => {
    const bucketCount = 12;
    const buckets = Array.from({ length: bucketCount }, () => 0);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const dayMs = 24 * 60 * 60 * 1000;

    orders.forEach((order) => {
      const rawDate = order.createdAt || order.date;
      if (!rawDate) return;
      const parsed = new Date(rawDate);
      if (Number.isNaN(parsed.getTime())) return;

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
  }, [orders]);
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
    setSelectedUsers(prev => prev.length === users.length ? [] : users.map(u => u.id));
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
    setSelectedOrders(prev => prev.length === orders.length ? [] : orders.map(o => o.id));
  };
  const deleteSelectedOrders = async () => {
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
    setSelectedProducts(prev => prev.length === products.length ? [] : products.map(p => p.id));
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

  // Edit Handlers
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsMutating(true);
    try {
      if (editingItem.type === 'user') {
        await onUpdateUser(editingItem.data.id, {
          role: editingItem.data.role,
          status: editingItem.data.status
        });
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
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((s, idx) => (
                <div key={idx} className="bg-white p-8 rounded-[2rem] border-2 border-gray-50 shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-gray-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {React.cloneElement(s.icon, { size: 24 })}
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">{s.label}</p>
                  <h4 className="text-3xl font-black text-gray-900 tracking-tighter">{s.value}</h4>
                </div>
              ))}
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-50">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8">System Pulse</h3>
                <div className="h-64 flex items-end gap-3">
                  {pulseSeries.map((point, i) => (
                    <div key={i} className="flex-1 bg-gray-50 rounded-xl relative group" title={`${point.count} order(s)`}>
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-indigo-600 rounded-xl group-hover:bg-indigo-400 transition-all duration-500"
                        style={{ height: `${point.height}%` }}
                      ></div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] font-bold text-gray-400 mt-4">Last 12 days of order volume</p>
            </div>

          </div>
        );
      case 'data-manager':
        return (
          <div className="bg-slate-100/80 border border-slate-200 rounded-[2.5rem] overflow-hidden animate-in fade-in duration-500">
            <div className="px-8 py-7 border-b border-slate-200 bg-white/70">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Data Control Center</h3>
                  <p className="text-sm md:text-base text-slate-600 font-medium">Quickly manage database states for testing environments.</p>
                </div>
                <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-100 border border-slate-200 rounded-full px-4 py-2">
                  <Info size={14} />
                  Environment: <span className="text-amber-600">{environmentLabel}</span>
                </div>
              </div>
            </div>

            <div className="px-8 py-7 space-y-5">
              <div className="hidden md:grid grid-cols-[1.6fr_1fr_180px] px-4 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      setDataControlTargets(allDataTargetsSelected ? [] : dataManagerTargets.map((target) => target.id))
                    }
                    className="hover:text-indigo-600 transition-colors"
                  >
                    {allDataTargetsSelected ? 'Deselect All' : 'Select All'}
                  </button>
                  <span>Category</span>
                </div>
                <span className="justify-self-end">Current Status</span>
                <span className="justify-self-end">Seed Amount</span>
              </div>

              <div className="space-y-3">
                {dataManagerTargets.map((target) => {
                  const selected = dataControlTargets.includes(target.id);
                  return (
                    <div
                      key={target.id}
                      className={`grid grid-cols-1 md:grid-cols-[1.6fr_1fr_180px] items-center gap-4 px-5 py-4 rounded-2xl border transition-colors ${
                        selected ? 'border-indigo-200 bg-indigo-50/40' : 'border-slate-200 bg-slate-100/80'
                      }`}
                    >
                      <label className="flex items-center gap-4">
                        <input
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
                        <span className="text-xl">{target.icon}</span>
                        <span className={`text-2xl leading-none md:text-[2rem] md:leading-none font-black tracking-tight ${selected ? 'text-slate-900' : 'text-slate-500'} hidden`}>{target.label}</span>
                        <span className={`text-sm md:text-2xl font-black tracking-tight ${selected ? 'text-slate-900' : 'text-slate-500'}`}>{target.label}</span>
                      </label>

                      <div className="justify-self-start md:justify-self-end flex items-center gap-2">
                        <span className="text-emerald-600 font-black text-xl md:text-3xl tracking-tight">
                          {getDataTargetCount(target.id).toLocaleString()}
                        </span>
                        <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Records</span>
                      </div>

                      <div className="justify-self-start md:justify-self-end">
                        <input
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 text-sm font-black">
                <CheckCircle size={16} />
                {selectedDataTargetCount} Categories Selected
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <button
                  disabled={dataControlLoading || selectedDataTargetCount === 0}
                  onClick={() => runDataControl('clear', { targets: dataControlTargets })}
                  className="px-6 py-3 bg-rose-50 border-2 border-rose-100 text-rose-600 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-rose-100 disabled:opacity-40"
                >
                  Clear Selected
                </button>
                <button
                  disabled={dataControlLoading || selectedDataTargetCount === 0}
                  onClick={() =>
                    runDataControl('seed', {
                      targets: dataControlTargets,
                      productCount: seedCounts.productCount,
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
      case 'users':
        return (
          <div className="bg-white rounded-[2.5rem] border-2 border-gray-50 shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="p-8 border-b border-gray-100 space-y-4">
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest text-xs">Users</h3>
                <button
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
                    <button disabled={isMutating} onClick={deleteSelectedUsers} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-100 transition-colors disabled:opacity-40 animate-in slide-in-from-left-4">
                      <Trash2 size={14} /> Delete Selected ({selectedUsers.length})
                    </button>
                    <button disabled={isMutating} onClick={deleteAllUsers} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-colors disabled:opacity-40">
                      Delete All
                    </button>
                  </>
                )}
              </div>
              <div className="relative w-full xl:w-72 2xl:w-80 shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input className="pl-12 pr-4 py-3 bg-gray-50 rounded-2xl text-sm outline-none border border-transparent w-full" placeholder="Search..." />
              </div>
            </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <th className="px-8 py-5">
                      <input type="checkbox" checked={selectedUsers.length === users.length && users.length > 0} onChange={toggleAllUsers} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4" />
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Identity</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Role</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(user => (
                    <tr key={user.id} className={`hover:bg-gray-50/50 transition-colors ${selectedUsers.includes(user.id) ? 'bg-indigo-50/30' : ''}`}>
                      <td className="px-8 py-6">
                        <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => toggleUserSelection(user.id)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4" />
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-500">{user.name.charAt(0)}</div>
                          <div>
                            <p className="font-bold text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-400 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${user.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                          <span className="text-xs font-bold text-gray-600">{user.status}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right space-x-4">
                        <button onClick={() => setEditingItem({ type: 'user', data: user })} className="text-gray-400 hover:text-indigo-600"><Edit size={16} /></button>
                        <button disabled={isMutating} onClick={() => deleteSingleUser(user.id)} className="text-gray-400 hover:text-rose-500 disabled:opacity-40"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'orders':
        return (
          <div className="bg-white rounded-[2.5rem] border-2 border-gray-50 shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest text-xs">Orders</h3>
                {selectedOrders.length > 0 && (
                   <button disabled={isMutating} onClick={deleteSelectedOrders} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-100 transition-colors disabled:opacity-40">
                      <Trash2 size={14} /> Delete Selected ({selectedOrders.length})
                    </button>
                )}
              </div>
              <input type="checkbox" checked={selectedOrders.length === orders.length && orders.length > 0} onChange={toggleAllOrders} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <th className="px-8 py-5">#</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">ID</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Total</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map(order => (
                    <tr key={order.id} className={`hover:bg-gray-50/50 transition-colors ${selectedOrders.includes(order.id) ? 'bg-indigo-50/30' : ''}`}>
                      <td className="px-8 py-6">
                        <input type="checkbox" checked={selectedOrders.includes(order.id)} onChange={() => toggleOrderSelection(order.id)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4" />
                      </td>
                      <td className="px-8 py-6 font-black text-xs text-indigo-600 tracking-tight">{order.id}</td>
                      <td className="px-8 py-6 text-sm font-bold text-gray-900">{order.customer}</td>
                      <td className="px-8 py-6 font-black text-gray-900 tracking-tighter">${order.total.toFixed(2)}</td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                          order.status === 'Shipped' ? 'bg-indigo-100 text-indigo-700' :
                          order.status === 'Processing' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right space-x-4">
                        <button onClick={() => setEditingItem({ type: 'order', data: order })} className="text-gray-400 hover:text-indigo-600"><Edit size={16} /></button>
                        <button disabled={isMutating} onClick={() => deleteSingleOrder(order.id)} className="text-gray-400 hover:text-rose-500 disabled:opacity-40"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'catalog':
        return (
          <div className="bg-white rounded-[2.5rem] border-2 border-gray-50 shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest text-xs">Catalog</h3>
                <span className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                  {products.length} Items
                </span>
                {selectedProducts.length > 0 && (
                  <button
                    disabled={isMutating}
                    onClick={deleteSelectedProducts}
                    className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-100 transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={14} /> Delete Selected ({selectedProducts.length})
                  </button>
                )}
              </div>
              <button
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
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <th className="px-8 py-5">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === products.length && products.length > 0}
                        onChange={toggleAllProducts}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4"
                      />
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">ID</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Product</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Category</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Price</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Rating</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product) => (
                    <tr key={product.id} className={`hover:bg-gray-50/50 transition-colors ${selectedProducts.includes(product.id) ? 'bg-indigo-50/30' : ''}`}>
                      <td className="px-8 py-6">
                        <input
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
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                          />
                          <span className="text-sm font-bold text-gray-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter bg-gray-100 text-gray-500">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-8 py-6 font-black text-gray-900 tracking-tighter">${Number(product.price || 0).toFixed(2)}</td>
                      <td className="px-8 py-6 text-sm font-bold text-amber-600">{product.rating ?? 'N/A'}</td>
                      <td className="px-8 py-6 text-right space-x-4">
                        <button onClick={() => setEditingItem({ type: 'product', data: product })} className="text-gray-400 hover:text-indigo-600"><Edit size={16} /></button>
                        <button disabled={isMutating} onClick={() => deleteSingleProduct(product.id)} className="text-gray-400 hover:text-rose-500 disabled:opacity-40"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-in slide-in-from-top-10 duration-500">
      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="lg:w-64 space-y-2">
          <div className="mb-10 pl-4">
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Admin</h1>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Management Suite</p>
          </div>
          {[
            { id: 'statistics', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
            { id: 'data-manager', label: 'Data Manager', icon: <Package size={20} /> },
            { id: 'catalog', label: 'Catalog', icon: <Package size={20} /> },
            { id: 'users', label: 'Users', icon: <UsersIcon size={20} /> },
            { id: 'orders', label: 'Orders', icon: <ShoppingBag size={20} /> },
          ].map((item) => (
            <button
              key={item.id}
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
        <form onSubmit={handleSaveEdit} className="space-y-6">
          {editingItem?.type === 'user' ? (
            <>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Role</label>
                <select 
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
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Status</label>
                <select 
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
                  value={editingItem.data.status}
                  onChange={(e) => setEditingItem({...editingItem, data: { ...editingItem.data, status: e.target.value }})}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </>
          ) : editingItem?.type === 'order' ? (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Order Status</label>
              <select 
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
                required
                type="text"
                placeholder="Product Name"
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
                value={editingItem?.data.name || ''}
                onChange={(e) => setEditingItem({...editingItem, data: { ...editingItem.data, name: e.target.value }})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  type="text"
                  placeholder="Category"
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
                  value={editingItem?.data.category || ''}
                  onChange={(e) => setEditingItem({...editingItem, data: { ...editingItem.data, category: e.target.value }})}
                />
                <input
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
                required
                type="url"
                placeholder="Image URL"
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
                value={editingItem?.data.image || ''}
                onChange={(e) => setEditingItem({...editingItem, data: { ...editingItem.data, image: e.target.value }})}
              />
              <textarea
                required
                rows={4}
                placeholder="Description"
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold resize-none"
                value={editingItem?.data.description || ''}
                onChange={(e) => setEditingItem({...editingItem, data: { ...editingItem.data, description: e.target.value }})}
              />
            </>
          )}
          <button disabled={isMutating} type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 disabled:opacity-40">
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
        <form onSubmit={handleCreateUser} className="space-y-4">
          <input
            required
            type="text"
            placeholder="Full Name"
            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
            value={newUserForm.name}
            onChange={(e) => setNewUserForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <input
            required
            type="email"
            placeholder="Email"
            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
            value={newUserForm.email}
            onChange={(e) => setNewUserForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <input
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
              className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
              value={newUserForm.role}
              onChange={(e) => setNewUserForm((prev) => ({ ...prev, role: e.target.value }))}
            >
              <option>Admin</option>
              <option>Manager</option>
              <option>Customer</option>
            </select>
            <select
              className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
              value={newUserForm.status}
              onChange={(e) => setNewUserForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <button
            disabled={isMutating}
            type="submit"
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 disabled:opacity-40"
          >
            <Save size={18} /> {isMutating ? 'Creating...' : 'Create User'}
          </button>
          {createUserFeedback.text && (
            <p
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
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <input
            required
            type="text"
            placeholder="Product Name"
            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
            value={newProductForm.name}
            onChange={(e) => setNewProductForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              required
              type="text"
              placeholder="Category"
              className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
              value={newProductForm.category}
              onChange={(e) => setNewProductForm((prev) => ({ ...prev, category: e.target.value }))}
            />
            <input
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
            required
            type="url"
            placeholder="Image URL"
            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
            value={newProductForm.image}
            onChange={(e) => setNewProductForm((prev) => ({ ...prev, image: e.target.value }))}
          />
          <textarea
            required
            rows={4}
            placeholder="Description"
            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold resize-none"
            value={newProductForm.description}
            onChange={(e) => setNewProductForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <button
            disabled={isMutating}
            type="submit"
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 disabled:opacity-40"
          >
            <Save size={18} /> {isMutating ? 'Creating...' : 'Create Product'}
          </button>
          {createProductFeedback.text && (
            <p
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

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('lumina_access_token') || '');
  const [recoveryTokens, setRecoveryTokens] = useState(null);
  const [toast, setToast] = useState(null);
  const categoryImageMap = useMemo(
    () => ({
      Electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
      Accessories: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80',
      Apparel: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80',
      Fitness: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
      Home: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80'
    }),
    []
  );
  const topCategories = useMemo(() => {
    const counts = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({
        name,
        count,
        img:
          categoryImageMap[name] ||
          'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80'
      }));
  }, [products, categoryImageMap]);

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
    const [usersData, ordersData] = await Promise.all([
      apiRequest('/admin/users', { token }),
      apiRequest('/admin/orders', { token })
    ]);
    setUsers(usersData.items || []);
    setOrders(ordersData.items || []);
  };

  const fetchCatalogData = async () => {
      const [productData, categoryData] = await Promise.all([
        apiRequest('/products', { token: '' }),
        apiRequest('/products/categories', { token: '' })
      ]);
    setProducts(productData.items || []);
    setCategories(categoryData.items?.length ? categoryData.items : DEFAULT_CATEGORIES);
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

  const refreshAllData = async (token = authToken) => {
    await fetchCatalogData();
    if (token) {
      await Promise.all([fetchCartData(token), fetchUserOrders(token)]);
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
        await fetchCatalogData();
      } catch (err) {
        setToast(err.message || 'Failed to load catalog');
      }
      if (!authToken) return;
      try {
        const me = await apiRequest('/auth/me', { token: authToken });
        setUser(me.user);
        await Promise.all([fetchCartData(authToken), fetchUserOrders(authToken)]);
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
    await Promise.all([fetchCartData(token), fetchUserOrders(token)]);
    setToast(isLogin ? 'Logged in successfully' : 'Account created');
    navigateTo('home');
  };

  const handlePasswordResetRequest = async (email) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      throw new Error('Email is required');
    }

    const redirectTo = `${window.location.origin}${window.location.pathname}?reset_password=1`;
    await apiRequest('/auth/password-reset', {
      method: 'POST',
      body: { email: normalizedEmail, redirectTo },
      token: ''
    });
    setToast('If the account exists, a reset email has been sent');
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

  const handleDataControlSeed = async ({ targets, productCount, userCount, orderCount }) => {
    const data = await apiRequest('/admin/data-control/seed', {
      method: 'POST',
      body: { targets, productCount, userCount, orderCount }
    });
    await refreshAllData();
    setToast(
      `Seeded ${data.insertedProducts ?? 0} products, ${data.insertedUsers ?? 0} users, ${data.insertedOrders ?? 0} orders`
    );
  };

  const handleOrderComplete = async () => {
    if (!authToken) {
      setToast('Please sign in to complete checkout');
      navigateTo('login');
      return;
    }

    try {
      await apiRequest('/orders/checkout', { method: 'POST', body: { paymentMethod: 'card' } });
      await Promise.all([fetchCartData(), fetchUserOrders()]);
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
          currentUserId={user?.id}
          onCreateUser={handleAdminUserCreate}
          onUpdateUser={handleAdminUserUpdate}
          onDeleteUser={handleAdminUserDelete}
          onUpdateOrder={handleAdminOrderUpdate}
          onDeleteOrder={handleAdminOrderDelete}
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
          onLogout={handleLogout}
          onRequestPasswordReset={handlePasswordResetRequest}
        />
      );
      case 'checkout': return <Checkout cart={cart} onComplete={handleOrderComplete} onNavigate={navigateTo} />;
      case 'success': return <Success onNavigate={navigateTo} />;
      case 'productDetail': return selectedProduct ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-in fade-in duration-500">
          <button onClick={() => navigateTo('shop')} className="flex items-center gap-2 text-gray-400 font-bold mb-12 hover:text-indigo-600 transition-colors uppercase text-xs tracking-widest">
            <ArrowRight className="rotate-180" size={16} /> Back to Catalog
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="rounded-[3rem] overflow-hidden shadow-2xl h-[600px] bg-gray-50 border-8 border-white">
              <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
            </div>
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-4">
                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-black rounded-full uppercase tracking-widest leading-none">{selectedProduct.category}</span>
                <h1 className="text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">{selectedProduct.name}</h1>
              </div>
              <p className="text-4xl font-black text-indigo-600 tracking-tighter">${selectedProduct.price.toFixed(2)}</p>
              <p className="text-gray-500 leading-relaxed text-lg font-medium">{selectedProduct.description}</p>
              <button 
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
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar 
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
        onNavigate={navigateTo} 
        currentPage={currentPage}
        user={user}
        onLogout={handleLogout}
      />
      <main className="pt-16 min-h-[calc(100vh-64px)]">{renderContent()}</main>
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-md text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-12 z-[300] border border-white/10">
          <div className="bg-green-500 p-1.5 rounded-full"><CheckCircle size={16} /></div>
          <span className="text-xs font-black uppercase tracking-widest">{toast}</span>
        </div>
      )}
      <Footer />
    </div>
  );
}

// Reuse previously defined Success, Checkout, Login, Cart, Profile for brevity and consistency...
const Cart = ({ cart, onUpdateQty, onRemove, onCheckout, onNavigate }) => {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = total > 150 ? 0 : 15;
  if (cart.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 py-32 text-center animate-in zoom-in duration-700">
      <div className="w-32 h-32 bg-indigo-50 rounded-[3rem] flex items-center justify-center mx-auto mb-10 text-indigo-600"><ShoppingBag size={56} /></div>
      <h2 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Bag is Empty</h2>
      <button onClick={() => onNavigate('shop')} className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl uppercase tracking-widest text-xs">Explore Catalog</button>
    </div>
  );
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-5xl font-black text-gray-900 mb-16 tracking-tight">Bag</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-8">
          {cart.map(item => (
            <div key={item.id} className="flex flex-col sm:flex-row gap-8 p-8 bg-white rounded-[2.5rem] border-2 border-gray-50 hover:border-indigo-50 transition-all group">
              <div className="w-32 h-32 rounded-3xl overflow-hidden flex-shrink-0 border-4 border-white shadow-md">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex-grow flex flex-col sm:flex-row justify-between gap-6">
                <div>
                  <h3 className="font-black text-gray-900 text-xl mb-1">{item.name}</h3>
                  <div className="flex items-center gap-5 bg-gray-50 w-max rounded-2xl p-1.5 border border-gray-100">
                    <button onClick={() => onUpdateQty(item.id, item.quantity - 1)} className="p-2 hover:bg-white rounded-xl transition-all" disabled={item.quantity <= 1}><Minus size={16} /></button>
                    <span className="text-sm font-black w-8 text-center">{item.quantity}</span>
                    <button onClick={() => onUpdateQty(item.id, item.quantity + 1)} className="p-2 hover:bg-white rounded-xl transition-all"><Plus size={16} /></button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between py-1">
                  <span className="text-2xl font-black text-gray-900 tracking-tighter">${(item.price * item.quantity).toFixed(2)}</span>
                  <button onClick={() => onRemove(item.id)} className="text-gray-300 hover:text-red-500 p-3 rounded-2xl hover:bg-red-50"><Trash2 size={20} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className="bg-gray-900 text-white rounded-[2.5rem] p-10 sticky top-24 shadow-2xl overflow-hidden">
            <h3 className="text-2xl font-black mb-10 tracking-tight uppercase tracking-widest text-xs opacity-50">Summary</h3>
            <div className="space-y-6 mb-10">
              <div className="flex justify-between text-gray-400 font-bold uppercase tracking-widest text-[10px]"><span>Subtotal</span><span className="text-white text-sm">${total.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-400 font-bold uppercase tracking-widest text-[10px]"><span>Shipping</span><span className="text-white text-sm">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
              <div className="pt-6 border-t border-white/10 flex justify-between items-end"><span className="text-3xl font-black text-indigo-400 tracking-tighter">${(total + shipping).toFixed(2)}</span></div>
            </div>
            <button onClick={onCheckout} className="w-full bg-white text-gray-900 py-5 rounded-2xl font-black hover:bg-indigo-400 hover:text-white transition-all uppercase tracking-[0.2em] text-xs">Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Profile = ({ user, orders, onLogout, onRequestPasswordReset }) => {
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  const handlePasswordReset = async () => {
    if (!onRequestPasswordReset) return;
    setResetMessage('');
    setResetError('');
    setIsResetting(true);
    try {
      await onRequestPasswordReset(user?.email || '');
      setResetMessage('Password reset email sent. Please check your inbox.');
    } catch (err) {
      setResetError(err.message || 'Failed to send reset email');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-in slide-in-from-bottom-8">
      <div className="bg-white rounded-[3rem] border-2 border-gray-50 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 h-48 relative">
          <div className="absolute -bottom-16 left-12 w-32 h-32 rounded-[2.5rem] bg-white p-1.5 shadow-xl"><div className="w-full h-full rounded-[2rem] bg-indigo-50 flex items-center justify-center text-indigo-600"><User size={48} /></div></div>
        </div>
        <div className="pt-20 px-12 pb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-100 pb-12 mb-12">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">{user?.name}</h1>
              <p className="text-gray-500 font-medium">{user?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest">{user?.role}</span>
            </div>
            <button onClick={onLogout} className="px-6 py-3 bg-red-50 rounded-2xl font-bold text-red-600 hover:bg-red-100 flex items-center gap-2"><LogOut size={18} /> Sign Out</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-[2rem] p-8 shadow-inner">
              <h3 className="text-xl font-bold mb-4">Orders</h3>
              <p className="text-sm text-gray-400">
                {orders?.length ? `${orders.length} order(s) in history` : 'No orders yet'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-[2rem] p-8 shadow-inner space-y-3">
              <h3 className="text-xl font-bold">Settings</h3>
              <p className="text-sm text-gray-400">Manage account</p>
              <button
                onClick={handlePasswordReset}
                disabled={isResetting}
                className="px-5 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-40"
              >
                {isResetting ? 'Sending...' : 'Reset Password via Email'}
              </button>
              {resetMessage && <p className="text-xs font-bold text-emerald-600">{resetMessage}</p>}
              {resetError && <p className="text-xs font-bold text-rose-500">{resetError}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Login = ({ onLoginSuccess, onNavigate, onRequestPasswordReset }) => {
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const handleSubmit = async (e) => {
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

  const handleForgotPassword = async () => {
    const email = String(formData.email || '').trim();
    if (!email) {
      setError('Enter your email first to reset password');
      return;
    }
    setError('');
    setResetMessage('');
    setIsResetting(true);
    try {
      await onRequestPasswordReset(email);
      setResetMessage('Password reset email sent. Please check your inbox.');
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-24 px-4 bg-gray-50/50">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 animate-in slide-in-from-top-4">
        <h2 className="text-4xl font-black text-gray-900 mb-8">{isLogin ? 'Login' : 'Join'}</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {!isLogin && <input type="text" placeholder="Name" className="w-full px-6 py-4 rounded-2xl bg-gray-50 outline-none" onChange={e => setFormData({...formData, name: e.target.value})} />}
          <input type="email" placeholder="email@example.com" className="w-full px-6 py-4 rounded-2xl bg-gray-50 outline-none" onChange={e => setFormData({...formData, email: e.target.value})} />
          <input type="password" placeholder="••••••••" className="w-full px-6 py-4 rounded-2xl bg-gray-50 outline-none" onChange={e => setFormData({...formData, password: e.target.value})} />
          {isLogin && (
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isResetting}
              className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:underline disabled:opacity-40"
            >
              {isResetting ? 'Sending reset email...' : 'Forgot password? Send reset email'}
            </button>
          )}
          <button disabled={isLoading} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs">{isLoading ? 'Wait...' : (isLogin ? 'Sign In' : 'Join')}</button>
        </form>
        {error && <p className="text-xs text-rose-500 font-bold mt-4">{error}</p>}
        {resetMessage && <p className="text-xs text-emerald-600 font-bold mt-4">{resetMessage}</p>}
        <p className="text-xs font-black text-center mt-12 text-gray-400 uppercase tracking-widest">{isLogin ? 'New?' : 'Member?'} <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 underline">Switch</button></p>
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
    <div className="flex items-center justify-center py-24 px-4 bg-gray-50/50">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 animate-in slide-in-from-top-4">
        <h2 className="text-4xl font-black text-gray-900 mb-2">Set New Password</h2>
        <p className="text-sm text-gray-400 mb-8">Use a strong password for your account.</p>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New password"
            className="w-full px-6 py-4 rounded-2xl bg-gray-50 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full px-6 py-4 rounded-2xl bg-gray-50 outline-none"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs disabled:opacity-40"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
        {error && <p className="text-xs text-rose-500 font-bold mt-4">{error}</p>}
        {success && <p className="text-xs text-emerald-600 font-bold mt-4">{success}</p>}
        <button
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
    <div className="max-w-4xl mx-auto px-4 py-16 animate-in slide-in-from-bottom-8">
      <div className="bg-white rounded-[3rem] p-12 shadow-2xl">
        {step === 1 && (
          <div className="space-y-8"><h2 className="text-3xl font-black tracking-tight uppercase tracking-widest text-xs">Address</h2>
            <div className="grid grid-cols-2 gap-4"><input className="px-6 py-4 bg-gray-50 rounded-2xl outline-none" placeholder="First" /><input className="px-6 py-4 bg-gray-50 rounded-2xl outline-none" placeholder="Last" /></div>
            <input className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none" placeholder="Full Address" />
            <button onClick={() => setStep(2)} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs">Proceed</button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-8"><h2 className="text-3xl font-black tracking-tight uppercase tracking-widest text-xs">Confirm</h2>
            <div className="bg-gray-50 p-8 rounded-[2rem]"><div className="flex justify-between font-black text-2xl"><span>Total</span><span>${(total > 150 ? total : total + 15).toFixed(2)}</span></div></div>
            <button onClick={onComplete} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-100">Complete Purchase</button>
          </div>
        )}
      </div>
    </div>
  );
};

const Success = ({ onNavigate }) => (
  <div className="max-w-xl mx-auto px-4 py-32 text-center animate-in zoom-in">
    <div className="w-32 h-32 bg-green-100 rounded-[3rem] flex items-center justify-center mx-auto mb-12 text-green-600 shadow-xl"><CheckCircle size={64} /></div>
    <h1 className="text-5xl font-black text-gray-900 mb-6">Success!</h1>
    <p className="text-gray-400 text-lg mb-16">Your order is being prepared.</p>
    <button onClick={() => onNavigate('shop')} className="bg-gray-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl">Shop More</button>
  </div>
);
