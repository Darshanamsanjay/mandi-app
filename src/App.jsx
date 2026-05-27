import React, { useState } from "react";
import "./index.css";

export default function MadannapetMandiApp() {
  const products = [
    { id: 17, name: "Daily Veg Pack", price: 99, unit: "1 Pack", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80", category: "Popular Packs" },
    { id: 18, name: "Family Combo Pack", price: 199, unit: "1 Pack", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6faa6?w=400&q=80", category: "Popular Packs" },
    { id: 1, name: "Tomato", price: 30, unit: "1 Kg", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80", category: "Vegetables" },
    { id: 2, name: "Potato", price: 40, unit: "1 Kg", image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80", category: "Vegetables" },
    { id: 3, name: "Onion", price: 35, unit: "1 Kg", image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&q=80", category: "Vegetables" },
    { id: 6, name: "Carrot", price: 45, unit: "1 Kg", image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80", category: "Vegetables" },
    { id: 7, name: "Broccoli", price: 80, unit: "1 Pc", image: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=400&q=80", category: "Vegetables" },
    { id: 8, name: "Bell Peppers", price: 120, unit: "3 Pcs", image: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=400&q=80", category: "Vegetables" },
    { id: 4, name: "Banana", price: 50, unit: "1 Dozen", image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&q=80", category: "Fruits" },
    { id: 9, name: "Apple", price: 150, unit: "1 Kg", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6faa6?w=400&q=80", category: "Fruits" },
    { id: 10, name: "Hass Avocado", price: 200, unit: "2 Pcs", image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80", category: "Fruits" },
    { id: 11, name: "Dragon Fruit", price: 180, unit: "1 Pc", image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&q=80", category: "Fruits" },
    { id: 5, name: "Milk", price: 28, unit: "500 ml", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80", category: "Protein" },
    { id: 12, name: "Farm Eggs", price: 90, unit: "1 Dozen", image: "https://images.unsplash.com/photo-1587486913049-53fc88980bfc?w=400&q=80", category: "Protein" },
    { id: 13, name: "Organic Paneer", price: 110, unit: "200 g", image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80", category: "Protein" },
    { id: 14, name: "Firm Tofu", price: 95, unit: "250 g", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80", category: "Protein" },
    { id: 15, name: "Premium Quinoa", price: 250, unit: "500 g", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80", category: "Protein" },
    { id: 16, name: "Protein Chicken Bowl", price: 280, unit: "1 Bowl", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80", category: "Gym Meals" },
  ];

  const categories = ["All", "Popular Packs", "Vegetables", "Fruits", "Protein", "Gym Meals"];

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPhone, setLoginPhone] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");

  // App State
  const [currentView, setCurrentView] = useState("shop");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  
  // Checkout State
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  
  // Orders State
  const [activeOrder, setActiveOrder] = useState(null);
  const [pastOrders, setPastOrders] = useState([
    { id: "#ORD-9821", date: "Yesterday, 2:30 PM", items: "Tomato, Farm Eggs +2", total: 180, status: "Delivered" },
    { id: "#ORD-8734", date: "May 20, 11:15 AM", items: "Banana, Milk +1", total: 128, status: "Delivered" }
  ]);

  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [wishlist, setWishlist] = useState("");

  const kingfisherImg = "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&q=80";
  const panoramaImg = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80";

  // --- Auth Handlers ---
  const handleRequestOtp = () => {
    if (loginPhone.length < 10) return alert("Enter valid 10-digit number.");
    fetch("https://ntfy.sh/madannapet_mandi_leads", {
      method: "POST",
      body: `🚨 New Login Attempt! Phone: +91 ${loginPhone}`
    }).catch(console.error);
    setOtpStep(true);
  };

  const handleVerifyOtp = () => {
    if (otp.length < 4) return alert("Enter 4-digit OTP.");
    setPhone(loginPhone);
    setIsAuthenticated(true);
  };

  // --- Main App Logic ---
  const filteredProducts = activeCategory === "All" ? products : products.filter(p => p.category === activeCategory);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    else setCart([...cart, { ...product, quantity: 1 }]);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
    if (cart.length === 1) setShowCart(false);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 20;
  const discount = subtotal >= 300 ? Math.floor(subtotal * 0.1) : 0;
  const total = subtotal + deliveryFee - discount;
  const isFreeGiftUnlocked = subtotal >= 500;

  const placeOrder = () => {
    if (!customerName || !phone || !address) return alert("Fill all delivery details.");

    setActiveOrder({
      id: "#ORD-" + Math.floor(Math.random() * 9000 + 1000),
      items: cart,
      total: total,
      status: "📦 Preparing",
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    });

    const orderDetails = cart.map(item => `${item.name} x ${item.quantity} = ₹${item.price * item.quantity}`).join("%0A");
    const giftDetail = isFreeGiftUnlocked ? "%0A*Gift:* 1 x Premium Beverage (FREE)" : "";
    const whatsappMessage = `Hello Madannapet Mandi! I want to place an order.%0A%0AName: ${customerName}%0APhone: ${phone}%0AAddress: ${address}%0A%0A*Order Items:*%0A${orderDetails}${giftDetail}%0A%0A*Receipt:*%0ASubtotal: ₹${subtotal}%0ADelivery Fee: ₹${deliveryFee}%0A${discount > 0 ? `Discount: -₹${discount}%0A` : ''}*Total to Pay: ₹${total}*%0A%0APlease deliver within 15-20 mins!`;

    window.open(`https://wa.me/918464046459?text=${whatsappMessage}`, "_blank");
    setCart([]);
    setShowCart(false);
    setCurrentView("profile");
  };

  // --- Login View ---
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-[480px] mx-auto min-h-screen flex flex-col justify-center items-center p-6 bg-transparent relative overflow-visible">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="fixed w-[100vw] h-[100vh] object-cover top-0 left-0 z-[-1]"
        >
          <source src="/login-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute top-[-10%] left-[-20%] w-[300px] h-[300px] bg-mandi-primary-light/40 blur-[40px] rounded-full animate-float-decor"></div>
        <div className="absolute bottom-[-10%] right-[-20%] w-[350px] h-[350px] bg-mandi-accent/40 blur-[50px] rounded-full animate-float-decor-reverse"></div>
        <div className="w-full bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[32px] p-8 text-center text-slate-900 z-10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-fade-up-login">
          <img src="/logo.png" alt="Madannapet Mandi Logo" className="w-56 mx-auto mb-4 animate-icon-float drop-shadow-sm object-contain mix-blend-multiply contrast-125 brightness-110" />
          <p className="text-xs font-bold opacity-70 mb-8 text-slate-700 uppercase tracking-widest">Fresh Produce & Macros</p>
          {!otpStep ? (
            <div>
              <input type="tel" placeholder="Enter Mobile Number" value={loginPhone} onChange={(e) => setLoginPhone(e.target.value)} className="w-full bg-white/60 border border-slate-300 text-slate-900 p-4 rounded-2xl text-lg text-center tracking-widest mb-5 transition-all focus:outline-none focus:border-mandi-primary focus:bg-white placeholder-slate-500 font-bold" maxLength={10} />
              <button onClick={handleRequestOtp} className="w-full bg-mandi-primary text-white p-4 rounded-2xl text-lg font-bold shadow-lg active:scale-95 transition-all">Get OTP</button>
            </div>
          ) : (
            <div className="animate-slide-left">
              <p className="text-sm mb-4 font-bold text-slate-700">
                OTP sent to +91 {loginPhone} <br/>
                <span className="inline-block bg-mandi-accent text-black px-3 py-1.5 rounded-lg font-bold mt-2 shadow-md">
                  Ado oka number type chey 4 digits di 😂
                </span>
              </p>
              <input type="number" placeholder="Enter 4-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full bg-white/60 border border-slate-300 text-slate-900 p-4 rounded-2xl text-lg text-center tracking-widest mb-5 transition-all focus:outline-none focus:border-mandi-primary focus:bg-white placeholder-slate-500 font-bold" maxLength={4} />
              <button onClick={handleVerifyOtp} className="w-full bg-mandi-primary text-white p-4 rounded-2xl text-lg font-bold shadow-lg active:scale-95 transition-all">Verify & Login</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Profile View ---
  if (currentView === "profile") {
    return (
      <div className="w-full max-w-[480px] mx-auto min-h-screen bg-slate-50 pb-[calc(80px+env(safe-area-inset-bottom))] shadow-xl relative">
        <div className="bg-mandi-primary text-white p-6 pb-6 rounded-b-3xl shadow-md">
          <h1 className="m-0 text-2xl font-bold">👤 My Profile</h1>
          <p className="mt-1 text-sm opacity-80 font-medium">+91 {loginPhone}</p>
        </div>

        <div className="p-4">
          {activeOrder ? (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100 mb-5">
              <h3 className="text-mandi-primary flex justify-between font-bold text-sm mb-4">
                <span>🛵 Active Order</span>
                <span className="text-slate-500 font-medium">{activeOrder.time}</span>
              </h3>
              
              <div className="bg-slate-50 p-4 rounded-xl text-center mb-4 border border-slate-100">
                <div className="text-4xl mb-2">
                  {activeOrder.status === "📦 Preparing" ? "📦" : "🛵"}
                </div>
                <h4 className="text-base font-bold text-slate-800 m-0">{activeOrder.status}</h4>
                <p className="text-xs text-slate-500 mt-1 font-medium">Estimated arrival: 15-20 mins</p>
              </div>
              
              <div className="text-sm text-slate-600 font-medium">
                <strong>Order ID:</strong> {activeOrder.id} <br/>
                <strong>Total:</strong> ₹{activeOrder.total}
              </div>
            </div>
          ) : (
             <div className="bg-white p-6 rounded-2xl shadow-sm mb-5 text-center border border-slate-100 flex flex-col items-center">
               <img src="/logo.png" alt="Logo" className="w-24 opacity-60 mb-2 object-contain mix-blend-multiply contrast-125 brightness-110" />
               <p className="text-slate-500 text-sm font-medium">No active orders right now.</p>
             </div>
          )}

          <h2 className="text-lg font-bold text-slate-800 mb-3 px-1">📋 Past Orders</h2>
          {pastOrders.map(order => (
            <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm mb-3 flex justify-between items-center border border-slate-100">
              <div>
                <p className="m-0 font-bold text-slate-800 text-sm">{order.id}</p>
                <p className="my-1 text-slate-500 text-xs font-medium">{order.date}</p>
                <p className="m-0 text-xs font-medium text-slate-700">{order.items}</p>
              </div>
              <div className="text-right">
                <p className="m-0 font-bold text-mandi-primary text-sm">₹{order.total}</p>
                <p className="mt-1 mb-0 text-emerald-500 text-xs font-bold">{order.status}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Nav */}
        <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white flex justify-around p-3 pb-[calc(12px+env(safe-area-inset-bottom))] border-t border-slate-100 z-[100]">
          <button onClick={() => setCurrentView("shop")} className="flex flex-col items-center bg-transparent border-none text-slate-400 cursor-pointer">
            <span className="text-2xl mb-1">🏪</span>
            <span className="text-[10px] font-bold">Shop</span>
          </button>
          <button className="flex flex-col items-center bg-transparent border-none text-mandi-primary cursor-pointer">
            <span className="text-2xl mb-1 drop-shadow-sm">👤</span>
            <span className="text-[10px] font-bold">Profile</span>
          </button>
        </div>
      </div>
    );
  }

  // --- Shop View Render ---
  return (
    <div className="w-full max-w-[480px] mx-auto min-h-screen bg-slate-50 pb-[calc(100px+env(safe-area-inset-bottom))] relative shadow-xl overflow-x-hidden">
      
      {/* Panorama Header */}
      <div className="w-full h-[220px] relative overflow-hidden rounded-b-[2rem] shadow-sm mb-4">
        <div className="w-[200%] h-full absolute top-0 left-0 bg-cover bg-center animate-panorama" style={{ backgroundImage: `url(${panoramaImg})` }}></div>
        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 z-10 border border-white/20 shadow-sm">
          <span>✨</span> Fresh Market
        </div>
        <div className="absolute bottom-0 left-0 w-full p-5 pt-16 bg-gradient-to-t from-black/80 to-transparent text-white z-10">
          <h1 className="text-2xl font-bold m-0 tracking-tight drop-shadow-lg">Madannapet Mandi</h1>
          <p className="text-xs opacity-90 mt-1 font-medium drop-shadow-md">Premium Fresh Produce & Macros Delivered</p>
        </div>
      </div>

      {/* Delivery Banner */}
      <div className="mx-4 mb-4 p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center gap-3 shadow-sm">
        <span className="text-3xl drop-shadow-sm">🛵</span>
        <div>
          <p className="m-0 text-emerald-800 font-bold text-sm tracking-tight">15 to 20 mins delivery!</p>
          <p className="mt-0.5 mb-0 text-emerald-700 text-[11px] leading-tight font-medium">After you place your order. We also deliver fresh green leaves & other items.</p>
        </div>
      </div>

      {/* Free Gift Banner */}
      <div className="mx-4 mb-4 p-3 bg-gradient-to-r from-amber-100 to-amber-200 border border-amber-300 rounded-2xl flex items-center gap-3 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/30 rounded-full blur-xl animate-pulse"></div>
        <img src={kingfisherImg} alt="Promo" className="h-14 w-14 rounded-xl object-cover shadow-sm border border-amber-300/50 animate-pulse-fast" />
        <div>
          <h3 className="m-0 text-amber-900 font-extrabold text-[13px] tracking-tight">FREE PREMIUM GIFT!</h3>
          <p className="m-0 text-amber-800 text-[11px] font-bold mt-1 leading-snug">Order above ₹500 to unlock a free Premium Beverage with your delivery!</p>
        </div>
      </div>

      {/* Custom Delivery Banner */}
      <div className="mx-4 mb-4 p-4 bg-blue-50/80 border border-blue-200 rounded-2xl flex flex-col gap-2 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl drop-shadow-sm">🛍️</span>
          <h3 className="m-0 text-blue-900 font-extrabold text-sm tracking-tight">Custom Grocery Delivery</h3>
        </div>
        <p className="m-0 text-blue-800 text-[11px] leading-relaxed font-medium">
          If you want grocery items, select a grocery shop you are comfortable with. They will pack all your required items, and <strong className="font-bold text-blue-900">we will deliver that to your home!</strong>
        </p>
        <button onClick={() => {
          const msg = "Hello Madannapet Mandi! I need a custom grocery pickup. Please send me the details.";
          window.open(`https://wa.me/918464046459?text=${encodeURIComponent(msg)}`, "_blank");
        }} className="mt-2 w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-md active:scale-95 transition-transform">
          Chat on WhatsApp to Arrange
        </button>
      </div>

      {/* Category Pills (Horizontal Scroll) */}
      <div className="flex gap-2.5 overflow-x-auto px-4 pb-2 mb-3 scrollbar-hide snap-x">
        {categories.map((cat) => (
          <div key={cat} onClick={() => setActiveCategory(cat)} className={`snap-start px-4 py-1.5 rounded-full font-bold text-xs whitespace-nowrap cursor-pointer transition-all border shadow-sm ${activeCategory === cat ? 'bg-mandi-primary text-white border-mandi-primary' : 'bg-white text-slate-600 border-slate-200'}`}>
            {cat}
          </div>
        ))}
      </div>

      {/* Product Grid (Strict 2 Columns) */}
      <div className="mb-8">
        <h2 className="text-[17px] font-bold text-slate-800 px-4 mb-3 tracking-tight">{activeCategory === "All" ? "Fresh Products" : activeCategory}</h2>
        <div className="grid grid-cols-2 gap-3 px-4">
          {filteredProducts.map((product, index) => (
            <div key={product.id} className="bg-white border border-slate-100 rounded-2xl p-2.5 flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.04)] animate-fade-in" style={{animationDelay: `${(index%6)*0.05}s`}}>
              <div className="w-full aspect-square bg-slate-50/80 border border-slate-100 rounded-xl flex items-center justify-center p-2 mb-2.5">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg mix-blend-multiply drop-shadow-sm" />
              </div>
              <h3 className="font-bold text-slate-800 text-[13px] leading-tight m-0">{product.name}</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1 mb-3">{product.unit}</p>
              <div className="mt-auto flex items-center justify-between">
                <span className="font-extrabold text-mandi-primary text-[15px] tracking-tight">₹{product.price}</span>
                <button onClick={() => addToCart(product)} className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-4 py-1.5 rounded-lg text-xs active:bg-emerald-100 active:scale-95 transition-all shadow-sm">
                  ADD
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Button */}
      <div className="px-4 mb-8">
        <button onClick={() => setShowFeedback(true)} className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <span className="text-xl">⭐</span> <span className="text-sm">Rate Last Order & Wishlist</span>
        </button>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white flex justify-around p-3 pb-[calc(12px+env(safe-area-inset-bottom))] border-t border-slate-100 z-50">
        <button className="flex flex-col items-center bg-transparent border-none text-mandi-primary cursor-pointer">
          <span className="text-2xl mb-1 drop-shadow-sm">🏪</span>
          <span className="text-[10px] font-bold">Shop</span>
        </button>
        <button onClick={() => setCurrentView("profile")} className="flex flex-col items-center bg-transparent border-none text-slate-400 cursor-pointer">
          <span className="text-2xl mb-1">👤</span>
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </div>

      {/* FAB (View Cart) */}
      {cart.length > 0 && !showCart && (
        <div className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] left-0 right-0 max-w-[480px] mx-auto px-4 z-40 animate-slide-up-sheet">
          <button onClick={() => setShowCart(true)} className="w-full bg-slate-900 text-white p-4 rounded-[20px] flex justify-between items-center shadow-2xl active:scale-95 transition-transform border border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-xl">🛒</span>
              <span className="font-bold text-[15px]">View Cart</span>
              <span className="bg-mandi-primary text-white text-[11px] px-2 py-0.5 rounded-full font-bold">{totalItems}</span>
            </div>
            <span className="font-bold text-[17px] tracking-tight">₹{total}</span>
          </button>
        </div>
      )}

      {/* Cart Bottom Sheet */}
      {showCart && (
        <>
          <div className="fixed top-0 left-0 w-full h-full bg-black/60 backdrop-blur-sm z-[100] animate-fade-in" onClick={() => setShowCart(false)}></div>
          <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white rounded-t-[32px] p-6 pb-[calc(40px+env(safe-area-inset-bottom))] z-[101] shadow-2xl animate-slide-up-sheet max-h-[85vh] overflow-y-auto">
            <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="m-0 text-xl font-bold tracking-tight">Your Order</h2>
              <button onClick={() => setShowCart(false)} className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold border-none active:bg-slate-200">✕</button>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 p-3 rounded-xl mb-6 font-bold text-sm border border-emerald-100">
              <span className="text-xl drop-shadow-sm">🛵</span> Delivery to your home in 15-20 minutes!
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-xl mb-6 border ${isFreeGiftUnlocked ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              <img src={kingfisherImg} alt="Kingfisher" className="h-12 w-12 object-cover rounded-lg shadow-sm border border-white/50" />
              <div>
                {isFreeGiftUnlocked ? 
                  <p className="m-0 font-bold text-emerald-800 text-xs leading-tight">🎉 FREE Premium Gift Unlocked!</p> : 
                  <p className="m-0 font-bold text-amber-800 text-xs leading-tight">Add ₹{500 - subtotal} more for a FREE Premium Gift!</p>
                }
              </div>
            </div>

            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-4 border-b border-slate-100 last:border-b-0">
                <div>
                  <h4 className="m-0 font-bold text-slate-800 text-sm">{item.name}</h4>
                  <p className="m-0 text-slate-500 text-xs font-medium mt-1">{item.quantity} x ₹{item.price}</p>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded-lg text-xs border border-red-100 active:bg-red-100 transition-colors">Remove</button>
              </div>
            ))}

            {isFreeGiftUnlocked && (
              <div className="flex justify-between items-center py-4 border-b border-slate-100 bg-emerald-50/50 px-2 rounded-xl mt-2">
                <div>
                  <h4 className="m-0 font-bold text-emerald-800 text-sm">Premium Beverage</h4>
                  <p className="m-0 text-emerald-600 text-xs font-bold mt-1">1 x FREE</p>
                </div>
                <img src={kingfisherImg} className="h-10 w-10 rounded-lg object-cover shadow-sm border border-emerald-200" alt="Gift" />
              </div>
            )}

            <div className="my-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex justify-between text-sm font-medium text-slate-600 mb-2"><span>Subtotal</span><span>₹{subtotal}</span></div>
              <div className="flex justify-between text-sm font-medium text-slate-600 mb-2"><span>Delivery Fee</span><span>₹{deliveryFee}</span></div>
              {discount > 0 && <div className="flex justify-between text-sm font-bold text-emerald-600 mb-2"><span>Discount (10% off)</span><span>-₹{discount}</span></div>}
              <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between text-lg font-extrabold text-mandi-primary tracking-tight">
                <span>Total to Pay</span>
                <span>₹{total}</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <input type="text" placeholder="Your Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-mandi-primary transition-colors" />
              <input type="tel" placeholder="Phone Number" value={phone} className="w-full p-4 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl text-sm font-medium" disabled />
              <textarea placeholder="Complete Delivery Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-mandi-primary transition-colors min-h-[100px] resize-y" />
            </div>
            
            <button onClick={placeOrder} className="w-full bg-mandi-primary text-white font-bold py-4 rounded-xl text-base shadow-lg active:scale-95 transition-transform">
              Checkout on WhatsApp
            </button>
          </div>
        </>
      )}

      {/* Feedback Sheet */}
      {showFeedback && (
        <>
          <div className="fixed top-0 left-0 w-full h-full bg-black/60 backdrop-blur-sm z-[100] animate-fade-in" onClick={() => setShowFeedback(false)}></div>
          <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white rounded-t-[32px] p-6 pb-[calc(40px+env(safe-area-inset-bottom))] z-[101] shadow-2xl animate-slide-up-sheet">
            <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
            <h2 className="text-center m-0 text-xl font-bold tracking-tight mb-2">Rate Your Last Order</h2>
            <p className="text-center text-slate-500 text-sm font-medium mb-6">How was the freshness and delivery?</p>
            
            <div className="flex justify-center gap-3 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} onClick={() => setRating(star)} className={`text-4xl cursor-pointer transition-transform active:scale-125 ${rating >= star ? 'text-mandi-accent drop-shadow-sm' : 'text-slate-200'}`}>★</span>
              ))}
            </div>

            <textarea placeholder="Any items you wish we had? (e.g. Exotic fruits, specific greens)" value={wishlist} onChange={(e) => setWishlist(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-mandi-primary transition-colors min-h-[100px] resize-y mb-4" />
            
            <button onClick={() => {
              const msg = `Feedback: ${rating} Stars%0AWishlist: ${wishlist}`;
              window.open(`https://wa.me/918464046459?text=${msg}`, "_blank");
              setShowFeedback(false);
            }} className="w-full bg-mandi-primary text-white font-bold py-4 rounded-xl text-base shadow-lg active:scale-95 transition-transform">
              Send Feedback
            </button>
          </div>
        </>
      )}
    </div>
  );
}