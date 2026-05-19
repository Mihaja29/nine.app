export type ViewState = 
  | 'splash'
  | 'login'
  | 'profile_setup'
  | 'home'
  | 'agenda'
  | 'planning'
  | 'bilans'
  | 'dashboard'
  | 'finance'
  | 'outils'
  | 'settings'
  | 'person_details'
  | 'unites_list'
  | 'equipes_list'
  | 'categories'
  | 'notification_settings'
  | 'notifications_center'
  | 'security_privacy'
  | 'profile'
  | 'security'
  | 'notifications';

export interface Person {
  id?: string;
  lastName: string;
  firstName: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  dateAdded?: string;
  photoURL?: string;
  hasTotem?: string;
  totemName?: string;
  useTotemAsMainName?: boolean;
  groupe?: string;
  branche?: string;
  fonctionBranche?: string;
  etapeFormation?: string;
  promesseGuideDate?: string;
  promesseChefDate?: string;
  joinDate?: string;
  birthDate?: string;
  address?: string;
  status?: string;
}

export interface Category {
  id?: string;
  name: string;
  ownerId?: string;
}

export interface Unite {
  id: string;
  name: string;
  type?: string;
  createdAt?: string;
}

export interface Equipe {
  id: string;
  name: string;
  createdAt?: string;
}

export interface Beneficiary {
  id?: string;
  name: string;
}
