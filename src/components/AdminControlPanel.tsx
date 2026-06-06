import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Heart, 
  ShieldAlert, 
  Vote, 
  Newspaper, 
  Search, 
  Trash2, 
  Plus, 
  Check, 
  Megaphone,
  Download,
  FileText,
  TrendingUp,
  AlertTriangle,
  Briefcase,
  Coins,
  Activity,
  Sliders,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';
import { Member, Donation, EmergencyReport, Election, NewsItem, Advertisement, ContactMessage, Language } from '../types';
import { t } from '../i18n';

interface AdminControlPanelProps {
  members: Member[];
  donations: Donation[];
  reports: EmergencyReport[];
  elections: Election[];
  news: NewsItem[];
  ads: Advertisement[];
  messages: ContactMessage[];
  language: Language;
  isOnline: boolean;
  
  // Member management callbacks
  onApproveMember: (id: string) => void;
  onRejectMember: (id: string) => void;
  onDeleteMember: (id: string) => void;
  
  // Donation audit callbacks
  onApproveDonation: (id: string) => void;
  onRejectDonation: (id: string) => void;
  onDeleteDonation?: (id: string) => void;

  // Additional control callbacks (to be implemented/wired in App.tsx)
  onUpdateReportStatus?: (id: string, status: 'pending' | 'verified' | 'resolved') => void;
  onDeleteReport?: (id: string) => void;
  
  onAddNewsItem?: (newItem: NewsItem) => void;
  onDeleteNewsItem?: (id: string) => void;
  
  onAddElection?: (newElection: Election) => void;
  onDeleteElection?: (id: string) => void;
  
  onAddAdBanner?: (newAd: Advertisement) => void;
  onDeleteAdBanner?: (id: string) => void;
  onToggleAdActive?: (id: string) => void;

  onDeleteMessage?: (id: string) => void;
}

