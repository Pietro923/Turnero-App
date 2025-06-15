// MEJORAR AdminPanel - admin/page.tsx:

"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import AdminPanel from '@/components/AdminPanel'
import { Loader2 } from 'lucide-react'

export default function AdminPage() {
  const { user, profile, loading, clearAuthCache } = useAuth()
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    if (!loading) {
      console.log('🔍 Verificando acceso al admin...', { user: !!user, profile: profile?.role, active: profile?.active });
      
      if (!user || !profile?.active) {
        console.log('❌ Acceso denegado, redirigiendo...');
        router.push('/')
      } else {
        console.log('✅ Acceso autorizado al admin');
        setAuthChecked(true)
      }
    }
  }, [user, profile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Si hay problemas de autenticación, mostrar botón de reset
  if (!loading && !user && !authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-600">Problema de autenticación</p>
          <button
            onClick={clearAuthCache}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Reiniciar sesión
          </button>
        </div>
      </div>
    )
  }

  if (!user || !profile?.active || !authChecked) {
    return null
  }

  return <AdminPanel />
}