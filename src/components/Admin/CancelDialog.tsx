// components/admin/CancelDialog.tsx
"use client"
import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface CancelDialogProps {
  appointmentId: number;
  customerName: string;
  onCancel: (appointmentId: number, reason: string) => Promise<void>;
  disabled?: boolean;
}

const CancelDialog: React.FC<CancelDialogProps> = ({
  appointmentId,
  customerName,
  onCancel,
  disabled = false
}) => {
  const [reason, setReason] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = async () => {
    if (!reason.trim()) {
      alert('Por favor ingresa un motivo de cancelación');
      return;
    }

    try {
      setIsSubmitting(true);
      await onCancel(appointmentId, reason.trim());
      
      // Limpiar y cerrar
      setReason('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error cancelando turno:', error);
      alert('Error al cancelar el turno');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Limpiar al cerrar
      setReason('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <button
              disabled={disabled}
              className="p-1 text-orange-600 hover:bg-orange-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Cancelar turno</TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Cancelar Turno
          </DialogTitle>
          <p className="text-sm text-gray-600">
            ¿Estás seguro de cancelar el turno de <strong>{customerName}</strong>?
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="reason" className="text-sm font-medium">
              Motivo de cancelación *
            </Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Cliente no se presentó, canceló por teléfono, etc."
              className="mt-2"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              Máximo 200 caracteres ({reason.length}/200)
            </p>
          </div>

          {/* Sugerencias rápidas */}
          <div>
            <Label className="text-sm font-medium text-gray-600">
              Motivos comunes:
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                'No se presentó',
                'Canceló por teléfono',
                'Emergencia personal',
                'Cambio de horario'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setReason(suggestion)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            onClick={handleCancel}
            disabled={!reason.trim() || isSubmitting}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isSubmitting ? 'Cancelando...' : 'Confirmar Cancelación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelDialog;