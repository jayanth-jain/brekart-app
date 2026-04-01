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

  // 1. Upload Image to Storage (Changed 'part-images' to 'products')
  const fileName = `${Date.now()}-${file.name}`
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('products') 
    .upload(fileName, file)

  if (uploadError) throw uploadError

  // 2. Get Public URL (Changed 'part-images' to 'products')
  const { data: { publicUrl } } = supabase.storage
    .from('products')
    .getPublicUrl(fileName)

  // 3. Save to Database Table
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

  // Refresh the home page to show the new part
  revalidatePath('/')
  return { success: true }
}