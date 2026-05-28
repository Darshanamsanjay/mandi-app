import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setProducts(prods);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async (prodData) => {
    if (editingProduct && editingProduct.id) {
      await updateDoc(doc(db, 'products', editingProduct.id), prodData);
    } else {
      await addDoc(collection(db, 'products'), prodData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteDoc(doc(db, 'products', id));
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <input 
          type="text" 
          placeholder="🔍 Search products..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 p-3 rounded-xl border border-slate-200 focus:border-mandi-primary focus:outline-none shadow-sm"
        />
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="bg-mandi-primary hover:bg-mandi-primary/90 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform active:scale-95 whitespace-nowrap"
        >
          + Add Product
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Loading products from Firestore...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                  <th className="p-4 font-bold">Product</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Stock</th>
                  <th className="p-4 font-bold">Price</th>
                  <th className="p-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 flex items-center gap-3 min-w-[200px]">
                      <img src={product.image} className="w-12 h-12 rounded-lg object-cover bg-slate-100" alt={product.name} />
                      <div>
                        <p className="font-bold text-slate-800">{product.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{product.unit}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-600">
                      <span className="bg-slate-100 px-3 py-1 rounded-full whitespace-nowrap">{product.category}</span>
                    </td>
                    <td className="p-4 font-bold">
                      {product.stock !== undefined && product.stock !== '' ? (
                        Number(product.stock) > 0 ? (
                          <span className="text-slate-700">{product.stock} qty</span>
                        ) : (
                          <span className="text-red-600 bg-red-50 px-2.5 py-1 rounded-lg text-xs font-extrabold border border-red-100">Out of Stock</span>
                        )
                      ) : (
                        <span className="text-slate-400 font-medium text-xs">Not tracked</span>
                      )}
                    </td>
                    <td className="p-4 font-extrabold text-mandi-primary">₹{product.price}</td>
                    <td className="p-4 space-x-2 whitespace-nowrap">
                      <button 
                        onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-500 font-medium">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <ProductModal 
          product={editingProduct} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function ProductModal({ product, onClose, onSave }) {
  const [formData, setFormData] = useState(
    product || { name: '', price: '', unit: '', category: 'Vegetables', image: '', stock: '' }
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File is too large. Please use an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const categories = ["Popular Packs", "Vegetables", "Fruits", "Protein", "Gym Meals"];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full font-bold text-slate-500 hover:bg-slate-200">✕</button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Product Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-mandi-primary focus:outline-none font-medium" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Price (₹)</label>
              <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-mandi-primary focus:outline-none font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Unit (e.g. 1 Kg)</label>
              <input type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-mandi-primary focus:outline-none font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Stock Qty (Optional)</label>
              <input type="number" placeholder="e.g. 120" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value ? Number(e.target.value) : ''})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-mandi-primary focus:outline-none font-medium" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Category</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-mandi-primary focus:outline-none font-medium">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Product Image (Upload or URL)</label>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {formData.image && <img src={formData.image} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0" />}
              <div className="flex-1 w-full space-y-2">
                <input type="file" accept="image/png, image/jpeg" onChange={handleImageUpload} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
                <p className="text-xs font-bold text-center text-slate-400">OR</p>
                <input type="text" placeholder="Paste Image URL" value={formData.image?.startsWith('data:') ? '' : formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-mandi-primary focus:outline-none" />
              </div>
            </div>
          </div>

          <button 
            onClick={async () => {
              setIsSaving(true);
              await onSave(formData);
              setIsSaving(false);
            }}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg mt-4 active:scale-[0.98]"
            disabled={!formData.name || !formData.price || !formData.image || isSaving}
          >
            {isSaving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
