'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Package, ShoppingCart, MessageCircle, Filter } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [products, setProducts] = useState<any[]>([])
  const [cart, setCart] = useState<{product: any, quantity: number}[]>([])

  // Categories list
  const categories = ['All', 'Refrigeration', 'Electronics', 'Other']

  useEffect(() => {
    const fetchProducts = async () => {
      let query = supabase.from('products').select('*')
      
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`)
      }
      
      if (selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory)
      }

      const { data } = await query.limit(50)
      if (data) setProducts(data)
    }
    fetchProducts()
  }, [searchTerm, selectedCategory])

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const sendWhatsApp = () => {
    const phoneNumber = "YOUR_PHONE_NUMBER" 
    const cartDetails = cart.map(item => `• ${item.product.name} (SKU: ${item.product.sku}) x ${item.quantity}`).join('%0A')
    const message = `Hi BREKART, I want to order:%0A%0A${cartDetails}`
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <header className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-[#0f172a]/80 backdrop-blur-md z-20">
        <h1 className="text-2xl font-bold text-blue-500 flex items-center gap-2">
          <Package /> BREKART
        </h1>
        <div className="flex items-center gap-6">
            <Link href="/admin-portal" className="text-sm text-slate-400 hover:text-white">Admin</Link>
            <div className="relative">
                <ShoppingCart className="text-blue-400" />
                {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{cart.reduce((a,b) => a + b.quantity, 0)}</span>}
            </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="text-center mt-12 mb-8">
            <h2 className="text-4xl font-bold mb-4">Find Your Spare Part</h2>
            <div className="relative max-w-2xl mx-auto mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                  type="text" 
                  placeholder="Search by Name or SKU..." 
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2 rounded-full border transition-all text-sm font-medium ${
                    selectedCategory === cat 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 text-slate-500">No parts found in this category.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-[#1e293b] rounded-2xl p-4 border border-slate-800 flex flex-col group transition-all">
                <img src={product.image_url} alt={product.name} className="w-full h-48 object-contain mb-4 rounded-lg bg-slate-900" />
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-900/30 px-2 py-1 rounded">{product.category}</span>
                  <span className="text-[10px] text-slate-500 font-mono uppercase">SKU: {product.sku}</span>
                </div>
                <h3 className="text-xl font-bold mb-6 flex-grow">{product.name}</h3>
                <button 
                  onClick={() => addToCart(product)}
                  className="w-full bg-blue-600 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} /> Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating WhatsApp Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-8 right-8 z-30">
          <button 
            onClick={sendWhatsApp}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 font-bold text-lg border-2 border-green-500/50"
          >
            <MessageCircle /> Order on WhatsApp ({cart.length})
          </button>
        </div>
      )}
    </div>
  )
}
