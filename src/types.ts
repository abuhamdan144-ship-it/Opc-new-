export type Language = 'en' | 'ur' | 'ps';

export interface Member {
  id: string;
  fullName: string;
  phone: string;
  passportNo: string;
  omaniId: string;
  registrationDate: string;
  durationOfOmanStay: string;
  profession: string;
  isWelfareEligible: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

export interface EmergencyReport {
  id: string;
  reporterName: string;
  reporterPhone: string;
  severity: 'low' | 'medium' | 'high';
  category: 'death' | 'accident' | 'lost_passport' | 'medical_need' | 'general';
  location: string;
  description: string;
  date: string;
  status: 'pending' | 'verified' | 'resolved';
}

export interface Donation {
  id: string;
  donorName: string;
  amount: number;
  date: string;
  method: 'bank' | 'mobile_pay';
  transactionId: string;
  status: 'pending' | 'verified' | 'rejected';
}

export interface Candidate {
  id: string;
  name: string;
  description: string;
  UrduDesc: string;
  PashtoDesc: string;
  votes: number;
}

export interface Election {
  id: string;
  title: string;
  UrduTitle: string;
  PashtoTitle: string;
  date: string;
  active: boolean;
  candidates: Candidate[];
}

export interface NewsItem {
  id: string;
  title: string;
  UrduTitle: string;
  PashtoTitle: string;
  category: string;
  content: string;
  UrduContent: string;
  PashtoContent: string;
  date: string;
  important: boolean;
}

export interface Advertisement {
  id: string;
  sponsorName: string;
  bannerUrl: string;
  tagline: string;
  UrduTagline: string;
  PashtoTagline: string;
  clickUrl: string;
  isActive: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
}
