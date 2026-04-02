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

    if (!file || file.size === 0) throw new Error("Image required")

    // 1. FOLDER LOGIC (Lowercased for Storage path)
    let folder = 'other'
    if (category && category.trim() !== '' && category !== 'All') {
      folder = category.toLowerCase().trim().replace(/\s+/g, '-')
    }

    // 2. FILENAME CLEANING
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
    const filePath = `${folder}/${Date.now()}-${safeFileName}`

    // 3. UPLOAD TO SUPABASE WITH CONTENT-TYPE
    // This ensures the browser knows it's an image (fixes the "not projecting" issue)
    const { error: uploadError } = await supabase.storage
      .from('products') 
      .upload(filePath, file, {
        contentType: file.type, // CRITICAL: Ensures the file is stored as an image
        upsert: false
      })

    if (uploadError) throw new Error(`Storage: ${uploadError.message}`)

    // 4. GET PUBLIC URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath)

    // 5. SAVE TO DATABASE (Matches case-sensitive filters)
    // We save as 'Other', 'Electronics', or 'Refrigeration' (Capitalized)
    const dbCategory = category && category !== '' ? category : 'Other'

    const { error: dbError } = await supabase
      .from('products')
      .insert([{ 
        name, 
        sku, 
        category: dbCategory, 
        description, 
        image_url: publicUrl 
      }])

    if (dbError) throw new Error(`Database: ${dbError.message}`)

    revalidatePath('/')
    return { success: true }

  } catch (error: any) {
    console.error('SERVER_ERROR:', error.message)
    // Throwing here allows the Admin Form to catch the specific error
    throw new Error(error.message || "Failed to upload")
  }
}