export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  avatar?: string;
}

export interface Vehicle {
  id: string;
  licensePlate: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  userId: string;
  tareWeight?: number;
  engineNumber?: string;
  licenseDiscExpiry?: string;
  licenseDiscStatus?: LicenseDiscStatus;
}

export type LicenseDiscStatus = 'valid' | 'expiring' | 'expired';

export type LicenseApplicationStatus =
'draft' |
'processing' |
'paid' |
'issued' |
'failed';

export interface LicenseDiscApplication {
  id: string;
  vehicleId: string;
  licensePlate: string;
  applicationType: 'renewal' | 'new';
  baseFee: number;
  arrearFee: number;
  adminFee: number;
  totalAmount: number;
  status: LicenseApplicationStatus;
  createdAt: string;
  paidAt?: string;
  validFrom?: string;
  validUntil?: string;
  receiptNumber: string;
  discNumber?: string;
}

export type FineStatus =
'pending' |
'overdue' |
'paid' |
'disputed' |
'dismissed';

export interface Fine {
  id: string;
  vehicleId: string;
  licensePlate: string;
  offenceType: string;
  offenceDescription: string;
  amount: number;
  status: FineStatus;
  issuedBy: string;
  issuedDate: string;
  dueDate: string;
  location: string;
  referenceNumber: string;
  lat?: number;
  lng?: number;
  imageUrl?: string;
  uploadedAt?: string;
  noticeType?: 'AARTO 01' | 'AARTO 03' | 'Section 341';
  cameraId?: string;
  recordedSpeed?: number;
  speedLimit?: number;
}

