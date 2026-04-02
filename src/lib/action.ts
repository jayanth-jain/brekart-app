'use server'

import { supabase } from './supabase'
import { revalidatePath } from 'next/cache'

export async function uploadToSupabase(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const sku = formData.get('sku') as string
    const category = formData.get('category') as string
    const description = formData.get('description') as string
    const file = formData.get('image') as File

    if (!file || file.size === 0) {
      throw new Error("A valid image file is required.")
    }

    // 1. SANITIZE FILENAME & FOLDER
    // Remove special characters from filename that break URLs
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
    
    const folder = (category && category !== 'All') 
      ? category.toLowerCase().replace(/\s+/g, '-') 
      : 'other'

    const filePath = `${folder}/${Date.now()}-${safeFileName}`

    // 2. UPLOAD TO SUPABASE STORAGE
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('products') 
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Storage Error:', uploadError.message)
      throw new Error(`Storage Error: ${uploadError.message}`)
    }

    // 3. GET PUBLIC URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath)

    // 4. SAVE TO DATABASE TABLE
    const { error: dbError } = await supabase
      .from('products')
      .insert([{ 
        name, 
        sku, 
        category, 
        description, 
        image_url: publicUrl 
      }])

    if (dbError) {
      console.error('Database Error:', dbError.message)
      throw new Error(`Database Error: ${dbError.message}`)
    }

    revalidatePath('/')
    return { success: true }

  } catch (error: any) {
    console.error('Server Action Error:', error.message)
    // Throwing the error here allows the 'catch' block in your 
    // PartUploadForm to display the message
    throw new Error(error.message || "Failed to upload part")
  }
}