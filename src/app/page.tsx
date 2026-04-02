'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Package, ShoppingCart, MessageCircle, Plus, X } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [products, setProducts] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [inputQuantities, setInputQuantities] = useState<{[key: string]: string}>({})

  const categories = ['All', 'Refrigeration', 'Electronics', 'Other']

  useEffect(() => {
    const fetchProducts = async () => {
      // Added ordering so NEW parts show first
      let query = supabase.from('products').select('*').order('created_at', { ascending: false })
      
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`)
      }
      
      if (selectedCategory !== 'All') {
        // This handles both 'Other' and 'other' automatically
        query = query.ilike('category', selectedCategory)
      }

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
    
    setInputQuantities(prev => ({ ...prev, [product.id]: '' }))
  }

  const sendWhatsApp = () => {
    const phoneNumber = "916303044288" 
    const cartText = cart.map(i => `• ${i.name} (SKU: ${i.sku}) — Qty: ${i.qty}`).join('\n')
    const message = `Hi BREKART, I'd like to order:\n\n${cartText}`
    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans">
      <header className="p-4 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-[#0f172a]/90 backdrop-blur-md z-50">
        <h1 className="text-xl font-black text-blue-500 tracking-tighter italic">BREKART</h1>
        <button onClick={() => setIsCartOpen(true)} className="relative p-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
          <ShoppingCart size={22} className="text-blue-400" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
              {cart.reduce((sum, item) => sum + item.qty, 0)}
            </span>
          )}
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <div className="my-8 space-y-6 text-center">
          <h2 className="text-3xl font-bold">Genuine Spare Parts</h2>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by Name or SKU..." 
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-500'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length > 0 ? products.map(product => (
            <div key={product.id} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 hover:border-blue-500/50 transition-all group flex flex-col">
              <div className="aspect-square bg-slate-950 rounded-2xl mb-4 overflow-hidden flex items-center justify-center">
                <img src={product.image_url} alt={product.name} className="max-h-full max-w-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="flex-grow">
                <p className="text-blue-500 text-[10px] font-bold uppercase tracking-widest mb-1">{product.category}</p>
                <h3 className="font-bold text-lg mb-4 line-clamp-2">{product.name}</h3>
              </div>
              
              <div className="flex gap-2 mt-auto pt-4 border-t border-slate-800">
                <input 
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={inputQuantities[product.id] || ''}
                  onChange={(e) => setInputQuantities(prev => ({ ...prev, [product.id]: e.target.value }))}
                  className="w-20 bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-center text-sm outline-none focus:border-blue-500"
                />
                <button 
                  onClick={() => addToCart(product)}
                  className="flex-grow bg-blue-600 hover:bg-blue-700 p-3 rounded-xl transition-all flex justify-center items-center gap-2 font-bold"
                >
                  <Plus size={18} /> Add
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center text-slate-500">No parts found in this category.</div>
          )}
        </div>
      </main>

      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-950/80 z-[60] backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-slate-900 h-full p-6 shadow-2xl flex flex-col">
            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-black italic">YOUR CART</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X /></button>
            </div>
            
            <div className="