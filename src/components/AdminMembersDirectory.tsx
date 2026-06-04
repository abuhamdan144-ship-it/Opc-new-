import React, { useState, useMemo } from 'react';
import { Search, CheckCircle2, UserCheck, CreditCard, ShieldAlert, FileCheck, Award } from 'lucide-react';
import { Member, Donation, Language } from '../types';
import { t } from '../i18n';

interface AdminMembersDirectoryProps {
  members: Member[];
  donations: Donation[];
  activeRole: 'guest' | 'member' | 'admin';
  language: Language;
  onApproveMember: (id: string) => void;
  onRejectMember: (id: string) => void;
  onApproveDonation: (id: string) => void;
  onRejectDonation: (id: string) => void;
  onDeleteMember: (id: string) => void;
}

export const AdminMembersDirectory: React.FC<AdminMembersDirectoryProps> = ({
  members,
  donations,
  activeRole,
  language,
  onApproveMember,
  onRejectMember,
  onApproveDonation,
  onRejectDonation,
  onDeleteMember
}) => {
  // Card Lookup Search
  const [lookupQuery, setLookupQuery] = useState('');
  const [searchedRecord, setSearchedRecord] = useState<Member | null | undefined>(null);

  // General Table Search
  const [directorySearch, setDirectorySearch] = useState('');

  // Handle Card verification lookup
  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) {
      setSearchedRecord(null);
      return;
    }
    const cleanQuery = lookupQuery.trim().toLowerCase();
    const found = members.find(
      m => m.omaniId.toLowerCase() === cleanQuery || m.passportNo.toLowerCase() === cleanQuery
    );
    setSearchedRecord(found || undefined); // undefined represents not found
  };

  // Filtered members for directory view
  const filteredMembersList = useMemo(() => {
    const q = directorySearch.toLowerCase().trim();
    if (!q) return members;
    return members.filter(
      m => m.fullName.toLowerCase().includes(q) || 
           m.passportNo.toLowerCase().includes(q) ||
           m.omaniId.toLowerCase().includes(q) ||
           m.profession.toLowerCase().includes(q)
    );
  }, [members, directorySearch]);

  return (
    <div id="comp-admin-directory" className="space-y-8">
      
      {/* 1. Digital Member Card Lookup section */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="max-w-xl">
          <h3 className="text-xl font-display font-bold text-slate-150 flex items-center gap-2">
            <CreditCard className="text-amber-400 w-5 h-5" />
            {t(language, 'memberPortalTitle')} <span className="text-slate-400 font-sans font-normal text-xs">{t(language, 'memberPortalUrdu')}</span>
          </h3>
          <p className="text-slate-350 text-sm mt-1">
            Query your Omani Civil ID or Pakistani Passport number below to pull your active welfare validation card.
          </p>
          
          <form onSubmit={handleLookup} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
              <input 
                type="text"
                placeholder={t(language, 'memberLookupPlaceholder')}
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border-2 border-slate-850 hover:border-slate-700 focus:border-amber-400/80 rounded-lg text-slate-100 placeholder-slate-410 font-sans outline-none font-medium transition duration-200"
              />
            </div>
            <button 
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-sans font-bold px-5 py-2 rounded-lg transition duration-200 cursor-pointer text-sm shadow-md"
            >
              {t(language, 'lookupBtn')}
            </button>
          </form>
        </div>

        {/* Search Results Visual Segment */}
        {searchedRecord === undefined && (
          <div className="mt-6 p-4 bg-red-950/20 border border-red-500/40 rounded-xl text-red-300 text-sm">
            ❌ {t(language, 'noMemberFound')}
          </div>
        )}

        {searchedRecord && (
          <div className="mt-6 max-w-lg mx-auto bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-400 rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all duration-300 scale-100 hover:scale-[1.01]">
            {/* Background Emblem watermark */}
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-amber-400/5 rounded-full pointer-events-none border border-amber-400/5 flex items-center justify-center font-display font-extrabold text-7xl text-amber-400/10">
              OPC
            </div>

            {/* Premium Gold Accent Card Header */}
            <div className="flex justify-between items-start gap-3 border-b border-amber-400/30 pb-4">
              <div>
                <h4 className="text-amber-400 font-display font-bold text-base tracking-wide uppercase">OMAN PAKHTOON WELFARE</h4>
                <p className="text-emerald-400 text-[10px] uppercase font-mono tracking-widest font-bold flex items-center gap-1 mt-0.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {t(language, 'statusApproved')}
                </p>
              </div>
              <div className="bg-amber-400/10 border border-amber-400/45 px-2.5 py-1 rounded text-[10px] font-mono font-bold text-amber-390">
                NO: {searchedRecord.id.toUpperCase()}
              </div>
            </div>

            {/* Card Content grid */}
            <div className="mt-4 grid grid-cols-2 gap-y-3.5 gap-x-6">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-mono tracking-wider font-bold">{t(language, 'inputFullName')}</p>
                <p className="text-slate-100 font-sans font-extrabold text-sm tracking-wide">{searchedRecord.fullName.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-mono tracking-wider font-bold">{t(language, 'cardProfession')}</p>
                <p className="text-amber-300 font-sans font-bold text-sm">{searchedRecord.profession}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-mono tracking-wider font-bold">{t(language, 'cardOmaniId')}</p>
                <p className="text-slate-100 font-mono font-extrabold text-sm tracking-widest">{searchedRecord.omaniId}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-mono tracking-wider font-bold">{t(language, 'cardPassport')}</p>
                <p className="text-slate-100 font-mono font-extrabold text-sm tracking-wider">{searchedRecord.passportNo}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-mono tracking-wider font-bold">{t(language, 'cardDuration')}</p>
                <p className="text-slate-100 font-sans text-xs">{searchedRecord.durationOfOmanStay}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-mono tracking-wider font-bold">{t(language, 'cardWelfareEligible')}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold text-xs">{t(language, 'yes')}</span>
                </div>
              </div>
            </div>

            {/* Bottom digital sign block */}
            <div className="mt-6 pt-4 border-t border-slate-900 flex justify-between items-center bg-slate-950/40 -mx-6 -mb-6 px-6 py-3">
              <div className="flex gap-2.5 items-center">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-350 font-mono text-[9px] uppercase leading-tight">LEDGER STAMP VERIFIED<br/>Oman Elders Registry</span>
              </div>
              {/* Simulated barcode */}
              <div className="flex flex-col items-end">
                <div className="h-4 w-28 bg-current text-slate-200 opacity-25 flex gap-0.5 pointer-events-none">
                  {[...Array(24)].map((_, i) => (
                    <span key={i} className="h-full bg-slate-250 inline-block" style={{ width: `${(i % 3 === 0 ? 3 : 1)}px` }}></span>
                  ))}
                </div>
                <span className="text-[8px] font-mono text-slate-400 mt-0.5">SW-OPC-SEC-{searchedRecord.id.toUpperCase()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Global Registry Directory table */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-display font-bold text-slate-105">OPC Welfare Registry Directory</h3>
            <p className="text-slate-300 text-xs mt-0.5">Complete record of registered Pakhtoon laborers under Muscat Cabinet protection.</p>
          </div>
          {/* Internal search inside directory */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder={t(language, 'searchLabel') + '...'}
              value={directorySearch}
              onChange={(e) => setDirectorySearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-200 text-xs font-sans outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Card Registry Grid List (Responsive grid/table) */}
        <div className="mt-6 overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-4">Full Legal Name</th>
                <th className="py-3 px-4">Profession / Stay</th>
                <th className="py-3 px-4">Civil Passport Records</th>
                <th className="py-3 px-4">Registration Date</th>
                <th className="py-3 px-4">Status</th>
                {activeRole === 'admin' && <th className="py-3 px-4 text-right">Admin Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans text-xs">
              {filteredMembersList.map((member) => (
                <tr key={member.id} className="hover:bg-slate-950/50 transition duration-150">
                  <td className="py-3.5 px-4">
                    <p className="text-slate-100 font-bold">{member.fullName}</p>
                    <p className="text-slate-350 text-[10px]" style={{ color: '#94a3b8' }}>WhatsApp: {member.phone}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-200">
                    <p className="font-medium text-amber-500/90">{member.profession}</p>
                    <p className="text-[10px] text-slate-350" style={{ color: '#94a3b8' }}>Oman Length: {member.durationOfOmanStay}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-250">
                    <p className="flex items-center gap-1 text-[11px]">
                      <span className="text-slate-400 font-sans text-[9px] uppercase">O-ID:</span> {member.omaniId}
                    </p>
                    <p className="flex items-center gap-1 text-[11px]">
                      <span className="text-slate-400 font-sans text-[9px] uppercase">Pass:</span> {member.passportNo}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-350 font-mono text-[10px]">
                    {member.registrationDate}
                  </td>
                  <td className="py-3.5 px-4">
                    {member.status === 'approved' && (
                      <span className="bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">Approved Active</span>
                    )}
                    {member.status === 'pending' && (
                      <span className="bg-amber-950/50 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold">Pending Review</span>
                    )}
                    {member.status === 'rejected' && (
                      <span className="bg-red-950/50 text-red-500 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-bold">Flagged</span>
                    )}
                  </td>
                  {activeRole === 'admin' && (
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      {member.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => onApproveMember(member.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-1 rounded cursor-pointer transition duration-150 inline-flex items-center gap-0.5"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => onRejectMember(member.id)}
                            className="bg-red-600 hover:bg-red-500 text-slate-950 text-[10px] font-bold px-2 py-1 rounded cursor-pointer transition duration-150 inline-flex items-center gap-0.5"
                          >
                            Flag
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => onDeleteMember(member.id)}
                        className="bg-slate-800 hover:bg-red-650 text-red-400 hover:text-slate-950 text-[10px] px-2 py-1 rounded border border-slate-700 hover:border-red-600 cursor-pointer transition duration-150"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filteredMembersList.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-350 font-sans">No matching records found in Oman database directory.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Simulated Admin Control center (Database audits) */}
      {activeRole === 'admin' && (
        <div className="bg-slate-900 border-2 border-red-500/40 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldAlert className="text-red-500 w-6 h-6 animate-bounce" />
            <div>
              <h3 className="text-lg font-display font-bold text-red-400 capitalize">{t(language, 'adminBoardTitle')}</h3>
              <p className="text-xs text-slate-300">Special administrative tools enabled for user email: <span className="text-slate-200 underline font-mono">abuhamdan144@gmail.com</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Sec A: Approve member registrations */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h4 className="text-sm font-mono uppercase tracking-wider text-slate-100 flex items-center gap-1.5 font-bold">
                <UserCheck className="w-4 h-4 text-indigo-400" /> Pending Registrations ({members.filter(m => m.status === 'pending').length})
              </h4>
              <div className="space-y-2 mt-2 max-h-60 overflow-y-auto pr-1">
                {members.filter(m => m.status === 'pending').map((m) => (
                  <div key={m.id} className="bg-slate-900 p-3 rounded border border-slate-800 flex justify-between items-center gap-4">
                    <div>
                      <p className="text-slate-100 font-bold text-xs">{m.fullName}</p>
                      <p className="text-[10px] text-slate-300">{m.profession} / ID: {m.omaniId}</p>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => onApproveMember(m.id)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] px-2.5 py-1 rounded cursor-pointer transition"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => onRejectMember(m.id)}
                        className="bg-slate-800 hover:bg-red-500 hover:text-slate-950 text-slate-200 font-bold text-[10px] px-2.5 py-1 rounded border border-slate-700 hover:border-red-500 cursor-pointer transition"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
                {members.filter(m => m.status === 'pending').length === 0 && (
                  <p className="text-slate-350 text-[11px] text-center py-6">All registration forms fully processed.</p>
                )}
              </div>
            </div>

            {/* Sec B: Audit donation ledger slips */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h4 className="text-sm font-mono uppercase tracking-wider text-slate-100 flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-amber-400" /> Audit Cash Contributions ({donations.filter(d => d.status === 'pending').length})
              </h4>
              <div className="space-y-2 mt-2 max-h-60 overflow-y-auto pr-1">
                {donations.filter(d => d.status === 'pending').map((d) => (
                  <div key={d.id} className="bg-slate-900 p-3 rounded border border-slate-800 flex justify-between items-center gap-4">
                    <div>
                      <p className="text-slate-100 font-bold text-xs">{d.donorName}</p>
                      <p className="text-[10px] text-amber-400 font-mono font-bold">{d.amount.toFixed(3)} OMR • Ref: {d.transactionId}</p>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => onApproveDonation(d.id)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] px-2.5 py-1 rounded cursor-pointer transition"
                      >
                        Verify Cash
                      </button>
                      <button 
                        onClick={() => onRejectDonation(d.id)}
                        className="bg-slate-800 hover:bg-red-500 hover:text-slate-950 text-slate-200 font-bold text-[10px] px-2.5 py-1 rounded border border-slate-700 hover:border-red-500 cursor-pointer transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
                {donations.filter(d => d.status === 'pending').length === 0 && (
                  <p className="text-slate-350 text-[11px] text-center py-6">All transaction receipts fully audited.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
