import React, { useState, useRef } from 'react';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  DollarSign, 
  Calendar, 
  Link2, 
  Upload, 
  Check, 
  AlertCircle, 
  TrendingUp, 
  Image, 
  Eye, 
  ToggleLeft, 
  ToggleRight,
  Sparkles,
  Search,
  FileText,
  Info
} from 'lucide-react';
import { Advertisement } from '../types';

interface AdManagerProps {
  ads: Advertisement[];
  onAddAd: (newAd: Advertisement) => void;
  onRemoveAd: (id: string) => void;
  onToggleAd: (id: string) => void;
  adminOnlyAds: boolean;
  onToggleAdminOnlyAds: () => void;
}

const PRESET_IMAGES = [
  {
    name: 'Cargo / Logistics',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600&h=300',
    description: 'Cargo truck, warehouse container dispatch style'
  },
  {
    name: 'Traditional BBQ / Dining',
    url: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&q=80&w=600&h=300',
    description: 'Traditional kebabs, grill, pashtoon restaurant style'
  },
  {
    name: 'Heavy Industrial Machinery',
    url: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&q=80&w=600&h=300',
    description: 'Excavator, crane construction machinery style'
  },
  {
    name: 'Aviation / Consular Services',
    url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=600&h=300',
    description: 'Aeroplane passenger cabin, air tickets discounts style'
  }
];

