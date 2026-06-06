import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Activity, 
  Users, 
  Languages, 
  Vote, 
  Newspaper, 
  Send, 
  ShieldAlert, 
  Building, 
  PlusCircle, 
  Check, 
  MapPin, 
  HelpCircle, 
  Download,
  LayoutDashboard
} from 'lucide-react';
import { 
  testConnection, 
  seedAllCollections, 
  fetchCollection, 
  saveDocument, 
  deleteDocument 
} from './firebaseSync';
import { 
  initialMembers, 
  initialReports, 
  initialDonations, 
  initialElections, 
  initialNews, 
  initialAds 
} from './initialData';
import { 
  Member, 
  EmergencyReport, 
  Donation, 
  Election, 
  NewsItem, 
  Advertisement, 
  ContactMessage, 
  Language
} from './types';
import { t } from './i18n';
import { generateDonationReceipt } from './utils/receiptGenerator';
import { CommunityDashboard } from './components/CommunityDashboard';
import { AdminMembersDirectory } from './components/AdminMembersDirectory';
import { AdminControlPanel } from './components/AdminControlPanel';

export default function App() {
  // --- Localisation State ---
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('opc_lang');
    return (saved as Language) || 'en';
  });

  // --- Theme Contrast state ---
  const [isHighContrast, setIsHighContrast] = useState(true);

  // --- Active Tab State ---
  const [activeTab, setActiveTab] = useState('dashboard');

  // --- Simulate User Role State ---
  const [activeRole, setActiveRole] = useState<'guest' | 'member' | 'admin'>(() => {
    const saved = localStorage.getItem('opc_role');
    return (saved as 'guest' | 'member' | 'admin') || 'guest';
  });

  // --- Firestore Content Data State ---
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [reports, setReports] = useState<EmergencyReport[]>(initialReports);
  const [donations, setDonations] = useState<Donation[]>(initialDonations);
  const [elections, setElections] = useState<Election[]>(initialElections);
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [ads, setAds] = useState<Advertisement[]>(initialAds);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // --- Sync State Status Indicator ---
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  // --- Action Feedback Alerts ---
  const [feedback, setFeedback] = useState<string | null>(null);

  // --- Interactive Forms State ---
  // Registration
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regOmaniId, setRegOmaniId] = useState('');
  const [regPassport, setRegPassport] = useState('');
  const [regStay, setRegStay] = useState('');
  const [regProfession, setRegProfession] = useState('');
  const [regWelfareEligible, setRegWelfareEligible] = useState(true);

  // Crisis Alert Dispatcher
  const [repName, setRepName] = useState('');
  const [repPhone, setRepPhone] = useState('');
  const [repSeverity, setRepSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [repCategory, setRepCategory] = useState<'death' | 'accident' | 'lost_passport' | 'medical_need' | 'general'>('medical_need');
  const [repLocation, setRepLocation] = useState('');
  const [repDescription, setRepDescription] = useState('');

  // Donation Submission Slip
  const [donName, setDonName] = useState('');
  const [donAmount, setDonAmount] = useState('');
  const [donMethod, setDonMethod] = useState<'bank' | 'mobile_pay'>('bank');
  const [donTxnId, setDonTxnId] = useState('');

  // Submit Feedback Box
  const [msgName, setMsgName] = useState('');
  const [msgEmail, setMsgEmail] = useState('');
  const [msgSubject, setMsgSubject] = useState('Suggestion');
  const [msgBody, setMsgBody] = useState('');

  // Cast Ballots tracking
  const [votedElections, setVotedElections] = useState<string[]>([]);

  // Ads Index carousel tracking
  const [activeAdIndex, setActiveAdIndex] = useState(0);

  // --- Firebase Seeding and Live Fetching ---
  useEffect(() => {
    async function initFirestore() {
      try {
        await testConnection();
        await seedAllCollections();
        
        // Fetch Live Collections
        const fetchedMembers = await fetchCollection<Member>('members');
        const fetchedReports = await fetchCollection<EmergencyReport>('reports');
        const fetchedDonations = await fetchCollection<Donation>('donations');
        const fetchedElections = await fetchCollection<Election>('elections');
        const fetchedNews = await fetchCollection<NewsItem>('news');
        const fetchedAds = await fetchCollection<Advertisement>('advertisements');
        const fetchedMsgs = await fetchCollection<ContactMessage>('contactMessages');

        if (fetchedMembers.length > 0) setMembers(fetchedMembers);
        if (fetchedReports.length > 0) setReports(fetchedReports);
        if (fetchedDonations.length > 0) setDonations(fetchedDonations);
        if (fetchedElections.length > 0) setElections(fetchedElections);
        if (fetchedNews.length > 0) setNews(fetchedNews);
        if (fetchedAds.length > 0) setAds(fetchedAds);
        if (fetchedMsgs.length > 0) setMessages(fetchedMsgs);

        setIsOnline(true);
      } catch (err) {
        console.warn("Using offline standalone states due to network boundaries:", err);
        setIsOnline(false);
      } finally {
        setIsLoading(false);
      }
    }
    initFirestore();
  }, []);

  // Sync state variables across localStorage fallback
  useEffect(() => {
    localStorage.setItem('opc_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('opc_role', activeRole);
    if (activeRole === 'admin') {
      setActiveTab('admin_control');
    } else if (activeTab === 'admin_control') {
      setActiveTab('dashboard');
    }
  }, [activeRole]);

  // Visual billboard slider timer transition
  useEffect(() => {
    if (ads.length === 0) return;
    const interval = setInterval(() => {
      setActiveAdIndex(prev => (prev + 1) % ads.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [ads]);

  // --- Form submission handlers (Push to state + Firestore DB sync) ---

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPassport.trim() || !regOmaniId.trim()) {
      alert("Please fulfill Name, Passport, and civil ID fields.");
      return;
    }

    const newDocId = `mem-${Date.now().toString().slice(-6)}`;
    const newMember: Member = {
      id: newDocId,
      fullName: regName,
      phone: regPhone || "N/A",
      passportNo: regPassport,
      omaniId: regOmaniId,
      registrationDate: new Date().toISOString().split('T')[0],
      durationOfOmanStay: regStay || "None specified",
      profession: regProfession || "General Worker",
      isWelfareEligible: regWelfareEligible,
      status: 'pending' // Queued for Cabinet trustee approval
    };

    const updated = [newMember, ...members];
    setMembers(updated);
    
    // Clear Form inputs
    setRegName('');
    setRegPhone('');
    setRegOmaniId('');
    setRegPassport('');
    setRegStay('');
    setRegProfession('');

    setFeedback(t(lang, 'regSuccess'));
    setTimeout(() => setFeedback(null), 6000);

    // Sync is asynchronous
    if (isOnline) {
      await saveDocument('members', newDocId, newMember);
    }
  };

  const handleReportEmergency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repName.trim() || !repLocation.trim() || !repDescription.trim()) {
      alert("Complete name, location, and description details to broadcast emergency alert.");
      return;
    }

    const newDocId = `rep-${Date.now().toString().slice(-6)}`;
    const newReport: EmergencyReport = {
      id: newDocId,
      reporterName: repName,
      reporterPhone: repPhone || "N/A",
      severity: repSeverity,
      category: repCategory,
      location: repLocation,
      description: repDescription,
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    setReports([newReport, ...reports]);
    setRepName('');
    setRepPhone('');
    setRepLocation('');
    setRepDescription('');

    setFeedback(t(lang, 'reportSent'));
    setTimeout(() => setFeedback(null), 6000);

    if (isOnline) {
      await saveDocument('reports', newDocId, newReport);
    }
  };

  const handleDonationSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(donAmount);
    if (!donName.trim() || isNaN(amountNum) || amountNum <= 0 || !donTxnId.trim()) {
      alert("Specify proper Contributor name, positive amount, and reference ID.");
      return;
    }

    const newDocId = `don-${Date.now().toString().slice(-6)}`;
    const newDon: Donation = {
      id: newDocId,
      donorName: donName,
      amount: amountNum,
      date: new Date().toISOString().split('T')[0],
      method: donMethod,
      transactionId: donTxnId,
      status: 'pending'
    };

    setDonations([newDon, ...donations]);
    setDonName('');
    setDonAmount('');
    setDonTxnId('');

    setFeedback(t(lang, 'donationSuccess'));
    setTimeout(() => setFeedback(null), 6000);

    if (isOnline) {
      await saveDocument('donations', newDocId, newDon);
    }
  };

  const handleContactMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgName.trim() || !msgBody.trim()) {
      alert("Name and message query fields cannot be blank.");
      return;
    }

    const newDocId = `msg-${Date.now().toString().slice(-6)}`;
    const newMsg: ContactMessage = {
      id: newDocId,
      name: msgName,
      email: msgEmail || "not_provided@opc.com",
      message: `${msgSubject}: ${msgBody}`,
      date: new Date().toISOString().split('T')[0]
    };

    setMessages([newMsg, ...messages]);
    setMsgName('');
    setMsgEmail('');
    setMsgBody('');

    setFeedback(t(lang, 'messageSaved'));
    setTimeout(() => setFeedback(null), 6000);

    if (isOnline) {
      await saveDocument('contactMessages', newDocId, newMsg);
    }
  };

  // --- Ballot Register ---
  const handleVote = async (electionId: string, candidateId: string) => {
    if (votedElections.includes(electionId)) {
      setFeedback(t(lang, 'votedAlready'));
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    // Mutate state of chosen candidate
    const updatedElections = elections.map(elec => {
      if (elec.id === electionId) {
        const updatedCands = elec.candidates.map(cand => {
          if (cand.id === candidateId) {
            return { ...cand, votes: cand.votes + 1 };
          }
          return cand;
        });
        
        // Sync to cloud if live
        const chosenElection = { ...elec, candidates: updatedCands };
        if (isOnline) {
          saveDocument('elections', elec.id, chosenElection);
        }
        return chosenElection;
      }
      return elec;
    });

    setElections(updatedElections);
    setVotedElections([...votedElections, electionId]);
    setFeedback(t(lang, 'voteLogged'));
    setTimeout(() => setFeedback(null), 4000);
  };

  // --- Administrative control callbacks ---

  const handleApproveMemberOnDB = async (id: string) => {
    const updated = members.map(m => m.id === id ? { ...m, status: 'approved' as const } : m);
    setMembers(updated);
    if (isOnline) {
      const match = updated.find(m => m.id === id);
      if (match) await saveDocument('members', id, match);
    }
  };

  const handleRejectMemberOnDB = async (id: string) => {
    const updated = members.map(m => m.id === id ? { ...m, status: 'rejected' as const } : m);
    setMembers(updated);
    if (isOnline) {
      const match = updated.find(m => m.id === id);
      if (match) await saveDocument('members', id, match);
    }
  };

  const handleApproveDonationOnDB = async (id: string) => {
    const updated = donations.map(d => d.id === id ? { ...d, status: 'verified' as const } : d);
    setDonations(updated);
    if (isOnline) {
      const match = updated.find(m => m.id === id);
      if (match) await saveDocument('donations', id, match);
    }
  };

  const handleRejectDonationOnDB = async (id: string) => {
    const updated = donations.map(d => d.id === id ? { ...d, status: 'rejected' as const } : d);
    setDonations(updated);
    if (isOnline) {
      const match = updated.find(m => m.id === id);
      if (match) await saveDocument('donations', id, match);
    }
  };

  const handleDeleteMemberOnDB = async (id: string) => {
    const updated = members.filter(m => m.id !== id);
    setMembers(updated);
    if (isOnline) {
      await deleteDocument('members', id);
    }
  };

  const handleDeleteDonationOnDB = async (id: string) => {
    const updated = donations.filter(d => d.id !== id);
    setDonations(updated);
    if (isOnline) {
      await deleteDocument('donations', id);
    }
  };

  const handleUpdateReportStatusOnDB = async (id: string, status: 'pending' | 'verified' | 'resolved') => {
    const updated = reports.map(r => r.id === id ? { ...r, status } : r);
    setReports(updated);
    if (isOnline) {
      const match = updated.find(r => r.id === id);
      if (match) await saveDocument('reports', id, match);
    }
  };

  const handleDeleteReportOnDB = async (id: string) => {
    const updated = reports.filter(r => r.id !== id);
    setReports(updated);
    if (isOnline) {
      await deleteDocument('reports', id);
    }
  };

  const handleAddNewsItemOnDB = async (newItem: NewsItem) => {
    const updated = [newItem, ...news];
    setNews(updated);
    if (isOnline) {
      await saveDocument('news', newItem.id, newItem);
    }
  };

  const handleDeleteNewsItemOnDB = async (id: string) => {
    const updated = news.filter(n => n.id !== id);
    setNews(updated);
    if (isOnline) {
      await deleteDocument('news', id);
    }
  };

  const handleAddElectionOnDB = async (newElection: Election) => {
    const updated = [newElection, ...elections];
    setElections(updated);
    if (isOnline) {
      await saveDocument('elections', newElection.id, newElection);
    }
  };

  const handleDeleteElectionOnDB = async (id: string) => {
    const updated = elections.filter(e => e.id !== id);
    setElections(updated);
    if (isOnline) {
      await deleteDocument('elections', id);
    }
  };

  const handleAddAdBannerOnDB = async (newAd: Advertisement) => {
    const updated = [newAd, ...ads];
    setAds(updated);
    if (isOnline) {
      await saveDocument('advertisements', newAd.id, newAd);
    }
  };

  const handleDeleteAdBannerOnDB = async (id: string) => {
    const updated = ads.filter(a => a.id !== id);
    setAds(updated);
    if (isOnline) {
      await deleteDocument('advertisements', id);
    }
  };

  const handleToggleAdActiveOnDB = async (id: string) => {
    const updated = ads.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a);
    setAds(updated);
    if (isOnline) {
      const match = updated.find(a => a.id === id);
      if (match) await saveDocument('advertisements', id, match);
    }
  };

  const handleDeleteContactMsgOnDB = async (id: string) => {
    const updated = messages.filter(m => m.id !== id);
    setMessages(updated);
    if (isOnline) {
      await deleteDocument('contactMessages', id);
    }
  };

  // --- Dynamic Ad elements ---
  const currentAd = ads[activeAdIndex] || null;

  return (
    <div id="root-portal-view" className={`min-h-screen pb-16 transition-colors duration-300 font-sans ${isHighContrast ? 'bg-slate-950 text-slate-50' : 'bg-slate-900 text-slate-100'}`}>
      
      {/* A. Top Security Sync & Simulated Role Bar */}
      <div className="bg-slate-900 border-b border-slate-800 text-slate-100 py-2.5 px-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          
          {/* Status Pillar */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="font-mono uppercase font-bold text-[10px] tracking-wider text-slate-100">
              {isOnline ? 'Firebase Ledger Sync Online' : 'Standard Fallback Offline Mode'}
            </span>
            {isLoading && <span className="text-[10px] text-amber-400 animate-pulse">(updating document caches...)</span>}
          </div>

          {/* User role simulator */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-slate-400 uppercase tracking-wide font-bold">{t(lang, 'simRoleLabel')}</span>
            
            <button 
              onClick={() => setActiveRole('guest')}
              className={`px-2.5 py-1 rounded font-mono font-bold transition cursor-pointer text-[10px] uppercase border ${activeRole === 'guest' ? 'bg-slate-100 text-slate-950 border-white' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'}`}
            >
              👤 {t(lang, 'guestLabel')}
            </button>

            <button 
              onClick={() => setActiveRole('member')}
              className={`px-2.5 py-1 rounded font-mono font-bold transition cursor-pointer text-[10px] uppercase border ${activeRole === 'member' ? 'bg-indigo-500 text-slate-950 border-indigo-400' : 'bg-slate-950 text-indigo-400 border-slate-800 hover:text-indigo-300'}`}
            >
              💳 {t(lang, 'memberLabel')}
            </button>

            <button 
              onClick={() => setActiveRole('admin')}
              className={`px-2.5 py-1 rounded font-mono font-bold transition cursor-pointer text-[10px] uppercase border ${activeRole === 'admin' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-950 text-amber-400 border-slate-800 hover:text-amber-350'}`}
            >
              👑 {t(lang, 'adminLabel')}
            </button>
          </div>

        </div>
      </div>

      {/* B. Master Interactive Header Bar */}
      <header className="bg-slate-900/50 border-b border-slate-800 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-extrabold tracking-tight text-white flex items-center gap-3">
              <Building className="text-amber-500 h-8 w-8" />
              {t(lang, 'portalTitle')}
            </h1>
            <p className="text-sm font-medium text-amber-500/95" style={{ color: '#fbbf24' }}>
              {t(lang, 'portalSubtitle')}
            </p>
          </div>

          {/* Language and Contrast Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Language translation flags */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-850">
              <div className="px-2 text-slate-400 flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-mono tracking-wider font-bold uppercase">{t(lang, 'switchLanguage')}:</span>
              </div>
              
              <button 
                onClick={() => setLang('en')}
                className={`px-3 py-1 text-xs rounded-lg transition font-sans font-extrabold cursor-pointer ${lang === 'en' ? 'bg-slate-100 text-slate-950' : 'text-slate-100 hover:bg-slate-900'}`}
              >
                🇬🇧 English (EN)
              </button>

              <button 
                onClick={() => setLang('ur')}
                className={`px-3 py-1 text-xs rounded-lg transition font-sans font-extrabold cursor-pointer ${lang === 'ur' ? 'bg-amber-500 text-slate-950' : 'text-slate-100 hover:bg-slate-900'}`}
              >
                🇵🇰 اردو (UR)
              </button>

              <button 
                onClick={() => setLang('ps')}
                className={`px-3 py-1 text-xs rounded-lg transition font-sans font-extrabold cursor-pointer ${lang === 'ps' ? 'bg-amber-500 text-slate-950' : 'text-slate-100 hover:bg-slate-900'}`}
              >
                🇦🇫 پښتو (PS)
              </button>
            </div>

            {/* Accessible Contrast Mode Button */}
            <button
              onClick={() => setIsHighContrast(!isHighContrast)}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${isHighContrast ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-950 text-slate-300 border-slate-850 hover:border-slate-700'}`}
            >
              <span>👁️</span> 
              <span>{isHighContrast ? 'High Contrast' : 'Normal Contrast'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* C. Dynamic Sponsor Billboard Carousel (Satisfies Sponsor rules) */}
      {currentAd && (
        <div className="bg-slate-900 border-b border-amber-500/20 py-3.5 px-4 overflow-hidden relative">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="bg-amber-400/10 border border-amber-400/30 text-amber-400 px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-widest uppercase shrink-0">
                Official Sponsor
              </span>
              <p className="text-slate-100 font-bold tracking-wide">
                <span className="text-amber-400 underline">{currentAd.sponsorName}</span>: {' '}
                {lang === 'en' && currentAd.tagline}
                {lang === 'ur' && currentAd.UrduTagline}
                {lang === 'ps' && currentAd.PashtoTagline}
              </p>
            </div>
            <a 
              href={currentAd.clickUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-slate-100 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded transition duration-200 shrink-0 text-[10px] tracking-wide uppercase shadow"
            >
              Visit Sponsor Deal
            </a>
          </div>
        </div>
      )}

      {/* D. Main Action Banners feedback */}
      {feedback && (
        <div className="max-w-7xl mx-auto mt-6 px-4">
          <div className="bg-emerald-950/70 border-2 border-emerald-500 rounded-xl p-4 text-emerald-100 text-sm font-medium flex items-center gap-3">
            <span className="flex h-3 w-3 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            {feedback}
          </div>
        </div>
      )}

      {/* E. Modular Navigation and Screen Shell Grid */}
      <main className="max-w-7xl mx-auto mt-8 px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Hand Navigation bar (Desktop) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900 border-2 border-slate-850 rounded-2xl p-4 shadow-xl space-y-1">
            <p className="text-slate-400 text-[10px] font-mono uppercase tracking-widest font-bold px-3 pb-2 border-b border-slate-800">
              Cabinet Portal Index
            </p>

            {activeRole === 'admin' && (
              <button 
                onClick={() => setActiveTab('admin_control')}
                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 text-xs font-black tracking-wide border transition duration-150 cursor-pointer ${
                  activeTab === 'admin_control' 
                    ? 'bg-red-650 text-white border-red-500 shadow-lg shadow-red-950/50' 
                    : 'text-red-400 bg-red-950/10 border-red-900/35 hover:bg-red-950/20 hover:text-red-300'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
                <span>Administrative Desk</span>
              </button>
            )}
            
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 text-xs font-semibold tracking-wide transition duration-150 cursor-pointer ${activeTab === 'dashboard' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-slate-950 hover:text-white'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> {t(lang, 'navHome')}
            </button>

            <button 
              onClick={() => setActiveTab('directory')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 text-xs font-semibold tracking-wide transition duration-150 cursor-pointer ${activeTab === 'directory' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-slate-950 hover:text-white'}`}
            >
              <Users className="w-4 h-4" /> {t(lang, 'navMembers')}
            </button>

            <button 
              onClick={() => setActiveTab('register')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 text-xs font-semibold tracking-wide transition duration-150 cursor-pointer ${activeTab === 'register' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-slate-950 hover:text-white'}`}
            >
              <PlusCircle className="w-4 h-4" /> {t(lang, 'navRegister')}
            </button>

            <button 
              onClick={() => setActiveTab('emergency')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 text-xs font-semibold tracking-wide transition duration-150 cursor-pointer ${activeTab === 'emergency' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-slate-950 hover:text-white'}`}
            >
              <Activity className="w-4 h-4" /> {t(lang, 'navEmergency')}
            </button>

            <button 
              onClick={() => setActiveTab('donations')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 text-xs font-semibold tracking-wide transition duration-150 cursor-pointer ${activeTab === 'donations' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-slate-950 hover:text-white'}`}
            >
              <Heart className="w-4 h-4" /> {t(lang, 'navDonations')}
            </button>

            <button 
              onClick={() => setActiveTab('elections')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 text-xs font-semibold tracking-wide transition duration-150 cursor-pointer ${activeTab === 'elections' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-slate-950 hover:text-white'}`}
            >
              <Vote className="w-4 h-4" /> {t(lang, 'navElections')}
            </button>

            <button 
              onClick={() => setActiveTab('bulletins')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 text-xs font-semibold tracking-wide transition duration-150 cursor-pointer ${activeTab === 'bulletins' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-slate-950 hover:text-white'}`}
            >
              <Newspaper className="w-4 h-4" /> {t(lang, 'navNews')}
            </button>

            <button 
              onClick={() => setActiveTab('contact')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 text-xs font-semibold tracking-wide transition duration-150 cursor-pointer ${activeTab === 'contact' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-slate-950 hover:text-white'}`}
            >
              <Send className="w-4 h-4" /> {t(lang, 'navContact')}
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-4 text-xs space-y-2">
            <p className="font-bold text-slate-100 flex items-center gap-1">
              <HelpCircle className="w-4 h-4 text-amber-400" /> Human Accessibility
            </p>
            <p className="text-slate-300">This interface features rich styling with maximum color contrast. Every form label is paired with language selectors to facilitate reading for our laborship workforce.</p>
          </div>
        </div>

        {/* Right Active View Shell (Responsive space layout) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: Analytical WELFARE COVER DASHBOARD */}
          {activeTab === 'dashboard' && (
            <CommunityDashboard members={members} donations={donations} reports={reports} />
          )}

          {/* TAB 9: ADMINISTRATIVE MASTER TRUSTEE PANEL (Cabinet Control Panel) */}
          {activeTab === 'admin_control' && activeRole === 'admin' && (
            <AdminControlPanel 
              members={members}
              donations={donations}
              reports={reports}
              elections={elections}
              news={news}
              ads={ads}
              messages={messages}
              language={lang}
              isOnline={isOnline}
              
              // Member actions
              onApproveMember={handleApproveMemberOnDB}
              onRejectMember={handleRejectMemberOnDB}
              onDeleteMember={handleDeleteMemberOnDB}
              
              // Donation audit actions
              onApproveDonation={handleApproveDonationOnDB}
              onRejectDonation={handleRejectDonationOnDB}
              onDeleteDonation={handleDeleteDonationOnDB}
              
              // Emergency triage updates
              onUpdateReportStatus={handleUpdateReportStatusOnDB}
              onDeleteReport={handleDeleteReportOnDB}
              
              // News broadcasts
              onAddNewsItem={handleAddNewsItemOnDB}
              onDeleteNewsItem={handleDeleteNewsItemOnDB}
              
              // Ballot management
              onAddElection={handleAddElectionOnDB}
              onDeleteElection={handleDeleteElectionOnDB}
              
              // Advertiser manager
              onAddAdBanner={handleAddAdBannerOnDB}
              onDeleteAdBanner={handleDeleteAdBannerOnDB}
              onToggleAdActive={handleToggleAdActiveOnDB}
              
              // Suggestions desk
              onDeleteMessage={handleDeleteContactMsgOnDB}
            />
          )}

          {/* TAB 2: REGISTERED MEMBERS DIRECTORY TABLE */}
          {activeTab === 'directory' && (
            <AdminMembersDirectory 
              members={members} 
              donations={donations} 
              activeRole={activeRole} 
              language={lang}
              onApproveMember={handleApproveMemberOnDB}
              onRejectMember={handleRejectMemberOnDB}
              onApproveDonation={handleApproveDonationOnDB}
              onRejectDonation={handleRejectDonationOnDB}
              onDeleteMember={handleDeleteMemberOnDB}
            />
          )}

          {/* TAB 3: WELFARE CARD REGISTRATION APPLICATION */}
          {activeTab === 'register' && (
            <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h3 className="text-xl font-display font-extrabold text-slate-50 flex items-center gap-2">
                  <PlusCircle className="text-amber-400 w-5.5 h-5.5" />
                  {t(lang, 'regFormTitle')}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {t(lang, 'regFormSubtitle')}
                </p>
              </div>

              <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
                <div className="space-y-1.5 col-span-1 md:col-span-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">{t(lang, 'inputFullName')} <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-50 px-3.5 py-2.5 rounded-lg outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    placeholder="e.g. Khan Wali Shah"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">{t(lang, 'inputPhone')}</label>
                  <input 
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-50 px-3.5 py-2.5 rounded-lg outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    placeholder="e.g. +968 9244 5678"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">{t(lang, 'inputStay')}</label>
                  <input 
                    type="text"
                    value={regStay}
                    onChange={(e) => setRegStay(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-50 px-3.5 py-2.5 rounded-lg outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    placeholder="e.g. 5 years"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">{t(lang, 'inputOmaniId')} <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    required
                    value={regOmaniId}
                    onChange={(e) => setRegOmaniId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-50 px-3.5 py-2.5 rounded-lg outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    placeholder="e.g. 12345678"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">{t(lang, 'inputPassport')} <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    required
                    value={regPassport}
                    onChange={(e) => setRegPassport(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-50 px-3.5 py-2.5 rounded-lg outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    placeholder="e.g. PC7788123"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">{t(lang, 'inputProfession')}</label>
                  <input 
                    type="text"
                    value={regProfession}
                    onChange={(e) => setRegProfession(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-50 px-3.5 py-2.5 rounded-lg outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    placeholder="e.g. Scaffolding Builder"
                  />
                </div>

                <div className="space-y-1.5 flex items-center gap-3 pt-6">
                  <input 
                    type="checkbox"
                    id="checkbox-eligibility"
                    checked={regWelfareEligible}
                    onChange={(e) => setRegWelfareEligible(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                  <label htmlFor="checkbox-eligibility" className="text-xs text-slate-100 font-semibold cursor-pointer select-none">
                    {t(lang, 'inputWelfareEligible')}
                  </label>
                </div>

                <div className="col-span-1 md:col-span-2 pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-3 rounded-lg shadow-lg cursor-pointer transition flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> {t(lang, 'submitBtn')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: HUMANITARIAN LIVE DISPATCH CHANNELS */}
          {activeTab === 'emergency' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* Left col: Report dynamic form */}
              <div className="xl:col-span-5 bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div>
                  <h3 className="text-lg font-display font-bold text-red-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                    Dispatch Welfare Help
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {t(lang, 'emergencySubtitle')}
                  </p>
                </div>

                <form onSubmit={handleReportEmergency} className="space-y-4 font-sans text-xs">
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] uppercase font-bold text-slate-300">{t(lang, 'emergencyReporterName')} *</label>
                    <input 
                      type="text"
                      required
                      value={repName}
                      onChange={(e) => setRepName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 p-2 py-2.5 rounded-lg outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] uppercase font-bold text-slate-300">{t(lang, 'emergencyReporterPhone')} *</label>
                    <input 
                      type="text"
                      required
                      value={repPhone}
                      onChange={(e) => setRepPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 p-2 py-2.5 rounded-lg outline-none"
                      placeholder="WhatsApp contact"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] uppercase font-bold text-slate-300">{t(lang, 'emergencySeverity')}</label>
                    <select 
                      value={repSeverity}
                      onChange={(e) => setRepSeverity(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 font-bold text-slate-100 p-2 rounded-lg"
                    >
                      <option value="high">{t(lang, 'emergencySeverityHigh')}</option>
                      <option value="medium">{t(lang, 'emergencySeverityMedium')}</option>
                      <option value="low">{t(lang, 'emergencySeverityLow')}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] uppercase font-bold text-slate-300">{t(lang, 'emergencyCategory')}</label>
                    <select 
                      value={repCategory}
                      onChange={(e) => setRepCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 font-bold text-slate-100 p-2 rounded-lg"
                    >
                      <option value="death">{t(lang, 'emergencyCategoryDeath')}</option>
                      <option value="accident">{t(lang, 'emergencyCategoryAccident')}</option>
                      <option value="lost_passport">{t(lang, 'emergencyCategoryPassport')}</option>
                      <option value="medical_need">{t(lang, 'emergencyCategoryMedical')}</option>
                      <option value="general">{t(lang, 'emergencyCategoryGeneral')}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] uppercase font-bold text-slate-300">{t(lang, 'emergencyLocation')} *</label>
                    <input 
                      type="text"
                      required
                      value={repLocation}
                      onChange={(e) => setRepLocation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 p-2 py-2.5 rounded-lg outline-none"
                      placeholder="e.g. Khoula Hospital"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] uppercase font-bold text-slate-300">{t(lang, 'emergencyDesc')} *</label>
                    <textarea 
                      required
                      rows={3}
                      value={repDescription}
                      onChange={(e) => setRepDescription(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 p-2 rounded-lg"
                      placeholder="Provide specific details..."
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-red-650 hover:bg-red-500 hover:text-slate-950 text-slate-100 font-bold p-3 rounded-lg border border-red-500 cursor-pointer text-xs"
                  >
                    {t(lang, 'submitReportBtn')}
                  </button>
                </form>
              </div>

              {/* Right Col: Current Dispatches list */}
              <div className="xl:col-span-7 bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div>
                  <h3 className="text-lg font-display font-bold text-slate-100">{t(lang, 'emergencyTitle')}</h3>
                  <p className="text-xs text-slate-300">Live community disaster tracker. Red indicates high triage priority.</p>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {reports.map((rep) => (
                    <div 
                      key={rep.id} 
                      className={`p-4 rounded-xl border transition ${rep.severity === 'high' ? 'bg-red-950/20 border-red-500/55' : 'bg-slate-950 border-slate-850'}`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex gap-2.5 items-center">
                          <span className={`h-2.5 w-2.5 rounded-full ${rep.severity === 'high' ? 'bg-red-500 animate-ping' : 'bg-amber-400'}`}></span>
                          <span className={`text-[10px] font-mono tracking-widest font-bold uppercase ${rep.severity === 'high' ? 'text-red-400' : 'text-amber-400'}`}>
                            {rep.severity.toUpperCase()} PRIORITY tRIAGE
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400">{rep.date}</span>
                      </div>

                      <div className="mt-2.5 space-y-1">
                        <h4 className="text-slate-100 font-sans font-extrabold text-sm">{rep.category.toUpperCase().replace('_', ' ')}</h4>
                        <p className="text-slate-200 text-xs font-sans leading-relaxed">{rep.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-850/50 flex flex-wrap justify-between items-center text-[10px] gap-2">
                        <div className="flex gap-1.5 items-center text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>Location: <strong className="text-slate-100">{rep.location}</strong></span>
                        </div>
                        <div className="text-slate-350">
                          Filed by: <strong className="text-slate-200">{rep.reporterName}</strong> ({rep.reporterPhone})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: AUDITED DONATIONS LEDGER & SLIPS */}
          {activeTab === 'donations' && (
            <div className="space-y-6">
              
              {/* Top Sec: Donation form */}
              <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                <div>
                  <h3 className="text-xl font-display font-extrabold text-slate-50 flex items-center gap-2">
                    <Heart className="text-amber-400 w-5.5 h-5.5 animate-pulse" />
                    {t(lang, 'donationsTitle')}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {t(lang, 'donationsSubtitle')}
                  </p>
                </div>

                <form onSubmit={handleDonationSlip} className="grid grid-cols-1 md:grid-cols-4 gap-4 font-sans text-xs">
                  <div className="md:col-span-1 space-y-1">
                    <label className="font-mono text-[10px] uppercase font-bold text-slate-300">{t(lang, 'donorNameLabel')} *</label>
                    <input 
                      type="text"
                      required
                      value={donName}
                      onChange={(e) => setDonName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 text-slate-50 p-2.5 rounded-lg outline-none"
                      placeholder="Your Name (or Guild)"
                    />
                  </div>

                  <div className="md:col-span-1 space-y-1">
                    <label className="font-mono text-[10px] uppercase font-bold text-slate-300">{t(lang, 'amountInOmr')} *</label>
                    <input 
                      type="number"
                      step="0.001"
                      required
                      value={donAmount}
                      onChange={(e) => setDonAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 text-slate-50 p-2.5 rounded-lg font-mono outline-none"
                      placeholder="e.g. 15.000 OMR"
                    />
                  </div>

                  <div className="md:col-span-1 space-y-1">
                    <label className="font-mono text-[10px] uppercase font-bold text-slate-300">{t(lang, 'donationMethodLabel')}</label>
                    <select 
                      value={donMethod}
                      onChange={(e) => setDonMethod(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-850 text-slate-50 p-2.5 rounded-lg font-bold"
                    >
                      <option value="bank">{t(lang, 'methodBank')}</option>
                      <option value="mobile_pay">{t(lang, 'methodMobilePay')}</option>
                    </select>
                  </div>

                  <div className="md:col-span-1 space-y-1">
                    <label className="font-mono text-[10px] uppercase font-bold text-slate-300">{t(lang, 'transactionIdLabel')} *</label>
                    <input 
                      type="text"
                      required
                      value={donTxnId}
                      onChange={(e) => setDonTxnId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 text-slate-50 p-2.5 rounded-lg font-mono outline-none"
                      placeholder="e.g. TXN-89241029"
                    />
                  </div>

                  <div className="md:col-span-4 pt-2">
                    <button 
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-lg cursor-pointer transition flex items-center justify-center gap-1 text-xs"
                    >
                      <Check className="w-4 h-4" /> {t(lang, 'submitDonationBtn')}
                    </button>
                  </div>
                </form>
              </div>

              {/* Bottom Sec: Ledger log containing Download Receipt button */}
              <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-lg font-display font-bold text-slate-100">{t(lang, 'donLedgerTitle')}</h3>
                
                <div className="overflow-x-auto border border-slate-850 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-850">
                        <th className="py-3 px-4">Donation Receipt ID</th>
                        <th className="py-3 px-4">Contributor / Donor</th>
                        <th className="py-3 px-4">Sum Contributed</th>
                        <th className="py-3 px-4">Financial Method Details</th>
                        <th className="py-3 px-4">Audit Status</th>
                        <th className="py-3 px-4 text-right">Receipt Print</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 font-sans text-xs">
                      {donations.map((don) => (
                        <tr key={don.id} className="hover:bg-slate-950/40 transition">
                          
                          <td className="py-3.5 px-4 font-mono text-slate-300 font-bold uppercase text-[11px]">
                            {don.id.slice(0, 8)}
                          </td>

                          <td className="py-3.5 px-4 font-bold text-slate-50">
                            {don.donorName}
                          </td>

                          <td className="py-3.5 px-4 font-mono text-amber-500 font-bold text-sm">
                            {Number(don.amount).toFixed(3)} <span className="text-[10px] font-sans text-slate-300 inline-block ml-0.5">OMR</span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-200">
                            <p className="font-semibold text-slate-200">{don.method === 'bank' ? 'Bank Muscat Online' : 'Mobile Pay Portal'}</p>
                            <p className="text-[10px] font-mono text-slate-400" style={{ color: '#94a3b8' }}>Hash Ref: {don.transactionId}</p>
                          </td>

                          <td className="py-3.5 px-4">
                            {don.status === 'verified' && (
                              <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-extrabold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">
                                {t(lang, 'statusVerified')}
                              </span>
                            )}
                            {don.status === 'pending' && (
                              <span className="bg-amber-950/60 text-amber-500 border border-amber-500/30 font-extrabold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">
                                {t(lang, 'statusDonPending')}
                              </span>
                            )}
                            {don.status === 'rejected' && (
                              <span className="bg-red-950/60 text-red-500 border border-red-500/30 font-extrabold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">
                                {t(lang, 'statusDonRejected')}
                              </span>
                            )}
                          </td>

                          {/* DOWNLOAD PDF RECEIPT BUTTON: SOLVES THE SPECIFIC USER REQUEST */}
                          <td className="py-3.5 px-4 text-right">
                            <button 
                              onClick={() => generateDonationReceipt(don)}
                              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-sans font-extrabold text-[10px] tracking-wide uppercase px-3 py-1.5 rounded-md cursor-pointer transition flex items-center gap-1 inline-flex shadow hover:shadow-md"
                              id={`btn-download-receipt-${don.id}`}
                            >
                              <Download className="w-3.5 h-3.5" />
                              {t(lang, 'receiptBtn')}
                            </button>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: WELFARE CABINET ELECTIONS */}
          {activeTab === 'elections' && (
            <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h3 className="text-xl font-display font-extrabold text-slate-50 flex items-center gap-2">
                  <Vote className="text-amber-500 w-5.5 h-5.5" />
                  {t(lang, 'electionsTitle')}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {t(lang, 'electionsSubtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {elections.map((elec) => (
                  <div key={elec.id} className="bg-slate-950 p-6 rounded-2xl border-2 border-slate-850 space-y-4">
                    <div className="border-b border-slate-850 pb-3">
                      <h4 className="text-slate-50 text-base font-display font-bold">
                        {lang === 'en' && elec.title}
                        {lang === 'ur' && elec.UrduTitle}
                        {lang === 'ps' && elec.PashtoTitle}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">Poll closes on: {elec.date}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {elec.candidates.map((cand) => {
                        const isVoted = votedElections.includes(elec.id);
                        return (
                          <div key={cand.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between gap-4">
                            <div className="space-y-1">
                              <p className="text-amber-400 font-bold text-sm">{cand.name}</p>
                              <p className="text-slate-100 text-xs">
                                {lang === 'en' && cand.description}
                                {lang === 'ur' && cand.UrduDesc}
                                {lang === 'ps' && cand.PashtoDesc}
                              </p>
                            </div>
                            
                            <div className="pt-2 border-t border-slate-850/60 flex items-center justify-between">
                              <div className="text-xs font-mono font-bold text-slate-300">
                                {t(lang, 'votesCount')}: <span className="text-slate-50 text-sm font-extrabold font-mono inline-block ml-1">{cand.votes}</span>
                              </div>
                              <button 
                                onClick={() => handleVote(elec.id, cand.id)}
                                disabled={isVoted}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide uppercase cursor-pointer transition ${isVoted ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'}`}
                              >
                                {isVoted ? 'Ballot Cast' : t(lang, 'castVoteBtn')}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: BULLETIN NEWSFEED PRESS DIRECTORY */}
          {activeTab === 'bulletins' && (
            <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h3 className="text-xl font-display font-extrabold text-slate-50 flex items-center gap-2">
                  <Newspaper className="text-amber-500 w-5.5 h-5.5" />
                  {t(lang, 'bulletinTitle')}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {t(lang, 'bulletinSubtitle')}
                </p>
              </div>

              {/* Special Billboard Announcement section */}
              {news.filter(n => n.important).map((ann) => (
                <div key={ann.id} className="bg-amber-950/20 border-2 border-amber-500 rounded-xl p-5 relative overflow-hidden space-y-3">
                  <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded text-[8.5px] font-mono font-bold tracking-widest uppercase">
                    {t(lang, 'announcementBillboard')}
                  </span>
                  <div className="space-y-1">
                    <h4 className="text-amber-400 font-display font-bold text-base">
                      {lang === 'en' && ann.title}
                      {lang === 'ur' && ann.UrduTitle}
                      {lang === 'ps' && ann.PashtoTitle}
                    </h4>
                    <p className="text-slate-100 text-xs font-sans leading-relaxed">
                      {lang === 'en' && ann.content}
                      {lang === 'ur' && ann.UrduContent}
                      {lang === 'ps' && ann.PashtoContent}
                    </p>
                  </div>
                  <div className="text-[9px] font-mono text-amber-500/80">Posted on: {ann.date}</div>
                </div>
              ))}

              {/* Standard Bulletins feed */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 px-1 font-bold">{t(lang, 'newsLabel')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {news.filter(n => !n.important).map((n) => (
                    <div key={n.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 hover:border-slate-800 transition space-y-2">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[8px] font-mono uppercase">
                        {n.category}
                      </span>
                      <h5 className="text-slate-100 text-sm font-sans font-extrabold">
                        {lang === 'en' && n.title}
                        {lang === 'ur' && n.UrduTitle}
                        {lang === 'ps' && n.PashtoTitle}
                      </h5>
                      <p className="text-slate-200 text-xs font-sans leading-relaxed">
                        {lang === 'en' && n.content}
                        {lang === 'ur' && n.UrduContent}
                        {lang === 'ps' && n.PashtoContent}
                      </p>
                      <p className="text-[9px] font-mono text-slate-450 pt-1" style={{ color: '#94a3b8' }}>Date: {n.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: HELPDESK DIRECT FEEDBACK TICKETS */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Form col */}
              <div className="md:col-span-5 bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div>
                  <h3 className="text-lg font-display font-bold text-slate-100 flex items-center gap-1.5">
                    <Send className="w-5 h-5 text-amber-400" />
                    Submit Suggestion
                  </h3>
                  <p className="text-xs text-slate-350">
                    {t(lang, 'contactSubtitle')}
                  </p>
                </div>

                <form onSubmit={handleContactMsg} className="space-y-4 font-sans text-xs">
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] uppercase font-bold text-slate-300">{t(lang, 'emergencyReporterName')} *</label>
                    <input 
                      type="text"
                      required
                      value={msgName}
                      onChange={(e) => setMsgName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 p-2 py-2.5 rounded-lg"
                      placeholder="Your name"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] uppercase font-bold text-slate-300">Email Address</label>
                    <input 
                      type="email"
                      value={msgEmail}
                      onChange={(e) => setMsgEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 p-2 py-2.5 rounded-lg"
                      placeholder="opc-member@domain.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] uppercase font-bold text-slate-300">{t(lang, 'contactSubject')}</label>
                    <select 
                      value={msgSubject}
                      onChange={(e) => setMsgSubject(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 font-bold text-slate-100 p-2 rounded-lg"
                    >
                      <option value="Welfare Policy">Welfare Policy Inquiry</option>
                      <option value="Financial Audit">Ledger Auditing Suggestion</option>
                      <option value="Card Registry">Medical / Body Transit Coverage</option>
                      <option value="General Feedback">General Comment</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] uppercase font-bold text-slate-300">{t(lang, 'messageLabel')} *</label>
                    <textarea 
                      required
                      rows={4}
                      value={msgBody}
                      onChange={(e) => setMsgBody(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 p-2 rounded-lg"
                      placeholder="Elaborate details..."
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold p-3 rounded-lg cursor-pointer text-xs"
                  >
                    Send Suggestion Ticket
                  </button>
                </form>
              </div>

              {/* Feed logs col */}
              <div className="md:col-span-7 bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div>
                  <h3 className="text-lg font-display font-bold text-slate-100">Helpdesk Suggestion Feed</h3>
                  <p className="text-xs text-slate-300">Public feedback logs compiled for trustee dashboard review.</p>
                </div>

                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {messages.map((m) => (
                    <div key={m.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                      <div className="flex justify-between items-center text-[10px] text-slate-300 border-b border-slate-900 pb-1.5 font-mono">
                        <span className="font-bold uppercase tracking-wider text-amber-500">OPC HELPDESK ENTRY</span>
                        <span>{m.date}</span>
                      </div>
                      <p className="text-slate-200 text-xs font-sans italic">"{m.message}"</p>
                      <p className="text-[10px] text-slate-350 pt-1 text-right" style={{ color: '#94a3b8' }}>
                        Submitted by: <strong className="text-slate-100 font-sans">{m.name}</strong> ({m.email})
                      </p>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <p className="text-slate-350 text-center py-10 font-sans text-xs">No feedback message logs currently recorded on database.</p>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

    </div>
  );
}
