import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert,
  SlidersHorizontal, 
  PhoneCall, 
  Trash2, 
  Eye, 
  Activity, 
  CheckCircle2, 
  X,
  PlusCircle,
  Clock,
  Building,
  CreditCard
} from 'lucide-react';
import { Member } from '../types';
import { DigitalMemberId } from './DigitalMemberId';

interface AdminMembersDirectoryProps {
  members: Member[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDeleteMember?: (id: string) => void; // Support direct deletion
  language?: 'en' | 'ur' | 'ps';
}

export const AdminMembersDirectory: React.FC<AdminMembersDirectoryProps> = ({
  members,
  onApprove,
  onReject,
  onDeleteMember,
  language = 'en'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Internationalization labels dictionary
  const t = (en: string, ur: string, ps: string) => {
    if (language === 'ur') return ur;
    if (language === 'ps') return ps;
    return en;
  };

  // Extract unique cities present in all records
  const availableCities = useMemo(() => {
    const citiesSet = new Set<string>();
    members.forEach(m => {
      if (m.city) {
        const cleaned = m.city.trim();
        if (cleaned) {
          citiesSet.add(cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase());
        }
      }
    });
    return Array.from(citiesSet).sort();
  }, [members]);

  // Compute metrics counters
  const metrics = useMemo(() => {
    return {
      total: members.length,
      approved: members.filter(m => m.status === 'approved').length,
      pending: members.filter(m => m.status === 'pending').length,
      rejected: members.filter(m => m.status === 'rejected').length,
    };
  }, [members]);

  // Serialized member ID formatter
  const formatMemberId = (m: Member) => {
    const code = m.id.replace('user-', '');
    const cityInitial = m.city ? m.city.substring(0, 3).toUpperCase() : 'OM';
    const joinYear = m.joinedDate ? m.joinedDate.split('-')[0] : '2026';
    return `OPC-${joinYear}-${code.padStart(4, '0')}-${cityInitial}`;
  };

  // Perform multi-criteria search and filter operations
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      // 1. Status Filter matching
      if (statusFilter !== 'all' && m.status !== statusFilter) {
        return false;
      }

      // 2. City Filter matching
      if (cityFilter !== 'all') {
        const mCityRaw = m.city ? m.city.trim().toLowerCase() : '';
        if (mCityRaw !== cityFilter.toLowerCase()) {
          return false;
        }
      }

      // 3. Text query matching
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;

      const serializedId = formatMemberId(m).toLowerCase();
      const name = m.name?.toLowerCase() || '';
      const email = m.email?.toLowerCase() || '';
      const phone = m.phone || '';
      const district = m.district?.toLowerCase() || '';
      const city = m.city?.toLowerCase() || '';
      const employer = m.employer?.toLowerCase() || '';

      return (
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        district.includes(query) ||
        city.includes(query) ||
        employer.includes(query) ||
        serializedId.includes(query)
      );
    });
  }, [members, searchQuery, statusFilter, cityFilter]);

  return (
    <div id="admin_members_directory_root" className="bg-white rounded-2xl border border-gray-250 p-6 md:p-8 shadow-xs space-y-6 text-left">
      
      {/* SECTION HEADER & QUICK METRICS CORES */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-gray-100 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 rounded-xl border border-amber-200">
              <Users className="w-5 h-5 text-amber-600 shrink-0" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-gray-900 font-display uppercase tracking-tight">
              {t('Verified Members Registry & Cards', 'تصدیق شدہ برادری رجسٹر اور شناختی کارڈز', 'د تصدیق شوي غړو ډیټابیس او کارتونه')}
            </h3>
          </div>
          <p className="text-xs text-gray-550 leading-relaxed max-w-2xl font-sans">
            {t('Administrative live list of all approved expat memberships, pending applications, and rejected records. Tap "View Membership Card" to flip cards in 3D, check cryptographic signatures, or launch the desktop printer interface.',
              'تمام فعال، معطل، اور زیر التواء اراکین کی فہرست۔ ہولوگرافک شناختی کارڈ کو 3D میں دیکھنے، پرنٹ کرنے، یا این ایف سی برانڈ ڈیٹا حاصل کرنے کے لیے کلک کریں۔',
              'د ټولو فعالو غړو رسمي مالي او باثباته لړلیک دلته کتلای او تائیدولای شئ.')}
          </p>
        </div>

        {/* Dynamic Metric counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0 font-sans">
          <div className="bg-slate-50 border border-gray-200 rounded-xl p-3 text-center space-y-0.5">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{t('Registered', 'کل تعداد', 'ټول غړي')}</span>
            <span className="text-sm font-black text-slate-800">{metrics.total}</span>
          </div>

          <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-3 text-center space-y-0.5">
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">{t('Approved', 'فعال کارڈز', 'فعال کارتونه')}</span>
            <span className="text-sm font-black text-emerald-800">{metrics.approved}</span>
          </div>

          <div className="bg-amber-50 border border-amber-150 rounded-xl p-3 text-center space-y-0.5 animate-pulse">
            <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider block">{t('Pending Docs', 'زیر التوا', 'نا تایید شوي')}</span>
            <span className="text-sm font-black text-amber-800">{metrics.pending}</span>
          </div>

          <div className="bg-red-50 border border-red-150 rounded-xl p-3 text-center space-y-0.5">
            <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider block">{t('Flagged / Refused', 'مسترد شدہ', 'مسترد شوي')}</span>
            <span className="text-sm font-black text-red-800">{metrics.rejected}</span>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS TOOLBAR */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 font-sans">
        {/* Search Input Box */}
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search by ID, Name, Phone, District, City, Sponsor...', 'آئی ڈی، نام، فون، ضلع یا کفیل کے ذریعے تلاش کریں...', 'د نوم، ټلیفون، یا شناخت لخوا لټون...')}
            className="w-full text-xs md:text-sm pl-9.5 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-emerald-650 bg-white shadow-3xs text-gray-800 placeholder-gray-400 font-medium"
          />
        </div>

        {/* Toolbar Action dropdowns & switch filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Tab selectors */}
          <div className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5 text-xs shadow-3xs overflow-hidden">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-md font-extrabold transition-all cursor-pointer ${statusFilter === 'all' ? 'bg-slate-900 text-white' : 'text-gray-500 hover:text-slate-800'}`}
            >
              All Users
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1.5 rounded-md font-extrabold transition-all cursor-pointer ${statusFilter === 'approved' ? 'bg-emerald-700 text-white' : 'text-emerald-700 hover:bg-emerald-50'}`}
            >
              Approved (فعال)
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-md font-extrabold transition-all cursor-pointer ${statusFilter === 'pending' ? 'bg-amber-600 text-white' : 'text-amber-700 hover:bg-amber-50'}`}
            >
              Pending (زیر تائید)
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-3 py-1.5 rounded-md font-extrabold transition-all cursor-pointer ${statusFilter === 'rejected' ? 'bg-red-650 text-white' : 'text-red-650 hover:bg-red-50'}`}
            >
              Rejected
            </button>
          </div>

          {/* City filtration dropdown selector */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="text-xs px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-offset-1 focus:outline-emerald-600 font-bold text-gray-700 shadow-3xs"
          >
            <option value="all">📍 All Oman Cities ({availableCities.length})</option>
            {availableCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      {/* VERIFIED MEMBERS TABLE & EXPANDED TILES LIST */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-3xs bg-white">
        
        {/* Table View Layout - Desktop/Large screens */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-gray-400 font-black uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-12 text-center">Face</th>
                <th className="py-3 px-4">Member ID & Full Name</th>
                <th className="py-3 px-4">Oman City / PK District</th>
                <th className="py-3 px-4">Sponsor/Employer</th>
                <th className="py-3 px-4 text-center">Blood</th>
                <th className="py-3 px-4">Validation Status</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Interactive Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150">
              {filteredMembers.map(member => {
                const isApproved = member.status === 'approved';
                const isPending = member.status === 'pending';
                const isRejected = member.status === 'rejected';

                return (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition">
                    {/* User Avatar */}
                    <td className="py-3.5 px-4 text-center">
                      <img 
                        src={member.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150"} 
                        alt={member.name} 
                        className="w-9 h-9 object-cover rounded-full border border-gray-200 shadow-inner inline-block"
                      />
                    </td>

                    {/* Member ID & Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-gray-900 leading-snug flex items-center gap-1.5">
                        {member.name} 
                        {isApproved && <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full inline-block" />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border font-bold">
                          {formatMemberId(member)}
                        </span>
                        <span className="text-[10px] text-gray-400 truncate">{member.email}</span>
                      </div>
                    </td>

                    {/* Oman Location / PK District */}
                    <td className="py-3.5 px-4.5">
                      <div className="font-bold text-gray-800 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>{member.city || 'Muscat'}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 block ml-4.5">Hometown: <strong>{member.district || 'Swat'}</strong></span>
                    </td>

                    {/* Employer details */}
                    <td className="py-3.5 px-4 max-w-[150px] truncate" title={member.employer}>
                      <span className="font-medium text-gray-650 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-gray-450 shrink-0" />
                        {member.employer || 'Al Ansar Construction'}
                      </span>
                      <span className="text-[10px] text-slate-400 block ml-4.5">Contact: {member.phone}</span>
                    </td>

                    {/* Blood Group */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[#f43f5e] font-black bg-rose-50 border border-rose-150 rounded text-[11px] font-mono">
                        🩸 {member.bloodGroup || 'O+'}
                      </span>
                    </td>

                    {/* Status badges */}
                    <td className="py-3.5 px-4">
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-150/60">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          Authorized
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-800 bg-amber-50 px-2 py-1 rounded-md border border-amber-200/50 animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Pending Verify
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-red-700 bg-red-50 px-2 py-1 rounded-md border border-red-200/50">
                          <ShieldAlert className="w-3.5 h-3.5 text-red-650" />
                          Suspended
                        </span>
                      )}
                    </td>

                    {/* Audited Registry Date */}
                    <td className="py-3.5 px-4 text-gray-500 font-mono text-[10px]">
                      {member.joinedDate || '2026-03-12'}
                    </td>

                    {/* Actions button series */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-nowrap font-sans">
                        
                        <button
                          type="button"
                          onClick={() => setSelectedMember(member)}
                          className="cursor-pointer bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 border border-emerald-600 hover:border-emerald-750 shadow-3xs"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Show Badge (کارڈ)</span>
                        </button>

                        <div className="h-5 w-px bg-gray-200 mx-1"></div>

                        {/* Approval transition controls on administrative list */}
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => onApprove(member.id)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-1.5 rounded-lg border border-emerald-200 transition cursor-pointer"
                            title="Approve immediately"
                          >
                            Approve
                          </button>
                        )}
                        
                        {isApproved && (
                          <button
                            type="button"
                            onClick={() => onReject(member.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[10px] px-2 py-1.5 rounded-lg border border-red-150 transition cursor-pointer"
                            title="Flag / Suspend Card validation"
                          >
                            Suspend
                          </button>
                        )}

                        {isRejected && (
                          <button
                            type="button"
                            onClick={() => onApprove(member.id)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-1.5 rounded-lg border border-emerald-200 transition cursor-pointer"
                            title="Restore card permissions"
                          >
                            Restore
                          </button>
                        )}

                        {onDeleteMember && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Are you absolutely sure you want to delete ${member.name}'s complete record? This is irreversible.`)) {
                                onDeleteMember(member.id);
                              }
                            }}
                            className="text-gray-400 hover:text-red-650 p-1.5 hover:bg-red-50 rounded-lg transition"
                            title="Permanently Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-gray-400 font-sans italic">
                    {t('No registered members found matching application filters.', 'اس سرچ اور فلٹر کے مطابق کوئی ممبر ریکارڈ نہیں ملا۔', 'هیڅ غړی ونه موندل شو.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dense Stacked Tile Cards view on Mobile/Mobile devices (up to lg layout) */}
        <div className="block lg:hidden divide-y divide-gray-150 font-sans">
          {filteredMembers.map(member => {
            const isApproved = member.status === 'approved';
            const isPending = member.status === 'pending';
            const isRejected = member.status === 'rejected';

            return (
              <div key={member.id} className="p-4 hover:bg-slate-50 transition space-y-3.5">
                <div id={`m_card_tile_${member.id}`} className="flex items-start gap-3">
                  <img 
                    src={member.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150"} 
                    alt={member.name} 
                    className="w-10 h-10 object-cover rounded-full border border-gray-200"
                  />
                  
                  <div className="flex-1 space-y-0.5 text-left">
                    <h4 className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                      {member.name}
                      <span className="font-mono text-[9px] text-gray-450">({formatMemberId(member)})</span>
                    </h4>
                    <p className="text-[11px] text-gray-400">{member.email || 'No email provided'}</p>
                    
                    <div className="flex flex-wrap gap-2 pt-1">
                      {isApproved && (
                        <span className="inline-flex items-center text-[9px] font-black text-emerald-800 bg-emerald-50 border border-emerald-150 rounded px-1.5 py-0.5">
                          Approved
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center text-[9px] font-black text-amber-800 bg-amber-50 border border-amber-150 rounded px-1.5 py-0.5">
                          Pending Verification
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center text-[9px] font-black text-red-700 bg-red-50 border border-red-150 rounded px-1.5 py-0.5">
                          Suspended
                        </span>
                      )}
                      <span className="inline-flex items-center text-[9px] font-black text-[#f43f5e] bg-rose-50 border border-rose-150 rounded px-1.5 py-0.5">
                        🩸 {member.bloodGroup || 'O+'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sub details line */}
                <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2.5 rounded-lg border border-gray-200 font-medium">
                  <div>City in Oman: <strong className="text-slate-800">{member.city || 'Muscat'}</strong></div>
                  <div>PK District: <strong className="text-slate-800">{member.district || 'Swat'}</strong></div>
                  <div className="col-span-2">Employer: <strong className="text-slate-750">{member.employer || 'Al-Khonji Group'}</strong></div>
                  <div>Phone: <strong className="text-slate-750">{member.phone}</strong></div>
                  <div>Joined: <strong className="text-slate-450">{member.joinedDate}</strong></div>
                </div>

                {/* Action trigger buttons */}
                <div className="flex items-center gap-2 pt-1 font-sans justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedMember(member)}
                    className="cursor-pointer bg-emerald-700 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg shadow-3xs flex items-center gap-1"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>View Badge Card</span>
                  </button>

                  <div className="flex items-center gap-1.5 ml-auto">
                    {isPending && (
                      <button 
                        onMouseDown={() => onApprove(member.id)}
                        className="bg-emerald-50 text-emerald-800 border border-emerald-250 font-bold text-[9px] px-2.5 py-1.5 rounded-lg"
                      >
                        Approve
                      </button>
                    )}
                    {isApproved && (
                      <button 
                        onMouseDown={() => onReject(member.id)}
                        className="bg-red-50 text-red-600 border border-red-200 font-bold text-[9px] px-2 py-1.5 rounded-lg"
                      >
                        Suspend
                      </button>
                    )}
                    {isRejected && (
                      <button 
                        onMouseDown={() => onApprove(member.id)}
                        className="bg-emerald-50 text-emerald-800 border border-emerald-250 font-bold text-[9px] px-2 py-1.5 rounded-lg"
                      >
                        Approve
                      </button>
                    )}
                    {onDeleteMember && (
                      <button
                        onMouseDown={() => {
                          if (window.confirm(`Delete ${member.name}?`)) onDeleteMember(member.id);
                        }}
                        className="p-1 text-gray-400 bg-white border rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filteredMembers.length === 0 && (
            <div className="py-12 text-center text-xs text-gray-400 font-semibold font-sans italic">
              {t('No registered members found matching application filters.', 'اس سرچ اور فلٹر کے مطابق کوئی ممبر ریکارڈ نہیں ملا۔', 'هیڅ غړی ونه موندل شو.')}
            </div>
          )}
        </div>

      </div>

      {/* 🔮 BEAUTIFUL OVERLAY MODAL: DIGITAL MEMBERSHIP CARD VIEWER */}
      {selectedMember && (
        <div id="digital_badge_overlay_modal" className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-gray-150 shadow-2xl max-w-4xl w-full p-4 md:p-6 relative overflow-y-auto max-h-[95vh] focus:outline-none zoom-in-95">
            {/* Modal close icon banner */}
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 z-50 p-1.5 text-gray-450 hover:text-rose-600 bg-gray-100 hover:bg-rose-50 rounded-full border border-gray-200 hover:border-rose-150 cursor-pointer shadow-3xs transition"
              title="Close modal window"
            >
              <X className="w-5 h-5 shrink-0" />
            </button>

            {/* Render full flippable & print-ready Digital ID Card directly inside admin panel */}
            <div className="mt-4">
              <DigitalMemberId 
                member={selectedMember} 
                onClose={() => setSelectedMember(null)}
                showLookupFeature={false}
                allApprovedMembers={members}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
