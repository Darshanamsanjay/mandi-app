import React, { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, doc, query, where, writeBatch, increment, setDoc } from "firebase/firestore";
import "./index.css";
import { countryCodes } from "./countryCodes";
import logoAnimation from "../Create_a_modern_premium_and.mp4";

import LocationPicker from "./components/LocationPicker";
import MapModal from "./components/MapModal";
import LocationBar from "./components/LocationBar";
import { isWithinDeliveryZone } from "./utils/DeliveryZoneValidator";
import { mappls } from "mappls-web-maps";

export default function App() {
  const [products, setProducts] = useState([]);
const [promoBanner, setPromoBanner] = useState({ isActive: false });

useEffect(() => {
  const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
    const prods = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
    setProducts(prods);
  });

  const unsubBanner = onSnapshot(doc(db, 'settings', 'banner'), (docSnap) => {
    if (docSnap.exists()) {
      setPromoBanner(docSnap.data());
    }
  });

  return () => {
    unsubProducts();
    unsubBanner();
  };
}, []);

const categories = ["All", "Popular Packs", "Vegetables", "Fruits", "Protein", "Gym Meals"];

// Authentication State
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [loginPhone, setLoginPhone] = useState("");
const [selectedCountryCode, setSelectedCountryCode] = useState("+91");
const [otpStep, setOtpStep] = useState(false);
const [otp, setOtp] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [authError, setAuthError] = useState("");
const [generatedOtp, setGeneratedOtp] = useState(null);

// Initialize from localStorage
useEffect(() => {
  const savedUser = localStorage.getItem("mandi_user_phone");
  const loginTime = localStorage.getItem("mandi_user_login_time");

  const performLogout = () => {
    localStorage.removeItem("mandi_user_phone");
    localStorage.removeItem("mandi_user_login_time");
    setIsAuthenticated(false);
    setLoginPhone("");
    setPhone("");
    setOtpStep(false);
    setOtp("");
    setGeneratedOtp(null);
    setCurrentView("shop");
  };

  if (savedUser && loginTime) {
    const timeElapsed = Date.now() - parseInt(loginTime, 10);
    const sessionDuration = 15 * 60 * 1000; // 15 minutes

    if (timeElapsed < sessionDuration) {
      setLoginPhone(savedUser);
      setPhone(savedUser);
      setIsAuthenticated(true);
    } else {
      performLogout();
    }
  }
}, []);

// App State
const [currentView, setCurrentView] = useState("shop");
const [activeCategory, setActiveCategory] = useState("All");
const [cart, setCart] = useState([]);
const [showCart, setShowCart] = useState(false);

// Checkout State
const [customerName, setCustomerName] = useState(() => localStorage.getItem("mandi_user_name") || "");
const [phone, setPhone] = useState("");
const [address, setAddress] = useState(() => localStorage.getItem("mandi_user_address") || "");
const [mapCoords, setMapCoords] = useState(() => {
  const saved = localStorage.getItem("mandi_user_coords");
  return saved ? JSON.parse(saved) : null;
});
const [showMapModal, setShowMapModal] = useState(false);
const [tempPosition, setTempPosition] = useState([17.3616, 78.4747]); // Default Hyderabad

const handleConfirmLocation = async ({ address, lat, lng }) => {
  setAddress(address);
  const coords = [lat, lng];
  setMapCoords(coords);
  localStorage.setItem("mandi_user_address", address);
  localStorage.setItem("mandi_user_coords", JSON.stringify(coords));
  setShowMapModal(false);

  if (loginPhone) {
    try {
      await setDoc(doc(db, 'users', loginPhone), {
        defaultAddress: address,
        defaultCoords: coords
      }, { merge: true });
    } catch(e) {
      console.error("Failed to save location to Firestore", e);
    }
  }
};

const requestAndSetLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const outOfZone = !isWithinDeliveryZone(latitude, longitude);

        const applyLocation = (fetchedAddress) => {
          handleConfirmLocation({ address: fetchedAddress, lat: latitude, lng: longitude });
          if (outOfZone) {
            alert("Sorry! Mee location maa 5 KM delivery zone bayata undi. Prastutam maa services available levu.");
          }
        };

        const performGeocode = () => {
          try {
            if (window.mappls_plugin && window.mappls_plugin.rev_geocode) {
               window.mappls_plugin.rev_geocode({ lat: latitude, lng: longitude }, (data) => {
                 let fetchedAddress = "Your Current Location";
                 if (data && data.results && data.results.length > 0) fetchedAddress = data.results[0].formatted_address;
                 else if (data && data.copResults) fetchedAddress = data.copResults.formattedAddress;
                 applyLocation(fetchedAddress);
               });
            } else {
               applyLocation("Your Current Location");
            }
          } catch(e) {
             applyLocation("Your Current Location");
          }
        };

        // Fallback timeout in case initialization hangs
        let geocodeDone = false;
        const safeApply = (addr) => {
          if (!geocodeDone) {
            geocodeDone = true;
            applyLocation(addr);
          }
        };

        if (typeof window.mappls_plugin !== "undefined") {
           performGeocode();
           geocodeDone = true;
        } else {
           const token = "bweqhgqhltgaltkwaexwsdgotghvblzvqjuk";
           try {
             const m = new mappls();
             m.initialize(token, { map: true }, () => {
               if (!geocodeDone) performGeocode();
               geocodeDone = true;
             });
             // Safety timeout: if mappls doesn't load in 2s, apply raw coordinates
             setTimeout(() => safeApply("Your Current Location"), 2000);
           } catch(err) {
             safeApply("Your Current Location");
           }
        }
      },
      (error) => {
        console.warn("Geolocation permission denied or failed:", error);
        alert("Could not fetch your location. Please select it manually.");
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
};

// Orders State
const [activeOrder, setActiveOrder] = useState(null);
const [pastOrders, setPastOrders] = useState([]);

useEffect(() => {
  if (loginPhone) {
    const q = query(collection(db, 'orders'), where('phone', '==', loginPhone));
    const unsub = onSnapshot(q, (snapshot) => {
      const userOrders = snapshot.docs.map(doc => ({ ...doc.data(), firestoreId: doc.id }));
      userOrders.sort((a,b) => b.timestamp - a.timestamp);
      setPastOrders(userOrders);

      // Auto-fill details from latest order if currently empty
      if (userOrders.length > 0) {
        const latest = userOrders[0];
        
        setCustomerName(prev => {
          if (!prev && latest.customerName) {
            localStorage.setItem("mandi_user_name", latest.customerName);
            return latest.customerName;
          }
          return prev;
        });

        setAddress(prev => {
          if (!prev && latest.address) {
            localStorage.setItem("mandi_user_address", latest.address);
            return latest.address;
          }
          return prev;
        });

        setMapCoords(prev => {
          if (!prev && latest.mapCoords) {
            localStorage.setItem("mandi_user_coords", JSON.stringify(latest.mapCoords));
            return latest.mapCoords;
          }
          return prev;
        });
      }

      const active = userOrders.find(o => !o.status.includes('Delivered') && !o.status.includes('Cancelled'));
      setActiveOrder(active || null);
    });
    return () => unsub();
  } else {
    setPastOrders([]);
    setActiveOrder(null);
  }
}, [loginPhone]); // Refresh when loginPhone changes

const [showFeedback, setShowFeedback] = useState(false);
const [rating, setRating] = useState(0);
const [wishlist, setWishlist] = useState("");

const kingfisherImg = "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&q=80";
const panoramaImg = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80";

// --- Auth Handlers ---
const handleRequestOtp = () => {
  setAuthError("");
  if (loginPhone.length < 10) return setAuthError("Enter valid 10-digit number.");
  setIsLoading(true);

  // Simulate network delay
  setTimeout(() => {
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    setOtpStep(true);
    setIsLoading(false);

    fetch("https://ntfy.sh/madannapet_mandi_leads", {
      method: "POST",
      body: `🚨 New Mock Login Attempt! Phone: ${selectedCountryCode} ${loginPhone}`
    }).catch(console.error);
  }, 1500);
};

