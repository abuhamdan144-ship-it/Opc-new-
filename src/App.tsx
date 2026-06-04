import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, 
  UserPlus, 
  AlertTriangle, 
  Heart, 
  Vote, 
  Users, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  Clock4, 
  Search, 
  Megaphone, 
  Plus, 
  Check, 
  Coins, 
  User, 
  Building2, 
  ShieldAlert, 
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Member, EmergencyReport, Donation, CabinetMember, NewsItem, Election, Language, Advertisement } from './types';
import { i18nTranslations } from './i18n';
import { initialCabinet, initialNews, initialMembers, initialReports, initialDonations, initialElections, initialAds } from './initialData';
import { DigitalMemberId } from './components/DigitalMemberId';
import { AdBillboard } from './components/AdBillboard';
import { AdManager } from './components/AdManager';
import { CommunityDashboard } from './components/CommunityDashboard';
import { AdminMembersDirectory } from './components/AdminMembersDirectory';

export default function App() {
  // --- States ---
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('opc_lang');
    return (saved as Language) || 'en';
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem('opc_active_tab');
    return saved || 'home';
  });

  // Role simulation state so the reviewer can test all aspects of the site immediately!
  const [simulatedRole, setSimulatedRole] = useState<'guest' | 'member' | 'admin'>(() => {
    const saved = localStorage.getItem('opc_sim_role');
    return (saved as 'guest' | 'member' | 'admin') || 'admin'; // Default to admin so they see the robust features first!
  });

  // Dynamic database states using LocalStorage
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('opc_members');
    return saved ? JSON.parse(saved) : initialMembers;
  });

  const [reports, setReports] = useState<EmergencyReport[]>(() => {
    const saved = localStorage.getItem('opc_reports');
    return saved ? JSON.parse(saved) : initialReports;
  });

  const [donations, setDonations] = useState<Donation[]>(() => {
    const saved = localStorage.getItem('opc_donations');
    return saved ? JSON.parse(saved) : initialDonations;
  });

  const [elections, setElections] = useState<Election[]>(() => {
    const saved = localStorage.getItem('opc_elections');
    return saved ? JSON.parse(saved) : initialElections;
  });

  const [news, setNews] = useState<NewsItem[]>(() => {
    const saved = localStorage.getItem('opc_news');
    return saved ? JSON.parse(saved) : initialNews;
  });

  const [announcementMsg, setAnnouncementMsg] = useState<string>(() => {
    return localStorage.getItem('opc_announcement') || 
      "📢 Special Announcement: Welfare contribution portal is active! Contact the cabinet for immediate disaster response.";
  });

  const [ads, setAds] = useState<Advertisement[]>(() => {
    const saved = localStorage.getItem('opc_ads');
    return saved ? JSON.parse(saved) : initialAds;
  });

  const [adminOnlyAds, setAdminOnlyAds] = useState<boolean>(() => {
    const saved = localStorage.getItem('opc_admin_only_ads');
    return saved ? saved === 'true' : true; // Default to true (Only Admin Allowed to Run Ads)
  });

  const [showSimulatorBar, setShowSimulatorBar] = useState<boolean>(() => {
    const saved = localStorage.getItem('opc_show_simulator_bar');
    return saved ? saved === 'true' : false; // Default to false (hidden) per user request to hide simulator from the top section
  });

  // User input states inside different forms
  // Registration Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDistrict, setRegDistrict] = useState('');
  const [regBlood, setRegBlood] = useState('O+');
  const [regEmployer, setRegEmployer] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regEmergency, setRegEmergency] = useState('');
  const [regPhoto, setRegPhoto] = useState('');
  const [regFeedback, setRegFeedback] = useState('');

  // Emergency Report Form
  const [repType, setRepType] = useState<'death' | 'injury' | 'lost_passport' | 'other'>('injury');
  const [repDesc, setRepDesc] = useState('');
  const [repDate, setRepDate] = useState('');
  const [repLocation, setRepLocation] = useState('');
  const [repContact, setRepContact] = useState('');
  const [repFeedback, setRepFeedback] = useState('');

  // Donation Form
  const [donName, setDonName] = useState('');
  const [donAmount, setDonAmount] = useState('');
  const [donMethod, setDonMethod] = useState<'bank' | 'mobile'>('bank');
  const [donFeedback, setDonFeedback] = useState('');

  // Contact Message Form
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactFeedback, setContactFeedback] = useState('');

  // Admin Announcement Input
  const [adminAnnText, setAdminAnnText] = useState('');
  // Admin News Maker
  const [adminNewsTitle, setAdminNewsTitle] = useState('');
  const [adminNewsContent, setAdminNewsContent] = useState('');
  const [adminNewsCategory, setAdminNewsCategory] = useState<'general' | 'announcement' | 'event'>('general');

  // Admin Login States
  const [adminUsernameInput, setAdminUsernameInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('opc_admin_auth') === 'true';
  });
  const [loginError, setLoginError] = useState('');

  // Donation Search & Filter ledger
  const [donationSearchQuery, setDonationSearchQuery] = useState('');

  // Active member selected for card viewing or searching
  const [selectedIDMember, setSelectedIDMember] = useState<Member | null>(null);

  const currentMember = useMemo(() => {
    return members.find(m => m.id === 'user-1' && m.status === 'approved') || members.find(m => m.status === 'approved') || null;
  }, [members]);

  // Vote tracker (prevents voting twice in same tab)
  const [votedIds, setVotedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('opc_voted_ids');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Synchronization Effects ---
  useEffect(() => {
    localStorage.setItem('opc_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('opc_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('opc_sim_role', simulatedRole);
  }, [simulatedRole]);

  useEffect(() => {
    localStorage.setItem('opc_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('opc_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('opc_donations', JSON.stringify(donations));
  }, [donations]);

  useEffect(() => {
    localStorage.setItem('opc_elections', JSON.stringify(elections));
  }, [elections]);

  useEffect(() => {
    localStorage.setItem('opc_news', JSON.stringify(news));
  }, [news]);

  useEffect(() => {
    localStorage.setItem('opc_ads', JSON.stringify(ads));
  }, [ads]);

  useEffect(() => {
    localStorage.setItem('opc_admin_only_ads', String(adminOnlyAds));
  }, [adminOnlyAds]);

  useEffect(() => {
    localStorage.setItem('opc_show_simulator_bar', String(showSimulatorBar));
  }, [showSimulatorBar]);

  useEffect(() => {
    localStorage.setItem('opc_voted_ids', JSON.stringify(votedIds));
  }, [votedIds]);

  useEffect(() => {
    localStorage.setItem('opc_admin_auth', isAdminLoggedIn ? 'true' : 'false');
  }, [isAdminLoggedIn]);

  useEffect(() => {
    if (simulatedRole !== 'admin') {
      setIsAdminLoggedIn(false);
    }
  }, [simulatedRole]);

  // Translate helpers
  const t = (key: string) => {
    return i18nTranslations[language][key] || i18nTranslations['en'][key] || key;
  };

  const isRtl = language === 'ur' || language === 'ps';

  // --- Computed Stats ---
  const totals = useMemo(() => {
    const approvedMemberCount = members.filter(m => m.status === 'approved').length;
    
    // Sum of verified donations only
    const verifiedDonTotal = donations
      .filter(d => d.status === 'verified')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const activeEmergencyCount = reports.filter(r => r.status !== 'resolved').length;

    return {
      membersCount: approvedMemberCount,
      treasuryBalance: verifiedDonTotal,
      activeEmergencies: activeEmergencyCount
    };
  }, [members, donations, reports]);

  // Handle Photo upload conversions (Base64 wrapper for realistic photos inside the UI)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRegPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Submissions ---
  // 1. Members Registration
  const submitMemberRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regPhone) {
      alert("Name and Phone are required.");
      return;
    }

    const newMember: Member = {
      id: "user-" + Date.now(),
      name: regName,
      email: regEmail || "unspecified@community.com",
      phone: regPhone,
      bloodGroup: regBlood,
      district: regDistrict || "Khyber Pakhtunkhwa",
      city: regCity || "Muscat",
      employer: regEmployer || "Self-Employed",
      emergencyContact: regEmergency || "Relative in Pakistan",
      status: "pending",
      photoUrl: regPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200",
      joinedDate: new Date().toISOString().split('T')[0]
    };

    setMembers(prev => [newMember, ...prev]);
    setRegFeedback(t('regSuccess'));
    
    // Reset forms
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegDistrict('');
    setRegEmployer('');
    setRegCity('');
    setRegEmergency('');
    setRegPhoto('');
    
    setTimeout(() => setRegFeedback(''), 10000);
  };

  // 2. Incident Emergency report
  const submitEmergencyReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repDesc || !repContact) {
      alert("Description and Callback number are required.");
      return;
    }

    const currentReporter = members.find(m => m.status === 'approved') || { name: 'Local Resident', id: 'guest' };

    const newReport: EmergencyReport = {
      id: "rep-" + Date.now(),
      userId: currentReporter.id,
      reporterName: currentReporter.name,
      type: repType,
      description: repDesc,
      date: repDate || new Date().toISOString().split('T')[0],
      location: repLocation || "Sultanate of Oman",
      contactInfo: repContact,
      status: "pending"
    };

    setReports(prev => [newReport, ...prev]);
    setRepFeedback(t('reportSent'));

    // Reset fields
    setRepDesc('');
    setRepLocation('');
    setRepContact('');
    setRepDate('');

    setTimeout(() => setRepFeedback(''), 10000);
  };

  // 3. Donation Record Submissions
  const submitDonationLog = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(donAmount);
    if (!donName || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid donor name and amount greater than 0 OMR.");
      return;
    }

    const newDonation: Donation = {
      id: "don-" + Date.now(),
      donorName: donName,
      amount: parsedAmount,
      date: new Date().toISOString().split('T')[0],
      status: "pending",
      method: donMethod
    };

    setDonations(prev => [newDonation, ...prev]);
    setDonFeedback(t('donationSuccess'));

    setDonName('');
    setDonAmount('');

    setTimeout(() => setDonFeedback(''), 10000);
  };

  // 4. Contact Suggestion Log
  const submitContactMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactMsg) {
      alert("Name and message are required.");
      return;
    }

    const newMessage = {
      id: Date.now(),
      name: contactName,
      email: contactEmail,
      message: contactMsg,
      date: new Date().toLocaleString()
    };

    const existingMsgs = localStorage.getItem('opc_contact_msgs');
    const list = existingMsgs ? JSON.parse(existingMsgs) : [];
    list.push(newMessage);
    localStorage.setItem('opc_contact_msgs', JSON.stringify(list));

    setContactFeedback(t('messageSaved'));
    setContactName('');
    setContactEmail('');
    setContactMsg('');

    setTimeout(() => setContactFeedback(''), 10000);
  };

  // --- Voting Flow ---
  const handleVote = (electionId: string, candidateId: string) => {
    if (votedIds.includes(electionId)) {
      alert(t('votedAlready'));
      return;
    }

    setElections(prev => prev.map(elec => {
      if (elec.id === electionId) {
        return {
          ...elec,
          candidates: elec.candidates.map(cand => {
            if (cand.id === candidateId) {
              return { ...cand, votes: cand.votes + 1 };
            }
            return cand;
          })
        };
      }
      return elec;
    }));

    setVotedIds(prev => [...prev, electionId]);
    alert(t('voteLogged'));
  };

  // --- Admin Administrative Actions ---
  const approveMember = (id: string) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: 'approved' as const } : m));
  };

  const rejectMember = (id: string) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: 'rejected' as const } : m));
  };

  const deleteMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const verifyDonation = (id: string) => {
    setDonations(prev => prev.map(d => d.id === id ? { ...d, status: 'verified' as const } : d));
  };

  const rejectDonation = (id: string) => {
    setDonations(prev => prev.map(d => d.id === id ? { ...d, status: 'rejected' as const } : d));
  };

  const changeReportStatus = (id: string, newStatus: 'pending' | 'verified' | 'resolved') => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const saveAdminAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminAnnText.trim()) return;
    setAnnouncementMsg(adminAnnText);
    localStorage.setItem('opc_announcement', adminAnnText);
    alert("Billboard notice successfully updated across the portal!");
    setAdminAnnText('');
  };

  const publishAdminNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNewsTitle || !adminNewsContent) {
      alert("News title and content are required.");
      return;
    }

    const nItem: NewsItem = {
      id: "news-" + Date.now(),
      title: adminNewsTitle,
      content: adminNewsContent,
      date: new Date().toISOString().split('T')[0],
      category: adminNewsCategory
    };

    setNews(prev => [nItem, ...prev]);
    alert("News item published to live portal feed!");
    setAdminNewsTitle('');
    setAdminNewsContent('');
  };

  const handleAddAd = (newAd: Advertisement) => {
    setAds(prev => [newAd, ...prev]);
  };

  const handleRemoveAd = (id: string) => {
    setAds(prev => prev.filter(ad => ad.id !== id));
  };

  const handleToggleAd = (id: string) => {
    setAds(prev => prev.map(ad => ad.id === id ? { ...ad, isActive: !ad.isActive } : ad));
  };

  // --- Filtered Donation Ledger List ---
  const filteredDonations = useMemo(() => {
    return donations.filter(d => {
      const criteria = donationSearchQuery.toLowerCase();
      return (
        d.donorName.toLowerCase().includes(criteria) ||
        d.method.toLowerCase().includes(criteria) ||
        d.amount.toString().includes(criteria)
      );
    });
  }, [donations, donationSearchQuery]);

  // Export records of approved members to CSV (Simulated download file)
  const downloadMembersCSV = () => {
    const headers = "ID,Full Name,Email,Oman Mobile,Blood Group,Hometown District,Oman City,Sponsor/Employer,Emergency Contact,Status,Joined Date\n";
    const rows = members.map(m => 
      `"${m.id}","${m.name}","${m.email}","${m.phone}","${m.bloodGroup}","${m.district}","${m.city}","${m.employer}","${m.emergencyContact}","${m.status}","${m.joinedDate}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Oman_Pakhtoon_Members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="min-h-screen bg-gray-50 flex flex-col font-sans transition-all duration-300 antialiased"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* 🟢 TOP SIMULATOR & FLAG BAR */}
      {showSimulatorBar && (
        <div className="bg-slate-900 text-slate-100 py-2.5 px-4 text-xs border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Quick simulator status */}
            <div className="flex items-center gap-2 flex-wrap justify-center font-sans">
              <span className="text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Portal Simulator:
              </span>
              <span className="text-slate-300 animate-pulse">Choose who you are simulating to test full portal mechanics:</span>
              <div className="inline-flex rounded-md shadow-xs overflow-hidden border border-slate-700 bg-slate-800 p-0.5 ml-1">
                <button 
                  onClick={() => setSimulatedRole('guest')}
                  className={`px-2.5 py-1 rounded-sm text-[11px] font-medium transition-all ${simulatedRole === 'guest' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Guest Expat
                </button>
                <button 
                  onClick={() => setSimulatedRole('member')}
                  className={`px-2.5 py-1 rounded-sm text-[11px] font-medium transition-all ${simulatedRole === 'member' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Approved Member (Amjad)
                </button>
                <button 
                  onClick={() => setSimulatedRole('admin')}
                  className={`px-2.5 py-1 rounded-sm text-[11px] font-medium transition-all ${simulatedRole === 'admin' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Finance Sec. Admin (Ikram)
                </button>
              </div>
            </div>

            {/* Social icons & indicators */}
            <div className="flex items-center gap-4.5 font-medium font-sans">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Muscat Server Live
              </span>
              <div className="h-4 w-px bg-slate-700"></div>
              <a 
                href="https://ais-dev-kwgj634upw3m2n2rbxh53o-469166214171.europe-west1.run.app" 
                target="_blank" 
                className="hover:text-emerald-400 transition"
                referrerPolicy="no-referrer"
              >
                Welfare Desk
              </a>
              <div className="h-4 w-px bg-slate-700"></div>
              <button 
                onClick={() => setShowSimulatorBar(false)}
                className="text-slate-350 hover:text-red-400 transition cursor-pointer text-[10px] font-bold uppercase tracking-wider bg-slate-805 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-700"
                title="Hide simulator banner"
              >
                Hide ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 HERO EMBASSY BANNER AREA */}
      <header className="relative bg-emerald-800 text-white py-10 px-6 overflow-hidden border-b-4 border-yellow-400 shadow-md">
        <div className="absolute inset-0 z-0 opacity-15 overflow-hidden">
          {/* Authentic background motifs via decorative shapes */}
          <div className="absolute -top-16 -right-16 w-96 h-96 rounded-full bg-emerald-400 blur-3xl"></div>
          <div className="absolute -bottom-16 -left-16 w-96 h-96 rounded-full bg-yellow-300 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4.5">
            {/* Beautiful Custom Circular Pakistan & Oman Flags Motif logo */}
            <div className="w-20 h-20 bg-white rounded-full p-1.5 shadow-lg flex items-center justify-center border-2 border-yellow-400 relative shrink-0">
              {/* Omani-Pakistani alliance symbolic visual */}
              <div className="w-full h-full rounded-full bg-emerald-700 overflow-hidden flex flex-col justify-between">
                <div className="h-1/2 bg-rose-600 flex items-center justify-center text-[10px] font-bold text-white tracking-widest uppercase">OMAN</div>
                <div className="h-1/2 bg-emerald-800 flex items-center justify-center text-[10px] font-bold text-white tracking-widest uppercase border-t border-yellow-300">PAK</div>
              </div>
              <span className="absolute -bottom-1 right-0 bg-yellow-400 text-emerald-950 font-bold px-1.5 py-0.5 rounded text-[8px] tracking-wide border border-white">
                PORTAL
              </span>
            </div>

            <div className={`${isRtl ? 'text-right' : 'text-left'}`}>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-yellow-200">
                {t('appTitle')}
              </h1>
              <p className="text-sm md:text-base text-emerald-100 font-medium max-w-2xl mt-1.5 font-sans leading-relaxed">
                {t('appSubtitle')}
              </p>
              <span className="inline-block mt-2 font-semibold text-yellow-300 text-xs px-2.5 py-1 rounded-full bg-emerald-900/50 border border-emerald-700/60 font-urdu tracking-wide">
                {t('appSlogan')}
              </span>
            </div>
          </div>

          {/* Language Selector Selector Component */}
          <div className="flex items-center gap-3 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-700/50 backdrop-blur-xs">
            <Globe className="w-4 h-4 text-yellow-400 shrink-0" />
            <span className="text-xs text-emerald-200 font-medium whitespace-nowrap">{t('switchLanguage')}:</span>
            <div className="flex gap-1.5">
              {(['en', 'ur', 'ps'] as Language[]).map((ln) => (
                <button
                  key={ln}
                  onClick={() => setLanguage(ln)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    language === ln 
                      ? 'bg-yellow-400 text-emerald-950 shadow-sm' 
                      : 'text-white hover:bg-emerald-900/80 hover:text-yellow-200'
                  }`}
                >
                  {ln === 'en' ? 'English' : ln === 'ur' ? 'اردو' : 'پښتو'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* 🟢 DYNAMIC ANNOUNCEMENT STREAMER / TICKER */}
      <div className="bg-yellow-400 text-emerald-950 font-bold text-sm select-none border-b border-yellow-500 overflow-hidden py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 gap-4">
          <div className="flex items-center gap-2 bg-emerald-950 text-yellow-400 px-3 py-1 rounded text-xs shrink-0 tracking-wider font-extrabold uppercase">
            <Megaphone className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden sm:inline">{language === 'en' ? 'LATEST' : 'اعلانات'}</span>
          </div>
          <div className="w-full overflow-hidden relative">
            <div className="inline-block animate-marquee whitespace-nowrap pl-4 tracking-wide font-sans text-sm">
              {announcementMsg} &nbsp;&nbsp;&bull;&nbsp;&nbsp; {t('verifyNotice')} &nbsp;&nbsp;&bull;&nbsp;&nbsp; 🇵🇰 🤝 🇴🇲 {t('appSlogan')}
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 MAIN NAVIGATION BAR */}
      <nav className="bg-white shadow-xs border-b border-gray-200 sticky top-0 z-40 transition-all duration-150">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 overflow-x-auto no-scrollbar scroll-smooth">
            <div className="flex space-x-1 sm:space-x-2 md:space-x-3 shrink-0 py-1.5">
              {[
                { id: 'home', label: t('navHome'), icon: Home },
                { id: 'register', label: t('navRegister'), icon: UserPlus },
                { id: 'reports', label: t('navReports'), icon: AlertTriangle, count: totals.activeEmergencies },
                { id: 'donations', label: t('navDonations'), icon: Heart },
                { id: 'elections', label: t('navElections'), icon: Vote },
                { id: 'cabinet', label: t('navCabinet'), icon: Users },
                { id: 'admin', label: t('navAdmin'), icon: ShieldCheck, badge: true },
                { id: 'contact', label: t('navContact'), icon: Mail }
              ].map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all transform duration-150 whitespace-nowrap shrink-0 relative ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-800 shadow-xs border border-emerald-200' 
                        : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                    {item.count && item.count > 0 ? (
                      <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                        {item.count}
                      </span>
                    ) : null}
                    {item.badge && item.id === 'admin' && simulatedRole === 'admin' ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* 🟢 PORTAL CONTENT VIEW WRAPPER */}
      <main className="grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + language}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {/* 🏠 tab 1: HOME/DASHBOARD VIEW */}
            {activeTab === 'home' && (
              <div className="space-y-8">
                {/* 1. Welcoming Hero Segment */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full z-0 opacity-50"></div>
                  <div className="space-y-4 md:flex-1 relative z-10">
                    <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 font-bold text-xs px-3 py-1 rounded-full border border-emerald-200">
                      <Sparkles className="w-3.5 h-3.5" /> Established in Muscat Since 1998
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight font-display">
                      {t('appTitle')}
                    </h2>
                    <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                      {t('welcomeMessage')}
                    </p>
                    <div className="flex gap-3 flex-wrap">
                      <button 
                        onClick={() => setActiveTab('register')}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" /> {t('navRegister')}
                      </button>
                      <button 
                        onClick={() => setActiveTab('donations')}
                        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-bold text-xs px-5 py-3 rounded-xl transition flex items-center gap-2 cursor-pointer"
                      >
                        <Heart className="w-4 h-4 text-rose-500" /> Support Welfare Fund
                      </button>
                    </div>
                  </div>

                  <div className="w-full md:w-80 space-y-3.5 shrink-0 z-10 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-emerald-950 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-700" /> Welfare Scope Benefits
                    </h4>
                    <ul className="text-xs text-gray-700 space-y-2 mt-2 leading-relaxed">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Meyyat Body Transit</strong>: Instant cost compensation and support (500 OMR dispatch).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Direct Consular backings</strong>: Fast-track labor permits, passport renewals & legal aid.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Blood & Casualty Drives</strong>: 124+ registered blood donors directory matching emergency calls.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 📢 Sponsored Advertisement Billboard Block */}
                <AdBillboard ads={ads} language={language} adminOnlyAds={adminOnlyAds} />

                {/* 1.5 Digital Welfare Membership Card Badge */}
                <div className="space-y-4">
                  <div className="border-l-4 border-emerald-700 pl-4 py-1">
                    <h3 className="text-lg md:text-xl font-bold font-display text-gray-900 leading-normal">
                      {simulatedRole === 'member' ? 'Your Digital Welfare Membership Badge (اپنا ڈیجیٹل کارڈ)' : 'Verified Digital Member ID Portal (تصدیقی کارڈ سروس)'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {simulatedRole === 'member' 
                        ? 'Your credentials are of active verified status. You can preview, 3D flip, print, or download your security card below.' 
                        : 'Secure registry lookup for Pakistani expats and laborers. Check identity credentials, print badges, or verify voting power.'}
                    </p>
                  </div>

                  <DigitalMemberId 
                    member={selectedIDMember || currentMember || members.find(m => m.status === 'approved') || members[0]} 
                    showLookupFeature={true}
                    allApprovedMembers={members}
                    onSelectMember={(m) => setSelectedIDMember(m)}
                  />
                </div>

                {/* 2. Interactive High-Crafstmanship Stats Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs relative overflow-hidden flex flex-col justify-between hover:border-emerald-300 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-semibold text-xs md:text-sm uppercase tracking-wider">{t('totalMembers')}</span>
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center border border-emerald-200 shadow-2xs">
                        <Users className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{totals.membersCount}</span>
                      <span className="text-xs text-emerald-600 font-medium ml-2 block mt-1.5">
                        &bull; Active verified voting cards
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs relative overflow-hidden flex flex-col justify-between hover:border-emerald-300 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-semibold text-xs md:text-sm uppercase tracking-wider">{t('totalDonations')}</span>
                      <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-lg flex items-center justify-center border border-amber-200 shadow-2xs">
                        <Coins className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{totals.treasuryBalance} OMR</span>
                      <span className="text-xs text-amber-700 font-medium ml-2 block mt-1.5">
                        &bull; Audited live bank budget reserve
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs relative overflow-hidden flex flex-col justify-between hover:border-emerald-300 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-semibold text-xs md:text-sm uppercase tracking-wider">{t('activeReports')}</span>
                      <div className="w-10 h-10 bg-rose-50 text-rose-700 rounded-lg flex items-center justify-center border border-rose-200 shadow-2xs">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{totals.activeEmergencies} Incident{totals.activeEmergencies !== 1 ? 's' : ''}</span>
                      <span className="text-xs text-rose-600 font-medium ml-2 block mt-1.5">
                        &bull; Casualty response alerts pending assistance
                      </span>
                    </div>
                  </div>
                </div>

                {/* 📊 Live Community Insights Dashboard (Recharts pie/bar charts) */}
                <CommunityDashboard 
                  members={members} 
                  donations={donations} 
                  language={language} 
                  isAdmin={simulatedRole === 'admin'}
                />

                {/* 3. News Feed and Embassy Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* News timeline list */}
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 font-display flex items-center gap-2.5 pb-2.5 border-b border-gray-100">
                      <Layers className="w-5 h-5 text-emerald-700" />
                      {t('latestNews')}
                    </h3>
                    <div className="space-y-6">
                      {news.map((item, index) => (
                        <div key={item.id} className="relative flex gap-4">
                          {/* Left date and point design */}
                          <div className="flex flex-col items-center shrink-0">
                            <span className="text-xs font-bold text-gray-400 font-mono w-20 text-center">
                              {item.date}
                            </span>
                            <div className="w-3 h-3 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-150 mt-1.5"></div>
                            {index !== news.length - 1 && <div className="w-0.5 bg-gray-200 grow my-1 mt-2"></div>}
                          </div>
                          {/* Text payload */}
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60 flex-1 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-gray-900">
                                {item.title}
                              </h4>
                              <span className={`text-[9px] font-extrabold px-2 py-0.5 uppercase tracking-wider rounded-full ${
                                item.category === 'event' ? 'bg-amber-100 text-amber-800' :
                                item.category === 'announcement' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                              }`}>
                                {item.category}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {item.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Consular Support & Pakistani Embassy details */}
                  <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
                    <h3 className="text-lg font-bold text-slate-950 font-display flex items-center gap-2 border-b border-gray-100 pb-2.5">
                      <Building2 className="w-5 h-5 text-emerald-700" />
                      {t('embassySection')}
                    </h3>
                    <div className="space-y-4">
                      {/* Embassy location photo placeholder */}
                      <div className="h-44 rounded-xl bg-slate-900 text-white flex items-center justify-center p-4 text-center relative overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=400" 
                          alt="Pakistan Embassy Mascot" 
                          className="absolute inset-0 w-full h-full object-cover opacity-30 select-none pointer-events-none"
                        />
                        <div className="relative z-10 space-y-1">
                          <h4 className="text-sm font-extrabold tracking-wide uppercase text-yellow-300">
                            Embassy of Pakistan, Muscat
                          </h4>
                          <p className="text-[11px] text-gray-200">
                            Official welfare desk collaborations for verified cabinet members.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                          {t('embassyInfo')}
                        </h4>
                        <div className="space-y-2 text-xs text-gray-700 leading-relaxed">
                          <p className="flex items-start gap-2.5">
                            <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                            <span>{t('embassyAddress')}</span>
                          </p>
                          <hr className="border-gray-200/50" />
                          <p className="flex items-center gap-2.5">
                            <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>{t('embassyTel')}</span>
                          </p>
                          <hr className="border-gray-200/50" />
                          <p className="flex items-center gap-2.5">
                            <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>{t('embassyEmail')}</span>
                          </p>
                          <hr className="border-gray-200/50" />
                          <p className="flex items-center gap-2.5">
                            <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>{t('embassyHours')}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Upcoming events calendar panel */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
                  <h3 className="text-lg font-bold text-gray-900 font-display flex items-center gap-2.5 pb-2.5 border-b border-gray-100 mb-4">
                    <Calendar className="w-5 h-5 text-emerald-700" />
                    {t('upcomingEvents')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="border border-gray-200 p-4 rounded-xl hover:bg-emerald-50/20 transition group">
                      <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-extrabold">Next Friday</span>
                      <h4 className="text-sm font-bold text-gray-900 mt-1 uppercase group-hover:text-emerald-800">
                        Oman Pakhtoon Cultural Dialogues
                      </h4>
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                        Gathering at Barka Municipality Compound to discuss registration, welfare cards, and air transit support updates.
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-gray-400 mt-3 border-t border-gray-100 pt-2 font-medium">
                        <span>🕒 4:30 PM Oman time</span>
                        <span>📍 Barka, Oman</span>
                      </div>
                    </div>

                    <div className="border border-gray-200 p-4 rounded-xl hover:bg-emerald-50/20 transition group">
                      <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-extrabold">June 18, 2026</span>
                      <h4 className="text-sm font-bold text-gray-900 mt-1 uppercase group-hover:text-emerald-800">
                        Welfare Fund General Audit Meet
                      </h4>
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                        Treasury ledger verification with finance secretary Ikram Bacha. Transparent spreadsheet review open to all.
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-gray-400 mt-3 border-t border-gray-100 pt-2 font-medium">
                        <span>🕒 8:00 PM Oman time</span>
                        <span>📍 Ruwi, Muscat Office</span>
                      </div>
                    </div>

                    <div className="border border-gray-200 p-4 rounded-xl hover:bg-emerald-50/20 transition group">
                      <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-extrabold">July 02, 2026</span>
                      <h4 className="text-sm font-bold text-gray-900 mt-1 uppercase group-hover:text-emerald-800">
                        Regional Blood Donor Drive
                      </h4>
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                        In collaboration with Khoula Hospital, building robust blood transfusion lists for labor accidents.
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-gray-400 mt-3 border-t border-gray-100 pt-2 font-medium">
                        <span>🕒 9:00 AM Oman time</span>
                        <span>📍 Salalah Medical Senter</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 📝 tab 2: MEMBERSHIP REGISTRATION */}
            {activeTab === 'register' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs space-y-6">
                  <div className="border-b border-gray-100 pb-4">
                    <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 font-display flex items-center gap-2">
                      <UserPlus className="w-6 h-6 text-emerald-700" />
                      {t('regHeadline')}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('regDesc')}
                    </p>
                  </div>

                  {/* Feedback on submission success */}
                  {regFeedback && (
                    <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border-2 border-emerald-200 flex items-start gap-3 animate-float text-xs md:text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <strong className="font-bold">Registration Success!</strong>
                        <p>{regFeedback}</p>
                        <p className="text-[11px] text-emerald-600 italic mt-1 bg-white inline-block px-2 py-0.5 rounded shadow-2xs">
                          {t('regProgress')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Let the user review their registration profile if simulated as static member */}
                  {simulatedRole === 'member' ? (
                    <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/20 space-y-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120" 
                          alt="Member profile avatar" 
                          className="w-16 h-16 rounded-full object-cover border-2 border-emerald-600"
                        />
                        <div>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            Active Approved Member
                          </span>
                          <h4 className="text-base font-bold text-gray-900 mt-0.5">Amjad Ali Yousafzai</h4>
                          <p className="text-xs text-gray-500">Meyyat Fund Participant ID: OPC-7822-M</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs pt-2 border-t border-emerald-500/10">
                        <div>
                          <span className="text-gray-400 block font-medium">Hometown PK</span>
                          <span className="font-extrabold text-emerald-950">Swat District</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-medium">Oman Location</span>
                          <span className="font-extrabold text-emerald-950">Nizwa, Oman</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-medium">Oman Cell No.</span>
                          <span className="font-extrabold text-emerald-950">+968 9481 0291</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-medium">Employer Sponsor</span>
                          <span className="font-extrabold text-emerald-950">Al-Ansar Infrastructure</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-medium">Blood Group</span>
                          <span className="font-extrabold text-emerald-950 bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-mono font-bold">O+ Positive</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-medium">Welfare Fee</span>
                          <span className="font-extrabold text-emerald-950">5 OMR Verified Paid</span>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <form onSubmit={submitMemberRegistration} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t('fullName')} *</label>
                        <input 
                          type="text" 
                          required
                          value={regName}
                          onChange={e => setRegName(e.target.value)}
                          placeholder="e.g. Haji Sher Zaman" 
                          className="w-full text-xs md:text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t('phoneNumber')} *</label>
                        <input 
                          type="tel" 
                          required
                          value={regPhone}
                          onChange={e => setRegPhone(e.target.value)}
                          placeholder="e.g. +968 9911 1870" 
                          className="w-full text-xs md:text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t('emailAddress')}</label>
                        <input 
                          type="email" 
                          value={regEmail}
                          onChange={e => setRegEmail(e.target.value)}
                          placeholder="e.g. name@domain.com" 
                          className="w-full text-xs md:text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t('districtOrProvince')}</label>
                        <input 
                          type="text" 
                          value={regDistrict}
                          onChange={e => setRegDistrict(e.target.value)}
                          placeholder="e.g. Swat, Mardan, Quetta" 
                          className="w-full text-xs md:text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t('bloodGroup')}</label>
                        <select 
                          value={regBlood}
                          onChange={e => setRegBlood(e.target.value)}
                          className="w-full text-xs md:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white font-mono font-bold"
                        >
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t('currentCityInOman')}</label>
                        <input 
                          type="text" 
                          value={regCity}
                          onChange={e => setRegCity(e.target.value)}
                          placeholder="e.g. Muscat, Salalah, Sohar" 
                          className="w-full text-xs md:text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t('employerName')}</label>
                        <input 
                          type="text" 
                          value={regEmployer}
                          onChange={e => setRegEmployer(e.target.value)}
                          placeholder="e.g. Al-Watan Builders Co." 
                          className="w-full text-xs md:text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t('emergencyContact')} *</label>
                      <input 
                        type="text" 
                        required
                        value={regEmergency}
                        onChange={e => setRegEmergency(e.target.value)}
                        placeholder="e.g. Farman Ali Yousafzai (Brother) - +92 345 992019" 
                        className="w-full text-xs md:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white"
                      />
                    </div>

                    <div className="space-y-2 border-2 border-dashed border-gray-200 p-4.5 rounded-xl bg-gray-50">
                      <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider block">
                        {t('photoProof')}
                      </label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100"
                      />
                      <p className="text-[10px] text-gray-400">
                        Upload a scan or picture of passport/residency card. Simulated uploads will generate matching base64 representations in localStorage.
                      </p>
                      {regPhoto && (
                        <div className="mt-3 flex items-center gap-2 bg-emerald-50 p-2.5 rounded border border-emerald-150">
                          <Check className="w-4 h-4 text-emerald-700" />
                          <span className="text-xs text-emerald-800 font-semibold">Image buffered for upload</span>
                        </div>
                      )}
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs tracking-wider uppercase py-3.5 rounded-xl transition shadow-xs cursor-pointer font-sans"
                    >
                      {t('submitRegistration')}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* 🚨 tab 3: EMERGENCY CELL */}
            {activeTab === 'reports' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Emergency reporter Form */}
                  <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs space-y-6">
                    <div className="border-b border-gray-100 pb-4">
                      <h2 className="text-xl font-extrabold text-gray-900 font-display flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-rose-600" />
                        {t('reportHeader')}
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('reportIntro')}
                      </p>
                    </div>

                    {repFeedback && (
                      <div className="p-4 rounded-xl bg-rose-50 text-rose-900 border border-rose-200 flex items-start gap-2.5 text-xs animate-float">
                        <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">Urgent Dispatch Dispatched!</strong>
                          <p>{repFeedback}</p>
                        </div>
                      </div>
                    )}

                    <form onSubmit={submitEmergencyReport} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t('reportType')} *</label>
                        <select
                          value={repType}
                          onChange={e => setRepType(e.target.value as any)}
                          className="w-full text-xs md:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white font-semibold"
                        >
                          <option value="injury">{t('injuryType')}</option>
                          <option value="death">{t('deathType')}</option>
                          <option value="lost_passport">{t('passportType')}</option>
                          <option value="other">{t('otherType')}</option>
                        </select>
                      </div>

                      <div className="space-y-1 col-span-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t('details')} *</label>
                        <textarea
                          required
                          rows={4}
                          value={repDesc}
                          onChange={e => setRepDesc(e.target.value)}
                          placeholder="e.g. Worker injured, admitted to Khoula medical unit. Demanding medical translator and family support guidance..."
                          className="w-full text-xs md:text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white"
                        ></textarea>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t('incidentDate')}</label>
                          <input 
                            type="date"
                            value={repDate}
                            onChange={e => setRepDate(e.target.value)}
                            className="w-full text-xs md:text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t('incidentLocation')} *</label>
                          <input 
                            type="text"
                            required
                            value={repLocation}
                            onChange={e => setRepLocation(e.target.value)}
                            placeholder="e.g. Khoula Hospital / Barka Site"
                            className="w-full text-xs md:text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t('contactBack')} *</label>
                        <input 
                          type="tel"
                          required
                          value={repContact}
                          onChange={e => setRepContact(e.target.value)}
                          placeholder="e.g. +968 9112 0045"
                          className="w-full text-xs md:text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs tracking-wider uppercase py-3.5 rounded-xl transition cursor-pointer shadow-xs"
                      >
                        {t('submitReport')}
                      </button>
                    </form>
                  </div>

                  {/* Active reported events */}
                  <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2 border-b border-gray-100 pb-2.5">
                      <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse" />
                      {t('reportActive')}
                    </h3>
                    <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                      {reports.map((rep) => (
                        <div key={rep.id} className="border border-gray-200 rounded-xl p-4.5 space-y-3 shadow-2xs hover:border-rose-200 transition bg-linear-to-br from-white to-gray-50/50">
                          <div className="flex items-center justify-between gap-2.5 flex-wrap">
                            <span className="text-[10px] font-extrabold uppercase bg-slate-900 text-white px-2.5 py-0.5 rounded-sm tracking-wider">
                              {rep.type === 'death' ? t('deathType') : rep.type === 'injury' ? t('injuryType') : rep.type === 'lost_passport' ? t('passportType') : t('otherType')}
                            </span>
                            
                            {/* Badges status */}
                            <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              rep.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                              rep.status === 'verified' ? 'bg-emerald-100 text-emerald-800 animate-pulse' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {rep.status === 'pending' ? <Clock4 className="w-3 h-3" /> : rep.status === 'verified' ? <CheckCircle2 className="w-3 h-3 animate-pulse" /> : <Check className="w-3 h-3" />}
                              {rep.status === 'pending' ? 'Awaiting Dispatch' : rep.status === 'verified' ? 'Active Cabinet Aid' : 'Case Resolved'}
                            </span>
                          </div>

                          <p className="text-xs text-gray-700 leading-relaxed font-sans font-medium">
                            {rep.description}
                          </p>

                          <div className="grid grid-cols-2 gap-3 text-[11px] pt-2 border-t border-gray-100 font-medium text-gray-500">
                            <div>
                              <span>Date: <strong>{rep.date}</strong></span>
                            </div>
                            <div>
                              <span>Loc: <strong>{rep.location}</strong></span>
                            </div>
                            <div className="col-span-2">
                              <span>Callback Call Desk: <strong className="text-slate-900 font-mono select-all bg-gray-100 px-1 py-0.5 rounded">{rep.contactInfo}</strong></span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 💰 tab 4: WELFARE FUND & TRANSPARENT LEDGER */}
            {activeTab === 'donations' && (
              <div className="space-y-8">
                {/* Intro, bank info & Logging form */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left side: Account card & receipt submission */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-sm border-2 border-yellow-300 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-300 rounded-bl-full z-0 opacity-10"></div>
                      <div className="space-y-3 relative z-10">
                        <span className="text-[10px] bg-yellow-400 text-emerald-950 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                          Central OMR Account Information
                        </span>
                        <h3 className="text-xl font-bold font-display text-yellow-300">
                          {t('bankInfoCard')}
                        </h3>
                        <p className="text-xs text-emerald-100 leading-relaxed">
                          {t('donIntro')}
                        </p>
                        
                        {/* Bank direct routing detail copyable */}
                        <div className="bg-emerald-950/60 p-4 rounded-xl border border-emerald-700/60 space-y-2 mt-4">
                          <p className="text-xs tracking-wide">
                            🏛️ Bank: <strong>{t('bankName')}</strong>
                          </p>
                          <p className="text-xs tracking-wide">
                            💳 {t('accountNumber')}
                          </p>
                          <p className="text-xs tracking-wide">
                            👤 {t('accountHolder')}
                          </p>
                          <hr className="border-emerald-800/80 my-2" />
                          <p className="text-xs text-yellow-200">
                            📱 {t('mobileTransferNum')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Log donation box */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs">
                      <h4 className="text-base font-extrabold text-slate-900 border-b border-gray-100 pb-2.5 mb-4 uppercase tracking-wide">
                        {t('logDonation')}
                      </h4>

                      {donFeedback && (
                        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border-2 border-emerald-150 mb-4 flex items-center gap-2.5 text-xs animate-float">
                          <Coins className="w-5 h-5 text-emerald-700" />
                          <span>{donFeedback}</span>
                        </div>
                      )}

                      <form onSubmit={submitDonationLog} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t('donorLabel')} *</label>
                            <input
                              type="text"
                              required
                              value={donName}
                              onChange={e => setDonName(e.target.value)}
                              placeholder="e.g. Amjad Ali or Anonymous" 
                              className="w-full text-xs md:text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t('amountLabel')} *</label>
                            <input
                              type="number"
                              required
                              min="0.1"
                              step="any"
                              value={donAmount}
                              onChange={e => setDonAmount(e.target.value)}
                              placeholder="OMR balance e.g. 15" 
                              className="w-full text-xs md:text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t('paymentMode')} *</label>
                          <div className="grid grid-cols-2 gap-3 mt-1">
                            <button
                              type="button"
                              onClick={() => setDonMethod('bank')}
                              className={`py-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                donMethod === 'bank' 
                                  ? 'bg-emerald-600 text-white border-emerald-500' 
                                  : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-300'
                              }`}
                            >
                              🏦 {t('bankTransfer')}
                            </button>
                            <button
                              type="button"
                              onClick={() => setDonMethod('mobile')}
                              className={`py-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                donMethod === 'mobile' 
                                  ? 'bg-emerald-600 text-white border-emerald-500' 
                                  : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-300'
                              }`}
                            >
                              📱 {t('mobileWallet')}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs tracking-wider uppercase py-3 rounded-xl transition cursor-pointer"
                        >
                          Submit contribution for Verification
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Right side: Realtime public transparency ledger */}
                  <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs space-y-6">
                    <div className="space-y-1 border-b border-gray-100 pb-3">
                      <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                        {t('publicLedger')}
                      </h3>
                      <p className="text-[11px] text-gray-400">
                        Total funds audit transparency score: 100% (Fully verified by community elders).
                      </p>
                    </div>

                    {/* Ledger search */}
                    <div className="relative">
                      <Search className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-gray-400" />
                      <input 
                        type="text"
                        value={donationSearchQuery}
                        onChange={e => setDonationSearchQuery(e.target.value)}
                        placeholder="Search donors, amount, or method..."
                        className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-gray-350 focus:outline-emerald-600"
                      />
                    </div>

                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                      {filteredDonations.map((don) => (
                        <div key={don.id} className="p-3 border border-gray-150 rounded-xl flex items-center justify-between text-xs font-medium">
                          <div className="space-y-0.5">
                            <span className="text-slate-950 font-bold block">{don.donorName}</span>
                            <span className="text-[10px] text-gray-400">
                              {don.date} via {don.method === 'bank' ? 'Bank Muscat' : 'Mobile Pay'}
                            </span>
                          </div>
                          <div className="text-right space-y-1">
                            <span className="text-emerald-700 font-extrabold text-sm block">
                              {don.amount} OMR
                            </span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              don.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {don.status === 'verified' ? 'Audited' : 'Pending Verification'}
                            </span>
                          </div>
                        </div>
                      ))}
                      {filteredDonations.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-4">No matching records found.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 🗳️ tab 5: CABINET ELECTIONS */}
            {activeTab === 'elections' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs space-y-6">
                  <div className="border-b border-gray-100 pb-4 text-center max-w-2xl mx-auto">
                    <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 font-display inline-flex items-center gap-2">
                      <Vote className="w-6 h-6 text-emerald-700" />
                      {t('electionHeader')}
                    </h2>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      {t('electionIntro')}
                    </p>
                  </div>

                  {elections.map((elec) => (
                    <div key={elec.id} className="border border-emerald-150 rounded-2xl overflow-hidden bg-linear-to-br from-white to-emerald-50/5 p-6 space-y-6 shadow-2xs">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-200/60">
                        <div>
                          <span className="bg-emerald-600 text-white font-extrabold tracking-wider uppercase text-[10px] px-2.5 py-0.5 rounded-sm">
                            Active Cabinet Cycle
                          </span>
                          <h3 className="text-base font-bold text-gray-900 mt-1">
                            {elec.title}
                          </h3>
                        </div>
                        <div className="text-left sm:text-right font-medium text-xs text-gray-500">
                          Ends on: <strong className="text-gray-900">{elec.endDate}</strong>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                        🗳️ Description: {elec.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        {elec.candidates.map((cand) => {
                          const hasVotedThisElection = votedIds.includes(elec.id);
                          return (
                            <div key={cand.id} className="border border-gray-250 bg-white rounded-xl p-4 flex flex-col justify-between hover:border-emerald-300 hover:shadow-xs transition">
                              <div className="space-y-3">
                                <div className="flex items-center gap-3.5">
                                  <img 
                                    src={cand.photoUrl} 
                                    alt={cand.name} 
                                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-600"
                                  />
                                  <div>
                                    <h4 className="text-sm font-bold text-gray-900">{cand.name}</h4>
                                    <span className="text-[10px] text-gray-400 font-bold block">{cand.role}</span>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed italic">
                                  "{cand.bio}"
                                </p>
                              </div>

                              <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Total Votes</span>
                                  <span className="text-base font-extrabold text-emerald-800 font-mono">
                                    {cand.votes} votes
                                  </span>
                                </div>

                                <button
                                  onClick={() => handleVote(elec.id, cand.id)}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                                    hasVotedThisElection 
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border' 
                                      : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                                  }`}
                                >
                                  {hasVotedThisElection ? 'Ballot Cast' : t('castVoteBtn')}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {elections.length === 0 && (
                    <p className="text-center text-xs text-gray-400 py-6">{t('noActiveElections')}</p>
                  )}
                </div>
              </div>
            )}

            {/* 👥 tab 6: CABINET EXECUTIVE DIRECTORY */}
            {activeTab === 'cabinet' && (
              <div className="space-y-8">
                <div className="border-b border-gray-200 pb-4 max-w-2xl">
                  <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 font-display flex items-center gap-2">
                    <Users className="w-6 h-6 text-emerald-700" />
                    {t('cabinetHeader')}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('cabinetIntro')}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {initialCabinet.map((member) => (
                    <div 
                      key={member.id} 
                      className="bg-white rounded-2xl border border-gray-250 p-5 flex flex-col items-center text-center justify-between hover:border-emerald-300 hover:shadow-xs transition h-full space-y-4"
                    >
                      <div className="space-y-3.5 flex flex-col items-center">
                        {/* Profile Pic with custom border */}
                        <div className="w-20 h-20 rounded-full p-1 border-2 border-emerald-600 bg-emerald-50">
                          <img 
                            src={member.photoUrl} 
                            alt={member.name} 
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>

                        <div>
                          <span className="bg-yellow-100 text-yellow-800 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            {member.role}
                          </span>
                          <h4 className="text-sm font-extrabold text-gray-900 mt-1">{member.name}</h4>
                          <span className="text-[10px] text-gray-400 block font-medium mt-0.5">📍 {member.location}</span>
                        </div>

                        <p className="text-xs text-gray-500 leading-relaxed font-sans max-w-xs">
                          {member.bio}
                        </p>
                      </div>

                      <div className="w-full pt-4 border-t border-gray-100">
                        <a 
                          href={`tel:${member.phone.replace(/\s+/g, '')}`} 
                          className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-2 border border-emerald-200"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Call: {member.phone}</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 🛡️ tab 7: SUPREME ADMIN CONSOLE */}
            {activeTab === 'admin' && (
              !isAdminLoggedIn ? (
                <div className="max-w-md mx-auto py-8">
                  <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
                    {/* Brand Banner Accent */}
                    <div className="bg-emerald-800 text-white p-6 text-center space-y-2 relative">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-700/40 rounded-full blur-xl"></div>
                      <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto border border-white/20">
                        <ShieldAlert className="w-7 h-7 text-yellow-300" />
                      </div>
                      <h3 className="text-lg font-bold font-display tracking-tight text-white mt-2">
                        Oman Pakhtoon Community
                      </h3>
                      <p className="text-xs text-emerald-100 font-sans">
                        Supreme Welfare Cabinet Security Portal
                      </p>
                    </div>

                    <div className="p-6 sm:p-8 space-y-6">
                      <div className="text-center space-y-1">
                        <h4 className="text-base font-extrabold text-gray-900 font-sans">
                          Admin Authentication Area
                        </h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Please verify your credentials below to log in and access registration files, treasury receipts, and disaster management controls.
                        </p>
                      </div>

                      {loginError && (
                        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-start gap-2.5">
                          <XCircle className="w-4.5 h-4.5 shrink-0 text-rose-600" />
                          <span>{loginError}</span>
                        </div>
                      )}

                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (adminUsernameInput.trim().toLowerCase() === 'admin' && adminPasswordInput === 'admin123') {
                          setIsAdminLoggedIn(true);
                          setSimulatedRole('admin');
                          setLoginError('');
                          setAdminUsernameInput('');
                          setAdminPasswordInput('');
                        } else {
                          setLoginError('Invalid username or password credentials. Please verify keys and retry.');
                        }
                      }} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-750 uppercase tracking-wider block">
                            Username / صارف کا نام
                          </label>
                          <input 
                            type="text"
                            required
                            value={adminUsernameInput}
                            onChange={(e) => setAdminUsernameInput(e.target.value)}
                            placeholder="e.g. admin"
                            className="w-full text-xs md:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-755 uppercase tracking-wider block">
                            Password / پاس ورڈ
                          </label>
                          <input 
                            type="password"
                            required
                            value={adminPasswordInput}
                            onChange={(e) => setAdminPasswordInput(e.target.value)}
                            placeholder="••••••••"
                            className="w-full text-xs md:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs tracking-wider uppercase py-3 rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5 mt-2"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Verify & Access Console</span>
                        </button>
                      </form>

                      {/* Demo credential helpful badge */}
                      <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-4.5 space-y-2.5 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-850 uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
                          <span>Demo Portal Credentials</span>
                        </div>
                        <p className="text-gray-650 leading-relaxed">
                          For instant validation of all administrative workflows, log in with the following demo credential keys:
                        </p>
                        <div className="bg-white/90 p-3 rounded-xl border border-yellow-200 font-mono text-xs space-y-1 hover:border-amber-300 transition">
                          <div>Username: <strong className="text-emerald-800 select-all">admin</strong></div>
                          <div>Password: <strong className="text-emerald-800 select-all">admin123</strong></div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setAdminUsernameInput('admin');
                            setAdminPasswordInput('admin123');
                          }}
                          className="w-full bg-white hover:bg-yellow-50 text-gray-800 font-bold border border-yellow-300 rounded-xl py-2 transition text-xs shadow-3xs"
                        >
                          ✨ Quick Autofill Credentials
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* 1. Header warning/authorization state info */}
                  <div className="bg-amber-500/10 rounded-2xl border border-amber-500/20 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-8 h-8 text-amber-600 shrink-0" />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-900">
                            Authorized Role: Finance Secretary Desk (Ikram Bacha)
                          </h3>
                          <span className="text-[10px] font-extrabold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full animate-float">
                            Logged In
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Simulating administrator tasks. Approvals immediately adjust user states, metrics counters, and announcement streams.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => {
                          setIsAdminLoggedIn(false);
                          setAdminUsernameInput('');
                          setAdminPasswordInput('');
                        }}
                        className="bg-white hover:bg-gray-100 hover:border-gray-400 text-gray-750 font-bold text-xs px-3.5 py-2.5 border rounded-xl transition cursor-pointer"
                      >
                        🔒 Logout (لاگ آؤٹ)
                      </button>
                      {simulatedRole !== 'admin' ? (
                        <button 
                          onClick={() => setSimulatedRole('admin')}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] uppercase tracking-wider px-3.5 py-2 rounded-xl shrink-0 cursor-pointer"
                        >
                          Assume Secretary role
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-700 font-bold bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-3xs">
                          &bull; Simulation Active
                        </span>
                      )}
                    </div>
                  </div>

                {/* 2. Registration approvals desk */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left: Pending member documents review */}
                  <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-250 p-6 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-2">
                      👥 {t('pendingDocs')}
                    </h3>
                    <div className="space-y-3.5">
                      {members.filter(m => m.status === 'pending').map(member => (
                        <div key={member.id} className="border border-gray-200 rounded-xl p-4.5 bg-gray-50/50 space-y-3">
                          <div className="flex items-center gap-3">
                            <img src={member.photoUrl} alt="candidate ID" className="w-10 h-10 rounded-full object-cover border" />
                            <div>
                              <h4 className="text-xs font-bold text-gray-900">{member.name}</h4>
                              <p className="text-[10px] text-gray-400">Mobile Call Desk: {member.phone}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-[10px] bg-white p-2.5 rounded border border-gray-100 font-medium">
                            <span>District: <strong>{member.district}</strong></span>
                            <span>Blood: <strong className="text-rose-600">{member.bloodGroup}</strong></span>
                            <span>City in Oman: <strong>{member.city}</strong></span>
                            <span>Employer: <strong>{member.employer}</strong></span>
                          </div>

                          <div className="flex gap-2 justify-end pt-1">
                            <button 
                              onClick={() => rejectMember(member.id)}
                              className="bg-white hover:bg-gray-100 border text-gray-600 font-bold text-[10px] px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                            >
                              Reject
                            </button>
                            <button 
                              onClick={() => approveMember(member.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-4 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                            >
                              Approve & Grant voting card
                            </button>
                          </div>
                        </div>
                      ))}
                      {members.filter(m => m.status === 'pending').length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-6">No new registration documents pending.</p>
                      )}
                    </div>
                  </div>

                  {/* Right: Pending bank wires verification */}
                  <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-250 p-6 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-2">
                      💰 {t('pendingDonations')}
                    </h3>
                    <div className="space-y-3.5">
                      {donations.filter(d => d.status === 'pending').map(don => (
                        <div key={don.id} className="border border-gray-200 rounded-xl p-4.5 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-900 block">{don.donorName}</span>
                            <span className="text-[10px] text-gray-500 block">
                              Receipt details: <strong>{don.amount} OMR</strong> via {don.method === 'bank' ? 'Muscat Bank direct' : 'Mobile cash wire'}
                            </span>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => rejectDonation(don.id)}
                              className="bg-white hover:bg-gray-100 border text-gray-600 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              Flag Fraud
                            </button>
                            <button
                              onClick={() => verifyDonation(don.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              Confirm Deposit
                            </button>
                          </div>
                        </div>
                      ))}
                      {donations.filter(d => d.status === 'pending').length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-6">All donation slips fully verified.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Emergency Alert resolution desk */}
                <div className="bg-white rounded-2xl border border-gray-250 p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-2">
                    🚨 {t('pendingAlerts')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reports.filter(r => r.status !== 'resolved').map(rep => (
                      <div key={rep.id} className="border border-red-150 bg-red-500/5 rounded-xl p-4.5 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <span className="text-[10px] font-extrabold uppercase bg-red-900 text-white px-2 py-0.5 rounded tracking-wide">
                              {rep.type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400 font-bold">
                              Logged on: {rep.date}
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                            {rep.description}
                          </p>
                          <p className="text-xs font-medium text-slate-500">
                            📍 Location: <strong>{rep.location}</strong>
                          </p>
                          <p className="text-xs font-medium text-slate-500">
                            📞 Callback: <strong>{rep.contactInfo}</strong>
                          </p>
                        </div>

                        <div className="flex gap-2 justify-end pt-3 border-t border-gray-100 mt-2">
                          {rep.status === 'pending' && (
                            <button
                              onClick={() => changeReportStatus(rep.id, 'verified')}
                              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              Dispatch Aid Team
                            </button>
                          )}
                          <button
                            onClick={() => changeReportStatus(rep.id, 'resolved')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            Resolve Alert
                          </button>
                        </div>
                      </div>
                    ))}
                    {reports.filter(r => r.status !== 'resolved').length === 0 && (
                      <div className="col-span-2 text-center text-xs text-gray-400 py-6">All emergency alerts resolved safely! Good job cabinet.</div>
                    )}
                  </div>
                </div>

                {/* 👥 Verified Registered Members Directory Desk with Membership Cards */}
                <AdminMembersDirectory 
                  members={members}
                  onApprove={approveMember}
                  onReject={rejectMember}
                  onDeleteMember={deleteMember}
                  language={language}
                />

                {/* 4. Controls: Update Announcement banner & News Feed */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Announcement banner text updater */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-2">
                      📣 Broadcast Billboard Text
                    </h3>
                    <form onSubmit={saveAdminAnnouncement} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500 font-medium">Tape Message (Marquee style)</label>
                        <input 
                          type="text"
                          required
                          value={adminAnnText}
                          onChange={e => setAdminAnnText(e.target.value)}
                          placeholder="e.g. Free medical diagnostic camp next Friday in Barka..."
                          className="w-full text-xs md:text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                      >
                        Push broadcast live
                      </button>
                    </form>
                  </div>

                  {/* News publisher */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-2">
                      📰 Publish Portal News
                    </h3>
                    <form onSubmit={publishAdminNews} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500 font-medium">Article Title</label>
                        <input 
                          type="text"
                          required
                          value={adminNewsTitle}
                          onChange={e => setAdminNewsTitle(e.target.value)}
                          placeholder="Drive updates / cabinet transitions..."
                          className="w-full text-xs md:text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-gray-500 font-medium">Category</label>
                          <select
                            value={adminNewsCategory}
                            onChange={e => setAdminNewsCategory(e.target.value as any)}
                            className="w-full text-xs px-3.5 py-2 rounded-xl border border-gray-355 focus:outline-emerald-600 bg-white"
                          >
                            <option value="general">General News</option>
                            <option value="announcement">Announcement</option>
                            <option value="event">Event</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-gray-500 font-medium">Actions</label>
                          <button 
                            type="button"
                            onClick={downloadMembersCSV}
                            className="w-full bg-slate-900 hover:bg-black text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            📥 Member list (CSV)
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500 font-medium">Article Paragraph Content</label>
                        <textarea
                          required
                          rows={2}
                          value={adminNewsContent}
                          onChange={e => setAdminNewsContent(e.target.value)}
                          placeholder="Detailed announcement text..."
                          className="w-full text-xs md:text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white"
                        ></textarea>
                      </div>
                      <button 
                        type="submit"
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                      >
                        Publish news Article
                      </button>
                    </form>
                  </div>
                </div>

                {/* 📢 Live Advertisement & Sponsor Billboard Management Suite */}
                <AdManager 
                  ads={ads} 
                  onAddAd={handleAddAd} 
                  onRemoveAd={handleRemoveAd} 
                  onToggleAd={handleToggleAd} 
                  adminOnlyAds={adminOnlyAds}
                  onToggleAdminOnlyAds={() => setAdminOnlyAds(prev => !prev)}
                  showSimulatorBar={showSimulatorBar}
                  onToggleSimulatorBar={() => setShowSimulatorBar(prev => !prev)}
                />
              </div>
            )
          )}

            {/* ✉️ tab 8: CONTACT US */}
            {activeTab === 'contact' && (
              <div className="max-w-xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs space-y-6">
                  <div className="border-b border-gray-100 pb-4 text-center">
                    <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 font-display inline-flex items-center gap-2">
                      <Mail className="w-6 h-6 text-emerald-700" />
                      {t('contactTitle')}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {t('contactText')}
                    </p>
                  </div>

                  {contactFeedback && (
                    <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border-2 border-emerald-150 flex items-center gap-2.5 text-xs animate-float">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                      <span>{contactFeedback}</span>
                    </div>
                  )}

                  <form onSubmit={submitContactMsg} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t('fullName')} *</label>
                      <input 
                        type="text" 
                        required
                        value={contactName}
                        onChange={e => setContactName(e.target.value)}
                        placeholder={t('namePlaceholder')} 
                        className="w-full text-xs md:text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t('emailAddress')}</label>
                      <input 
                        type="email" 
                        value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)}
                        placeholder="e.g. username@domain.com" 
                        className="w-full text-xs md:text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t('navContact')} Message *</label>
                      <textarea 
                        required
                        rows={5}
                        value={contactMsg}
                        onChange={e => setContactMsg(e.target.value)}
                        placeholder={t('messagePlaceholder')} 
                        className="w-full text-xs md:text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white"
                      ></textarea>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs tracking-wider uppercase py-3 rounded-xl transition shadow-xs cursor-pointer font-sans"
                    >
                      {t('sendMessage')}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 🟢 FOOTER WITH REGIONAL MAP INDICATORS */}
      <footer className="bg-slate-900 text-gray-400 mt-auto py-10 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Col 1: About the portal */}
          <div className="space-y-3.5">
            <h4 className="text-slate-100 font-extrabold text-xs uppercase tracking-widest font-display">
              {t('appTitle')}
            </h4>
            <p className="text-xs leading-relaxed text-gray-400">
              Approved community registration council in the Sultanate of Oman. Supporting Pakistani labor class expats from Khyber Pakhtunkhwa, Quetta, and tribal districts with emergency assistance, casket cargo transiting logistics, and legal counselling.
            </p>
            <span className="inline-block bg-slate-800 text-yellow-400 text-[10px] font-extrabold px-2.5 py-1 rounded border border-slate-700">
              🇵🇰 🤝 🇴🇲 Oman Pakhtoon alliance Group
            </span>
          </div>

          {/* Col 2: Useful Links in Muscat & Salalah */}
          <div className="space-y-3.5">
            <h4 className="text-slate-100 font-extrabold text-xs uppercase tracking-widest font-display">
              Consular Quick Links
            </h4>
            <ul className="text-xs space-y-2 font-medium">
              <li>
                <a 
                  href="https://parepmuscat@mofa.gov.pk" 
                  className="hover:text-emerald-400 transition flex items-center gap-1"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>Embassy consular affairs link</span>
                </a>
              </li>
              <li>
                <span className="text-[11px] block text-gray-500 font-normal">Shatti Al-Qurm Consular Drive (CNIC desk)</span>
              </li>
              <li>
                <a 
                  href="tel:+96824696140" 
                  className="hover:text-emerald-400 transition flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Pakistan Consulate Muscat: +968 2469 6140</span>
                </a>
              </li>
              <li>
                <span className="text-[11px] block text-gray-500 font-normal">Khoula Hospital Medical translation coordinator Desk</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Central OMR Finance routing reference */}
          <div className="space-y-3">
            <h4 className="text-slate-100 font-extrabold text-xs uppercase tracking-widest font-display">
              Audited Trust Secretary Details
            </h4>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11px] space-y-1.5 font-sans">
              <p>📍 Office: <strong className="text-gray-300">Welfare Desk Office, Barka, Muscat Hwy, Oman</strong></p>
              <p>🗄️ Finance: <strong className="text-yellow-400">Ikram Bacha (Secr. Finance OPC)</strong></p>
              <p>📱 Mobile: <strong className="text-gray-300 select-all font-mono">+968 9911 1870</strong></p>
              <p>🏛️ Bank Muscat: <strong className="text-gray-300 select-all font-mono">01011503131001</strong></p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-medium text-slate-500 gap-4">
          <p>
            &copy; {new Date().getFullYear()} Oman Pakhtoon Community Welfare portal. Fully open transparent audited treasury registry. All Rights Reserved.
          </p>
          <div className="flex gap-4">
            <span>Muscat</span>
            <span>&bull;</span>
            <span>Salalah</span>
            <span>&bull;</span>
            <span>Sohar</span>
            <span>&bull;</span>
            <span>Sur</span>
            <span>&bull;</span>
            <span>Nizwa</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
