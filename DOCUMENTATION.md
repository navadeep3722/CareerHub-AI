# CareerHub AI - Complete Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Features & Capabilities](#features--capabilities)
5. [System Architecture](#system-architecture)
6. [Component Overview](#component-overview)
7. [Setup & Installation](#setup--installation)
8. [Running the Application](#running-the-application)
9. [API Endpoints](#api-endpoints)
10. [Authentication & Authorization](#authentication--authorization)
11. [Environment Configuration](#environment-configuration)
12. [Building for Production](#building-for-production)
13. [Deployment](#deployment)
14. [Development Guidelines](#development-guidelines)

---

## Project Overview

**CareerHub AI** is a comprehensive career intelligence platform that bridges the gap between ambitious students and data-driven recruiters. Built with modern web technologies and powered by Google's Gemini AI, the platform provides separate professional workflows tailored for different user roles.

### Key Objectives
- **For Students**: Provide tools for resume optimization, interview preparation, and job matching
- **For Recruiters**: Enable intelligent candidate evaluation and ranking
- **For Admins**: Centralized system management and monitoring

### Project Metadata
- **Name**: CareerHub AI
- **Version**: 0.0.0
- **Type**: React + TypeScript Web Application
- **AI Integration**: Google Gemini API
- **Backend**: Express.js with Vite

---

## Technology Stack

### Frontend
- **React** (19.0.1) - UI framework
- **TypeScript** (5.8.2) - Type-safe JavaScript
- **Vite** (6.2.3) - Build tool and dev server
- **Tailwind CSS** (4.1.14) - Utility-first CSS framework
- **Motion** (12.23.24) - Animation library for React
- **Lucide React** (0.546.0) - Icon library
- **React DOM** (19.0.1) - React rendering

### Backend
- **Express.js** (4.21.2) - Node.js web framework
- **Node.js** (22.14.0) - JavaScript runtime

### AI/ML
- **Google Gemini API** (2.4.0) - Large Language Model integration

### Authentication & Database
- **Firebase** (12.15.0) - Authentication and Firestore database
- **Firebase Auth** - Email/Password, Google OAuth, Phone OTP

### Development Tools
- **TypeScript Compiler** - Type checking
- **ESBuild** (0.25.0) - JavaScript bundler
- **TSX** (4.21.0) - TypeScript execution environment
- **Autoprefixer** (10.4.21) - CSS vendor prefixes
- **dotenv** (17.2.3) - Environment variable management

---

## Project Structure

```
careerhub-ai/
├── src/
│   ├── components/
│   │   ├── AdminZone.tsx         # Admin dashboard & system management
│   │   ├── LandingPage.tsx       # Public landing page
│   │   ├── Navbar.tsx            # Navigation component
│   │   ├── RecruiterZone.tsx     # Recruiter dashboard & features
│   │   └── StudentZone.tsx       # Student dashboard & features
│   ├── lib/
│   │   └── firebase.ts           # Firebase configuration & utilities
│   ├── App.tsx                   # Main application component
│   ├── main.tsx                  # React DOM entry point
│   ├── types.ts                  # TypeScript type definitions
│   └── index.css                 # Global styles
├── assets/                       # Static assets
├── server.ts                     # Express.js backend server
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # NPM dependencies & scripts
├── index.html                    # HTML entry point
├── firebase-applet-config.json   # Firebase configuration
├── metadata.json                 # Application metadata
└── README.md                     # Quick start guide
```

---

## Features & Capabilities

### Student Portal Features

#### 1. ATS Resume Analyzer
- **Purpose**: Analyze resumes against job descriptions
- **Functionality**:
  - Parse resume text and job descriptions
  - Calculate ATS compatibility score (0-100)
  - Identify missing keywords
  - Detect formatting issues
  - Provide improvement suggestions
  - Match against target roles
- **AI Integration**: Uses Gemini to analyze resume structure and content

#### 2. Interview Coach (Real-time AI)
- **Purpose**: Conduct simulated job interviews with AI feedback
- **Functionality**:
  - Multi-turn conversation with AI interviewer
  - Job-specific interview questions
  - Real-time feedback on candidate responses
  - Answer evaluation and suggestions
  - Interview session persistence
- **Models Used**: Gemini-flash-latest, Gemini-3.1-flash-lite (fallback)

#### 3. Job Matching Engine
- **Purpose**: Match student profiles with available opportunities
- **Functionality**:
  - Display relevant job postings
  - Show job requirements and skills
  - Calculate match percentages
  - Filter by location, salary, and job type
  - View detailed job descriptions

#### 4. Skill Gap Analysis
- **Purpose**: Identify skill gaps and learning paths
- **Functionality**:
  - Compare current skills with job requirements
  - Recommend target skills to learn
  - Suggest learning resources
  - Track skill development progress

#### 5. Authentication
- **Email/Password Login**: Traditional credentials
- **Google OAuth**: Single sign-on with Google
- **Phone OTP**: Phone number verification with OTP
- **Registration**: Create new student accounts with profile information

### Recruiter Portal Features

#### 1. Candidate Evaluation Engine
- **Purpose**: Intelligently rank and evaluate candidates
- **Functionality**:
  - View candidate profiles with full resume data
  - Run AI-powered ranking against job descriptions
  - Get suitability scores for each candidate
  - Identify critical skill gaps
  - Summary of candidate strengths
  - Filter and sort candidates
- **AI Integration**: Gemini analyzes candidate skills against job requirements

#### 2. Recruitment Pipeline Management
- **Purpose**: Manage candidate workflow and status
- **Functionality**:
  - Track candidate status (Applied, Reviewing, Interviewed, Offered, Rejected)
  - Move candidates through pipeline stages
  - Bulk update candidate status
  - Historical tracking of changes

#### 3. Job Posting Management
- **Purpose**: Create and manage job postings
- **Functionality**:
  - Create new job listings
  - Define requirements and responsibilities
  - Set salary ranges and location
  - View applicant counts
  - Update job status (Active, Closed, Draft)
  - Track job creation dates

#### 4. Analytics Dashboard
- **Purpose**: Data-driven recruiting insights
- **Functionality**:
  - View recruitment metrics
  - Track application trends
  - Analyze hiring pipeline health
  - Monitor time-to-hire metrics
  - Department-wise job opening statistics

#### 5. Recruiter Authentication
- **Company-based registration**: Companies can create recruiter accounts
- **Multi-recruiter support**: Multiple recruiters per company
- **Role-based access**: Company admins and recruiters

### Admin Zone Features

#### 1. System Logging & Monitoring
- **Purpose**: Track system events and API calls
- **Functionality**:
  - View system logs
  - Monitor API endpoint usage
  - Track user authentication events
  - Log AI API calls and responses
  - System health monitoring

#### 2. Role Impersonation (Development)
- **Purpose**: Test different user roles and access controls
- **Functionality**:
  - Switch between user roles (Student, Recruiter, Admin)
  - Test authorization boundaries
  - Verify role-based access restrictions
  - Trigger HTTP 403 forbidden errors for testing

#### 3. System Information
- **Purpose**: Display system status and configuration
- **Functionality**:
  - API endpoint status
  - Gemini API availability
  - Firebase connection status
  - System uptime monitoring

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Landing    │  │   Student    │  │  Recruiter   │      │
│  │    Page      │  │    Zone      │  │    Zone      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              React Component Tree                    │   │
│  │  Router → Navigation → Page Components              │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬──────────────────────────────────────┘
                         │ HTTP REST API
┌────────────────────────▼──────────────────────────────────────┐
│                   Express.js Server                           │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              API Routes                                 │  │
│  │  /api/interview/chat      - Interview coaching         │  │
│  │  /api/resume/analyze      - Resume analysis            │  │
│  │  /api/candidates/rank     - Candidate ranking          │  │
│  │  /api/admin/system-logs   - System logging             │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │           Gemini AI Integration Layer                   │  │
│  │  • Resume analysis                                      │  │
│  │  • Interview question generation                       │  │
│  │  • Candidate ranking                                   │  │
│  │  • Feedback generation                                 │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────┬──────────────────────────────────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
    ┌───────▼────────┐       ┌────────▼────────┐
    │   Firebase     │       │  Google Gemini  │
    │   ┌─────────┐  │       │   API Service   │
    │   │ Auth    │  │       │                 │
    │   ├─────────┤  │       │ • Models        │
    │   │Firestore│  │       │ • Fallback      │
    │   └─────────┘  │       │   Logic         │
    └────────────────┘       └─────────────────┘
```

### Data Flow

#### Student Resume Analysis Flow
```
Student Input → Resume + Job Description
              ↓
         Express Backend
              ↓
      Gemini API Request
         (formatted prompt)
              ↓
      Gemini Analysis Response
         (score, keywords, issues)
              ↓
    Response Formatting & Validation
              ↓
      Return to Student Client
```

#### Interview Coaching Flow
```
Student Input → Job Title + User Answer
              ↓
         Store Message History
              ↓
      Build Chat Context for Gemini
              ↓
      Gemini API Request
    (generates follow-up question + feedback)
              ↓
      Format AI Response
              ↓
      Stream/Return to Student
```

#### Candidate Ranking Flow
```
Recruiter Input → Job Description + Candidate List
                ↓
          Express Backend
                ↓
    For each candidate:
      - Extract skills and experience
      - Build Gemini analysis prompt
      - Send to Gemini API
      - Parse ranking response
                ↓
      Aggregate Results
        (scores, gaps, strengths)
                ↓
      Sort and Filter Results
                ↓
    Return Ranked Candidates
      to Recruiter Dashboard
```

---

## Component Overview

### App.tsx - Main Application Shell

**Purpose**: Root component that handles:
- Client-side routing and navigation
- User session management (login/logout)
- Role-based access control and authorization
- Dark mode toggle
- Global layout structure

**Key Features**:
- localStorage-based session persistence
- History API for client-side navigation
- Role-based access shields (403 error for unauthorized access)
- Dark mode with class-based Tailwind support

**State Management**:
- `currentPath`: Current route
- `currentUser`: Active user session
- `darkMode`: Dark mode toggle state

---

### StudentZone.tsx - Student Dashboard

**Purpose**: Comprehensive student portal with four main features

**Sub-Features**:
1. **Authentication (Login/Register)**
   - Email/password login with Firebase
   - Google OAuth integration
   - Phone OTP authentication
   - Registration with student profile

2. **ATS Resume Analyzer**
   - Upload/paste resume text
   - Input job description
   - Specify target role
   - Display analysis results with score, strengths, weaknesses, and improvements

3. **Interview Coach**
   - Select job title to practice
   - Multi-turn conversation with AI
   - Real-time feedback on answers
   - Message history persistence
   - Auto-scroll to latest messages

4. **Job Matching**
   - Browse available job postings
   - View job requirements and skills
   - Filter and search jobs
   - Calculate match percentage based on resume

5. **Skill Gap Analysis**
   - Identify missing skills for target roles
   - Get recommendations for skill development
   - Compare current skills with job requirements

**State Variables**:
- Authentication: `email`, `password`, `authMode`, `phoneNumber`, `otpCode`, `isOtpSent`
- ATS Feature: `resumeText`, `customJobDesc`, `expectedRole`, `atsResult`, `atsLoading`
- Interview Coach: `coachMessages`, `userAnswer`, `coachLoading`
- Tab Management: `activeTab`

---

### RecruiterZone.tsx - Recruiter Dashboard

**Purpose**: Professional recruiter platform for candidate evaluation and hiring

**Sub-Features**:
1. **Authentication (Login/Register)**
   - Company-based registration
   - Email/password login
   - Company name and industry selection

2. **Candidate Evaluation**
   - View candidate profiles with resume data
   - Run AI-powered ranking against job descriptions
   - View candidate scores and recommendations
   - Filter and sort candidates
   - Detailed skill gap analysis

3. **Recruitment Pipeline**
   - Track candidate status through hiring stages
   - Move candidates between pipeline stages
   - Bulk update candidate information
   - Historical tracking of changes

4. **Job Management**
   - Create new job postings
   - Edit job requirements and description
   - Update job status
   - View applicant counts
   - Manage multiple open positions

5. **Analytics**
   - View recruitment metrics
   - Track application trends
   - Analyze pipeline health
   - Department-wise statistics

**State Variables**:
- Candidates: `candidates`, `setCandidates` (localStorage-backed)
- Jobs: `jobPostings`, `setJobPostings` (localStorage-backed)
- Analysis: `selectedJobDesc`, `rankingLoading`, `rankingError`
- Tab Management: `activeTab`

---

### AdminZone.tsx - Admin Control Panel

**Purpose**: System management and monitoring dashboard

**Features**:
1. **System Logging**
   - Fetch and display system logs
   - View API call history
   - Monitor authentication events
   - Track Gemini API usage

2. **Role Testing/Impersonation**
   - Switch between different user roles
   - Test authorization boundaries
   - Verify access control restrictions
   - Trigger error scenarios

3. **Access Control**
   - Display HTTP 403 Forbidden for non-admin users
   - Beautiful error UI with security branding
   - Instructions for accessing admin zone

**State Variables**:
- `logs`: Array of log entries
- `loading`: Loading state
- `errorWord`: Error message

**Authorization**:
- Only accessible to users with `ROLE_ADMIN`
- Non-admin users see styled 403 error page

---

### LandingPage.tsx - Public Home Page

**Purpose**: Marketing and onboarding page for new visitors

**Sections**:
1. **Hero Section**
   - Project introduction
   - Value proposition
   - Call-to-action buttons

2. **Student Portal Card**
   - Portal description
   - Key features list
   - "Enter Student Portal" button
   - User statistics

3. **Recruiter Portal Card**
   - Portal description
   - Key features list
   - "Enter Recruiter Portal" button
   - Company statistics

4. **Features Showcase**
   - Highlight key capabilities
   - Visual benefits
   - Integration highlights

**Design**:
- Responsive grid layout
- Tailwind CSS styling
- Gradient backgrounds
- Hover animations
- Mobile-optimized

---

### Navbar.tsx - Navigation Component

**Purpose**: Top navigation bar with branding and user controls

**Features**:
- CareerHub AI branding/logo
- Navigation links to portals
- User profile menu
- Logout functionality
- Dark mode toggle
- Responsive hamburger menu

**State Passed**:
- `currentUser`: Display user name/email
- `darkMode`: Toggle indicator
- Navigation callbacks

---

### firebase.ts - Firebase Configuration

**Purpose**: Initialize and configure Firebase services

**Exports**:
- Firebase app instance
- Auth instance
- Firestore database instance
- Google OAuth provider
- Auth functions (email/password, phone OTP, sign out)

**Configuration**:
```javascript
apiKey: "AIzaSyBJ1GlJhnK1ZYMxnDAHZ_fn3gJlBWe3B-k"
authDomain: "gen-lang-client-0443531587.firebaseapp.com"
projectId: "gen-lang-client-0443531587"
storageBucket: "gen-lang-client-0443531587.firebasestorage.app"
```

**Authentication Methods**:
- Email/Password (standard)
- Google OAuth (signInWithPopup)
- Phone OTP (signInWithPhoneNumber + RecaptchaVerifier)

---

### types.ts - TypeScript Definitions

**Core Types**:

```typescript
UserRole = 'ROLE_STUDENT' | 'ROLE_RECRUITER' | 'ROLE_ADMIN'

UserSession {
  email: string
  name: string
  role: UserRole
  token?: string
  companyName?: string
  avatarUrl?: string
}

ResumeAnalysisResult {
  score: number (0-100)
  summary: string
  strengths: string[]
  weaknesses: string[]
  missingKeywords: string[]
  formattingIssues: string[]
  improvements: string[]
  matchedRole: string
}

InterviewMessage {
  id: string
  role: 'user' | 'model'
  text: string
  timestamp: string
  feedback?: string
}

InterviewSession {
  id: string
  jobTitle: string
  messages: InterviewMessage[]
  status: 'active' | 'completed'
}

Candidate {
  id: string
  name: string
  email: string
  experienceYears: number
  skills: string[]
  education: string
  resumeText: string
  currentRole: string
  suitabilityScore?: number
  criticalGaps?: string[]
  strengthsSummary?: string
  status?: string
}

JobPosting {
  id: string
  title: string
  company?: string
  department?: string
  location: string
  salary?: string
  type: string
  description: string
  requirements: string[]
  skills: string[]
  status: 'Active' | 'Closed' | 'Draft'
  applicantsCount?: number
  createdAt: string
}

RecruitmentAnalytics {
  totalApplications: number
  openPositions: number
  averageTimeToHire: number
  conversionRate: number
}
```

---

## Setup & Installation

### Prerequisites
- **Node.js**: Version 16 or higher (22.14.0 recommended)
- **npm**: Version 8 or higher
- **Google Gemini API Key**: Required for AI features
- **Firebase Project**: Already configured (see firebase-applet-config.json)

### Step 1: Clone or Extract Project
```bash
cd careerhub-ai
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all dependencies listed in `package.json`:
- React and related packages
- TypeScript and build tools
- Express for the backend
- Firebase SDK
- Tailwind CSS and styling
- Gemini API client

### Step 3: Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Google Gemini API Key (Required)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Disable HMR for certain environments
# DISABLE_HMR=true
```

**Important**: 
- Do NOT commit `.env.local` to version control
- Keep API keys private and secure
- Use different keys for development and production

### Step 4: Verify Setup
```bash
# Type check the project
npm run lint
```

---

## Running the Application

### Development Mode

Start the development server with hot module replacement:

```bash
npm run dev
```

**What happens**:
- Vite dev server starts (usually on http://localhost:5173)
- Express backend server starts on port 3000
- Hot reload enabled for code changes
- Full source maps for debugging

**Access the app**:
- Open browser to `http://localhost:5173` (Vite frontend)
- Backend API available at `http://localhost:3000`

### Preview Mode

Build and preview the production version locally:

```bash
# First build the project
npm run build

# Then preview
npm run preview
```

### Production Mode

Start the built application:

```bash
npm run start
```

**Requirements**:
- Must run `npm run build` first
- Uses compiled JavaScript bundle
- Backend serves static frontend files

---

## API Endpoints

### Interview Coaching API

#### POST /api/interview/chat
Conduct a multi-turn interview with AI feedback

**Request**:
```json
{
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "text": "User's answer to interview question"
    }
  ],
  "jobTitle": "Senior AI Engineer",
  "lastUserMessage": "User's latest response"
}
```

**Response**:
```json
{
  "nextQuestion": "AI's follow-up question",
  "feedback": "Assessment of the user's answer",
  "score": 7.5,
  "conversation": [...]
}
```

**Error Handling**:
- Returns 400 if GEMINI_API_KEY is not configured
- Returns 503 if Gemini API is unavailable
- Includes fallback model logic

---

### Resume Analysis API

#### POST /api/resume/analyze
Analyze resume against job description

**Request**:
```json
{
  "resumeText": "User's resume content",
  "jobDescription": "Target job description",
  "targetRole": "Desired position title"
}
```

**Response**:
```json
{
  "score": 78,
  "summary": "Overall resume assessment",
  "strengths": ["skill1", "skill2"],
  "weaknesses": ["gap1", "gap2"],
  "missingKeywords": ["keyword1"],
  "formattingIssues": ["issue1"],
  "improvements": ["suggestion1"],
  "matchedRole": "Senior Engineer"
}
```

---

### Candidate Ranking API

#### POST /api/candidates/rank
Rank candidates against job requirements

**Request**:
```json
{
  "candidates": [
    {
      "id": "cand-1",
      "name": "John Doe",
      "skills": ["React", "TypeScript"],
      "resumeText": "Full resume content",
      "experienceYears": 5
    }
  ],
  "jobDescription": "Job requirements and description"
}
```

**Response**:
```json
{
  "rankings": [
    {
      "candidateId": "cand-1",
      "score": 85,
      "suitability": "Excellent fit",
      "criticalGaps": ["Python"],
      "strengthsSummary": "Strong React expertise"
    }
  ]
}
```

---

### Admin System Logs API

#### POST /api/admin/system-logs
Retrieve system logs (admin only)

**Request**:
```json
{
  "Authorization": "Bearer token:ROLE_ADMIN"
}
```

**Response**:
```json
{
  "logs": [
    {
      "time": "2026-06-20 14:30:45",
      "message": "User login event",
      "level": "INFO"
    }
  ]
}
```

**Authorization**:
- Requires `ROLE_ADMIN` role
- Returns 403 if not authorized
- Token format: `Bearer token:role`

---

## Authentication & Authorization

### Authentication Methods

#### 1. Email/Password (Firebase)
```typescript
// Student Registration
await createUserWithEmailAndPassword(auth, email, password)

// Student Login
await signInWithEmailAndPassword(auth, email, password)

// Recruiter Registration
await createUserWithEmailAndPassword(auth, email, password)
```

#### 2. Google OAuth
```typescript
const provider = new GoogleAuthProvider()
await signInWithPopup(auth, provider)
```

#### 3. Phone OTP (Firebase)
```typescript
// Create reCAPTCHA verifier
const verifier = new RecaptchaVerifier("recaptcha-container", {}, auth)

// Send OTP
const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier)

// Verify OTP
await confirmation.confirm(otpCode)
```

### Authorization Model

#### Role-Based Access Control (RBAC)

Three user roles with specific permissions:

| Role | Student Access | Recruiter Access | Admin Access |
|------|---|---|---|
| ROLE_STUDENT | ✓ Dashboard | ✗ | ✗ |
| ROLE_RECRUITER | ✗ | ✓ Dashboard | ✗ |
| ROLE_ADMIN | ✓ Dashboard | ✓ Dashboard | ✓ Admin Zone |

#### Route Protection

```typescript
// Student dashboard requires ROLE_STUDENT or ROLE_ADMIN
if (isStudentRoute && !hasStudentClearance) {
  // Show 403 error
}

// Recruiter dashboard requires ROLE_RECRUITER or ROLE_ADMIN
if (isRecruiterRoute && !hasRecruiterClearance) {
  // Show 403 error
}

// Admin zone requires ROLE_ADMIN
if (isAdminRoute && !hasAdminClearance) {
  // Show 403 error
}
```

### Session Management

Sessions are stored in browser localStorage:

```json
{
  "email": "user@example.com",
  "name": "User Name",
  "role": "ROLE_STUDENT",
  "token": "firebase_auth_token",
  "companyName": "Optional for recruiters",
  "avatarUrl": "Optional avatar URL"
}
```

**Persistence**:
- Sessions persist across browser sessions
- Cleared on logout
- Validated on app startup

---

## Environment Configuration

### Configuration Files

#### .env.local (Local Development)
```
GEMINI_API_KEY=your_api_key_here
```

#### vite.config.ts
- Configures Vite build tool
- Enables React plugin
- Configures Tailwind CSS
- Sets up HMR for development
- Path aliases (@/ for imports)

#### tsconfig.json
- Target: ES2022
- JSX: react-jsx
- Module resolution: bundler
- Path mapping for @ alias

#### firebase-applet-config.json
```json
{
  "apiKey": "...",
  "authDomain": "gen-lang-client-0443531587.firebaseapp.com",
  "projectId": "gen-lang-client-0443531587",
  "storageBucket": "gen-lang-client-0443531587.firebasestorage.app",
  "messagingSenderId": "158068671768",
  "appId": "1:158068671768:web:331df8b738a3ec1e840a6d"
}
```

### Build Targets

#### Vite Build Targets
- Default: Modern browsers with ES2022 support
- Output: `dist/` directory
- Static assets: `dist/assets/`

#### Node.js Build Target
- Target: CJS (CommonJS)
- Platform: node
- External packages: npm packages
- Output: `dist/server.cjs`

---

## Building for Production

### Build Process

```bash
npm run build
```

**This command**:
1. Runs Vite build for frontend
   - Bundles React components
   - Minifies CSS and JavaScript
   - Generates source maps
   - Creates optimized assets

2. Bundles server with esbuild
   - Combines server.ts into single CJS file
   - Marks npm packages as external
   - Generates source map

3. Output structure:
```
dist/
├── index.html              # Main HTML entry
├── assets/                 # Compiled JS/CSS
│   ├── index-xxxxx.js     # Main bundle
│   └── index-xxxxx.css    # Styles
├── server.cjs             # Backend server bundle
└── server.cjs.map         # Source map
```

### Optimization Strategies

**Frontend**:
- Code splitting for lazy loading
- Tree-shaking for dead code elimination
- CSS purging for unused styles
- Asset compression and minification

**Backend**:
- Single file bundle reduces deployment size
- Source maps for debugging
- External package optimization

### Performance Considerations

- Vite's instant HMR during development
- Fast build times with esbuild
- Minimal production bundle size
- Optimized dependency tree

---

## Deployment

### Deployment Options

#### 1. Cloud Platforms

**Google Cloud (Recommended for Gemini)**
- Deploy to Cloud Run
- Environment: Node.js 20+
- Set GEMINI_API_KEY in Cloud Run secrets

**Vercel/Netlify**
- Frontend: Static hosting
- Backend: Serverless functions

**Traditional VPS/Server**
- Deploy to AWS EC2, DigitalOcean, Linode
- Node.js application server
- Nginx/Apache reverse proxy

#### 2. Deployment Steps

**Prerequisites**:
```bash
# Install dependencies
npm install

# Build application
npm run build

# Test production build locally
npm run start
```

**Environment Variables** (Set on platform):
```
GEMINI_API_KEY=your_production_key
```

**Docker Deployment** (Example):
```dockerfile
FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]
```

#### 3. Post-Deployment Verification

- Test authentication flows (email, Google OAuth, Phone OTP)
- Verify Gemini API connectivity
- Test resume analysis feature
- Verify candidate ranking functionality
- Check admin dashboard access
- Monitor system logs

---

## Development Guidelines

### Code Style & Best Practices

#### TypeScript Usage
- Always use type annotations for function parameters and returns
- Define interfaces for data structures
- Use union types for state management
- Avoid `any` type - use `unknown` with type guards

#### React Patterns
- Use functional components with hooks
- Implement proper error boundaries
- Keep components focused and single-responsibility
- Use composition over inheritance
- Memoize expensive computations

#### State Management
- Use `useState` for local component state
- localStorage for session persistence
- Lift state up when shared between components
- Consider Context API for global state (future enhancement)

#### Styling
- Use Tailwind CSS utility classes
- Implement responsive design with Tailwind breakpoints
- Use CSS modules for component-scoped styles if needed
- Maintain consistent color schemes and spacing

### Folder Structure Conventions

```
src/
├── components/       # React components
│   └── *.tsx        # One component per file
├── lib/             # Utility functions & libraries
│   └── firebase.ts  # Service integrations
├── types.ts         # TypeScript definitions
├── index.css        # Global styles
└── App.tsx          # Root component
```

### Naming Conventions

- **Components**: PascalCase (StudentZone.tsx)
- **Functions**: camelCase (handleSubmit)
- **Constants**: UPPER_SNAKE_CASE (API_KEY)
- **Types/Interfaces**: PascalCase (UserSession)
- **Files**: kebab-case or PascalCase matching component name

### Git Workflow

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes with meaningful commits
3. Push to remote: `git push origin feature/feature-name`
4. Create pull request with description
5. Code review before merging
6. Delete branch after merge

### Testing (Future Enhancement)

Recommended testing setup:
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright or Cypress
- **Type Testing**: TypeScript strict mode

### Performance Monitoring

- Monitor Gemini API response times
- Track authentication performance
- Monitor frontend bundle size
- Profile component rendering

### Security Considerations

#### API Keys
- Never commit .env.local
- Use environment secrets on deployment platforms
- Rotate keys periodically
- Use different keys for dev/prod

#### Authentication
- Validate tokens on backend
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Validate input data

#### Data Protection
- Sanitize user inputs
- Validate resume/job description content
- Implement CORS policies
- Use secure session storage

### Debugging Tips

#### Development Tools
- React Developer Tools browser extension
- VS Code TypeScript debugging
- Network tab for API debugging
- Console for logs and errors

#### Common Issues

**GEMINI_API_KEY Error**:
- Check .env.local file exists
- Verify API key is valid
- Check Firebase configuration

**Firebase Auth Issues**:
- Verify Firebase project configuration
- Check reCAPTCHA setup for phone auth
- Validate redirect URIs for OAuth

**Vite HMR Issues**:
- Check DISABLE_HMR environment variable
- Restart dev server if stuck
- Clear browser cache

---

## Troubleshooting

### Installation Issues

**Problem**: npm install fails
```bash
# Solution: Clear npm cache
npm cache clean --force
npm install
```

**Problem**: Node version mismatch
```bash
# Check Node version
node --version

# Update Node to 22+
nvm install 22
nvm use 22
```

### Development Server Issues

**Problem**: Vite server won't start
```bash
# Kill process on port 5173
lsof -i :5173
kill -9 <PID>

# Restart dev server
npm run dev
```

**Problem**: Hot reload not working
```bash
# Set environment variable
export DISABLE_HMR=false

# Restart dev server
npm run dev
```

### API/Gemini Issues

**Problem**: Gemini API returns 503
- Service might be overloaded
- Check Gemini API status page
- Fallback models will be tried automatically

**Problem**: Missing GEMINI_API_KEY
- Ensure .env.local exists in project root
- API key must be set before starting server
- Restart server after setting key

### Firebase Issues

**Problem**: Authentication fails
- Check Firebase configuration in firebase.ts
- Verify Firebase project is active
- Check browser console for detailed errors

**Problem**: Phone OTP not working
- Enable Phone authentication in Firebase Console
- Configure reCAPTCHA (Enterprise or free)
- Check country/phone format

---

## Project Statistics

- **Total Components**: 5 major components
- **Lines of Code**: ~3000+ (excluding node_modules)
- **TypeScript Definitions**: 10+ interfaces
- **API Endpoints**: 4 main endpoints
- **Dependencies**: 15+ npm packages
- **Target Browsers**: Modern browsers (ES2022)

---

## Support & Resources

### Documentation
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Google Gemini API](https://ai.google.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Express.js Guide](https://expressjs.com/)

### Getting Help
1. Check the troubleshooting section
2. Review console errors and logs
3. Check Firebase and Gemini API status pages
4. Review component source code for implementation details

---

## License

Apache License 2.0 (SPDX-License-Identifier: Apache-2.0)

---

## Changelog

### Version 0.0.0 (Current)
- Initial project setup
- Student and Recruiter portals
- Gemini AI integration
- Firebase authentication
- Resume analysis feature
- Interview coaching
- Candidate ranking
- Admin dashboard

---

**Last Updated**: 2026-06-20  
**Documentation Version**: 1.0  
**Project Version**: 0.0.0
