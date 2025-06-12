// lib/supabase-functions.ts
import { supabase } from './supabase'
import type { Barber, Service, Appointment } from './supabase'

// ===============================
// FUNCIONES PARA PELUQUEROS
// ===============================

export async function getBarbers() {
  const { data, error } = await supabase
    .from('barbers')
    .select('*')
    .eq('active', true)
    .order('name')

  if (error) throw error
  return data as Barber[]
}

// ===============================
// FUNCIONES PARA SERVICIOS
// ===============================

export async function getServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('name')

  if (error) throw error
  return data as Service[]
}

// ===============================
// FUNCIONES PARA TURNOS
// ===============================

export async function createAppointment(appointment: {
  barber_id: number
  service_id: number
  date: string
  time: string
  customer_name: string
  customer_phone: string
  customer_email?: string
}) {
  const { data, error } = await supabase
    .from('appointments')
    .insert([{
      ...appointment,
      status: 'confirmed'
    }])
    .select('*')
    .single()

  if (error) throw error
  return data as Appointment
}

export async function getAppointmentsByDate(date: string, barberId?: number) {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      barber:barbers(*),
      service:services(*)
    `)
    .eq('date', date)
    .in('status', ['confirmed', 'pending'])

  if (barberId) {
    query = query.eq('barber_id', barberId)
  }

  const { data, error } = await query.order('time')
  
  if (error) throw error
  return data as Appointment[]
}

export async function getBookedTimes(date: string, barberId: number) {
  const { data, error } = await supabase
    .from('appointments')
    .select('time')
    .eq('date', date)
    .eq('barber_id', barberId)
    .in('status', ['confirmed', 'pending'])

  if (error) throw error
  return data.map(appointment => appointment.time)
}

// ===============================
// FUNCIONES PARA ADMIN
// ===============================

export async function getAllAppointments(filters?: {
  date?: string
  status?: string
  barberId?: number
  limit?: number
}) {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      barber:barbers(*),
      service:services(*)
    `)

  if (filters?.date) {
    query = query.eq('date', filters.date)
  }
  
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters?.barberId) {
    query = query.eq('barber_id', filters.barberId)
  }

  query = query
    .order('date', { ascending: false })
    .order('time', { ascending: true })

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query
  
  if (error) throw error
  return data as Appointment[]
}

export async function updateAppointmentStatus(
  appointmentId: number, 
  status: Appointment['status'],
  paymentStatus?: Appointment['payment_status'],
  paymentMethod?: Appointment['payment_method'],
  notes?: string
) {
  const updates: any = { status }
  
  if (paymentStatus) updates.payment_status = paymentStatus
  if (paymentMethod) updates.payment_method = paymentMethod
  if (notes !== undefined) updates.notes = notes

  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', appointmentId)
    .select('*')
    .single()

  if (error) throw error
  return data as Appointment
}

export async function cancelAppointment(appointmentId: number, reason?: string) {
  return updateAppointmentStatus(appointmentId, 'cancelled', undefined, undefined, reason)
}

// ===============================
// FUNCIONES DE ESTADÍSTICAS
// ===============================

export async function getAppointmentStats(dateFrom?: string, dateTo?: string) {
  let query = supabase
    .from('appointments')
    .select('status, payment_status, service:services(price)')

  if (dateFrom) query = query.gte('date', dateFrom)
  if (dateTo) query = query.lte('date', dateTo)

  const { data, error } = await query

  if (error) throw error

  const stats = {
    total: data.length,
    completed: data.filter(a => a.status === 'completed').length,
    pending: data.filter(a => a.status === 'pending' || a.status === 'confirmed').length,
    cancelled: data.filter(a => a.status === 'cancelled').length,
    no_show: data.filter(a => a.status === 'no_show').length,
    revenue: data
      .filter(a => a.status === 'completed' && a.payment_status === 'paid')
      .reduce((sum, a) => {
        const service = a.service as any
        return sum + (service?.price || 0)
      }, 0),
    pending_payments: data
      .filter(a => a.status === 'completed' && a.payment_status === 'pending')
      .reduce((sum, a) => {
        const service = a.service as any
        return sum + (service?.price || 0)
      }, 0)
  }

return stats
}