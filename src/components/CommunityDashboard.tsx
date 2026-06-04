import React, { useMemo, useState, useRef, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { 
  BarChart3, 
  PieChart as LucidePieChart, 
  TrendingUp, 
  Users, 
  Gift, 
  MapPin, 
  Building,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileJson
} from 'lucide-react';
import { Member, Donation } from '../types';

interface CommunityDashboardProps {
  members: Member[];
  donations: Donation[];
  language?: 'en' | 'ur' | 'ps';
  isAdmin?: boolean;
}

const COLORS = [
  '#047857', // Emerald 700 - Deep, formal
  '#0d9488', // Teal 600 - Rich dark cyan
  '#0284c7', // Sky 600 - Clean high-contrast blue
  '#b45309', // Amber 700 - Gold/orange highlight
  '#4338ca', // Indigo 700 - Solid deep blue
  '#6d28d9', // Violet 700 - Energetic purple
  '#be185d'  // Pink 750 - Standout magenta
];

export const CommunityDashboard: React.FC<CommunityDashboardProps> = ({ 
  members, 
  donations, 
  language = 'en',
  isAdmin = false
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if user clicks outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Quick helper to convert data rows to CSV
  const convertToCSV = (data: Array<Record<string, any>>): string => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => {
        const val = row[header];
        const valStr = val === null || val === undefined ? '' : String(val);
        const escaped = valStr.replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  };

  // Helper initiating native download dialog in browser
  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Dynamic city distribution from live members data
  const cityData = useMemo(() => {
    const rawCounts: { [key: string]: number } = {};
    members.forEach(member => {
      // Clean up capitalization to prevent duplication (e.g. muscat vs Muscat)
      const rawCity = member.city ? member.city.trim() : 'Muscat';
      const city = rawCity.charAt(0).toUpperCase() + rawCity.slice(1).toLowerCase();
      // Only count approved members if we want active card holders, or all. Let's count approved & pending for absolute representation!
      rawCounts[city] = (rawCounts[city] || 0) + 1;
    });

    return Object.entries(rawCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [members]);

  // Dynamic monthly donation trends
  const monthlyDonationData = useMemo(() => {
    // We seed with 6 recent months of 2026 to ensure the bar chart looks clean, rich, and continuous
    const seedMonths = [
      { name: 'Jan 2026', order: 1, amount: 0 },
      { name: 'Feb 2026', order: 2, amount: 0 },
      { name: 'Mar 2026', order: 3, amount: 0 },
      { name: 'Apr 2026', order: 4, amount: 0 },
      { name: 'May 2026', order: 5, amount: 0 },
      { name: 'Jun 2026', order: 6, amount: 0 },
      { name: 'Jul 2026', order: 7, amount: 0 }
    ];

    const monthMap = new Map<string, number>();
    
    // Aggregate live donations
    donations.forEach(donation => {
      if (!donation.date) return;
      const parts = donation.date.split('-');
      if (parts.length < 2) return;
      const year = parts[0];
      const monthStr = parts[1];
      const monthVal = parseInt(monthStr, 10);
      
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      if (monthVal >= 1 && monthVal <= 12) {
        const key = `${monthNames[monthVal - 1]} ${year}`;
        monthMap.set(key, (monthMap.get(key) || 0) + donation.amount);
      }
    });

    // Merge actual donation aggregates with our visual seed months
    return seedMonths.map(seed => {
      const realAmount = monthMap.get(seed.name) || 0;
      // Subtract realAmount from monthMap so we don't double count, or just map them
      return {
        name: seed.name,
        amount: realAmount
      };
    });
  }, [donations]);

  // Multilingual labels helper
  const label = (en: string, ur: string, ps: string) => {
    if (language === 'ur') return ur;
    if (language === 'ps') return ps;
    return en;
  };

  const customTooltipStyle = {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    fontSize: '12px',
    padding: '10px 14px'
  };

  return (
    <div id="community_insights_dashboard" className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs space-y-6">
      
      {/* Dashboard Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-150">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-extrabold text-gray-900 font-display">
              {label('Community Growth & Financial Insights', 'برادری کی ترقی اور مالیاتی بصیرت', 'د ټولنې پرمختګ او مالي لیدونه')}
            </h3>
          </div>
          <p className="text-xs text-gray-500">
            {label('Real-time statistics of Pakistani expats registered across Oman and monthly welfare contribution levels.', 
              'عمان میں مقیم پاکستانی تارکین وطن کی حقیقی تعداد کا نقشہ اور ماہانہ فنڈ کی لائیو تفصیلات۔', 
              'په عمان کې د پاکستاني کډوالو ریښتیني شمیر او د میاشتني مرستندویه بسپنو ژوندی معلومات.')}
          </p>
        </div>

        {/* Action Controls Side */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0 relative" ref={dropdownRef}>
          {isAdmin && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="cursor-pointer inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black px-4 py-2 rounded-lg shadow-2xs transition-all border border-emerald-600 hover:border-emerald-750"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{label('Export Data', 'ڈیٹا ایکسپورٹ کریں', 'د معلوماتو صادول')}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-fade-in text-left">
                  <div className="px-3 py-1.5 border-b border-gray-150 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    {label('City Demographics Data', 'شہروں کی آبادی پس منظر', 'د سیمې لید لوست')}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const data = cityData.map(item => ({
                        'City': item.name,
                        'Member Count': item.value
                      }));
                      downloadFile(convertToCSV(data), 'pakhtoon_council_city_demographics.csv', 'text/csv;charset=utf-8;');
                      setShowExportMenu(false);
                    }}
                    className="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>{label('Export City Data as CSV', 'شہر کا ڈیٹا CSV میں ڈاؤن لوڈ کریں', 'د سیمې ډاټا CSV کې')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      downloadFile(JSON.stringify(cityData, null, 2), 'pakhtoon_council_city_demographics.json', 'application/json;charset=utf-8;');
                      setShowExportMenu(false);
                    }}
                    className="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-2"
                  >
                    <FileJson className="w-4 h-4 text-emerald-600" />
                    <span>{label('Export City Data as JSON', 'شہر کا ڈیٹا JSON میں ڈاؤن لوڈ کریں', 'د سیمې ډاټا JSON کې')}</span>
                  </button>

                  <div className="px-3 py-1.5 border-t border-b border-gray-150 text-[10px] font-black text-gray-400 uppercase tracking-wider mt-1.5">
                    {label('Financial Ledger Trends', 'مالیاتی فنڈز ریکارڈ', 'د مالي او بسپنې تګلارې')}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const data = monthlyDonationData.map(item => ({
                        'Month': item.name,
                        'Donation (OMR)': item.amount
                      }));
                      downloadFile(convertToCSV(data), 'pakhtoon_council_donation_trends.csv', 'text/csv;charset=utf-8;');
                      setShowExportMenu(false);
                    }}
                    className="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                    <span>{label('Export Contributions as CSV', 'فنڈز کی تاریخ CSV کے ذریعے', 'د بسپنو ډاټا CSV کې')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      downloadFile(JSON.stringify(monthlyDonationData, null, 2), 'pakhtoon_council_donation_trends.json', 'application/json;charset=utf-8;');
                      setShowExportMenu(false);
                    }}
                    className="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-2"
                  >
                    <FileJson className="w-4 h-4 text-blue-600" />
                    <span>{label('Export Contributions as JSON', 'فنڈز کی تاریخ JSON کے ذریعے', 'د بسپنو ډاټا JSON کې')}</span>
                  </button>

                  <div className="border-t border-gray-150 mt-1.5 pt-1.5 px-1">
                    <button
                      type="button"
                      onClick={() => {
                        const combined = {
                          exportedAt: new Date().toISOString(),
                          citydemographics: cityData,
                          monthlyContributionLedger: monthlyDonationData,
                          totalRegisteredMembersCount: members.length,
                          totalWelfareContributionsOMR: donations.reduce((sum, d) => sum + d.amount, 0)
                        };
                        downloadFile(JSON.stringify(combined, null, 2), 'pakhtoon_council_combined_dashboard_report.json', 'application/json;charset=utf-8;');
                        setShowExportMenu(false);
                      }}
                      className="cursor-pointer w-full text-left px-3 py-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-xs font-black text-emerald-800 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4 text-emerald-700" />
                      <span>{label('Full Report Package (JSON)', 'مکمل رپورٹ پیکیج ڈاؤن لوڈ کریں', 'ټول مالي راپور بسته JSON')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-xs font-bold text-gray-500 bg-slate-100 border px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{label('Audited Daily Update', 'روزانہ آڈٹ شدہ اپ ڈیٹ', 'ورځنی ترتیب شوی ثبوت')}</span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Left Card: Members distribution by city (Pie Chart) */}
        <div className="border border-gray-150 rounded-xl p-5 md:p-6 bg-gray-50/30 flex flex-col justify-between text-left space-y-4">
          <div className="space-y-1.5">
            <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <LucidePieChart className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{label('District / City Allocation', 'شہروں کے لحاظ سے برادری کی تقسیم', 'د شارونو په کچه د غړو ویش')}</span>
            </h4>
            <p className="text-xs text-gray-400">
              {label('Visual chart showing the proportion of Pashtoon expats in Muscat, Salalah, Nizwa, Barka and Sohar.',
                'مسقط، صلالہ، نزویٰ، برکاء اور سہرار میں موجود پختون بھائیوں کی تقسیم کا فضائی چارٹ۔',
                'په مسقط، صلاله، نزوی، برکا او صحار کې د پښتون وروڼو د ویش هوایي چارټ.')}
            </p>
          </div>

          <div className="h-64 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {cityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={customTooltipStyle}
                  formatter={(value: any) => [`${value} ${language === 'en' ? 'Members' : 'ممبران'}`, '']}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value, entry: any) => (
                    <span className="text-[11px] font-bold text-gray-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-gray-150/80 pt-4 text-xs font-semibold">
            {cityData.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex flex-col p-2 bg-white rounded-lg border border-gray-200">
                <span className="text-[10px] text-gray-400 truncate">{item.name}</span>
                <span className="text-sm font-black text-emerald-800 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  {item.value}
                </span>
              </div>
            ))}
            {cityData.length === 0 && (
              <div className="col-span-full py-4 text-center text-xs text-gray-400 font-sans italic">
                No city records found to allocate
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Donation trends (Bar Chart) */}
        <div className="border border-gray-150 rounded-xl p-5 md:p-6 bg-gray-50/30 flex flex-col justify-between text-left space-y-4">
          <div className="space-y-1.5">
            <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{label('Monthly Donation Ledger Trends', 'ماہانہ رفاہی فنڈ کا بہاؤ', 'د مرستې میاشتنی بهیر چارټ')}</span>
            </h4>
            <p className="text-xs text-gray-450">
              {label('Tracking verified contributions (OMR) transferred directly to the Central Welfare Desk under Ikram Bacha.',
                'اکرام باچا برائے پختون کونسل کے مرکزی اکاؤنٹ میں جمع شدہ تصدیق شدہ فنڈ کا سالانہ موازنہ۔',
                'د اکرام باچا په مشرۍ د ټولنې په مرکزي بسپنه خوندیتوب کڅوړه کې جمع شوي مالي توازن.')}
            </p>
          </div>

          <div className="h-64 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyDonationData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  label={{ value: 'OMR', angle: -90, position: 'insideLeft', style: { fontSize: 10, fontWeight: 700, fill: '#94a3b8' } }}
                />
                <RechartsTooltip 
                  contentStyle={customTooltipStyle}
                  cursor={{ fill: 'rgba(16, 185, 129, 0.04)' }}
                  formatter={(value: any) => [`${value} OMR`, '']}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#047857" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                >
                  {monthlyDonationData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.amount > 0 ? '#047857' : '#94a3b8'} 
                      opacity={entry.amount > 0 ? 1 : 0.25}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-white border border-gray-200/80 rounded-xl flex items-center gap-3 text-xs">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg font-black font-mono">
              OMR
            </div>
            <div className="text-left font-sans flex-1">
              <span className="font-bold text-gray-800 block">
                {label('Strong Solid Transparency', 'مکمل مالیاتی شفافیت', 'بشپړ مالي روڼتیا')}
              </span>
              <p className="text-[10px] text-gray-500 leading-tight">
                {label('Expenditures (body transition, health relief camps) are deducted live after cabinet matching approval.',
                  'کونسل اخراجات (مانند میت برائے پاکستان، طبی کیمپ) حتمی منظوری کے بعد ہی منہا کیے جاتے ہیں۔',
                  'مصارف میاشتني رپوټ کې تصدیق کیږي او په منظم ډول تائیدیږي.')}
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
