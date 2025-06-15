"use client"
import React, { useState } from 'react';
import { Scissors, Phone, MapPin, Instagram, Facebook, Menu, X, Sparkles } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 md:p-3 rounded-xl shadow-lg">
              <Scissors className="h-5 w-5 md:h-7 md:w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Peluquería Elite
              </h1>
              <p className="text-xs md:text-sm text-gray-600 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Estilo y elegancia desde 1995
              </p>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center space-x-6">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="font-medium">San Miguel de Tucumán</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Phone className="h-4 w-4 text-green-600" />
                <span className="font-medium">+54 381 123-4567</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button className="text-blue-600 hover:bg-blue-50 p-2 rounded">
                <Instagram className="h-4 w-4" />
              </button>
              <button className="text-blue-600 hover:bg-blue-50 p-2 rounded">
                <Facebook className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button 
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600 p-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span>San Miguel de Tucumán</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 p-2">
              <Phone className="h-4 w-4 text-green-600" />
              <span>+54 381 123-4567</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;