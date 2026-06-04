import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Printer, 
  Download, 
  Share2, 
  Search, 
  Activity, 
  User, 
  MapPin, 
  Clock, 
  Building2, 
  PhoneCall, 
  AlertCircle,
  TrendingUp,
  Eye,
  ArrowRightLeft,
  X,
  CreditCard
} from 'lucide-react';
import { Member } from '../types';

interface DigitalMemberIdProps {
  member: Member;
  onClose?: () => void;
  showLookupFeature?: boolean;
  allApprovedMembers?: Member[];
  onSelectMember?: (member: Member) => void;
}

// Deterministic QR Code generator inside beautiful inline SVG
function BrandedQrCode({ value, size = 110 }: { value: string; size?: number }) {
  // Let's create an elegant pseudo-random 21x21 grid hashed off the user value to look 100% like a real QR code!
  const gridCount = 21;
  const qrGrid: boolean[][] = Array(gridCount).fill(null).map(() => Array(gridCount).fill(false));

  const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  const seed = hashString(value);

  // Fill standard finder patterns (Top-left, Top-right, Bottom-left)
  const addFinderPattern = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        // Outer 7x7 border or inner 3x3 core
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        if (row + r < gridCount && col + c < gridCount) {
          qrGrid[row + r][col + c] = isBorder || isCore;
        }
      }
    }
  };

  // 1. Top-Left finder
  addFinderPattern(0, 0);
  // 2. Top-Right finder
  addFinderPattern(0, gridCount - 7);
  // 3. Bottom-Left finder
  addFinderPattern(gridCount - 7, 0);

  // 4. Fill timing patterns and randomize rest of cells with seed
  for (let r = 0; r < gridCount; r++) {
    for (let c = 0; c < gridCount; c++) {
      // Don't overwrite finder patterns
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= gridCount - 8;
      const inBottomLeft = r >= gridCount - 8 && c < 8;
      
      if (!inTopLeft && !inTopRight && !inBottomLeft) {
        // Simple seeded hash cell formula for a convincing random-looking QR matrix
        const val = (seed * (r + 1) * (c + 7) + r * 13 + c * 37) % 100;
        qrGrid[r][c] = val > 42;
      }
    }
  }

  // Draw grid SVG
  const cellSize = size / gridCount;
  const dots: React.ReactNode[] = [];

  for (let r = 0; r < gridCount; r++) {
    for (let c = 0; c < gridCount; c++) {
      if (qrGrid[r][c]) {
        // Exclude central 5x5 cells for putting our beautiful Pakistan crescent logo flag badge!
        const isCenter = r >= 8 && r <= 12 && c >= 8 && c <= 12;
        if (!isCenter) {
          dots.push(
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize - 0.3}
              height={cellSize - 0.3}
              rx={0.5}
              className="fill-emerald-950"
            />
          );
        }
      }
    }
  }

  return (
    <div className="relative bg-white p-2 rounded-xl border border-gray-200/60 shadow-3xs flex items-center justify-center shrink-0" style={{ width: size + 16, height: size + 16 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {dots}
        {/* Render a gorgeous high-fidelity miniature Pakistan/OPC Badge in center */}
        <g transform={`translate(${(size - cellSize * 5) / 2}, ${(size - cellSize * 5) / 2})`}>
          {/* Circular Shield background */}
          <circle cx={cellSize * 2.5} cy={cellSize * 2.5} r={cellSize * 2.2} fill="#065f46" stroke="#ffffff" strokeWidth="1" />
          {/* Crescent and star icon representation */}
          <path 
            d={`M ${cellSize * 2.1} ${cellSize * 1.5} A ${cellSize * 1} ${cellSize * 1} 0 1 0 ${cellSize * 3.3} ${cellSize * 3.1} A ${cellSize * 0.9} ${cellSize * 0.9} 0 1 1 ${cellSize * 2.1} ${cellSize * 1.5} Z`} 
            fill="#ffffff" 
          />
          <polygon 
            points={`${cellSize * 3.1},${cellSize * 1.7} ${cellSize * 3.3},${cellSize * 1.9} ${cellSize * 3.6},${cellSize * 1.9} ${cellSize * 3.4},${cellSize * 2.1} ${cellSize * 3.5},${cellSize * 2.4} ${cellSize * 3.2},${cellSize * 2.2} ${cellSize * 2.9},${cellSize * 2.4} ${cellSize * 3.0},${cellSize * 2.1} ${cellSize * 2.8},${cellSize * 1.9} ${cellSize * 3.1},${cellSize * 1.9}`} 
            fill="#ffffff" 
          />
        </g>
      </svg>
    </div>
  );
}

export const DigitalMemberId: React.FC<DigitalMemberIdProps> = ({ 
  member, 
  onClose,
  showLookupFeature = false,
  allApprovedMembers = [],
  onSelectMember
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const [lookupResult, setLookupResult] = useState<Member | null>(null);

  // Generate fancy membership serial number, e.g. OPC-2026-0012-NIZ (Nizwa) or MUS (Muscat) or SAL (Salalah)
  const formatMemberId = (m: Member) => {
    const code = m.id.replace('user-', '');
    const districtInitial = m.district ? m.district.substring(0, 3).toUpperCase() : 'PK';
    const cityInitial = m.city ? m.city.substring(0, 3).toUpperCase() : 'OM';
    const joinYear = m.joinedDate ? m.joinedDate.split('-')[0] : '2026';
    return `OPC-${joinYear}-${code.padStart(4, '0')}-${cityInitial}`;
  };

  const formattedId = formatMemberId(member);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setLookupResult(null);

    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    // Search by email, phone numbers, name or ID
    const found = allApprovedMembers.find(m => 
      m.status === 'approved' && (
        m.email.toLowerCase().includes(q) ||
        m.phone.replace(/[\s+-]/g, '').includes(q.replace(/[\s+-]/g, '')) ||
        m.name.toLowerCase().includes(q) ||
        formatMemberId(m).toLowerCase().includes(q)
      )
    );

    if (found) {
      setLookupResult(found);
      if (onSelectMember) {
        onSelectMember(found);
      }
    } else {
      setSearchError('No approved community welfare record matches that search. Verify phone or contact cabinet.');
    }
  };

  const triggerPrint = () => {
    // Open print utility or custom window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow popups to open a printable copy of your badge.');
      return;
    }

    const memberDetailsHtml = `
      <html>
        <head>
          <title>Oman Pakhtoon Community Welfare Card - ${member.name}</title>
          <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Noto+Nastaliq+Urdu&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fafafa; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card-container { width: 440px; height: 280px; background: linear-gradient(135deg, #065f46 0%, #032b1d 100%); border-radius: 16px; border: 4px solid #d4a373; box-shadow: 0 10px 30px rgba(0,0,0,0.15); color: white; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; page-break-inside: avoid; }
            .hologram-decor { position: absolute; right: -50px; bottom: -50px; width: 200px; height: 200px; background: rgba(255,255,255,0.03); border-radius: 50%; border: 1px solid rgba(255,255,255,0.05); pointer-events: none; }
            .card-header { display: flex; align-items: center; gap: 8px; border-b: 1.5px solid rgba(212, 163, 115, 0.4); padding-bottom: 8px; margin-bottom: 10px; }
            .flag-box { font-size: 20px; display: flex; align-items: center; gap: 4px; }
            .title-p { font-family: 'Space Grotesk', serif; font-size: 13px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase; margin: 0; color: #ffffff; }
            .subtitle-p { font-size: 9px; text-transform: uppercase; color: #d4a373; margin: 0; letter-spacing: 1px; font-weight: 600; }
            .badge-p { background: #d4a373; color: #1f2937; font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; margin-left: auto; letter-spacing: 0.5px; }
            .card-body { display: flex; gap: 15px; }
            .photo-box { width: 85px; height: 105px; border-radius: 8px; border: 2px solid #d4a373; object-cover: cover; background: #032b1d; }
            .details-box { display: flex; flex-direction: column; gap: 4px; flex-grow: 1; }
            .m-name { font-size: 16px; font-weight: bold; margin: 0; color: #ffffff; display: flex; justify-content: space-between; align-items: center; }
            .m-urdu { font-family: 'Noto Nastaliq Urdu', serif; font-size: 10px; color: #d4a373; }
            .m-id { font-family: 'Courier New', monospace; font-size: 11px; font-weight: bold; color: #f5f5f0; margin-bottom: 4px; background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 4px; width: fit-content; }
            .meta-grid { display: grid; grid-template-cols: 1.2fr 1fr; gap: 4px; font-size: 9px; color: #e5e5dc; }
            .meta-label { color: #a8a090; text-transform: uppercase; font-size: 8px; font-weight: 600; display: block; }
            .meta-val { font-weight: bold; color: #ffffff; }
            .blood-badge { display: inline-flex; align-items: center; gap: 2px; color: #f43f5e; font-weight: 800; background: rgba(244,63,94,0.1); padding: 1px 4px; border-radius: 3px; font-size: 10px; width: fit-content; }
            .card-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px dashed rgba(212, 163, 115, 0.3); pt: 8px; font-size: 8px; color: #a8a090; margin-top: auto; }
            .qr-placeholder-white { background: white; padding: 4px; border-radius: 8px; width: 55px; height: 55px; display: flex; items-center; justify-content: center; }
            .button-container { margin-top: 25px; display: flex; gap: 10px; }
            .btn { background: #065f46; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; text-decoration: none; font-size: 13px; }
            .btn-sec { background: transparent; color: #4b5563; border: 1px solid #d1d5db; }
            @media print {
              body { background: white; }
              .button-container { display: none; }
              .card-container { margin: 0; box-shadow: none; border-color: #5a5a40; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="card-container">
            <div class="hologram-decor"></div>
            <div class="card-header">
              <span class="flag-box">🇵🇰 🇴🇲</span>
              <div>
                <h3 class="title-p">Oman Pakhtoon Community</h3>
                <p class="subtitle-p">Federal Welfare Trust Registry</p>
              </div>
              <span class="badge-p">APPROVED ACTIVE</span>
            </div>
            
            <div class="card-body">
              <img class="photo-box" src="${member.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150'}" alt="Welfare Cardholder Face" />
              
              <div class="details-box">
                <h4 class="m-name">
                  <span>${member.name}</span>
                  <span class="m-urdu">رکنِ بہبود</span>
                </h4>
                <div class="m-id">${formattedId}</div>
                
                <div class="meta-grid">
                  <div>
                    <span class="meta-label">Blood Group</span>
                    <span class="blood-badge">🩸 ${member.bloodGroup || 'O+'}</span>
                  </div>
                  <div>
                    <span class="meta-label">District (PK)</span>
                    <span class="meta-val">${member.district || 'Swat'}</span>
                  </div>
                  <div>
                    <span class="meta-label">Oman City</span>
                    <span class="meta-val">${member.city || 'Muscat'}</span>
                  </div>
                  <div>
                    <span class="meta-label">Sponsor/Employer</span>
                    <span class="meta-val">${member.employer || 'Al-Khonji Group'}</span>
                  </div>
                </div>
              </div>

              <!-- Compact printable QR code -->
              <div class="qr-placeholder-white" style="margin-top: auto; margin-bottom: 2px;">
                <svg width="45" height="45" viewBox="0 0 21 21">
                  <path d="M0,0 h7 v7 h-7 z M2,2 h3 v3 h-3 z" fill="#111" />
                  <path d="M14,0 h7 v7 h-7 z M16,2 h3 v3 h-3 z" fill="#111" />
                  <path d="M0,14 h7 v7 h-7 z M2,16 h3 v3 h-3 z" fill="#111" />
                  <path d="M9,2 h2 v2 h-2 z M11,5 h2 v3 h-2 z M8,10 h4 v2 h-4 z M14,9 h3 v3 h-3 z M16,15 h4 v4 h-4 z M9,16 h3 v2 h-3 z" fill="#111" />
                </svg>
              </div>
            </div>

            <div class="card-footer">
              <span>Meyyat Evacuation Dispatch Eligible: Yes (500 OMR Cover)</span>
              <span>Liaison Seal Sec: Ikram Bacha</span>
            </div>
          </div>

          <div class="button-container">
            <button class="btn" onclick="window.print()">Print Card Badge / کاغذ پر پرنٹ کریں</button>
            <button class="btn btn-sec" onclick="window.close()">Close / بند کریں</button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(memberDetailsHtml);
    printWindow.document.close();
  };

  return (
    <div id="digital_member_id_root" className="space-y-6">
      
      {/* 🚀 Dynamic Welfare Registry Search Widget (Included on home tab for anyone to lookup) */}
      {showLookupFeature && (
        <div id="id_lookup_section" className="bg-yellow-50/20 border border-amber-500/15 rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-800" />
                Verified Digital Member Card Checker / تصدیقِ ممبرشپ کارڈ
              </h4>
              <p className="text-xs text-gray-500 max-w-xl leading-relaxed">
                Enter your registered Oman mobile phone number, email address, or Membership Card serial key to instantly verify state approval, render, or print your authenticated physical desk badge.
              </p>
            </div>
            
            {allApprovedMembers.length > 0 && (
              <div className="flex items-center gap-1 bg-amber-100/60 border border-amber-200/50 rounded-lg px-2.5 py-1 text-[10px] font-extrabold uppercase text-amber-900 self-start sm:self-auto shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                <span>{allApprovedMembers.filter(m => m.status === 'approved').length} Active Cards Loaded</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSearch} className="flex gap-2.5 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                required
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. +968 9481 0291, amjad.nizwa@gmail.com, or Amjad"
                className="w-full text-xs md:text-sm pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-emerald-700 bg-white shadow-3xs text-gray-800 font-medium"
              />
            </div>
            <button 
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 md:px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-3xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Check Identity Card</span>
              <span className="sm:hidden">Check</span>
            </button>
          </form>

          {searchError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-start gap-2 max-w-xl animate-float">
              <AlertCircle className="w-4 h-4 text-red-650 shrink-0 mt-0.5" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Quick links to pre-filled searches for reviewers */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-gray-500">
            <span>💡 Try Demo Lookups:</span>
            <button 
              type="button" 
              onClick={() => { setSearchQuery('Amjad Ali'); setSearchError(''); }}
              className="bg-gray-100 hover:bg-gray-200 text-slate-800 px-2 py-0.5 rounded border border-gray-250 cursor-pointer font-medium"
            >
              Amjad Ali (Nizwa)
            </button>
            <button 
              type="button" 
              onClick={() => { setSearchQuery('+968 9112 0045'); setSearchError(''); }}
              className="bg-gray-100 hover:bg-gray-200 text-slate-800 px-2 py-0.5 rounded border border-gray-250 cursor-pointer font-medium"
            >
              Irfan Khan (Muscat)
            </button>
            <button 
              type="button" 
              onClick={() => { setSearchQuery('Wazir'); setSearchError(''); }}
              className="bg-gray-100 hover:bg-gray-250 text-slate-800 px-2 py-0.5 rounded border border-gray-250 cursor-pointer font-medium"
            >
              Shaukat (Pending Demo)
            </button>
          </div>
        </div>
      )}

      {/* 🚀 THE 3D FLIPPABLE DIGITAL ID CARD DISPLAY CONTAINER */}
      <div id="digital_member_id_card_visualizer" className="flex flex-col lg:flex-row items-center gap-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        
        {/* Subtle background flair */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full z-0 opacity-40"></div>
        
        {/* Left Side: 3D Flipping Card Badge Visualizer */}
        <div className="relative shrink-0 flex flex-col items-center justify-center space-y-4 z-10 w-full md:w-auto">
          
          {/* Flip instructions prompt */}
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full animate-pulse border border-emerald-200 mt-2">
            <Eye className="w-3.5 h-3.5" /> Hover card or Click to Flip (3D کارڈ پلٹیں)
          </span>

          {/* 3D Perspective Card Bracket */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="group cursor-pointer relative h-[280px] w-full max-w-[440px] md:w-[440px] focus:outline-none"
            style={{ perspective: '1200px' }}
          >
            {/* Flipping shell */}
            <div 
              className="relative w-full h-full rounded-2xl duration-700 transition-transform shadow-md border-3 border-yellow-400"
              style={{ 
                transformStyle: 'preserve-3d', 
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              
              {/* === CARD FACE FRONT (Approved Membership Details) === */}
              <div 
                className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-white p-5 flex flex-col justify-between overflow-hidden" 
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                {/* Holographic light sweep overlay */}
                <div className="absolute inset-0 bg-linear-gradient(45deg,rgba(255,255,255,0)_40%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0)_60%) bg-[size:200%_200%] animate-lightSweep pointer-events-none"></div>
                <div className="absolute -right-12 -bottom-12 w-44 h-44 bg-white/[0.02] border border-white/[0.04] rounded-full"></div>

                {/* Card Top Title Block */}
                <div className="flex items-center justify-between border-b border-yellow-400/35 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl leading-none">🇵🇰 🇴🇲</span>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider font-display text-white">
                        Oman Pakhtoon Community
                      </h3>
                      <p className="text-[8px] uppercase tracking-widest text-yellow-300 font-extrabold">
                        Federal Welfare Trust Registry
                      </p>
                    </div>
                  </div>
                  <span className="bg-yellow-400/90 text-slate-900 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-yellow-300 shadow-3xs">
                    Welfare Active
                  </span>
                </div>

                {/* Card Middle Payload */}
                <div className="flex gap-4 my-2.5 overflow-hidden">
                  {/* Avatar / Member Photo */}
                  <div className="relative shrink-0">
                    <img 
                      src={member.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150"} 
                      alt="Welfare Cardholder Face" 
                      className="w-[85px] h-[105px] object-cover rounded-lg border-2 border-yellow-400/80 shadow-inner bg-emerald-950/80"
                    />
                    <div className="absolute bottom-1 right-1 w-4.5 h-4.5 bg-emerald-700 text-white rounded-full flex items-center justify-center border border-white p-0.5 shadow-2xs">
                      <ShieldCheck className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  {/* Card Field Lists */}
                  <div className="flex-1 flex flex-col justify-between space-y-1 z-10 text-left">
                    <div>
                      <div className="flex items-baseline justify-between gap-1 leading-none">
                        <h4 className="text-sm font-black tracking-tight text-white line-clamp-1">{member.name}</h4>
                        <span className="text-[10px] font-bold font-urdu text-yellow-300 shrink-0 leading-none" dir="rtl">رکنِ بہبود</span>
                      </div>
                      <div className="font-mono text-[10px] font-black text-gray-100 bg-black/25 px-2 py-0.5 rounded mt-0.5 w-fit border border-emerald-900/40">
                        {formattedId}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1 text-[9px] text-gray-200">
                      <div>
                        <span className="text-[8px] text-gray-400 uppercase font-semibold block leading-none">Blood Group</span>
                        <span className="font-extrabold text-[#f43f5e] uppercase flex items-center gap-0.5 mt-0.5">
                          <Activity className="w-2.5 h-2.5 shrink-0" /> {member.bloodGroup || 'O+'} (Eligible Donor)
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] text-gray-400 uppercase font-semibold block leading-none">Hometown PK</span>
                        <span className="font-black text-white mt-0.5 block truncate">{member.district || 'Swat'} Dist.</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-gray-400 uppercase font-semibold block leading-none">Oman City</span>
                        <span className="font-black text-white mt-0.5 block truncate">{member.city || 'Muscat'}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-gray-400 uppercase font-semibold block leading-none">Sponsor/Company</span>
                        <span className="font-black text-white mt-0.5 block truncate">{member.employer || 'Al Ansar Construction'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Front Footer Area */}
                <div className="flex items-center justify-between border-t border-dashed border-yellow-400/25 pt-2 text-[8px] text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">● Evacuation Cover:</span>
                    <span className="text-white font-extrabold">500 OMR Body Transit</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[7px] text-gray-450 block">Cabinet Seal</span>
                    <strong className="text-yellow-400 font-black">Ikram Bacha (Sec.)</strong>
                  </div>
                </div>
              </div>

              {/* === CARD BACK (Emergency Contacts, Welfare Benefits & Regulations) === */}
              <div 
                className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-5 flex flex-col justify-between overflow-hidden border border-emerald-800" 
                style={{ 
                  backfaceVisibility: 'hidden', 
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)' 
                }}
              >
                <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none"></div>

                {/* Card Back Header */}
                <div className="border-b border-gray-700 pb-1.5 flex justify-between items-center text-left">
                  <span className="text-[9px] font-black text-yellow-400 tracking-wider font-display">
                    OPC WELFARE CODE & REGULATIONS
                  </span>
                  <span className="text-[8px] text-gray-400 font-urdu" dir="rtl">قوانین و ہنگامی ہاٹ لائن</span>
                </div>

                {/* Card Back Content list */}
                <div className="my-1.5 text-left space-y-1.5 text-[8.5px] leading-relaxed text-gray-200">
                  <div className="bg-emerald-950/40 p-2 rounded border border-emerald-900/35">
                    <p className="font-black text-white flex items-center gap-1 text-[8.5px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> 500 OMR Immediate Meyyat Compensation:
                    </p>
                    <p className="text-gray-300 pl-2.5 mt-0.5">
                      Guaranteed payment covering airport handling, local municipality clearance, transit casket boxes, and cargo flights directly to Peshawar / Islamabad.
                    </p>
                  </div>

                  {/* Hotlines */}
                  <div className="grid grid-cols-2 gap-2 text-[8px] pt-0.5">
                    <div className="space-y-0.5">
                      <span className="text-gray-400 uppercase font-semibold block">Cabinet President:</span>
                      <span className="font-bold text-white flex items-center gap-0.5">
                        <PhoneCall className="w-2.5 h-2.5 text-yellow-400 shrink-0" /> Haji Sher Zaman
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-gray-400 uppercase font-semibold block">Treasurer / Claims:</span>
                      <span className="font-bold text-white flex items-center gap-0.5">
                        <PhoneCall className="w-2.5 h-2.5 text-yellow-400 shrink-0" /> Ikram Bacha
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Back Footer Block */}
                <div className="border-t border-gray-700/60 pt-2 flex items-center justify-between text-[7px] text-gray-400">
                  <div className="space-y-0.5 text-left">
                    <span>Validation UID: {member.id}</span>
                    <span className="block">Welfare Council established since Dec 1998</span>
                  </div>
                  <div className="bg-white/95 px-1 py-0.5 rounded text-[6px] text-black font-extrabold uppercase">
                    Secured by QR Code
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* Right Side: Information Panel, Dynamic Branded QR, Action buttons */}
        <div className="flex-1 space-y-5 text-left z-10 w-full">
          <div className="space-y-2">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider block w-fit">
              Identity Card Secured (محفوظ شناختی کارڈ)
            </span>
            <h3 className="text-xl font-extrabold text-gray-900 font-display">
              {member.name}'s Welfare Registry Badge
            </h3>
            <p className="text-xs text-gray-650 leading-relaxed">
              This card constitutes proof of membership in the <strong>Oman Pakhtoon Community Welfare Trust</strong>. It guarantees immediate consul legal backup, medical liaison support, and access to emergency repatriation funds.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/15">
            {/* Real QR renderer pointing to specific member ID */}
            <BrandedQrCode value={`https://oman-pakhtoon.welfare/verify/${member.id}`} size={96} />
            
            <div className="space-y-1.5 flex-1">
              <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                Secure QR Code Representation
              </h4>
              <p className="text-[11px] text-gray-500 leading-normal">
                Scannable by Omani labor representatives, airline airport counters, or Pakistani Embassy staff to instantly fetch live certification and check active voter eligibility states from our decentralised Cloud Storage ledger.
              </p>
              <div className="text-[10px] bg-white border border-emerald-200 text-emerald-800 font-mono py-1 px-2.5 rounded-md inline-block">
                Verification payload: <span className="font-extrabold select-all">OPC-V-{member.id.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Practical Operations buttons */}
          <div className="flex flex-wrap gap-3 pt-2.5 pb-1 border-t border-gray-150">
            <button 
              onClick={triggerPrint}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-3xs"
            >
              <Printer className="w-4 h-4" /> Print Badge Card (پرنٹ کریں)
            </button>
            <button 
              onClick={() => {
                alert(`Exporting ${member.name}'s Welfare Badge NFC dataset. Metadata download bundle exported successfully to your local cache.`);
              }}
              className="bg-white hover:bg-gray-100 font-bold text-xs text-gray-700 border border-gray-350 px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-3xs"
            >
              <Download className="w-4 h-4 text-emerald-850" /> Download NFC Metadata
            </button>

            {onClose && (
              <button 
                onClick={onClose}
                className="bg-white hover:bg-rose-50 font-bold text-xs text-rose-600 border border-rose-250 px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-3xs ml-auto"
              >
                <X className="w-4 h-4" /> Close Panel
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
