import {
  User,
  Vehicle,
  Fine,
  Notification,
  AIAnalysis,
  DisputeLifecycle,
  CameraHotspot,
  RiskProfile,
  LicenseDiscApplication,
  PaymentRecord,
  VaultDocument,
  DriverLicence } from
'../types';

export const mockUser: User = {
  id: 'usr_12345',
  name: 'Thabo Mokoena',
  email: 'thabo.m@example.co.za',
  phone: '082 555 1234',
  idNumber: '8505125009087'
};

export const mockVehicles: Vehicle[] = [
{
  id: 'veh_1',
  licensePlate: 'CA 123-456',
  vin: 'ZA9876543210XYZ',
  make: 'Volkswagen',
  model: 'Polo',
  year: 2019,
  color: 'White',
  userId: 'usr_12345',
  tareWeight: 1050,
  engineNumber: 'CWVA123456',
  licenseDiscExpiry: new Date(
    Date.now() + 18 * 24 * 60 * 60 * 1000
  ).toISOString(),
  licenseDiscStatus: 'expiring'
},
{
  id: 'veh_2',
  licensePlate: 'GP 789-012',
  vin: 'ZA1234567890ABC',
  make: 'Toyota',
  model: 'Hilux',
  year: 2021,
  color: 'Silver',
  userId: 'usr_12345',
  tareWeight: 1985,
  engineNumber: '2GDFTV998877',
  licenseDiscExpiry: new Date(
    Date.now() + 240 * 24 * 60 * 60 * 1000
  ).toISOString(),
  licenseDiscStatus: 'valid'
}];


