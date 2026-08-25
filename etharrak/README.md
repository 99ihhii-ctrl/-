# اتحرك (Etharrak)

موقع للمبتدئين في الرياضة يولّد برنامج تمارين ووجبات مخصص بالذكاء الاصطناعي بناءً على بيانات المستخدم.

## التقنيات

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Claude API (`@anthropic-ai/sdk`) لتوليد البرنامج
- ExerciseDB (RapidAPI) لصور GIF التوضيحية للتمارين

## التشغيل محلياً

```bash
npm install
cp .env.example .env.local
# ضع القيم في .env.local:
#   ANTHROPIC_API_KEY=...
#   RAPIDAPI_KEY=...
npm run dev
```

الموقع يفتح على `http://localhost:3000`.

## رحلة المستخدم

1. **الصفحة الرئيسية** (`/`) — تعريف بالموقع وزر "ابدأ مجاناً".
2. **صفحة الفورم** (`/form`) — إدخال البيانات الشخصية مع حاسبة BMI فورية.
3. **شاشة التحميل** (`/generating`) — تستدعي `/api/generate-plan` وتنتظر رد Claude قبل الانتقال.
4. **صفحة النتيجة** (`/result`) — ملف المستخدم، البرنامج الأسبوعي (مع GIF لكل تمرين عبر `/api/exercise`)، وخطة الوجبات، مع أزرار مشاركة وحفظ PDF.

البيانات تُمرَّر بين الصفحات عبر `sessionStorage` (`etharrak_profile` و `etharrak_plan`) بدون الحاجة لقاعدة بيانات في هذه المرحلة.

## متغيرات البيئة

| المتغير | الوصف |
|---|---|
| `ANTHROPIC_API_KEY` | مفتاح Claude API لتوليد البرنامج والوجبات |
| `RAPIDAPI_KEY` | مفتاح RapidAPI للوصول إلى ExerciseDB |

كلا المفتاحين يُستخدمان فقط داخل مسارات API على الخادم (`src/app/api/*`) ولا يصلان للمتصفح.