export const AdminControlPanel: React.FC<AdminControlPanelProps> = ({
  members,
  donations,
  reports,
  elections,
  news,
  ads,
  messages,
  language,
  isOnline,
  onApproveMember,
  onRejectMember,
  onDeleteMember,
  onApproveDonation,
  onRejectDonation,
  onDeleteDonation,
  onUpdateReportStatus,
  onDeleteReport,
  onAddNewsItem,
  onDeleteNewsItem,
  onAddElection,
  onDeleteElection,
  onAddAdBanner,
  onDeleteAdBanner,
  onToggleAdActive,
  onDeleteMessage
}) => {
  // Navigation tabs inside the Admin Panel
  const [subTab, setSubTab] = useState<'overview' | 'members' | 'donations' | 'emergencies' | 'elections' | 'news_ads' | 'messages'>('overview');

  // Search filter states
  const [memberSearch, setMemberSearch] = useState('');
  const [donationSearch, setDonationSearch] = useState('');
  const [emergencySearch, setEmergencySearch] = useState('');

  // Form states for creating new Bulletins
  const [newsTitleEn, setNewsTitleEn] = useState('');
  const [newsTitleUr, setNewsTitleUr] = useState('');
  const [newsTitlePs, setNewsTitlePs] = useState('');
  const [newsCategory, setNewsCategory] = useState('Announcement');
  const [newsContentEn, setNewsContentEn] = useState('');
  const [newsContentUr, setNewsContentUr] = useState('');
  const [newsContentPs, setNewsContentPs] = useState('');
  const [newsImportant, setNewsImportant] = useState(false);

  // Form states for creating new Sponsor Banners
  const [adSponsor, setAdSponsor] = useState('');
  const [adTaglineEn, setAdTaglineEn] = useState('');
  const [adTaglineUr, setAdTaglineUr] = useState('');
  const [adTaglinePs, setAdTaglinePs] = useState('');
  const [adClickUrl, setAdClickUrl] = useState('');

  // Form states for creating new Elections
  const [elecTitleEn, setElecTitleEn] = useState('');
  const [elecTitleUr, setElecTitleUr] = useState('');
  const [elecTitlePs, setElecTitlePs] = useState('');
  const [candidateNames, setCandidateNames] = useState<string>('');

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Full Legal Name',
      'WhatsApp Phone',
      'Profession',
      'Oman Length of Stay',
      'Omani Civil ID',
      'Passport Number',
      'Registration Date',
      'Status'
    ];

    const rows = members.map(m => [
      m.id,
      m.fullName,
      m.phone,
      m.profession,
      m.durationOfOmanStay,
      m.omaniId,
      m.passportNo,
      m.registrationDate,
      m.status
    ].map(val => {
      const stringVal = val === undefined || val === null ? '' : String(val);
      return `"${stringVal.replace(/"/g, '""')}"`;
    }).join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `opc_registered_members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations for Admin overview dashboard
  const statsSummary = useMemo(() => {
    const pendingMembers = members.filter(m => m.status === 'pending').length;
    const activeMembers = members.filter(m => m.status === 'approved').length;
    const pendingDons = donations.filter(d => d.status === 'pending').length;
    const verifiedDonsSum = donations
      .filter(d => d.status === 'verified')
      .reduce((sum, d) => sum + Number(d.amount), 0);
    const openCrisis = reports.filter(r => r.status !== 'resolved').length;
    const newsCount = news.length;
    const sponsorCount = ads.length;
    const feedbackCount = messages.length;

    return {
      pendingMembers,
      activeMembers,
      pendingDons,
      verifiedDonsSum,
      openCrisis,
      newsCount,
      sponsorCount,
      feedbackCount
    };
  }, [members, donations, reports, news, ads, messages]);

  // 1. Treasury Data dynamic aggregation for trend area chart
  const donationTrendsData = useMemo(() => {
    const groups: { [date: string]: number } = {};
    donations.forEach(d => {
      if (d.status === 'verified') {
        groups[d.date] = (groups[d.date] || 0) + Number(d.amount);
      }
    });
    const sortedDates = Object.keys(groups).sort();
    let cumulativeSum = 0;
    const points = sortedDates.map(date => {
      cumulativeSum += groups[date];
      return {
        date,
        amount: Number(groups[date].toFixed(3)),
        cumulative: Number(cumulativeSum.toFixed(3))
      };
    });
    
    if (points.length === 0) {
      return [
        { date: '06-01', amount: 15.000, cumulative: 15.000, dateFormatted: '06-01' },
        { date: '06-02', amount: 25.000, cumulative: 40.000, dateFormatted: '06-02' },
        { date: '06-03', amount: 35.000, cumulative: 75.000, dateFormatted: '06-03' },
        { date: '06-04', amount: 120.000, cumulative: 195.000, dateFormatted: '06-04' },
        { date: '06-05', amount: 80.000, cumulative: 275.000, dateFormatted: '06-05' },
        { date: '06-06', amount: 45.000, cumulative: 320.000, dateFormatted: '06-06' },
      ];
    }
    return points.map(pt => ({
      ...pt,
      dateFormatted: pt.date.substring(5) || pt.date
    }));
  }, [donations]);

  // 2. Emergency Severity Triage Data
  const emergencySeverityData = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 };
    reports.forEach(r => {
      if (r.status !== 'resolved' && counts[r.severity] !== undefined) {
        counts[r.severity]++;
      }
    });
    const items = [
      { name: 'Critical (High)', value: counts.high, color: '#ef4444' },
      { name: 'Moderate (Med)', value: counts.medium, color: '#f59e0b' },
      { name: 'Minor (Low)', value: counts.low, color: '#3b82f6' }
    ].filter(item => item.value > 0);

    if (items.length === 0) {
      return [
        { name: 'Critical (High)', value: 2, color: '#ef4444' },
        { name: 'Moderate (Med)', value: 1, color: '#f59e0b' }
      ];
    }
    return items;
  }, [reports]);

  // 3. Emergency category count list for bar chart
  const emergencyCategoryData = useMemo(() => {
    const counts: { [cat: string]: number } = {
      death: 0,
      accident: 0,
      lost_passport: 0,
      medical_need: 0,
      general: 0
    };
    reports.forEach(r => {
      if (counts[r.category] !== undefined) {
        counts[r.category]++;
      } else {
        counts.general++;
      }
    });
    return [
      { name: 'DEATH CLAIM', count: counts.death, fill: '#ef4444' },
      { name: 'ACCIDENT', count: counts.accident, fill: '#f97316' },
      { name: 'PASSPORT LOST', count: counts.lost_passport, fill: '#0ea5e9' },
      { name: 'MEDICAL', count: counts.medical_need, fill: '#10b981' },
      { name: 'GENERAL', count: counts.general, fill: '#8b5cf6' }
    ];
  }, [reports]);

  // 4. Client professional demographics map
  const laborDemographicsData = useMemo(() => {
    const counts: { [p: string]: number } = {};
    members.forEach(m => {
      const prof = m.profession?.trim() || 'General Worker';
      counts[prof] = (counts[prof] || 0) + 1;
    });
    const list = Object.keys(counts).map(k => ({
      name: k,
      count: counts[k]
    }));
    list.sort((a, b) => b.count - a.count);
    if (list.length === 0) {
      return [
        { name: 'Scaffolder', count: 14 },
        { name: 'Heavy Driver', count: 9 },
        { name: 'Electrician', count: 5 },
        { name: 'Mason', count: 4 },
        { name: 'General Worker', count: 3 }
      ];
    }
    return list.slice(0, 5);
  }, [members]);

  // 5. Active Pending Requests & Actions previews
  const pendingRegistrationsPreview = useMemo(() => {
    return members.filter(m => m.status === 'pending').slice(0, 4);
  }, [members]);

  const ongoingEmergenciesPreview = useMemo(() => {
    return reports.filter(r => r.status === 'pending' || r.status === 'verified').slice(0, 4);
  }, [reports]);

  // Filtered lists
  const filteredMembers = useMemo(() => {
    const q = memberSearch.toLowerCase().trim();
    if (!q) return members;
    return members.filter(
      m => m.fullName.toLowerCase().includes(q) || 
           m.passportNo.toLowerCase().includes(q) ||
           m.omaniId.toLowerCase().includes(q) ||
           m.profession.toLowerCase().includes(q)
    );
  }, [members, memberSearch]);

  const filteredDonations = useMemo(() => {
    const q = donationSearch.toLowerCase().trim();
    if (!q) return donations;
    return donations.filter(
      d => d.donorName.toLowerCase().includes(q) || 
           d.transactionId.toLowerCase().includes(q)
    );
  }, [donations, donationSearch]);

  const filteredReports = useMemo(() => {
    const q = emergencySearch.toLowerCase().trim();
    if (!q) return reports;
    return reports.filter(
      r => r.reporterName.toLowerCase().includes(q) || 
           r.location.toLowerCase().includes(q) ||
           r.description.toLowerCase().includes(q)
    );
  }, [reports, emergencySearch]);

  // Handlers
  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitleEn.trim() || !newsContentEn.trim()) {
      alert("Please enter English Title and Content as a minimum requirement.");
      return;
    }

    if (!onAddNewsItem) {
      alert("Publish action binder is unavailable.");
      return;
    }

    const newItem: NewsItem = {
      id: `news-${Date.now().toString().slice(-6)}`,
      title: newsTitleEn,
      UrduTitle: newsTitleUr || newsTitleEn,
      PashtoTitle: newsTitlePs || newsTitleEn,
      category: newsCategory,
      content: newsContentEn,
      UrduContent: newsContentUr || newsContentEn,
      PashtoContent: newsContentPs || newsContentEn,
      date: new Date().toISOString().split('T')[0],
      important: newsImportant
    };

    onAddNewsItem(newItem);

    // Reset Form
    setNewsTitleEn('');
    setNewsTitleUr('');
    setNewsTitlePs('');
    setNewsContentEn('');
    setNewsContentUr('');
    setNewsContentPs('');
    setNewsImportant(false);
  };

  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adSponsor.trim() || !adTaglineEn.trim()) {
      alert("Please supply Sponsor Name and a Tagline description.");
      return;
    }

    if (!onAddAdBanner) {
      alert("Banner publisher binder is unavailable.");
      return;
    }

    const newAd: Advertisement = {
      id: `ad-${Date.now().toString().slice(-6)}`,
      sponsorName: adSponsor,
      bannerUrl: "N/A",
      tagline: adTaglineEn,
      UrduTagline: adTaglineUr || adTaglineEn,
      PashtoTagline: adTaglinePs || adTaglineEn,
      clickUrl: adClickUrl || "#",
      isActive: true
    };

    onAddAdBanner(newAd);

    // Reset Form
    setAdSponsor('');
    setAdTaglineEn('');
    setAdTaglineUr('');
    setAdTaglinePs('');
    setAdClickUrl('');
  };

  const handleCreateElection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!elecTitleEn.trim() || !candidateNames.trim()) {
      alert("Provide a Ballot Title and Candidate names.");
      return;
    }

    if (!onAddElection) {
      alert("Elections setup binder is unavailable.");
      return;
    }

    const candidatesList = candidateNames
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0)
      .map((name, index) => ({
        id: `cand-${Date.now().toString().slice(-4)}-${index}`,
        name,
        description: `${name} - Elder Candidate line for Cabinet Secretariat.`,
        UrduDesc: `${name} - پختون ویلفیئر سرپرست امیدوار۔`,
        PashtoDesc: `${name} - پښتون کور کانديد د عالي کمیټې لپاره۔`,
        votes: 0
      }));

    const newElection: Election = {
      id: `elec-${Date.now().toString().slice(-6)}`,
      title: elecTitleEn,
      UrduTitle: elecTitleUr || elecTitleEn,
      PashtoTitle: elecTitlePs || elecTitleEn,
      date: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0], // 14 days dynamic limit
      active: true,
      candidates: candidatesList
    };

    onAddElection(newElection);

    // Reset Form
    setElecTitleEn('');
    setElecTitleUr('');
    setElecTitlePs('');
    setCandidateNames('');
  };

  return (
    <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
      
      {/* 1. Header with simulation warning */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="bg-red-500/10 p-2.5 rounded-2xl border border-red-500/30">
            <ShieldAlert className="text-red-500 w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-display font-black text-slate-100 flex items-center gap-2">
              <span>{t(language, 'adminBoardTitle')}</span>
              <span className="bg-red-950 text-red-400 border border-red-500/40 text-[9px] font-mono uppercase font-black px-2 py-0.5 rounded tracking-widest">
                TRUSTEE ONLY
              </span>
            </h2>
            <p className="text-slate-350 text-xs mt-0.5">
              Authorized admin pane for community coordinators. Current node user: <span className="text-slate-200 underline">abuhamdan144@gmail.com</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-ping' : 'bg-amber-400'}`}></span>
          <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-300">
            {isOnline ? 'Live Ledger Synced' : 'Offline Buffer Mode'}
          </span>
        </div>
      </div>

      {/* 2. Sub-tab Selection Rail */}
      <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-850">
        <button
          onClick={() => setSubTab('overview')}
          className={`px-4 py-2 text-xs rounded-xl transition duration-150 font-bold whitespace-nowrap cursor-pointer ${subTab === 'overview' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-slate-900'}`}
        >
          Cabinet Overview
        </button>
        <button
          onClick={() => setSubTab('members')}
          className={`px-4 py-2 text-xs rounded-xl transition duration-150 font-bold whitespace-nowrap cursor-pointer ${subTab === 'members' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-slate-900'} flex items-center gap-1.5`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Members Directory ({members.length})</span>
        </button>
        <button
          onClick={() => setSubTab('donations')}
          className={`px-4 py-2 text-xs rounded-xl transition duration-150 font-bold whitespace-nowrap cursor-pointer ${subTab === 'donations' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-slate-900'} flex items-center gap-1.5`}
        >
          <Heart className="w-3.5 h-3.5 text-red-400" />
          <span>Financial Audit ({donations.filter(d => d.status === 'pending').length} pending)</span>
        </button>
        <button
          onClick={() => setSubTab('emergencies')}
          className={`px-4 py-2 text-xs rounded-xl transition duration-150 font-bold whitespace-nowrap cursor-pointer ${subTab === 'emergencies' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-slate-900'} flex items-center gap-1.5`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          <span>Disaster Triage ({reports.filter(r => r.status !== 'resolved').length} active)</span>
        </button>
        <button
          onClick={() => setSubTab('elections')}
          className={`px-4 py-2 text-xs rounded-xl transition duration-150 font-bold whitespace-nowrap cursor-pointer ${subTab === 'elections' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-slate-900'} flex items-center gap-1.5`}
        >
          <Vote className="w-3.5 h-3.5" />
          <span>Cabinet Polls</span>
        </button>
        <button
          onClick={() => setSubTab('news_ads')}
          className={`px-4 py-2 text-xs rounded-xl transition duration-150 font-bold whitespace-nowrap cursor-pointer ${subTab === 'news_ads' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-slate-900'} flex items-center gap-1.5`}
        >
          <Newspaper className="w-3.5 h-3.5" />
          <span>Press & Sponsors</span>
        </button>
        <button
          onClick={() => setSubTab('messages')}
          className={`px-4 py-2 text-xs rounded-xl transition duration-150 font-bold whitespace-nowrap cursor-pointer ${subTab === 'messages' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-slate-900'} flex items-center gap-1.5`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Helpdesk Suggestions ({messages.length})</span>
        </button>
      </div>

      {/* 3. SUBTAB CONTENT PANES */}

      {/* Pane A: Overview Metrics Dashboard */}
      {subTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Top telemetry indicators with responsive grid layout */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 shadow-inner flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition">
              <div className="flex items-start justify-between">
                <span className="text-slate-400 font-mono font-bold text-[10px] uppercase tracking-wider">Patronage Base</span>
                <Users className="text-indigo-400 w-4 h-4" />
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-slate-50 font-display flex items-baseline gap-1.5">
                  {statsSummary.activeMembers} 
                  <span className="text-[11px] text-slate-400 font-sans font-normal uppercase tracking-wider">Approved</span>
                </div>
                <p className="text-[10px] text-amber-500 font-semibold mt-1.5 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  +{statsSummary.pendingMembers} applicants awaiting review
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 shadow-inner flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition">
              <div className="flex items-start justify-between">
                <span className="text-slate-400 font-mono font-bold text-[10px] uppercase tracking-wider">Verified Treasury</span>
                <Coins className="text-amber-500 w-4 h-4" />
              </div>
              <div className="mt-4">
                <div className="text-2xl font-mono font-black text-amber-500 flex items-baseline gap-1">
                  {statsSummary.verifiedDonsSum.toFixed(3)}
                  <span className="text-[11px] text-slate-450 font-sans font-normal uppercase tracking-wider">OMR</span>
                </div>
                <p className="text-[10px] text-emerald-400 font-semibold mt-1.5 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  +{statsSummary.pendingDons} slips pending audit
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 shadow-inner flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition">
              <div className="flex items-start justify-between">
                <span className="text-slate-400 font-mono font-bold text-[10px] uppercase tracking-wider">Emergency Dispatch</span>
                <ShieldAlert className="text-red-500 w-4 h-4 animate-pulse" />
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-red-500 font-display flex items-baseline gap-1.5">
                  {statsSummary.openCrisis} 
                  <span className="text-[11px] text-slate-450 font-sans font-normal uppercase tracking-wider">Active</span>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-1.55 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  High triage severity cases priority monitored
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 shadow-inner flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition">
              <div className="flex items-start justify-between">
                <span className="text-slate-400 font-mono font-bold text-[10px] uppercase tracking-wider">Community Press</span>
                <Newspaper className="text-emerald-400 w-4 h-4" />
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-emerald-400 font-display">
                  {statsSummary.newsCount}
                  <span className="text-xs text-slate-455 font-sans font-normal lowercase ml-1">broadcasts</span>
                </div>
                <p className="text-[10px] text-purple-400 font-semibold mt-1.5 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  {statsSummary.sponsorCount} banners active
                </p>
              </div>
            </div>

          </div>

          {/* TELEMETRY CHARTS LEVEL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Col: Area Trend Chart of treasury growth */}
            <div className="lg:col-span-8 bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <TrendingUp className="text-amber-500 w-4.5 h-4.5" />
                    Treasury Fund Growth Trend (OMR)
                  </h4>
                  <span className="text-[9px] font-mono uppercase bg-slate-900 border border-slate-800 text-slate-350 py-0.5 px-2 rounded-md">Live Bank Sync</span>
                </div>
                <p className="text-[11px] text-slate-400">Verifiable aggregate contributor ledger balances charted historically.</p>
              </div>

              <div className="h-[230px] w-full mt-4 flex items-center justify-center font-sans">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={donationTrendsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="dateFormatted" stroke="#64748b" tick={{ fontSize: 9, fontFamily: 'monospace' }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 9, fontFamily: 'monospace' }} />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl shadow-xl font-mono text-xs">
                              <p className="text-slate-450 text-[10px] uppercase font-bold">Date: {label}</p>
                              <p className="text-amber-500 font-bold mt-1">Growth: {Number(payload[0].value).toFixed(3)} OMR</p>
                              <p className="text-slate-300 text-[10px]">Proof Verified Status</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area type="monotone" dataKey="cumulative" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorCumulative)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Col: Category Breakdown visualizer */}
            <div className="lg:col-span-4 bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="text-red-400 w-4.5 h-4.5" />
                  Emergency Case Categories
                </h4>
                <p className="text-[11px] text-slate-400">Claims registered for community triage.</p>
              </div>

              <div className="h-[210px] w-full mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emergencyCategoryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 8, fontFamily: 'sans-serif' }} hide />
                    <YAxis stroke="#64748b" tick={{ fontSize: 9, fontFamily: 'monospace' }} allowDecimals={false} />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-950 border border-slate-800 p-2 rounded shadow font-sans text-xs">
                              <p className="font-bold text-slate-200">{label}</p>
                              <p className="text-indigo-400 mt-0.5 font-bold">Incident count: {payload[0].value}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {emergencyCategoryData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-5 gap-1 text-[8px] font-mono text-center text-slate-400 border-t border-slate-900 pt-2.5">
                <div>
                  <span className="inline-block w-2.5 h-2.5 rounded bg-[#ef4444] mr-1"></span>
                  DEATH
                </div>
                <div>
                  <span className="inline-block w-2.5 h-2.5 rounded bg-[#f97316] mr-1"></span>
                  ACC
                </div>
                <div>
                  <span className="inline-block w-2.5 h-2.5 rounded bg-[#0ea5e9] mr-1"></span>
                  LOST
                </div>
                <div>
                  <span className="inline-block w-2.5 h-2.5 rounded bg-[#10b981] mr-1"></span>
                  MED
                </div>
                <div>
                  <span className="inline-block w-2.5 h-2.5 rounded bg-[#8b5cf6] mr-1"></span>
                  GEN
                </div>
              </div>

              {/* Dynamic Active Triage Loads row indicator */}
              <div className="mt-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-900 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">Triage Severity Load</p>
                  <div className="flex flex-wrap gap-x-2.5 gap-y-1 mt-1.5">
                    {emergencySeverityData.map(item => (
                      <span key={item.name} className="text-[9.5px] font-semibold flex items-center gap-1" style={{ color: item.color }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name.replace(/ \((High|Med|Low)\)/, '')}: {item.value}
                      </span>
                    ))}
                  </div>
                </div>
                <Activity className="text-slate-500 w-3.5 h-3.5 animate-pulse" />
              </div>

            </div>

          </div>

          {/* DEMOGRAPHICS & CRITICAL QUICK ACTIONS CENTER */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Col 1: Member Professions Demographics Map */}
            <div className="lg:col-span-5 bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 mb-1">
                  <Briefcase className="text-indigo-400 w-4.5 h-4.5" />
                  Workforce Occupation Map
                </h4>
                <p className="text-[11px] text-slate-400">Top professional trades in Omani Pakhtoon labor base.</p>
              </div>

              <div className="h-[210px] w-full mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={laborDemographicsData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <XAxis type="number" stroke="#64748b" tick={{ fontSize: 9, fontFamily: 'monospace' }} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 9, fontFamily: 'sans-serif' }} width={80} />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-950 border border-slate-800 p-2 rounded shadow font-mono text-xs">
                              <p className="font-bold text-slate-300">{label}</p>
                              <p className="text-amber-500 font-bold">Count: {payload[0].value}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-900/50 border border-slate-850 p-2.5 rounded-xl text-[10px] text-slate-400 text-center leading-relaxed font-sans mt-3">
                Most members reside in industrial sectors including <strong className="text-slate-200">Ghalah</strong>, <strong className="text-slate-200">Bausher</strong>, & <strong className="text-slate-200">Sohar</strong>.
              </div>
            </div>

            {/* Col 2: High-Priority Trustee Quick-Actions Hub */}
            <div className="lg:col-span-7 bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
              
              <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <Sliders className="text-amber-400 w-4.5 h-4.5" />
                    Immediate Trustee Audit Actions
                  </h4>
                  <p className="text-[10px] text-slate-400">Approve registrations and resolve triage logs directly.</p>
                </div>
                <span className="bg-red-500/10 border border-red-500/30 text-red-400 px-2.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-widest uppercase">
                  Action Desk
                </span>
              </div>

              <div className="space-y-4 font-sans text-xs">
                
                {/* Registrations Quick actions subset */}
                <div>
                  <p className="text-[10px] font-mono uppercase font-bold text-slate-350 tracking-wider mb-2 flex items-center justify-between">
                    <span>Awaiting Enrollment Verification ({statsSummary.pendingMembers})</span>
                    <span className="text-slate-500 font-normal normal-case">showing up to 2</span>
                  </p>
                  
                  {pendingRegistrationsPreview.length === 0 ? (
                    <div className="bg-slate-900/30 border border-slate-900 p-4 text-center rounded-xl text-slate-400">
                      👍 All membership applicants successfully verified and processed.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {pendingRegistrationsPreview.slice(0, 2).map(m => (
                        <div key={m.id} className="bg-slate-900 border border-slate-850 p-3 rounded-xl flex flex-col justify-between gap-2.5">
                          <div>
                            <div className="flex justify-between items-start">
                              <h5 className="font-bold text-slate-100 truncate w-32">{m.fullName}</h5>
                              <span className="text-[9px] font-mono bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded">{m.id}</span>
                            </div>
                            <p className="text-[10px] text-slate-450 mt-0.5">ID: {m.omaniId} • Passport: {m.passportNo}</p>
                            <p className="text-[10px] text-amber-500 font-semibold mt-0.5">Trade: {m.profession}</p>
                          </div>
                          <div className="flex gap-2 border-t border-slate-850/60 pt-2 text-[10px]">
                            <button
                              onClick={() => onApproveMember(m.id)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-1.5 rounded-lg cursor-pointer transition text-center"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => onRejectMember(m.id)}
                              className="bg-slate-950 hover:bg-red-950 hover:text-red-400 text-slate-400 px-2.5 py-1.5 rounded-lg cursor-pointer transition border border-slate-850 text-center"
                            >
                              Flag
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Open emergencies priority dispatch */}
                <div className="border-t border-slate-900 pt-3">
                  <p className="text-[10px] font-mono uppercase font-bold text-slate-350 tracking-wider mb-2 flex items-center justify-between">
                    <span>Critical Emergency Dispatch Queue ({statsSummary.openCrisis})</span>
                    <span className="text-slate-500 font-normal normal-case font-mono">showing up to 2</span>
                  </p>

                  {ongoingEmergenciesPreview.length === 0 ? (
                    <div className="bg-slate-900/30 border border-slate-900 p-4 text-center rounded-xl text-slate-400">
                      🎉 No active disaster notifications requiring response, all safe.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {ongoingEmergenciesPreview.slice(0, 2).map(r => (
                        <div key={r.id} className="bg-slate-900 border border-slate-850 p-3 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono font-bold bg-red-950/50 text-red-500 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                {r.category.toUpperCase().replace('_', ' ')}
                              </span>
                              <span className="text-[9px] font-mono text-slate-400">{r.location}</span>
                            </div>
                            <p className="text-[11px] text-slate-100 font-medium truncate max-w-[280px] md:max-w-[340px]">{r.description}</p>
                            <p className="text-[10px] text-slate-450">Contact: <strong>{r.reporterName}</strong> ({r.reporterPhone})</p>
                          </div>
                          <div className="flex gap-2 self-end md:self-auto text-[10px]">
                            {onUpdateReportStatus && r.status === 'pending' && (
                              <button
                                onClick={() => onUpdateReportStatus(r.id, 'verified')}
                                className="bg-indigo-600 hover:bg-indigo-500 text-slate-100 font-bold px-3 py-1.5 rounded-lg transition"
                              >
                                Verify Status
                              </button>
                            )}
                            {onUpdateReportStatus && (
                              <button
                                onClick={() => onUpdateReportStatus(r.id, 'resolved')}
                                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>

          {/* Quick-routing info strip */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850 gap-6 grid grid-cols-1 md:grid-cols-12 items-center">
            <div className="md:col-span-8 space-y-2.5">
              <h4 className="text-slate-100 font-display font-black text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                Administrative Access Node Online
              </h4>
              <p className="text-slate-450 text-[11px] leading-relaxed">
                As a Trustee Administrator, changes you commit publish instantly. For advanced lists, use the specific sub-tabs above, or extract spreadsheet rosters into CSV formats using download controls. Keep in-depth files secure for compliance with Oman Ministry guidelines.
              </p>
            </div>
            <div className="md:col-span-4 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setSubTab('members')}
                className="bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-[11px] font-bold px-4 py-2.5 rounded-xl cursor-pointer transition flex items-center gap-1.5 w-full md:w-auto justify-center"
              >
                <Users className="w-3.5 h-3.5" /> Direct Members Pane
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Pane B: Members Registry */}
      {subTab === 'members' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-100">Membership Application Roll</h3>
              <p className="text-xs text-slate-350 font-sans mt-0.5">Toggle member enrollment states and discharge active statuses.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleExportCSV}
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-sans font-bold px-3 py-1.5 rounded-lg transition text-xs flex items-center gap-1 w-full justify-center sm:w-auto cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Member CSV</span>
              </button>
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Filter records..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-200 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-850 rounded-xl bg-slate-950">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-850">
                  <th className="py-2.5 px-4">FullName / Phone</th>
                  <th className="py-2.5 px-4">Civil Passport Records</th>
                  <th className="py-2.5 px-4">Profession / Stay</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-sans text-xs">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-100">{m.fullName}</p>
                      <p className="text-[10px] text-slate-400">WhatsApp: {m.phone}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-200 text-[11px] space-y-0.5">
                      <p><span className="text-slate-500 text-[9px] uppercase font-sans">OmaniID:</span> {m.omaniId}</p>
                      <p><span className="text-slate-500 text-[9px] uppercase font-sans">Passport:</span> {m.passportNo}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-amber-500/90">{m.profession}</p>
                      <p className="text-[10px] text-slate-400">Oman Stay Length: {m.durationOfOmanStay}</p>
                    </td>
                    <td className="py-3 px-4">
                      {m.status === 'approved' && (
                        <span className="bg-emerald-950/75 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">Active</span>
                      )}
                      {m.status === 'pending' && (
                        <span className="bg-amber-950/75 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider animate-pulse">Pending</span>
                      )}
                      {m.status === 'rejected' && (
                        <span className="bg-red-950/75 text-red-500 border border-red-500/30 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">Flagged</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      {m.status !== 'approved' && (
                        <button
                          onClick={() => onApproveMember(m.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-1 rounded cursor-pointer transition inline-flex items-center gap-0.5"
                        >
                          Approve
                        </button>
                      )}
                      {m.status !== 'rejected' && (
                        <button
                          onClick={() => onRejectMember(m.id)}
                          className="bg-red-600 hover:bg-red-500 text-slate-950 text-[10px] font-bold px-2 py-1 rounded cursor-pointer transition inline-flex items-center gap-0.5"
                        >
                          Flag
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteMember(m.id)}
                        className="bg-slate-800 hover:bg-red-900 text-red-400 hover:text-slate-100 text-[10px] px-2 py-1 rounded border border-slate-705 cursor-pointer transition inline-flex items-center"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400 font-sans">No matching records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pane C: Donation Treasury Audit */}
      {subTab === 'donations' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-100">Treasury Donation Slips Audit</h3>
              <p className="text-xs text-slate-350 font-sans mt-0.5">Approve contributions to aggregate consolidated OMR welfare balances.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <input 
                type="text"
                placeholder="Filter slips (name, txn)..."
                value={donationSearch}
                onChange={(e) => setDonationSearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-850 rounded-xl bg-slate-950">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-850">
                  <th className="py-2.5 px-4">Donor / Contributor</th>
                  <th className="py-2.5 px-4">OMR Sum</th>
                  <th className="py-2.5 px-4">Transaction Code / Method</th>
                  <th className="py-2.5 px-4 font-mono">Date</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Audit Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-sans text-xs">
                {filteredDonations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4 font-bold text-slate-50">{d.donorName}</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-500 text-sm">
                      {Number(d.amount).toFixed(3)} OMR
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-sans space-y-0.5">
                      <p className="font-semibold">{d.method === 'bank' ? 'Bank Muscat App' : 'Mobile Phone Pay'}</p>
                      <p className="text-[10px] font-mono text-slate-400">Txn Code: {d.transactionId}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-350 font-mono text-[10px]">{d.date}</td>
                    <td className="py-3 px-4">
                      {d.status === 'verified' && (
                        <span className="bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider">Verified Audited</span>
                      )}
                      {d.status === 'pending' && (
                        <span className="bg-amber-950/70 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider animate-pulse">Awaiting Proof</span>
                      )}
                      {d.status === 'rejected' && (
                        <span className="bg-red-950/70 text-red-500 border border-red-500/30 px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider">Declined</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      {d.status !== 'verified' && (
                        <button
                          onClick={() => onApproveDonation(d.id)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-bold px-2.5 py-1 rounded cursor-pointer transition shadow"
                        >
                          Verify Sum
                        </button>
                      )}
                      {d.status !== 'rejected' && (
                        <button
                          onClick={() => onRejectDonation(d.id)}
                          className="bg-slate-800 hover:bg-red-500 hover:text-slate-950 text-slate-200 hover:border-red-500 font-bold text-[10px] px-2 py-1 rounded border border-slate-700 cursor-pointer transition"
                        >
                          Reject
                        </button>
                      )}
                      {onDeleteDonation && (
                        <button
                          onClick={() => onDeleteDonation(d.id)}
                          className="bg-slate-950 text-slate-400 hover:text-red-400 p-1 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredDonations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 font-sans">No donations found matching filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pane D: Disaster Triage Support (Emergency Reports) */}
      {subTab === 'emergencies' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-100">Live Disaster coordination & Triage desk</h3>
              <p className="text-xs text-slate-350 font-sans mt-0.5">Coordinate emergency dispatch actions on reported incidents.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <input 
                type="text"
                placeholder="Search emergency logs..."
                value={emergencySearch}
                onChange={(e) => setEmergencySearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredReports.map((rep) => (
              <div 
                key={rep.id} 
                className={`p-4 rounded-2xl border transition-all duration-200 bg-slate-950 ${rep.severity === 'high' ? 'border-red-500/40 relative before:content-[""] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-red-500 before:rounded-l-2xl' : 'border-slate-850'}`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono tracking-widest uppercase font-bold px-2 py-0.5 rounded ${rep.severity === 'high' ? 'bg-red-950 text-red-400 border border-red-500/30 animate-pulse' : 'bg-slate-900 border border-slate-800 text-slate-400'}`}>
                        {rep.severity} Severity Triage
                      </span>
                      <span className="text-slate-505 font-mono text-[10px] tracking-wider text-slate-400">• Posted {rep.date}</span>
                    </div>
                    <h4 className="text-slate-50 font-bold font-display text-sm uppercase mt-1">{rep.category.toUpperCase().replace('_', ' ')}</h4>
                    <p className="text-slate-250 text-xs leading-relaxed max-w-4xl">{rep.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400 pt-1 font-sans">
                      <p>Oman Location: <strong className="text-slate-100">{rep.location}</strong></p>
                      <p>Filer Contact: <strong className="text-slate-100">{rep.reporterName}</strong> ({rep.reporterPhone})</p>
                    </div>
                  </div>
                  
                  <div className="sm:text-right space-y-2 whitespace-nowrap self-end sm:self-auto w-full sm:w-auto border-t border-slate-900 pt-3 sm:pt-0 sm:border-0">
                    <div className="flex sm:justify-end items-center gap-1.5 mb-1.5">
                      <span className="text-[10px] text-slate-450 uppercase font-mono tracking-wide">Status:</span>
                      <span className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        rep.status === 'resolved' ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30' :
                        rep.status === 'verified' ? 'bg-indigo-950 text-indigo-400 border-indigo-500/30' :
                        'bg-amber-950 text-amber-500 border-amber-500/30 animate-pulse'
                      }`}>
                        {rep.status || 'Pending'}
                      </span>
                    </div>

                    <div className="flex gap-1.5 sm:justify-end">
                      {rep.status !== 'resolved' && onUpdateReportStatus && (
                        <button
                          onClick={() => onUpdateReportStatus(rep.id, 'resolved')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[10px] px-2.5 py-1 rounded font-bold cursor-pointer transition shadow"
                        >
                          Resolve Triage
                        </button>
                      )}
                      {rep.status === 'pending' && onUpdateReportStatus && (
                        <button
                          onClick={() => onUpdateReportStatus(rep.id, 'verified')}
                          className="bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-[10px] px-2.5 py-1 rounded font-bold cursor-pointer transition"
                        >
                          Verify Claim
                        </button>
                      )}
                      {onDeleteReport && (
                        <button
                          onClick={() => onDeleteReport(rep.id)}
                          className="bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 p-1 border border-slate-800 rounded cursor-pointer transition duration-150 relative"
                          title="Purge Incident Log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredReports.length === 0 && (
              <p className="text-center py-10 text-slate-400 bg-slate-950 rounded-2xl border border-slate-850">No disaster triage logs registered.</p>
            )}
          </div>
        </div>
      )}

      {/* Pane E: Cabinet Polls Setup */}
      {subTab === 'elections' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Create new Election Ballot */}
          <div className="lg:col-span-5 bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
            <div>
              <h4 className="text-sm font-black font-display text-slate-100 flex items-center gap-1.5 uppercase">
                <Plus className="text-amber-500 w-4.5 h-4.5" /> Setup Dynamic Voting Ballot
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Publish formal candidate ballots securely synced instantly with the Omani Pakhtoon voter ledger.</p>
            </div>

            <form onSubmit={handleCreateElection} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-350 font-bold">Ballot Title (EN) *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Muscat General Sec Cabinet Election"
                  value={elecTitleEn}
                  onChange={(e) => setNewsTitleEn(e.target.value)} // reuse to save states internally
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-slate-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-350 font-bold">Urdu Title</label>
                  <input 
                    type="text"
                    placeholder="انتخابی عنوان"
                    value={elecTitleUr}
                    onChange={(e) => setNewsTitleUr(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-100 text-right outline-none font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-350 font-bold">Pashto Title</label>
                  <input 
                    type="text"
                    placeholder="د ٹولنې ٹاکنېعنوان"
                    value={elecTitlePs}
                    onChange={(e) => setNewsTitlePs(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-100 text-right outline-none font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-350 font-bold">Candidate Lines * <span className="text-[9px] text-slate-450 uppercase normal-case font-mono font-normal">(Comma Separated List)</span></label>
                <textarea 
                  required
                  rows={2}
                  placeholder="e.g. Khan Wali Shah, Haji Shaukat, Malik Janan"
                  value={candidateNames}
                  onChange={(e) => setCandidateNames(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-slate-150 outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold p-2.5 rounded-lg cursor-pointer transition text-xs flex justify-center items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Launch Election Poll</span>
              </button>
            </form>
          </div>

          {/* Active elections directory list */}
          <div className="lg:col-span-7 space-y-4">
            <h4 className="text-sm font-bold text-slate-100">Polling Ballots Registry ({elections.length})</h4>
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {elections.map((elec) => (
                <div key={elec.id} className="bg-slate-950 p-4 border border-slate-850 rounded-2xl relative space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h5 className="text-xs font-bold text-slate-50">{elec.title}</h5>
                      <p className="text-[9px] text-slate-400 font-mono">Closing ballot threshold: {elec.date}</p>
                    </div>
                    {onDeleteElection && (
                      <button 
                        onClick={() => onDeleteElection(elec.id)}
                        className="text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="border-t border-slate-900 pt-2 space-y-1.5 text-xs">
                    {elec.candidates.map(c => (
                      <div key={c.id} className="flex justify-between text-[11px] bg-slate-900/60 p-2 rounded border border-slate-900">
                        <span className="text-amber-400 font-bold font-sans">{c.name}</span>
                        <span className="font-mono text-slate-200">🗳️ {c.votes} votes</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Pane F: Press bulletins and sponsors */}
      {subTab === 'news_ads' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
          
          {/* Create News Bulletin */}
          <div className="lg:col-span-5 bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-black font-display text-slate-100 flex items-center gap-1.5 uppercase leading-none">
                <Newspaper className="text-amber-500 w-4.5 h-4.5" /> Publish Cabinet Bulletin
              </h4>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">PRESS OFFICE</span>
            </div>

            <form onSubmit={handleCreateNews} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-350 font-bold">Bulletin Subject Heading (EN) *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Muscat elders general audit release"
                  value={newsTitleEn}
                  onChange={(e) => setNewsTitleEn(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-slate-100 outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-350 font-bold">Urdu Title</label>
                  <input 
                    type="text"
                    placeholder="اردو ہیڈنگ"
                    value={newsTitleUr}
                    onChange={(e) => setNewsTitleUr(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-100 text-right font-sans outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-350 font-bold">Pashto Title</label>
                  <input 
                    type="text"
                    placeholder="پښتو ہیڈنگ"
                    value={newsTitlePs}
                    onChange={(e) => setNewsTitlePs(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-100 text-right font-sans outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-350 font-bold">Detailed Content (EN) *</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Elaborate complete details..."
                  value={newsContentEn}
                  onChange={(e) => setNewsContentEn(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-slate-150 outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-350 font-bold">Urdu Content</label>
                  <textarea 
                    rows={2}
                    placeholder="تفصیلات"
                    value={newsContentUr}
                    onChange={(e) => setNewsContentUr(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-150 text-right outline-none font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-350 font-bold">Pashto Content</label>
                  <textarea 
                    rows={2}
                    placeholder="فصیل"
                    value={newsContentPs}
                    onChange={(e) => setNewsContentPs(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-150 text-right outline-none font-sans"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-350 font-bold">Category Tag</label>
                  <select 
                    value={newsCategory}
                    onChange={(e) => setNewsCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-slate-100 font-bold focus:border-amber-400"
                  >
                    <option value="Welfare Card">Welfare Card</option>
                    <option value="Treasury">Treasury Audit</option>
                    <option value="Cabinet">Cabinet Updates</option>
                    <option value="Announcement">Legal announcements</option>
                    <option value="General News">General news bulletins</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5 select-none shrink-0">
                  <input 
                    type="checkbox"
                    id="news-important"
                    checked={newsImportant}
                    onChange={(e) => setNewsImportant(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                  <label htmlFor="news-important" className="font-bold text-slate-100 cursor-pointer">Show on Hero Wall</label>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-slate-100 font-bold p-2.5 rounded-lg cursor-pointer transition text-xs"
              >
                Broadcast Press Alert
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-6">
            
            {/* News bulletins list */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Published bulletins ({news.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 max-h-56 overflow-y-auto pr-1">
                {news.map((item) => (
                  <div key={item.id} className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex justify-between gap-3">
                    <div className="space-y-1 text-xs">
                      <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono uppercase font-bold ${item.important ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-350'}`}>
                        {item.important ? 'Important' : item.category}
                      </span>
                      <h5 className="text-slate-150 font-bold truncate max-w-xs">{item.title}</h5>
                      <p className="text-slate-400 text-[10px]">{item.date}</p>
                    </div>
                    {onDeleteNewsItem && (
                      <button 
                        onClick={() => onDeleteNewsItem(item.id)}
                        className="text-slate-500 hover:text-red-400 self-center cursor-pointer p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Sponsors Publisher area inside the Admin Panel */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-4">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4 text-emerald-400" />
                  Sponsor Banner Advertisements ({ads.length})
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">Define corporate sponsors deals that overlay high-visibility promotional content at the top header carousel.</p>
              </div>

              <form onSubmit={handleCreateAd} className="grid grid-cols-2 gap-2 text-xs">
                <input 
                  type="text"
                  required
                  placeholder="Sponsor Name"
                  value={adSponsor}
                  onChange={(e) => setAdSponsor(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2 rounded outline-none text-slate-100 col-span-1"
                />
                <input 
                  type="text"
                  placeholder="Deal Landing Link (http...)"
                  value={adClickUrl}
                  onChange={(e) => setAdClickUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2 rounded outline-none text-slate-150 col-span-1 font-mono"
                />
                <div className="col-span-2 grid grid-cols-3 gap-1.5">
                  <input 
                    type="text"
                    required
                    placeholder="EN Tagline Pitch"
                    value={adTaglineEn}
                    onChange={(e) => setAdTaglineEn(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded outline-none text-slate-100 text-[11px]"
                  />
                  <input 
                    type="text"
                    placeholder="UR Tagline"
                    value={adTaglineUr}
                    onChange={(e) => setAdTaglineUr(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded outline-none text-slate-100 text-[11px] text-right font-sans"
                  />
                  <input 
                    type="text"
                    placeholder="PS Tagline"
                    value={adTaglinePs}
                    onChange={(e) => setAdTaglinePs(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded outline-none text-slate-100 text-[11px] text-right font-sans"
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3 py-2 rounded text-[11px] col-span-2 cursor-pointer text-center select-none"
                >
                  Create active advertisement deal
                </button>
              </form>

              {/* Sponsor campaign rails list */}
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {ads.map((adItem) => (
                  <div key={adItem.id} className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex justify-between items-center text-[11px]">
                    <div>
                      <p className="font-bold text-slate-100 flex items-center gap-1">
                        <span>{adItem.sponsorName}</span>
                        {adItem.isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 inline-block bg-emerald-400"></span>}
                      </p>
                      <p className="text-slate-400 text-[10px] leading-relaxed truncate max-w-xs">{adItem.tagline}</p>
                    </div>
                    
                    <div className="flex gap-1">
                      {onToggleAdActive && (
                        <button 
                          onClick={() => onToggleAdActive(adItem.id)}
                          className={`text-[9.5px] px-1.5 py-0.5 rounded font-mono font-bold cursor-pointer ${adItem.isActive ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/35' : 'bg-slate-850 text-slate-400 border border-slate-800'}`}
                        >
                          {adItem.isActive ? 'Active' : 'Muted'}
                        </button>
                      )}
                      {onDeleteAdBanner && (
                        <button 
                          onClick={() => onDeleteAdBanner(adItem.id)}
                          className="text-slate-400 hover:text-red-400 cursor-pointer px-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Pane G: Helpdesk Suggestions Inbox */}
      {subTab === 'messages' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-850 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-100">Helpdesk Suggestions Inboxes</h3>
              <p className="text-xs text-slate-350 font-sans">Read structural reports and welfare feedback tickets submitted by members.</p>
            </div>
            <span className="text-slate-350 text-xs font-bold bg-slate-950 px-2.5 py-1 rounded border border-slate-850 font-mono">
              Total logs: {messages.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {messages.map((m) => (
              <div key={m.id} className="bg-slate-950 p-4 rounded-xl border border-slate-855 space-y-2.5 flex justify-between items-start gap-4">
                <div className="space-y-1 text-xs">
                  <div className="flex flex-wrap items-center gap-x-2.5 text-[10px] font-mono text-slate-400">
                    <span className="font-bold uppercase text-amber-500 tracking-wider">Helpdesk Dispatch Entry</span>
                    <span>• Timestamp: {m.date}</span>
                  </div>
                  <p className="text-slate-150 font-sans leading-relaxed italic border-l-2 border-slate-800 pl-3">
                    "{m.message}"
                  </p>
                  <p className="text-[10px] font-sans text-slate-400">
                    Filed by: <strong className="text-slate-100 font-sans">{m.name}</strong> ({m.email})
                  </p>
                </div>
                {onDeleteMessage && (
                  <button 
                    onClick={() => onDeleteMessage(m.id)}
                    className="text-slate-400 hover:text-red-400 shrink-0 cursor-pointer self-center border border-slate-900 hover:border-red-500/30 p-1.5 rounded-lg transition"
                    title="Purge Suggestion Archive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-center py-10 font-sans text-xs text-slate-405 text-slate-400 bg-slate-950 border border-slate-850 rounded-xl">
                No member suggestions logged in the helpdesk database.
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
