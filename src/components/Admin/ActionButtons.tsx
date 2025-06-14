// components/admin/ActionButtons.tsx
"use client"
import React from 'react';
import { Banknote, CreditCard, RefreshCw } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import CancelDialog from './CancelDialog';
import type { Appointment } from '@/lib/supabase';

interface ActionButtonsProps {
  appointment: Appointment;
  updating: number | null;
  onStatusUpdate: (
    appointmentId: number, 
    status: Appointment['status'],
    paymentStatus?: Appointment['payment_status'],
    paymentMethod?: Appointment['payment_method']
  ) => Promise<void>;
  onCancel: (appointmentId: number, reason: string) => Promise<void>;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  appointment,
  updating,
  onStatusUpdate,
  onCancel
}) => {
  const isUpdating = updating === appointment.id;

  return (
    <TooltipProvider>
      <div className="flex gap-2">
        {/* Botones para turnos confirmados */}
        {appointment.status === 'confirmed' && (
          <>
            {/* Completado + Efectivo */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onStatusUpdate(appointment.id, 'completed', 'paid', 'cash')}
                  disabled={isUpdating}
                  className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                >
                  <Banknote className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Completado + Pagado en efectivo</TooltipContent>
            </Tooltip>

            {/* Completado + Transferencia */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onStatusUpdate(appointment.id, 'completed', 'paid', 'transfer')}
                  disabled={isUpdating}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors disabled:opacity-50"
                >
                  <CreditCard className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Completado + Pagado por transferencia</TooltipContent>
            </Tooltip>

            {/* Cancelar con motivo */}
            <CancelDialog
              appointmentId={appointment.id}
              customerName={appointment.customer_name}
              onCancel={onCancel}
              disabled={isUpdating}
            />
          </>
        )}

        {/* Botones para turnos completados pero no pagados */}
        {appointment.status === 'completed' && appointment.payment_status === 'pending' && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onStatusUpdate(appointment.id, 'completed', 'paid', 'cash')}
                  disabled={isUpdating}
                  className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                >
                  <Banknote className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Marcar como pagado en efectivo</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onStatusUpdate(appointment.id, 'completed', 'paid', 'transfer')}
                  disabled={isUpdating}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors disabled:opacity-50"
                >
                  <CreditCard className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Marcar como pagado por transferencia</TooltipContent>
            </Tooltip>
          </>
        )}

        {/* Loading indicator */}
        {isUpdating && (
          <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
        )}

        {/* No hay acciones disponibles */}
        {appointment.status !== 'confirmed' && 
         !(appointment.status === 'completed' && appointment.payment_status === 'pending') && 
         !isUpdating && (
          <span className="text-xs text-gray-400 px-2 py-1">
            Sin acciones
          </span>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ActionButtons;