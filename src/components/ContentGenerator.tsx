/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Copy, 
  CheckCircle, 
  Download, 
  X, 
  Clapperboard, 
  Image as ImageIcon, 
  FileText, 
  Share2, 
  Info,
  RefreshCw,
  Lightbulb,
  Youtube,
  Facebook,
  Instagram,
  Compass,
  Trash2,
  UploadCloud
} from 'lucide-react';
import { BrandProfile, DayPlan, GeneratedContent } from '../types';

interface ContentGeneratorProps {
  dayPlan: DayPlan;
  profile: BrandProfile;
  customViralPosts: string[];
  onContentGenerated: (day: number, content: GeneratedContent) => void;
  onUpdateDayPlanImage: (day: number, imageBase64: string | undefined) => void;
  onClose: () => void;
}

export default function ContentGenerator({ 
  dayPlan, 
  profile, 
  customViralPosts, 
  onContentGenerated, 
  onUpdateDayPlanImage,
  onClose 
}: ContentGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hook' | 'text' | 'structure' | 'shooting' | 'design'>('hook');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onUpdateDayPlanImage(dayPlan.day, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Facebook className="h-5 w-5 text-blue-600" />;
      case 'instagram': return <Instagram className="h-5 w-5 text-pink-600" />;
      case 'tiktok': return <Compass className="h-5 w-5 text-slate-800" />;
      default: return <Sparkles className="h-5 w-5 text-emerald-500" />;
    }
  };

  const getPlatformNameAr = (platform: string) => {
    switch (platform) {
      case 'facebook': return 'فيسبوك';
      case 'instagram': return 'انستغرام';
      case 'tiktok': return 'تيك توك';
      default: return platform;
    }
  };

  const getTypeNameAr = (type: string) => {
    switch (type) {
      case 'video_script': return 'سكربت فيديو كامل وطريقة التصوير';
      case 'reel_idea': return 'فكرة ريل وتكتيك الانتشار';
      case 'static_post': return 'بوست ثابت برومت وتصميم مبدئي';
      default: return type;
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      // Package training custom posts into profile-equivalent context
      const enhancedProfile = {
        ...profile,
        // Append custom viral training posts to the reference to pass server-side
        viralReference: `${profile.viralReference || ''}\n\n[إضافات التدريب المستمر للعميل]:\n${customViralPosts.join('\n---\n')}`
      };

      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: enhancedProfile,
          dayPlan: dayPlan
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'فشل توليد محتوى البوست.');
      }

      const data = await res.json();
      const newGeneratedContent: GeneratedContent = {
        id: `content-${Date.now()}`,
        platform: dayPlan.platform,
        type: dayPlan.type,
        day: dayPlan.day,
        ...data.content,
        createdAt: new Date().toISOString()
      };

      onContentGenerated(dayPlan.day, newGeneratedContent);
      
      // Auto switch tabs based on availability
      if (dayPlan.type === 'static_post') {
        setActiveTab('hook');
      } else {
        setActiveTab('hook');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ غير متوقع أثناء التوليد. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!dayPlan.content) return;
    const c = dayPlan.content;
    const reportText = `
========================================
تقرير المحتوى الإعلاني - اليوم ${dayPlan.day} (${getPlatformNameAr(dayPlan.platform)})
========================================
العنوان: ${dayPlan.title}
المنصة: ${getPlatformNameAr(dayPlan.platform)}
النوع: ${getTypeNameAr(dayPlan.type)}
الهدف: ${dayPlan.objective}
مفهوم المحتوى: ${dayPlan.concept}

----------------------------------------
1. الخطاف الجذاب (Hook):
----------------------------------------
${c.hook}

----------------------------------------
2. كابشن المنشور (Caption):
----------------------------------------
${c.caption}

----------------------------------------
3. الهيكلية الإقناعية (Structure):
----------------------------------------
${c.structure}

----------------------------------------
4. النص بالكامل والمقروء (Full Text):
----------------------------------------
${c.fullText}
${c.shootingGuidelines ? `
----------------------------------------
5. زوايا وطريقة التصوير والإخراج (Shooting Guidelines):
----------------------------------------
${c.shootingGuidelines}
` : ''}
${c.imagePrompt ? `
----------------------------------------
6. برومت التصميم وتوليد الصور (Image Generator Prompt):
----------------------------------------
${c.imagePrompt}
` : ''}

تقرير تولد عبر: مُهندس المحتوى الذكي للذكاء الاصطناعي
تاريخ التوليد: ${new Date(c.createdAt).toLocaleDateString('ar-EG')}
========================================
    `;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.brandName}-اليوم-${dayPlan.day}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const content = dayPlan.content;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end rtl-grid" dir="rtl" onClick={onClose}>
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white shadow-sm border border-slate-100 rounded-xl">
              {getPlatformIcon(dayPlan.platform)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  اليوم {dayPlan.day}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {getPlatformNameAr(dayPlan.platform)}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mt-1 line-clamp-1">{dayPlan.title}</h3>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Day Concept & Objective Detail Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Lightbulb className="h-3 w-3 text-amber-500" />
                المفهوم الأساسي
              </p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                {dayPlan.concept}
              </p>
            </div>
            <div className="border-t md:border-t-0 md:border-r border-slate-200/60 pt-3 md:pt-0 md:pr-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Compass className="h-3 w-3 text-indigo-500" />
                هدف المنشور لـ {profile.brandName}
              </p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                {dayPlan.objective}
              </p>
            </div>
          </div>

          {/* Day-specific Product Image Selector */}
          <div className="bg-white border border-slate-150 rounded-2xl p-4.5 space-y-4 shadow-sm text-right">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-emerald-500" />
                تخصيص صورة المنتج لليوم {dayPlan.day}
              </h4>
              {dayPlan.selectedImage && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  مخصصة لهذا اليوم
                </span>
              )}
            </div>

            {dayPlan.selectedImage ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 bg-white flex-shrink-0">
                  <img 
                    src={dayPlan.selectedImage} 
                    alt={`Product for Day ${dayPlan.day}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <p className="text-xs font-bold text-slate-800">جاهز للتوليد الذكي بالصورة المحددة!</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    سيقوم نموذج الذكاء الاصطناعي بتحليل شكل ولون وخصائص هذا المنتج المرفق لدمجها بذكاء في الهوك، الكابشن، وتوليد البرومت الفيروسي الدقيق لـ Midjourney/DALL-E.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onUpdateDayPlanImage(dayPlan.day, undefined)}
                      className="text-[11px] font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      إلغاء الصورة المخصصة
                    </button>
                    {dayPlan.content && (
                      <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-lg font-bold">
                        💡 غيّرت الصورة؟ اضغط بالأسفل لإعادة التوليد لتطبيقها.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  بشكل افتراضي، يُستخدم المنتج العام للبراند. يمكنك تحديد صورة منتج معينة مخصصة لهذا اليوم فقط، وسيقوم الذكاء الاصطناعي بصياغة النص الإعلاني والبرومت ليتلاءم مع خصائص وشكل هذا المنتج بدقة.
                </p>

                {/* Grid for Brand Images and Upload Button */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Option A: Upload custom file */}
                  <label className="relative w-20 h-20 rounded-xl border border-dashed border-slate-300 hover:border-emerald-400 bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center cursor-pointer transition-all group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                    />
                    <UploadCloud className="h-5 w-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                    <span className="text-[9px] font-black text-slate-500 mt-1">ارفع صورة</span>
                  </label>

                  {/* Option B: Choose from existing brand profile images */}
                  {profile.images && profile.images.map((img, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => onUpdateDayPlanImage(dayPlan.day, img)}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 hover:border-emerald-500 hover:scale-105 active:scale-95 transition-all bg-white"
                      title="اختر من صور البراند"
                    >
                      <img 
                        src={img} 
                        alt={`Brand product ${idx + 1}`} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white bg-slate-900/80 px-1.5 py-0.5 rounded">تحديد</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error notice */}
          {error && (
            <div className="bg-rose-50 text-rose-700 p-4 rounded-xl border border-rose-100 text-sm">
              <p className="font-bold">عذراً، فشل توليد المحتوى:</p>
              <p className="mt-1 text-xs">{error}</p>
              <button 
                onClick={handleGenerate} 
                className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-rose-800 underline hover:text-rose-950"
              >
                <RefreshCw className="h-3.5 w-3.5" /> إعادة المحاولة
              </button>
            </div>
          )}

          {/* Generated content presentation */}
          {content ? (
            <div className="space-y-5">
              {/* Tabs selector */}
              <div className="flex overflow-x-auto gap-1 border-b border-slate-100 pb-1 -mx-2 px-2 scrollbar-none">
                <button
                  onClick={() => setActiveTab('hook')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeTab === 'hook' 
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  الخطاف والكابشن
                </button>
                <button
                  onClick={() => setActiveTab('text')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeTab === 'text' 
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  النص الكامل
                </button>
                <button
                  onClick={() => setActiveTab('structure')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeTab === 'structure' 
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  الهيكلية الإقناعية
                </button>
                
                {(dayPlan.type === 'video_script' || dayPlan.type === 'reel_idea') && (
                  <button
                    onClick={() => setActiveTab('shooting')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                      activeTab === 'shooting' 
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Clapperboard className="h-3.5 w-3.5" />
                    طريقة التصوير
                  </button>
                )}

                {dayPlan.type === 'static_post' && (
                  <button
                    onClick={() => setActiveTab('design')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                      activeTab === 'design' 
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    برومت التصميم
                  </button>
                )}
              </div>

              {/* Dynamic Tab Contents */}
              <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 relative min-h-64">
                
                {/* Copied alert toast inside container */}
                {copiedText && (
                  <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-md z-10">
                    <CheckCircle className="h-3 w-3" />
                    تم نسخ {copiedText}!
                  </div>
                )}

                {activeTab === 'hook' && (
                  <div className="space-y-5">
                    {/* Hook element */}
                    <div className="bg-white p-4 rounded-xl border border-dashed border-emerald-500/40 relative">
                      <div className="absolute top-2 left-2 flex gap-1">
                        <button
                          onClick={() => handleCopy(content.hook, 'الخطاف')}
                          className="p-1 bg-slate-50 rounded text-slate-400 hover:text-emerald-600 transition-all"
                          title="نسخ الخطاف"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        الخطاف الفيروسي (Hook)
                      </span>
                      <p className="text-sm font-bold text-slate-800 mt-2 pr-1 leading-relaxed">
                        "{content.hook}"
                      </p>
                    </div>

                    {/* Caption element */}
                    <div className="bg-white p-4 rounded-xl border border-slate-100 relative">
                      <div className="absolute top-3 left-3 flex gap-1">
                        <button
                          onClick={() => handleCopy(content.caption, 'الكابشن')}
                          className="p-1 bg-slate-50 rounded text-slate-400 hover:text-emerald-600 transition-all"
                          title="نسخ الكابشن"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        كابشن المنشور (Caption)
                      </span>
                      <p className="text-xs text-slate-700 mt-3 pr-1 whitespace-pre-wrap leading-relaxed">
                        {content.caption}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'text' && (
                  <div className="bg-white p-4 rounded-xl border border-slate-100 relative">
                    <div className="absolute top-3 left-3 flex gap-1">
                      <button
                        onClick={() => handleCopy(content.fullText, 'النص بالكامل')}
                        className="p-1 bg-slate-50 rounded text-slate-400 hover:text-emerald-600 transition-all"
                        title="نسخ النص الكامل"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-[9px] font-black uppercase text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                      النص الإعلاني بالكامل (Full Body / Dialog)
                    </span>
                    <p className="text-xs text-slate-700 mt-3 whitespace-pre-wrap leading-relaxed">
                      {content.fullText}
                    </p>
                  </div>
                )}

                {activeTab === 'structure' && (
                  <div className="bg-white p-4 rounded-xl border border-slate-100 relative">
                    <div className="absolute top-3 left-3 flex gap-1">
                      <button
                        onClick={() => handleCopy(content.structure, 'الهيكلية')}
                        className="p-1 bg-slate-50 rounded text-slate-400 hover:text-emerald-600 transition-all"
                        title="نسخ الهيكلية"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      البنية النفسية للمنشور (Framework Breakdown)
                    </span>
                    <p className="text-xs text-slate-700 mt-3 whitespace-pre-wrap leading-relaxed">
                      {content.structure}
                    </p>
                  </div>
                )}

                {activeTab === 'shooting' && (
                  <div className="bg-white p-4 rounded-xl border border-slate-100 relative">
                    <div className="absolute top-3 left-3 flex gap-1">
                      <button
                        onClick={() => handleCopy(content.shootingGuidelines || '', 'طرق التصوير')}
                        className="p-1 bg-slate-50 rounded text-slate-400 hover:text-emerald-600 transition-all"
                        title="نسخ طرق التصوير"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-[9px] font-black uppercase text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
                      <Clapperboard className="h-3 w-3" />
                      طرق تصوير الفيديو وإخراج المشاهد (Camera angles & voice control)
                    </span>
                    <p className="text-xs text-slate-700 mt-3 whitespace-pre-wrap leading-relaxed">
                      {content.shootingGuidelines || 'لا توجد إرشادات تصوير مخصصة لهذا المنشور.'}
                    </p>
                  </div>
                )}

                {activeTab === 'design' && (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-100 relative">
                      <div className="absolute top-3 left-3 flex gap-1">
                        <button
                          onClick={() => handleCopy(content.imagePrompt || '', 'البرومت المترجم')}
                          className="p-1 bg-slate-50 rounded text-slate-400 hover:text-emerald-600 transition-all"
                          title="نسخ البرومت"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-[9px] font-black uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
                        <ImageIcon className="h-3 w-3" />
                        برومت توليد الصورة بالذكاء الاصطناعي (Midjourney / DALL-E)
                      </span>
                      <p className="text-xs text-slate-700 mt-3 font-mono dir-ltr select-all bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed text-left">
                        {content.imagePrompt || 'لا يوجد برومت صورة مخصص لهذا البوست.'}
                      </p>
                    </div>
                    <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-100/60 text-xs text-slate-600 flex items-start gap-2.5">
                      <Info className="h-4.5 w-4.5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-800 block mb-0.5">💡 تصميم المحتوى المقترح:</span>
                        إذا كنت ترفع صور منتجك، يصف هذا البرومت شكلاً مشابهاً للمنتج محاطاً بإضاءة وبيئة ملفتة وجذابة للغاية لتناسب التفاعل. انسخ البرومت والصقه في تطبيق Midjourney للحصول على صورة مثالية!
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Copy all and Download controls */}
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <button
                    onClick={downloadReport}
                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4 text-emerald-500" />
                    تنزيل تقرير اليوم بالكامل (.txt)
                  </button>
                  <button
                    onClick={() => {
                      const fullRep = `اليوم: ${dayPlan.day}\nالمنصة: ${dayPlan.platform}\nالعنوان: ${dayPlan.title}\nالخطاف: ${content.hook}\nالكابشن: ${content.caption}\nالنص بالكامل: ${content.fullText}`;
                      handleCopy(fullRep, 'المنشور كاملاً');
                    }}
                    className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                  >
                    <Copy className="h-4 w-4 text-emerald-400" />
                    نسخ كافة تفاصيل المنشور
                  </button>
                </div>
                {loading ? (
                  <div className="py-2.5 flex items-center justify-center gap-2 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold text-slate-500 animate-pulse">
                    <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
                    جاري تحديث المحتوى الإعلاني بالصورة الجديدة...
                  </div>
                ) : (
                  <button
                    onClick={handleGenerate}
                    className="py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-xl text-xs font-bold hover:bg-emerald-100/75 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-emerald-600" />
                    إعادة توليد المحتوى الإعلاني بالكامل (لتطبيق الصورة الجديدة) 🔄
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Empty State / Trigger Generator */
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div className="inline-flex items-center justify-center p-4 bg-emerald-50 text-emerald-500 rounded-3xl mb-4 shadow-inner shadow-emerald-100">
                <Sparkles className="h-10 w-10 animate-bounce" />
              </div>
              <h4 className="text-base font-bold text-slate-800">
                محتوى اليوم غير جاهز بعد!
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed">
                اضغط على الزر أدناه ليقوم محرك الذكاء الاصطناعي المدرب بصياغة الهووك، الكابشن، النص، وطرق التصوير أو التصاميم المبدئية لهذا اليوم فوراً!
              </p>

              {loading ? (
                <div className="mt-8 flex flex-col items-center gap-3">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 animate-pulse">
                    جاري صياغة المحتوى بالمعايير الفيروسية...
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleGenerate}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-200 hover:brightness-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  توليد المحتوى الإعلاني بالكامل 🚀
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
