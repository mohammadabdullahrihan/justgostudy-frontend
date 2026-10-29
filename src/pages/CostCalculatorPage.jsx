import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  Calculator, DollarSign, Award, ArrowLeft, ArrowRight, Download, RefreshCw, Layers,
  ShieldCheck, ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import * as studyService from '../services/studyService';
import universityService from '../services/universityService';
import courseService from '../services/courseService';
import { getExchangeRates } from '../services/exchangeRateService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import ComparisonTable from '../components/study/ComparisonTable';
import ScholarshipPromoBanner from '../components/study/ScholarshipPromoBanner';
import { DataDisclaimer } from '../components/study/DetailsPageKit';
import Seo from '../components/common/Seo';
import { toast } from 'react-hot-toast';
import { countryFlagMap } from '../constants/countries';
import { CURRENCIES, getCurrencyMeta } from '../constants/currencies';

gsap.registerPlugin(useGSAP);

// Big result figure that smoothly tweens between values as inputs change,
// instead of snapping, the "count up" feel without flashing to zero.
const AnimatedCurrency = ({ value, currency, liveRates, className }) => {
  const ref = useRef(null);
  const prev = useRef(value);
  const fmt = (n) => {
    const { symbol, rate } = getCurrencyMeta(currency, liveRates);
    return `${symbol}${Math.round(n * rate).toLocaleString()}`;
  };

  useGSAP(
    () => {
      const node = ref.current;
      if (!node) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        node.textContent = fmt(value);
        prev.current = value;
        return;
      }
      const obj = { v: prev.current };
      gsap.to(obj, {
        v: value,
        duration: 0.8,
        ease: 'power2.out',
        onUpdate: () => { node.textContent = fmt(obj.v); },
      });
      prev.current = value;
    },
    { dependencies: [value, currency, liveRates] }
  );

  return <span ref={ref} className={className}>{fmt(value)}</span>;
};

