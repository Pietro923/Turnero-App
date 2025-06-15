"use client"
import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { getBarbers, createAppointment, getBookedTimes, getServicesByBarber, checkAvailability } from '@/lib/supabase-functions';
import type { Barber } from '@/lib/supabase';

const BookingSystem = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  
  const [booking, setBooking] = useState({
    barber: null as Barber | null,
    service: null as any | null,
    date: '',
    time: '',
    name: '',
    phone: '',
    email: ''
  });

  const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];

  // Cargar datos iniciales (solo peluqueros)
  useEffect(() => {
    loadInitialData();
  }, []);

  // Cargar servicios cuando se selecciona un peluquero
  useEffect(() => {
    if (booking.barber) {
      loadBarberServices();
    }
  }, [booking.barber]);

  // Cargar horarios ocupados cuando cambia la fecha o peluquero
  useEffect(() => {
    if (booking.date && booking.barber) {
      loadBookedTimes();
    }
  }, [booking.date, booking.barber]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const barbersData = await getBarbers();
      setBarbers(barbersData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error cargando datos. Por favor recarga la página.');
    } finally {
      setLoading(false);
    }
  };

  const loadBarberServices = async () => {
    if (!booking.barber) return;
    
    try {
      setLoadingServices(true);
      const barberServices = await getServicesByBarber(booking.barber.id);
      setServices(barberServices);
    } catch (error) {
      console.error('Error loading barber services:', error);
      alert('Error cargando servicios del peluquero.');
    } finally {
      setLoadingServices(false);
    }
  };

  const loadBookedTimes = async () => {
  if (!booking.date || !booking.barber) return;
  
  try {
    console.log(`🔍 Cargando horarios ocupados para ${booking.barber.name} el ${booking.date}`);
    const times = await getBookedTimes(booking.date, booking.barber.id);
    console.log(`⏰ Horarios ocupados encontrados:`, times);
    
    // 🔧 SOLUCIÓN: Convertir formato "09:30:00" a "09:30"
    const cleanTimes = times.map(time => time.substring(0, 5));
    console.log(`⏰ Horarios limpios:`, cleanTimes);
    
    setBookedTimes(cleanTimes);
  } catch (error) {
    console.error('Error loading booked times:', error);
    setBookedTimes([]);
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

  const handleBarberSelect = (barber: Barber) => {
    setBooking({ 
      ...booking, 
      barber, 
      service: null // Resetear servicio cuando cambia peluquero
    });
    setServices([]); // Limpiar servicios anteriores
  };

  const handleDateSelect = (date: string) => {
    setBooking({ ...booking, date, time: '' }); // Limpiar hora cuando cambia fecha
    setBookedTimes([]); // Limpiar horarios anteriores
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      // Limpiar datos del paso actual si es necesario
      if (step === 2) {
        setBooking({ ...booking, service: null });
      } else if (step === 3) {
        setBooking({ ...booking, date: '', time: '' });
      } else if (step === 4) {
        setBooking({ ...booking, name: '', phone: '', email: '' });
      }
    }
  };

  const handleConfirm = async () => {
    if (!booking.barber || !booking.service || !booking.date || !booking.time || !booking.name || !booking.phone) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      
      console.log(`🔒 Verificando disponibilidad final para ${booking.barber.name} - ${booking.date} ${booking.time}`);
      
      // VALIDACIÓN FINAL DE DISPONIBILIDAD
      const isAvailable = await checkAvailability(booking.barber.id, booking.date, booking.time);
      
      if (!isAvailable) {
        alert(`⚠️ Lo sentimos, el horario ${booking.time} del ${new Date(booking.date).toLocaleDateString('es-AR')} con ${booking.barber.name} ya fue reservado por otro cliente. Por favor elige otro horario.`);
        
        // Recargar horarios ocupados para actualizar la vista
        await loadBookedTimes();
        
        // Volver al paso 3 para que elija otra hora
        setStep(3);
        setBooking({ ...booking, time: '' }); // Limpiar hora seleccionada
        return;
      }

      console.log('✅ Horario disponible, creando turno...');

      // Crear el turno
      await createAppointment({
        barber_id: booking.barber.id,
        service_id: booking.service.service.id,
        date: booking.date,
        time: booking.time,
        customer_name: booking.name,
        customer_phone: booking.phone,
        customer_email: booking.email || undefined
      });
      
      console.log('🎉 Turno creado exitosamente');
      setStep(5);
      
    } catch (error: any) {
      console.error('❌ Error creating appointment:', error);
      
      // Manejo específico para error de constraint único
      if (error?.code === '23505' || error?.message?.includes('unique_appointment')) {
        alert(`⚠️ Este horario acaba de ser reservado por otro cliente. Por favor elige otro horario.`);
        
        // Recargar horarios y volver al paso 3
        await loadBookedTimes();
        setStep(3);
        setBooking({ ...booking, time: '' });
      } else {
        alert('Error al crear el turno. Por favor intenta nuevamente.');
      }
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
    setServices([]);
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

  // Función para obtener el precio correcto (personalizado o base)
  const getServicePrice = (barberService: any) => {
    return barberService.custom_price || barberService.service.price;
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
                  onClick={() => handleBarberSelect(barber)}
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
            <h3 className="font-medium text-gray-900">
              ¿Qué servicio querés con {booking.barber?.name}?
            </h3>
            
            {loadingServices ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-gray-600">Cargando servicios...</p>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Este peluquero no tiene servicios asignados.</p>
                <button
                  onClick={() => setStep(1)}
                  className="mt-2 text-blue-600 underline"
                >
                  Elegir otro peluquero
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {services.map((barberService) => (
                  <button
                    key={barberService.id}
                    onClick={() => setBooking({ ...booking, service: barberService })}
                    className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                      booking.service?.id === barberService.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{barberService.service.name}</div>
                        <div className="text-sm text-gray-500">
                          {barberService.service.duration} min
                          {barberService.custom_price && (
                            <span className="text-blue-600 ml-1">(precio especial)</span>
                          )}
                        </div>
                      </div>
                      <div className="font-semibold text-green-600">
                        ${getServicePrice(barberService).toLocaleString()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
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
                    onClick={() => handleDateSelect(date.value)}
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
                <h3 className="font-medium text-gray-900 mb-2">
                  Elegí la hora
                  {bookedTimes.length > 0 && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({bookedTimes.length} horarios ocupados)
                    </span>
                  )}
                </h3>
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
                <div>Servicio: {booking.service?.service.name}</div>
                <div>Fecha: {new Date(booking.date).toLocaleDateString('es-AR')}</div>
                <div>Hora: {booking.time}</div>
                <div className="font-semibold text-green-600">
                  Total: ${getServicePrice(booking.service).toLocaleString()}
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
                <div>{booking.service?.service.name}</div>
                <div>{new Date(booking.date).toLocaleDateString('es-AR')} a las {booking.time}</div>
                <div>Para: {booking.name}</div>
                <div>Tel: {booking.phone}</div>
                <div className="font-semibold text-green-600">
                  Total: ${getServicePrice(booking.service).toLocaleString()}
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

      {/* Botones navegación */}
      {step < 5 && (
        <div className="p-4 border-t">
          <div className="flex gap-2">
            {/* Botón Atrás */}
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 py-2 px-4 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Atrás
              </button>
            )}
            
            {/* Botón Continuar/Confirmar */}
            <button
              onClick={step === 4 ? handleConfirm : handleNext}
              disabled={!canContinue() || loading}
              className={`${step > 1 ? 'flex-1' : 'w-full'} py-2 px-4 rounded-lg transition-colors flex items-center justify-center ${
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
                step === 4 ? 'Confirmar Turno' : 'Continuar'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingSystem;