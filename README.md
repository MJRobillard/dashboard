# Cal Fitness Student Dashboard

A comprehensive fitness tracking and RSF (Recreational Sports Facility) integration dashboard designed specifically for UC Berkeley students. This modern web application provides seamless integration with Cal RSF events, personal fitness tracking, and social workout features.

## Project Overview

The Cal Fitness Student Dashboard is a Next.js-based web application that serves as a centralized hub for UC Berkeley students to manage their fitness journey. It combines RSF class scheduling, personal workout tracking, progress visualization, and social features to create a complete fitness ecosystem.

### Core Mission
- **Simplify Fitness Management**: Streamline the process of finding and booking RSF classes
- **Track Personal Progress**: Monitor workout consistency, weight goals, and fitness achievements
- **Build Community**: Connect with fellow students for workout partnerships and motivation
- **Data-Driven Insights**: Provide visual analytics to help students understand their fitness patterns

## Key Features

### RSF Integration
- **Real-time Class Schedule**: Browse and filter RSF classes by type, instructor, and time
- **Drag & Drop Booking**: Intuitive interface for adding classes to personal calendar
- **Google Calendar Sync**: Seamless integration with Google Calendar for class reminders
- **Class Details**: View instructor information, location, and class descriptions

### Personal Fitness Tracking
- **Workout Progress Dashboard**: Visual charts showing fitness progress over time
- **Weight Goal Tracking**: Monitor weight progress with goal setting and history
- **Body Part Focus Areas**: Track progress across different muscle groups (arms, legs, back, core, chest, flexibility)
- **Personal Calendar**: Schedule and manage personal workout sessions

### Gamification & Motivation
- **Achievement System**: Unlock badges for workout milestones and consistency
- **Progress Meters**: Visual progress indicators for different fitness goals
- **Streak Tracking**: Monitor workout consistency and build healthy habits
- **Trophy System**: Celebrate achievements with virtual trophies

### Social Features
- **Gym Buddy System**: Connect with fellow students for workout partnerships
- **Friend Activity Feed**: See when friends are working out
- **Workout Sharing**: Share achievements and progress with the community
- **Online Status**: Real-time indicators for friend availability

### Modern UI/UX
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark Theme**: Eye-friendly dark interface with golden accents
- **Interactive Components**: Drag-and-drop functionality, carousels, and popovers
- **Smooth Animations**: Engaging transitions and micro-interactions

## 🛠️ Technology Stack

### Frontend Framework
- **Next.js 14.1.0**: React framework with App Router for optimal performance
- **React 18.2.0**: Modern React with hooks and concurrent features
- **TypeScript 5**: Type-safe development for better code quality

### Styling & UI
- **Tailwind CSS 3.4.1**: Utility-first CSS framework for rapid styling
- **Heroicons**: Beautiful SVG icons from the Heroicons library
- **Custom Gradients**: Sophisticated visual design with golden accents

### Data Visualization
- **Chart.js 4.4.9**: Interactive charts and graphs
- **React Chart.js 2**: React wrapper for Chart.js
- **Plotly.js 3.x**: Advanced, interactive analytics (heatmaps, timelines)
- **React Plotly.js**: Plotly React bindings used in `RSFOccupancyAnalysis`
- **Line & Doughnut Charts**: Progress tracking and analytics visualization

### Interactive Components
- **React DnD**: Drag and drop functionality for calendar management
- **Embla Carousel**: Smooth carousel components for content browsing
- **React Tiny Popover**: Contextual popovers for enhanced UX

### External Integrations
- **Google OAuth**: Authentication and calendar integration
- **Google Calendar API**: Sync personal events and RSF classes
- **Vercel Analytics**: Performance monitoring and user behavior tracking

