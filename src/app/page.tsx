import BookingSystem from '@/components/BookingSystem'
import Footer from '@/components/home/footer'
import Header from '@/components/home/header'
import Informacion from '@/components/home/informacion'
import Politicas from '@/components/home/politicas'
import Resenas from '@/components/home/resenas'

// Componente principal con layout responsivo
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* En móvil: todo en una columna */}
        {/* En desktop: booking centrado arriba, info distribuida abajo */}
        <div className="space-y-6">
          
          {/* Sistema de reservas - siempre arriba */}
          <div className="flex justify-center">
            <div className="w-full max-w-md lg:max-w-2xl">
              <BookingSystem />
            </div>
          </div>
          
          {/* Información adicional - en desktop se distribuye horizontalmente */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Informacion />
            <Resenas />
            <Politicas />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}