export const mockFines: Fine[] = [
{
  id: 'fine_1',
  vehicleId: 'veh_1',
  licensePlate: 'CA 123-456',
  offenceType: 'Speeding',
  offenceDescription: 'Exceeding speed limit by 21-25 km/h in a 60 km/h zone',
  amount: 1500,
  status: 'pending',
  issuedBy: 'Cape Town Metro Police',
  issuedDate: '2023-10-15T08:30:00Z',
  dueDate: '2023-11-15T23:59:59Z',
  location: 'M3 Southbound, Newlands',
  referenceNumber: 'CTMP-2023-88472',
  lat: -33.9635,
  lng: 18.4686
},
{
  id: 'fine_2',
  vehicleId: 'veh_2',
  licensePlate: 'GP 789-012',
  offenceType: 'Expired License Disc',
  offenceDescription:
  'Operating a motor vehicle with an expired clearance certificate',
  amount: 1000,
  status: 'pending',
  issuedBy: 'JMPD',
  issuedDate: '2023-10-20T14:15:00Z',
  dueDate: '2023-11-20T23:59:59Z',
  location: 'N1 North, Midrand',
  referenceNumber: 'JMPD-2023-99211',
  lat: -25.9892,
  lng: 28.1268
},
{
  id: 'fine_3',
  vehicleId: 'veh_1',
  licensePlate: 'CA 123-456',
  offenceType: 'Illegal Parking',
  offenceDescription: 'Parking in a loading zone',
  amount: 500,
  status: 'paid',
  issuedBy: 'Cape Town Metro Police',
  issuedDate: '2023-09-05T10:00:00Z',
  dueDate: '2023-10-05T23:59:59Z',
  location: 'Bree Street, CBD',
  referenceNumber: 'CTMP-2023-77321',
  lat: -33.9249,
  lng: 18.4241
},
{
  id: 'fine_4',
  vehicleId: 'veh_2',
  licensePlate: 'GP 789-012',
  offenceType: 'Red Light Violation',
  offenceDescription: 'Failure to comply with traffic signal',
  amount: 2000,
  status: 'disputed',
  issuedBy: 'JMPD',
  issuedDate: '2023-10-01T18:45:00Z',
  dueDate: '2023-11-01T23:59:59Z',
  location: 'William Nicol Dr & Republic Rd',
  referenceNumber: 'JMPD-2023-66102',
  lat: -26.0614,
  lng: 28.0106
},
{
  id: 'fine_5',
  vehicleId: 'veh_1',
  licensePlate: 'CA 123-456',
  offenceType: 'Using Mobile Phone',
  offenceDescription: 'Using a cellular or mobile telephone while driving',
  amount: 2500,
  status: 'pending',
  issuedBy: 'Cape Town Metro Police',
  issuedDate: '2023-10-25T09:20:00Z',
  dueDate: '2023-11-25T23:59:59Z',
  location: 'N2 Outbound, Hospital Bend',
  referenceNumber: 'CTMP-2023-55984',
  lat: -33.9416,
  lng: 18.4509
},
{
  id: 'fine_6',
  vehicleId: 'veh_1',
  licensePlate: 'CA 123-456',
  offenceType: 'No Seatbelt',
  offenceDescription: 'Driving a motor vehicle without wearing a seatbelt',
  amount: 750,
  status: 'pending',
  issuedBy: 'eThekwini Metro Police',
  issuedDate: '2023-11-05T10:30:00Z',
  dueDate: '2023-12-05T23:59:59Z',
  location: 'M4 Northbound, Durban',
  referenceNumber: 'EMP-2023-11223',
  lat: -29.8587,
  lng: 31.0218
},
{
  id: 'fine_7',
  vehicleId: 'veh_2',
  licensePlate: 'GP 789-012',
  offenceType: 'Speeding',
  offenceDescription:
  'Exceeding speed limit by 31-35 km/h in a 120 km/h zone',
  amount: 3000,
  status: 'paid',
  issuedBy: 'JMPD',
  issuedDate: '2023-08-12T14:45:00Z',
  dueDate: '2023-09-12T23:59:59Z',
  location: 'N1 South, Sandton',
  referenceNumber: 'JMPD-2023-44556',
  lat: -26.1076,
  lng: 28.0567
},
{
  id: 'fine_8',
  vehicleId: 'veh_1',
  licensePlate: 'CA 123-456',
  offenceType: 'Disobeying Road Sign',
  offenceDescription: 'Failure to stop at a stop sign',
  amount: 1250,
  status: 'pending',
  issuedBy: 'Cape Town Metro Police',
  issuedDate: '2023-11-10T08:15:00Z',
  dueDate: '2023-12-10T23:59:59Z',
  location: 'Main Rd & Victoria Rd, Woodstock',
  referenceNumber: 'CTMP-2023-99887',
  lat: -33.9062,
  lng: 18.4166
},
{
  id: 'fine_9',
  vehicleId: 'veh_2',
  licensePlate: 'GP 789-012',
  offenceType: 'Reckless Driving',
  offenceDescription: 'Driving a motor vehicle recklessly or negligently',
  amount: 5000,
  status: 'disputed',
  issuedBy: 'JMPD',
  issuedDate: '2023-09-20T16:20:00Z',
  dueDate: '2023-10-20T23:59:59Z',
  location: 'M1 South, Johannesburg',
  referenceNumber: 'JMPD-2023-33221',
  lat: -26.2041,
  lng: 28.0473
},
{
  id: 'fine_10',
  vehicleId: 'veh_1',
  licensePlate: 'CA 123-456',
  offenceType: 'Expired License Disc',
  offenceDescription:
  'Operating a motor vehicle with an expired clearance certificate',
  amount: 1500,
  status: 'pending',
  issuedBy: 'eThekwini Metro Police',
  issuedDate: '2023-11-15T11:00:00Z',
  dueDate: '2023-12-15T23:59:59Z',
  location: 'N3 Westbound, Pinetown',
  referenceNumber: 'EMP-2023-55667',
  lat: -29.7894,
  lng: 30.9832
}];


export const mockNotifications: Notification[] = [
{
  id: 'notif_1',
  title: 'New Fine Issued',
  message: 'A new fine of R2,500 has been issued for CA 123-456.',
  type: 'fine',
  read: false,
  createdAt: '2023-10-25T10:00:00Z',
  fineId: 'fine_5',
  linkTab: 'fine-detail'
},
{
  id: 'notif_2',
  title: 'Payment Successful',
  message: 'Your payment of R500 for fine CTMP-2023-77321 was successful.',
  type: 'payment',
  read: true,
  createdAt: '2023-09-10T14:30:00Z',
  fineId: 'fine_3',
  linkTab: 'payments'
},
{
  id: 'notif_3',
  title: 'Dispute Under Review',
  message:
  'Your dispute for fine JMPD-2023-66102 has been received and is under review.',
  type: 'dispute',
  read: true,
  createdAt: '2023-10-05T09:15:00Z',
  fineId: 'fine_4',
  linkTab: 'dispute'
},
{
  id: 'notif_4',
  title: 'Deadline Approaching',
  message:
  'Fine CTMP-2023-88472 is due in 3 days. Pay now to avoid penalties.',
  type: 'deadline',
  read: false,
  createdAt: '2023-11-12T08:00:00Z',
  fineId: 'fine_1',
  linkTab: 'fine-detail'
},
{
  id: 'notif_5',
  title: 'New Fine Issued',
  message: 'A new fine of R1,250 has been issued for CA 123-456.',
  type: 'fine',
  read: false,
  createdAt: '2023-11-10T09:00:00Z',
  fineId: 'fine_8',
  linkTab: 'fine-detail'
},
{
  id: 'notif_6',
  title: 'Dispute Hearing Scheduled',
  message:
  'A hearing for dispute JMPD-2023-33221 has been scheduled for 2023-12-01.',
  type: 'dispute',
  read: false,
  createdAt: '2023-11-01T10:00:00Z',
  fineId: 'fine_9',
  linkTab: 'dispute'
},
{
  id: 'notif_7',
  title: "Driver's Licence Expiring",
  message:
  'Your driving licence card expires in under 90 days. Book a renewal appointment now.',
  type: 'licence',
  read: false,
  createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  linkTab: 'driver-licence'
}];