### Development Tools
- **PostCSS**: CSS processing and optimization
- **ESLint**: Code quality and consistency
- **Autoprefixer**: CSS vendor prefixing

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun package manager
- Google Cloud Platform account (for OAuth and Calendar API)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with:
   ```env
   # Google OAuth (client + server)
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_oauth_client_secret
   # Optional (production override)
   # GOOGLE_REDIRECT_URI=https://your-domain.com/google-callback

   # Firebase (client-side SDK)
   NEXT_PUBLIC_FIREBASE_API_KEY=xxx
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
   NEXT_PUBLIC_FIREBASE_APP_ID=1:xxx:web:xxx
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application

### RSF Occupancy Data (for analytics)

The RSF occupancy analytics rely on a CSV file located at `RSF_Analysis/scraped_data2.csv`.

- Ensure the file exists at that exact path before using the RSF analytics card.
- You can generate/update this file using the utilities in the `RSF_Analysis` folder (e.g., notebooks or scripts).
- The API `GET /api/rsf-occupancy` processes this CSV to power the dashboard visualizations.

## Project Structure

```
dashboard/
├── src/
│   └── app/
│       ├── layout.tsx          # Root layout with metadata and analytics
│       ├── page.tsx            # Main dashboard component
│       ├── preview/
│       │   └── page.tsx        # Preview page for testing
│       └── globals.css         # Global styles and Tailwind imports
├── public/                     # Static assets (SVG icons)
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Project documentation
```

## Design Philosophy

### Visual Identity
- **Color Scheme**: Dark theme with golden accents (#000000, #0b1939, #fde047)
- **Typography**: Clean, modern fonts optimized for readability
- **Icons**: Consistent iconography using Heroicons
- **Animations**: Subtle, purposeful animations that enhance UX

### User Experience
- **Intuitive Navigation**: Clear information hierarchy and logical flow
- **Responsive Design**: Seamless experience across all device sizes
- **Accessibility**: WCAG compliant design with proper contrast and keyboard navigation
- **Performance**: Optimized loading times and smooth interactions

## 🔧 Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server (port 3001)
npm run lint     # Run ESLint for code quality
```

## API Routes

These server routes back the Google Calendar integration and RSF analytics.

- `POST /api/google-calendar/auth`
  - Body: `{ code?: string, accessToken?: string }`
  - If `code` is provided, exchanges it for tokens and returns calendars.
  - If `accessToken` is provided (no `code`), returns the user's calendars.

- `GET /api/google-calendar/auth?accessToken=...&calendarId=...`
  - Returns events for the specified calendar.

- `POST /api/google-calendar/create-event`
  - Body: `{ accessToken, calendarId, summary, description?, startDateTime, endDateTime, location? }`
  - Creates a calendar event (timezone: America/Los_Angeles by default).

- `POST /api/google-calendar/refresh`
  - Body: `{ refreshToken }`
  - Returns a refreshed access token.

- `GET /api/rsf-occupancy`
  - Processes `RSF_Analysis/scraped_data2.csv` and returns heatmap/timeline data.

## Documentation

- Google Calendar setup: `GOOGLE_CALENDAR_SETUP.md`
- Google Calendar integration details: `GOOGLE_CALENDAR_INTEGRATION.md`
- Google Calendar UI components: `GOOGLE_CALENDAR_COMPONENTS.md`

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

### Manual Deployment
```bash
npm run build
npm run start
```

## 🤝 Contributing

We welcome contributions from the UC Berkeley community! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Future Roadmap

### Phase 2 Features
- **RSF API Integration**: Real-time class availability and booking
- **Nutrition Tracking**: Meal planning and calorie tracking
- **Workout Templates**: Pre-built workout routines for different goals
- **Group Challenges**: Community fitness challenges and competitions

### Phase 3 Features
- **Mobile App**: Native iOS and Android applications
- **Wearable Integration**: Apple Watch and Fitbit connectivity
- **AI Recommendations**: Personalized workout and nutrition suggestions
- **Advanced Analytics**: Machine learning insights for fitness optimization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**MJROBILLARD** - UC Berkeley Student Developer

---

