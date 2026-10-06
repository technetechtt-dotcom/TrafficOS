import React, {
  ReactNode,
  useEffect,
  createContext,
  useContext,
  useReducer } from
'react';
import {
  AppState,
  TabType,
  User,
  Vehicle,
  Fine,
  Notification,
  DisputeLifecycle,
  DisputeOutcome,
  LicenseDiscApplication,
  DataRequest,
  PaymentRecord,
  VaultDocument,
  DriverLicenceApplication,
  UserPreferences,
  Delivery,
  ServiceBooking,
  SlotRequest,
  SlotOffer,
  CrashReport,
  OwnershipTransfer,
  ResidentialAddress } from
'../types';
import {
  mockAddress,
  mockDeliveries,
  mockBookings,
  mockSlotRequests,
  mockCrashReports } from
'../data/natisServices';
import { DELIVERY_STAGES, DELIVERY_STAGE_COPY } from '../utils/natis';
import {
  mockUser,
  mockVehicles,
  mockFines,
  mockNotifications,
  mockDisputeLifecycles,
  mockRiskProfile,
  mockLicenseApplications,
  mockPayments,
  mockDocuments,
  mockDriverLicence } from
'../data/mockData';

type Action =
{type: 'LOGIN';payload: User;} |
{type: 'LOGOUT';} |
{type: 'DELETE_ACCOUNT';} |
{type: 'SET_TAB';payload: TabType;} |
{type: 'GO_BACK';} |
{type: 'SET_ACTIVE_FINE';payload: string | null;} |
{type: 'SET_ACTIVE_VEHICLE';payload: string | null;} |
{type: 'SET_FINE_VEHICLE_FILTER';payload: string | null;} |
{type: 'TOGGLE_DARK_MODE';} |
{type: 'ADD_VEHICLE';payload: Vehicle;} |
{type: 'REMOVE_VEHICLE';payload: string;} |
{type: 'EDIT_VEHICLE';payload: Vehicle;} |
{type: 'UPDATE_FINE_STATUS';payload: {id: string;status: Fine['status'];};} |
{type: 'MARK_NOTIFICATION_READ';payload: string;} |
{type: 'MARK_ALL_NOTIFICATIONS_READ';} |
{type: 'ADD_FINE';payload: Fine;} |
{type: 'UPDATE_DISPUTE';payload: DisputeLifecycle;} |
{type: 'ADD_DISPUTE';payload: DisputeLifecycle;} |
{type: 'ADVANCE_DISPUTE';payload: string;} |
{
  type: 'RESOLVE_DISPUTE';
  payload: {disputeId: string;outcome: DisputeOutcome;note: string;};
} |
{type: 'ADD_NOTIFICATION';payload: Notification;} |
{type: 'SYNC_FINES';payload: Fine[];} |
{type: 'ADD_LICENSE_APPLICATION';payload: LicenseDiscApplication;} |
{
  type: 'RENEW_LICENSE';
  payload: {
    application: LicenseDiscApplication;
    vehicleId: string;
    newExpiry: string;
  };
} |
{type: 'ADD_PAYMENT';payload: PaymentRecord;} |
{type: 'ADD_DOCUMENT';payload: VaultDocument;} |
{type: 'REMOVE_DOCUMENT';payload: string;} |
{type: 'UPDATE_PREFERENCES';payload: Partial<UserPreferences>;} |
{type: 'START_LICENCE_RENEWAL';payload: DriverLicenceApplication;} |
{
  type: 'ADVANCE_LICENCE_RENEWAL';
  payload: DriverLicenceApplication['stage'];
} |
{type: 'COLLECT_LICENCE';payload: {newExpiry: string;};} |
{type: 'CANCEL_LICENCE_RENEWAL';} |
{
  type: 'RESCHEDULE_LICENCE_RENEWAL';
  payload: {testingCentre: string;appointmentDate: string;};
} |
{type: 'UPDATE_ADDRESS';payload: ResidentialAddress;} |
{type: 'ADD_DELIVERY';payload: Delivery;} |
{type: 'ADVANCE_DELIVERY';payload: string;} |
{type: 'ADD_BOOKING';payload: ServiceBooking;} |
{type: 'CANCEL_BOOKING';payload: string;} |
{
  type: 'RESCHEDULE_BOOKING';
  payload: {
    id: string;
    centreId: string;
    centre: string;
    appointmentAt: string;
  };
} |
{type: 'ADD_SLOT_REQUEST';payload: SlotRequest;} |
{type: 'OFFER_SLOT';payload: {id: string;offer: SlotOffer;};} |
{type: 'ACCEPT_SLOT';payload: {id: string;booking: ServiceBooking;};} |
{type: 'DECLINE_SLOT';payload: string;} |
{type: 'EXPIRE_SLOT';payload: string;} |
{type: 'WITHDRAW_SLOT_REQUEST';payload: string;} |
{type: 'ADD_CRASH_REPORT';payload: CrashReport;} |
{type: 'PURCHASE_CRASH_REPORT';payload: string;} |
{type: 'TRANSFER_VEHICLE';payload: OwnershipTransfer;} |
{
  type: 'ACCEPT_POPIA';
  payload: {marketingConsent: boolean;analyticsConsent: boolean;};
} |
{type: 'REVOKE_POPIA';} |
{type: 'ADD_DATA_REQUEST';payload: DataRequest;} |
{type: 'UPDATE_DATA_REQUEST';payload: {id: string;status: DataRequest['status'];};};

