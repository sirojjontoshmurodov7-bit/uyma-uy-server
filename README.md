# Uy-bozor — Ko'chmas mulk marketplace

Sotuv (`SALE`) va ijara (`RENT`) e'lonlari platformasi. Foydalanuvchilar e'lonlarni ko'radi, qidiradi va filterlaydi, sevimlilarga saqlaydi va sotuvchiga murojaat yuboradi. Sotuvchi o'z e'lonlarini va ularga kelgan murojaatlarni boshqaradi. Admin yangi e'lonlarni moderatsiya qiladi (`PENDING` → `APPROVED` / `REJECTED`).

Loyiha ikki qismdan iborat: **NestJS + PostgreSQL + Prisma backend** va unga haqiqiy API orqali ulanadigan **React frontend** (mock data yo'q).

## Havolalar

| | Havola |
| --- | --- |
| Frontend (jonli) | https://frontend-eta-smoky-54.vercel.app |
| Backend (jonli) | https://uyma-uy-server-production.up.railway.app |
| Swagger (API hujjati) | https://uyma-uy-server-production.up.railway.app/docs |
| Frontend GitHub | https://github.com/abduvohidi683-pn/uyma-uy-frontend |
| Backend GitHub | https://github.com/sirojjontoshmurodov7-bit/uyma-uy-server |

## Jamoa va hissalar

| A'zo | Qism | Hissasi |
| --- | --- | --- |
| **Toshmurodov Sirojjon** | Backend | NestJS loyiha tuzilmasi, Prisma schema va migratsiya, Auth (JWT, bcrypt, guard'lar, rollar), Users, Categories, Properties (CRUD, filter, sort, pagination, egalik tekshiruvi), Images (Multer), Favorites, Inquiries, Admin, validatsiya va xatolarni qayta ishlash, Railway'ga deploy |
| **Abduvoxid Iskandarov** | Frontend | React + TypeScript frontend: sahifalar, routing, API integratsiya, dizayn, i18n, Vercel'ga deploy (Abdulazim bilan birga) |
| **Abdulazim Abdullayev** | Frontend | React + TypeScript frontend: sahifalar, routing, API integratsiya, dizayn, i18n, Vercel'ga deploy (Abduvoxid bilan birga) |

## Stack

**Backend**

- NestJS 12, TypeScript
- PostgreSQL + Prisma ORM 6
- JWT (`@nestjs/jwt`) va bcrypt (parol hash'lash)
- class-validator / class-transformer (DTO validatsiya, `whitelist` + `forbidNonWhitelisted`)
- Multer (rasm yuklash) va `@nestjs/serve-static` (`/uploads`)
- Vitest (unit va e2e testlar), oxlint

**Frontend**

- React 19 + TypeScript, Vite
- Tailwind CSS v4 (dizayn tokenlari: `src/tokens.css`)
- React Router (sahifalar `lazy` bilan alohida bo'lak sifatida yuklanadi; guard'lar: `ProtectedRoute`, `AdminGuard`)
- Axios (JWT interceptor, 401 bo'lsa login sahifasiga yo'naltirish)
- lucide-react (ikonlar)
- O'zimiz yozgan yengil i18n tizimi (qo'shimcha kutubxonasiz): **UZ / RU / EN**
- Yorug' / qorong'u rejim (tanlov `localStorage`'da saqlanadi)

**Deploy:** backend va PostgreSQL — Railway, frontend — Vercel.

## Arxitektura (qisqacha)

```mermaid
flowchart LR
    B[Brauzer] -->|HTTPS| F[React SPA<br/>Vercel]
    F -->|REST + Bearer JWT| A[NestJS API<br/>Railway]
    A -->|Prisma| D[(PostgreSQL)]
    A -->|Multer| U[/uploads<br/>Railway Volume/]
    B -->|GET /uploads/...| A
```

Backend modullari: `auth`, `users`, `categories`, `properties` (rasmlar bilan), `favorites`, `inquiries`, `admin`, `prisma`.

- JWT `Authorization: Bearer <token>` sarlavhasida yuboriladi; himoyalangan route'larda JWT guard, admin route'larda rol guard'i ishlaydi.
- Parollar bcrypt bilan hash'lanib, `passwordHash` maydonida saqlanadi.
- Barcha kiruvchi so'rovlar DTO va global `ValidationPipe` orqali tekshiriladi.
- Rasmlar diskka (`uploads/properties/`) saqlanadi, bazada faqat URL yoziladi. Frontend rasm manzilini `VITE_API_URL + image.url` shaklida yasaydi.

## ER diagramma

```mermaid
erDiagram
    User ||--o{ Property : "ega (ownerId)"
    User ||--o{ Favorite : saqlaydi
    User ||--o{ Inquiry : yuboradi
    Category ||--o{ Property : "kategoriya"
    Property ||--o{ PropertyImage : "rasmlar"
    Property ||--o{ Favorite : ""
    Property ||--o{ Inquiry : ""

    User {
        int id PK
        string fullName
        string email UK
        string passwordHash
        string phone
        Role role "USER | ADMIN"
        datetime createdAt
    }
    Category {
        int id PK
        string name UK
        string slug UK
    }
    Property {
        int id PK
        string title
        string description
        float price
        string currency "USD"
        ListingType listingType "SALE | RENT"
        PropertyStatus status "PENDING | APPROVED | REJECTED"
        string address
        string city
        float area
        int rooms
        int bathrooms
        int ownerId FK
        int categoryId FK
        datetime createdAt
    }
    PropertyImage {
        int id PK
        string url
        string altText
        int sortOrder
        int propertyId FK
    }
    Favorite {
        int id PK
        int userId FK
        int propertyId FK
        datetime createdAt
    }
    Inquiry {
        int id PK
        string message
        string phone
        int senderId FK
        int propertyId FK
        datetime createdAt
    }
```

`Favorite` jadvalida `@@unique([userId, propertyId])` bor, shuning uchun takroriy qo'shish `409` qaytaradi. `PropertyImage`, `Favorite` va `Inquiry` e'lon o'chirilganda `onDelete: Cascade` bilan birga o'chadi.

## Biznes qoidalari

- Yangi e'lon har doim `PENDING` holatida yaratiladi (DTO'da `status` qabul qilinmaydi).
- Ochiq `GET /properties` faqat `APPROVED` e'lonlarni qaytaradi. `GET /properties/:id` — `APPROVED` bo'lsa hamma uchun, aks holda faqat egasi yoki admin uchun.
- Sotuvchi faqat o'z e'lonini tahrirlaydi va o'chiradi, aks holda `403`.
- E'lon tahrirlansa, qayta `PENDING` holatiga o'tadi.
- Statusni faqat admin o'zgartiradi (`PATCH /admin/properties/:id/status`).
- `price`, `rooms`, `area` > 0; `listingType` faqat `SALE` yoki `RENT`.
- Murojaatni faqat login qilgan foydalanuvchi, faqat boshqa foydalanuvchining e'loniga yubora oladi.

## Lokal ishga tushirish

Kerak bo'ladi: Node.js 20+, npm, Docker (PostgreSQL uchun).

### 1. PostgreSQL

Backend repo'sidagi `docker-compose.yml` PostgreSQL 16 ni ko'taradi (`postgres` / `postgres`, baza `uyma_uy`, port `5432`):

```bash
docker compose up -d
```

### 2. Backend

```bash
git clone https://github.com/sirojjontoshmurodov7-bit/uyma-uy-server.git
cd uyma-uy-server
npm install
cp .env.example .env        # Windows: copy .env.example .env
# .env ichida DATABASE_URL="postgresql://postgres:postgres@localhost:5432/uyma_uy" va JWT_SECRET ni yozing
npx prisma migrate deploy   # jadvallarni yaratadi
npx prisma generate
npm run start:dev           # http://localhost:3000, Swagger: http://localhost:3000/docs
```

Seed skripti yo'q: lokal baza bo'sh boshlanadi. Admin yaratish uchun avval `/auth/register` orqali foydalanuvchi yarating, so'ng bazada (masalan `npx prisma studio`) uning `role` maydonini `ADMIN` ga o'zgartiring. Kategoriyalarni admin sifatida `POST /categories` bilan qo'shing.

### 3. Frontend

```bash
git clone https://github.com/abduvohidi683-pn/uyma-uy-frontend.git
cd uyma-uy-frontend/frontend
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm run dev                 # http://localhost:5173
```

Boshqa buyruqlar:

| Buyruq | Vazifasi |
| --- | --- |
| `npm run build` | Production build (frontend: `tsc` + Vite, backend: `nest build`) |
| `npm run preview` | Frontend production build'ni lokal ko'rish |
| `npm run start:prod` | Backend'ni build'dan ishga tushirish |
| `npm run lint` | oxlint |
| `npm run test` | Backend unit testlari (Vitest) |
| `npm run test:e2e` | Backend e2e testlari |

## `.env` o'zgaruvchilari

**Backend** (`.env`)

| O'zgaruvchi | Tavsif | Misol |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL ulanish manzili | `postgresql://postgres:postgres@localhost:5432/uyma_uy` |
| `JWT_SECRET` | JWT imzolash kaliti (kamida 32 belgi, tasodifiy) | `uzun-tasodifiy-qator` |
| `CORS_ORIGINS` | Ruxsat etilgan frontend originlari, vergul bilan ajratiladi, oxirida `/` siz | `http://localhost:5173,https://frontend-eta-smoky-54.vercel.app` |
| `PORT` | Server porti (Railway o'zi beradi) | `3000` |

**Frontend** (`.env`)

| O'zgaruvchi | Tavsif | Misol |
| --- | --- | --- |
| `VITE_API_URL` | Backend manzili (oxirida `/` siz) | `http://localhost:3000` |

> Backend CORS faqat `CORS_ORIGINS` ichidagi originlarga ruxsat beradi. Lokal dev server **5173** portida ishlashi kerak, deploy qilingan frontend domeni ham shu ro'yxatga qo'shilishi shart.

## Demo akkauntlar

Jonli saytdagi (Vercel + Railway) test akkauntlar:

| Rol | Email | Parol |
| --- | --- | --- |
| Admin | `admin@mail.com` | `parol1234` |
| Foydalanuvchi (sotuvchi) | `ali@mail.com` | `parol1234` |
| Foydalanuvchi (sotuvchi) | `Sirojjon@mail.com` | `parol1234` |

Bu faqat demo uchun test ma'lumotlari. Lokal bazada bu akkauntlar yo'q, ularni o'zingiz yarating.

## API endpointlar

Base URL: `https://uyma-uy-server-production.up.railway.app` (lokalda `http://localhost:3000`). Prefiks yo'q.

- Autentifikatsiya: `Authorization: Bearer <accessToken>`
- Ro'yxat javobi: `{ data: [...], meta: { page, limit, total, totalPages } }`
- Xato javobi: `{ statusCode, message, error }` (`message` matn yoki massiv bo'lishi mumkin)
- Rasm URL'i: `<BASE_URL>/uploads/properties/<fayl>`

| Modul | Endpoint | Kirish |
| --- | --- | --- |
| Auth | `POST /auth/register` | Hamma |
| | `POST /auth/login` | Hamma |
| | `GET /auth/me` | Login |
| Users | `GET /users/me`, `PATCH /users/me` | Login |
| Categories | `GET /categories` | Hamma |
| | `POST /categories`, `PATCH /categories/:id`, `DELETE /categories/:id` | Admin |
| Properties | `GET /properties` | Hamma (faqat `APPROVED`) |
| | `GET /properties/:id` | Hamma (`APPROVED`), egasi va admin (qolgan holatlar) |
| | `GET /properties/my` | Login |
| | `POST /properties` | Login |
| | `PATCH /properties/:id`, `DELETE /properties/:id` | Faqat egasi |
| Images | `POST /properties/:id/images` | Faqat egasi (`multipart/form-data`, maydon `image`, har so'rovda 1 ta fayl) |
| | `DELETE /properties/:id/images/:imageId` | Faqat egasi |
| Favorites | `GET /favorites` | Login |
| | `POST /favorites/:propertyId`, `DELETE /favorites/:propertyId` | Login |
| Inquiries | `POST /properties/:propertyId/inquiries` | Login (boshqa sotuvchining e'loniga) |
| | `GET /inquiries/my` | Login (men yuborganlar) |
| | `GET /inquiries/received` | Login (menga kelganlar) |
| Admin | `GET /admin/properties?status=` | Admin |
| | `PATCH /admin/properties/:id/status` | Admin |
| | `GET /admin/users` | Admin |

`GET /properties` query parametrlari: `page`, `limit`, `city`, `category` (kategoriya **slug**'i), `type` (`SALE` / `RENT`), `minPrice`, `maxPrice`, `rooms`, `sort` (`newest`, `price_asc`, `price_desc`).

## Frontend sahifalari

| Sahifa | Route | Kirish |
| --- | --- | --- |
| Bosh sahifa (yangi e'lonlar, kategoriyalar) | `/` | Hamma |
| E'lonlar ro'yxati (filter, sort, pagination — URL'da saqlanadi) | `/properties` | Hamma |
| E'lon tafsiloti, sevimlilar, rasm galereyasi (lightbox), murojaat formasi | `/properties/:id` | Hamma (sevimlilar va murojaat uchun login) |
| Ro'yxatdan o'tish / Kirish | `/register`, `/login` | Hamma |
| Boshqaruv (kabinet umumiy ko'rinishi) | `/dashboard` | Login |
| Profil | `/profile` | Login |
| Mening e'lonlarim | `/my-properties` | Login |
| E'lon yaratish / tahrirlash | `/create-property`, `/edit-property/:id` | Login (tahrirlash — faqat egasi) |
| Sevimlilar | `/favorites` | Login |
| Yuborgan murojaatlarim | `/my-inquiries` | Login |
| Menga kelgan murojaatlar | `/received-inquiries` | Login |
| Admin: dashboard, e'lonlar moderatsiyasi, kategoriyalar, foydalanuvchilar | `/admin`, `/admin/properties`, `/admin/categories`, `/admin/users` | Faqat ADMIN |

Barcha ro'yxatlarda yuklanish (skeleton), bo'sh va xato holatlari bor. Noma'lum URL uchun 404 sahifa chiqadi.

## Frontend tuzilishi

```
src/
├── components/   # Navbar, PropertyCard, PropertyForm, ImagePicker, Lightbox, guard'lar
├── context/      # AuthContext (token, user, /auth/me bilan tiklash), sevimlilar
├── hooks/        # useDebounce
├── i18n/         # translations.ts, dict/ (uz, ru, en matnlari)
├── pages/        # Home, Properties, PropertyDetail, Dashboard, Admin/ ...
├── services/     # API chaqiruvlari (axios): auth, property, image, inquiry, favorite, admin
├── types/        # API javoblari uchun TypeScript turlari
├── utils/        # format.ts, apiErrors.ts
└── tokens.css    # ranglar va shriftlar (Charcoal / Bronze / Ivory / Sage)
```

## Deploy

**Backend (Railway):** GitHub repo ulanadi, Postgres plugin qo'shiladi, `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS` o'zgaruvchilari kiritiladi. Yuklangan rasmlar saqlanib qolishi uchun `/app/uploads` yo'liga Volume ulanadi.

**Frontend (Vercel):** Framework — Vite (build: `npm run build`, output: `dist`), o'zgaruvchi `VITE_API_URL=https://uyma-uy-server-production.up.railway.app`. `vercel.json` barcha yo'llarni `index.html`'ga yo'naltiradi, shuning uchun sahifani yangilaganda (`/properties/5` kabi) 404 chiqmaydi.

## Screenshotlar

| Bosh sahifa | E'lonlar ro'yxati |
| --- | --- |
| ![Bosh sahifa](docs/home.png) | ![E'lonlar ro'yxati](docs/properties.png) |

| E'lon tafsiloti | Swagger (`/docs`) |
| --- | --- |
| ![E'lon tafsiloti](docs/property-detail.png) | ![Swagger](docs/swagger.png) |

| Kirish | Ro'yxatdan o'tish |
| --- | --- |
| ![Kirish](docs/login.png) | ![Ro'yxatdan o'tish](docs/register.png) |

Login talab qiladigan sahifalar (kabinet, e'lon yaratish, sevimlilar, murojaatlar, admin panel) jonli saytda demo akkauntlar bilan ko'rinadi.

## Cheklovlar

- Seed skripti yo'q: demo ma'lumotlar jonli bazada qo'lda kiritilgan.
- Birinchi so'rov backend "uyg'onishi" sababli sekin bo'lishi mumkin.
- Yuklangan rasmlar server diskida saqlanadi. Railway'da Volume ulanmasa, redeploy'dan keyin rasmlar yo'qolishi mumkin.
- `POST /auth/register` token qaytarmaydi, ro'yxatdan o'tgach foydalanuvchi login sahifasiga yo'naltiriladi.
- Interfeys tarjimalari (UZ / RU / EN) faqat UI matnlari uchun. E'lon sarlavhasi va tavsifi kiritilgan tilda qoladi.
- Parolni tiklash, email tasdiqlash va xarita (map) hozircha yo'q.

## Tashqi manbalar

Tayyor template ishlatilmagan. Ikonlar — [lucide](https://lucide.dev), frontend skeleti — Vite React-TS shabloni, shriftlar — Fontshare (Sentient) va Google Fonts (Hanken Grotesk). Backend NestJS CLI starter'idan boshlangan.
