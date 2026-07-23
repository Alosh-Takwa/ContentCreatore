/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

function logToFile(message: string) {
  try {
    fs.appendFileSync('/server.log', `[${new Date().toISOString()}] ${message}\n`);
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
}

function cleanErrorMessage(err: any): string {
  if (!err) return 'حدث خطأ غير متوقع.';
  
  let msg = err.message || String(err);
  
  // Try to parse if it is a stringified JSON (from @google/genai error)
  if (typeof msg === 'string') {
    const trimmed = msg.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.error && parsed.error.message) {
          msg = parsed.error.message;
        } else if (parsed.message) {
          msg = parsed.message;
        }
      } catch (e) {
        // Ignore parsing error
      }
    }
  }
  
  // Translate common Gemini/Google API error messages to beautiful Arabic
  if (msg.includes('experiencing high demand') || msg.includes('503') || msg.includes('UNAVAILABLE')) {
    return 'خوادم الذكاء الاصطناعي تواجه ضغطاً كبيراً حالياً (503). يرجى الانتظار بضع ثوانٍ وإعادة المحاولة ✨';
  }
  if (msg.includes('Quota exceeded') || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
    return 'تم تجاوز الحد الأقصى للطلبات المتاحة حالياً (429). يرجى المحاولة مجدداً بعد دقيقة.';
  }
  if (msg.includes('API key not valid')) {
    return 'مفتاح واجهة برمجة التطبيقات (API Key) غير صالح أو غير مهيأ بشكل صحيح.';
  }
  
  return msg;
}

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
    timeout: 120000, // 2 minutes to prevent fetch failed timeout on large 30-day generations
  },
});