export const AdManager: React.FC<AdManagerProps> = ({ 
  ads, 
  onAddAd, 
  onRemoveAd, 
  onToggleAd,
  adminOnlyAds,
  onToggleAdminOnlyAds
}) => {
  // Input fields state
  const [title, setTitle] = useState('');
  const [advertiserName, setAdvertiserName] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [notes, setNotes] = useState('');
  
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [imageType, setImageType] = useState<'preset' | 'upload'>('preset');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats calculation
  const totalSponsorsRevenue = ads.reduce((acc, ad) => acc + (ad.amountPaid || 0), 0);
  const activeAdsCount = ads.filter(ad => ad.isActive).length;
  const todayStr = new Date().toISOString().split('T')[0];

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Image file is too heavy. Please select an image smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setCustomImageBase64(base64String);
      setImageUrl(base64String);
      setFeedbackMsg('Custom image banner read successfully! Custom uploaded image is now active.');
      // Auto-clear message
      setTimeout(() => setFeedbackMsg(''), 4000);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setFeedbackMsg('');

    if (!title.trim() || !advertiserName.trim() || !targetUrl.trim() || !expiryDate) {
      setErrorMsg('Please specify all required fields: Title, Advertiser, Contact URL and Expiry Date prior to pushing.');
      return;
    }

    if (expiryDate < startDate) {
      setErrorMsg('The expiry date cannot fall earlier than the sponsorship start date.');
      return;
    }

    const currentImg = imageType === 'upload' && customImageBase64 ? customImageBase64 : imageUrl;

    const newAd: Advertisement = {
      id: `ad-${Date.now()}`,
      title: title.trim(),
      advertiserName: advertiserName.trim(),
      imageUrl: currentImg,
      targetUrl: targetUrl.trim(),
      amountPaid: Number(amountPaid) || 0,
      startDate,
      expiryDate,
      isActive: true,
      notes: notes.trim() || undefined
    };

    onAddAd(newAd);
    
    // Clear state
    setTitle('');
    setAdvertiserName('');
    setTargetUrl('');
    setAmountPaid('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setExpiryDate('');
    setNotes('');
    setCustomImageBase64(null);
    setImageType('preset');
    setImageUrl(PRESET_IMAGES[0].url);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setFeedbackMsg('Premium Sponsorship Advertisement launched successfully onto the live public billboard carousel!');
    setTimeout(() => setFeedbackMsg(''), 5000);
  };

  const getDaysRemaining = (expStr: string) => {
    const exp = new Date(expStr);
    const today = new Date(todayStr);
    const diffTime = exp.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div id="ad_manager_dashboard_block" className="space-y-8 bg-white rounded-2xl border border-gray-250 p-6 shadow-xs">
      
      {/* Block Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-150 pb-4">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse shrink-0"></span>
            <h3 className="text-base font-extrabold text-gray-900 font-display uppercase tracking-widest flex items-center gap-2">
              📢 Paid Ads & Billboard Manager
            </h3>
          </div>
          <p className="text-xs text-gray-500">
            Create, verify, prune, or modify sponsored banners. Displayed above the central registry dashboard.
          </p>
        </div>

        {/* Micro Stats panel */}
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-150 px-4 py-2.5 rounded-xl">
          <DollarSign className="w-5 h-5 text-emerald-800 shrink-0" />
          <div className="text-left space-y-0.5">
            <span className="text-[9px] uppercase font-bold text-emerald-950 block leading-none">Billboard Treasury Balance</span>
            <strong className="text-emerald-800 text-sm font-black block leading-none">{totalSponsorsRevenue} OMR Collected</strong>
          </div>
        </div>
      </div>

      {/* ⚙️ SYSTEM SETTING: "Only Admin Allowed To Run Ads" */}
      <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-800 bg-amber-100 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
              Security Override
            </span>
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-tight">
              Sponsorship Campaign Visibility Settings
            </h4>
          </div>
          <p className="text-[11px] text-gray-650 leading-relaxed max-w-2xl font-sans">
            By default, when active campaigns expire, a public invitation box for Pakhtoon expats is displayed. Enabling the restriction hides the placeholder and ensures <strong>strictly official admin-published campaigns only</strong> are permitted to run.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={onToggleAdminOnlyAds}
            className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-black transition-all w-full justify-center md:w-auto md:justify-start ${
              adminOnlyAds 
                ? 'bg-amber-600 border-amber-500 text-white shadow-3xs' 
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {adminOnlyAds ? (
              <>
                <ToggleRight className="w-5 h-5 shrink-0" />
                <span>Only Admin Can Run Ads (صرف ایڈمن)</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5 shrink-0 text-gray-400" />
                <span>Open for Public Offers (عوام کے لیے کھلا ہے)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: 2 parts. Left is Add Form, Right is List & Audit Trails */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* PART 1: The Interactive Add Form (xl:col-span-5) */}
        <div className="xl:col-span-5 bg-gray-50/50 rounded-xl p-5 border border-gray-200/80 space-y-5">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-black uppercase text-emerald-800 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Launch New Placement Slot
            </span>
            <h4 className="text-sm font-extrabold text-gray-950 font-display">
              Sponsorship Ledger Entrance Form
            </h4>
          </div>

          {feedbackMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs font-semibold rounded-xl flex items-start gap-2 animate-float text-left">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-rose-650 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-750 uppercase tracking-wide block">
                Billboard Placement Title <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Al-Faisal Packing & Airport Cargo"
                className="w-full text-xs md:text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white"
              />
            </div>

            {/* Advertiser Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-750 uppercase tracking-wide block">
                Corporate Advertiser / Business Owner <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text"
                required
                value={advertiserName}
                onChange={e => setAdvertiserName(e.target.value)}
                placeholder="e.g. Faisal Yousafzai Holding LLC"
                className="w-full text-xs md:text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white"
              />
            </div>

            {/* Target URL / Hotline */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-750 uppercase tracking-wide block">
                Target Action Link (Website, Tel or WhatsApp link) <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text"
                required
                value={targetUrl}
                onChange={e => setTargetUrl(e.target.value)}
                placeholder="e.g. https://wa.me/96899120040 or tel:+96899111870"
                className="w-full text-xs md:text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white font-mono"
              />
            </div>

            {/* Fee Paid (OMR) & Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-750 uppercase tracking-wide block">
                  Treasury Budget (OMR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-extrabold text-gray-400">OMR</span>
                  <input 
                    type="number"
                    min="0"
                    placeholder="15"
                    value={amountPaid}
                    onChange={e => setAmountPaid(e.target.value)}
                    className="w-full text-xs md:text-sm pl-11 pr-3 py-2 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-750 uppercase tracking-wide block">
                  Starts Active Date
                </label>
                <input 
                  type="date"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full text-xs md:text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white font-medium"
                />
              </div>
            </div>

            {/* Expiry Date */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-750 uppercase tracking-wide block">
                Sponsorship Expiration Date <span className="text-rose-500">*</span>
              </label>
              <input 
                type="date"
                required
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                className="w-full text-xs md:text-sm px-3.5 py-2.5 rounded-xl border border-amber-400 focus:outline-emerald-600 bg-white font-black text-emerald-950"
              />
            </div>

            {/* BANNER SELECTION WITH FLUX TABS */}
            <div className="space-y-1.5 pt-1.5 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-gray-850 uppercase tracking-wide block">
                  Advertisement Banner Image
                </label>
                
                {/* Image source selectors */}
                <span className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5 text-xs font-bold shadow-3xs">
                  <button
                    type="button"
                    onClick={() => { setImageType('preset'); setImageUrl(PRESET_IMAGES[0].url); }}
                    className={`px-2 py-0.5 rounded-sm transition ${imageType === 'preset' ? 'bg-emerald-700 text-white' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => { setImageType('upload'); if (customImageBase64) setImageUrl(customImageBase64); }}
                    className={`px-2 py-0.5 rounded-sm transition ${imageType === 'upload' ? 'bg-emerald-700 text-white' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    Upload File
                  </button>
                </span>
              </div>

              {imageType === 'preset' ? (
                <div className="space-y-2">
                  <p className="text-[10px] text-gray-500 font-sans">
                    Select a curated ready-made professional background preset tailored to our expat business vectors:
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className={`text-left p-1.5 rounded-lg border text-[10px] transition group hover:border-emerald-600 focus:outline-none bg-white flex flex-col justify-between h-18 overflow-hidden relative ${imageUrl === preset.url ? 'border-emerald-700 ring-2 ring-emerald-600/20' : 'border-gray-200'}`}
                      >
                        <span className="font-extrabold text-gray-900 block truncate group-hover:text-emerald-800">{preset.name}</span>
                        <img src={preset.url} alt={preset.name} className="w-full h-8 object-cover rounded opacity-90 mt-1" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[10px] text-gray-500 font-sans">
                    Perfect for uploading physical JPG/PNG photo crop sheets produced by the sponsor design desks. Support drag files. Only client-side rendering.
                  </p>

                  <div className="flex items-center gap-3.5 bg-white p-3 rounded-xl border border-dashed border-gray-300">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-14 h-14 bg-gray-100 hover:bg-emerald-50 text-gray-500 rounded-xl flex flex-col items-center justify-center border border-gray-250 cursor-pointer transition shrink-0 group"
                    >
                      <Upload className="w-5 h-5 text-gray-400 group-hover:text-emerald-700" />
                      <span className="text-[8px] font-bold uppercase mt-1">Select file</span>
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <input 
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleCustomImageUpload}
                        className="hidden"
                      />
                      {customImageBase64 ? (
                        <div className="space-y-1">
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded uppercase block w-fit">
                            Ready to Deploy
                          </span>
                          <span className="text-[9px] text-gray-500 font-mono block truncate">
                            {fileInputRef.current?.files?.[0]?.name || 'custom_uploaded_image_hex'}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black text-gray-700 block">No Custom File Engaged</span>
                          <p className="text-[9px] text-gray-400 leading-none">Click square to choose local image file.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Banner Live Box Mini Preview */}
              <div className="p-2.5 bg-white rounded-xl border border-gray-200 text-center space-y-1.5">
                <span className="text-[9px] font-black uppercase text-gray-400 block tracking-wider text-left">
                  Banner preview (16:9 slot)
                </span>
                <div className="h-24 bg-gray-100 rounded-lg overflow-hidden relative border flex items-center justify-center">
                  <img 
                    src={imageUrl} 
                    alt="Current billboard layout banner" 
                    className="w-full h-full object-cover"
                    onError={() => {
                      setImageUrl(PRESET_IMAGES[2].url);
                    }}
                  />
                  <div className="absolute bottom-1 left-2 bg-black/60 text-[8px] font-bold text-white px-1.5 py-0.5 rounded">
                    Sponsor Image
                  </div>
                </div>
              </div>
            </div>

            {/* Internal notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-750 uppercase tracking-wide block">
                Office Note & rate Card Info (Internal Only)
              </label>
              <textarea 
                rows={1}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Paid in cash to Treasurer at Sultana Office..."
                className="w-full text-xs md:text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs py-3 rounded-xl uppercase transition tracking-wider flex items-center justify-center gap-1.5 mt-2 cursor-pointer shadow-3xs"
            >
              <Megaphone className="w-4 h-4 text-yellow-300" />
              <span>Broadcast Sponsorship Ad</span>
            </button>
          </form>
        </div>


        {/* PART 2: The Audit Trail and Sponsorship List Table (xl:col-span-7) */}
        <div className="xl:col-span-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="space-y-0.5 text-left">
              <h4 className="text-sm font-extrabold text-gray-900 font-display">
                Active Listings Ledger & Expiry Tracker
              </h4>
              <p className="text-[11px] text-gray-500">
                Authorized listings automatically hide on the public billboard carousel once current local date exceeds the scheduled expiry timestamp.
              </p>
            </div>

            <div className="bg-yellow-100/60 border border-yellow-200 px-3 py-1 rounded-lg text-[10px] font-black uppercase text-yellow-900 shrink-0 text-center">
              Active Display: {activeAdsCount} / {ads.length} Slots
            </div>
          </div>

          {/* Audit list cards */}
          <div className="space-y-3.5">
            {ads.map((ad) => {
              const daysLeft = getDaysRemaining(ad.expiryDate);
              const isExpired = daysLeft < 0;
              const isExpiringSoon = !isExpired && daysLeft <= 15;

              return (
                <div 
                  key={ad.id} 
                  className={`border rounded-xl p-4.5 bg-white shadow-3xs transition-all duration-350 hover:shadow-xs flex flex-col md:flex-row items-stretch justify-between gap-4.5 ${!ad.isActive ? 'border-dashed border-gray-200 opacity-60' : isExpired ? 'border-rose-300 bg-rose-50/10' : isExpiringSoon ? 'border-amber-300 bg-amber-50/5' : 'border-gray-200'}`}
                >
                  
                  {/* Left Column: Image preview and metadata details */}
                  <div className="flex gap-3.5 text-left min-w-0">
                    <div className="w-[100px] h-18 rounded-lg overflow-hidden bg-slate-900 border shrink-0 relative">
                      <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                      <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-white/95 rounded-full flex items-center justify-center shadow-3xs">
                        <Info className="w-2.5 h-2.5 text-gray-800" title={ad.notes} />
                      </div>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Expiry Badge colors */}
                        {isExpired ? (
                          <span className="bg-rose-100 text-rose-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                            Expired
                          </span>
                        ) : isExpiringSoon ? (
                          <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase animate-pulse">
                            Expiring Soon (🚨)
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                            Active Card
                          </span>
                        )}

                        <span className="text-[10px] text-gray-400 font-mono truncate">
                          ID: {ad.id}
                        </span>
                      </div>

                      <h4 className="text-xs font-black text-gray-900 leading-tight block truncate">
                        {ad.title}
                      </h4>

                      <p className="text-[10px] text-slate-500 font-bold">
                        Sponsor: {ad.advertiserName} &bull; <span className="text-emerald-800 font-extrabold">{ad.amountPaid} OMR Fee</span>
                      </p>

                      <div className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Calendar className="w-3 h-3 text-slate-350" />
                        <span>Timeline: <strong>{ad.startDate}</strong> ➔ <strong>{ad.expiryDate}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Time Remaining & Administrative operations */}
                  <div className="flex md:flex-col justify-between items-center md:items-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-dashed border-gray-150">
                    <div className="text-left md:text-right space-y-0.5">
                      <span className="text-[9px] uppercase font-bold text-gray-450 block leading-none">Days Left</span>
                      <strong className={`text-xs block font-black leading-none ${isExpired ? 'text-rose-600' : isExpiringSoon ? 'text-amber-600 font-black' : 'text-emerald-700'}`}>
                        {isExpired ? 'Expired' : `${daysLeft} Working Days`}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      
                      {/* Active Status Toggle Indicator */}
                      <button 
                        onClick={() => onToggleAd(ad.id)}
                        className={`font-semibold text-[10px] px-2.5 py-1.5 rounded-lg border transition-all duration-300 flex items-center gap-1 cursor-pointer shadow-3xs hover:border-gray-400 bg-white ${ad.isActive ? 'text-emerald-700 border-emerald-250 hover:bg-emerald-500/5' : 'text-gray-450 hover:bg-gray-100'}`}
                        title={ad.isActive ? 'Click to temporarily halt showcase' : 'Click to authorize live rendering'}
                      >
                        {ad.isActive ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Live (آن ہے)</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 text-gray-400 shrink-0" />
                            <span>Muted (آف ہے)</span>
                          </>
                        )}
                      </button>

                      {/* Hard Delete button */}
                      <button 
                        onClick={() => {
                          if (confirm(`Are you absolutely sure you want to permanently delete the sponsorship registration and billboard ad for "${ad.title}"?`)) {
                            onRemoveAd(ad.id);
                          }
                        }}
                        className="bg-white hover:bg-rose-50 border border-gray-250 hover:border-rose-400 text-gray-650 hover:text-rose-600 p-2 rounded-lg transition shrink-0 cursor-pointer shadow-3xs"
                        title="Delete Sponsor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>
                  </div>

                </div>
              );
            })}

            {ads.length === 0 && (
              <div className="bg-gray-50 border border-dashed text-slate-400 rounded-xl p-8 text-center text-xs space-y-1">
                <p className="font-bold">No registered sponsorship advertisements in archive ledger.</p>
                <p className="text-[11px] text-gray-400">Specify details in the entrance form and press Launch to bootstrap.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
