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

    // 1. CLEAN THE FOLDER NAME
    // This part is likely where it was failing. 
    // We ensure it's lowercase and has no spaces.
    let folder = 'other' // Default
    if (category && category.trim() !== '' && category !== 'All') {
      folder = category.toLowerCase().trim().replace(/\s+/g, '-')
    }

    // 2. CLEAN THE FILENAME
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
    const filePath = `${folder}/${Date.now()}-${safeFileName}`

    // 3. UPLOAD TO SUPABASE
    const { error: uploadError } = await supabase.storage
      .from('products') 
      .upload(filePath, file)

    if (uploadError) throw new Error(`Storage: ${uploadError.message}`)

    // 4. GET PUBLIC URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath)

    // 5. SAVE TO DATABASE
    const { error: dbError } = await supabase
      .from('products')
      .insert([{ 
        name, 
        sku, 
        category: category || 'Other', // Ensure DB gets a string
        description, 
        image_url: publicUrl 
      }])

    if (dbError) throw new Error(`Database: ${dbError.message}`)

    revalidatePath('/')
    return { success: true }

  } catch (error: any) {
    console.error('SERVER_ERROR:', error.message)
    throw new Error(error.message || "Failed to upload")
  }
}