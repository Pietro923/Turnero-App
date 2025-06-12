"use client"
import React from 'react';
import { MapPin, Clock, Phone } from 'lucide-react';

// Componentes simplificados
const Informacion = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      <h3 className="font-semibold text-gray-900">Información</h3>
      
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium">Av. Belgrano 1234</p>
            <p className="text-gray-600">San Miguel de Tucumán</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Clock className="h-4 w-4 text-green-600 mt-0.5" />
          <div>
            <p className="font-medium">Lun-Vie: 9:00-20:00</p>
            <p className="text-gray-600">Sáb: 9:00-18:00</p>
            <p className="text-red-600">Dom: Cerrado</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Phone className="h-4 w-4 text-purple-600 mt-0.5" />
          <div>
            <p className="font-medium">+54 381 123-4567</p>
            <p className="text-gray-600">WhatsApp disponible</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Informacion;