const handleVerifyOtp = () => {
  setAuthError("");
  if (otp.length !== 6) return setAuthError("Enter the 6-digit OTP.");
  setIsLoading(true);

  setTimeout(() => {
    if (otp === generatedOtp) {
      setPhone(loginPhone);
      setIsAuthenticated(true);
      localStorage.setItem("mandi_user_phone", loginPhone);
      localStorage.setItem("mandi_user_login_time", Date.now().toString());
      requestAndSetLocation();
    } else {
      setAuthError("Invalid OTP. Please try again.");
    }
    setIsLoading(false);
  }, 1000);
};

const handleLogout = () => {
  localStorage.removeItem("mandi_user_phone");
  localStorage.removeItem("mandi_user_login_time");
  setIsAuthenticated(false);
  setLoginPhone("");
  setPhone("");
  setOtpStep(false);
  setOtp("");
  setGeneratedOtp(null);
  setCurrentView("shop");
};

// --- Main App Logic ---
const availableProducts = products.filter(p => p.stock === undefined || p.stock === '' || Number(p.stock) > 0);
const filteredProducts = activeCategory === "All" ? availableProducts : availableProducts.filter(p => p.category === activeCategory);

const addToCart = (product) => {
  if (!mapCoords || !address) {
    alert("Please select a delivery location first.");
    setShowMapModal(true);
    return;
  }
  if (!isWithinDeliveryZone(mapCoords[0], mapCoords[1])) {
    alert("Service is currently unavailable in your area.");
    return;
  }

  const existing = cart.find(item => item.id === product.id);
  if (existing) setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
  else setCart([...cart, { ...product, quantity: 1 }]);
};

const removeFromCart = (id) => {
  setCart(cart.filter(item => item.id !== id));
  if (cart.length === 1) setShowCart(false);
};

const decreaseQuantity = (id) => {
  const existing = cart.find(item => item.id === id);
  if (existing.quantity === 1) {
    removeFromCart(id);
  } else {
    setCart(cart.map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item));
  }
};

const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
const deliveryFee = 20;
const discount = subtotal >= 300 ? Math.floor(subtotal * 0.1) : 0;
const total = subtotal + deliveryFee - discount;
const isFreeGiftUnlocked = subtotal >= 500;

const placeOrder = async () => {
  if (!customerName || !phone || !address) return alert("Fill all delivery details.");

  // Save name for next time
  localStorage.setItem("mandi_user_name", customerName);

  const newOrder = {
    id: "#ORD-" + Math.floor(Math.random() * 9000 + 1000),
    customerName,
    phone,
    address,
    mapCoords,
    latitude: mapCoords ? mapCoords[0] : null,
    longitude: mapCoords ? mapCoords[1] : null,
    items: cart,
    total: total,
    status: "📦 Preparing",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: Date.now()
  };

  try {
    const batch = writeBatch(db);
    
    // 1. Add the new order
    const orderRef = doc(collection(db, 'orders'));
    batch.set(orderRef, newOrder);

    // 2. Deduct stock for each cart item
    cart.forEach(item => {
      if (item.stock !== undefined && item.stock !== '') {
        const productRef = doc(db, 'products', item.id);
        batch.update(productRef, { stock: increment(-item.quantity) });
      }
    });

    await batch.commit();
  } catch (e) {
    alert("Failed to send order. Please try again.");
    return;
  }

  setActiveOrder(newOrder);
  setPastOrders(prev => [newOrder, ...prev]);

  const orderDetails = cart.map(item => `${item.name} x ${item.quantity} = ₹${item.price * item.quantity}`).join("%0A");
  const giftDetail = isFreeGiftUnlocked ? "%0A*Gift:* 1 x Premium Beverage (FREE)" : "";
  const mapLink = mapCoords ? `%0A*Location:* https://maps.google.com/?q=${mapCoords[0]},${mapCoords[1]}` : "";
  const whatsappMessage = `Hello Madannapet Mandi! I want to place an order.%0A%0AName: ${customerName}%0APhone: ${phone}%0AAddress: ${address}${mapLink}%0A%0A*Order Items:*%0A${orderDetails}${giftDetail}%0A%0A*Receipt:*%0ASubtotal: ₹${subtotal}%0ADelivery Fee: ₹${deliveryFee}%0A${discount > 0 ? `Discount: -₹${discount}%0A` : ''}*Total to Pay: ₹${total}*%0A%0APlease deliver within 15-20 mins!`;

  window.open(`https://wa.me/918464046459?text=${whatsappMessage}`, "_blank");
  setCart([]);
  setShowCart(false);
  setCurrentView("profile");
};

