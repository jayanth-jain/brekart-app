'use server'

import { supabase } from './supabase'
import { revalidatePath } from 'next/cache'

export async function uploadToSupabase(formData: FormData) {
  const name = formData.get('name') as string
  const sku = formData.get('sku') as string
  const category = formData.get('category') as string
  const description = formData.get('description') as string
  const file = formData.get('image') as File

  if (!file) throw new Error("Image required")

  // 1. DYNAMIC FOLDER LOGIC
  // This ensures 'Electronics' goes to 'electronics/', 'Refrigeration' to 'refrigeration/'
  // and everything else (or empty) goes to 'other/'
  const folder = (category && category !== 'All') 
    ? category.toLowerCase().replace(/\s+/g, '-') 
    : 'other'

  const filePath = `${folder}/${Date.now()}-${file.name}`

  // 2. Upload Image to Storage using the filePath
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('products') 
    .upload(filePath, file)

  if (uploadError) throw uploadError

  // 3. Get Public URL for the specific filePath
  const { data: { publicUrl } } = supabase.storage
    .from('products')
    .getPublicUrl(filePath)

  // 4. Save to Database Table
  const { error: dbError } = await supabase
    .from('products')
    .insert([{ 
      name, 
      sku, 
      category, 
      description, 
      image_url: publicUrl 
    }])

  if (dbError) throw dbError

  revalidatePath('/')
  return { success: true }
}