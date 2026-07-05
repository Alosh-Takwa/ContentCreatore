/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  BookOpen, 
  Plus, 
  Trash2, 
  FileCheck2, 
  Sparkles, 
  MessageSquareCode,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { ViralFramework } from '../types';

interface ViralSwipeFileProps {
  customViralPosts: string[];
  onAddCustomViralPost: (post: string) => void;
  onDeleteCustomViralPost: (index: number) => void;
}

const DEFAULT_FRAMEWORKS: ViralFramework[] = [
  {
    id: 'pas',
    name: 'PAS Framework',
    nameAr: 'إطار الوجع - الإثارة - الحل (PAS)',
    description: 'أقوى إطار لزيادة المبيعات والتحويلات من خلال التركيز على المشكلة أولاً وتكبيرها ثم تقديم الحل كمنقذ.',
    descriptionAr: 'ابدأ بعرض المشكلة التي يواجهها عميلك (Pain)، قم بإثارة مشاعره وتكبير المشكلة من خلال عرض عواقبها الصعبة (Agitate)، ثم قدم منتجك أو خدمتك كحل سحري مريح (Solve).',
    example: 'Tired of back pain? Sitting all day at your desk is slowly ruining your spine alignment. Meet our Orthopedic Memory Foam Cushion—comfort all day.',
    exampleAr: 'هل تعبت من آلام أسفل الظهر يومياً؟ 😩 الجلوس لساعات طويلة على المكتب يضغط على فقراتك ويتلف عمودك الفقري ببطء دون أن تشعر! ولكن، تخيل أن تجلس 8 ساعات متواصلة براحة كاملة دون ذرة ألم واحدة؟ 😍 وسادة الدعم الطبية من ميموري فوم صُممت خصيصاً لتعيد لعمودك الفقري استقامته الصحية...',
    pattern: 'Pain ➡️ Agitate ➡️ Solve'
  },
  {
    id: 'aida',
    name: 'AIDA Framework',
    nameAr: 'إطار جذب الانتباه - الاهتمام - الرغبة - اتخاذ إجراء (AIDA)',
    description: 'الإطار الكلاسيكي المعتمد في صياغة الإعلانات الفيروسية والتأكد من عدم تمرير المستخدم للبوست.',
    descriptionAr: 'اجذب الانتباه بهووك صادم (Attention)، أثر اهتمامهم بحقائق أو قصة مشوقة (Interest)، اخلق رغبة ملحة بذكر الفوائد الحصرية (Desire)، ثم وجههم بخطوة واضحة للشراء أو الطلب (Action).',
    example: 'Stop scrolling! Here is how 90% of creators fail. They don\'t build hooks. We created 50 templates to fix this.',
    exampleAr: 'توقف عن التمرير للحظة! 🛑 هل تعرف لماذا يفشل 95% من صناع المحتوى الجدد في كسب أي متابع؟ لأنهم يهملون "الخطاف" في أول ثانيتين! نحن صممنا لك 50 نموذج خطاف مجاني وعالي الانتشار ليقفز بتفاعلك إلى 10 أضعاف في أسبوع واحد، حمّله الآن من الرابط الحصري...',
    pattern: 'Attention ➡️ Interest ➡️ Desire ➡️ Action'
  },
  {
    id: 'hso',
    name: 'Hook-Story-Offer',
    nameAr: 'الخطاف - القصة - العرض',
    description: 'أفضل إطار للمؤثرين وريلز انستغرام وتيك توك لبناء ثقة عميقة جداً قبل البيع.',
    descriptionAr: 'ابدأ بخطاف يثير الفضول الشديد، ثم شارك قصة ملهمة حقيقية (أو قصة عميل تحول من الفشل للنجاح)، ثم اختم بعرض لا يرفض لمنتجك.',
    example: 'From $0 to $10,000 in 3 months. I was working 12 hours a day until I discovered automated funnels. Get my free guide.',
    exampleAr: 'من ديون خانقة إلى 10,000 دولار شهرياً في 90 يوماً فقط! 💸 كنت أعمل 14 ساعة يومياً بمطعم متعب وأعود منهكاً، حتى اكتشفت سراً صغيراً غير حياتي بالكامل... الآن، وضعت لك دليلي المجاني لتبدأ رحلتك من الصفر دون رأس مال، اضغط على الرابط وسأرسله لك فوراً.',
    pattern: 'Hook ➡️ Story ➡️ Offer'
  },
  {
    id: 'bab',
    name: 'Before-After-Bridge',
    nameAr: 'قبل - بعد - الجسر (BAB)',
    description: 'مثالي لعرض نتائج المنتجات والخدمات التي تحدث تغييراً ملموساً وجذاباً للعين.',
    descriptionAr: 'صف الواقع الحالي السيء للعميل (Before)، ارسم له صورة ذهنية وردية ومثالية لواقعه بعد حل المشكلة (After)، ثم أظهر منتجك كالجسر الواصل بين العالمين (Bridge).',
    example: 'Struggling with slow website loads? Imagine a 100% lighthouse speed score. Our caching plugin is the answer.',
    exampleAr: 'موقعك الإلكتروني يستغرق أكثر من 5 ثوانٍ ليفتح؟ 🐌 تخيل لو أن موقعك يفتح بلمح البصر وبسرعة 100% على جوجل ليضاعف مبيعاتك وأرباحك تلقائياً؟ 😍 إضافة الكاش الاحترافية الخاصة بنا هي الجسر الذهبي الذي يحل هذه الأزمة بضغطة زر واحدة فقط! جربها اليوم...',
    pattern: 'Before ➡️ After ➡️ Bridge'
  }
];