// --- Login View ---
if (!isAuthenticated) {
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6 font-sans relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100 via-emerald-300 to-emerald-500">
      
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.1)] p-10 border border-white/40 text-center animate-fade-up relative z-10">

        <video 
          autoPlay 
          loop 
          muted 
          defaultMuted
          playsInline 
          className="w-72 sm:w-80 mx-auto mb-8 object-contain mix-blend-multiply contrast-125 brightness-110"
          style={{ 
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent), linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)', 
            WebkitMaskComposite: 'source-in',
            maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent), linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
            maskComposite: 'intersect'
          }}
        >
          <source src={logoAnimation} type="video/mp4" />
        </video>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
        <p className="text-gray-500 text-sm mb-8">Enter your mobile number to continue.</p>

        {authError && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 animate-shake">
            {authError}
          </div>
        )}

        {generatedOtp && otpStep && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 animate-fade-in text-center">
            <span className="block text-xs text-emerald-600 mb-1 font-bold">MOCK OTP RECEIVED</span>
            <span className="text-2xl tracking-[0.3em] font-extrabold block">{generatedOtp}</span>
            <span className="inline-block mt-2 text-emerald-600 text-[11px] font-medium">
              Enter the OTP below to verify
            </span>
          </div>
        )}

        {!otpStep ? (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-stretch bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900 transition-all w-full">
              <div className="w-[85px] sm:w-[100px] flex items-center justify-center bg-gray-50 border-r border-gray-200 text-gray-700 font-semibold text-xs sm:text-base relative group/select cursor-pointer hover:bg-gray-100 transition-colors shrink-0">
                <select
                  value={selectedCountryCode}
                  onChange={(e) => setSelectedCountryCode(e.target.value)}
                  className="appearance-none bg-transparent outline-none cursor-pointer pl-2 pr-5 sm:pl-3 sm:pr-7 py-4 text-xs sm:text-base font-semibold text-gray-700 w-full h-full z-10 focus:outline-none"
                >
                  {countryCodes.map(c => (
                    <option key={c.name + c.code} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
                <div className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover/select:text-gray-600 transition-colors z-0">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              <input
                type="tel"
                placeholder="Mobile Number"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                className="flex-1 p-4 pl-3 text-left text-lg sm:text-xl tracking-[0.1em] sm:tracking-[0.15em] font-medium text-gray-800 focus:outline-none placeholder:tracking-normal placeholder:font-normal placeholder:text-gray-400 bg-transparent min-w-0"
                maxLength={10}
              />
            </div>

            <button 
              onClick={handleRequestOtp} 
              disabled={isLoading} 
              className="group relative w-full flex items-center justify-center gap-3 py-4 rounded-lg font-bold tracking-widest uppercase text-xs overflow-hidden border border-gray-900 text-gray-900 transition-colors duration-300 hover:text-white disabled:opacity-50 disabled:hover:text-gray-900 active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gray-900 -translate-x-full group-hover:translate-x-0 group-disabled:hidden transition-transform duration-500 ease-out z-0"></div>
              
              {isLoading ? (
                <span className="animate-spin text-xl z-10">⏳</span>
              ) : (
                <>
                  <span className="z-10 relative">Get OTP</span>
                  <svg className="w-4 h-4 z-10 relative transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-slide-left">
            <p className="text-sm font-medium text-gray-600">
              OTP sent to <span className="font-bold text-gray-900">{selectedCountryCode} {loginPhone}</span>
            </p>

            <div>
              <input
                type="number"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-white border border-gray-300 p-4 rounded-lg text-center text-xl tracking-[0.4em] font-medium text-gray-800 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none transition-all placeholder:tracking-normal placeholder:font-normal placeholder:text-gray-400"
                maxLength={6}
              />
            </div>

            <button 
              onClick={handleVerifyOtp} 
              disabled={isLoading} 
              className="group relative w-full flex items-center justify-center gap-3 py-4 rounded-lg font-bold tracking-widest uppercase text-xs overflow-hidden border border-gray-900 text-gray-900 transition-colors duration-300 hover:text-white disabled:opacity-50 disabled:hover:text-gray-900 active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gray-900 -translate-x-full group-hover:translate-x-0 group-disabled:hidden transition-transform duration-500 ease-out z-0"></div>
              
              {isLoading ? (
                <span className="animate-spin text-xl z-10">⏳</span>
              ) : (
                <>
                  <span className="z-10 relative">Verify & Login</span>
                  <svg className="w-4 h-4 z-10 relative transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}

        <div className="mt-8 text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Mandi App. All rights reserved.
        </div>
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
              <strong>Order ID:</strong> {activeOrder.id} <br />
              <strong>Total:</strong> ₹{activeOrder.total}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl shadow-sm mb-5 text-center border border-slate-100 flex flex-col items-center">
            <video 
              autoPlay 
              loop 
              muted 
              defaultMuted
              playsInline 
              className="w-24 opacity-60 mb-2 object-contain mix-blend-multiply contrast-125 brightness-110"
              style={{ 
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent), linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)', 
                WebkitMaskComposite: 'source-in',
                maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent), linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
                maskComposite: 'intersect'
              }}
            >
              <source src={logoAnimation} type="video/mp4" />
            </video>
            <p className="text-slate-500 text-sm font-medium">No active orders right now.</p>
          </div>
        )}

        <h2 className="text-lg font-bold text-slate-800 mb-3 px-1">📋 Past Orders</h2>
        {pastOrders.map(order => (
          <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm mb-3 flex justify-between items-center border border-slate-100">
            <div>
              <p className="m-0 font-bold text-slate-800 text-sm">{order.id}</p>
              <p className="my-1 text-slate-500 text-xs font-medium">{order.date || order.time}</p>
              <p className="m-0 text-xs font-medium text-slate-700">
                {Array.isArray(order.items) 
                  ? order.items.map(i => `${i.quantity}x ${i.name}`).join(', ') 
                  : order.items}
              </p>
            </div>
            <div className="text-right">
              <p className="m-0 font-bold text-mandi-primary text-sm">₹{order.total}</p>
              <p className="mt-1 mb-0 text-emerald-500 text-xs font-bold">{order.status}</p>
            </div>
          </div>
        ))}

        <button 
          onClick={() => window.open('https://wa.me/919676305084?text=' + encodeURIComponent('Hello! I need some support/feedback regarding the Mandi App.'), '_blank')}
          className="mt-6 w-full bg-emerald-50 text-emerald-700 font-bold py-3.5 rounded-2xl border border-emerald-200 shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <span className="text-xl">💬</span> Get Support & Feedback
        </button>

        <button onClick={handleLogout} className="mt-3 w-full bg-red-50 text-red-600 font-bold py-3.5 rounded-2xl border border-red-200 shadow-sm active:scale-95 transition-transform">
          Log Out
        </button>

        {/* Creative Sticker Note */}
        <div 
          onClick={() => {
            const shareText = "Hey! Check out Madannapet Mandi for premium farm-fresh produce and custom grocery delivery right to your doorstep. Order now! 🥦🛒 " + window.location.origin;
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
          }}
          className="mt-10 mb-4 mx-auto w-10/12 max-w-[280px] bg-amber-100/90 p-4 rounded-lg shadow-[2px_4px_10px_rgba(0,0,0,0.1)] -rotate-2 relative border border-amber-200/50 backdrop-blur-sm cursor-pointer hover:scale-105 hover:-rotate-3 active:scale-95 transition-all duration-300"
        >
          {/* Tape Effect */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3.5 bg-white/60 -rotate-3 rounded-sm shadow-sm pointer-events-none"></div>
          <p className="text-amber-900 font-serif italic text-center text-[13px] font-bold leading-relaxed m-0 pointer-events-none">
            "Refer to others if you really care about them" ❤️
          </p>
        </div>
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

    <LocationBar 
      address={address} 
      mapCoords={mapCoords} 
      onClick={() => setShowMapModal(true)} 
    />

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

    {/* Promo Banner / Active Banner */}
    {promoBanner.isActive ? (
      (() => {
        const t = {
          amber: { bg: "from-amber-100 to-amber-200 border-amber-300", img: "border-amber-300/50", title: "text-amber-900", desc: "text-amber-800" },
          blue: { bg: "from-blue-100 to-blue-200 border-blue-300", img: "border-blue-300/50", title: "text-blue-900", desc: "text-blue-800" }
        }[promoBanner.theme] || { bg: "from-amber-100 to-amber-200 border-amber-300", img: "border-amber-300/50", title: "text-amber-900", desc: "text-amber-800" };

        return (
          <div className={`mx-4 mb-4 p-3 bg-gradient-to-r ${t.bg} rounded-2xl flex items-center gap-3 shadow-sm relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/30 rounded-full blur-xl animate-pulse"></div>
            {promoBanner.image && <img src={promoBanner.image} alt="Promo" className={`h-14 w-14 rounded-xl object-cover shadow-sm border ${t.img} animate-pulse-fast`} />}
            <div>
              <h3 className={`m-0 ${t.title} font-extrabold text-[13px] tracking-tight`}>{promoBanner.title}</h3>
              <p className={`m-0 ${t.desc} text-[11px] font-bold mt-1 leading-snug`}>{promoBanner.description}</p>
            </div>
          </div>
        );
      })()
    ) : (
      <div className="mx-4 mb-4 p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center gap-3 shadow-sm">
        <span className="text-3xl drop-shadow-sm">🛵</span>
        <div>
          <p className="m-0 text-emerald-800 font-bold text-sm tracking-tight">Farm Fresh Everyday!</p>
          <p className="mt-0.5 mb-0 text-emerald-700 text-[11px] leading-tight font-medium">Quality produce delivered directly to your doorstep in minutes.</p>
        </div>
      </div>
    )}

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
          <div key={product.id} className="bg-white border border-slate-100 rounded-2xl p-2.5 flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.04)] animate-fade-in" style={{ animationDelay: `${(index % 6) * 0.05}s` }}>
            <div className="w-full aspect-square bg-slate-50/80 border border-slate-100 rounded-xl flex items-center justify-center p-2 mb-2.5">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg mix-blend-multiply drop-shadow-sm" />
            </div>
            <h3 className="font-bold text-slate-800 text-[13px] leading-tight m-0">{product.name}</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1 mb-3">{product.unit}</p>
            <div className="mt-auto flex items-center justify-between">
              <span className="font-extrabold text-mandi-primary text-[15px] tracking-tight">₹{product.price}</span>
              {(() => {
                const cartItem = cart.find(item => item.id === product.id);
                if (cartItem) {
                  return (
                    <div className="flex items-center bg-emerald-50 border border-emerald-200 rounded-lg overflow-hidden shadow-sm h-[32px]">
                      <button onClick={() => decreaseQuantity(product.id)} className="w-8 h-full flex items-center justify-center text-emerald-700 font-bold active:bg-emerald-100 transition-colors border-r border-emerald-100 hover:bg-emerald-100">-</button>
                      <span className="w-6 text-center text-xs font-bold text-emerald-800">{cartItem.quantity}</span>
                      <button onClick={() => addToCart(product)} className="w-8 h-full flex items-center justify-center text-emerald-700 font-bold active:bg-emerald-100 transition-colors border-l border-emerald-100 hover:bg-emerald-100">+</button>
                    </div>
                  );
                } else {
                  return (
                    <button onClick={() => addToCart(product)} className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-4 h-[32px] rounded-lg text-xs active:bg-emerald-100 active:scale-95 hover:bg-emerald-100 transition-all shadow-sm">
                      ADD
                    </button>
                  );
                }
              })()}
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
            <LocationPicker 
              address={address} 
              mapCoords={mapCoords} 
              onOpenMap={() => setShowMapModal(true)} 
            />
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

    {/* Map Modal */}
    {showMapModal && (
      <MapModal 
        onClose={() => setShowMapModal(false)}
        onConfirm={handleConfirmLocation}
      />
    )}
  </div>
  );
}