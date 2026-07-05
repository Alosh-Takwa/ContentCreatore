/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase limits to support base64 image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: Generate 30-Day Strategy and Calendar Outline
app.post('/api/generate-plan', async (req, res) => {
  try {
    const { profile } = req.body;
    if (!profile) {
      return res.status(400).json({ error: 'ملف البراند مطلوب لتوليد الخطة.' });
    }

    const systemInstruction = `أنت خبير تسويق رقمي وكتابة محتوى إعلاني (Copywriter) محترف على مستوى عالمي، متخصص في السوق العربي وبناء الخطط التسويقية لزيادة التفاعل والمبيعات (Viral Marketing).
مهمتك هي بناء خطة محتوى متكاملة لمدة 30 يوماً متواصلة بناءً على معلومات البراند المقدمة من العميل.
يجب توزيع الخطة بذكاء وتوازن بين المنصات التالية:
- فيسبوك (Facebook): منشورات تفاعلية، منشورات سرد قصصي (Storytelling)، بوستات ثابتة (Static Posts) بكابشن دافئ وبناء مجتمع.
- انستغرام (Instagram): ريلز (Reels) تفاعلية، منشورات دائرية (Carousel)، صور ثابتة تركز على الجاذبية البصرية وتثقيف العميل.
- تيك توك (TikTok): ريلز/فيديوهات قصيرة ديناميكية، تحديات، خلف الكواليس، ترندات سريعة تركز على جذب الانتباه في أول ثانيتين.

يجب استخدام وتطبيق إحدى استراتيجيات الكتابة الأكثر انتشاراً (PAS, AIDA, Hook-Story-Offer, Before-After-Bridge) لبناء المحتوى لتلبية نقاط وجع العميل (Pain Points).

يجب أن تقوم بإرجاع الخطة كـ JSON صالح ومطابق تماماً للمواصفات البرمجية المطلوبة.`;

    const prompt = `الرجاء توليد خطة محتوى تسويقية لـ 30 يوماً بناءً على معلومات البراند التالية:
اسم البراند: ${profile.brandName}
المجال: ${profile.industry}
وصف المنتج/الخدمة: ${profile.productDescription}
رسالة البراند وأهدافه: ${profile.mission}
الجمهور المستهدف: ${profile.targetAudience}
نقاط الوجع والتحديات للجمهور: ${profile.painPoints}
لهجة وأسلوب الخطاب (Tone of Voice): ${profile.tone}
الكلمات المفتاحية المفضل تضمينها: ${profile.keywords}
مراجع إضافية أو منشورات منافسة: ${profile.viralReference || "لا توجد"}

التعليمات الهامة:
1. وزع الأيام الـ 30 بحيث تغطي المنصات الثلاثة (facebook, instagram, tiktok).
2. نوع في أنواع المحتوى (static_post, reel_idea, video_script).
3. اجعل لكل يوم عنواناً مميزاً (title)، ومفهوماً محدداً ومبتكراً (concept)، وهدفاً واضحاً (objective) مثل زيادة الوعي، جلب المبيعات، تثقيف العميل، زيادة المتابعين.
4. الخطة يجب أن تكون باللغة العربية بأسلوب جذاب واحترافي يلائم اللهجة المطلوبة وموجه مباشرة لحل المشاكل ونقاط الوجع.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: "خطة المحتوى المكونة من 30 يوماً لوسائل التواصل الاجتماعي",
          items: {
            type: Type.OBJECT,
            properties: {
              day: {
                type: Type.INTEGER,
                description: "رقم اليوم من 1 إلى 30",
              },
              platform: {
                type: Type.STRING,
                description: "المنصة المستهدفة: facebook أو instagram أو tiktok",
              },
              type: {
                type: Type.STRING,
                description: "نوع المحتوى: static_post أو reel_idea أو video_script",
              },
              title: {
                type: Type.STRING,
                description: "عنوان المنشور أو الفكرة الأساسية",
              },
              concept: {
                type: Type.STRING,
                description: "مفهوم وفكرة المنشور بالتفصيل (ماذا سنقدم في هذا اليوم؟)",
              },
              objective: {
                type: Type.STRING,
                description: "هدف المنشور (تفاعل، توعية، بيع، تعليم، إلخ)",
              },
            },
            required: ['day', 'platform', 'type', 'title', 'concept', 'objective'],
          },
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('لم يتم استرجاع استجابة صالحة من النموذج.');
    }

    const plan = JSON.parse(resultText);
    res.json({ plan });
  } catch (error: any) {
    console.error('Error generating plan:', error);
    res.status(500).json({ error: error.message || 'حدث خطأ أثناء توليد خطة الـ 30 يوماً.' });
  }
});

// Endpoint: Generate Full Content Details for a Specific Day/Concept
app.post('/api/generate-content', async (req, res) => {
  try {
    const { profile, dayPlan } = req.body;
    if (!profile || !dayPlan) {
      return res.status(400).json({ error: 'البيانات المرسلة غير مكتملة.' });
    }

    const systemInstruction = `أنت كاتب محتوى إعلاني وتسويقي عبقري وصاحب خبرة في الترويج الفيروسي (Viral Copywriting) على منصات فيسبوك، انستغرام، وتيك توك.
مهمتك توليد المحتوى بالكامل وبدقة فائقة لليوم المحدد بناءً على ملف البراند وفكرة اليوم المحددة.

يجب أن تكون العناصر مولدة بشكل فريد ومخصصة بالكامل لكل منصة ولكل منتج على حدة:
1. هووك قوي (Hook): يشد انتباه القارئ أو المشاهد في أول 3 ثواني ويمنعه من التمرير (Scroll Stopping Hook) ومصمم خصيصاً للمنصة المستهدفة.
2. كابشن ممتع (Caption): نص بوست منسق بشكل جميل باستخدام الرموز التعبيرية الراقية والفقرات المناسبة، متضمناً هاشتاغات قوية ودعوة لاتخاذ إجراء (Call To Action).
3. الهيكلية (Structure): شرح تفصيلي لهيكلية المحتوى ولماذا اخترنا هذا التقسيم (مثل PAS أو AIDA أو غيرها) وكيف تم تطبيقه هنا لجذب القارئ.
4. النص بالكامل (Full Text): النص الكامل المقروء أو المسموع في الفيديو، أو نص التصميم المكتوب داخل الصورة.
5. زوايا وطريقة التصوير (Shooting Guidelines): (مطلوب لجميع المنشورات وخاصة الريلز والفيديوهات): إرشادات خطوة بخطوة مخصصة للمنصة المستهدفة (مثلاً تيك توك: تصوير سيلفي ديناميكي سريع UGC، انستغرام: تصوير احترافي عالي الجودة والجمالية، فيسبوك: تصوير دافئ وتفاعلي).
6. برومت لتوليد الصور (Image Prompt): يجب توليد برومت مخصص ومفصل بالكامل باللغة الإنجليزية ليناسب المنصة المستهدفة بدقة (على سبيل المثال لفيسبوك: صورة واقعية تفاعلية دافئة، لانستجرام: لقطة استوديو فاخرة للمنتج عالي الجودة مع إضاءة سينمائية وتفاصيل بصرية مذهلة، لتيك توك: لقطة سكرين شوت عفوية حية لشخص حقيقي يجرب المنتج). يجب ألا يكون البرومت عاماً أو موحداً، بل يجب كتابة تفاصيل بصرية دقيقة ووصف للألوان وزوايا الكاميرا وموضع المنتج لتوليده في Midjourney أو DALL-E.

إذا أرفق المستخدم صوراً للمنتج، فسنقوم بإرسالها لك لتقوم بتحليلها ودمج شكل ومظهر وتفاصيل المنتج الفعلي في النص والوصف وبرومت الصورة لتكون النتيجة مطابقة لمنتجه الواقعي.`;

    // Construct the parts array for the generative model
    const contents: any[] = [];
    
    // Choose the specific image for this day or fall back to the first brand profile image
    let dayImage = dayPlan.selectedImage;
    if (!dayImage && profile.images && profile.images.length > 0) {
      dayImage = profile.images[0];
    }

    if (dayImage) {
      // Determine correct mimeType if possible, default to image/jpeg
      let mimeType = 'image/jpeg';
      const mimeMatch = dayImage.match(/^data:(image\/\w+);base64,/);
      if (mimeMatch) {
        mimeType = mimeMatch[1];
      }
      const base64Data = dayImage.replace(/^data:image\/\w+;base64,/, "");
      contents.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        }
      });
    }

    const promptMessage = `الرجاء كتابة المحتوى الكامل والتفصيلي لليوم التالي:
اليوم: ${dayPlan.day}
المنصة: ${dayPlan.platform}
النوع: ${dayPlan.type}
العنوان: ${dayPlan.title}
المفهوم الأساسي: ${dayPlan.concept}
الهدف المراد تحقيقه: ${dayPlan.objective}

معلومات البراند:
اسم البراند: ${profile.brandName}
المجال: ${profile.industry}
وصف الخدمة/المنتج: ${profile.productDescription}
الجمهور المستهدف: ${profile.targetAudience}
نقاط الوجع: ${profile.painPoints}
اللهجة المطلوبة: ${profile.tone}
الكلمات المفتاحية: ${profile.keywords}
المنشورات المرجعية الفايرل: ${profile.viralReference || "لا يوجد"}

إذا كان هناك صورة مرفقة، يرجى فحصها بدقة ودمج مواصفات المنتج الظاهر فيها في الهوك والنص الكامل وطرق التصوير، وكتابة برومت توليد الصور بحيث يصف منتجاً مشابهاً للمنتج الواقعي تماماً.`;

    contents.push({ text: promptMessage });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          description: "تفاصيل المحتوى الإعلاني الكامل لليوم المختار",
          properties: {
            hook: {
              type: Type.STRING,
              description: "خطاف لافت للانتباه (Scroll Stopping Hook)",
            },
            caption: {
              type: Type.STRING,
              description: "الكابشن الاحترافي مع الإيموجي والهاشتاغات والـ CTA",
            },
            structure: {
              type: Type.STRING,
              description: "الهيكلية البنائية وسبب استخدامها لإقناع الجمهور",
            },
            fullText: {
              type: Type.STRING,
              description: "النص الكامل والمفصل للبوست أو سكربت الفيديو المقروء",
            },
            shootingGuidelines: {
              type: Type.STRING,
              description: "طرق وتفاصيل التصوير واللقطات وحركة الكاميرا المخصصة للمنصة المستهدفة",
            },
            imagePrompt: {
              type: Type.STRING,
              description: "برومت لتوليد صورة التصميم الإعلاني المخصص باللغة الإنجليزية لتطبيقه في Midjourney مع فكرة التصميم المبدئي",
            },
          },
          required: ['hook', 'caption', 'structure', 'fullText', 'shootingGuidelines', 'imagePrompt'],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('فشل توليد المحتوى التفصيلي لليوم.');
    }

    const contentDetails = JSON.parse(responseText);
    res.json({ content: contentDetails });
  } catch (error: any) {
    console.error('Error generating content details:', error);
    res.status(500).json({ error: error.message || 'حدث خطأ أثناء توليد تفاصيل المنشور.' });
  }
});

// Server-side environment routes for SPA serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
