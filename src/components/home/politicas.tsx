"use client"
import React from 'react';
import { AlertCircle } from 'lucide-react';

const Politicas = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      <h3 className="font-semibold text-gray-900">Políticas</h3>
      
      <div className="space-y-2 text-sm text-gray-600">
        <p>• Confirmación automática por WhatsApp</p>
        <p>• Recordatorios 24hs y 2hs antes</p>
        <p>• Cancelación gratuita con 2hs anticipación</p>
        <p>• Llegar 5min antes del turno</p>
        <p>• Tolerancia de 15min máximo</p>
      </div>
      
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
          <p className="text-sm text-blue-800">
            Para cancelar o reprogramar, enviá WhatsApp al <strong>+54 381 123-4567</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Politicas;