export const mockAIAnalyses: Record<string, AIAnalysis> = {
  fine_1: {
    fineId: 'fine_1',
    successProbability: 82,
    recommendation: 'dispute',
    reasons: [
    'Camera calibration certificate likely expired',
    'Notice served outside of 32-day AARTO requirement',
    'Incomplete location description'],

    estimatedSavings: 1500,
    riskLevel: 'low'
  },
  fine_2: {
    fineId: 'fine_2',
    successProbability: 15,
    recommendation: 'pay',
    reasons: [
    'Clear photographic evidence available',
    'System records confirm expired disc',
    'Procedurally correct issuance'],

    estimatedSavings: 0,
    riskLevel: 'high'
  },
  fine_5: {
    fineId: 'fine_5',
    successProbability: 65,
    recommendation: 'dispute',
    reasons: [
    'Officer badge number missing from notice',
    'Contradictory time logs in system'],

    estimatedSavings: 2500,
    riskLevel: 'medium'
  },
  fine_6: {
    fineId: 'fine_6',
    successProbability: 40,
    recommendation: 'pay',
    reasons: [
    'Photographic evidence clearly shows no seatbelt',
    'Standard enforcement procedure followed'],

    estimatedSavings: 0,
    riskLevel: 'high'
  },
  fine_8: {
    fineId: 'fine_8',
    successProbability: 75,
    recommendation: 'dispute',
    reasons: [
    'Road sign visibility obscured by foliage',
    'Inconsistent enforcement at this intersection'],

    estimatedSavings: 1250,
    riskLevel: 'low'
  },
  fine_10: {
    fineId: 'fine_10',
    successProbability: 20,
    recommendation: 'pay',
    reasons: [
    'eNaTIS records confirm expired status',
    'No grace period applicable'],

    estimatedSavings: 0,
    riskLevel: 'high'
  }
};

export const mockDisputeLifecycles: DisputeLifecycle[] = [
{
  disputeId: 'disp_1',
  fineId: 'fine_4',
  currentStage: 'under_review',
  blockchainHash:
  'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2',
  submittedAt: '2023-10-02T10:00:00Z',
  estimatedResolution: '2023-11-15T00:00:00Z',
  events: [
  {
    id: 'evt_1',
    stage: 'submitted',
    title: 'Dispute Submitted',
    description: 'Representation securely lodged with JMPD.',
    timestamp: '2023-10-02T10:00:00Z',
    isComplete: true
  },
  {
    id: 'evt_2',
    stage: 'acknowledged',
    title: 'Acknowledged by Authority',
    description: 'JMPD has received and registered your representation.',
    timestamp: '2023-10-05T09:15:00Z',
    isComplete: true
  },
  {
    id: 'evt_3',
    stage: 'under_review',
    title: 'Under Review',
    description:
    'Representation is currently being reviewed by an AARTO representations officer.',
    timestamp: '2023-10-10T14:30:00Z',
    isComplete: false
  },
  {
    id: 'evt_4',
    stage: 'resolved',
    title: 'Resolution',
    description: 'Awaiting final decision.',
    timestamp: '',
    isComplete: false
  }]

},
{
  disputeId: 'disp_2',
  fineId: 'fine_9',
  currentStage: 'hearing_scheduled',
  blockchainHash:
  'f2e1d0c9b8a7z6y5x4w3v2u1t0s9r8q7p6o5n4m3l2k1j0i9h8g7f6e5d4c3b2a1',
  submittedAt: '2023-09-25T11:00:00Z',
  estimatedResolution: '2023-12-01T00:00:00Z',
  events: [
  {
    id: 'evt_5',
    stage: 'submitted',
    title: 'Dispute Submitted',
    description: 'Representation securely lodged with JMPD.',
    timestamp: '2023-09-25T11:00:00Z',
    isComplete: true
  },
  {
    id: 'evt_6',
    stage: 'acknowledged',
    title: 'Acknowledged by Authority',
    description: 'JMPD has received and registered your representation.',
    timestamp: '2023-09-28T10:00:00Z',
    isComplete: true
  },
  {
    id: 'evt_7',
    stage: 'under_review',
    title: 'Under Review',
    description:
    'Representation reviewed by an AARTO representations officer.',
    timestamp: '2023-10-15T09:00:00Z',
    isComplete: true
  },
  {
    id: 'evt_8',
    stage: 'hearing_scheduled',
    title: 'Hearing Scheduled',
    description: 'A hearing has been scheduled for 2023-12-01.',
    timestamp: '2023-11-01T10:00:00Z',
    isComplete: false
  },
  {
    id: 'evt_9',
    stage: 'resolved',
    title: 'Resolution',
    description: 'Awaiting final decision from hearing.',
    timestamp: '',
    isComplete: false
  }]

}];


