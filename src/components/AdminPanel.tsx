"use client"
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Check, 
  X, 
  DollarSign, 
  CreditCard, 
  Banknote,
  Search,
  Filter,
  Eye,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Users,
  CheckCircle2
} from 'lucide-react';
import { 
  getAllAppointments, 
  updateAppointmentStatus, 
  getBarbers, 
  getAppointmentStats 
} from '@/lib/supabase-functions';
import type { Appointment, Barber } from '@/lib/supabase';

const AdminPanel = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [dateInput, setDateInput] = useState('');
  // Filtros
  const [filters, setFilters] = useState({
    date: '', // Vacío por defecto = mostrar todos
    status: 'all',
    barberId: 'all'
  });

  useEffect(() => {
  const timer = setTimeout(() => {
    // Solo actualizar si la fecha es válida (formato completo YYYY-MM-DD) o está vacía
    if (dateInput === '' || dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
      setFilters(prev => ({ ...prev, date: dateInput }));
    }
  }, 500); // Espera 500ms después de que pare de escribir

  return () => clearTimeout(timer);
}, [dateInput]);

useEffect(() => {
  loadData();
}, [filters]);

// Inicializar dateInput cuando cambian los filtros desde botones
useEffect(() => {
  setDateInput(filters.date);
}, [filters.date]);

  const loadData = async () => {
  // Agregar esta validación al inicio
  if (filters.date && (filters.date.length < 10 || isNaN(Date.parse(filters.date)))) {
    console.log('Fecha incompleta o inválida, esperando...');
    return;
  }

  try {
      setLoading(true);
      
      console.log('🔍 Filtros actuales:', filters);
      
      const [appointmentsData, barbersData, statsData] = await Promise.all([
        getAllAppointments({
          date: filters.date || undefined,
          status: filters.status === 'all' ? undefined : filters.status,
          barberId: filters.barberId === 'all' ? undefined : Number(filters.barberId),
          limit: 50
        }),
        getBarbers(),
        getAppointmentStats() // Sin filtros de fecha para stats generales
      ]);

      console.log('📅 Turnos encontrados:', appointmentsData);
      console.log('👥 Peluqueros:', barbersData);
      console.log('📊 Stats:', statsData);

      setAppointments(appointmentsData);
      setBarbers(barbersData);
      setStats(statsData);
    } catch (error: any) {
      console.error('❌ Error loading data:', error);
      alert('Error cargando datos: ' + (error?.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    appointmentId: number, 
    status: Appointment['status'],
    paymentStatus?: Appointment['payment_status'],
    paymentMethod?: Appointment['payment_method']
  ) => {
    try {
      setUpdating(appointmentId);
      
      await updateAppointmentStatus(appointmentId, status, paymentStatus, paymentMethod);
      
      // Actualizar la lista local
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { 
                ...apt, 
                status, 
                payment_status: paymentStatus || apt.payment_status,
                payment_method: paymentMethod || apt.payment_method 
              }
            : apt
        )
      );

      // Recargar stats - si hay fecha específica, usar esa, sino stats generales
      const newStats = filters.date 
        ? await getAppointmentStats(filters.date, filters.date)
        : await getAppointmentStats();
      setStats(newStats);
      
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Error actualizando turno');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      case 'no_show': return 'No vino';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Cargando panel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-gray-600">Gestiona los turnos de la peluquería</p>
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Turnos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ingresos</p>
                  <p className="text-2xl font-bold text-green-600">${stats.revenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <input
  type="date"
  value={dateInput}
  onChange={(e) => setDateInput(e.target.value)}
                  placeholder="Todas las fechas"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {filters.date ? 'Filtrando por fecha específica' : 'Mostrando todas las fechas'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos</option>
                  <option value="confirmed">Confirmados</option>
                  <option value="completed">Completados</option>
                  <option value="cancelled">Cancelados</option>
                  <option value="no_show">No vinieron</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peluquero
                </label>
                <select
                  value={filters.barberId}
                  onChange={(e) => setFilters({ ...filters, barberId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos</option>
                  {barbers.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilters({ date: new Date().toISOString().split('T')[0], status: 'all', barberId: 'all' })}
                className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Solo Hoy
              </button>
              <button
                onClick={() => setFilters({ date: '', status: 'all', barberId: 'all' })}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Lista de turnos */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Turnos {filters.date ? `del ${new Date(filters.date).toLocaleDateString('es-AR')}` : ''}
            </h3>
          </div>

          {appointments.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay turnos para los filtros seleccionados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Hora
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Peluquero
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Servicio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Pago
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{appointment.time}</span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">{appointment.customer_name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {appointment.customer_phone}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{appointment.barber?.emoji}</span>
                          <span className="font-medium">{appointment.barber?.name}</span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{appointment.service?.name}</div>
                          <div className="text-sm text-green-600 font-semibold">
                            ${appointment.service?.price.toLocaleString()}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            appointment.payment_status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                          </span>
                          {appointment.payment_method && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              {appointment.payment_method === 'cash' ? (
                                <Banknote className="h-3 w-3" />
                              ) : (
                                <CreditCard className="h-3 w-3" />
                              )}
                              {appointment.payment_method === 'cash' ? 'Efectivo' : 'Transferencia'}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {appointment.status === 'confirmed' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(appointment.id, 'completed', 'paid', 'cash')}
                                disabled={updating === appointment.id}
                                className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                                title="Marcar como completado y pagado en efectivo"
                              >
                                <Banknote className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(appointment.id, 'completed', 'paid', 'transfer')}
                                disabled={updating === appointment.id}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Marcar como completado y pagado por transferencia"
                              >
                                <CreditCard className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(appointment.id, 'no_show')}
                                disabled={updating === appointment.id}
                                className="p-1 text-orange-600 hover:bg-orange-100 rounded transition-colors"
                                title="Marcar como no vino"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          
                          {appointment.status === 'completed' && appointment.payment_status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(appointment.id, 'completed', 'paid', 'cash')}
                                disabled={updating === appointment.id}
                                className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                                title="Marcar como pagado en efectivo"
                              >
                                <Banknote className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(appointment.id, 'completed', 'paid', 'transfer')}
                                disabled={updating === appointment.id}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Marcar como pagado por transferencia"
                              >
                                <CreditCard className="h-4 w-4" />
                              </button>
                            </>
                          )}

                          {updating === appointment.id && (
                            <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;