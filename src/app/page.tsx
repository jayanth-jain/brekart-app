'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Package, ShoppingCart, MessageCircle, Plus, X, ListFilter } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [products, setProducts] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  // Stores what the user types in the box before clicking add
  const [inputQuantities, setInputQuantities] = useState<{[key: string]: string}>({})

  const categories = ['All', 'Refrigeration', 'Electronics', 'Other']

  useEffect(() => {
    const fetchProducts = async () => {
      let query = supabase.from('products').select('*')
      if (searchTerm) query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`)
      if (selectedCategory !== 'All') query = query.eq('category', selectedCategory)
      const { data } = await query.limit(50)
      if (data) setProducts(data)
    }
    fetchProducts()
  }, [searchTerm, selectedCategory])

  const addToCart = (product: any) => {
    const qty = parseInt(inputQuantities[product.id] || '1')
    if (isNaN(qty) || qty <= 0) return

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + qty } : item)
      }
      return [...prev, { ...product, qty }]
    })
    
    // Clear the input after adding
    setInputQuantities(prev => ({ ...prev, [product.id]: '' }))
  }

  const sendWhatsApp = () => {
    const phoneNumber = "91YOURNUMBER" // Replace with your number
    const cartText = cart.map(i => `• ${i.name} (SKU: ${i.sku}) — Qty: ${i.qty}`).join('%0A')
    const message = `Hi BREKART, I'd like to order:%0A%0A${cartText}`
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans">
      {/* Header */}
      <header className="p-4 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-[#0f172a]/90 backdrop-blur-md z-50">
        <h1 className="text-xl font-black text-blue-500 tracking-tighter italic">BREKART</h1>
        <button onClick={() => setIsCartOpen(true)} className="relative p-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
          <ShoppingCart size={22} className="text-blue-400" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {cart.reduce((sum, item) => sum + item.qty, 0)}
            </span>
          )}
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        {/* Search & Filters */}
        <div className="my-8 space-y-6">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search spare parts..." 
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 hover:border-blue-500/50 transition-all group">
              <div className="aspect-square bg-slate-950 rounded-2xl mb-4 overflow-hidden flex items-center justify-center">
                <img src={product.image_url} alt={product.name} className="max-h-full max-w-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <p className="text-blue-500 text-[10px] font-bold uppercase tracking-widest mb-1">{product.category}</p>
              <h3 className="font-bold text-lg mb-4 line-clamp-1">{product.name}</h3>
              
              {/* NEW: Quantity Input + Add Side-by-Side */}
              <div className="flex gap-2">
                <input 
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={inputQuantities[product.id] || ''}
                  onChange={(e) => setInputQuantities(prev => ({ ...prev, [product.id]: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-center text-sm outline-none focus:border-blue-500"
                />
                <button 
                  onClick={() => addToCart(product)}
                  className="bg-blue-600 hover:bg-blue-700 p-3 rounded-xl transition-all active:scale-90"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Slide-out Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-950/80 z-[60] backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-slate-900 h-full p-6 shadow-2xl flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black italic">CART</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-800 rounded-full"><X /></button>
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600">
                  <ShoppingCart size={48} className="mb-4 opacity-20" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                    <img src={item.image_url} className="w-16 h-16 object-contain bg-white/5 rounded-lg" />
                    <div className="flex-grow">
                      <p className="font-bold text-sm leading-tight">{item.name}</p>
                      <p className="text-blue-500 font-mono text-xs mt-1">QTY: {item.qty}</p>
                    </div>
                    <button onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))} className="text-slate-600 hover:text-red-500">
                      <X size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-6 border-t border-slate-800 space-y-3">
                <button 
                  onClick={sendWhatsApp}
                  className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20"
                >
                  <MessageCircle size={20} /> Checkout to WhatsApp
                </button>
                <p className="text-[10px] text-center text-slate-500 px-4">
                  After clicking, your order list will be sent to our WhatsApp for final confirmation.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}