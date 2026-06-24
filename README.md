# 📓 Электронный Журнал (Web-based Gradebook)

Веб-приложение для автоматизации учёта успеваемости, посещаемости и управления лабораторными работами кафедры информационных технологий.

---

## 🏗️ Архитектура проекта

Проект организован в виде монорепозитория:
* **`/frontend`** — Клиентское приложение на Next.js (App Router, TypeScript, Tailwind CSS, TanStack Query).
* **`/backend`** — Серверное приложение на NestJS (TypeScript, Prisma ORM, PostgreSQL, Redis, S3).
* **`docker-compose.yml`** — Инфраструктура для локальной разработки (PostgreSQL, Redis, MinIO).

---

## 🚀 Быстрый запуск (Локально)

### 1. Запуск инфраструктуры (Docker)
Для работы базы данных PostgreSQL, кэша Redis и файлового хранилища MinIO (S3) в корне проекта настроен Docker Compose.

Убедитесь, что у вас запущен Docker Desktop, и выполните в корне проекта:
```bash
docker-compose up -d
```
Это запустит контейнеры в фоновом режиме.

---

### 2. Настройка и запуск бэкенда (NestJS)

Перейдите в папку бэкенда:
```bash
cd backend
```

#### Шаг A: Переменные окружения
Создайте файл `.env` в папке `/backend` на основе шаблона `.env.example` (по умолчанию все настройки уже прописаны под Docker-контейнеры):
```bash
cp .env.example .env
```

#### Шаг B: Установка зависимостей
*Для предотвращения возможных ошибок post-install скриптов Prisma в Windows рекомендуется использовать флаг `--ignore-scripts`:*
```bash
npm install --ignore-scripts
```

#### Шаг C: Генерация клиента базы данных
Создайте типы клиента Prisma:
```bash
npx prisma generate
```

#### Шаг D: Применение миграций базы данных
Создайте таблицы в PostgreSQL:
```bash
npx prisma migrate dev --name init
```

#### Шаг E: Заполнение базы данных тестовыми данными
Запустите скрипт сидирования, который создаст учебные группы, предметы, преподавателей и студентов:
```bash
npm run seed
```

#### Шаг F: Запуск NestJS сервера
Запустите бэкенд в режиме разработки с автоматическим перезапуском при изменениях:
```bash
npm run start:dev
```
Сервер бэкенда запустится по адресу: [http://localhost:5000/api](http://localhost:5000/api)  
Документация Swagger (API Docs) будет доступна по адресу: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

---

### 3. Настройка и запуск фронтенда (Next.js)

Откройте новое окно терминала и перейдите в папку фронтенда:
```bash
cd frontend
```

#### Шаг A: Установка зависимостей
```bash
npm install
```

#### Шаг B: Запуск фронтенд-сервера
```bash
npm run dev
```
Фронтенд будет доступен по адресу: [http://localhost:3000](http://localhost:3000)

---

## 🔗 Интеграция Фронтенда с Бэкендом (Подключение к реальному API)

По умолчанию фронтенд запущен в **оффлайн-режиме имитации (Mock Mode)**, используя локальную базу данных в памяти (LocalStorage). Это позволяет тестировать весь интерфейс и функционал без запуска бэкенда.

Чтобы переключить фронтенд на работу с реальным NestJS API:

1. Откройте файл [frontend/src/lib/api.ts](file:///D:/Desktop/Final_Js/frontend/src/lib/api.ts) и измените значение переменной `USE_MOCK` на `false`:
   ```typescript
   const USE_MOCK = false;
   ```
2. Откройте файл [frontend/next.config.ts](file:///D:/Desktop/Final_Js/frontend/next.config.ts) и настройте проксирование запросов к бэкенду (чтобы запросы `/api/*` перенаправлялись на порт `5000` бэкенда):
   ```typescript
   import type { NextConfig } from "next";

   const nextConfig: NextConfig = {
     async rewrites() {
       return [
         {
           source: "/api/:path*",
           destination: "http://localhost:5000/api/:path*",
         },
       ];
     },
   };

   export default nextConfig;
   ```
3. Перезапустите сервер фронтенда (`npm run dev`).

---

## 🌐 Карты Портов инфраструктуры

При запуске `docker-compose up -d` пробрасываются следующие порты:
* **PostgreSQL:** `5432:5432` (пользователь: `admin`, пароль: `supersecretpassword`, бд: `gradebook`)
* **Redis:** `6379:6379`
* **MinIO (S3 API):** `9000:9000` (ключ: `minioadmin`, секрет: `minioadminpassword`)
* **MinIO Console (Web GUI):** `9001:9001` (для входа в браузерный UI управления бакетами)

---

## 🔑 Тестовые учетные записи (после запуска seed бэкенда)

Если вы переключили фронтенд на работу с реальным API (`USE_MOCK = false`), используйте следующие данные для авторизации:

* **Преподаватель:**
  * **Email:** `teacher@example.com`
  * **Пароль:** `password123`
* **Студент:**
  * **Email:** `student1@example.com`
  * **Пароль:** `password123`
* **Второй студент:**
  * **Email:** `student2@example.com`
  * **Пароль:** `password123`
