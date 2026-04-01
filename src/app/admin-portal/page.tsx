'use client'

import PartUploadForm from '@/components/PartUploadForm'
import Link from 'next/link'
import { ArrowLeft, LayoutDashboard } from 'lucide-react'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white mb-8">
          <ArrowLeft size={20} /> Back to Showcase
        </Link>
        
        <div className="flex items-center gap-3 mb-10">
          <LayoutDashboard className="text-blue-500" size={32} />
          <h1 className="text-3xl font-bold">BREKART Admin Portal</h1>
        </div>
        
        <div className="bg-[#1e293b] p-8 rounded-2xl border border-slate-800 shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-blue-400">Add New Inventory Item</h2>
          <PartUploadForm />
        </div>
      </div>
    </div>
  )
}