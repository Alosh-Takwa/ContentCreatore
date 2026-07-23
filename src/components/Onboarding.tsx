/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Target, 
  Sparkles, 
  Upload, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  Volume2, 
  FileText,
  HelpCircle,
  TrendingUp,
  Facebook,
  Instagram,
  Compass,
  Clapperboard,
  CheckCircle2
} from 'lucide-react';
import { BrandProfile } from '../types';
import { compressAndResizeImage } from '../utils/imageCompressor';

interface OnboardingProps {
  onComplete: (profile: BrandProfile) => void;
  onCancel?: () => void;
}

const TONES = [
  { id: 'professional', name: 'مهني ورسمي', desc: 'مناسب للشركات الكبرى والخدمات الاستشارية والمحاسبة.' },
  { id: 'friendly', name: 'ودود ومقرب', desc: 'مناسب للمشاريع الصغيرة، التفاعل اليومي، والمطاعم.' },
  { id: 'enthusiastic', name: 'حماسي وملهم', desc: 'مناسب للرياضة، التنمية الذاتية، والبدايات الجديدة.' },
  { id: 'educational', name: 'تعليمي وتثقيفي', desc: 'مناسب للمدربين، صناع المحتوى، والدورات التعليمية.' },
  { id: 'humorous', name: 'فكاهي ومرح', desc: 'مناسب للمحتوى الترفيهي، جذب جيل الشباب، والمحتوى الساخر.' },
  { id: 'sales', name: 'بيعي ومقنع', desc: 'يركز على الفوائد المباشرة، العروض، وحث العميل على الشراء.' }
];

