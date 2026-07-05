/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Award, 
  Trash2, 
  RotateCcw, 
  Sparkles, 
  ChevronRight, 
  Facebook, 
  Instagram, 
  Compass, 
  Clapperboard, 
  Image as ImageIcon, 
  FileCheck2, 
  CheckCircle, 
  TrendingUp, 
  Users,
  Settings,
  HelpCircle,
  Lightbulb,
  Briefcase
} from 'lucide-react';
import { BrandProfile, DayPlan, GeneratedContent, Campaign } from '../types';
import ContentGenerator from './ContentGenerator';
import ViralSwipeFile from './ViralSwipeFile';
import PrintPlanModal from './PrintPlanModal';

interface DashboardProps {
  activeCampaign: Campaign;
  campaigns: Campaign[];
  onSwitchCampaign: (id: string) => void;
  onAddCampaign: () => void;
  onDeleteCampaign: (id: string) => void;
  onUpdateCampaignPlan: (campaignId: string, updatedPlan: DayPlan[]) => void;
  customViralPosts: string[];
  onAddCustomViralPost: (post: string) => void;
  onDeleteCustomViralPost: (index: number) => void;
}

const LOADING_STEPS = [
  "جاري دراسة الجمهور المستهدف ومشاكله الكبرى...",
  "جاري اختيار الهياكل النفسية الفايرل المثلى (PAS/AIDA)...",
  "جاري توزيع المنشورات والريلز على الأيام الـ 30 بذكاء...",
  "جاري صياغة عناوين تسويقية ذكية ومفاهيم الأيام لـ 3 منصات...",
  "الخطة الاستراتيجية أصبحت جاهزة تماماً لإطلاق مبيعاتك!"
];

