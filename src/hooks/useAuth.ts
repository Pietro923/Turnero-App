// hooks/useAuth.tsx
"use client"
import React, { useState, useEffect, createContext, useContext } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { UserProfile, getCurrentUser, signIn, signOut } from '@/lib/auth-functions'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  clearAuthCache: () => void 
  isOwner: boolean
  isEmployee: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const getInitialSession = async () => {
  try {
    console.log('🔍 Verificando sesión inicial...');
    
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Error obteniendo sesión:', error);
      return;
    }
    
    if (session?.user) {
      console.log('✅ Sesión encontrada para:', session.user.email);
      setUser(session.user)
      setSession(session)
      
      const userData = await getCurrentUser()
      if (userData?.profile) {
        console.log('✅ Perfil cargado:', userData.profile.role);
        setProfile(userData.profile)
      } else {
        console.log('⚠️ No se encontró perfil para el usuario');
        setProfile(null)
      }
    } else {
      console.log('ℹ️ No hay sesión activa');
      setUser(null)
      setSession(null)
      setProfile(null)
    }
  } catch (error) {
    console.error('❌ Error getting initial session:', error)
    setUser(null)
    setSession(null)
    setProfile(null)
  } finally {
    setLoading(false)
  }
}

 useEffect(() => {
  // Obtener sesión inicial
  getInitialSession()

  // Escuchar cambios de autenticación
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email)
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log('👋 Usuario desconectado');
        setUser(null)
        setSession(null)
        setProfile(null)
        setLoading(false)
        return
      }
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('👤 Usuario conectado/token renovado');
        setUser(session.user)
        setSession(session)
        
        try {
          const userData = await getCurrentUser()
          setProfile(userData?.profile || null)
        } catch (error) {
          console.error('❌ Error cargando perfil:', error);
          setProfile(null)
        }
      }
      
      setLoading(false)
    }
  )

  return () => subscription.unsubscribe()
}, [])

  const handleSignIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const result = await signIn(email, password)
      
      setUser(result.user)
      setSession(result.session)
      setProfile(result.profile)
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 2. AGREGAR función para limpiar caché:
const clearAuthCache = () => {
  console.log('🗑️ Limpiando caché de autenticación...');
  setUser(null);
  setSession(null);
  setProfile(null);
  setLoading(false);
  
  // Limpiar localStorage de Supabase
  localStorage.removeItem('supabase.auth.token');
  
  // Forzar refresh de la página
  window.location.reload();
};

  const handleSignOut = async () => {
  try {
    setLoading(true);
    console.log('🚪 Cerrando sesión...');
    
    await signOut();
    
    // Limpiar estado inmediatamente
    setUser(null);
    setSession(null);
    setProfile(null);
    
    console.log('✅ Sesión cerrada exitosamente');
  } catch (error) {
    console.error('❌ Error signing out:', error);
    // Si falla el signOut, limpiar manualmente
    clearAuthCache();
  } finally {
    setLoading(false);
  }
};

  const value: AuthContextType = {
  user,
  profile,
  session,
  loading,
  signIn: handleSignIn,
  signOut: handleSignOut,
  clearAuthCache, 
  isOwner: profile?.role === 'owner' && profile?.active === true,
  isEmployee: profile?.role === 'employee' && profile?.active === true
}


  return React.createElement(
    AuthContext.Provider,
    { value: value },
    children
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}