export default function ViralSwipeFile({ 
  customViralPosts, 
  onAddCustomViralPost, 
  onDeleteCustomViralPost 
}: ViralSwipeFileProps) {
  const [newPost, setNewPost] = useState('');
  const [showAddSuccess, setShowAddSuccess] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    onAddCustomViralPost(newPost);
    setNewPost('');
    setShowAddSuccess(true);
    setTimeout(() => setShowAddSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 rtl-grid" dir="rtl">
      {/* Intro Banner */}
      <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-x-12 translate-y-12"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold mb-3">
              <Sparkles className="h-3 w-3 animate-spin" style={{ animationDuration: '3s' }} />
              محرك التدريب المستمر والتأثير الفيروسي
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              مكتبة الهياكل الفايرل والتدريب الإعلاني 📈
            </h2>
            <p className="text-slate-300 text-sm mt-2 max-w-xl leading-relaxed">
              تعتمد أداتنا على علم النفس التسويقي وهندسة الفضول لزيادة انتشار محتواك. يمكنك هنا فحص الأطر المستخدمة لتشكيل خطتك، وإضافة بوستات حقيقية أعجبتك لتدريب الذكاء الاصطناعي عليها باستمرار.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
            <Award className="h-6 w-6 text-yellow-400" />
            <div>
              <p className="text-[10px] text-slate-300">معدل التحويل المتوقع</p>
              <p className="text-sm font-black text-emerald-400">ارتفاع بمعدل +400%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Custom Training Inputs & Standard Frameworks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continuous Training panel */}
        <div className="lg:col-span-1 bg-white border border-slate-100 shadow-xl shadow-slate-100/50 rounded-2xl p-5 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <MessageSquareCode className="h-5 w-5 text-indigo-500" />
              تدريب الأداة على منشوراتك الخاصة
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              انسخ والصق منشورات ناجحة أو ترندات أعجبتك لتجبر الأداة على توليد محتوى مشابه لها بالبنية والتأثير.
            </p>
          </div>

          <form onSubmit={handleAdd} className="space-y-3">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              rows={4}
              placeholder="انسخ البوست الناجح هنا (الكابشن أو الخطاف)..."
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-xs text-slate-800 resize-none leading-relaxed"
            />
            <button
              type="submit"
              disabled={!newPost.trim()}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                newPost.trim()
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Plus className="h-4 w-4" />
              أضف للمخزن التدريبي ✨
            </button>
          </form>

          {/* Success toast */}
          <AnimatePresence>
            {showAddSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl border border-emerald-100 text-xs flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                تمت الإضافة! يتم الآن تدريب الذكاء الاصطناعي بشكل مستمر على البنية الجديدة.
              </motion.div>
            )}
          </AnimatePresence>

          {/* List of Custom Posts */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>المنشورات المضافة حالياً ({customViralPosts.length})</span>
              {customViralPosts.length === 0 && <span className="text-[10px] text-slate-400 font-normal">المخزن فارغ</span>}
            </h4>
            
            <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1 text-xs">
              {customViralPosts.map((post, idx) => (
                <div key={idx} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 relative group">
                  <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed pr-1 pl-6">
                    {post}
                  </p>
                  <button
                    type="button"
                    onClick={() => onDeleteCustomViralPost(idx)}
                    className="absolute top-2.5 left-2.5 text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="حذف من التدريب"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Core frameworks list */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              الأطر البنائية المحملة مسبقاً في المحرك
            </h3>
            <span className="text-xs text-slate-400">خوارزميات الكتابة النفسية الفيروسية</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEFAULT_FRAMEWORKS.map((fw) => (
              <div 
                key={fw.id} 
                className="bg-white border border-slate-100 shadow-md shadow-slate-100/50 rounded-2xl p-5 hover:border-emerald-500/30 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500/20"></div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-slate-800 group-hover:text-emerald-600 transition-colors">
                    {fw.nameAr}
                  </h4>
                  <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                    {fw.pattern}
                  </span>
                </div>
                
                <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                  {fw.descriptionAr}
                </p>

                {/* Example Collapse-Like Box */}
                <div className="mt-4 pt-3.5 border-t border-slate-50 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-700 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <FileCheck2 className="h-3 w-3" />
                    نموذج توضيحي ناجح:
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 italic">
                    "{fw.exampleAr}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