const CostCalculatorPage = () => {
  const [dataLoading, setDataLoading] = useState(true);
  const [calculatorDefaults, setCalculatorDefaults] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [currency, setCurrency] = useState('USD');
  const [liveRates, setLiveRates] = useState(null);
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState(null);
  const [calcData, setCalcData] = useState({
    country: '',
    area: '',
    intake: 'Fall',
    level: 'Bachelor',
    universityId: '',
    courseId: '',
    tuitionFee: 0,
    livingCost: 0,
    scholarship: 0,
    partTimeHours: 20,
    hourlyRate: 0,
    visaFee: 0,
    otherIncome: 0,
  });

  const resultCardRef = useRef(null);

  // Initial data fetch - runs in background, UI shows immediately with defaults
  useEffect(() => {
    const fetchCostCalculatorData = async () => {
      try {
        const [defaultsRes, unisRes] = await Promise.all([
          studyService.getCalculatorDefaults(),
          universityService.getUniversities(),
          courseService.getCourses(),
        ]);

        setCalculatorDefaults(Array.isArray(defaultsRes) ? defaultsRes : (defaultsRes.data || defaultsRes.courses || []));

        const actualDefaults = Array.isArray(defaultsRes) ? defaultsRes : (defaultsRes.data || []);

        setUniversities(Array.isArray(unisRes) ? unisRes : (unisRes.universities || unisRes.data || unisRes.courses || []));

        const coursesData = Array.isArray(unisRes) ? unisRes : (unisRes.courses || unisRes.data?.courses || unisRes.data || []);
        setAllCourses(Array.isArray(coursesData) ? coursesData : (coursesData.courses || coursesData.data || []));

        if (actualDefaults.length > 0) {
          const first = actualDefaults[0];
          setCalcData((prev) => ({
            ...prev,
            country: first.country,
            livingCost: first.avgLivingCostPerYear,
            hourlyRate: first.partTimeHourlyRate,
            visaFee: first.visaFee || 0,
            area: first.areaWiseCosts?.[0]?.areaName || '',
          }));
        }
      } catch (error) {
        console.error('Error fetching calculator defaults:', error);
      } finally {
        setDataLoading(false);
      }
    };
    fetchCostCalculatorData();
  }, []);

  // Live FX rates, backend refreshes these daily; falls back to the static
  // table in CURRENCIES above if the provider is unreachable.
  useEffect(() => {
    getExchangeRates()
      .then((data) => {
        setLiveRates(data.rates);
        setRatesUpdatedAt(data.fetchedAt);
      })
      .catch((error) => {
        console.error('Error fetching live exchange rates, using offline rates:', error);
      });
  }, []);

  // Filter courses when university changes
  useEffect(() => {
    if (calcData.universityId) {
      const uniCourses = allCourses.filter((c) =>
        (c.universityId && c.universityId._id === calcData.universityId) ||
        c.universityId === calcData.universityId
      );
      setCourses(uniCourses);
    } else {
      setCourses([]);
    }
  }, [calcData.universityId, allCourses]);

  // Update tuition fee when course changes
  useEffect(() => {
    if (calcData.courseId) {
      const selectedCourse = courses.find((c) => c._id === calcData.courseId);
      if (selectedCourse) {
        setCalcData((prev) => ({ ...prev, tuitionFee: selectedCourse.tuitionFee || 0 }));
      }
    }
  }, [calcData.courseId, courses]);

  // Fetch universities when country changes
  useEffect(() => {
    const fetchUnisByCountry = async () => {
      if (calcData.country) {
        try {
          const unisRes = await universityService.getUniversities({ country: calcData.country });
          const coursesRes = await courseService.getCourses({ country: calcData.country });

          const actualUnis = Array.isArray(unisRes) ? unisRes : (unisRes.universities || unisRes.data || []);
          const actualCourses = Array.isArray(coursesRes) ? coursesRes : (coursesRes.courses || coursesRes.data || []);

          setUniversities(actualUnis);
          setAllCourses(actualCourses);
          setCalcData((prev) => ({ ...prev, universityId: '', courseId: '', tuitionFee: 0 }));
        } catch (error) {
          console.error('Error fetching universities:', error);
        }
      }
    };
    fetchUnisByCountry();
  }, [calcData.country]);

  useEffect(() => {
    if (calcData.country) {
      const countryDef = calculatorDefaults.find((d) => d.country === calcData.country);
      if (countryDef) {
        let livingCost = countryDef.avgLivingCostPerYear;
        if (calcData.area && countryDef.areaWiseCosts) {
          const areaData = countryDef.areaWiseCosts.find((a) => a.areaName === calcData.area);
          if (areaData) {
            livingCost = Math.round(livingCost * (areaData.livingCostMultiplier || 1));
          }
        }
        setCalcData((prev) => ({
          ...prev,
          livingCost,
          hourlyRate: countryDef.partTimeHourlyRate,
          visaFee: countryDef.visaFee || 0,
        }));
      }
    }
  }, [calcData.country, calcData.area, calculatorDefaults]);

  const calculateResults = () => {
    const totalTuition = Number(calcData.tuitionFee) || 0;
    const totalLiving = Number(calcData.livingCost) || 0;
    const totalScholarship = Number(calcData.scholarship) || 0;
    const annualIncome = ((Number(calcData.partTimeHours) || 0) * (Number(calcData.hourlyRate) || 0) * 48) + (Number(calcData.otherIncome) || 0);
    const visaFee = Number(calcData.visaFee) || 0;
    const rawNetCost = (totalTuition + totalLiving + visaFee) - (totalScholarship + annualIncome);
    const netCost = rawNetCost > 0 ? rawNetCost : 0;
    const surplus = rawNetCost < 0 ? Math.abs(rawNetCost) : 0;

    return { totalTuition, totalLiving, totalScholarship, annualIncome, netCost, visaFee, surplus, rawNetCost };
  };

  const results = calculateResults();
  const bdtRate = getCurrencyMeta('BDT', liveRates).rate; // PDF export always reports USD + BDT

  const formatValue = (val) => {
    const { symbol, rate } = getCurrencyMeta(currency, liveRates);
    return `${symbol}${Math.round(val * rate).toLocaleString()}`;
  };

  const selectedCountryDef = calculatorDefaults.find((d) => d.country === calcData.country);
  const chartData = [
    { name: 'Tuition', value: results.totalTuition, color: '#0e1f6d' },
    { name: 'Living', value: results.totalLiving, color: '#3454e5' },
  ];

  // Pop the result card in once on mount.
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.from(resultCardRef.current, { opacity: 0, scale: 0.92, duration: 0.7, ease: 'back.out(1.4)' });
    },
    { scope: resultCardRef }
  );

  const addToCompare = () => {
    if (compareList.length >= 3) {
      toast.error('You can compare up to 3 countries');
      return;
    }
    const countryData = calculatorDefaults.find((d) => d.country === calcData.country);
    if (!countryData) return;

    const newCompareItem = {
      name: calcData.country,
      code: countryFlagMap[calcData.country] || 'un',
      data: {
        tuition: `$${calcData.tuitionFee}`,
        living: `$${calcData.livingCost}`,
        visa: '$500',
        income: `$${results.annualIncome}`,
        work: '2 years',
      },
      total: `$${results.netCost}`,
    };

    setCompareList([...compareList, newCompareItem]);
    setShowComparison(true);
    toast.success(`${calcData.country} added to comparison`);
  };

  const downloadPDF = async () => {
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header (brand navy)
    doc.setFillColor(14, 31, 109);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Just Go Study - Cost Analysis', 20, 25);

    // Summary
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Destination: ${calcData.country}`, 20, 55);
    doc.text(`Level: ${calcData.level}`, 20, 62);
    doc.text(`Intake: ${calcData.intake}`, 20, 69);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 60, 55);

    const tableData = [
      ['Expense Category', 'Annual Amount (USD)', 'Annual Amount (BDT)'],
      ['Tuition Fee', `$${results.totalTuition.toLocaleString()}`, `৳${(results.totalTuition * bdtRate).toLocaleString()}`],
      ['Living Expenses', `$${results.totalLiving.toLocaleString()}`, `৳${(results.totalLiving * bdtRate).toLocaleString()}`],
      ['Visa Fee', `$${results.visaFee.toLocaleString()}`, `৳${(results.visaFee * bdtRate).toLocaleString()}`],
      ['Total Investment', `$${(results.totalTuition + results.totalLiving + results.visaFee).toLocaleString()}`, `৳${((results.totalTuition + results.totalLiving + results.visaFee) * bdtRate).toLocaleString()}`],
    ];

    doc.autoTable({
      startY: 80,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [14, 31, 109] },
      margin: { left: 20, right: 20 },
    });

    const incomeData = [
      ['Income Source', 'Annual Amount (USD)', 'Annual Amount (BDT)'],
      ['Scholarships', `$${results.totalScholarship.toLocaleString()}`, `৳${(results.totalScholarship * bdtRate).toLocaleString()}`],
      ['Part-time Work', `$${results.annualIncome.toLocaleString()}`, `৳${(results.annualIncome * bdtRate).toLocaleString()}`],
      ['Total Support', `$${(results.totalScholarship + results.annualIncome).toLocaleString()}`, `৳${((results.totalScholarship + results.annualIncome) * bdtRate).toLocaleString()}`],
    ];

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      head: [incomeData[0]],
      body: incomeData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [16, 150, 119] },
      margin: { left: 20, right: 20 },
    });

    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFillColor(245, 245, 246);
    doc.rect(20, finalY, pageWidth - 40, 20, 'F');
    doc.setTextColor(14, 31, 109);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Estimated Net Annual Cost:', 30, finalY + 13);
    doc.text(`$${results.netCost.toLocaleString()} / ৳${(results.netCost * bdtRate).toLocaleString()}`, pageWidth - 100, finalY + 13);

    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Generated by Just Go Study Portal. This is an estimate based on current data.', 20, doc.internal.pageSize.getHeight() - 15);

    doc.save(`JustGoStudy_Cost_Analysis_${calcData.country}.pdf`);
    toast.success('Report downloaded successfully!');
  };

  const selectClass = 'w-full rounded-2xl border border-cream-200 bg-cream-50 px-5 py-4 font-medium text-ink-900 outline-none transition-all focus:border-primary-400 focus:shadow-focus-ring';
  const inputClass = 'w-full rounded-2xl border border-cream-200 bg-cream-50 py-4 pl-12 pr-5 font-bold text-ink-900 outline-none transition-all focus:border-primary-400 focus:shadow-focus-ring';
  const fieldLabel = 'text-sm font-bold text-ink-700';

  return (
    <div className="bg-white pb-24 pt-8 font-sans">
      <Seo
        title="Study Abroad Cost Calculator - Just Go Study"
        description="Estimate your total study abroad budget, tuition, living costs and currency conversion, with Just Go Study's free cost calculator."
      />
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="relative mb-12 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950 px-6 py-10 sm:px-10">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl" />
            <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <Link
                  to="/study-abroad"
                  className="group mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-white py-2.5 pl-4 pr-5 text-sm font-bold text-primary-700 shadow-theme-sm transition-all duration-300 hover:bg-primary-50 hover:shadow-theme-md"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" /> Back to Study Abroad
                </Link>
                <h1 className="mb-4 font-outfit text-4xl font-extrabold text-white">
                  Study <span className="text-accent-400">Cost Calculator</span>
                </h1>
                <p className="text-primary-100">Plan your finances accurately before you study abroad.</p>
              </div>

              <div className="w-fit">
                <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-primary-200">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="rounded-2xl border border-accent-400/20 bg-white/10 px-5 py-3 text-sm font-bold text-accent-300 outline-none transition-all focus:border-accent-400"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code} className="text-ink-900">{c.code} ({c.symbol.trim()})</option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-primary-200">
                  {ratesUpdatedAt
                    ? `Live rates · updated ${new Date(ratesUpdatedAt).toLocaleDateString()}`
                    : 'Using offline rates'}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <DataDisclaimer />
          </div>

          <div className="flex flex-col overflow-hidden rounded-[48px] border border-cream-100 bg-white shadow-theme-lg lg:flex-row">
            {/* Inputs Panel */}
            <div className="border-cream-100 p-8 md:p-12 lg:w-1/2 lg:border-r">
              <div className="mb-10 flex items-center justify-between">
                <h2 className="flex items-center text-2xl font-bold text-ink-900">
                  <Calculator className="mr-3 h-6 w-6 text-primary-600" /> Step {currentStep} of 3
                </h2>
                <div className="flex gap-2">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className={`h-2 w-8 rounded-full transition-all ${currentStep >= step ? 'bg-primary-600' : 'bg-cream-200'}`} />
                  ))}
                </div>
              </div>

              <div className="min-h-[450px]">
                {currentStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className={fieldLabel}>Destination Country</label>
                        {dataLoading ? (
                          <div className="h-14 w-full animate-pulse rounded-2xl bg-cream-100" />
                        ) : (
                          <select className={selectClass} value={calcData.country} onChange={(e) => setCalcData({ ...calcData, country: e.target.value })}>
                            {calculatorDefaults.map((d) => <option key={d._id} value={d.country}>{d.country}</option>)}
                          </select>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className={fieldLabel}>Study Area / City</label>
                        <select className={selectClass} value={calcData.area} onChange={(e) => setCalcData({ ...calcData, area: e.target.value })}>
                          <option value="">Default Area</option>
                          {selectedCountryDef?.areaWiseCosts?.map((a, idx) => (
                            <option key={idx} value={a.areaName}>{a.areaName}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className={fieldLabel}>Intake</label>
                        <select className={selectClass} value={calcData.intake} onChange={(e) => setCalcData({ ...calcData, intake: e.target.value })}>
                          <option>Fall (Sept/Oct)</option>
                          <option>Spring (Jan/Feb)</option>
                          <option>Summer (May/June)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className={fieldLabel}>Course Level</label>
                        <select className={selectClass} value={calcData.level} onChange={(e) => setCalcData({ ...calcData, level: e.target.value })}>
                          <option>Bachelor</option>
                          <option>Master</option>
                          <option>PhD</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className={fieldLabel}>Select University</label>
                        <select className={selectClass} value={calcData.universityId} onChange={(e) => setCalcData({ ...calcData, universityId: e.target.value })}>
                          <option value="">Select University (Optional)</option>
                          {universities.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className={fieldLabel}>Select Course</label>
                        <select className={selectClass} value={calcData.courseId} onChange={(e) => setCalcData({ ...calcData, courseId: e.target.value })} disabled={!calcData.universityId}>
                          <option value="">Select Course</option>
                          {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className={fieldLabel}>Annual Tuition Fee ({currency})</label>
                      <div className="relative">
                        <DollarSign className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-500" />
                        <input type="number" className={inputClass} value={calcData.tuitionFee} onChange={(e) => setCalcData({ ...calcData, tuitionFee: e.target.value })} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    <ScholarshipPromoBanner country={calcData.country} />

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className={fieldLabel}>Annual Living Cost ({currency})</label>
                        <div className="relative">
                          <DollarSign className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-500" />
                          <input type="number" className={inputClass} value={calcData.livingCost} onChange={(e) => setCalcData({ ...calcData, livingCost: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className={fieldLabel}>Scholarship Amount ({currency})</label>
                        <div className="relative">
                          <Award className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-500" />
                          <input type="number" className={inputClass} value={calcData.scholarship} onChange={(e) => setCalcData({ ...calcData, scholarship: e.target.value })} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className={fieldLabel}>Weekly Work Hours</label>
                        <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-bold text-primary-600">{calcData.partTimeHours} Hours</span>
                      </div>
                      <input
                        type="range" min="0" max="20"
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-cream-100 accent-primary-600"
                        value={calcData.partTimeHours}
                        onChange={(e) => setCalcData({ ...calcData, partTimeHours: e.target.value })}
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="mt-12 flex gap-4 border-t border-cream-100 pt-8">
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-cream-200 px-8 py-4 font-bold text-ink-600 transition-all hover:bg-cream-50"
                  >
                    <ArrowLeft className="h-4 w-4" /> Previous
                  </button>
                )}
                {currentStep < 3 ? (
                  <button
                    onClick={() => setCurrentStep((prev) => prev + 1)}
                    className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-primary-600 px-8 py-4 font-bold text-white transition-all hover:bg-primary-500"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => toast.success('Calculation ready!')}
                    className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-secondary-600 px-8 py-4 font-bold text-white transition-all hover:bg-secondary-500"
                  >
                    Generate Result <RefreshCw className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Results Panel */}
            <div className="flex flex-col bg-cream-50 p-8 text-ink-900 md:p-12 lg:w-1/2">
              <h2 className="mb-4 flex items-center justify-between text-2xl font-bold">
                Financial Summary
                <span className="rounded-lg border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-600">
                  {currency} View
                </span>
              </h2>

              {selectedCountryDef?.embassyUrl && (
                <a
                  href={selectedCountryDef.embassyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-bold text-primary-700 transition-colors hover:bg-primary-100"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verify {calcData.country} fees on official site
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}

              <div className="mb-10 space-y-6">
                <div className="flex items-center justify-between rounded-2xl border border-cream-100 bg-white p-4 shadow-theme-sm">
                  <span className="text-sm font-medium text-ink-500">Total Investment</span>
                  <span className="text-xl font-bold text-ink-900">{formatValue(results.totalTuition + results.totalLiving + results.visaFee)}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-cream-100 bg-white p-4 shadow-theme-sm">
                  <span className="text-sm font-medium text-ink-500">Total Savings (Scholarship + Income)</span>
                  <span className="text-xl font-bold text-secondary-600">{formatValue(results.totalScholarship + results.annualIncome)}</span>
                </div>

                {/* Hero result, gradient card with a tweened figure */}
                <div ref={resultCardRef} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 p-7 text-white shadow-theme-lg">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary-100">
                    {results.surplus > 0 ? 'Annual Surplus' : 'Net Investment / Year'}
                  </p>
                  <div className="flex items-baseline gap-1">
                    {results.surplus > 0 && <span className="text-4xl font-bold text-secondary-300">+</span>}
                    <AnimatedCurrency
                      value={results.surplus > 0 ? results.surplus : results.netCost}
                      currency={currency}
                      liveRates={liveRates}
                      className={`text-5xl font-bold ${results.surplus > 0 ? 'text-secondary-300' : 'text-white'}`}
                    />
                  </div>
                  {results.surplus > 0 && (
                    <p className="mt-2 text-sm text-primary-100">Your earnings exceed costs!</p>
                  )}
                </div>
              </div>

              <div className="relative mb-10 min-h-[200px] flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '15px', border: 'none', backgroundColor: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#1f1f1f' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-[10px] font-bold uppercase tracking-tighter text-ink-500">Expenses</p>
                  <p className="text-lg font-bold text-ink-900">{formatValue(results.totalTuition + results.totalLiving)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={downloadPDF}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-cream-200 bg-white py-4 font-bold text-ink-900 shadow-theme-sm transition-all hover:bg-cream-50"
                >
                  <Download className="h-5 w-5" /> Export PDF
                </button>
                <button
                  onClick={addToCompare}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-primary-600 py-4 font-bold text-white shadow-theme-md transition-all hover:bg-primary-500"
                >
                  <Layers className="h-5 w-5" /> Compare
                </button>
              </div>
            </div>
          </div>

          {/* Comparison Section */}
          {showComparison && compareList.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="mt-24">
              <div className="mb-12 flex items-center justify-between">
                <div>
                  <h2 className="font-outfit text-3xl font-bold text-ink-900">Country Comparison</h2>
                  <p className="text-ink-500">Side-by-side analysis of your selected destinations.</p>
                </div>
                <button
                  onClick={() => setCompareList([])}
                  className="rounded-xl px-4 py-2 font-bold text-red-500 transition-all hover:bg-red-50"
                >
                  Clear All
                </button>
              </div>
              <ComparisonTable
                countries={compareList}
                onAdd={() => setShowComparison(false)}
                onRemove={(idx) => setCompareList(compareList.filter((_, i) => i !== idx))}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CostCalculatorPage;
