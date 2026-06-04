import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  PhoneCall, 
  ExternalLink, 
  Coins, 
  Sparkles,
  Info,
  BadgeAlert,
  Clock
} from 'lucide-react';
import { Advertisement } from '../types';

interface AdBillboardProps {
  ads: Advertisement[];
  language?: 'en' | 'ur' | 'ps';
}

export const AdBillboard: React.FC<AdBillboardProps> = ({ ads, language = 'en' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Filter only active ads that are NOT-EXPIRED relative to present time
  const todayStr = new Date().toISOString().split('T')[0];
  const activeAndUnexpiredAds = ads.filter(ad => {
    return ad.isActive && ad.expiryDate >= todayStr;
  });

  useEffect(() => {
    if (activeAndUnexpiredAds.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAndUnexpiredAds.length);
    }, 6000); // cycle every 6 seconds

    return () => clearInterval(interval);
  }, [activeAndUnexpiredAds.length, isPaused]);

  if (activeAndUnexpiredAds.length === 0) {
    return (
      <div id="no_ads_billboard" className="bg-gradient-to-r from-gray-50 to-gray-100 border border-dashed border-gray-300 rounded-2xl p-6 text-center space-y-3">
        <div className="w-12 h-12 bg-gray-200/60 rounded-full flex items-center justify-center mx-auto">
          <Megaphone className="w-6 h-6 text-gray-550" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-gray-800">
            {language === 'en' ? 'Sponsorship Spot Available' : language === 'ur' ? 'اشتہاراتی اسپیس دستیاب ہے' : 'د اعلاناتو ځای شتون لري'}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {language === 'en' 
              ? 'Promote your cargo business, restaurant, or services reaching 5,000+ active Pakhtoon members in Muscat, Nizwa, Barka & Salalah. Contact the Finance Desk (Ikram Bacha).' 
              : 'مسقط، نزویٰ، برکاء اور صلالہ کے پختون بھائیوں تک اپنے کارگو، ریستوراں یا خدمات کی تشہیر کریں۔ رابطہ فنانس سیکرٹری اکرام باچا۔'}
          </p>
        </div>
        <a 
          href="https://wa.me/96899111870" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Sponsor and Book Slot (10 OMR/mo)</span>
        </a>
      </div>
    );
  }

  const currentAd = activeAndUnexpiredAds[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeAndUnexpiredAds.length) % activeAndUnexpiredAds.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeAndUnexpiredAds.length);
  };

  const getDaysRemaining = (expiryDateStr: string) => {
    const exp = new Date(expiryDateStr);
    const today = new Date(todayStr);
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining(currentAd.expiryDate);

  const getUrduText = (adId: string) => {
    // Elegant hardcoded translations for sample ads
    if (adId === 'ad-1') return 'خیبر پختونخوا کارگو سروس: عمان سے پاکستان گھر گھر محفوظ ڈیلیوری';
    if (adId === 'ad-2') return 'خیبر شنواری باربی کیو: روایتی دنبہ کڑاہی اور پختون مہمان نوازی';
    if (adId === 'ad-3') return 'المقتدر ہیوی اسکیپ ہولڈنگ: سستی کرین اور عمارتی سامان کی بکنگ';
    return '';
  };

  return (
    <div 
      id="advertisement_billboard_carousel" 
      className="bg-white rounded-2xl border border-gray-250 shadow-xs overflow-hidden relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Billboard Heading Overlay */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-emerald-800/95 text-white px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider backdrop-blur-xs border border-emerald-600/50 shadow-sm shadow-black/10">
        <Megaphone className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
        <span>OPC Paid Sponsor Board (اشتہار)</span>
      </div>

      {/* Expiry Badge to inspire authenticity of local dates */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-black/60 text-gray-100 px-2.5 py-1 rounded-md text-[9px] font-bold backdrop-blur-xs">
        <Clock className="w-3 h-3 text-yellow-400" />
        <span>
          {daysRemaining <= 0 ? 'Expires today' : `${daysRemaining} days remaining`}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row h-full min-h-[190px]">
        {/* Ad Image Pane */}
        <div className="lg:w-2/5 relative h-40 lg:h-auto min-h-[140px] bg-slate-900 shrink-0 overflow-hidden">
          <img 
            src={currentAd.imageUrl} 
            alt={currentAd.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/80 lg:from-transparent via-black/20 to-black/5 pb-2"></div>
        </div>

        {/* Ad Content Details Pane */}
        <div className="flex-1 p-5 md:p-6 flex flex-col justify-between text-left space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase bg-yellow-400 text-slate-900 px-2 py-0.5 rounded-sm">
                Verified Sponsor
              </span>
              <span className="text-[10px] text-gray-500 font-medium">
                By {currentAd.advertiserName}
              </span>
            </div>

            <h3 className="text-base font-black text-gray-900 font-display tracking-tight leading-normal">
              {currentAd.title}
            </h3>

            {/* Urdu Subtitle Translation */}
            {(getUrduText(currentAd.id) || language === 'ur') && (
              <p className="text-xs font-bold text-emerald-800 font-urdu leading-normal mt-1" dir="rtl">
                {getUrduText(currentAd.id) || 'اس اسپانسرڈ اشتہار کا وزٹ کریں اور پختون نیٹ ورک میں حصہ لیں'}
              </p>
            )}

            {currentAd.notes && (
              <p className="text-xs text-gray-500 line-clamp-2 italic pt-1 font-sans">
                &ldquo;{currentAd.notes}&rdquo;
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-150">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <Calendar className="w-3.5 h-3.5 text-slate-450" />
              <span>Sponsorship Expires: <strong>{currentAd.expiryDate}</strong></span>
            </div>

            <a 
              href={currentAd.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-3xs"
            >
              <span>Visit/Contact Sponsor</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Nav Controls for multiple ads */}
      {activeAndUnexpiredAds.length > 1 && (
        <div className="absolute right-4 bottom-14 lg:bottom-4 flex items-center gap-1.5 z-10">
          <button 
            onClick={handlePrev}
            className="w-7 h-7 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center border border-gray-250 hover:border-emerald-600 transition shadow-3xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-black text-gray-600 px-2 min-w-[32px] text-center bg-gray-100 rounded-md py-0.5 border">
            {currentIndex + 1} / {activeAndUnexpiredAds.length}
          </span>
          <button 
            onClick={handleNext}
            className="w-7 h-7 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center border border-gray-250 hover:border-emerald-600 transition shadow-3xs cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
