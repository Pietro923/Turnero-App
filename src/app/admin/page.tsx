// REEMPLAZAR completamente el archivo admin/page.tsx:

"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import AdminPanel from '@/components/AdminPanel'
import { Loader2 } from 'lucide-react'

export default function AdminPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [redirectTimer, setRedirectTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Limpiar timer anterior si existe
    if (redirectTimer) {
      clearTimeout(redirectTimer)
      setRedirectTimer(null)
    }

    if (loading) {
      // Mientras está cargando, no hacer nada
      return
    }

    if (!user || !profile?.active) {
      console.log('❌ Usuario no autenticado, esperando antes de redirigir...');
      
      // Esperar 2 segundos antes de redirigir para evitar falsos positivos en recargas
      const timer = setTimeout(() => {
        console.log('❌ Tiempo agotado, redirigiendo a home');
        router.push('/');
      }, 2000);
      
      setRedirectTimer(timer);
    } else {
      console.log('✅ Acceso autorizado al admin');
    }

    // Cleanup
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer)
      }
    }
  }, [user, profile, loading, router])

  // Mostrar loading mientras se verifica
  if (loading || (!user && !redirectTimer)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Si definitivamente no hay usuario después del timer
  if (!user || !profile?.active) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-600">Acceso denegado</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  // Usuario autenticado correctamente
  return <AdminPanel />
}