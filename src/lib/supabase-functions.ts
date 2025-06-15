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

export async function createBarber(barber: {
  name: string
  emoji: string
  specialty?: string
}) {
  const { data, error } = await supabase
    .from('barbers')
    .insert([barber])
    .select('*')
    .single()
  
  if (error) throw error
  return data as Barber
}

export async function updateBarber(id: number, updates: Partial<Barber>) {
  const { data, error } = await supabase
    .from('barbers')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()
  
  if (error) throw error
  return data as Barber
}

export async function deleteBarber(id: number) {
  const { data, error } = await supabase
    .from('barbers')
    .update({ active: false })
    .eq('id', id)
    .select('*')
    .single()
  
  if (error) throw error
  return data as Barber
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

export async function createService(service: {
  name: string
  duration: number
  price: number
}) {
  const { data, error } = await supabase
    .from('services')
    .insert([service])
    .select('*')
    .single()
  
  if (error) throw error
  return data as Service
}

export async function updateService(id: number, updates: Partial<Service>) {
  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()
  
  if (error) throw error
  return data as Service
}

export async function deleteService(id: number) {
  const { data, error } = await supabase
    .from('services')
    .update({ active: false })
    .eq('id', id)
    .select('*')
    .single()
  
  if (error) throw error
  return data as Service
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
    .select(`
      *,
      barber:barbers(*),
      service:services(*)
    `)
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
  notes?: string,
  cancelReason?: string // NUEVO: para motivos de cancelación
) {
  const updates: any = { status }
  
  if (paymentStatus) updates.payment_status = paymentStatus
  if (paymentMethod) updates.payment_method = paymentMethod
  if (notes !== undefined) updates.notes = notes
  
  // Si es una cancelación y se proporciona motivo
  if (status === 'cancelled' && cancelReason) {
    updates.notes = cancelReason
  }
  
  // Si es no_show y se proporciona motivo
  if (status === 'no_show' && cancelReason) {
    updates.notes = cancelReason
  }

  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', appointmentId)
    .select(`
      *,
      barber:barbers(*),
      service:services(*)
    `)
    .single()

  if (error) throw error
  return data as Appointment
}

export async function cancelAppointment(appointmentId: number, reason?: string) {
  return updateAppointmentStatus(appointmentId, 'cancelled', undefined, undefined, undefined, reason)
}

// ===============================
// FUNCIONES DE CAJA
// ===============================

export async function createCashTransaction(transaction: {
  amount: number
  concept: string
  method: 'cash' | 'transfer'
  type: 'income' | 'expense'
}) {
  const { data, error } = await supabase
    .from('cash_transactions')
    .insert([{
      ...transaction,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    }])
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function getCashTransactions(filters?: {
  dateFrom?: string
  dateTo?: string
  type?: 'income' | 'expense'
  method?: 'cash' | 'transfer'
}) {
  let query = supabase
    .from('cash_transactions')
    .select('*')

  if (filters?.dateFrom) {
    query = query.gte('date', filters.dateFrom)
  }
  
  if (filters?.dateTo) {
    query = query.lte('date', filters.dateTo)
  }
  
  if (filters?.type) {
    query = query.eq('type', filters.type)
  }
  
  if (filters?.method) {
    query = query.eq('method', filters.method)
  }

  query = query.order('date', { ascending: false }).order('created_at', { ascending: false })

  const { data, error } = await query
  
  if (error) throw error
  return data
}

// ===============================
// FUNCIONES DE ESTADÍSTICAS
// ===============================

export async function getAppointmentStats(dateFrom?: string, dateTo?: string) {
  let query = supabase
    .from('appointments')
    .select(`
      status, 
      payment_status, 
      service:services(price)
    `)

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

export async function getCashStats(dateFrom?: string, dateTo?: string) {
  let query = supabase
    .from('cash_transactions')
    .select('type, method, amount')

  if (dateFrom) query = query.gte('date', dateFrom)
  if (dateTo) query = query.lte('date', dateTo)

  const { data, error } = await query

  if (error) throw error

  const stats = {
    total_income: data
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
    total_expense: data
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
    cash_income: data
      .filter(t => t.type === 'income' && t.method === 'cash')
      .reduce((sum, t) => sum + t.amount, 0),
    transfer_income: data
      .filter(t => t.type === 'income' && t.method === 'transfer')
      .reduce((sum, t) => sum + t.amount, 0),
    cash_expense: data
      .filter(t => t.type === 'expense' && t.method === 'cash')
      .reduce((sum, t) => sum + t.amount, 0),
    transfer_expense: data
      .filter(t => t.type === 'expense' && t.method === 'transfer')
      .reduce((sum, t) => sum + t.amount, 0)
  }

  return {
    ...stats,
    net_result: stats.total_income - stats.total_expense
  }
}

// ===============================
// FUNCIONES COMBINADAS
// ===============================

export async function getDashboardStats(dateFrom?: string, dateTo?: string) {
  try {
    const [appointmentStats, cashStats] = await Promise.all([
      getAppointmentStats(dateFrom, dateTo),
      getCashStats(dateFrom, dateTo)
    ])

    return {
      appointments: appointmentStats,
      cash: cashStats,
      total_revenue: appointmentStats.revenue + cashStats.total_income,
      total_expense: cashStats.total_expense,
      net_profit: (appointmentStats.revenue + cashStats.total_income) - cashStats.total_expense
    }
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    throw error
  }
}

// ===============================
// FUNCIONES PARA GESTIÓN DE PELUQUEROS
// ===============================

export async function getBarbersWithServices() {
  const { data, error } = await supabase
    .from('barbers')
    .select(`
      *,
      barber_services (
        id,
        custom_price,
        active,
        service:services (
          id,
          name,
          duration,
          price
        )
      )
    `)
    .eq('active', true)
    .order('name')

  if (error) throw error
  return data
}

export async function getServicesByBarber(barberId: number) {
  const { data, error } = await supabase
    .from('barber_services')
    .select(`
      id,
      custom_price,
      active,
      service:services (
        id,
        name,
        duration,
        price
      )
    `)
    .eq('barber_id', barberId)
    .eq('active', true)

  if (error) throw error
  return data
}

export async function assignServiceToBarber(barberId: number, serviceId: number, customPrice?: number) {
  const { data, error } = await supabase
    .from('barber_services')
    .upsert([{
      barber_id: barberId,
      service_id: serviceId,
      custom_price: customPrice || null,
      active: true
    }])
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function removeServiceFromBarber(barberId: number, serviceId: number) {
  const { data, error } = await supabase
    .from('barber_services')
    .update({ active: false })
    .eq('barber_id', barberId)
    .eq('service_id', serviceId)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function updateBarberServicePrice(barberId: number, serviceId: number, customPrice: number | null) {
  const { data, error } = await supabase
    .from('barber_services')
    .update({ custom_price: customPrice })
    .eq('barber_id', barberId)
    .eq('service_id', serviceId)
    .select('*')
    .single()

  if (error) throw error
  return data
}

// Función para obtener servicios disponibles para asignar a un peluquero
export async function getAvailableServicesForBarber(barberId: number) {
  try {
    // 1. Obtener todos los servicios activos
    const { data: allServices, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('name')

    if (servicesError) throw servicesError

    // 2. Obtener servicios ya asignados a este peluquero
    const { data: assignedServices, error: assignedError } = await supabase
      .from('barber_services')
      .select('service_id')
      .eq('barber_id', barberId)
      .eq('active', true)

    if (assignedError) throw assignedError

    // 3. Filtrar servicios no asignados
    const assignedServiceIds = assignedServices.map(bs => bs.service_id)
    const availableServices = allServices.filter(service => 
      !assignedServiceIds.includes(service.id)
    )

    return availableServices

  } catch (error) {
    console.error('Error in getAvailableServicesForBarber:', error)
    throw error
  }
}