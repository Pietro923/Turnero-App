// components/admin/ManualAppointmentDialog.tsx
"use client"
import React, { useState, useEffect, forwardRef } from 'react';
import { Plus, Calendar} from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createAppointment, getBookedTimes } from '@/lib/supabase-functions';
import type { Barber, Service } from '@/lib/supabase';

interface ManualAppointmentDialogProps {
  barbers: Barber[];
  services: Service[];
  onAppointmentCreated: () => void;
}

interface ManualAppointmentDialogProps {
  barbers: Barber[];
  services: Service[];
  onAppointmentCreated: () => void;
}
const ManualAppointmentDialog = forwardRef<HTMLButtonElement, ManualAppointmentDialogProps>(
  ({ barbers, services, onAppointmentCreated }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    barber_id: '',
    service_id: '',
    date: '',
    time: '',
    customer_name: '',
    customer_phone: '',
    customer_email: ''
  });

  // Generar horarios disponibles
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00'
  ];

  // Cargar horarios ocupados cuando cambia fecha o peluquero
  useEffect(() => {
    if (formData.date && formData.barber_id) {
      loadBookedTimes();
    }
  }, [formData.date, formData.barber_id]);

  const loadBookedTimes = async () => {
    try {
      const times = await getBookedTimes(formData.date, Number(formData.barber_id));
      setBookedTimes(times);
    } catch (error) {
      console.error('Error loading booked times:', error);
    }
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.barber_id || !formData.service_id || !formData.date || 
        !formData.time || !formData.customer_name || !formData.customer_phone) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setIsSubmitting(true);
      
      await createAppointment({
        barber_id: Number(formData.barber_id),
        service_id: Number(formData.service_id),
        date: formData.date,
        time: formData.time,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email || undefined
      });

      // Resetear formulario
      setFormData({
        barber_id: '',
        service_id: '',
        date: '',
        time: '',
        customer_name: '',
        customer_phone: '',
        customer_email: ''
      });

      setIsOpen(false);
      onAppointmentCreated();
      
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Error al crear el turno');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Resetear al cerrar
      setFormData({
        barber_id: '',
        service_id: '',
        date: '',
        time: '',
        customer_name: '',
        customer_phone: '',
        customer_email: ''
      });
      setBookedTimes([]);
    }
  };

  const selectedService = services.find(s => s.id === Number(formData.service_id));

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button ref={ref} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Turno Manualmente
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Nuevo Turno Manual
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Crear turno desde Instagram, WhatsApp, etc.
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Peluquero */}
          <div>
            <Label className="text-sm font-medium">Peluquero *</Label>
            <select
              value={formData.barber_id}
              onChange={(e) => setFormData({...formData, barber_id: e.target.value, time: ''})}
              className="w-full p-2 border border-gray-300 rounded-lg mt-1"
            >
              <option value="">Seleccionar peluquero</option>
              {barbers.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.emoji} {barber.name}
                </option>
              ))}
            </select>
          </div>

          {/* Servicio */}
          <div>
            <Label className="text-sm font-medium">Servicio *</Label>
            <select
              value={formData.service_id}
              onChange={(e) => setFormData({...formData, service_id: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg mt-1"
            >
              <option value="">Seleccionar servicio</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - ${service.price.toLocaleString()} ({service.duration} min)
                </option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div>
            <Label className="text-sm font-medium">Fecha *</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value, time: ''})}
              min={new Date().toISOString().split('T')[0]}
              className="mt-1"
            />
          </div>

          {/* Hora */}
          {formData.date && formData.barber_id && (
            <div>
              <Label className="text-sm font-medium">Hora *</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {timeSlots.map((time) => {
                  const isBooked = bookedTimes.includes(time);
                  const isSelected = formData.time === time;
                  
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => !isBooked && setFormData({...formData, time})}
                      disabled={isBooked}
                      className={`p-2 text-sm rounded border-2 transition-colors ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
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

          <hr className="my-4" />

          {/* Datos del cliente */}
          <div>
            <Label className="text-sm font-medium">Nombre del cliente *</Label>
            <Input
              value={formData.customer_name}
              onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
              placeholder="Nombre completo"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Teléfono *</Label>
            <Input
              value={formData.customer_phone}
              onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
              placeholder="+54 381 123-4567"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Email (opcional)</Label>
            <Input
              type="email"
              value={formData.customer_email}
              onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
              placeholder="cliente@email.com"
              className="mt-1"
            />
          </div>

          {/* Resumen */}
          {selectedService && formData.date && formData.time && (
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-800 mb-2">Resumen del turno:</h4>
              <div className="text-sm space-y-1 text-purple-700">
                <div>📅 {new Date(formData.date).toLocaleDateString('es-AR')}</div>
                <div>🕐 {formData.time}</div>
                <div>💰 ${selectedService.price.toLocaleString()}</div>
                <div>⏱️ {selectedService.duration} minutos</div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={!formData.barber_id || !formData.service_id || !formData.date || 
                     !formData.time || !formData.customer_name || !formData.customer_phone || 
                     isSubmitting}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? 'Creando...' : 'Crear Turno'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
ManualAppointmentDialog.displayName = 'ManualAppointmentDialog';
export default ManualAppointmentDialog;