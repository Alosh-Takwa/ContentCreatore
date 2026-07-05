/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Campaign, DayPlan, PlatformType, ContentType } from '../types';
import { X, Printer, Sparkles, Calendar, Target, Award, Eye, FileText } from 'lucide-react';

interface PrintPlanModalProps {
  campaign: Campaign;
  onClose: () => void;
}

export default function PrintPlanModal({ campaign, onClose }: PrintPlanModalProps) {
  const { profile, daysPlan, name } = campaign;

  const handlePrint = () => {
    window.print();
  };

  const getPlatformLabel = (platform: PlatformType) => {
    switch (platform) {
      case 'facebook': return 'فيسبوك';
      case 'instagram': return 'انستغرام';
      case 'tiktok': return 'تيك توك';
      default: return platform;
    }
  };

  const getContentTypeName = (type: ContentType) => {
    switch (type) {
      case 'video_script': return 'سكربت فيديو';
      case 'reel_idea': return 'فكرة ريلز';
      case 'static_post': return 'بوست صورة';
      default: return type;
    }
  };

  const completedDays = daysPlan.filter(d => d.status === 'completed');

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex flex-col justify-end md:justify-center items-center p-0 md:p-6 text-right rtl-grid" dir="rtl">
      
      {/* Printable Style Injector */}
      <style>{`
        @media print {
          /* Hide everything except the print-report-area */
          body * {
            visibility: hidden;
            background: none !important;
          }
          #print-report-area, #print-report-area * {
            visibility: visible;
          }
          #print-report-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            direction: rtl;
            background: white !important;
            color: #0f172a !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .page-break {
            page-break-after: always;
            break-after: page;
            clear: both;
          }
          .no-print {
            display: none !important;
          }
          .print-border {
            border: 1px solid #cbd5e1 !important;
          }
          .print-bg-gray {
            background-color: #f8fafc !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-bg-emerald {
            background-color: #ecfdf5 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      {/* Modal Container */}
      <div className="bg-white w-full max-w-5xl h-[92vh] md:h-[88vh] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100">
        
        {/* Fixed Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 text-slate-900 p-2 rounded-xl">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm md:text-base">معاينة وتصدير خطة المحتوى كـ PDF 📋</h3>
              <p className="text-[10px] text-slate-400 font-bold">براند: {name} | جاهز للتصدير والطباعة الفورية</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Printer className="h-4 w-4" />
              ابدأ الطباعة والحفظ PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-all"
              title="إغلاق"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Info Tip - No Print */}
        <div className="bg-amber-50 border-b border-amber-100/70 px-6 py-3 text-amber-800 text-xs font-bold flex items-center gap-2.5 no-print">
          <Award className="h-4.5 w-4.5 text-amber-600 shrink-0" />
          <span>ملاحظة: لحفظ الملف بصيغة <strong>PDF</strong>، اختر <strong>"Save as PDF"</strong> أو <strong>"حفظ بتنسيق PDF"</strong> كوجهة طباعة (Destination) من نافذة الطباعة التي ستظهر لك.</span>
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50/50" id="print-report-area">
          
          {/* ================= PAGE 1: COVER PAGE ================= */}
          <div className="page-break bg-white print-border rounded-3xl p-8 md:p-16 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[75vh] md:min-h-[78vh]">
            
            <div className="text-center space-y-6 mt-10">
              <div className="inline-flex items-center justify-center bg-emerald-50 p-5 rounded-3xl text-emerald-500 mb-2">
                <Sparkles className="h-14 w-14 animate-pulse" />
              </div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-tight">
                الخطة التسويقية الاستراتيجية المتكاملة
              </h1>
              <p className="text-lg text-emerald-600 font-extrabold bg-emerald-50/50 inline-block px-4 py-1.5 rounded-2xl">
                أجندة المحتوى والإنتاج الفيروسي لـ 30 يوماً
              </p>
              
              <div className="h-1.5 w-24 bg-gradient-to-r from-emerald-500 to-teal-400 mx-auto rounded-full my-6"></div>
              
              <div className="text-slate-500 space-y-1">
                <p className="text-sm font-bold">اسم البراند: <span className="text-slate-800 font-black">{profile.brandName}</span></p>
                <p className="text-sm">مجال العمل: <span className="text-slate-800 font-semibold">{profile.industry}</span></p>
                <p className="text-xs">تاريخ التصدير: {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            {/* Strategy Profile Details */}
            <div className="mt-12 bg-slate-50 border border-slate-100 rounded-2xl p-6 md:p-8 space-y-6 print-bg-gray">
              <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-200 pb-3">📌 ملخص الهوية الاستراتيجية للبراند</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-xs font-bold text-slate-400 block mb-1">رسالة وأهداف البراند:</span>
                  <p className="text-slate-700 font-semibold leading-relaxed">{profile.mission}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block mb-1">الجمهور المستهدف:</span>
                  <p className="text-slate-700 font-semibold leading-relaxed">{profile.targetAudience}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-xs font-bold text-slate-400 block mb-1">نقاط الوجع والمشاكل الكبرى (Pain Points):</span>
                  <p className="text-slate-700 font-semibold leading-relaxed">{profile.painPoints}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block mb-1">وصف المنتجات والخدمات:</span>
                  <p className="text-slate-700 font-semibold leading-relaxed">{profile.productDescription}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block mb-1">لهجة وأسلوب الخطاب (Tone):</span>
                  <p className="text-slate-700 font-semibold leading-relaxed">{profile.tone}</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-10 text-xs text-slate-400 font-semibold border-t border-slate-100 pt-6">
              تم التوليد والتخطيط الذكي بواسطة الاستوديو الإعلاني الذكي لجدولة محتوى 30 يوماً
            </div>
          </div>

          {/* ================= PAGE 2: INDEX & ROADMAP ================= */}
          <div className="page-break bg-white print-border rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 mt-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
              <div className="flex items-center gap-2.5">
                <Calendar className="h-6 w-6 text-emerald-500" />
                <h2 className="text-xl font-extrabold text-slate-800">أجندة الخطة التسويقية الشاملة لـ 30 يوماً</h2>
              </div>
              <div className="text-xs font-bold text-slate-500">
                محتوى منجز ومكتوب: {completedDays.length} / 30 يوم
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              يوضح الجدول التالي توزيع المنشورات والأفكار عبر الأيام الـ 30، مستهدفاً قنوات التواصل الاجتماعي المتعددة لتحقيق التفاعل المتوازن وبناء الثقة التدريجية مع العملاء من قمع التسويق الكامل.
            </p>

            <div className="overflow-x-auto print-border rounded-xl">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-black border-b border-slate-200 print-bg-gray">
                    <th className="py-3 px-4 w-12">اليوم</th>
                    <th className="py-3 px-4 w-24">المنصة</th>
                    <th className="py-3 px-4 w-28">النوع</th>
                    <th className="py-3 px-4">عنوان المنشور ومفهومه</th>
                    <th className="py-3 px-4 w-24">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {daysPlan.map((dp) => (
                    <tr key={dp.day} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-extrabold text-slate-900">اليوم {dp.day}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-700">
                          {getPlatformLabel(dp.platform)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-600">
                          {getContentTypeName(dp.type)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800 mb-0.5">{dp.title}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{dp.concept}</p>
                      </td>
                      <td className="py-3 px-4">
                        {dp.status === 'completed' ? (
                          <span className="text-emerald-600 font-extrabold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full print-bg-emerald">✓ مكتوب</span>
                        ) : (
                          <span className="text-slate-400 text-[10px] bg-slate-50 px-2 py-0.5 rounded-full">خطوة معلقة</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================= PAGE 3+: COMPLETED DAYS DETAILED SCRIPTS ================= */}
          {completedDays.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm mt-8 no-print">
              <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 text-sm">لم يتم توليد أي محتوى تفصيلي بعد للأيام.</h3>
              <p className="text-xs text-slate-400 mt-1">انقر على الأيام في الأجندة الرئيسية وقم بتوليد نصوصها التسويقية لتظهر هنا بالكامل جاهزة للطباعة.</p>
            </div>
          ) : (
            completedDays.map((dp) => {
              if (!dp.content) return null;
              const content = dp.content;
              return (
                <div key={`print-day-${dp.day}`} className="page-break bg-white print-border rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 mt-8">
                  
                  {/* Day Header Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-150 pb-5 mb-6">
                    <div>
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full print-bg-emerald">
                        اليوم {dp.day}
                      </span>
                      <h2 className="text-lg md:text-xl font-extrabold text-slate-800 mt-2.5">
                        {dp.title}
                      </h2>
                    </div>
                    
                    <div className="mt-3 sm:mt-0 flex items-center gap-2">
                      <span className="bg-slate-100 text-slate-800 font-bold text-xs px-3 py-1 rounded-xl print-bg-gray">
                        المنصة: {getPlatformLabel(dp.platform)}
                      </span>
                      <span className="bg-slate-100 text-slate-800 font-bold text-xs px-3 py-1 rounded-xl print-bg-gray">
                        النوع: {getContentTypeName(dp.type)}
                      </span>
                    </div>
                  </div>

                  {/* Objective & Concept */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-slate-50 p-4 rounded-xl text-xs print-bg-gray">
                    <div>
                      <strong className="text-slate-500 block mb-1">الهدف التسويقي:</strong>
                      <span className="text-slate-800 font-bold">{dp.objective}</span>
                    </div>
                    <div>
                      <strong className="text-slate-500 block mb-1">مفهوم وفكرة اليوم:</strong>
                      <span className="text-slate-800 font-bold">{dp.concept}</span>
                    </div>
                  </div>

                  {/* Full Copywriting Layout */}
                  <div className="space-y-6">
                    
                    {/* Hook Section */}
                    <div className="border border-indigo-100 rounded-2xl p-5 bg-indigo-50/20">
                      <h4 className="font-extrabold text-xs text-indigo-700 mb-2 flex items-center gap-1.5">
                        ⚡ خطاف جذب الانتباه الأولي (Scroll Stopping Hook)
                      </h4>
                      <p className="text-slate-800 font-extrabold text-sm leading-relaxed">
                        {content.hook}
                      </p>
                    </div>

                    {/* Marketing Structure Explanation */}
                    <div className="border border-slate-100 rounded-2xl p-5">
                      <h4 className="font-extrabold text-xs text-slate-500 mb-2">
                        📐 الهيكل الإعلاني المطبق وتكتيك الإقناع (Structure)
                      </h4>
                      <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-line">
                        {content.structure}
                      </p>
                    </div>

                    {/* Caption Section */}
                    <div className="border border-emerald-100 rounded-2xl p-5 bg-emerald-50/10">
                      <h4 className="font-extrabold text-xs text-emerald-700 mb-2">
                        ✍️ الكابشن التسويقي المقترح (Caption)
                      </h4>
                      <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-line bg-white/60 p-4 rounded-xl border border-slate-100">
                        {content.caption}
                      </p>
                    </div>

                    {/* Full Content Text / Script */}
                    <div className="border border-slate-150 rounded-2xl p-5 bg-slate-50/50 print-bg-gray">
                      <h4 className="font-extrabold text-xs text-slate-800 mb-2">
                        📖 النص الكامل للمنشور / سكربت الفيديو المقروء والمسموع
                      </h4>
                      <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-line font-bold">
                        {content.fullText}
                      </p>
                    </div>

                    {/* Two-Column Platform Specific Prompts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                      
                      {/* Unique Image Prompt for this specific platform and product */}
                      <div className="border border-dashed border-amber-200 rounded-2xl p-5 bg-amber-50/10">
                        <h4 className="font-extrabold text-xs text-amber-700 mb-1.5 flex items-center gap-1">
                          🎨 برومت توليد الصور بالذكاء الاصطناعي (Midjourney / DALL-E)
                        </h4>
                        <p className="text-[10px] text-amber-600 font-bold mb-3">
                          مخصص ومصمم ليناسب جهاز ونوع قنوات {getPlatformLabel(dp.platform)} للمنتج المحدد:
                        </p>
                        <p className="text-slate-700 text-xs bg-white p-3.5 rounded-xl border border-amber-100 font-mono select-all select-text leading-relaxed">
                          {content.imagePrompt || "لا يوجد برومت متاح"}
                        </p>
                      </div>

                      {/* Unique Camera Shooting Guidelines */}
                      <div className="border border-slate-200 border-dashed rounded-2xl p-5">
                        <h4 className="font-extrabold text-xs text-slate-700 mb-1.5">
                          📹 دليل وطريقة تصوير مشاهد الفيديو والريلز (Shooting Guidelines)
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold mb-3">
                          توجيهات مخصصة لزوايا الكاميرا وطريقة التقديم وحركات لغة الجسد:
                        </p>
                        <p className="text-slate-700 text-xs bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-line">
                          {content.shootingGuidelines || "لا يوجد إرشادات تصوير مخصصة"}
                        </p>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })
          )}

        </div>

        {/* Modal Footer / Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between no-print">
          <p className="text-xs text-slate-400 font-bold">
            عدد الصفحات الإجمالي المقدر للطباعة: {completedDays.length > 0 ? completedDays.length + 2 : 2} صفحات
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-slate-600 hover:bg-slate-200/50 font-bold text-xs transition-all"
            >
              إلغاء وإغلاق
            </button>
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-100"
            >
              <Printer className="h-4 w-4" />
              تأكيد وحفظ الخطة كاملة (PDF)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
