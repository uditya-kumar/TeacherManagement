# Vitsify - Teacher Management System

**A modern React Native application for managing and rating teachers**

[![Expo](https://img.shields.io/badge/Expo-~53.0.23-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.79.6-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.52.1-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Running the App](#running-the-app)
- [Building for Production](#-building-for-production)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Vitsify** is a comprehensive teacher management and rating system built with React Native and Expo. The application enables students to discover, rate, and manage their favorite teachers while providing a seamless authentication flow and real-time data synchronization.

### Key Highlights

- 🔐 **Secure Authentication** - OAuth integration with session persistence
- ⭐ **Teacher Ratings** - Multi-dimensional rating system (Teaching, Evaluation, Behavior, Internals)
- 💝 **Favorites Management** - Bookmark and track favorite teachers
- 📊 **Real-time Updates** - Live data synchronization using Supabase Realtime
- 🎨 **Modern UI/UX** - Clean, intuitive interface with dark/light theme support
- 📱 **Cross-Platform** - Runs on iOS, Android, and Web

---

## ✨ Features

### Core Functionality

- **Teacher Discovery**
  - Browse verified teachers
  - View teacher profiles with ratings and contact information
  - Search and filter capabilities
  
- **Rating System**
  - Multi-category ratings (Teaching Quality, Evaluation Methods, Behavior, Internals)
  - Average rating calculations
  - Rating analytics and visualizations with bar charts
  - One rating per user per teacher

- **User Management**
  - Secure authentication with Google OAuth
  - Session persistence across app restarts
  - User profile management

- **Favorites & Bookmarks**
  - Save favorite teachers
  - Quick access to bookmarked teachers
  - Optimistic UI updates

- **Teacher Submissions**
  - Submit new teacher entries (pending verification)
  - Track created teacher submissions
  - Report bugs and issues

### Technical Features

- **Offline Support** - AsyncStorage integration for data persistence
- **Optimistic Updates** - Instant UI feedback with background synchronization
- **Type Safety** - Full TypeScript coverage with generated Supabase types
- **State Management** - React Query for server state management
- **Navigation** - File-based routing with Expo Router
- **Performance** - Query caching and stale-while-revalidate patterns

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Native** | 0.79.6 | Cross-platform mobile framework |
| **Expo** | ~53.0.23 | Development platform and build tools |
| **TypeScript** | 5.8.3 | Type-safe development |
| **Expo Router** | ~5.1.7 | File-based navigation |
| **React Query** | 5.83.0 | Server state management |
| **Reanimated** | ~3.17.4 | Smooth animations |

### Backend & Services

| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend-as-a-Service (BaaS) |
| **PostgreSQL** | Relational database |
| **Supabase Auth** | Authentication service |
| **Supabase Realtime** | Real-time subscriptions |

### UI & Styling

- **Lucide React Native** - Icon library
- **React Native SVG** - SVG rendering
- **Custom themed components** - Consistent design system

### Development Tools

- **EAS (Expo Application Services)** - Build and deployment
- **Jest** - Unit testing framework
- **ESLint & TypeScript** - Code quality and type checking

---

## 📁 Project Structure

```
TeacherManagement/
├── src/
│   ├── app/                      # Expo Router pages
│   │   ├── (auth)/              # Authentication screens
│   │   │   ├── _layout.tsx
│   │   │   └── signin.tsx
│   │   ├── (tabs)/              # Main app tabs
│   │   │   ├── _layout.tsx
│   │   │   ├── home/            # Home tab screens
│   │   │   └── profile/         # Profile tab screens
│   │   ├── providers/           # Context providers
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── FavoriteProvider.tsx
│   │   │   ├── QueryProvider.tsx
│   │   │   └── ThemeProvider.tsx
│   │   ├── _layout.tsx          # Root layout
│   │   ├── +html.tsx            # Web HTML template
│   │   ├── +not-found.tsx       # 404 page
│   │   └── index.tsx            # Entry point
│   │
│   ├── api/                     # API hooks and queries
│   │   └── teachers/
│   │       ├── index.tsx        # Teacher queries
│   │       ├── profile.tsx      # User profile queries
│   │       ├── rating.tsx       # Rating mutations
│   │       └── reportBug.tsx    # Bug reporting
│   │
│   ├── components/              # Reusable components
│   │   ├── teacherManagement/
│   │   │   ├── Button.tsx
│   │   │   ├── CustomTextInput.tsx
│   │   │   ├── GoogleButton.tsx
│   │   │   ├── RatingBarChart.tsx
│   │   │   ├── RatingCategories.tsx
│   │   │   ├── TeacherCard.tsx
│   │   │   └── Toast.tsx
│   │   ├── Themed.tsx
│   │   └── useColorScheme.ts
│   │
│   ├── constants/               # App constants
│   │   └── Colors.ts
│   │
│   ├── hooks/                   # Custom React hooks
│   │   └── useRealtimeTeachers.ts
│   │
│   ├── libs/                    # Libraries and utilities
│   │   ├── auth.ts
│   │   ├── supabase.ts
│   │   └── toastService.ts
│   │
│   ├── database.types.ts        # Generated Supabase types
│   └── types.ts                 # Custom TypeScript types
│
├── assets/                      # Static assets
│   ├── fonts/
│   └── images/
│
├── android/                     # Native Android code
├── supabase/                    # Supabase configurations
│   ├── functions/
│   └── migrations/
│
├── app.json                     # Expo configuration
├── eas.json                     # EAS Build configuration
├── package.json                 # Dependencies
└── tsconfig.json               # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Expo CLI** (optional, but recommended)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/uditya2004/TeacherManagement.git
cd TeacherManagement
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Install Expo CLI globally** (optional)

```bash
npm install -g expo-cli
```

### Environment Setup

1. **Supabase Configuration**

The app uses Supabase for backend services. The configuration is already set up in `src/libs/supabase.ts`:

```typescript
// src/libs/supabase.ts
export const supabaseUrl = 'https://ykcpcgwzwrgvohhvrbrz.supabase.co';
const supabaseAnonKey = 'your-anon-key';
```

> **Note:** For production deployment, move sensitive credentials to environment variables.

2. **Generate TypeScript Types** (if database schema changes)

```bash
# Install Supabase CLI
npm install -g supabase

# Generate types
supabase gen types typescript --project-id "2e5c8c16-b91f-4246-9933-ae6d738a9224" > src/database.types.ts
```

### Running the App

#### Development Mode

```bash
# Start Expo development server
npm start
# or
expo start
```

#### Platform-Specific Commands

```bash
# Run on Android
npm run android
# or
expo run:android

# Run on iOS (macOS only)
npm run ios
# or
expo run:ios

# Run on Web
npm run web
# or
expo start --web
```

#### Using Expo Go

1. Download **Expo Go** from [App Store](https://apps.apple.com/app/expo-go/id982107779) or [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Scan the QR code from your terminal
3. The app will load on your device

---

## 📦 Building for Production

### Using EAS Build

1. **Install EAS CLI**

```bash
npm install -g eas-cli
```

2. **Login to Expo**

```bash
eas login
```

3. **Configure builds** (already configured in `eas.json`)

4. **Build for Android**

```bash
# APK for testing
eas build --platform android --profile apk

# AAB for Google Play Store
eas build --platform android --profile production
```

5. **Build for iOS**

```bash
eas build --platform ios --profile production
```

### Local Builds

```bash
# Android APK
npm run android --variant=release

# iOS (requires macOS)
npm run ios --configuration Release
```

---

## 🏗 Architecture

### Application Flow

```
User Opens App
    ↓
AuthProvider checks session
    ↓
    ├─→ No Session → Navigate to Sign In
    │                     ↓
    │              Google OAuth Flow
    │                     ↓
    └─→ Session Found → Navigate to Home (Tabs)
                             ↓
                    ┌────────┴────────┐
                    ↓                 ↓
               Home Tab          Profile Tab
                    ↓                 ↓
            Teacher List      User Settings
                    ↓
            Teacher Details
                    ↓
          Rating & Favorites
```

### State Management Strategy

1. **Server State** - React Query (`@tanstack/react-query`)
   - Teacher data
   - User ratings
   - Favorites
   - Profiles

2. **Client State** - React Context
   - Authentication state (`AuthProvider`)
   - Theme preferences (`ThemeProvider`)
   - Favorites cache (`FavoriteProvider`)

3. **Persistent State** - AsyncStorage
   - Auth tokens
   - User session

### Data Flow

```
Component
    ↓
React Query Hook (useTeacherList, useTeacher, etc.)
    ↓
Supabase Client
    ↓
PostgreSQL Database
    ↓
Real-time Updates (if subscribed)
    ↓
React Query Cache Invalidation
    ↓
Component Re-render
```

---

## 🗄 Database Schema

### Tables

#### `teachers`
```sql
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  cabin_no TEXT,
  mobile_no TEXT,
  average_rating DECIMAL(3,2),
  rating_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending' | 'verified'
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `ratings`
```sql
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  teaching INTEGER CHECK (teaching BETWEEN 1 AND 10),
  evaluation INTEGER CHECK (evaluation BETWEEN 1 AND 10),
  behaviour INTEGER CHECK (behaviour BETWEEN 1 AND 10),
  internals INTEGER CHECK (internals BETWEEN 1 AND 10),
  class_average TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(teacher_id, user_id)
);
```

#### `teacher_favorites`
```sql
CREATE TABLE teacher_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(teacher_id, user_id)
);
```

#### `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Relationships

- A teacher can have many ratings (one per user)
- A teacher can be favorited by many users
- A user can rate many teachers
- A user can favorite many teachers

---

## 📡 API Documentation

### Teacher Queries

#### `useTeacherList()`
Fetches all verified teachers.

```typescript
const { data, isLoading, error } = useTeacherList();
```

**Returns:** Array of teacher objects

#### `useTeacher(id, options?)`
Fetches a single teacher by ID.

```typescript
const { data, isLoading } = useTeacher(teacherId, {
  placeholderData: previousData
});
```

#### `useUserRatedTeacherIds(userId)`
Gets all teacher IDs rated by the user.

```typescript
const { data: ratedIds } = useUserRatedTeacherIds(userId);
```

#### `useFavoriteTeacherIds(userId)`
Gets all teacher IDs favorited by the user.

```typescript
const { data: favoriteIds } = useFavoriteTeacherIds(userId);
```

### Mutations

#### `useCreateTeacher(userId)`
Creates a new teacher (pending verification).

```typescript
const createTeacher = useCreateTeacher(userId);

createTeacher.mutate({
  full_name: "John Doe",
  cabin_no: "A-101",
  mobile_no: "1234567890",
  initialRating: {
    teaching: 8,
    evaluation: 7,
    behaviour: 9,
    internals: 8
  },
  class_average: "A"
});
```

#### `useToggleFavoriteTeacher(userId)`
Toggles favorite status for a teacher.

```typescript
const toggleFavorite = useToggleFavoriteTeacher(userId);

toggleFavorite.mutate({
  teacherId: "teacher-uuid",
  isFavorite: true // or false to unfavorite
});
```

### Real-time Hooks

#### `useRealtimeTeachers()`
Subscribes to real-time teacher updates.

```typescript
const { teachers, isLoading } = useRealtimeTeachers();
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Code Style Guidelines

- Use TypeScript for all new files
- Follow the existing folder structure
- Write meaningful commit messages
- Add comments for complex logic
- Ensure no TypeScript errors
- Test on both iOS and Android before submitting

### Testing

```bash
npm test
# or
yarn test
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Uditya Agrawal**

- GitHub: [@uditya2004](https://github.com/uditya2004)
- Expo: [@uditya204](https://expo.dev/@uditya204)

---

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) - Amazing development platform
- [Supabase](https://supabase.com/) - Fantastic BaaS solution
- [React Query](https://tanstack.com/query) - Powerful data synchronization
- [Lucide Icons](https://lucide.dev/) - Beautiful icon library

---

## 📞 Support

If you encounter any issues or have questions:

1. Check existing [Issues](https://github.com/uditya2004/TeacherManagement/issues)
2. Create a new issue with detailed information
3. Use the in-app bug reporting feature

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ using React Native and Expo

</div>
