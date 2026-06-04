import { CabinetMember, NewsItem, Member, EmergencyReport, Donation, Election, Advertisement } from './types';

export const initialCabinet: CabinetMember[] = [
  {
    id: "cab-1",
    name: "Haji Sher Zaman Achakzai",
    role: "President",
    phone: "+968 9934 1872",
    location: "Ruwi, Muscat",
    bio: "Coordinating community representation with the Pakistan Embassy. Active in Muscat for over 22 years helping workers with legal compliance.",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: "cab-2",
    name: "Ikram Bacha",
    role: "Finance Secretary / Treasurer",
    phone: "+968 9911 1870",
    location: "Sultana, Muscat",
    bio: "Manages the central OMR welfare account. Responsible for direct disbursement of body dispatch and hospital funds to distressed workers.",
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: "cab-3",
    name: "Bilal Ahmad Yousafzai",
    role: "General Secretary",
    phone: "+968 9322 4001",
    location: "Sohar, Oman",
    bio: "Supervises external affairs, Omani municipality registration permissions, and coordinates blood donor drives in the North Al Batinah region.",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: "cab-4",
    name: "Dr. Fazal Rehman",
    role: "Welfare & Health Coordinator",
    phone: "+968 9128 3491",
    location: "Salalah, Dhofar",
    bio: "Oversees local hospital representation for injured construction laborers, emergency medical logistics, and health camps in southern Oman.",
    photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200"
  }
];

export const initialNews: NewsItem[] = [
  {
    id: "news-1",
    title: "National ID Renewal Drive in Muscat & Salalah Offices",
    content: "The Pakistani Embassy has opened localized consular counters this weekend to fast-track Pakistani Passport and CNIC renewal for laborers working in the interiors. Welfare council volunteers will be assisting with translation and form fillings.",
    date: "2026-06-01",
    category: "event"
  },
  {
    id: "news-2",
    title: "Distressed Worker Body Transition Air Cargo Update",
    content: "The treasury board discharged 500 OMR to pay for the air cargo transition costs of a late brother from Khyber Pakhtunkhwa who met with a fatal workplace accident in Nizwa. Proper consular dispatch succeeded yesterday morning.",
    date: "2026-05-28",
    category: "announcement"
  },
  {
    id: "news-3",
    title: "Emergency Medical Relief Camps 2026 Launched",
    content: "A free medical diagnostic and check-up camp is arranged in Barka next Friday in collaboration with local Omani clinic groups. Blood group typing for registration database entries will also be available on-spot.",
    date: "2026-05-25",
    category: "event"
  }
];

export const initialMembers: Member[] = [
  {
    id: "user-1",
    name: "Amjad Ali",
    email: "amjad.nizwa@gmail.com",
    phone: "+968 9481 0291",
    bloodGroup: "O+",
    district: "Swat",
    city: "Nizwa",
    employer: "Al-Ansar Infrastructure",
    emergencyContact: "Farman Ali (Brother) - +92 300 1234567",
    status: "approved",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200",
    joinedDate: "2026-01-10"
  },
  {
    id: "user-2",
    name: "Irfan Khan Pashteen",
    email: "irfan.psh@yahoo.com",
    phone: "+968 9112 0045",
    bloodGroup: "A-",
    district: "Mardan",
    city: "Muscat",
    employer: "Muscat Modern Carpentry",
    emergencyContact: "Said Khan (Uncle) - +968 9112 0040",
    status: "approved",
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200",
    joinedDate: "2026-02-15"
  },
  {
    id: "user-3",
    name: "Shaukat Wazir",
    email: "shaukat.wazir@outlook.com",
    phone: "+968 9568 2818",
    bloodGroup: "B+",
    district: "Waziristan",
    city: "Salalah",
    employer: "Dhofar Logistics Ltd",
    emergencyContact: "Haji Wazir - +92 965 992211",
    status: "pending",
    photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200&h=200",
    joinedDate: "2026-06-02"
  }
];

