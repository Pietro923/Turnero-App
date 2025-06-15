/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2,  
  Scissors, 
  X,
  Check
} from 'lucide-react';
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
  getBarbersWithServices,
  getServices,
  createBarber,
  createService,
  updateBarber,
  deleteBarber,
  assignServiceToBarber,
  removeServiceFromBarber,
  updateBarberServicePrice,
  getAvailableServicesForBarber
} from '@/lib/supabase-functions';
import { updateService, deleteService } from '@/lib/supabase-functions';

const BarberManagementPanel = () => {
  const [barbers, setBarbers] = useState<any[]>([]);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBarber, setEditingBarber] = useState<any>(null);
  const [editingService, setEditingService] = useState<any>(null);
  const [editingGlobalService, setEditingGlobalService] = useState<any>(null);

  // Estados para modales
  const [showNewBarberModal, setShowNewBarberModal] = useState(false);
  const [showNewServiceModal, setShowNewServiceModal] = useState(false);
  const [showAssignServiceModal, setShowAssignServiceModal] = useState(false);
  const [showDeleteServiceModal, setShowDeleteServiceModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<any>(null);
  const [selectedBarberForService, setSelectedBarberForService] = useState<any>(null);
  const [availableServices, setAvailableServices] = useState<any[]>([]);

  // Formulario nuevo peluquero
  const [newBarberForm, setNewBarberForm] = useState({
    name: '',
    emoji: '👨‍🦱',
    specialty: ''
  });

  // Formulario nuevo servicio
  const [newServiceForm, setNewServiceForm] = useState({
    name: '',
    duration: '',
    price: ''
  });

  // Formulario asignar servicio
  const [assignServiceForm, setAssignServiceForm] = useState({
    serviceId: '',
    customPrice: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [barbersData, servicesData] = await Promise.all([
        getBarbersWithServices(),
        getServices()
      ]);
      setBarbers(barbersData);
      setAllServices(servicesData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBarber = async () => {
    try {
      if (!newBarberForm.name) {
        alert('Nombre es obligatorio');
        return;
      }
      
      await createBarber(newBarberForm);
      
      // Resetear formulario
      setNewBarberForm({ name: '', emoji: '👨‍🦱', specialty: '' });
      setShowNewBarberModal(false);
      
      // Recargar datos
      loadData();
    } catch (error) {
      console.error('Error creating barber:', error);
      alert('Error creando peluquero');
    }
  };

  const handleCreateService = async () => {
    try {
      if (!newServiceForm.name || !newServiceForm.duration || !newServiceForm.price) {
        alert('Todos los campos son obligatorios');
        return;
      }

      await createService({
        name: newServiceForm.name,
        duration: parseInt(newServiceForm.duration),
        price: parseInt(newServiceForm.price)
      });
      
      // Resetear formulario
      setNewServiceForm({ name: '', duration: '', price: '' });
      setShowNewServiceModal(false);
      
      // Recargar datos
      loadData();
    } catch (error) {
      console.error('Error creating service:', error);
      alert('Error creando servicio');
    }
  };

  const handleUpdateBarber = async (barberId: number, updates: any) => {
    try {
      await updateBarber(barberId, updates);
      setEditingBarber(null);
      loadData();
    } catch (error) {
      console.error('Error updating barber:', error);
      alert('Error actualizando peluquero');
    }
  };

  const handleDeleteBarber = async (barberId: number, barberName: string) => {
    if (!confirm(`¿Estás seguro de eliminar a ${barberName}?`)) return;
    
    try {
      await deleteBarber(barberId);
      loadData();
    } catch (error) {
      console.error('Error deleting barber:', error);
      alert('Error eliminando peluquero');
    }
  };

  const handleAssignService = async () => {
  try {
    if (!assignServiceForm.serviceId) {
      alert('Selecciona un servicio');
      return;
    }
    
    const customPrice = assignServiceForm.customPrice 
      ? parseInt(assignServiceForm.customPrice) 
      : undefined; // ← Cambiar null por undefined
    
    await assignServiceToBarber(
      selectedBarberForService.id,
      parseInt(assignServiceForm.serviceId),
      customPrice
    );
    
    // Resetear y cerrar
    setAssignServiceForm({ serviceId: '', customPrice: '' });
    setShowAssignServiceModal(false);
    setSelectedBarberForService(null);
    loadData();
  } catch (error) {
    console.error('Error assigning service:', error);
    alert('Error asignando servicio');
  }
};

  const handleRemoveService = async (barberId: number, serviceId: number) => {
    try {
      await removeServiceFromBarber(barberId, serviceId);
      loadData();
    } catch (error) {
      console.error('Error removing service:', error);
      alert('Error removiendo servicio');
    }
  };

  const handleUpdateServicePrice = async (barberId: number, serviceId: number, price: string) => {
    try {
      const customPrice = price ? parseInt(price) : null;
      await updateBarberServicePrice(barberId, serviceId, customPrice);
      setEditingService(null);
      loadData();
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Error actualizando precio');
    }
  };

  const openAssignServiceModal = async (barber: any) => {
    try {
      setSelectedBarberForService(barber);
      const available = await getAvailableServicesForBarber(barber.id);
      setAvailableServices(available);
      setShowAssignServiceModal(true);
    } catch (error) {
      console.error('Error loading available services:', error);
      alert('Error cargando servicios disponibles');
    }
  };

  const getServicePrice = (barberService: any) => {
    return barberService.custom_price || barberService.service.price;
  };

  // 3. AGREGAR ESTAS FUNCIONES DESPUÉS DE handleCreateService:
const handleUpdateService = async (serviceId: number, updates: any) => {
  try {
    await updateService(serviceId, updates);
    setEditingGlobalService(null);
    loadData();
  } catch (error) {
    console.error('Error updating service:', error);
    alert('Error actualizando servicio');
  }
};

const handleDeleteService = async () => {
  if (!serviceToDelete) return;
  
  try {
    await deleteService(serviceToDelete.id);
    setShowDeleteServiceModal(false);
    setServiceToDelete(null);
    loadData();
  } catch (error) {
    console.error('Error deleting service:', error);
    alert('Error eliminando servicio');
  }
};

const openDeleteServiceModal = (service: any) => {
  setServiceToDelete(service);
  setShowDeleteServiceModal(true);
};

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Peluqueros</h2>
          <p className="text-gray-600">Administra peluqueros, servicios y precios</p>
        </div>
        
        <div className="flex gap-2">
          {/* Botón Nuevo Servicio */}
          <Dialog open={showNewServiceModal} onOpenChange={setShowNewServiceModal}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Servicio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Servicio</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nombre del Servicio *</Label>
                  <Input
                    value={newServiceForm.name}
                    onChange={(e) => setNewServiceForm({...newServiceForm, name: e.target.value})}
                    placeholder="Ej: Corte de pelo, Barba, Color"
                  />
                </div>
                <div>
                  <Label>Duración (minutos) *</Label>
                  <Input
                    type="number"
                    value={newServiceForm.duration}
                    onChange={(e) => setNewServiceForm({...newServiceForm, duration: e.target.value})}
                    placeholder="Ej: 30, 45, 60"
                  />
                </div>
                <div>
                  <Label>Precio *</Label>
                  <Input
                    type="number"
                    value={newServiceForm.price}
                    onChange={(e) => setNewServiceForm({...newServiceForm, price: e.target.value})}
                    placeholder="Ej: 3500, 4500, 6000"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleCreateService} className="bg-green-600 hover:bg-green-700">
                  Crear Servicio
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Botón Nuevo Peluquero */}
          <Dialog open={showNewBarberModal} onOpenChange={setShowNewBarberModal}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Peluquero
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Peluquero</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nombre *</Label>
                  <Input
                    value={newBarberForm.name}
                    onChange={(e) => setNewBarberForm({...newBarberForm, name: e.target.value})}
                    placeholder="Nombre del peluquero"
                  />
                </div>
                <div>
                  <Label>Emoji</Label>
                  <Input
                    value={newBarberForm.emoji}
                    onChange={(e) => setNewBarberForm({...newBarberForm, emoji: e.target.value})}
                    placeholder="👨‍🦱"
                  />
                </div>
                <div>
                  <Label>Especialidad</Label>
                  <Input
                    value={newBarberForm.specialty}
                    onChange={(e) => setNewBarberForm({...newBarberForm, specialty: e.target.value})}
                    placeholder="Ej: Cortes modernos, Barbería clásica"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleCreateBarber}>Crear Peluquero</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de Servicios Disponibles */}
      {/* Lista de Servicios Disponibles */}
<div className="bg-white rounded-lg shadow-sm border p-6">
  <h3 className="text-lg font-bold text-gray-900 mb-4">
    Servicios Disponibles ({allServices.length})
  </h3>
  <div className="grid gap-3">
    {allServices.map((service) => (
      <div key={service.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center gap-3 flex-1">
          <Scissors className="h-4 w-4 text-gray-600" />
          <div className="flex-1">
            {editingGlobalService === service.id ? (
              <div className="grid grid-cols-3 gap-2">
                <Input
                  defaultValue={service.name}
                  placeholder="Nombre"
                  onBlur={(e) => handleUpdateService(service.id, { name: e.target.value })}
                />
                <Input
                  type="number"
                  defaultValue={service.duration}
                  placeholder="Duración"
                  onBlur={(e) => handleUpdateService(service.id, { duration: parseInt(e.target.value) })}
                />
                <Input
                  type="number"
                  defaultValue={service.price}
                  placeholder="Precio"
                  onBlur={(e) => handleUpdateService(service.id, { price: parseInt(e.target.value) })}
                />
              </div>
            ) : (
              <div>
                <span className="font-medium">{service.name}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({service.duration} min)
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {editingGlobalService === service.id ? (
            <Button
              size="sm"
              onClick={() => setEditingGlobalService(null)}
              variant="outline"
            >
              <Check className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <span className="font-semibold text-green-600 mr-2">
                ${service.price.toLocaleString()}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingGlobalService(service.id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
  size="sm"
  variant="outline"
  onClick={() => openDeleteServiceModal(service)}
  className="text-red-600 hover:bg-red-50"
>
  <Trash2 className="h-4 w-4" />
</Button>
            </>
          )}
        </div>
      </div>
    ))}
  </div>
</div>

      {/* Lista de Peluqueros */}
      <div className="grid gap-6">
        {barbers.map((barber) => (
          <div key={barber.id} className="bg-white rounded-lg shadow-sm border p-6">
            {/* Info del peluquero */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{barber.emoji}</span>
                <div>
                  {editingBarber === barber.id ? (
                    <div className="flex gap-2">
                      <Input
                        defaultValue={barber.name}
                        className="w-40"
                        onBlur={(e) => handleUpdateBarber(barber.id, { name: e.target.value })}
                      />
                      <Button
                        size="sm"
                        onClick={() => setEditingBarber(null)}
                        variant="outline"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <h3 className="text-xl font-bold text-gray-900">{barber.name}</h3>
                  )}
                  <p className="text-sm text-gray-600">{barber.specialty}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingBarber(barber.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openAssignServiceModal(barber)}
                >
                  <Plus className="h-4 w-4" />
                  Servicio
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteBarber(barber.id, barber.name)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Servicios del peluquero */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Servicios ({barber.barber_services?.filter((bs: any) => bs.active).length || 0})
              </h4>
              
              {barber.barber_services?.filter((bs: any) => bs.active).length === 0 ? (
                <p className="text-gray-500 text-sm">No tiene servicios asignados</p>
              ) : (
                <div className="grid gap-3">
                  {barber.barber_services
                    ?.filter((bs: any) => bs.active)
                    .map((barberService: any) => (
                    <div key={barberService.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Scissors className="h-4 w-4 text-gray-600" />
                        <div>
                          <span className="font-medium">{barberService.service.name}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({barberService.service.duration} min)
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {editingService === `${barber.id}-${barberService.service.id}` ? (
                          <div className="flex gap-1">
                            <Input
                              type="number"
                              defaultValue={getServicePrice(barberService)}
                              className="w-24"
                              onBlur={(e) => handleUpdateServicePrice(
                                barber.id, 
                                barberService.service.id, 
                                e.target.value
                              )}
                            />
                            <Button
                              size="sm"
                              onClick={() => setEditingService(null)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingService(`${barber.id}-${barberService.service.id}`)}
                              className="text-right hover:bg-white p-1 rounded"
                            >
                              <span className="font-semibold text-green-600">
                                ${getServicePrice(barberService).toLocaleString()}
                              </span>
                              {barberService.custom_price && (
                                <span className="text-xs text-blue-600 ml-1">(personalizado)</span>
                              )}
                            </button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveService(barber.id, barberService.service.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Asignar Servicio */}
      <Dialog open={showAssignServiceModal} onOpenChange={setShowAssignServiceModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Asignar Servicio a {selectedBarberForService?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Servicio *</Label>
              <select
                value={assignServiceForm.serviceId}
                onChange={(e) => setAssignServiceForm({...assignServiceForm, serviceId: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">Seleccionar servicio</option>
                {availableServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - ${service.price.toLocaleString()} ({service.duration} min)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Precio Personalizado (opcional)</Label>
              <Input
                type="number"
                value={assignServiceForm.customPrice}
                onChange={(e) => setAssignServiceForm({...assignServiceForm, customPrice: e.target.value})}
                placeholder="Dejar vacío para usar precio base"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleAssignService}>Asignar Servicio</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
{/* Modal Confirmar Eliminación de Servicio */}
<Dialog open={showDeleteServiceModal} onOpenChange={setShowDeleteServiceModal}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Eliminar Servicio</DialogTitle>
    </DialogHeader>
    <div className="py-4">
      <p className="text-gray-600">
        ¿Estás seguro de que quieres eliminar el servicio{' '}
        <span className="font-semibold">&quot;{serviceToDelete?.name}&quot;</span>?
      </p>
      <p className="text-sm text-red-600 mt-2">
        ⚠️ Esto eliminará el servicio de todos los peluqueros que lo tengan asignado.
      </p>
    </div>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancelar</Button>
      </DialogClose>
      <Button 
        onClick={handleDeleteService}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        Eliminar Servicio
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
};

export default BarberManagementPanel;