"use client"
import React from 'react';
import { Star } from 'lucide-react';

const Resenas = () => {
  const reviews = [
    { text: "Excelente atención. Leandro es un genio!", author: "Juan P." },
    { text: "María increíble con los cortes femeninos.", author: "Lucía M." },
    { text: "Local limpio y profesional. Recomendable!", author: "Roberto S." }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      <div className="text-center">
        <h3 className="font-semibold text-gray-900 mb-2">Reseñas</h3>
        <div className="flex items-center justify-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="font-semibold">4.9</span>
          <span className="text-sm text-gray-600">(127 reseñas)</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {reviews.map((review, i) => (
          <div key={i} className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700 mb-1">"{review.text}"</p>
            <p className="text-xs text-gray-500">— {review.author}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Resenas;