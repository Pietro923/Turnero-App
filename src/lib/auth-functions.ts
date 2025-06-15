// lib/auth-functions.ts
import { supabase } from './supabase'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: 'owner' | 'employee'
  tenant_id: string | null
  active: boolean
  created_at: string
  updated_at: string
}

// ===============================
// FUNCIONES DE AUTENTICACIÓN
// ===============================

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  // Obtener perfil del usuario
  const profile = await getUserProfile(data.user.id)
  
  return {
    user: data.user,
    session: data.session,
    profile
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const profile = await getUserProfile(user.id)
  
  return {
    user,
    profile
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .eq('active', true)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

// ===============================
// FUNCIONES PARA GESTIÓN DE USUARIOS (solo owner)
// ===============================

export async function createEmployee(email: string, password: string, fullName: string) {
  // Solo owners pueden crear empleados
  const currentUser = await getCurrentUser()
  if (!currentUser?.profile || currentUser.profile.role !== 'owner') {
    throw new Error('No tienes permisos para crear usuarios')
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: {
      full_name: fullName
    },
    email_confirm: true
  })

  if (error) throw error

  // El trigger automáticamente creará el perfil, pero actualizamos el rol
  await supabase
    .from('user_profiles')
    .update({ 
      role: 'employee',
      full_name: fullName 
    })
    .eq('id', data.user.id)

  return data.user
}

export async function getAllUsers() {
  // Solo owners pueden ver todos los usuarios
  const currentUser = await getCurrentUser()
  if (!currentUser?.profile || currentUser.profile.role !== 'owner') {
    throw new Error('No tienes permisos para ver usuarios')
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function updateUserRole(userId: string, role: 'owner' | 'employee') {
  // Solo owners pueden cambiar roles
  const currentUser = await getCurrentUser()
  if (!currentUser?.profile || currentUser.profile.role !== 'owner') {
    throw new Error('No tienes permisos para cambiar roles')
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deactivateUser(userId: string) {
  // Solo owners pueden desactivar usuarios
  const currentUser = await getCurrentUser()
  if (!currentUser?.profile || currentUser.profile.role !== 'owner') {
    throw new Error('No tienes permisos para desactivar usuarios')
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ===============================
// HOOKS Y UTILIDADES
// ===============================

export function isOwner(profile: UserProfile | null): boolean {
  return profile?.role === 'owner' && profile?.active === true
}

export function isEmployee(profile: UserProfile | null): boolean {
  return profile?.role === 'employee' && profile?.active === true
}

export function canAccessBarberManagement(profile: UserProfile | null): boolean {
  return isOwner(profile)
}

export function canAccessTurnos(profile: UserProfile | null): boolean {
  return profile?.active === true // Tanto owner como employee
}