export const initialReports: EmergencyReport[] = [
  {
    id: "rep-1",
    userId: "user-1",
    reporterName: "Amjad Ali",
    type: "injury",
    description: "Brother Khan Wali suffered a severe fall from scaffolding at Al-Khuwair site hospital block. We need immediate blood group matching for O- negative blood bottle donation and volunteer translation at Khoula Hospital.",
    date: "2026-06-02",
    location: "Khoula Hospital, Muscat",
    contactInfo: "+968 9481 0291 (Amjad Ali)",
    status: "verified"
  },
  {
    id: "rep-2",
    userId: "user-2",
    reporterName: "Irfan Khan Pashteen",
    type: "lost_passport",
    description: "Lost passport and labor permit cards during a transit bus trip from Salalah to Muscat. Need guidelines on consulate travel affidavit paperwork to avoid municipal administrative fine penalty.",
    date: "2026-05-30",
    location: "Azaiba Bus Terminal, Muscat",
    contactInfo: "+968 9112 0045",
    status: "resolved"
  }
];

export const initialDonations: Donation[] = [
  {
    id: "don-1",
    donorName: "Haji Sher Zaman Achakzai",
    amount: 150,
    date: "2026-05-20",
    status: "verified",
    method: "bank"
  },
  {
    id: "don-2",
    donorName: "An Anonymous Brother",
    amount: 25,
    date: "2026-05-27",
    status: "verified",
    method: "mobile"
  },
  {
    id: "don-3",
    donorName: "Shaukat Wazir",
    amount: 5,
    date: "2026-06-02",
    status: "pending",
    method: "bank"
  }
];

export const initialElections: Election[] = [
  {
    id: "elec-1",
    title: "Executive Welfare Council Cycle (2026 - 2028)",
    description: "Choose the Chief Welfare Supervisor role to direct emergency response investments and lead the Pakistan Embassy liaison delegation.",
    endDate: "2026-07-15",
    isActive: true,
    candidates: [
      {
        id: "cand-1",
        name: "Haji Sher Zaman Achakzai",
        role: "Incumbent President & Spokesman",
        votes: 114,
        photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200",
        bio: "Decades of tireless legal coordination, highly responsive communication, and direct Omani government connections."
      },
      {
        id: "cand-2",
        name: "Bacha Khan Yousafzai",
        role: "Challenger - Senior Muscat Representative",
        votes: 98,
        photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200",
        bio: "Proposes an app-based tracking of body cargo status and increased local clinics distribution for low-salary laborers."
      }
    ]
  }
];

export const initialAds: Advertisement[] = [
  {
    id: "ad-1",
    title: "Safe Cargo Door-to-Door Dispatch (KP & Punjab)",
    advertiserName: "KP-Oman Swift Cargo Logistics Ltd",
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600&h=300",
    targetUrl: "https://wa.me/96899341872",
    amountPaid: 45,
    startDate: "2026-05-01",
    expiryDate: "2026-08-30",
    isActive: true,
    notes: "Prime placement above the central treasury ledger. Standard rate card: 15 OMR per month."
  },
  {
    id: "ad-2",
    title: "Khyber Shinwari Barbeque - Muscat & Ruwi Branches",
    advertiserName: "Shinwari Traditional Food Group",
    imageUrl: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&q=80&w=600&h=300",
    targetUrl: "https://wa.me/96899111870",
    amountPaid: 60,
    startDate: "2026-06-01",
    expiryDate: "2026-09-30",
    isActive: true,
    notes: "Sponsors of the Barka health camp drive."
  },
  {
    id: "ad-3",
    title: "Al-Muqtadir Heavy Scaffolding & Excavator Hire",
    advertiserName: "Al-Muqtadir Machinery Co.",
    imageUrl: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&q=80&w=600&h=300",
    targetUrl: "tel:+96893224001",
    amountPaid: 30,
    startDate: "2026-04-15",
    expiryDate: "2026-06-15",
    isActive: true,
    notes: "Special discounts for registered OPC active cabinet members."
  }
];

