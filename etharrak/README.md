# اتحرك (Etharrak)

موقع للمبتدئين في الرياضة يولّد برنامج تمارين ووجبات مخصص بالذكاء الاصطناعي بناءً على بيانات المستخدم.

## التقنيات

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Google Gemini API (`gemini-1.5-flash`, عبر `fetch` مباشرة) لتوليد البرنامج
- ExerciseDB (RapidAPI) لصور GIF التوضيحية للتمارين

## التشغيل محلياً

```bash
npm install
cp .env.example .env.local
# ضع القيم في .env.local:
#   GEMINI_API_KEY=...
#   RAPIDAPI_KEY=...
npm run dev
```

الموقع يفتح على `http://localhost:3000`.

## رحلة المستخدم

1. **الصفحة الرئيسية** (`/`) — تعريف بالموقع وزر "ابدأ مجاناً".
2. **صفحة الفورم** (`/form`) — إدخال البيانات الشخصية مع حاسبة BMI فورية.
3. **شاشة التحميل** (`/generating`) — تستدعي `/api/generate-plan` وتنتظر رد Gemini قبل الانتقال.
4. **صفحة النتيجة** (`/result`) — ملف المستخدم، البرنامج الأسبوعي (مع GIF لكل تمرين عبر `/api/exercise`)، وخطة الوجبات، مع أزرار مشاركة وحفظ PDF.

البيانات تُمرَّر بين الصفحات عبر `sessionStorage` (`etharrak_profile` و `etharrak_plan`) بدون الحاجة لقاعدة بيانات في هذه المرحلة.

## متغيرات البيئة

| المتغير | الوصف |
|---|---|
| `GEMINI_API_KEY` | مفتاح Google Gemini API لتوليد البرنامج والوجبات |
| `RAPIDAPI_KEY` | مفتاح RapidAPI للوصول إلى ExerciseDB |

كلا المفتاحين يُستخدمان فقط داخل مسارات API على الخادم (`src/app/api/*`) ولا يصلان للمتصفح.
