export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodGroup: string;
  district: string;
  city: string;
  employer: string;
  emergencyContact: string;
  status: 'pending' | 'approved' | 'rejected';
  photoUrl?: string;
  joinedDate: string;
}

export interface EmergencyReport {
  id: string;
  userId: string;
  reporterName: string;
  type: 'death' | 'injury' | 'lost_passport' | 'other';
  description: string;
  date: string;
  time?: string;
  location: string;
  contactInfo: string;
  status: 'pending' | 'verified' | 'resolved';
}

export interface Donation {
  id: string;
  donorName: string;
  amount: number;
  date: string;
  status: 'pending' | 'verified' | 'rejected';
  method: 'bank' | 'mobile';
}

export interface CabinetMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  location: string;
  bio: string;
  photoUrl: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'general' | 'announcement' | 'event';
}

export interface ElectionCandidate {
  id: string;
  name: string;
  role: string;
  votes: number;
  photoUrl: string;
  bio: string;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  candidates: ElectionCandidate[];
  isActive: boolean;
  endDate: string;
}

export interface Advertisement {
  id: string;
  title: string;
  advertiserName: string;
  imageUrl: string; 
  targetUrl: string; 
  amountPaid: number; 
  startDate: string; 
  expiryDate: string; 
  isActive: boolean;
  notes?: string;
}

export type Language = 'en' | 'ur' | 'ps';

