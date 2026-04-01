'use client'

import { useState } from 'react'
import { uploadToSupabase } from '@/lib/action'
import { Upload, CheckCircle2, Loader2, PlusCircle } from 'lucide-react'

export default function PartUploadForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      await uploadToSupabase(formData)
      setMessage('Part added successfully!')
      ;(e.target as HTMLFormElement).reset()
    } catch (err) {
      console.error(err)
      setMessage('Error uploading part. Check console.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Part Name</label>
          <input name="name" required className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-blue-500" placeholder="e.g. LG Thermostat" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">SKU Number</label>
          <input name="sku" required className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-blue-500" placeholder="e.g. REF-102" />
        </div>
      </div>

      <div className="text-left">
        <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
        <select name="category" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-blue-500">
          <option value="Refrigeration">Refrigeration</option>
          <option value="Electronics">Electronics</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="text-left">
        <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
        <textarea name="description" rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-blue-500" placeholder="Details about compatibility..." />
      </div>

      <div className="text-left">
        <label className="block text-sm font-medium text-slate-400 mb-2">Part Image</label>
        <div className="relative border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center hover:border-blue-500 transition-colors cursor-pointer">
          <input type="file" name="image" accept="image/*" required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          <Upload className="text-slate-500 mb-2" />
          <span className="text-slate-400 text-sm">Select Part Image</span>
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
        {loading ? <Loader2 className="animate-spin" /> : <PlusCircle size={20} />}
        {loading ? 'Adding to Inventory...' : 'Add Spare Part'}
      </button>

      {message && (
        <div className="p-4 bg-blue-900/20 border border-blue-800 text-blue-400 rounded-xl flex items-center gap-2">
          <CheckCircle2 size={18} /> {message}
        </div>
      )}
    </form>
  )
}