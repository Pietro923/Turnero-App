// components/admin/PaymentHistory.tsx
"use client"
import React, { useState, useEffect, forwardRef } from 'react';
import { Download, DollarSign, CreditCard, Banknote } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAllAppointments } from '@/lib/supabase-functions';
import type { Appointment } from '@/lib/supabase';
import * as XLSX from 'xlsx';

interface PaymentHistoryProps {
  onClose?: () => void;
}

const PaymentHistory = forwardRef<HTMLButtonElement, PaymentHistoryProps>(
  ({  }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [payments, setPayments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    paymentMethod: 'all', // 'all', 'cash', 'transfer'
    status: 'paid' // Solo pagados por defecto
  });

  const loadPayments = async () => {
    setLoading(true);
    try {
      // Obtener todos los turnos completados y pagados
      const data = await getAllAppointments({
        status: 'completed',
        limit: 500 // Más datos para el historial
      });

      // Filtrar solo los pagados
      let filteredPayments = data.filter(apt => apt.payment_status === 'paid');

      // Aplicar filtros de fecha
      if (filters.dateFrom) {
        filteredPayments = filteredPayments.filter(apt => apt.date >= filters.dateFrom);
      }
      if (filters.dateTo) {
        filteredPayments = filteredPayments.filter(apt => apt.date <= filters.dateTo);
      }

      // Aplicar filtro de método de pago
      if (filters.paymentMethod !== 'all') {
        filteredPayments = filteredPayments.filter(apt => apt.payment_method === filters.paymentMethod);
      }

      // Ordenar por fecha más reciente
      filteredPayments.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB.getTime() - dateA.getTime();
      });

      setPayments(filteredPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
      alert('Error cargando historial de pagos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPayments();
    }
  }, [isOpen, filters]);

  const exportToExcel = () => {
    if (payments.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Preparar datos para Excel
    const excelData = payments.map(payment => ({
      'Fecha': new Date(payment.date).toLocaleDateString('es-AR'),
      'Hora': payment.time,
      'Cliente': payment.customer_name,
      'Teléfono': payment.customer_phone,
      'Peluquero': payment.barber?.name || 'N/A',
      'Servicio': payment.service?.name || 'N/A',
      'Monto': payment.service?.price || 0,
      'Método de Pago': payment.payment_method === 'cash' ? 'Efectivo' : 'Transferencia',
      'Estado': 'Pagado'
    }));

    // Crear workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Configurar ancho de columnas
    ws['!cols'] = [
      { wch: 12 }, // Fecha
      { wch: 8 },  // Hora
      { wch: 20 }, // Cliente
      { wch: 15 }, // Teléfono
      { wch: 15 }, // Peluquero
      { wch: 20 }, // Servicio
      { wch: 12 }, // Monto
      { wch: 15 }, // Método
      { wch: 10 }  // Estado
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Historial de Pagos');

    // Generar nombre de archivo
    const today = new Date().toISOString().split('T')[0];
    const filename = `Historial_Pagos_${today}.xlsx`;

    XLSX.writeFile(wb, filename);
  };

  const totalAmount = payments.reduce((sum, payment) => sum + (payment.service?.price || 0), 0);
  const cashPayments = payments.filter(p => p.payment_method === 'cash');
  const transferPayments = payments.filter(p => p.payment_method === 'transfer');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button ref={ref} variant="outline" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Historial de Pagos
          </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Historial de Pagos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filtros */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-sm">Desde</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Hasta</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Método de Pago</Label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => setFilters({...filters, paymentMethod: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                >
                  <option value="all">Todos</option>
                  <option value="cash">Solo Efectivo</option>
                  <option value="transfer">Solo Transferencia</option>
                </select>
              </div>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Total</span>
              </div>
              <p className="text-lg font-bold text-green-700">${totalAmount.toLocaleString()}</p>
              <p className="text-xs text-green-600">{payments.length} pagos</p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Efectivo</span>
              </div>
              <p className="text-lg font-bold text-blue-700">
                ${cashPayments.reduce((sum, p) => sum + (p.service?.price || 0), 0).toLocaleString()}
              </p>
              <p className="text-xs text-blue-600">{cashPayments.length} pagos</p>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Transferencia</span>
              </div>
              <p className="text-lg font-bold text-purple-700">
                ${transferPayments.reduce((sum, p) => sum + (p.service?.price || 0), 0).toLocaleString()}
              </p>
              <p className="text-xs text-purple-600">{transferPayments.length} pagos</p>
            </div>
          </div>

          {/* Tabla de pagos */}
          <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">Cargando historial...</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">No hay pagos registrados</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Fecha</th>
                    <th className="px-3 py-2 text-left">Cliente</th>
                    <th className="px-3 py-2 text-left">Servicio</th>
                    <th className="px-3 py-2 text-left">Monto</th>
                    <th className="px-3 py-2 text-left">Método</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <div>
                          {new Date(payment.date).toLocaleDateString('es-AR')}
                          <div className="text-xs text-gray-500">{payment.time}</div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          {payment.customer_name}
                          <div className="text-xs text-gray-500">{payment.barber?.name}</div>
                        </div>
                      </td>
                      <td className="px-3 py-2">{payment.service?.name}</td>
                      <td className="px-3 py-2 font-semibold text-green-600">
                        ${payment.service?.price.toLocaleString()}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          {payment.payment_method === 'cash' ? (
                            <>
                              <Banknote className="h-3 w-3 text-green-600" />
                              <span className="text-xs">Efectivo</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-3 w-3 text-blue-600" />
                              <span className="text-xs">Transferencia</span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-between">
            <DialogClose asChild>
              <Button variant="outline">Cerrar</Button>
            </DialogClose>
            <Button 
              onClick={exportToExcel}
              disabled={payments.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar a Excel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

PaymentHistory.displayName = 'PaymentHistory';
export default PaymentHistory;