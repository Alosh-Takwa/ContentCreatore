/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Campaign, DayPlan, PlatformType, ContentType } from '../types';
import { X, Printer, Sparkles, Calendar, Target, Award, Eye, FileText, Download } from 'lucide-react';

function generatePrintableHTML(campaign: Campaign) {
  const { profile, daysPlan, name } = campaign;
  const completedDays = daysPlan.filter(d => d.status === 'completed');

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

  const formattedDate = new Date().toLocaleDateString('ar-EG', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const tableRows = daysPlan.map(dp => `
    <tr class="border-b border-slate-100 hover:bg-slate-50/50">
      <td class="py-3 px-4 font-extrabold text-slate-900" style="text-align: right;">اليوم ${dp.day}</td>
      <td class="py-3 px-4 font-bold text-slate-700" style="text-align: right;">${getPlatformLabel(dp.platform)}</td>
      <td class="py-3 px-4 text-slate-600" style="text-align: right;">${getContentTypeName(dp.type)}</td>
      <td class="py-3 px-4" style="text-align: right;">
        <p class="font-bold text-slate-800 mb-0.5">${dp.title || ''}</p>
        <p class="text-[10px] text-slate-400">${dp.concept || ''}</p>
      </td>
      <td class="py-3 px-4" style="text-align: right;">
        ${dp.status === 'completed' 
          ? '<span class="text-emerald-600 font-extrabold text-[10px] bg-emerald-50 px-2.5 py-0.5 rounded-full">✓ مكتوب</span>' 
          : '<span class="text-slate-400 text-[10px] bg-slate-50 px-2.5 py-0.5 rounded-full">معلق</span>'}
      </td>
    </tr>
  `).join('');

  const completedDaysSection = completedDays.length === 0 
    ? `
      <div class="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm mt-8">
        <p class="font-bold text-slate-700 text-sm">لم يتم توليد أي محتوى تفصيلي بعد للأيام.</p>
        <p class="text-xs text-slate-400 mt-1">انقر على الأيام في الأجندة الرئيسية وقم بتوليد نصوصها التسويقية لتظهر هنا بالكامل.</p>
      </div>
    `
    : completedDays.map(dp => {
        if (!dp.content) return '';
        const content = dp.content;
        return `
          <div class="page-break bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm mt-8" style="page-break-after: always; break-after: page; text-align: right;">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 mb-6" style="display: flex; justify-content: space-between; align-items: center;">
              <div style="text-align: right;">
                <span class="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full" style="background-color: #ecfdf5; color: #059669; padding: 4px 12px; border-radius: 9999px; font-weight: 900; font-size: 12px;">
                  اليوم ${dp.day}
                </span>
                <h2 class="text-lg md:text-xl font-extrabold text-slate-800" style="margin-top: 10px; font-size: 20px; font-weight: 800;">
                  ${dp.title || ''}
                </h2>
              </div>
              <div class="mt-3 sm:mt-0 flex items-center gap-2" style="display: flex; gap: 8px;">
                <span class="bg-slate-100 text-slate-800 font-bold text-xs px-3 py-1 rounded-xl" style="background-color: #f1f5f9; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700;">
                  المنصة: ${getPlatformLabel(dp.platform)}
                </span>
                <span class="bg-slate-100 text-slate-800 font-bold text-xs px-3 py-1 rounded-xl" style="background-color: #f1f5f9; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700;">
                  النوع: ${getContentTypeName(dp.type)}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-slate-50 p-4 rounded-xl text-xs" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; background-color: #f8fafc; padding: 16px; border-radius: 12px; margin-bottom: 32px; font-size: 12px;">
              <div>
                <strong class="text-slate-500 block mb-1" style="color: #64748b; display: block; margin-bottom: 4px;">الهدف التسويقي:</strong>
                <span class="text-slate-800 font-bold" style="color: #1e293b; font-weight: 700;">${dp.objective || ''}</span>
              </div>
              <div>
                <strong class="text-slate-500 block mb-1" style="color: #64748b; display: block; margin-bottom: 4px;">مفهوم وفكرة اليوم:</strong>
                <span class="text-slate-800 font-bold" style="color: #1e293b; font-weight: 700;">${dp.concept || ''}</span>
              </div>
            </div>

            <div class="space-y-6 text-right" style="display: flex; flex-direction: column; gap: 24px; text-align: right;">
              <div class="border border-indigo-100 rounded-2xl p-5 bg-indigo-50/20" style="border: 1px solid #e0e7ff; background-color: #f5f3ff33; padding: 20px; border-radius: 16px;">
                <h4 class="font-extrabold text-xs text-indigo-700 mb-2" style="color: #4338ca; font-weight: 800; font-size: 12px; margin-bottom: 8px;">⚡ خطاف جذب الانتباه الأولي (Scroll Stopping Hook)</h4>
                <p class="text-slate-800 font-extrabold text-sm leading-relaxed" style="color: #1e293b; font-weight: 800; font-size: 14px; line-height: 1.625;">${content.hook || ''}</p>
              </div>

              <div class="border border-slate-100 rounded-2xl p-5" style="border: 1px solid #f1f5f9; padding: 20px; border-radius: 16px;">
                <h4 class="font-extrabold text-xs text-slate-500 mb-2" style="color: #64748b; font-weight: 800; font-size: 12px; margin-bottom: 8px;">📐 الهيكل الإعلاني المطبق وتكتيك الإقناع (Structure)</h4>
                <p class="text-slate-700 text-xs leading-relaxed whitespace-pre-line" style="color: #334155; font-size: 12px; line-height: 1.625; white-space: pre-line;">${content.structure || ''}</p>
              </div>

              <div class="border border-emerald-100 rounded-2xl p-5 bg-emerald-50/10" style="border: 1px solid #d1fae5; background-color: #ecfdf51a; padding: 20px; border-radius: 16px;">
                <h4 class="font-extrabold text-xs text-emerald-700 mb-2" style="color: #047857; font-weight: 800; font-size: 12px; margin-bottom: 8px;">✍️ الكابشن التسويقي المقترح (Caption)</h4>
                <div class="text-slate-800 text-xs leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-slate-100" style="color: #1e293b; font-size: 12px; line-height: 1.625; white-space: pre-line; background-color: #ffffff; padding: 16px; border-radius: 12px; border: 1px solid #f1f5f9;">${content.caption || ''}</div>
              </div>

              <div class="border border-slate-150 rounded-2xl p-5 bg-slate-50/50" style="border: 1px solid #e2e8f0; background-color: #f8fafc80; padding: 20px; border-radius: 16px;">
                <h4 class="font-extrabold text-xs text-slate-800 mb-2" style="color: #1e293b; font-weight: 800; font-size: 12px; margin-bottom: 8px;">📖 النص الكامل للمنشور / سكربت الفيديو المقروء والمسموع</h4>
                <p class="text-slate-800 text-xs leading-relaxed whitespace-pre-line font-bold" style="color: #0f172a; font-size: 12px; line-height: 1.625; white-space: pre-line; font-weight: 700;">${content.fullText || ''}</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; padding-top: 8px;">
                <div class="border border-dashed border-amber-200 rounded-2xl p-5 bg-amber-50/10" style="border: 1px dashed #fde68a; background-color: #fffbeb1a; padding: 20px; border-radius: 16px;">
                  <h4 class="font-extrabold text-xs text-amber-700 mb-1.5" style="color: #b45309; font-weight: 800; font-size: 12px; margin-bottom: 6px;">🎨 برومت توليد الصور بالذكاء الاصطناعي (Midjourney / DALL-E)</h4>
                  <p class="text-slate-700 text-xs bg-white p-3.5 rounded-xl border border-amber-100 font-mono leading-relaxed" style="color: #334155; font-size: 12px; line-height: 1.625; font-family: monospace; background-color: #ffffff; padding: 14px; border-radius: 12px; border: 1px solid #fef3c7;">${content.imagePrompt || "لا يوجد برومت متاح"}</p>
                </div>

                <div class="border border-slate-200 border-dashed rounded-2xl p-5" style="border: 1px dashed #cbd5e1; padding: 20px; border-radius: 16px;">
                  <h4 class="font-extrabold text-xs text-slate-700 mb-1.5" style="color: #334155; font-weight: 800; font-size: 12px; margin-bottom: 6px;">📹 دليل وطريقة تصوير مشاهد الفيديو والريلز (Shooting Guidelines)</h4>
                  <p class="text-slate-700 text-xs bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-line" style="color: #334155; font-size: 12px; line-height: 1.625; white-space: pre-line; background-color: #ffffff; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0;">${content.shootingGuidelines || "لا يوجد إرشادات تصوير مخصصة"}</p>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>خطة المحتوى لـ ${name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Cairo', sans-serif;
      background-color: #f8fafc;
    }
    @media print {
      body {
        background-color: white !important;
      }
      .no-print {
        display: none !important;
      }
      .page-break {
        page-break-after: always;
        break-after: page;
      }
    }
  </style>
</head>
<body class="p-4 md:p-12 text-right">
  
  <div class="max-w-5xl mx-auto mb-8 bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl no-print">
    <div>
      <h1 class="text-lg font-black" style="font-size: 18px; font-weight: 900;">خطة محتوى 30 يوماً جاهزة للطباعة 📄</h1>
      <p class="text-xs text-slate-400" style="font-size: 12px;">براند: ${profile.brandName} | اضغط على زر "اطبع الآن" لتوليد الـ PDF</p>
    </div>
    <div class="flex items-center gap-3">
      <button onclick="window.print()" class="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs px-6 py-3 rounded-xl transition-all shadow-lg cursor-pointer" style="background-color: #10b981; color: #020617; padding: 12px 24px; border-radius: 12px; font-weight: 900; font-size: 12px;">
        🖨️ اطبع الآن واحفظ كـ PDF
      </button>
    </div>
  </div>

  <div class="max-w-5xl mx-auto space-y-8">
    
    <!-- PAGE 1: COVER -->
    <div class="page-break bg-white border border-slate-200 rounded-3xl p-8 md:p-16 shadow-sm flex flex-col justify-between min-h-[85vh]" style="background-color: white; border: 1px solid #e2e8f0; border-radius: 24px; padding: 64px; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); display: flex; flex-direction: column; justify-content: space-between; min-height: 85vh; page-break-after: always; break-after: page;">
      <div class="text-center space-y-6 my-auto" style="text-align: center; margin-top: auto; margin-bottom: auto;">
        <div class="inline-flex items-center justify-center bg-emerald-50 p-6 rounded-3xl text-emerald-500 text-5xl mb-4" style="font-size: 48px; background-color: #ecfdf5; padding: 24px; border-radius: 24px; color: #10b981; display: inline-flex; margin-bottom: 16px;">
          ✨
        </div>
        <h1 class="text-4xl font-black text-slate-800 leading-tight" style="font-size: 36px; font-weight: 900; line-height: 1.25; color: #1e293b;">الخطة التسويقية الاستراتيجية المتكاملة</h1>
        <p class="text-lg text-emerald-600 font-extrabold bg-emerald-50 inline-block px-5 py-2 rounded-2xl" style="font-size: 18px; color: #059669; font-weight: 800; background-color: #ecfdf5; display: inline-block; padding: 8px 20px; border-radius: 16px;">أجندة المحتوى والإنتاج الفيروسي لـ 30 يوماً</p>
        <div class="h-1.5 w-24 bg-gradient-to-r from-emerald-500 to-teal-400 mx-auto rounded-full my-6" style="height: 6px; width: 96px; background: linear-gradient(to right, #10b981, #2dd4bf); margin-left: auto; margin-right: auto; border-radius: 9999px; margin-top: 24px; margin-bottom: 24px;"></div>
        <div class="text-slate-500 space-y-2 text-sm" style="color: #64748b; font-size: 14px; display: flex; flex-direction: column; gap: 8px;">
          <p class="text-base font-bold" style="font-size: 16px; font-weight: 700; color: #475569;">اسم البراند: <span class="text-slate-800 font-black" style="color: #1e293b; font-weight: 900;">${profile.brandName}</span></p>
          <p>مجال العمل: <span class="text-slate-800 font-semibold" style="color: #1e293b; font-weight: 600;">${profile.industry}</span></p>
          <p>تاريخ التصدير: ${formattedDate}</p>
        </div>
      </div>

      <div class="bg-slate-50 border border-slate-100 rounded-2xl p-6 md:p-8 space-y-4 text-sm mt-8" style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 16px; padding: 32px; display: flex; flex-direction: column; gap: 16px; margin-top: 32px; font-size: 14px;">
        <h3 class="text-base font-extrabold text-slate-800 border-b border-slate-200 pb-3" style="font-size: 16px; font-weight: 800; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; text-align: right;">📌 ملخص الهوية الاستراتيجية للبراند</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-right" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; text-align: right;">
          <div>
            <span class="text-xs font-bold text-slate-400 block mb-1" style="color: #94a3b8; font-size: 12px; font-weight: 700; display: block; margin-bottom: 4px;">رسالة وأهداف البراند:</span>
            <p class="text-slate-700 font-semibold leading-relaxed" style="color: #334155; font-weight: 600; line-height: 1.625;">${profile.mission || ''}</p>
          </div>
          <div>
            <span class="text-xs font-bold text-slate-400 block mb-1" style="color: #94a3b8; font-size: 12px; font-weight: 700; display: block; margin-bottom: 4px;">الجمهور المستهدف:</span>
            <p class="text-slate-700 font-semibold leading-relaxed" style="color: #334155; font-weight: 600; line-height: 1.625;">${profile.targetAudience || ''}</p>
          </div>
          <div style="grid-column: 1 / -1;">
            <span class="text-xs font-bold text-slate-400 block mb-1" style="color: #94a3b8; font-size: 12px; font-weight: 700; display: block; margin-bottom: 4px;">نقاط الوجع والمشاكل الكبرى:</span>
            <p class="text-slate-700 font-semibold leading-relaxed" style="color: #334155; font-weight: 600; line-height: 1.625;">${profile.painPoints || ''}</p>
          </div>
          <div>
            <span class="text-xs font-bold text-slate-400 block mb-1" style="color: #94a3b8; font-size: 12px; font-weight: 700; display: block; margin-bottom: 4px;">وصف المنتجات والخدمات:</span>
            <p class="text-slate-700 font-semibold leading-relaxed" style="color: #334155; font-weight: 600; line-height: 1.625;">${profile.productDescription || ''}</p>
          </div>
          <div>
            <span class="text-xs font-bold text-slate-400 block mb-1" style="color: #94a3b8; font-size: 12px; font-weight: 700; display: block; margin-bottom: 4px;">لهجة وأسلوب الخطاب:</span>
            <p class="text-slate-700 font-semibold leading-relaxed" style="color: #334155; font-weight: 600; line-height: 1.625;">${profile.tone || ''}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- PAGE 2: INDEX -->
    <div class="page-break bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm" style="background-color: white; border: 1px solid #e2e8f0; border-radius: 24px; padding: 48px; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); page-break-after: always; break-after: page; text-align: right;">
      <div class="flex items-center justify-between border-b border-slate-200 pb-5 mb-6" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px;">
        <h2 class="text-xl font-extrabold text-slate-800 flex items-center gap-2" style="font-size: 20px; font-weight: 800; color: #1e293b; display: flex; gap: 8px;">📅 أجندة الخطة التسويقية لـ 30 يوماً</h2>
        <span class="text-xs font-bold text-slate-500" style="font-size: 12px; font-weight: 700; color: #64748b;">المحتوى المنجز: ${completedDays.length} / 30 يوم</span>
      </div>
      <table class="w-full text-right text-xs border-collapse" style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr class="bg-slate-50 text-slate-500 font-black border-b border-slate-200" style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b;">
            <th class="py-3 px-4 w-12 text-right" style="padding: 12px 16px; font-weight: 900; text-align: right;">اليوم</th>
            <th class="py-3 px-4 w-24 text-right" style="padding: 12px 16px; font-weight: 900; text-align: right;">المنصة</th>
            <th class="py-3 px-4 w-28 text-right" style="padding: 12px 16px; font-weight: 900; text-align: right;">النوع</th>
            <th class="py-3 px-4 text-right" style="padding: 12px 16px; font-weight: 900; text-align: right;">عنوان المنشور ومفهومه</th>
            <th class="py-3 px-4 w-24 text-right" style="padding: 12px 16px; font-weight: 900; text-align: right;">الحالة</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100" style="color: #334155;">
          ${tableRows}
        </tbody>
      </table>
    </div>

    <!-- COMPLETED DAYS -->
    ${completedDaysSection}

  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 1000);
    };
  </script>
</body>
</html>`;
}

interface PrintPlanModalProps {
  campaign: Campaign;
  onClose: () => void;
}

export default function PrintPlanModal({ campaign, onClose }: PrintPlanModalProps) {
  const { profile, daysPlan, name } = campaign;
  const [showWarning, setShowWarning] = useState(false);

  const handlePrint = () => {
    try {
      window.print();
      // If we are inside an iframe, browsers block print by default. 
      // We proactively trigger a visual notice to let them download the HTML alternative.
      setShowWarning(true);
    } catch (err) {
      console.error("Print blocked by iframe sandbox constraint:", err);
      setShowWarning(true);
    }
  };

  const handleDownloadHTML = () => {
    const htmlContent = generatePrintableHTML(campaign);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `خطة_محتوى_${name.replace(/\s+/g, '_')}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <div className="flex items-center gap-2 md:gap-2.5 flex-wrap">
            <button
              onClick={handleDownloadHTML}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
              title="تنزيل كملف مستقل وحفظ PDF بجودة كاملة"
            >
              <Download className="h-4 w-4 text-indigo-200" />
              حفظ وتصدير كـ PDF 📄
            </button>
            <button
              onClick={handlePrint}
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              طباعة مباشرة
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
              title="إغلاق"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Sandboxed / Iframe Environment Warning Notice */}
        {showWarning && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3.5 text-amber-900 text-xs font-bold space-y-2 no-print">
            <div className="flex items-center gap-2.5">
              <span className="text-base">⚠️</span>
              <span>تنبيه أمان المتصفح: نظراً لقيود حماية المتصفحات داخل بيئة العرض التجريبية (Iframe Sandbox)، قد يتم حظر نافذة الطباعة التلقائية.</span>
            </div>
            <p className="text-[11px] text-amber-700 pr-7 font-semibold leading-relaxed">
              الحل المضمون 100% هو الضغط على زر <strong className="text-indigo-700">"حفظ وتصدير كـ PDF 📄"</strong> بالأعلى؛ سيقوم بتحميل ملف HTML أنيق ومستقل ومصمم خصيصاً للطباعة الفورية فور فتحه في أي متصفح!
            </p>
          </div>
        )}

        {/* Info Tip - No Print */}
        <div className="bg-slate-50 border-b border-slate-150 px-6 py-3 text-slate-700 text-xs font-bold flex items-center gap-2.5 no-print">
          <Award className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
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
              className="px-5 py-2 rounded-xl text-slate-600 hover:bg-slate-200/50 font-semibold text-xs transition-all cursor-pointer"
            >
              إلغاء وإغلاق
            </button>
            <button
              onClick={handleDownloadHTML}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-100 cursor-pointer"
            >
              <Download className="h-4 w-4 text-indigo-200" />
              تصدير وحفظ PDF (مضمون) 📄
            </button>
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-100 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              طباعة مباشرة
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