const defaultPreferences: UserPreferences = {
  pushFines: true,
  pushDeadlines: true,
  pushDisputes: true,
  pushMarketing: false,
  emailReceipts: true,
  biometric: true,
  language: 'en-ZA'
};

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  isDarkMode: false,
  activeTab: 'login',
  navHistory: [],
  activeFineId: null,
  activeVehicleId: null,
  fineVehicleFilter: null,
  vehicles: mockVehicles,
  fines: mockFines,
  notifications: mockNotifications,
  disputes: mockDisputeLifecycles,
  riskProfile: mockRiskProfile,
  licenseApplications: mockLicenseApplications,
  payments: mockPayments,
  documents: mockDocuments,
  driverLicence: mockDriverLicence,
  address: mockAddress,
  deliveries: mockDeliveries,
  bookings: mockBookings,
  slotRequests: mockSlotRequests,
  crashReports: mockCrashReports,
  ownershipTransfers: [],
  preferences: defaultPreferences,
  popiaConsent: {
    accepted: false,
    acceptedAt: null,
    marketingConsent: false,
    analyticsConsent: true
  },
  dataRequests: []
};

const AppContext = createContext<
  {
    state: AppState;
    dispatch: React.Dispatch<Action>;
  } |
  undefined>(
  undefined);

/** Stages a dispute moves through, in order, when the authority responds. */
const STAGE_ORDER: DisputeLifecycle['currentStage'][] = [
'submitted',
'acknowledged',
'under_review',
'hearing_scheduled',
'resolved'];