export default function Dashboard({ 
  activeCampaign,
  campaigns,
  onSwitchCampaign,
  onAddCampaign,
  onDeleteCampaign,
  onUpdateCampaignPlan,
  customViralPosts,
  onAddCustomViralPost,
  onDeleteCustomViralPost 
}: DashboardProps) {
  const profile = activeCampaign.profile;
  const daysPlan = activeCampaign.daysPlan;

  const [activeTab, setActiveTab] = useState<'calendar' | 'swipe_file'>('calendar');
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [selectedDayPlan, setSelectedDayPlan] = useState<DayPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Cycle through loading steps when generating plan
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (generatingPlan) {
      interval = setInterval(() => {
        setLoadingStepIdx((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 3500);
    } else {
      setLoadingStepIdx(0);
    }
    return () => clearInterval(interval);
  }, [generatingPlan]);

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'فشل توليد الخطة الاستراتيجية.');
      }

      const data = await res.json();
      
      // Parse days plan and structure them cleanly
      const structuredPlan: DayPlan[] = data.plan.map((item: any) => ({
        day: item.day,
        platform: item.platform,
        type: item.type,
        title: item.title,
        concept: item.concept,
        objective: item.objective,
        status: 'pending'
      }));

      // Sort by day number to be sure
      structuredPlan.sort((a, b) => a.day - b.day);

      onUpdateCampaignPlan(activeCampaign.id, structuredPlan);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ غير متوقع أثناء تصميم خطة الـ 30 يوماً. الرجاء المحاولة مجدداً.');
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleContentGenerated = (dayNum: number, content: GeneratedContent) => {
    const updatedPlans = daysPlan.map(dp => {
      if (dp.day === dayNum) {
        return {
          ...dp,
          status: 'completed' as const,
          content: content
        };
      }
      return dp;
    });

    onUpdateCampaignPlan(activeCampaign.id, updatedPlans);
    
    // Update active viewed day if it's currently open
    if (selectedDayPlan && selectedDayPlan.day === dayNum) {
      setSelectedDayPlan(updatedPlans.find(dp => dp.day === dayNum) || null);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Facebook className="h-4.5 w-4.5 text-blue-600" />;
      case 'instagram': return <Instagram className="h-4.5 w-4.5 text-pink-600" />;
      case 'tiktok': return <Compass className="h-4.5 w-4.5 text-slate-800" />;
      default: return <Sparkles className="h-4.5 w-4.5 text-emerald-500" />;
    }
  };

  const getPlatformClass = (platform: string) => {
    switch (platform) {
      case 'facebook': return 'border-blue-100 hover:border-blue-400 bg-blue-50/10';
      case 'instagram': return 'border-pink-100 hover:border-pink-400 bg-pink-50/10';
      case 'tiktok': return 'border-slate-200 hover:border-slate-500 bg-slate-50/15';
      default: return 'border-emerald-100 hover:border-emerald-400 bg-emerald-50/10';
    }
  };

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case 'facebook': return 'bg-blue-50 text-blue-700';
      case 'instagram': return 'bg-pink-50 text-pink-700';
      case 'tiktok': return 'bg-slate-100 text-slate-800';
      default: return 'bg-emerald-50 text-emerald-800';
    }
  };

  const getContentTypeBadge = (type: string) => {
    switch (type) {
      case 'video_script': return 'سكربت فيديو';
      case 'reel_idea': return 'فكرة ريلز';
      case 'static_post': return 'بوست صورة';
      default: return type;
    }
  };

  // Stats calculation
  const totalDays = daysPlan.length;
  const completedCount = daysPlan.filter(dp => dp.status === 'completed').length;
  const facebookCount = daysPlan.filter(dp => dp.platform === 'facebook').length;
  const instagramCount = daysPlan.filter(dp => dp.platform === 'instagram').length;
  const tiktokCount = daysPlan.filter(dp => dp.platform === 'tiktok').length;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 rtl-grid" dir="rtl">
      {/* Top Banner Workspace Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm shadow-slate-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo/Identity */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 text-white p-2.5 rounded-xl shadow-md shadow-emerald-200/50">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-800 leading-tight">مسوّق الذكاء الاصطناعي 🚀</h1>
                <p className="text-[10px] text-slate-400 font-bold">بوابة محتوى الـ 30 يوماً الأكثر مبيعاً</p>
              </div>
            </div>

            {/* Middle Nav Tab */}
            <div className="flex bg-slate-100 p-1.5 rounded-xl">
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'calendar' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                الخطة الاستراتيجية (30 يوماً)
              </button>
              <button
                onClick={() => setActiveTab('swipe_file')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'swipe_file' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Award className="h-3.5 w-3.5 text-indigo-500" />
                مكتبة الفايرل والتدريب 📈
              </button>
            </div>

            {/* Active Brand Selector with dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 transition-all text-right cursor-pointer"
              >
                <div className="hidden md:block">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    البراند النشط ▾
                  </span>
                  <p className="text-xs font-extrabold text-slate-700 mt-0.5">{profile.brandName}</p>
                </div>
                <div className="md:hidden flex items-center gap-1 text-xs font-black text-slate-700">
                  <span>{profile.brandName}</span>
                  <span className="text-[10px] text-slate-400">▾</span>
                </div>
              </button>

              {showBrandDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowBrandDropdown(false)} />
                  <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-150 shadow-2xl rounded-2xl p-2.5 z-50 text-right">
                    <p className="text-[10px] font-black text-slate-400 px-2.5 py-1 bg-slate-50 rounded-lg mb-1.5">
                      اختر البراند أو الحملة النشطة:
                    </p>
                    <div className="max-h-60 overflow-y-auto space-y-0.5">
                      {campaigns.map((c) => (
                        <div 
                          key={c.id}
                          className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                            c.id === activeCampaign.id 
                              ? 'bg-emerald-50/70 border border-emerald-100' 
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <button
                            onClick={() => {
                              onSwitchCampaign(c.id);
                              setShowBrandDropdown(false);
                            }}
                            className="flex-1 text-right text-xs font-bold text-slate-700 pr-1"
                          >
                            {c.name}
                          </button>
                          {campaigns.length > 1 && (
                            <button
                              onClick={() => {
                                onDeleteCampaign(c.id);
                                setShowBrandDropdown(false);
                              }}
                              className="p-1 hover:text-rose-600 text-slate-400 transition-colors cursor-pointer"
                              title="حذف هذا البراند"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-slate-100 my-2 pt-2">
                      <button
                        onClick={() => {
                          onAddCampaign();
                          setShowBrandDropdown(false);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-black text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-dashed border-emerald-200 cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5 rotate-45 text-emerald-500" />
                        إضافة براند أو حملة جديدة
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'swipe_file' ? (
            <motion.div
              key="swipe"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <ViralSwipeFile
                customViralPosts={customViralPosts}
                onAddCustomViralPost={onAddCustomViralPost}
                onDeleteCustomViralPost={onDeleteCustomViralPost}
              />
            </motion.div>
          ) : (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* If no plan generated yet */}
              {daysPlan.length === 0 ? (
                <div className="bg-white border border-slate-100 shadow-xl shadow-slate-100/50 rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto">
                  <div className="inline-flex items-center justify-center bg-emerald-50 p-4 rounded-3xl text-emerald-500 mb-6 shadow-inner">
                    <Calendar className="h-10 w-10 animate-pulse" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-800">صمّم خطة محتوى متكاملة لمدة 30 يوماً 🗓️</h2>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                    بناءً على معلومات البراند الخاص بك (<span className="text-slate-700 font-bold">{profile.brandName}</span>)، سنقوم بهندسة خطة توزيع ذكية عبر الأيام الـ 30 تركز على منصات التواصل الكبرى وحل مشاكل عملائك الحقيقية.
                  </p>

                  {/* Image uploaded reminder */}
                  {profile.images.length > 0 && (
                    <div className="mt-4 inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-xl text-xs text-indigo-700">
                      <ImageIcon className="h-4 w-4" />
                      <span>تم ربط <strong>{profile.images.length} صور منتجات</strong> بنجاح وسيتم دمجها في صياغة منشوراتك!</span>
                    </div>
                  )}

                  {error && (
                    <div className="bg-rose-50 text-rose-700 p-3 rounded-xl border border-rose-100 text-xs mt-4">
                      {error}
                    </div>
                  )}

                  {generatingPlan ? (
                    <div className="mt-8 flex flex-col items-center gap-3">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                      </div>
                      <span className="text-sm font-bold text-slate-700 animate-pulse mt-2 block">
                        {LOADING_STEPS[loadingStepIdx]}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">قد يستغرق التخطيط الكامل دقيقة واحدة كأقصى حد...</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleGeneratePlan}
                      className="mt-8 px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold rounded-2xl shadow-xl shadow-emerald-200/50 hover:brightness-105 active:scale-95 transition-all text-sm flex items-center gap-2 mx-auto"
                    >
                      <Sparkles className="h-5 w-5" />
                      توليد الخطة الاستراتيجية لـ 30 يوماً ✨
                    </button>
                  )}
                </div>
              ) : (
                /* Plan Generated Workspace */
                <div className="space-y-6">
                  
                  {/* Campaign Stats Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border border-slate-100 shadow-md rounded-2xl p-4">
                    
                    <div className="flex items-center gap-3 p-2">
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">الجدول الكلي</span>
                        <span className="text-sm font-black text-slate-800">{totalDays} يوماً متتالياً</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2 border-r border-slate-100">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">محتوى جاهز للاستخدام</span>
                        <span className="text-sm font-black text-slate-800">{completedCount} من {totalDays}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2 border-r border-slate-100">
                      <div className="p-2.5 bg-slate-50 text-slate-700 rounded-xl">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">معدل استهداف الوجع</span>
                        <span className="text-sm font-black text-emerald-600">100% دقيق ومبني</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2 border-r border-slate-100">
                      <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">توزيع قنوات السوشيال</span>
                        <span className="text-[11px] font-bold text-slate-600 block mt-0.5 leading-none">
                          {facebookCount} فيسبوك | {instagramCount} انستغرام | {tiktokCount} تيك توك
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Plan Grid Title & Helper */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FileCheck2 className="h-5 w-5 text-emerald-500" />
                        أجندة المحتوى لـ 30 يوماً
                      </h3>
                      <p className="text-xs text-slate-400">انقر على أي يوم لفتح تفاصيل المنشور بالكامل وصياغة محتواه الإعلاني بالذكاء الاصطناعي.</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => setShowPrintModal(true)}
                        className="text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/10 cursor-pointer"
                      >
                        <Award className="h-4 w-4 text-white" />
                        تصدير الخطة كاملة PDF 📄
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('هل أنت متأكد من رغبتك في مسح الخطة الحالية وإعادة توليد خطة جديدة بالكامل؟')) {
                            onUpdateCampaignPlan(activeCampaign.id, []);
                          }
                        }}
                        className="text-xs font-bold text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 px-3 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        إعادة تعيين الخطة
                      </button>
                    </div>
                  </div>

                  {/* 30 Day Calendar Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {daysPlan.map((dp) => {
                      const isCompleted = dp.status === 'completed';
                      return (
                        <div
                          key={dp.day}
                          onClick={() => setSelectedDayPlan(dp)}
                          className={`border rounded-2xl p-4 text-right cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between h-40 ${getPlatformClass(dp.platform)} ${
                            isCompleted 
                              ? 'shadow-md shadow-emerald-50 border-emerald-200' 
                              : 'shadow-sm shadow-slate-100 hover:shadow-md hover:scale-[1.02]'
                          }`}
                        >
                          {/* Top part */}
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-slate-800">اليوم {dp.day}</span>
                              <div className="flex items-center gap-1">
                                {getPlatformIcon(dp.platform)}
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${getPlatformBadge(dp.platform)}`}>
                                  {getContentTypeBadge(dp.type)}
                                </span>
                              </div>
                            </div>

                            <h4 className="text-xs font-bold text-slate-800 mt-3 line-clamp-2 leading-relaxed">
                              {dp.title}
                            </h4>
                          </div>

                          {/* Bottom part */}
                          <div className="border-t border-slate-100/80 pt-2.5 flex items-center justify-between mt-2">
                            <span className="text-[10px] text-slate-400 font-medium line-clamp-1 flex-1 pr-1">
                              الهدف: {dp.objective}
                            </span>
                            
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <CheckCircle className="h-3 w-3 text-emerald-500" />
                                جاهز
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                معلق
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Slide-over Content Viewer Component */}
      <AnimatePresence>
        {selectedDayPlan && (
          <ContentGenerator
            dayPlan={selectedDayPlan}
            profile={profile}
            customViralPosts={customViralPosts}
            onContentGenerated={handleContentGenerated}
            onClose={() => setSelectedDayPlan(null)}
          />
        )}
      </AnimatePresence>

      {/* Full 30-Day Strategy PDF Print Preview Modal */}
      {showPrintModal && (
        <PrintPlanModal
          campaign={activeCampaign}
          onClose={() => setShowPrintModal(false)}
        />
      )}

    </div>
  );
}