export default function Onboarding({ onComplete, onCancel }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<BrandProfile>({
    brandName: '',
    industry: '',
    mission: '',
    targetAudience: '',
    painPoints: '',
    tone: 'friendly',
    productDescription: '',
    keywords: '',
    images: [],
    viralReference: '',
    selectedPlatforms: ['facebook', 'instagram', 'tiktok'],
    selectedContentTypes: ['video_script', 'reel_idea', 'static_post']
  });

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectTone = (toneId: string) => {
    setProfile(prev => ({ ...prev, tone: toneId }));
  };

  const togglePlatform = (platform: 'facebook' | 'instagram' | 'tiktok') => {
    setProfile(prev => {
      const current = prev.selectedPlatforms || [];
      const updated = current.includes(platform)
        ? current.filter(p => p !== platform)
        : [...current, platform];
      if (updated.length === 0) return prev;
      return { ...prev, selectedPlatforms: updated };
    });
  };

  const toggleContentType = (type: 'video_script' | 'reel_idea' | 'static_post') => {
    setProfile(prev => {
      const current = prev.selectedContentTypes || [];
      const updated = current.includes(type)
        ? current.filter(t => t !== type)
        : [...current, type];
      if (updated.length === 0) return prev;
      return { ...prev, selectedContentTypes: updated };
    });
  };

  // Image upload helpers
  const handleFiles = async (files: FileList) => {
    const validImages = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    try {
      const compressedImages = await Promise.all(
        validImages.map(file => compressAndResizeImage(file))
      );
      
      setProfile(prev => ({
        ...prev,
        images: [...prev.images, ...compressedImages]
      }));
    } catch (err: any) {
      console.error('Error compressing onboarding images:', err);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    setProfile(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      onComplete(profile);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  // Validate step fields
  const isStepValid = () => {
    if (step === 1) {
      return profile.brandName.trim() !== '' && profile.industry.trim() !== '' && profile.productDescription.trim() !== '';
    }
    if (step === 2) {
      return profile.targetAudience.trim() !== '' && profile.painPoints.trim() !== '';
    }
    if (step === 3) {
      return (profile.selectedPlatforms || []).length > 0 && (profile.selectedContentTypes || []).length > 0;
    }
    return true;
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 rtl-grid" dir="rtl">
      {/* Top Brand Greeting */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center bg-gradient-to-tr from-emerald-500 to-teal-400 text-white p-3.5 rounded-2xl shadow-md shadow-emerald-200/50 mb-4 animate-pulse">
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 id="onboarding-title" className="text-3xl font-extrabold tracking-tight text-slate-800">
          مُهندِس محتوى التواصل الاجتماعي بالذكاء الاصطناعي ✨
        </h1>
        <p className="mt-2 text-slate-500 text-base max-w-lg mx-auto">
          قبل أن نصمم لك خطة 30 يوماً متكاملة، دعنا نفهم هوية مشروعك والجمهور المستهدف لضمان خطة دقيقة وتفاعل فيروسي!
        </p>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-12">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 rounded-full"></div>
        <div 
          className="absolute top-1/2 right-0 h-1 bg-emerald-500 -translate-y-1/2 rounded-full transition-all duration-300"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        ></div>
        
        <div className="relative flex justify-between">
          {[
            { num: 1, label: 'هوية البراند', icon: Building2 },
            { num: 2, label: 'الجمهور والوجع', icon: Target },
            { num: 3, label: 'الأسلوب والمراجع', icon: Volume2 }
          ].map((s) => {
            const Icon = s.icon;
            const isActive = step >= s.num;
            const isCurrent = step === s.num;
            return (
              <div key={s.num} className="flex flex-col items-center">
                <div 
                  className={`w-11 h-11 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300 ${
                    isActive 
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' 
                      : 'bg-white border-slate-200 text-slate-400'
                  } ${isCurrent ? 'ring-4 ring-emerald-50' : ''}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`mt-2 text-xs font-semibold ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Steps Container */}
      <div className="bg-white border border-slate-100 shadow-xl shadow-slate-100/50 rounded-3xl p-6 md:p-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-500" />
                  تفاصيل وهوية البراند الخاص بك
                </h3>
                <p className="text-sm text-slate-400">لنبني أساساً قوياً يحدد توجه محتوى مشروعك.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="brandName" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    اسم البراند أو المشروع <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="brandName"
                    type="text"
                    name="brandName"
                    required
                    value={profile.brandName}
                    onChange={handleTextChange}
                    placeholder="مثال: نكهة القهوة، تطبيق صحتي، إلخ"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label htmlFor="industry" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    مجال العمل والتخصص <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="industry"
                    type="text"
                    name="industry"
                    required
                    value={profile.industry}
                    onChange={handleTextChange}
                    placeholder="مثال: مطاعم ومقاهي، اللياقة البدنية، العقارات"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="productDescription" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  ما هو منتجك أو خدمتك بالتفصيل؟ <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="productDescription"
                  name="productDescription"
                  required
                  rows={3}
                  value={profile.productDescription}
                  onChange={handleTextChange}
                  placeholder="اشرح بالتفصيل ما تقدمه لعملائك ومميزاته لتستخرج الخوارزمية الفوائد الحقيقية وتصوغها بعناية..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm text-slate-800 resize-none"
                />
              </div>

              <div>
                <label htmlFor="mission" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  رسالة البراند وأهدافه الرئيسية (اختياري)
                </label>
                <textarea
                  id="mission"
                  name="mission"
                  rows={2}
                  value={profile.mission}
                  onChange={handleTextChange}
                  placeholder="ما هي الرؤية أو الرسالة التي تريد إيصالها لعملائك؟"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm text-slate-800 resize-none"
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-500" />
                  دراسة الجمهور المستهدف ونقاط الوجع
                </h3>
                <p className="text-sm text-slate-400">الجمهور هو عصب التسويق الناجح. لنحدد أين يكمن ألمهم لنقدم منتجك كالحل السحري.</p>
              </div>

              <div>
                <label htmlFor="targetAudience" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  من هو جمهورك المستهدف تحديداً؟ <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="targetAudience"
                  name="targetAudience"
                  required
                  rows={3}
                  value={profile.targetAudience}
                  onChange={handleTextChange}
                  placeholder="مثال: الأمهات العاملات، الشباب من عمر 18-25 المهتمين بالتقنية، أصحاب المشاريع الناشئة..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm text-slate-800 resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="painPoints" className="block text-sm font-semibold text-slate-700">
                    ما هي نقاط الوجع والتحديات الكبرى لديهم؟ <span className="text-rose-500">*</span>
                  </label>
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                    <HelpCircle className="h-3 w-3" />
                    المفتاح للمنشورات الأكثر انتشاراً
                  </span>
                </div>
                <textarea
                  id="painPoints"
                  name="painPoints"
                  required
                  rows={4}
                  value={profile.painPoints}
                  onChange={handleTextChange}
                  placeholder="ما هي المشاكل اليومية التي تجعلهم مستائين ويبحثون عن حل؟ (مثال: عدم امتلاك الوقت الكافي للطهي، ضياع الميزانية في الإعلانات الفاشلة، آلام الظهر المستمرة بسبب الجلوس الطويل...)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm text-slate-800 resize-none"
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-emerald-500" />
                  الأسلوب الفني ومصادر الإلهام الفايرل
                </h3>
                <p className="text-sm text-slate-400">إضافة صور للمنتج لدمج مواصفاته، وتحديد أسلوب الخطاب، وتوفير أمثلة ملهمة.</p>
              </div>

              {/* Platforms and Content Types selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                {/* 1. Target Platforms selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                    <span className="text-emerald-500">📱</span>
                    منصات التواصل المستهدفة <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mb-3">اختر المنصات التي ترغب بإدارة خطة المحتوى لها بذكاء.</p>
                  <div className="space-y-2">
                    {[
                      { id: 'facebook', name: 'فيسبوك (Facebook)', icon: Facebook, colorClass: 'text-blue-600 bg-blue-50 border-blue-200' },
                      { id: 'instagram', name: 'انستغرام (Instagram)', icon: Instagram, colorClass: 'text-pink-600 bg-pink-50 border-pink-200' },
                      { id: 'tiktok', name: 'تيك توك (TikTok)', icon: Compass, colorClass: 'text-slate-800 bg-slate-100 border-slate-300' }
                    ].map((p) => {
                      const Icon = p.icon;
                      const isSelected = profile.selectedPlatforms?.includes(p.id as any);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => togglePlatform(p.id as any)}
                          className={`w-full p-3 rounded-xl border flex items-center justify-between text-right transition-all cursor-pointer ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50/25 ring-2 ring-emerald-500/10'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`p-1.5 rounded-lg border ${p.colorClass}`}>
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="text-xs font-bold text-slate-700">{p.name}</span>
                          </div>
                          {isSelected ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-slate-300 shrink-0"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Content Types selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                    <span className="text-emerald-500">🎬</span>
                    أنواع المحتوى المطلوبة <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mb-3">اختر أنواع المنشورات والسكريبتات لتنويع استراتيجيتك.</p>
                  <div className="space-y-2">
                    {[
                      { id: 'video_script', name: 'سكريبت فيديو تصوير تفصيلي', icon: Clapperboard, desc: 'سكريبت كامل لليوتيوب، ريلز أو فيديوهات UGC' },
                      { id: 'reel_idea', name: 'فكرة ريلز وفيديو قصير سريع', icon: Sparkles, desc: 'أفكار سريعة ومثيرة للانتباه ومخصصة للانتشار السريع' },
                      { id: 'static_post', name: 'منشور بوست ذو صورة ثابتة', icon: FileText, desc: 'كابشن قوي تفصيلي وبيعي مع برومت جاهز لتوليد الصورة' }
                    ].map((ct) => {
                      const Icon = ct.icon;
                      const isSelected = profile.selectedContentTypes?.includes(ct.id as any);
                      return (
                        <button
                          key={ct.id}
                          type="button"
                          onClick={() => toggleContentType(ct.id as any)}
                          className={`w-full p-3 rounded-xl border flex items-center justify-between text-right transition-all cursor-pointer ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50/25 ring-2 ring-emerald-500/10'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="p-1.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-500">
                              <Icon className="h-4 w-4" />
                            </span>
                            <div className="text-right">
                              <span className="block text-xs font-bold text-slate-700">{ct.name}</span>
                              <span className="block text-[10px] text-slate-400 mt-0.5">{ct.desc}</span>
                            </div>
                          </div>
                          {isSelected ? (
                            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-slate-300 shrink-0"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tone selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  لهجة وأسلوب الخطاب (Tone of Voice)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TONES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectTone(t.id)}
                      className={`p-3 rounded-2xl text-right border transition-all duration-200 ${
                        profile.tone === t.id
                          ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                          : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <h4 className={`text-sm font-bold ${profile.tone === t.id ? 'text-emerald-700' : 'text-slate-800'}`}>
                        {t.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                        {t.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  ارفع صوراً حقيقية لمنتجك (اختياري)
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  مهم جداً: سيقوم الذكاء الاصطناعي بتحليل الصورة ليرسم لك تصميم البوستات الثابتة ويكتب لك تفاصيل واقعية للمنتج.
                </p>
                
                <div 
                  id="drop-zone"
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                    dragActive 
                      ? 'border-emerald-500 bg-emerald-50/30' 
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/20'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-white shadow-sm border border-slate-100 text-slate-400 rounded-xl mb-3">
                      <Upload className="h-6 w-6 text-emerald-500" />
                    </div>
                    <button
                      type="button"
                      onClick={onButtonClick}
                      className="text-sm font-bold text-slate-700 hover:text-emerald-600 transition-colors"
                    >
                      اسحب الصور هنا أو انقر لاختيارها من جهازك
                    </button>
                    <p className="text-xs text-slate-400 mt-1">يدعم تنسيقات JPG, PNG, WEBP</p>
                  </div>
                </div>

                {/* Images Preview list */}
                {profile.images.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-4">
                    {profile.images.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-white">
                        <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                        >
                          <Trash2 className="h-5 w-5 hover:text-rose-400 transition-colors" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Extra Keywords & Swipe References */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="keywords" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    الكلمات المفتاحية أو الهاشتاغات المفضلة (اختياري)
                  </label>
                  <input
                    id="keywords"
                    type="text"
                    name="keywords"
                    value={profile.keywords}
                    onChange={handleTextChange}
                    placeholder="مثال: #قهوة_عربية، تسويق_رقمي، كولاجين..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label htmlFor="viralReference" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    مرجع أو رابط لمنشورات فايرل أعجبتك (اختياري)
                  </label>
                  <input
                    id="viralReference"
                    type="text"
                    name="viralReference"
                    value={profile.viralReference}
                    onChange={handleTextChange}
                    placeholder="ضع هنا نموذج بوست أعجبك أو فكرة ترغب بمحاكاتها..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm text-slate-800"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition-all flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4" /> {/* In RTL, ArrowRight points previous */}
              السابق
            </button>
          ) : onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold text-sm transition-all"
            >
              إلغاء الرجوع للرئيسية
            </button>
          ) : (
            <div></div>
          )}

          <button
            type="button"
            disabled={!isStepValid()}
            onClick={nextStep}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              isStepValid()
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-200 hover:brightness-105 active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {step === 3 ? 'إنشاء الاستراتيجية وحساب الخطة ✨' : 'المتابعة'}
            <ArrowLeft className="h-4 w-4" /> {/* In RTL, ArrowLeft points next */}
          </button>
        </div>
      </div>
    </div>
  );
}