const STAGE_COPY: Record<
  string,
  {
    title: string;
    description: string;
  }> =
{
  acknowledged: {
    title: 'Representation Acknowledged',
    description:
    'The issuing authority has confirmed receipt of your representation and allocated a case officer.'
  },
  under_review: {
    title: 'Under Review',
    description:
    'An adjudicator is reviewing the evidence and the grounds raised in your representation.'
  },
  hearing_scheduled: {
    title: 'Hearing Scheduled',
    description:
    'Your matter has been set down for adjudication. You will be notified of the outcome in writing.'
  }
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        activeTab: 'dashboard',
        navHistory: []
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        activeTab: 'login',
        navHistory: []
      };
    case 'DELETE_ACCOUNT':
      return {
        ...initialState,
        isDarkMode: state.isDarkMode
      };
    case 'SET_TAB':
      if (action.payload === state.activeTab) return state;
      return {
        ...state,
        activeTab: action.payload,
        navHistory: [...state.navHistory, state.activeTab].slice(-20)
      };
    case 'GO_BACK':{
        if (state.navHistory.length === 0) {
          return {
            ...state,
            activeTab: 'dashboard'
          };
        }
        const history = [...state.navHistory];
        const previous = history.pop() as TabType;
        return {
          ...state,
          activeTab: previous,
          navHistory: history
        };
      }
    case 'SET_ACTIVE_FINE':
      return {
        ...state,
        activeFineId: action.payload
      };
    case 'SET_ACTIVE_VEHICLE':
      return {
        ...state,
        activeVehicleId: action.payload
      };
    case 'SET_FINE_VEHICLE_FILTER':
      return {
        ...state,
        fineVehicleFilter: action.payload
      };
    case 'TOGGLE_DARK_MODE':
      return {
        ...state,
        isDarkMode: !state.isDarkMode
      };
    case 'ADD_VEHICLE':
      return {
        ...state,
        vehicles: [...state.vehicles, action.payload]
      };
    case 'REMOVE_VEHICLE':
      return {
        ...state,
        vehicles: state.vehicles.filter((v) => v.id !== action.payload)
      };
    case 'EDIT_VEHICLE':
      return {
        ...state,
        vehicles: state.vehicles.map((v) =>
        v.id === action.payload.id ? action.payload : v
        )
      };
    case 'UPDATE_FINE_STATUS':
      return {
        ...state,
        fines: state.fines.map((f) =>
        f.id === action.payload.id ?
        {
          ...f,
          status: action.payload.status
        } :
        f
        )
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
        n.id === action.payload ?
        {
          ...n,
          read: true
        } :
        n
        )
      };
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({
          ...n,
          read: true
        }))
      };
    case 'ADD_FINE':
      return {
        ...state,
        fines: [action.payload, ...state.fines]
      };
    case 'UPDATE_DISPUTE':
      return {
        ...state,
        disputes: state.disputes.map((d) =>
        d.disputeId === action.payload.disputeId ? action.payload : d
        )
      };
    case 'ADD_DISPUTE':
      return {
        ...state,
        disputes: [action.payload, ...state.disputes]
      };
    case 'ADVANCE_DISPUTE':{
        return {
          ...state,
          disputes: state.disputes.map((d) => {
            if (d.disputeId !== action.payload) return d;
            const currentIndex = STAGE_ORDER.indexOf(d.currentStage);
            const nextStage = STAGE_ORDER[currentIndex + 1];
            if (!nextStage || nextStage === 'resolved') return d;
            const copy = STAGE_COPY[nextStage];
            const timestamp = new Date().toISOString();
            return {
              ...d,
              currentStage: nextStage,
              events: [
              ...d.events.filter((e) => e.isComplete),
              {
                id: `evt_${Date.now()}`,
                stage: nextStage,
                title: copy.title,
                description: copy.description,
                timestamp,
                isComplete: true
              }]

            };
          })
        };
      }
    case 'RESOLVE_DISPUTE':{
        const { disputeId, outcome, note } = action.payload;
        const dispute = state.disputes.find((d) => d.disputeId === disputeId);
        if (!dispute) return state;
        const timestamp = new Date().toISOString();
        const resolvedStage =
        outcome === 'rejected' ? 'dismissed' : 'resolved' as const;
        return {
          ...state,
          disputes: state.disputes.map((d) =>
          d.disputeId !== disputeId ?
          d :
          {
            ...d,
            currentStage: resolvedStage,
            outcome,
            outcomeNote: note,
            resolvedAt: timestamp,
            events: [
            ...d.events.filter((e) => e.isComplete),
            {
              id: `evt_${Date.now()}`,
              stage: resolvedStage,
              title:
              outcome === 'upheld' ?
              'Representation Upheld' :
              outcome === 'reduced' ?
              'Penalty Reduced' :
              'Representation Rejected',
              description: note,
              timestamp,
              isComplete: true
            }]

          }
          ),
          fines: state.fines.map((f) =>
          f.id !== dispute.fineId ?
          f :
          {
            ...f,
            status: outcome === 'upheld' ? 'dismissed' : 'pending'
          }
          )
        };
      }
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };
    case 'SYNC_FINES':
      return {
        ...state,
        fines: [...action.payload, ...state.fines]
      };
    case 'ADD_LICENSE_APPLICATION':
      return {
        ...state,
        licenseApplications: [action.payload, ...state.licenseApplications]
      };
    case 'RENEW_LICENSE':
      return {
        ...state,
        licenseApplications: [
        action.payload.application,
        ...state.licenseApplications],

        vehicles: state.vehicles.map((v) =>
        v.id === action.payload.vehicleId ?
        {
          ...v,
          licenseDiscExpiry: action.payload.newExpiry,
          licenseDiscStatus: 'valid'
        } :
        v
        )
      };
    case 'ADD_PAYMENT':
      return {
        ...state,
        payments: [action.payload, ...state.payments]
      };
    case 'ADD_DOCUMENT':
      return {
        ...state,
        documents: [action.payload, ...state.documents]
      };
    case 'REMOVE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.filter((d) => d.id !== action.payload)
      };
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload
        }
      };
    case 'START_LICENCE_RENEWAL':
      return {
        ...state,
        driverLicence: state.driverLicence ?
        {
          ...state.driverLicence,
          application: action.payload
        } :
        state.driverLicence
      };
    case 'ADVANCE_LICENCE_RENEWAL':
      return {
        ...state,
        driverLicence:
        state.driverLicence && state.driverLicence.application ?
        {
          ...state.driverLicence,
          application: {
            ...state.driverLicence.application,
            stage: action.payload,
            readyAt:
            action.payload === 'ready' ?
            new Date().toISOString() :
            state.driverLicence.application.readyAt
          }
        } :
        state.driverLicence
      };
    case 'COLLECT_LICENCE':
      return {
        ...state,
        driverLicence: state.driverLicence ?
        {
          ...state.driverLicence,
          expiryDate: action.payload.newExpiry,
          application: null
        } :
        state.driverLicence
      };
    case 'CANCEL_LICENCE_RENEWAL':
      return {
        ...state,
        driverLicence: state.driverLicence ?
        { ...state.driverLicence, application: null } :
        state.driverLicence
      };
    case 'RESCHEDULE_LICENCE_RENEWAL':
      return {
        ...state,
        driverLicence:
        state.driverLicence && state.driverLicence.application ?
        {
          ...state.driverLicence,
          application: {
            ...state.driverLicence.application,
            testingCentre: action.payload.testingCentre,
            appointmentDate: action.payload.appointmentDate
          }
        } :
        state.driverLicence
      };
    case 'UPDATE_ADDRESS':
      return { ...state, address: action.payload };
    case 'ADD_DELIVERY':
      return { ...state, deliveries: [action.payload, ...state.deliveries] };
    case 'ADVANCE_DELIVERY':
      return {
        ...state,
        deliveries: state.deliveries.map((d) => {
          if (d.id !== action.payload) return d;
          const next = DELIVERY_STAGES[DELIVERY_STAGES.indexOf(d.status) + 1];
          if (!next) return d;
          return {
            ...d,
            status: next,
            events: [
            ...d.events,
            {
              status: next,
              timestamp: new Date().toISOString(),
              note: DELIVERY_STAGE_COPY[next].note
            }]

          };
        })
      };
    case 'ADD_BOOKING':
      return { ...state, bookings: [action.payload, ...state.bookings] };
    case 'CANCEL_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map((b) =>
        b.id === action.payload ?
        {
          ...b,
          status: 'cancelled',
          cancelledAt: new Date().toISOString()
        } :
        b
        )
      };
    case 'RESCHEDULE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map((b) =>
        b.id === action.payload.id ?
        {
          ...b,
          centreId: action.payload.centreId,
          centre: action.payload.centre,
          appointmentAt: action.payload.appointmentAt,
          rescheduleCount: b.rescheduleCount + 1
        } :
        b
        )
      };
    case 'ADD_SLOT_REQUEST':
      return {
        ...state,
        slotRequests: [action.payload, ...state.slotRequests]
      };
    case 'OFFER_SLOT':
      return {
        ...state,
        slotRequests: state.slotRequests.map((s) =>
        s.id === action.payload.id ?
        { ...s, status: 'offered', offer: action.payload.offer } :
        s
        )
      };
    case 'ACCEPT_SLOT':
      return {
        ...state,
        slotRequests: state.slotRequests.map((s) =>
        s.id === action.payload.id ?
        {
          ...s,
          status: 'accepted',
          respondedAt: new Date().toISOString()
        } :
        s
        ),
        bookings: [action.payload.booking, ...state.bookings]
      };
    case 'DECLINE_SLOT':
    case 'EXPIRE_SLOT':
      return {
        ...state,
        slotRequests: state.slotRequests.map((s) =>
        s.id === action.payload ?
        {
          ...s,
          status: action.type === 'DECLINE_SLOT' ? 'declined' : 'expired',
          respondedAt: new Date().toISOString()
        } :
        s
        )
      };
    case 'WITHDRAW_SLOT_REQUEST':
      return {
        ...state,
        slotRequests: state.slotRequests.filter((s) => s.id !== action.payload)
      };
    case 'ADD_CRASH_REPORT':
      return {
        ...state,
        crashReports: [action.payload, ...state.crashReports]
      };
    case 'PURCHASE_CRASH_REPORT':
      return {
        ...state,
        crashReports: state.crashReports.map((c) =>
        c.id === action.payload ? { ...c, copyPurchased: true } : c
        )
      };
    case 'TRANSFER_VEHICLE':
      return {
        ...state,
        ownershipTransfers: [action.payload, ...state.ownershipTransfers],
        vehicles: state.vehicles.filter(
          (v) => v.id !== action.payload.vehicleId
        ),
        activeVehicleId:
        state.activeVehicleId === action.payload.vehicleId ?
        null :
        state.activeVehicleId
      };
    case 'ACCEPT_POPIA':
      return {
        ...state,
        popiaConsent: {
          accepted: true,
          acceptedAt: new Date().toISOString(),
          marketingConsent: action.payload.marketingConsent,
          analyticsConsent: action.payload.analyticsConsent
        }
      };
    case 'REVOKE_POPIA':
      return {
        ...state,
        popiaConsent: {
          accepted: false,
          acceptedAt: null,
          marketingConsent: false,
          analyticsConsent: false
        }
      };
    case 'ADD_DATA_REQUEST':
      return {
        ...state,
        dataRequests: [action.payload, ...state.dataRequests]
      };
    case 'UPDATE_DATA_REQUEST':
      return {
        ...state,
        dataRequests: state.dataRequests.map((req) =>
        req.id === action.payload.id ?
        {
          ...req,
          status: action.payload.status
        } :
        req
        )
      };
    default:
      return state;
  }
}

export function AppProvider({ children }: {children: ReactNode;}) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Handle dark mode class on document
  useEffect(() => {
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.isDarkMode]);

  // Scroll to top whenever the active page changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'auto'
    });
  }, [state.activeTab]);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch
      }}>
      
      {children}
    </AppContext.Provider>);

}

export function useAppStore() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}

export { mockUser };