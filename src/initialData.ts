import { Member, EmergencyReport, Donation, Election, NewsItem, Advertisement } from './types';

export const initialMembers: Member[] = [
  {
    id: "mem-01",
    fullName: "Khan Wali Shah",
    phone: "+96892445678",
    passportNo: "PC7788123",
    omaniId: "12345678",
    registrationDate: "2026-02-15",
    durationOfOmanStay: "8 years",
    profession: "Scaffolding Inspector",
    isWelfareEligible: true,
    status: "approved"
  },
  {
    id: "mem-02",
    fullName: "Amir Khan Afridi",
    phone: "+96898112233",
    passportNo: "PD2234567",
    omaniId: "87654321",
    registrationDate: "2026-03-10",
    durationOfOmanStay: "12 years",
    profession: "Heavy Equipment Operator",
    isWelfareEligible: true,
    status: "approved"
  },
  {
    id: "mem-03",
    fullName: "Sartaj Masood",
    phone: "+96894556677",
    passportNo: "PE9944111",
    omaniId: "56743210",
    registrationDate: "2026-05-20",
    durationOfOmanStay: "1 year",
    profession: "Mason Labor",
    isWelfareEligible: true,
    status: "pending"
  }
];

export const initialReports: EmergencyReport[] = [
  {
    id: "rep-01",
    reporterName: "Sher Afzal",
    reporterPhone: "+96891234567",
    severity: "high",
    category: "accident",
    location: "Al-Khuwair Site Clinic",
    description: "Brother Khan Wali had a major fall and is admitted at Khoula Hospital. We need blood donors matching O negative. Contact coordinating volunteer directly.",
    date: "2026-06-02",
    status: "verified"
  },
  {
    id: "rep-02",
    reporterName: "Gul Zaman",
    reporterPhone: "+96895554321",
    severity: "medium",
    category: "lost_passport",
    location: "Ruwi Police HQ Area",
    description: "Passport document bag lost during Al-Jabal commute. If any driver finds or receives it, submit immediately to the OPC central desk.",
    date: "2026-06-03",
    status: "pending"
  }
];

export const initialDonations: Donation[] = [
  {
    id: "don-01",
    donorName: "Dr. Muhammad Yousafzai",
    amount: 150.000,
    date: "2026-05-28",
    method: "bank",
    transactionId: "TXN889241029",
    status: "verified"
  },
  {
    id: "don-02",
    donorName: "Ruwi Pavement Labor Guild",
    amount: 85.500,
    date: "2026-06-01",
    method: "mobile_pay",
    transactionId: "REF008741",
    status: "verified"
  },
  {
    id: "don-03",
    donorName: "Najeeb Ullah Yousuf",
    amount: 40.000,
    date: "2026-06-04",
    method: "bank",
    transactionId: "BM-9988241",
    status: "pending"
  }
];

export const initialElections: Election[] = [
  {
    id: "elec-01",
    title: "OPC Core Welfare Cabinet - Finance Secretary Election 2026",
    UrduTitle: "او پی سی مرکزی کابینہ - الیکشن برائے فنانشل سیکرٹری ۲۰۲۶",
    PashtoTitle: "د او پی سی مرکزی کابینه - مالي سیکرټر د ټاکنو ۲۰۲۶ مالي لایحه",
    date: "2026-06-15",
    active: true,
    candidates: [
      {
        id: "cand-01",
        name: "Haji Shah Jehan (Swabi)",
        description: "15+ years managing community funds, transparent audit advocate.",
        UrduDesc: "۱۵ سال سے زائد اکاؤنٹنگ اور فنڈ مینجمنٹ کا تجربہ، شفاف آڈٹ کے حامی۔",
        PashtoDesc: "د حساب او مالي چارو ۱۵ کلن کاري تجربه لروونکی، د رڼو حسابونو مبارز.",
        votes: 142
      },
      {
        id: "cand-02",
        name: "Eng. Sher Zaman Yousafzai (Mardan)",
        description: "Vocal reformist, focusing on digitizing emergency labor welfare grants.",
        UrduDesc: "جدید ڈیجیٹل اصلاحات اور ایمرجنسی لیبر فنڈز کو کمپیوٹرائز کرنے کے حامی۔",
        PashtoDesc: "د جیدو اصلاحاتو غوښتونکی، د غصبي او غریبانو فریز فنڈز کمپیوټري کوونکی.",
        votes: 118
      }
    ]
  }
];