export interface AIAnalysis {
  fineId: string;
  successProbability: number;
  recommendation: 'dispute' | 'pay';
  reasons: string[];
  estimatedSavings: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface Dispute {
  id: string;
  fineId: string;
  status: 'draft' | 'submitted' | 'under_review' | 'resolved';
  legalText: string;
  createdAt: string;
  submittedAt?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'fine' | 'deadline' | 'dispute' | 'payment' | 'licence';
  read: boolean;
  createdAt: string;
  fineId?: string;
  vehicleId?: string;
  linkTab?: TabType;
}

export type DisputeStage =
'submitted' |
'acknowledged' |
'under_review' |
'hearing_scheduled' |
'resolved' |
'dismissed' |
'appeal';

export interface DisputeEvent {
  id: string;
  stage: DisputeStage;
  title: string;
  description: string;
  timestamp: string;
  isComplete: boolean;
}

export type DisputeOutcome = 'upheld' | 'rejected' | 'reduced';

export interface DisputeLifecycle {
  disputeId: string;
  fineId: string;
  events: DisputeEvent[];
  currentStage: DisputeStage;
  blockchainHash?: string;
  submittedAt: string;
  estimatedResolution?: string;
  outcome?: DisputeOutcome;
  outcomeNote?: string;
  resolvedAt?: string;
}

export interface RiskFactor {
  label: string;
  score: number;
  description: string;
  icon: string;
}

export interface RiskProfile {
  overallScore: number;
  level: 'low' | 'moderate' | 'high' | 'critical';
  factors: RiskFactor[];
  predictions: string[];
  lastUpdated: string;
}

export interface CameraHotspot {
  id: string;
  lat: number;
  lng: number;
  name: string;
  disputeRate: number;
  totalFines: number;
  avgAmount: number;
}

export interface DataRequest {
  id: string;
  type: 'export' | 'deletion' | 'correction';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  requestedAt: string;
  completedAt?: string;
  reason?: string;
}

/* ---------------------------------- */
/* Payments & receipts                */
/* ---------------------------------- */

export type PaymentMethod =
'card' |
'instant-eft' |
'ozow' |
'snapscan' |
'payfast';

export type PaymentPurpose =
'fine' |
'licence-disc' |
'driver-licence' |
'delivery' |
'ownership' |
'test-booking' |
'crash-report';

export interface PaymentRecord {
  id: string;
  purpose: PaymentPurpose;
  description: string;
  reference: string;
  receiptNumber: string;
  subtotal: number;
  discount: number;
  serviceFee: number;
  total: number;
  method: PaymentMethod;
  methodDetail: string;
  paidAt: string;
  status: 'succeeded' | 'failed' | 'refunded';
  fineId?: string;
  vehicleId?: string;
  authority?: string;
}

/* ---------------------------------- */
/* Demerit points (AARTO)             */
/* ---------------------------------- */

export interface DemeritEvent {
  id: string;
  fineId: string;
  licensePlate: string;
  offenceType: string;
  points: number;
  incurredAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface DemeritProfile {
  activePoints: number;
  threshold: number;
  events: DemeritEvent[];
  nextExpiry: DemeritEvent | null;
  nextReductionDate: string;
  suspensionMonths: number;
  isSuspended: boolean;
}

/* ---------------------------------- */
/* Driver's licence card              */
/* ---------------------------------- */

export type DriverLicenceStatus = 'valid' | 'expiring' | 'expired';

export type DriverLicenceApplicationStage =
'booking' |
'booked' |
'eye-test' |
'processing' |
'ready' |
'collected';

export interface DriverLicenceApplication {
  id: string;
  stage: DriverLicenceApplicationStage;
  testingCentre: string;
  appointmentDate: string;
  fee: number;
  receiptNumber: string;
  createdAt: string;
  readyAt?: string;
}

export interface DriverLicence {
  id: string;
  licenceNumber: string;
  codes: string[];
  restrictions: string;
  firstIssued: string;
  expiryDate: string;
  professionalPermit?: {
    code: string;
    expiryDate: string;
  } | null;
  application?: DriverLicenceApplication | null;
}

/* ---------------------------------- */
/* Document vault                     */
/* ---------------------------------- */

export type DocumentCategory =
'identity' |
'licence' |
'vehicle' |
'insurance' |
'roadworthy' |
'other';

export interface VaultDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  fileType: 'PDF' | 'JPG' | 'PNG';
  sizeKb: number;
  uploadedAt: string;
  expiresAt?: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  vehicleId?: string;
}

/* ---------------------------------- */
/* NaTIS services                     */
/* ---------------------------------- */

export interface Address {
  street: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface ResidentialAddress extends Address {
  updatedAt: string;
  /** Whether the NCP change-of-particulars has been recorded on eNaTIS. */
  natisStatus: 'synced' | 'pending';
}

export type DeliveryMethod = 'collect' | 'ordinary' | 'registered' | 'courier';
export type DeliveryItem =
'licence-disc' |
'licence-card' |
'registration-certificate';
export type DeliveryStatus =
'processing' |
'dispatched' |
'in-transit' |
'out-for-delivery' |
'delivered';

export interface DeliveryEvent {
  status: DeliveryStatus;
  timestamp: string;
  note: string;
}

export interface Delivery {
  id: string;
  item: DeliveryItem;
  label: string;
  reference: string;
  vehicleId?: string;
  method: Exclude<DeliveryMethod, 'collect'>;
  carrier: string;
  trackingNumber: string;
  fee: number;
  address: Address;
  status: DeliveryStatus;
  createdAt: string;
  estimatedDelivery: string;
  events: DeliveryEvent[];
}

export type BookingService =
'learner-test' |
'driving-test' |
'prdp' |
'licence-renewal';

export interface ServiceBooking {
  id: string;
  service: BookingService;
  licenceCode?: string;
  centreId: string;
  centre: string;
  appointmentAt: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  fee: number;
  receiptNumber: string;
  createdAt: string;
  cancelledAt?: string;
  rescheduleCount: number;
  source: 'direct' | 'slot';
}

export type SlotService = 'licence-renewal' | 'prdp';

export interface SlotOffer {
  centreId: string;
  centre: string;
  appointmentAt: string;
  expiresAt: string;
}

export interface SlotRequest {
  id: string;
  service: SlotService;
  preferredArea: string;
  status: 'waiting' | 'offered' | 'accepted' | 'declined' | 'expired';
  registeredAt: string;
  offer?: SlotOffer;
  respondedAt?: string;
}

export interface CrashReport {
  id: string;
  referenceNumber: string;
  vehicleId: string;
  licensePlate: string;
  occurredAt: string;
  location: string;
  description: string;
  otherParty: {
    name: string;
    phone: string;
    licensePlate: string;
    insurer: string;
  };
  photoCount: number;
  policeStation?: string;
  casNumber?: string;
  status: 'submitted' | 'recorded';
  submittedAt: string;
  copyPurchased: boolean;
}

export interface OwnershipTransfer {
  id: string;
  vehicleId: string;
  licensePlate: string;
  vehicleLabel: string;
  buyerName: string;
  buyerIdNumber: string;
  saleDate: string;
  odometer: number;
  fee: number;
  receiptNumber: string;
  status: 'submitted' | 'registered';
  submittedAt: string;
}

/* ---------------------------------- */
/* Preferences                        */
/* ---------------------------------- */

export interface UserPreferences {
  pushFines: boolean;
  pushDeadlines: boolean;
  pushDisputes: boolean;
  pushMarketing: boolean;
  emailReceipts: boolean;
  biometric: boolean;
  language: string;
}

export type TabType =
'login' |
'register' |
'forgot-password' |
'dashboard' |
'vehicles' |
'vehicle-detail' |
'fines' |
'fine-detail' |
'profile' |
'dispute' |
'disputes' |
'analytics' |
'map' |
'licenses' |
'driver-licence' |
'payments' |
'support' |
'notifications' |
'settings' |
'privacy' |
'data-rights' |
'aarto-points' |
'documents' |
'licence-services' |
'deliveries' |
'crash-reports';

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isDarkMode: boolean;
  activeTab: TabType;
  navHistory: TabType[];
  activeFineId: string | null;
  activeVehicleId: string | null;
  fineVehicleFilter: string | null;
  vehicles: Vehicle[];
  fines: Fine[];
  notifications: Notification[];
  disputes: DisputeLifecycle[];
  riskProfile: RiskProfile | null;
  licenseApplications: LicenseDiscApplication[];
  payments: PaymentRecord[];
  documents: VaultDocument[];
  driverLicence: DriverLicence | null;
  address: ResidentialAddress | null;
  deliveries: Delivery[];
  bookings: ServiceBooking[];
  slotRequests: SlotRequest[];
  crashReports: CrashReport[];
  ownershipTransfers: OwnershipTransfer[];
  preferences: UserPreferences;
  popiaConsent: {
    accepted: boolean;
    acceptedAt: string | null;
    marketingConsent: boolean;
    analyticsConsent: boolean;
  };
  dataRequests: DataRequest[];
}