// Endpoint: Generate 30-Day Strategy and Calendar Outline
app.post('/api/generate-plan', async (req, res) => {
  try {
    const { profile } = req.body;
    if (!profile) {
      return res.status(400).json({ error: 'ملف البراند مطلوب لتوليد الخطة.' });
    }

    // Extract selected platforms and content types, default to all if empty
    const selectedPlatforms: string[] = profile.selectedPlatforms && profile.selectedPlatforms.length > 0
      ? profile.selectedPlatforms
      : ['facebook', 'instagram', 'tiktok'];

    const selectedContentTypes: string[] = profile.selectedContentTypes && profile.selectedContentTypes.length > 0
      ? profile.selectedContentTypes
      : ['static_post', 'reel_idea', 'video_script'];

    const platformsStr = selectedPlatforms.join(', ');
    const contentTypesStr = selectedContentTypes.join(', ');

    const systemInstruction = `أنت خبير تسويق رقمي وكتابة محتوى إعلاني (Copywriter) محترف على مستوى عالمي، متخصص في السوق العربي وبناء الخطط التسويقية لزيادة التفاعل والمبيعات (Viral Marketing).
مهمتك هي بناء خطة محتوى متكاملة لمدة 30 يوماً متواصلة بناءً على معلومات البراند والخيارات المحددة من قبل العميل.
يجب توزيع الخطة بذكاء وتوازن بين المنصات التالية فقط: ${platformsStr}
وأنواع المحتوى التالية فقط: ${contentTypesStr}

ملاحظات المنصات:
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
1. وزع الأيام الـ 30 بحيث تغطي المنصات التالية فقط: (${platformsStr}). لا تولد أي يوم خارج هذه المنصات المحددة.
2. نوع في أنواع المحتوى لتكون حصرًا من الخيارات التالية: (${contentTypesStr}). لا تولد أي يوم بنوع محتوى خارج هذه الأنواع المحددة.
3. اجعل لكل يوم عنواناً مميزاً (title)، ومفهوماً محدداً ومبتكراً (concept)، وهدفاً واضحاً (objective) مثل زيادة الوعي، جلب المبيعات، تثقيف العميل، زيادة المتابعين.
4. الخطة يجب أن تكون باللغة العربية بأسلوب جذاب واحترافي يلائم اللهجة المطلوبة وموجه مباشرة لحل المشاكل ونقاط الوجع.
5. صِغ المفاهيم (concept) والعناوين والأهداف بأسلوب واضح ومختصر ومركّز جداً (بحدود سطرين أو ثلاثة كحد أقصى لكل حقل) لتفادي الإطالة وضمان سرعة الاستجابة القصوى.`;

    console.log('API schema to send:', JSON.stringify({
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
            description: `المنصة المستهدفة. يجب أن تكون حصراً واحدة من الخيارات المحددة: ${platformsStr}`,
          },
          type: {
            type: Type.STRING,
            description: `نوع المحتوى. يجب أن يكون حصراً واحداً من الخيارات المحددة: ${contentTypesStr}`,
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
    }, null, 2));

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
                description: `المنصة المستهدفة. يجب أن تكون حصراً واحدة من الخيارات المحددة: ${platformsStr}`,
              },
              type: {
                type: Type.STRING,
                description: `نوع المحتوى. يجب أن يكون حصراً واحداً من الخيارات المحددة: ${contentTypesStr}`,
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
    res.status(500).json({ error: cleanErrorMessage(error) });
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

يجب أن تكون العناصر مولدة بشكل فريد ومخصصة بالكامل لكل منصة ولكل منتج على حدة وبخيارين (طويل ومفصل / مختصر وبسيط):
1. هووك قوي (Hook): يشد انتباه القارئ أو المشاهد في أول 3 ثواني ويمنعه من التمرير (Scroll Stopping Hook) ومصمم خصيصاً للمنصة المستهدفة وهو الخيار الطويل المفصل.
2. هووك مختصر وبسيط (hookShort): خطاف سريع ومباشر للغاية في جملة واحدة مركزة تثير الفضول مباشرة دون إطالة وتعطي الفكرة كاملة باختصار.
3. كابشن ممتع (Caption): نص بوست منسق بشكل جميل باستخدام الرموز التعبيرية الراقية والفقرات المناسبة، متضمناً هاشتاغات قوية ودعوة لاتخاذ إجراء (Call To Action) وهو الخيار الطويل والمفصل.
4. كابشن مختصر وبسيط (captionShort): كابشن مختصر وبسيط جداً يوصل الفكرة كاملة باختصار شديد مع هاشتاج ودعوة سريعة للإجراء (في سطرين أو ثلاثة كحد أقصى).
5. الهيكلية (Structure): شرح تفصيلي لهيكلية المحتوى ولماذا اخترنا هذا التقسيم (مثل PAS أو AIDA أو غيرها) وكيف تم تطبيقه هنا لجذب القارئ.
6. النص بالكامل (Full Text): النص الكامل المقروء أو المسموع في الفيديو، أو نص التصميم المكتوب داخل الصورة.
7. زوايا وطريقة التصوير (Shooting Guidelines): (مطلوب لجميع المنشورات وخاصة الريلز والفيديوهات): إرشادات خطوة بخطوة مخصصة للمنصة المستهدفة (مثلاً تيك توك: تصوير سيلفي ديناميكي سريع UGC، انستغرام: تصوير احترافي عالي الجودة والجمالية، فيسبوك: تصوير دافئ وتفاعلي).
8. برومت لتوليد الصور (Image Prompt): يجب توليد برومت مخصص ومفصل بالكامل باللغة الإنجليزية ليناسب المنصة المستهدفة بدقة (على سبيل المثال لفيسبوك: صورة واقعية تفاعلية دافئة، لانستجرام: لقطة استوديو فاخرة للمنتج عالي الجودة مع إضاءة سينمائية وتفاصيل بصرية مذهلة، لتيك توك: لقطة سكرين شوت عفوية حية لشخص حقيقي يجرب المنتج). يجب ألا يكون البرومت عاماً أو موحداً، بل يجب كتابة تفاصيل بصرية دقيقة ووصف للألوان وزوايا الكاميرا وموضع المنتج لتوليده في Midjourney أو DALL-E.

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
              description: "خطاف لافت للانتباه طويل ومفصل (Scroll Stopping Hook)",
            },
            hookShort: {
              type: Type.STRING,
              description: "خطاف لافت للانتباه مختصر وبسيط للغاية (يعطي الفكرة كاملة باختصار شديد في جملة واحدة مركزة)",
            },
            caption: {
              type: Type.STRING,
              description: "الكابشن الاحترافي الطويل والمفصل مع الإيموجي والهاشتاغات والـ CTA المقنع",
            },
            captionShort: {
              type: Type.STRING,
              description: "كابشن مختصر وبسيط جداً يوصل الفكرة كاملة باختصار شديد مع هاشتاج ودعوة سريعة للإجراء (في سطرين أو ثلاثة كحد أقصى)",
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
          required: ['hook', 'hookShort', 'caption', 'captionShort', 'structure', 'fullText', 'shootingGuidelines', 'imagePrompt'],
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
    res.status(500).json({ error: cleanErrorMessage(error) });
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
