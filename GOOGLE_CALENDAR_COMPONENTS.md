# Google Calendar Components & Features

## 🎯 Overview

Your Fitness Dashboard now has a comprehensive set of Google Calendar components and features for experimenting with personal scheduling. Here's everything you can play with:

## 📦 Available Components

### 1. **React Big Calendar** (`react-big-calendar`)
- **Full-featured calendar component** with multiple views
- **Views**: Month, Week, Day, Agenda
- **Features**: Drag & drop, event creation, navigation
- **Custom styling** to match your app's dark theme
- **Event type distinction**: Personal (blue), Google (green), RSF (yellow)

### 2. **Timeline View** (Custom)
- **Weekly timeline** with hourly time slots (6 AM - 10 PM)
- **Visual grid** showing events by day and time
- **Color-coded events** by type
- **Responsive design** with horizontal scrolling

### 3. **Google Calendar iframe**
- **Embedded Google Calendar** view
- **Real-time sync** with your Google account
- **Multiple calendar support**
- **Full Google Calendar functionality**

### 4. **Personal Schedule Grid** (Existing)
- **Custom weekly view** with drag & drop
- **Time slot management** (6 AM - 10 PM)
- **Event creation** and editing
- **Integration** with Google Calendar events

## 🔧 Core Features

### Authentication & Integration
- **OAuth 2.0** secure authentication
- **Token management** with automatic refresh
- **Multiple calendar support**
- **Real-time event fetching**

### Event Management
- **Event conversion** between formats
- **Type distinction**: Personal vs Google vs RSF
- **Time parsing** and formatting
- **All-day event support**

### UI/UX Features
- **Dark theme** with yellow accents
- **Responsive design**
- **Smooth animations** and transitions
- **Custom scrollbars**
- **Hover effects** and visual feedback

## 🚀 How to Experiment

### 1. **Main Dashboard Integration**
The enhanced Google Calendar views are now integrated into your main dashboard:
```tsx
<GoogleCalendarViews 
  personalEvents={personalEvents}
  setPersonalEvents={setPersonalEvents}
  combinedEvents={combinedEvents}
/>
```

### 2. **Demo Page**
Visit `/calendar-demo` to see all components in action:
- Full component showcase
- Connection status
- Usage examples
- Feature documentation

### 3. **Component Customization**
You can customize each component by modifying:
- `src/app/components/GoogleCalendarViews.tsx` - Main component
- `src/app/components/CalendarStyles.css` - React Big Calendar styling
- `src/app/contexts/GoogleCalendarContext.tsx` - Context and logic

## 🎨 Styling Options

### React Big Calendar Themes
The calendar is styled with your app's theme:
- **Background**: Dark gradients with transparency
- **Headers**: Yellow accents (`#fdb515`)
- **Events**: Color-coded by type
- **Buttons**: Hover effects and transitions

### Custom CSS Classes
```css
.rbc-event.google-event    /* Green for Google events */
.rbc-event.personal-event  /* Blue for personal events */
.rbc-event.rsf-event       /* Yellow for RSF events */
```

## 📱 Responsive Design

All components are fully responsive:
- **Mobile**: Stacked layouts, touch-friendly
- **Tablet**: Optimized spacing and sizing
- **Desktop**: Full feature set with hover effects

## 🔄 Event Flow

1. **Google Calendar Events** → Fetched via API
2. **Event Conversion** → Converted to app format
3. **Combined Display** → Mixed with personal events
4. **Visual Distinction** → Color-coded by type
5. **User Interaction** → Drag, drop, create, edit

## 🛠️ Technical Stack

- **React Big Calendar**: `react-big-calendar@1.19.3`
- **Google APIs**: `googleapis@150.0.1`
- **OAuth**: `@react-oauth/google@0.12.2`
- **Date Handling**: `moment@2.30.1`
- **Styling**: Custom CSS + Tailwind

## 🎯 Next Steps for Experimentation

### 1. **Add New Views**
- Create custom calendar views
- Add agenda/list views
- Implement mini-calendar widgets

### 2. **Enhanced Interactions**
- Event editing in-place
- Recurring event support
- Event templates
- Bulk operations

### 3. **Advanced Features**
- Event reminders
- Calendar sharing
- Event conflicts detection
- Smart scheduling suggestions

### 4. **Integration Ideas**
- Weather integration
- Location-based suggestions
- Social features
- Analytics and insights

## 📁 File Structure

```
src/app/
├── components/
│   ├── GoogleCalendarViews.tsx    # Main component
│   └── CalendarStyles.css         # Custom styling
├── contexts/
│   └── GoogleCalendarContext.tsx  # State management
├── utils/
│   └── googleCalendar.ts          # Utility functions
├── lib/
│   └── googleCalendarServer.ts    # Server-side logic
└── calendar-demo/
    └── page.tsx                   # Demo page
```

## 🎉 Ready to Play!

You now have a complete Google Calendar integration with multiple view options, custom styling, and full functionality. Start experimenting with the different views and features to see what works best for your personal schedule management! 