import {
  CrashReport,
  Delivery,
  ResidentialAddress,
  ServiceBooking,
  SlotRequest } from
'../types';

const day = 86400000;
const hour = 3600000;

export interface TestingCentre {
  id: string;
  name: string;
  area: string;
  /** Days until the first open slot. */
  nextSlot: number;
}

export const testingCentres: TestingCentre[] = [
{
  id: 'tc_1',
  name: 'Randburg Licensing Department',
  area: 'Randburg, Gauteng',
  nextSlot: 6
},
{
  id: 'tc_2',
  name: 'Sandton Licensing Centre',
  area: 'Sandton, Gauteng',
  nextSlot: 12
},
{
  id: 'tc_3',
  name: 'Gallows Hill Traffic Department',
  area: 'Green Point, Cape Town',
  nextSlot: 3
},
{
  id: 'tc_4',
  name: 'Pinetown Licensing Office',
  area: 'Pinetown, KwaZulu-Natal',
  nextSlot: 9
}];


export const appointmentTimes = ['08:00', '09:30', '11:00', '13:30', '15:00'];

export const learnerCodes = [
{ id: '1', label: 'Code 1', description: 'Motorcycles, scooters' },
{ id: '2', label: 'Code 2', description: 'Light motor vehicles' },
{ id: '3', label: 'Code 3', description: 'Heavy motor vehicles' }];


export const drivingCodes = [
{ id: 'A1', label: 'A1', description: 'Motorcycle up to 125cc' },
{ id: 'A', label: 'A', description: 'Motorcycle above 125cc' },
{ id: 'B', label: 'B', description: 'Light vehicle up to 3 500kg' },
{ id: 'EB', label: 'EB', description: 'Light vehicle with trailer' },
{ id: 'C1', label: 'C1', description: 'Heavy vehicle 3 500–16 000kg' },
{ id: 'EC1', label: 'EC1', description: 'Heavy articulated vehicle' }];


export const prdpCategories = [
{ id: 'G', label: 'Category G', description: 'Goods — trucks and delivery' },
{ id: 'P', label: 'Category P', description: 'Passengers — taxis, buses, e-hailing' },
{ id: 'D', label: 'Category D', description: 'Dangerous goods (includes G and P)' }];


export const provinces = [
'Eastern Cape',
'Free State',
'Gauteng',
'KwaZulu-Natal',
'Limpopo',
'Mpumalanga',
'North West',
'Northern Cape',
'Western Cape'];


export const mockAddress: ResidentialAddress = {
  street: '14 Jan Smuts Avenue',
  suburb: 'Parktown North',
  city: 'Johannesburg',
  province: 'Gauteng',
  postalCode: '2193',
  updatedAt: new Date(Date.now() - 420 * day).toISOString(),
  natisStatus: 'synced'
};

export const mockDeliveries: Delivery[] = [
{
  id: 'del_seed_1',
  item: 'licence-disc',
  label: 'Licence disc — GP 789-012',
  reference: 'GP-DC-448120',
  vehicleId: 'veh_2',
  method: 'registered',
  carrier: 'SA Post Office',
  trackingNumber: 'RR482913775ZA',
  fee: 72,
  address: mockAddress,
  status: 'in-transit',
  createdAt: new Date(Date.now() - 3 * day).toISOString(),
  estimatedDelivery: new Date(Date.now() + 2 * day).toISOString(),
  events: [
  {
    status: 'processing',
    timestamp: new Date(Date.now() - 3 * day).toISOString(),
    note: 'Printed and being packed by the licensing authority.'
  },
  {
    status: 'dispatched',
    timestamp: new Date(Date.now() - 2 * day).toISOString(),
    note: 'Handed to the carrier.'
  },
  {
    status: 'in-transit',
    timestamp: new Date(Date.now() - 1 * day).toISOString(),
    note: 'Arrived at Witspos Mail Centre, Johannesburg.'
  }]

}];


export const mockSlotRequests: SlotRequest[] = [
{
  id: 'slot_seed_1',
  service: 'prdp',
  preferredArea: 'Randburg, Gauteng',
  status: 'offered',
  registeredAt: new Date(Date.now() - 11 * day).toISOString(),
  offer: {
    centreId: 'tc_1',
    centre: 'Randburg Licensing Department',
    appointmentAt: new Date(
      new Date(Date.now() + 8 * day).setHours(9, 30, 0, 0)
    ).toISOString(),
    expiresAt: new Date(Date.now() + 17 * hour + 40 * 60000).toISOString()
  }
}];


export const mockBookings: ServiceBooking[] = [
{
  id: 'bk_seed_1',
  service: 'driving-test',
  licenceCode: 'EB',
  centreId: 'tc_2',
  centre: 'Sandton Licensing Centre',
  appointmentAt: new Date(
    new Date(Date.now() + 15 * day).setHours(11, 0, 0, 0)
  ).toISOString(),
  status: 'confirmed',
  fee: 250,
  receiptNumber: 'BKG-SEED-4471',
  createdAt: new Date(Date.now() - 6 * day).toISOString(),
  rescheduleCount: 0,
  source: 'direct'
}];


export const mockCrashReports: CrashReport[] = [
{
  id: 'crash_seed_1',
  referenceNumber: 'ACR20419385',
  vehicleId: 'veh_1',
  licensePlate: 'CA 123-456',
  occurredAt: new Date(Date.now() - 64 * day).toISOString(),
  location: 'Parking lot, Rosebank Mall, Johannesburg',
  description:
  'Other vehicle reversed out of a bay into my rear bumper while I was stationary. Minor dent and scratched paint.',
  otherParty: {
    name: 'P. van der Merwe',
    phone: '082 555 0192',
    licensePlate: 'JHB 44 GP',
    insurer: 'OUTsurance'
  },
  photoCount: 4,
  status: 'recorded',
  submittedAt: new Date(Date.now() - 64 * day).toISOString(),
  copyPurchased: true
}];