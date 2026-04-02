'use client'

import { useEffect, useState } from 'react'
import PartUploadForm from '@/components/PartUploadForm'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, LayoutDashboard, Trash2, Package, Loader2, Search, X } from 'lucide-react'

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adminSearch, setAdminSearch] = useState('') // Search state for the manager

  const fetchInventory = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setProducts(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will permanently remove the item from the website.")) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      alert("Error: " + error.message)
    } else {
      setProducts(prev => prev.filter(p => p.id !== id))
    }
  }

  // Filter the list based on admin search input
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(adminSearch.toLowerCase()) || 
    p.sku.toLowerCase().includes(adminSearch.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} /> Back to Showcase
        </Link>
        
        <div className="flex items-center gap-3 mb-10">
          <LayoutDashboard className="text-blue-500" size={32} />
          <h1 className="text-3xl font-bold italic tracking-tighter">BREKART ADMIN</h1>
        </div>
        
        {/* Section 1: Upload Form */}
        <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-800 shadow-2xl mb-12">
          <h2 className="text-xl font-semibold mb-6 text-blue-400 flex items-center gap-2">
            <Package size={20} /> Add New Inventory Item
          </h2>
          <PartUploadForm />
        </div>

        {/* Section 2: Manage Inventory with Search */}
        <div className="bg-[#1e293b]/50 p-8 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h2 className="text-xl font-semibold text-slate-200">Inventory Manager</h2>
            
            {/* Search Bar for Manager */}
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text"
                placeholder="Find item to delete (Name or SKU)..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 transition-all"
              />
              {adminSearch && (
                <button onClick={() => setAdminSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>
            
            <button onClick={fetchInventory} className="text-xs bg-slate-800 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors">
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.length === 0 ? (
                <p className="text-center text-slate-500 py-10">No items match your search.</p>
              ) : (
                filteredProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between bg-slate-900/80 p-4 rounded-2xl border border-slate-800 hover:border-red-500/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-xl overflow-hidden flex items-center justify-center p-1">
                        <img src={product.image_url} alt="" className="max-h-full max-w-full object-contain" />
                      </div>
                      <div>
                        <p className="font-bold text-sm leading-tight group-hover:text-blue-400 transition-colors">{product.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider">
                          SKU: <span className="text-slate-300">{product.sku}</span> • {product.category}
                        </p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-3 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}