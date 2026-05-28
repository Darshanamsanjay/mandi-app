import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function BannerManager() {
  const [banner, setBanner] = useState({
    isActive: true,
    title: "FREE PREMIUM GIFT!",
    description: "Order above ₹500 to unlock a free Premium Beverage with your delivery!",
    image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&q=80",
    theme: "amber"
  });
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'banner'));
        if (docSnap.exists()) {
          setBanner(docSnap.data());
        }
      } catch (e) {
        console.error("Error fetching banner:", e);
      }
      setIsLoading(false);
    };
    fetchBanner();
  }, []);

  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'settings', 'banner'), banner);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      alert("Error saving banner: " + e.message);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File is too large. Please use an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBanner({ ...banner, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const themeClasses = {
    amber: {
      bg: "from-amber-100 to-amber-200 border-amber-300",
      imgBorder: "border-amber-300/50",
      title: "text-amber-900",
      desc: "text-amber-800"
    },
    blue: {
      bg: "from-blue-100 to-blue-200 border-blue-300",
      imgBorder: "border-blue-300/50",
      title: "text-blue-900",
      desc: "text-blue-800"
    }
  };

  const t = themeClasses[banner.theme] || themeClasses.amber;

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Loading settings...</div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-lg mb-4 text-slate-800">Live App Preview</h3>
        <div className="bg-slate-50 p-6 rounded-2xl flex justify-center border border-slate-100">
          <div className="w-full max-w-[400px]">
            {banner.isActive ? (
               <div className={`p-3 bg-gradient-to-r ${t.bg} rounded-2xl flex items-center gap-3 shadow-sm relative overflow-hidden`}>
                 <div className="absolute top-0 right-0 w-16 h-16 bg-white/30 rounded-full blur-xl animate-pulse"></div>
                 {banner.image && <img src={banner.image} alt="Promo" className={`h-14 w-14 rounded-xl object-cover shadow-sm border ${t.imgBorder} animate-pulse-fast`} />}
                 <div>
                   <h3 className={`m-0 ${t.title} font-extrabold text-[13px] tracking-tight`}>{banner.title}</h3>
                   <p className={`m-0 ${t.desc} text-[11px] font-bold mt-1 leading-snug`}>{banner.description}</p>
                 </div>
               </div>
            ) : (
               <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center gap-3 shadow-sm">
                 <span className="text-3xl drop-shadow-sm">🛵</span>
                 <div>
                   <p className="m-0 text-emerald-800 font-bold text-sm tracking-tight">Farm Fresh Everyday!</p>
                   <p className="mt-0.5 mb-0 text-emerald-700 text-[11px] leading-tight font-medium">Quality produce delivered directly to your doorstep in minutes.</p>
                 </div>
               </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800">Banner Settings</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="font-bold text-sm text-slate-600">{banner.isActive ? 'Active' : 'Inactive'}</span>
            <input 
              type="checkbox" 
              checked={banner.isActive} 
              onChange={e => setBanner({...banner, isActive: e.target.checked})} 
              className="w-5 h-5 accent-mandi-primary rounded"
            />
          </label>
        </div>

        {banner.isActive ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Banner Title</label>
              <input type="text" value={banner.title} onChange={e => setBanner({...banner, title: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-mandi-primary focus:outline-none font-medium" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
              <textarea value={banner.description} onChange={e => setBanner({...banner, description: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-mandi-primary focus:outline-none font-medium min-h-[80px]" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Theme Color</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200 cursor-pointer text-amber-800 font-bold text-sm">
                  <input type="radio" name="theme" checked={banner.theme === 'amber'} onChange={() => setBanner({...banner, theme: 'amber'})} className="accent-amber-500" /> Amber (Gift)
                </label>
                <label className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200 cursor-pointer text-blue-800 font-bold text-sm">
                  <input type="radio" name="theme" checked={banner.theme === 'blue'} onChange={() => setBanner({...banner, theme: 'blue'})} className="accent-blue-500" /> Blue (Info)
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Banner Image (PNG/JPEG Upload)</label>
              <input type="file" accept="image/png, image/jpeg" onChange={handleImageUpload} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-mandi-primary/10 file:text-mandi-primary hover:file:bg-mandi-primary/20 cursor-pointer" />
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 text-sm font-medium">
            When inactive, the default "Farm Fresh" static banner will automatically take its place to utilize the space beautifully.
          </div>
        )}

        <div className="mt-8 flex items-center gap-4">
          <button 
            onClick={handleSave}
            className="flex-1 bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-transform"
          >
            Save to Firestore
          </button>
          {saveSuccess && <span className="text-emerald-500 font-bold text-sm animate-fade-in">✓ Live Updated</span>}
        </div>
      </div>
    </div>
  );
}
