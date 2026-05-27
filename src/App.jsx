import React, { useState } from "react";
import "./index.css";

export default function MadannapetMandiApp() {
  // Using direct premium web URLs to guarantee zero Vite errors and instant deployment!
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
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Orders State
  const [activeOrder, setActiveOrder] = useState(null);
  const pastOrders = [
    { id: "#ORD-882", date: "12 May 2026", items: "Tomato, Banana", total: 158, status: "✅ Delivered" },
    { id: "#ORD-719", date: "05 May 2026", items: "Broccoli, Eggs", total: 450, status: "✅ Delivered" },
  ];

  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [wishlist, setWishlist] = useState("");

  // Promo Image URL
  const kingfisherImg = "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&q=80";
  const panoramaImg = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80";

  // --- Auth Handlers ---
  const handleRequestOtp = () => {
    if (loginPhone.length < 10) return alert("Enter valid 10-digit number.");
    
    // Send a silent push notification to the admin so they can capture the lead
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

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          style={{
            position: 'fixed',
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            top: 0,
            left: 0,
            zIndex: -1,
          }}
        >
          <source src="/login-video.mp4" type="video/mp4" />
        </video>
        <div className="login-card" style={{ zIndex: 10 }}>
          <div className="login-icon">🛒</div>
          <h1 className="login-title">Madannapet Mandi</h1>
          <p className="login-subtitle">Fresh Produce & Macros Delivered</p>
          {!otpStep ? (
            <div>
              <input type="tel" placeholder="Enter Mobile Number" value={loginPhone} onChange={(e) => setLoginPhone(e.target.value)} className="login-input" maxLength={10} />
              <button onClick={handleRequestOtp} className="btn-login">Get OTP</button>
            </div>
          ) : (
            <div className="otp-animation">
              <p style={{ fontSize: '0.9rem', marginBottom: '16px', opacity: 0.9 }}>
                OTP sent to +91 {loginPhone} <br/>
                <span style={{ display: 'inline-block', background: '#f59e0b', color: 'black', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', marginTop: '8px', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)' }}>
                  Ado oka number type chey 4 digits di 😂
                </span>
              </p>
              <input type="number" placeholder="Enter 4-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="login-input" maxLength={4} />
              <button onClick={handleVerifyOtp} className="btn-login">Verify & Login</button>
            </div>
          )}
        </div>
      </div>
    );
  }

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

  // Profile View Render
  if (currentView === "profile") {
    return (
      <div className="app-container" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom))', minHeight: '100vh', background: 'var(--bg-color)' }}>
        <div style={{ background: 'var(--primary)', color: 'white', padding: '24px 20px', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>👤 My Profile</h1>
          <p style={{ margin: '8px 0 0 0', opacity: 0.8 }}>+91 {loginPhone}</p>
        </div>

        <div style={{ padding: '20px' }}>
          {activeOrder ? (
            <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow)', marginBottom: '24px', border: '2px solid var(--primary-light)' }}>
              <h3 style={{ margin: '0 0 16px 0', color: 'var(--primary)', display: 'flex', justifyContent: 'space-between' }}>
                <span>🛵 Active Order</span>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>{activeOrder.time}</span>
              </h3>
              
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '8px' }}>
                  {activeOrder.status === "📦 Preparing" ? "📦" : "🛵"}
                </div>
                <h4 style={{ margin: 0, color: 'var(--text-dark)', fontSize: '1.2rem' }}>{activeOrder.status}</h4>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-light)', fontSize: '0.9rem' }}>Estimated arrival: 15-20 mins</p>
              </div>
              
              <div style={{ fontSize: '0.95rem', color: '#555' }}>
                <strong>Order ID:</strong> {activeOrder.id} <br/>
                <strong>Total:</strong> ₹{activeOrder.total}
              </div>
            </div>
          ) : (
             <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow)', marginBottom: '24px', textAlign: 'center' }}>
               <span style={{ fontSize: '2rem' }}>🛒</span>
               <p style={{ color: 'var(--text-light)', margin: '8px 0 0 0' }}>No active orders right now.</p>
             </div>
          )}

          <h2 style={{ fontSize: '1.3rem', color: 'var(--text-dark)', margin: '0 0 16px 0' }}>📋 Past Orders</h2>
          {pastOrders.map(order => (
            <div key={order.id} style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: 'var(--shadow)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-dark)' }}>{order.id}</p>
                <p style={{ margin: '4px 0', color: 'var(--text-light)', fontSize: '0.85rem' }}>{order.date}</p>
                <p style={{ margin: 0, fontSize: '1.2rem' }}>{order.items}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--primary)' }}>₹{order.total}</p>
                <p style={{ margin: '4px 0 0 0', color: '#10b981', fontSize: '0.85rem', fontWeight: 'bold' }}>{order.status}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', display: 'flex', borderTop: '1px solid #eee', padding: '12px 20px calc(12px + env(safe-area-inset-bottom))', justifyContent: 'space-around', zIndex: 100 }}>
          <button onClick={() => setCurrentView("shop")} style={{ background: 'none', border: 'none', fontSize: '1rem', color: '#888', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🏪</span> Shop
          </button>
          <button style={{ background: 'none', border: 'none', fontSize: '1rem', color: 'var(--primary)', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>👤</span> Profile
          </button>
        </div>
      </div>
    );
  }

  // --- Shop View Render ---
  return (
    <div className="app-container" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
      <div className="panorama-header">
        <div className="panorama-image" style={{ backgroundImage: `url(${panoramaImg})` }}></div>
        <div className="panorama-badge"><span>✨</span> Fresh Market</div>
        <div className="panorama-overlay">
          <h1>Madannapet Mandi</h1>
          <p>Premium Fresh Produce & Macros Delivered</p>
        </div>
      </div>

      {/* New Flash Delivery Banner */}
      <div style={{ margin: '16px 20px 0', padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '2rem' }}>🛵</span>
        <div>
          <p style={{ margin: 0, color: '#065f46', fontWeight: '800', fontSize: '1rem' }}>15 to 20 mins delivery!</p>
          <p style={{ margin: '2px 0 0 0', color: '#047857', fontSize: '0.85rem', lineHeight: '1.3', fontWeight: '500' }}>After you place your order. We also deliver fresh green leaves & other items.</p>
        </div>
      </div>

      <div style={{ background: 'linear-gradient(90deg, #fef3c7 0%, #fde68a 100%)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', margin: '16px 20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)', border: '1px solid #fbbf24' }}>
        <img src={kingfisherImg} alt="Kingfisher Premium" style={{ height: '80px', width: '80px', borderRadius: '12px', objectFit: 'cover', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }} />
        <div>
          <h3 style={{ margin: '0 0 4px 0', color: '#92400e', fontSize: '1.15rem', fontWeight: '800' }}>FREE PREMIUM GIFT!</h3>
          <p style={{ margin: 0, color: '#b45309', fontSize: '0.95rem', fontWeight: '600' }}>Order above ₹500 to unlock a free Premium Beverage with your delivery!</p>
        </div>
      </div>

      {/* Custom Grocery Delivery Service Banner */}
      <div style={{ margin: '16px 20px 0', padding: '16px', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.8rem' }}>🛍️</span>
          <h3 style={{ margin: 0, color: '#1e3a8a', fontSize: '1.1rem', fontWeight: '800' }}>Custom Grocery Delivery</h3>
        </div>
        <p style={{ margin: 0, color: '#1e40af', fontSize: '0.9rem', lineHeight: '1.4', fontWeight: '500' }}>
          If you want grocery items, select a grocery shop you are comfortable with. They will pack all your required items, and <strong>we will deliver that to your home!</strong>
        </p>
        <button className="btn-primary" style={{ background: '#2563eb', color: 'white', marginTop: '8px', padding: '10px', fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }} onClick={() => {
          const message = "Hello Madannapet Mandi! I need a custom grocery pickup. Please send me the details.";
          window.open(`https://wa.me/918464046459?text=${encodeURIComponent(message)}`, "_blank");
        }}>
          Chat on WhatsApp to Arrange
        </button>
      </div>

      <div className="category-scroll" style={{ marginTop: '16px' }}>
        {categories.map((cat) => (
          <div key={cat} className={`category-pill ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</div>
        ))}
      </div>

      <div>
        <h2 className="section-title">{activeCategory === "All" ? "Fresh Products" : activeCategory}</h2>
        <div className="products-grid">
          {filteredProducts.map((product, index) => (
            <div key={product.id} className="product-card" style={{ animationDelay: `${(index % 6) * 0.1}s` }}>
              <div className="product-image-container">
                <img src={product.image} alt={product.name} className="product-image" />
              </div>
              <h3 className="product-title">{product.name}</h3>
              <p className="product-unit">{product.unit}</p>
              <div className="product-bottom">
                <span className="product-price">₹{product.price}</span>
                <button onClick={() => addToCart(product)} className="add-btn">+</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="feedback-btn-container">
        <button className="btn-feedback" onClick={() => setShowFeedback(true)}><span style={{ fontSize: '1.4rem' }}>⭐</span> Rate Last Order & Wishlist</button>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', display: 'flex', borderTop: '1px solid #eee', padding: '12px 20px calc(12px + env(safe-area-inset-bottom))', justifyContent: 'space-around', zIndex: 100 }}>
        <button style={{ background: 'none', border: 'none', fontSize: '1rem', color: 'var(--primary)', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
          <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🏪</span> Shop
        </button>
        <button onClick={() => setCurrentView("profile")} style={{ background: 'none', border: 'none', fontSize: '1rem', color: '#888', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
          <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>👤</span> Profile
        </button>
      </div>

      {cart.length > 0 && !showCart && (
        <div className="fab-container" style={{ bottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
          <button className="fab" onClick={() => setShowCart(true)}>
            <div className="fab-left"><span style={{ fontSize: '1.2rem' }}>🛒</span><span>View Cart</span><span className="fab-badge">{totalItems}</span></div>
            <span>₹{total}</span>
          </button>
        </div>
      )}

      {showCart && (
        <>
          <div className="bottom-sheet-overlay" onClick={() => setShowCart(false)}></div>
          <div className="bottom-sheet">
            <div className="sheet-handle"></div>
            <div className="cart-header"><h2>Your Order</h2><button className="close-btn" onClick={() => setShowCart(false)}>✕</button></div>
            <div className="delivery-estimate"><span style={{ fontSize: '1.2rem' }}>🛵</span><span>Delivery to your home in <strong>15-20 minutes!</strong></span></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: isFreeGiftUnlocked ? '#dcfce7' : '#fef3c7', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>
              <img src={kingfisherImg} alt="Kingfisher" style={{ height: '50px', width: 'auto', objectFit: 'cover', borderRadius: '8px' }} />
              <div>
                {isFreeGiftUnlocked ? <p style={{ margin: 0, fontWeight: 'bold', color: '#166534', fontSize: '0.9rem' }}>🎉 FREE Premium Gift Unlocked!</p> : <p style={{ margin: 0, fontWeight: 'bold', color: '#92400e', fontSize: '0.9rem' }}>Add ₹{500 - subtotal} more for a FREE Premium Gift!</p>}
              </div>
            </div>

            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info"><h4>{item.name}</h4><p>{item.quantity} x ₹{item.price}</p></div>
                <button onClick={() => removeFromCart(item.id)} className="btn-remove">Remove</button>
              </div>
            ))}

            {isFreeGiftUnlocked && (
              <div className="cart-item" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <div className="cart-item-info"><h4 style={{ color: '#166534' }}>Premium Beverage</h4><p style={{ color: '#166534', fontWeight: 'bold' }}>1 x FREE</p></div><img src={kingfisherImg} style={{ height: '40px', borderRadius: '4px' }} alt="Gift" />
              </div>
            )}

            <div className="receipt-breakdown">
              <div className="receipt-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
              <div className="receipt-row"><span>Delivery Fee</span><span>₹{deliveryFee}</span></div>
              {discount > 0 && <div className="receipt-row discount"><span>Discount (10% off)</span><span>-₹{discount}</span></div>}
            </div>
            <div className="cart-total">Total to Pay: ₹{total}</div>

            <div className="form-group"><input type="text" placeholder="Your Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="input-field" /></div>
            <div className="form-group"><input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" disabled style={{ background: '#eee', color: '#666' }} /></div>
            <div className="form-group"><textarea placeholder="Complete Delivery Address" value={address} onChange={(e) => setAddress(e.target.value)} className="input-field" /></div>
            <button onClick={placeOrder} className="btn-primary">Checkout on WhatsApp</button>
          </div>
        </>
      )}

      {showFeedback && (
        <>
          <div className="bottom-sheet-overlay" onClick={() => setShowFeedback(false)}></div>
          <div className="bottom-sheet" style={{ zIndex: 102 }}>
            <div className="sheet-handle"></div>
            <div className="cart-header"><h2>Feedback & Wishlist</h2><button className="close-btn" onClick={() => setShowFeedback(false)}>✕</button></div>
            <p className="feedback-text">How was your last delivery experience with us?</p>
            <div className="stars-container">
              {[1, 2, 3, 4, 5].map((star) => <span key={star} className={`star ${rating >= star ? 'active' : ''}`} onClick={() => setRating(star)}>★</span>)}
            </div>
            <div className="form-group">
              <textarea placeholder="What new items or groceries should we add to our store next time?" value={wishlist} onChange={(e) => setWishlist(e.target.value)} className="input-field" style={{ minHeight: '120px' }} />
            </div>
            <button onClick={submitFeedback} className="btn-primary" style={{ background: 'var(--accent)', color: '#000' }}>Send to WhatsApp</button>
          </div>
        </>
      )}
    </div>
  );
}