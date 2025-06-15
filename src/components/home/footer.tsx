"use client"
import React, { useState } from 'react'
import Login from '@/app/login/Login'

const Footer = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = () => {
    console.log("Email:", email)
    console.log("Contraseña:", password)
    // Acá podrías llamar a Supabase o alguna API
  }

  const closeLogin = () => {
    
  }

  return (
    <footer className="mt-12 sm:mt-16 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Peluquería Elite</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Más de 25 años brindando servicios de peluquería de excelencia en San Miguel de Tucumán.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contacto</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>📍 Av. Belgrano 1234, Tucumán</p>
              <p>📞 +54 381 123-4567</p>
              <p>📱 WhatsApp disponible</p>
              <p>⏰ Lun-Sáb: 9:00-20:00</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Síguenos</h3>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2024 Peluquería Elite. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <Login/>
              <a href="#" className="hover:text-white transition-colors">Política de Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Términos de Servicio</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
