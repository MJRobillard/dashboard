import React from 'react';

interface CalendarDayType {
  date: string;
  events: any[];
  dayName: string;
  isToday: boolean;
}

interface RsfScheduleCardProps {
  generateCalendarDays: () => CalendarDayType[];
  MemoizedCalendarDay: React.FC<any>;
  CalendarCarousel: React.FC<any>;
}

const RsfScheduleCard: React.FC<RsfScheduleCardProps> = ({ generateCalendarDays, MemoizedCalendarDay, CalendarCarousel }) => (
  <CalendarCarousel title="RSF Class Schedule" subtitle="Browse and join group fitness classes">
    {generateCalendarDays().map(day => (
      <MemoizedCalendarDay key={day.date} {...day} />
    ))}
  </CalendarCarousel>
);

export default RsfScheduleCard; 