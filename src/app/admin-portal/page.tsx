'use client'

import { useEffect, useState } from 'react'
import PartUploadForm from '@/components/PartUploadForm'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, LayoutDashboard, Trash2, Package, Loader2 } from 'lucide-react'

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 1. Fetch current inventory
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

  // 2. Delete function
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will permanently remove the item from the website.")) return
    
    const { error } = await supabase.from('products').delete().eq('id', id)
    
    if (error) {
      alert("Error: " + error.message)
    } else {
      setProducts(prev => prev.filter(p => p.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} /> Back to Showcase
        </Link>
        
        <div className="flex items-center gap-3 mb-10">
          <LayoutDashboard className="text-blue-500" size={32} />
          <h1 className="text-3xl font-bold">BREKART Admin Portal</h1>
        </div>
        
        {/* Section 1: Upload Form */}
        <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-800 shadow-2xl mb-12">
          <h2 className="text-xl font-semibold mb-6 text-blue-400 flex items-center gap-2">
            <Package size={20} /> Add New Inventory Item
          </h2>
          <PartUploadForm />
        </div>

        {/* Section 2: Manage Inventory */}
        <div className="bg-[#1e293b]/50 p-8 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-200">Live Inventory Manager</h2>
            <button 
              onClick={fetchInventory} 
              className="text-xs bg-slate-800 px-3 py-1 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Refresh List
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-4">
              {products.length === 0 ? (
                <p className="text-center text-slate-500 py-10">No items in inventory.</p>
              ) : (
                products.map(product => (
                  <div key={product.id} className="flex items-center justify-between bg-slate-900/80 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-xl overflow-hidden flex items-center justify-center p-1">
                        <img src={product.image_url} alt="" className="max-h-full max-w-full object-contain" />
                      </div>
                      <div>
                        <p className="font-bold text-sm leading-tight">{product.name}</p>
                        <p className="text-[10px] text-blue-500 font-mono mt-0.5">{product.sku} • {product.category}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      title="Delete Product"
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