export const mockCameraHotspots: CameraHotspot[] = [
{
  id: 'hs_1',
  lat: -26.0614,
  lng: 28.0106,
  name: 'William Nicol Dr, Sandton',
  disputeRate: 45,
  totalFines: 1250,
  avgAmount: 1500
},
{
  id: 'hs_2',
  lat: -25.9892,
  lng: 28.1268,
  name: 'N1 North, Midrand',
  disputeRate: 30,
  totalFines: 3400,
  avgAmount: 2000
},
{
  id: 'hs_3',
  lat: -33.9635,
  lng: 18.4686,
  name: 'M3 Southbound, Newlands',
  disputeRate: 60,
  totalFines: 850,
  avgAmount: 1000
},
{
  id: 'hs_4',
  lat: -33.9416,
  lng: 18.4509,
  name: 'N2 Outbound, Hospital Bend',
  disputeRate: 25,
  totalFines: 2100,
  avgAmount: 2500
},
{
  id: 'hs_5',
  lat: -29.8587,
  lng: 31.0218,
  name: 'M4 Northbound, Durban',
  disputeRate: 15,
  totalFines: 920,
  avgAmount: 750
},
{
  id: 'hs_6',
  lat: -26.1076,
  lng: 28.2567,
  name: 'R21 South, Kempton Park',
  disputeRate: 50,
  totalFines: 1800,
  avgAmount: 3000
},
{
  id: 'hs_7',
  lat: -26.1894,
  lng: 28.3132,
  name: 'N12 East, Benoni',
  disputeRate: 35,
  totalFines: 1100,
  avgAmount: 1250
},
{
  id: 'hs_8',
  lat: -26.2041,
  lng: 28.0473,
  name: 'M1 South, Johannesburg',
  disputeRate: 40,
  totalFines: 2750,
  avgAmount: 1800
}];


export const mockRiskProfile: RiskProfile = {
  overallScore: 62,
  level: 'moderate',
  lastUpdated: new Date().toISOString(),
  factors: [
  {
    label: 'Speeding History',
    score: 75,
    description: 'Frequent speeding fines in 60km/h zones.',
    icon: 'ZapIcon'
  },
  {
    label: 'High-Risk Routes',
    score: 58,
    description: 'Regular travel on N1 Midrand and M3 Newlands.',
    icon: 'MapPinIcon'
  },
  {
    label: 'Time Patterns',
    score: 70,
    description:
    'High activity during peak enforcement hours (7am-9am, 4pm-6pm).',
    icon: 'ClockIcon'
  },
  {
    label: 'Vehicle Profile',
    score: 45,
    description: 'Standard risk profile for registered vehicles.',
    icon: 'CarIcon'
  }],

  predictions: [
  'You are 3× more likely to be fined on N1 Midrand on Fridays after 7 PM.',
  'High probability of camera enforcement on M3 Southbound during morning commute.']

};