export const initialNews: NewsItem[] = [
  {
    id: "news-01",
    title: "OPC Free Medical Camp & Blood Donation Drive 2026",
    UrduTitle: "عمان پختون کمیونٹی فری میڈیکل کیمپ اور بلڈ کیمپ ۲۰۲۶",
    PashtoTitle: "د عمان پښتنو وړیا روغتیايي کمپ او د وینې د ورکړې لویه غونډه",
    category: "Health Camp",
    content: "Under patronage of the elder board, OPC is organizing a free diagnostic health camp at Ruwi near Khoula Hospital on June 10, 2026. Specialized medical boards and blood matching indices will be active.",
    UrduContent: "بزرگان او پی سی کے مشورے سے رووی میں ۱۰ جون ۲۰۲۶ کو فری طبی کیمپ اور بلڈ ٹیسٹنگ لگایا جا رہا ہے۔ تمام مزدور بھائیوں سے گزارش ہے کہ بھرپور شرکت فرما کر اس کارِ خیر میں حصہ لیں۔",
    PashtoContent: "د مشرانو شورا تر سیوري لاندې د جون پر ۱۰مه رووي کې وړیا طبي معاینه او د وینې د ورکړې ځانګړی کمپ جوړیږي. تر څو د بیمارو پښتنو په وخت چاره وشي.",
    date: "2026-06-03",
    important: true
  },
  {
    id: "news-02",
    title: "Guidelines for Resident Card Renewal in Muscat Districts",
    UrduTitle: "مسقط میں رہائشی کارڈ کی تجدید کے لیے اہم ہدایات",
    PashtoTitle: "مسقط ولسوالۍ کښې د اقامې کارت د نوي کولو لپاره لازم لارښود",
    category: "Legal Advice",
    content: "Important notifications regarding labor permission rules and Omani national civil card renewal rules inside Muscat governorates. Registered members can request free translations at our helpdesk.",
    UrduContent: "مسقط میں مقیم مزدور بھائیوں کے لیے رہائشی کارڈ اور لیبر قوانین کے متعلق اہم ہدایات جاری کر دی گئی ہیں۔ ترجمہ کی سہولت ڈیسک پر موجود ہے۔",
    PashtoContent: "د عمان د نوي سول اقامې پروسې لپاره پښتنو ته لارښوونه کیږي چې خپل کاري جواز په وخت نوی کړي. د ژباړې همکاران مو مرستې ته چمتو دي.",
    date: "2026-06-01",
    important: false
  }
];

export const initialAds: Advertisement[] = [
  {
    id: "ad-01",
    sponsorName: "Al-Khyber Royal Travel Muscat",
    bannerUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=640&auto=format&fit=crop",
    tagline: "Exclusive Direct Flights to Peshawar & Islamabad. Extra 10kg baggage allowance for registered labor card holders!",
    UrduTagline: "پشاور اور اسلام آباد کے لیے سستے فضائی ٹکٹس اور مزدور کارڈ ہولڈرز کے لیے ۱۰ کلو اضافی وزن کا تحفہ!",
    PashtoTagline: "پېښور او اسلام اباد ته ځانګړې رخصتي الوتنې. د راجستر شوو پښتنو لپاره ۱۰ کیلو اضافي سامان وړلو اسانتیا!",
    clickUrl: "https://travel.example.com/opc",
    isActive: true
  },
  {
    id: "ad-02",
    sponsorName: "Khyber Pakhtunkhwa Cargo Logistics",
    bannerUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=640&auto=format&fit=crop",
    tagline: "Door-to-door cargo service from Ruwi to any district in KPK. Heavily discounted rates with certified delivery tracking.",
    UrduTagline: "عمان سے خیبر پختونخواہ کے ہر کونے میں کارگو کی بااعتماد گھر تک ترسیل، بالخصوص مزدور برادری کے لیے خصوصی رعایت۔",
    PashtoTagline: "له عمان څخه غني پښتونخوا ته د کور را کور کارګو خدمت. د باروړونکو موټرو د هر کلي تر دروازې په تایید سره رسول.",
    clickUrl: "https://cargo.example.com",
    isActive: true
  }
];
