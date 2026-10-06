import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAppStore } from '../../stores/useAppStore';
import { Vehicle } from '../../types';
import { toast } from 'sonner';
interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
}
export function AddVehicleModal({
  isOpen,
  onClose,
  vehicle
}: AddVehicleModalProps) {
  const { state, dispatch } = useAppStore();
  const isEditing = !!vehicle;
  const emptyForm = {
    licensePlate: '',
    vin: '',
    make: '',
    model: '',
    year: new Date().getFullYear().toString(),
    color: '',
    tareWeight: '1000',
    engineNumber: ''
  };
  const [formData, setFormData] = useState(emptyForm);
  useEffect(() => {
    if (vehicle) {
      setFormData({
        licensePlate: vehicle.licensePlate,
        vin: vehicle.vin,
        make: vehicle.make,
        model: vehicle.model,
        year: String(vehicle.year),
        color: vehicle.color,
        tareWeight: String(vehicle.tareWeight || 1000),
        engineNumber: vehicle.engineNumber || ''
      });
    } else {
      setFormData(emptyForm);
    }
  }, [vehicle, isOpen]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && vehicle) {
      const updated: Vehicle = {
        ...vehicle,
        licensePlate: formData.licensePlate,
        vin: formData.vin,
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year) || new Date().getFullYear(),
        color: formData.color,
        tareWeight: parseInt(formData.tareWeight) || 1000,
        engineNumber: formData.engineNumber
      };
      dispatch({
        type: 'EDIT_VEHICLE',
        payload: updated
      });
      toast.success('Vehicle updated');
    } else {
      const newVehicle: Vehicle = {
        id: `veh_${Date.now()}`,
        userId: state.user?.id || 'unknown',
        licensePlate: formData.licensePlate,
        vin: formData.vin,
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year) || new Date().getFullYear(),
        color: formData.color,
        tareWeight: parseInt(formData.tareWeight) || 1000,
        engineNumber: formData.engineNumber,
        licenseDiscStatus: 'expired'
      };
      dispatch({
        type: 'ADD_VEHICLE',
        payload: newVehicle
      });
      toast.success('Vehicle added');
    }
    onClose();
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Vehicle' : 'Add Vehicle'}
      maxWidth="md">
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="License Plate"
          placeholder="e.g. CA 123-456 or GP 789-012"
          value={formData.licensePlate}
          onChange={(e) =>
          setFormData({
            ...formData,
            licensePlate: e.target.value.toUpperCase()
          })
          }
          required />
        

        <Input
          label="VIN (Vehicle Identification Number)"
          placeholder="17 character VIN"
          value={formData.vin}
          onChange={(e) =>
          setFormData({
            ...formData,
            vin: e.target.value.toUpperCase()
          })
          }
          maxLength={17} />
        

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Make"
            placeholder="e.g. Toyota"
            value={formData.make}
            onChange={(e) =>
            setFormData({
              ...formData,
              make: e.target.value
            })
            }
            required />
          
          <Input
            label="Model"
            placeholder="e.g. Hilux"
            value={formData.model}
            onChange={(e) =>
            setFormData({
              ...formData,
              model: e.target.value
            })
            }
            required />
          
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Year"
            type="number"
            min="1990"
            max={new Date().getFullYear() + 1}
            value={formData.year}
            onChange={(e) =>
            setFormData({
              ...formData,
              year: e.target.value
            })
            }
            required />
          
          <Input
            label="Color"
            placeholder="e.g. White"
            value={formData.color}
            onChange={(e) =>
            setFormData({
              ...formData,
              color: e.target.value
            })
            }
            required />
          
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Tare Weight (kg)"
            type="number"
            min="100"
            max="5000"
            placeholder="e.g. 1050"
            value={formData.tareWeight}
            onChange={(e) =>
            setFormData({
              ...formData,
              tareWeight: e.target.value
            })
            }
            helperText="Used for license fee calculation" />
          
          <Input
            label="Engine Number"
            placeholder="Optional"
            value={formData.engineNumber}
            onChange={(e) =>
            setFormData({
              ...formData,
              engineNumber: e.target.value
            })
            } />
          
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1">
            
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            {isEditing ? 'Save Changes' : 'Add Vehicle'}
          </Button>
        </div>
      </form>
    </Modal>);

}