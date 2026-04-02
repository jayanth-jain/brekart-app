'use client'

import { useState } from 'react'
import { uploadToSupabase } from '@/lib/action'
import { Upload, CheckCircle2, Loader2, PlusCircle, FileIcon } from 'lucide-react'

export default function PartUploadForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()
  const formData = new FormData(e.currentTarget)
  const file = formData.get('image') as File

  // 1. ADD THIS SIZE CHECK
  if (file && file.size > 4.5 * 1024 * 1024) {
    alert("Image is too large! Please use an image smaller than 4.5MB.")
    return
  }

  setLoading(true)
  setMessage('')
    
    try {
      const result = await uploadToSupabase(formData)
      if (result.success) {
        setMessage('Part added successfully!')
        setFileName(null)
        ;(e.target as HTMLFormElement).reset()
      }
    } catch (err) {
      console.error(err)
      setMessage('Error uploading part. Check console.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name & SKU Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Part Name</label>
          <input name="name" required className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-all" placeholder="e.g. LG Thermostat" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">SKU Number</label>
          <input name="sku" required className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-all" placeholder="e.g. REF-102" />
        </div>
      </div>

      {/* Category Selection */}
      <div className="text-left">
        <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
        <select 
          name="category" 
          required
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 appearance-none cursor-pointer"
        >
          <option value="Refrigeration">Refrigeration</option>
          <option value="Electronics">Electronics</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Description */}
      <div className="text-left">
        <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
        <textarea name="description" rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 resize-none" placeholder="Details about compatibility..." />
      </div>

      {/* Image Upload Area */}
      <div className="text-left">
        <label className="block text-sm font-medium text-slate-400 mb-2">Part Image</label>
        <div className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${fileName ? 'border-blue-500 bg-blue-500/5' : 'border-slate-700 hover:border-slate-500'}`}>
          <input 
            type="file" 
            name="image" 
            accept="image/*" 
            required 
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
          />
          {fileName ? (
            <>
              <FileIcon className="text-blue-500 mb-2" />
              <span className="text-blue-400 text-sm font-medium">{fileName}</span>
              <span className="text-slate-500 text-xs mt-1">(Click to change)</span>
            </>
          ) : (
            <>
              <Upload className="text-slate-500 mb-2" />
              <span className="text-slate-400 text-sm">Select Part Image</span>
            </>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        disabled={loading} 
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        {loading ? <Loader2 className="animate-spin" /> : <PlusCircle size={20} />}
        {loading ? 'Adding to Inventory...' : 'Add Spare Part'}
      </button>

      {/* Success Message */}
      {message && (
        <div className={`p-4 border rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${message.includes('Error') ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-blue-900/20 border-blue-800 text-blue-400'}`}>
          {message.includes('Error') ? null : <CheckCircle2 size={18} />} 
          {message}
        </div>
      )}
    </form>
  )
}