export const mockLicenseApplications: LicenseDiscApplication[] = [
{
  id: 'lic_app_1',
  vehicleId: 'veh_2',
  licensePlate: 'GP 789-012',
  applicationType: 'renewal',
  baseFee: 696,
  arrearFee: 0,
  adminFee: 72,
  totalAmount: 768,
  status: 'issued',
  createdAt: new Date(Date.now() - 125 * 24 * 60 * 60 * 1000).toISOString(),
  paidAt: new Date(Date.now() - 125 * 24 * 60 * 60 * 1000).toISOString(),
  validFrom: new Date(Date.now() - 125 * 24 * 60 * 60 * 1000).toISOString(),
  validUntil: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000).toISOString(),
  receiptNumber: 'TFOS-LIC-220045',
  discNumber: 'GP-DC-887721'
}];


export const mockPayments: PaymentRecord[] = [
{
  id: 'pay_1',
  purpose: 'fine',
  description: 'Illegal Parking — parking in a loading zone',
  reference: 'CTMP-2023-77321',
  receiptNumber: 'RCP-4K8JQ2-7741',
  subtotal: 500,
  discount: 250,
  serviceFee: 15,
  total: 265,
  method: 'instant-eft',
  methodDetail: 'FNB cheque account ···4417',
  paidAt: '2023-09-10T14:28:00Z',
  status: 'succeeded',
  fineId: 'fine_3',
  vehicleId: 'veh_1',
  authority: 'Cape Town Metro Police'
},
{
  id: 'pay_2',
  purpose: 'fine',
  description: 'Speeding — exceeding limit by 31-35 km/h in a 120 km/h zone',
  reference: 'JMPD-2023-44556',
  receiptNumber: 'RCP-3M1PX9-2280',
  subtotal: 3000,
  discount: 0,
  serviceFee: 15,
  total: 3015,
  method: 'card',
  methodDetail: 'Visa ···4242',
  paidAt: '2023-09-08T11:02:00Z',
  status: 'succeeded',
  fineId: 'fine_7',
  vehicleId: 'veh_2',
  authority: 'JMPD'
},
{
  id: 'pay_3',
  purpose: 'licence-disc',
  description: 'Motor vehicle licence disc renewal — GP 789-012',
  reference: 'GP-DC-887721',
  receiptNumber: 'TFOS-LIC-220045',
  subtotal: 768,
  discount: 0,
  serviceFee: 0,
  total: 768,
  method: 'ozow',
  methodDetail: 'Ozow instant EFT · Capitec',
  paidAt: new Date(Date.now() - 125 * 86400000).toISOString(),
  status: 'succeeded',
  vehicleId: 'veh_2',
  authority: 'Gauteng Provincial Licensing'
}];


export const mockDocuments: VaultDocument[] = [
{
  id: 'doc_1',
  name: 'Identity Document (smart card)',
  category: 'identity',
  fileType: 'PDF',
  sizeKb: 2410,
  uploadedAt: '2023-06-14T09:12:00Z',
  verificationStatus: 'verified'
},
{
  id: 'doc_2',
  name: "Driver's Licence Card — front & back",
  category: 'licence',
  fileType: 'JPG',
  sizeKb: 1120,
  uploadedAt: '2023-06-14T09:15:00Z',
  expiresAt: new Date(Date.now() + 72 * 86400000).toISOString(),
  verificationStatus: 'verified'
},
{
  id: 'doc_3',
  name: 'Vehicle Registration Certificate — CA 123-456',
  category: 'vehicle',
  fileType: 'PDF',
  sizeKb: 3540,
  uploadedAt: '2023-08-02T16:40:00Z',
  verificationStatus: 'verified',
  vehicleId: 'veh_1'
},
{
  id: 'doc_4',
  name: 'Roadworthy Certificate — GP 789-012',
  category: 'roadworthy',
  fileType: 'PDF',
  sizeKb: 880,
  uploadedAt: '2023-09-19T11:05:00Z',
  expiresAt: new Date(Date.now() + 18 * 86400000).toISOString(),
  verificationStatus: 'pending',
  vehicleId: 'veh_2'
},
{
  id: 'doc_5',
  name: 'Comprehensive Insurance Schedule',
  category: 'insurance',
  fileType: 'PDF',
  sizeKb: 1990,
  uploadedAt: '2023-10-01T08:30:00Z',
  expiresAt: new Date(Date.now() + 200 * 86400000).toISOString(),
  verificationStatus: 'verified'
}];


export const mockDriverLicence: DriverLicence = {
  id: 'dl_1',
  licenceNumber: '8505125009087DL',
  codes: ['B', 'EB'],
  restrictions: 'Corrective lenses must be worn (restriction 01)',
  firstIssued: '2008-03-17T00:00:00Z',
  expiryDate: new Date(Date.now() + 72 * 86400000).toISOString(),
  professionalPermit: null,
  application: null
};