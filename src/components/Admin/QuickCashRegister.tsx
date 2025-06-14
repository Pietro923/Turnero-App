// components/admin/QuickCashRegister.tsx
"use client"
import React, { useState, forwardRef } from 'react';
import { DollarSign, ShoppingBag, Scissors, Coffee, Plus } from 'lucide-react';
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

interface QuickCashRegisterProps {
  onAddTransaction: (transaction: {
    amount: number;
    concept: string;
    method: 'cash' | 'transfer';
    type: 'income' | 'expense';
  }) => Promise<void>;
}

const QuickCashRegister = forwardRef<HTMLButtonElement, QuickCashRegisterProps>(
  ({ onAddTransaction }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    concept: '',
    method: 'cash' as 'cash' | 'transfer',
    type: 'income' as 'income' | 'expense'
  });

  // Conceptos rápidos predefinidos
  const quickConcepts = {
    income: [
      { icon: Scissors, label: 'Servicio extra', amount: 2000 },
      { icon: ShoppingBag, label: 'Venta de producto', amount: 1500 },
      { icon: Coffee, label: 'Propina', amount: 500 },
      { icon: Plus, label: 'Otro ingreso', amount: 0 }
    ],
    expense: [
      { icon: ShoppingBag, label: 'Compra productos', amount: 5000 },
      { icon: Coffee, label: 'Insumos', amount: 1000 },
      { icon: DollarSign, label: 'Gasto operativo', amount: 2000 },
      { icon: Plus, label: 'Otro gasto', amount: 0 }
    ]
  };

  const handleQuickSelect = (concept: string, amount: number) => {
    setFormData({
      ...formData,
      concept,
      amount: amount > 0 ? amount.toString() : ''
    });
  };

  const handleSubmit = async () => {
    const amount = parseFloat(formData.amount);
    
    if (!amount || amount <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    if (!formData.concept.trim()) {
      alert('Por favor ingresa un concepto');
      return;
    }

    try {
      setIsSubmitting(true);
      
      await onAddTransaction({
        amount,
        concept: formData.concept.trim(),
        method: formData.method,
        type: formData.type
      });

      // Resetear formulario
      setFormData({
        amount: '',
        concept: '',
        method: 'cash',
        type: 'income'
      });

      setIsOpen(false);
      
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Error al registrar la transacción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Resetear al cerrar
      setFormData({
        amount: '',
        concept: '',
        method: 'cash',
        type: 'income'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
            ref={ref}
            variant="outline" 
            className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Registro de Caja
          </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Registro Rápido de Caja
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Registrar ingresos o gastos fuera de los turnos
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tipo de transacción */}
          <div>
            <Label className="text-sm font-medium">Tipo de transacción</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => setFormData({...formData, type: 'income', concept: '', amount: ''})}
                className={`p-3 text-sm rounded-lg border-2 transition-colors ${
                  formData.type === 'income'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                💰 Ingreso
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, type: 'expense', concept: '', amount: ''})}
                className={`p-3 text-sm rounded-lg border-2 transition-colors ${
                  formData.type === 'expense'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                💸 Gasto
              </button>
            </div>
          </div>

          {/* Conceptos rápidos */}
          <div>
            <Label className="text-sm font-medium">
              {formData.type === 'income' ? 'Ingresos comunes' : 'Gastos comunes'}
            </Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {quickConcepts[formData.type].map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleQuickSelect(item.label, item.amount)}
                  className={`p-3 text-left rounded-lg border-2 transition-colors hover:border-gray-300 ${
                    formData.concept === item.label
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {item.amount > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      ${item.amount.toLocaleString()}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Concepto personalizado */}
          <div>
            <Label className="text-sm font-medium">Concepto *</Label>
            <Input
              value={formData.concept}
              onChange={(e) => setFormData({...formData, concept: e.target.value})}
              placeholder="Describe el ingreso/gasto"
              className="mt-1"
              maxLength={100}
            />
          </div>

          {/* Monto */}
          <div>
            <Label className="text-sm font-medium">Monto *</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="0"
                className="pl-8"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Método de pago */}
          <div>
            <Label className="text-sm font-medium">Método</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => setFormData({...formData, method: 'cash'})}
                className={`p-3 text-sm rounded-lg border-2 transition-colors ${
                  formData.method === 'cash'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                💵 Efectivo
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, method: 'transfer'})}
                className={`p-3 text-sm rounded-lg border-2 transition-colors ${
                  formData.method === 'transfer'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                💳 Transferencia
              </button>
            </div>
          </div>

          {/* Resumen */}
          {formData.amount && formData.concept && (
            <div className={`p-3 rounded-lg border-2 ${
              formData.type === 'income' 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {formData.type === 'income' ? '💰' : '💸'} {formData.concept}
                </span>
                <span className={`font-bold ${
                  formData.type === 'income' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {formData.type === 'income' ? '+' : '-'}${parseFloat(formData.amount || '0').toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {formData.method === 'cash' ? 'Efectivo' : 'Transferencia'}
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
            disabled={!formData.amount || !formData.concept.trim() || isSubmitting}
            className={formData.type === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
          >
            {isSubmitting ? 'Registrando...' : `Registrar ${formData.type === 'income' ? 'Ingreso' : 'Gasto'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

QuickCashRegister.displayName = 'QuickCashRegister';
export default QuickCashRegister;