import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/useAppStore';
import { PageHeader } from '../components/layout/PageHeader';
import { VehicleCard } from '../components/cards/VehicleCard';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { AddVehicleModal } from '../components/modals/AddVehicleModal';
import { Vehicle } from '../types';
import { PlusIcon, CarIcon } from 'lucide-react';
import { toast } from 'sonner';

export function VehiclesPage() {
  const { state, dispatch } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const handleAdd = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  /** Opens the fines list scoped to this vehicle's plate. */
  const handleViewFines = (vehicle: Vehicle) => {
    dispatch({
      type: 'SET_FINE_VEHICLE_FILTER',
      payload: vehicle.licensePlate
    });
    dispatch({
      type: 'SET_TAB',
      payload: 'fines'
    });
  };

  const handleViewDetail = (vehicle: Vehicle) => {
    dispatch({
      type: 'SET_ACTIVE_VEHICLE',
      payload: vehicle.id
    });
    dispatch({
      type: 'SET_TAB',
      payload: 'vehicle-detail'
    });
  };

  const handleDelete = (vehicle: Vehicle) => {
    if (
    window.confirm(`Remove ${vehicle.licensePlate}? This cannot be undone.`))
    {
      dispatch({
        type: 'REMOVE_VEHICLE',
        payload: vehicle.id
      });
      toast.success('Vehicle removed');
    }
  };

  const containerVariants = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6">
      
      <PageHeader
        title="My Vehicles"
        description="Every vehicle registered to you, with its fines, disc status and paperwork."
        actions={
        <Button
          variant="primary"
          leftIcon={<PlusIcon className="w-4 h-4" />}
          onClick={handleAdd}>
          
            <span className="hidden sm:inline">Add Vehicle</span>
            <span className="sm:hidden">Add</span>
          </Button>
        } />
      

      {state.vehicles.length === 0 ?
      <EmptyState
        icon={<CarIcon className="w-8 h-8" />}
        title="No vehicles found"
        description="Add your first vehicle to start tracking and managing fines."
        actionLabel="Add Vehicle"
        onAction={handleAdd} /> :


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.vehicles.map((vehicle) =>
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          fineCount={
          state.fines.filter(
            (f) =>
            f.vehicleId === vehicle.id && (
            f.status === 'pending' || f.status === 'overdue')
          ).length
          }
          onDelete={handleDelete}
          onEdit={handleEdit}
          onViewFines={handleViewFines}
          onViewDetail={handleViewDetail} />

        )}
        </div>
      }

      <AddVehicleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVehicle(null);
        }}
        vehicle={editingVehicle} />
      
    </motion.div>);

}