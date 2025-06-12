// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos TypeScript para nuestras tablas
export interface Barber {
  id: number
  name: string
  emoji: string
  specialty?: string
  active: boolean
  created_at: string
}

export interface Service {
  id: number
  name: string
  duration: number // en minutos
  price: number
  active: boolean
  created_at: string
}

export interface Appointment {
  id: number
  barber_id: number
  service_id: number
  date: string
  time: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  payment_status: 'pending' | 'paid'
  payment_method?: 'cash' | 'transfer'
  notes?: string
  created_at: string
  updated_at: string
  
  // Relaciones
  barber?: Barber
  service?: Service
}