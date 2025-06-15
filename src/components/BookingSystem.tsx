"use client"
import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { getBarbers, getServices, createAppointment, getBookedTimes } from '@/lib/supabase-functions';
import type { Barber, Service } from '@/lib/supabase';

const BookingSystem = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  
  const [booking, setBooking] = useState({
    barber: null as Barber | null,
    service: null as Service | null,
    date: '',
    time: '',
    name: '',
    phone: '',
    email: ''
  });

  const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Cargar horarios ocupados cuando cambia la fecha o peluquero
  useEffect(() => {
    if (booking.date && booking.barber) {
      loadBookedTimes();
    }
  }, [booking.date, booking.barber]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [barbersData, servicesData] = await Promise.all([
        getBarbers(),
        getServices()
      ]);
      setBarbers(barbersData);
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error cargando datos. Por favor recarga la página.');
    } finally {
      setLoading(false);
    }
  };

  const loadBookedTimes = async () => {
    if (!booking.date || !booking.barber) return;
    
    try {
      const times = await getBookedTimes(booking.date, booking.barber.id);
      setBookedTimes(times);
    } catch (error) {
      console.error('Error loading booked times:', error);
    }
  };

  const getDates = () => {
    const dates = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('es-AR', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short' 
        })
      });
    }
    return dates;
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleConfirm = async () => {
    if (!booking.barber || !booking.service || !booking.date || !booking.time || !booking.name || !booking.phone) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      
      await createAppointment({
        barber_id: booking.barber.id,
        service_id: booking.service.id,
        date: booking.date,
        time: booking.time,
        customer_name: booking.name,
        customer_phone: booking.phone,
        customer_email: booking.email || undefined
      });

      setStep(5);
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Error al crear el turno. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setBooking({
      barber: null,
      service: null,
      date: '',
      time: '',
      name: '',
      phone: '',
      email: ''
    });
    setBookedTimes([]);
  };

  const canContinue = () => {
    switch (step) {
      case 1: return booking.barber;
      case 2: return booking.service;
      case 3: return booking.date && booking.time;
      case 4: return booking.name && booking.phone;
      default: return false;
    }
  };

  if (loading && barbers.length === 0) {
    return (
      <div className="max-w-md mx-auto lg:max-w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto lg:max-w-full bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-blue-600 text-white p-4">
        <h2 className="text-lg font-semibold">Reservar Turno</h2>
        <div className="flex mt-2 space-x-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded ${
                step >= i ? 'bg-white' : 'bg-blue-400'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-4">
        {/* Paso 1: Peluquero */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Elegí tu peluquero</h3>
            <div className="space-y-2">
              {barbers.map((barber) => (
                <button
                  key={barber.id}
                  onClick={() => setBooking({ ...booking, barber })}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                    booking.barber?.id === barber.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{barber.emoji}</span>
                    <div>
                      <div className="font-medium">{barber.name}</div>
                      {barber.specialty && (
                        <div className="text-sm text-gray-500">{barber.specialty}</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Paso 2: Servicio */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">¿Qué servicio querés?</h3>
            <div className="space-y-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setBooking({ ...booking, service })}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                    booking.service?.id === service.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-gray-500">{service.duration} min</div>
                    </div>
                    <div className="font-semibold text-green-600">
                      ${service.price.toLocaleString()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Paso 3: Fecha y Hora */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Elegí el día</h3>
              <div className="grid grid-cols-2 gap-2">
                {getDates().map((date) => (
                  <button
                    key={date.value}
                    onClick={() => setBooking({ ...booking, date: date.value, time: '' })}
                    className={`p-2 text-center rounded border-2 transition-colors ${
                      booking.date === date.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium">{date.display}</div>
                  </button>
                ))}
              </div>
            </div>

            {booking.date && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Elegí la hora</h3>
                <div className="grid grid-cols-3 gap-2">
                  {times.map((time) => {
                    const isBooked = bookedTimes.includes(time);
                    return (
                      <button
                        key={time}
                        onClick={() => !isBooked && setBooking({ ...booking, time })}
                        disabled={isBooked}
                        className={`p-2 text-center rounded border-2 transition-colors ${
                          booking.time === time
                            ? 'border-blue-500 bg-blue-50'
                            : isBooked
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {time}
                        {isBooked && <div className="text-xs text-red-500">Ocupado</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Paso 4: Datos */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Tus datos</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Tu nombre *"
                value={booking.name}
                onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="tel"
                placeholder="Tu teléfono *"
                value={booking.phone}
                onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Tu email (opcional)"
                value={booking.email}
                onChange={(e) => setBooking({ ...booking, email: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Resumen:</h4>
              <div className="text-sm space-y-1">
                <div>Peluquero: {booking.barber?.name}</div>
                <div>Servicio: {booking.service?.name}</div>
                <div>Fecha: {new Date(booking.date).toLocaleDateString('es-AR')}</div>
                <div>Hora: {booking.time}</div>
                <div className="font-semibold text-green-600">
                  Total: ${booking.service?.price.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paso 5: Confirmación */}
        {step === 5 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-600">¡Listo!</h3>
              <p className="text-gray-600">Tu turno está confirmado</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-sm text-left">
              <div className="space-y-1">
                <div><strong>{booking.barber?.name}</strong></div>
                <div>{booking.service?.name}</div>
                <div>{new Date(booking.date).toLocaleDateString('es-AR')} a las {booking.time}</div>
                <div>Para: {booking.name}</div>
                <div>Tel: {booking.phone}</div>
                <div className="font-semibold text-green-600">
                  Total: ${booking.service?.price.toLocaleString()}
                </div>
              </div>
            </div>
            <button
              onClick={reset}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Nuevo turno
            </button>
          </div>
        )}
      </div>

      {/* Botón continuar */}
      {step < 5 && (
        <div className="p-4 border-t">
          <button
            onClick={step === 4 ? handleConfirm : handleNext}
            disabled={!canContinue() || loading}
            className={`w-full py-2 px-4 rounded-lg transition-colors flex items-center justify-center ${
              canContinue() && !loading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Procesando...
              </>
            ) : (
              step === 4 ? 'Confirmar' : 'Continuar'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingSystem;