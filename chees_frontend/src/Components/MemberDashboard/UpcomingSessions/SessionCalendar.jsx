import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './Sessions.css';

const SessionCalendar = ({ sessions, onDaySelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Generate calendar data
  const calendarData = generateCalendarData(currentDate, sessions);
  
  const handleDateSelect = (day) => {
    // Only allow selecting days in the current month that have sessions
    if (day.isCurrentMonth && day.hasSessions) {
      setSelectedDate(day.date);
      onDaySelect(day.date);
    }
  };
  
  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };
  
  const prevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };
  
  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  return (
    <div className="calendar-container">
      <div className="calendar-controls">
        <h3 className="calendar-title">{formatMonth(currentDate)}</h3>
        <div className="calendar-navigation">
          <button className="calendar-button" onClick={prevMonth}>
            <FiChevronLeft />
          </button>
          <button className="calendar-button" onClick={() => setCurrentDate(new Date())}>
            Today
          </button>
          <button className="calendar-button" onClick={nextMonth}>
            <FiChevronRight />
          </button>
        </div>
      </div>
      
      <div className="calendar-day-names">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={index} className="calendar-day-name">{day}</div>
        ))}
      </div>
      
      <div className="calendar-grid">
        {calendarData.map((day, index) => {
          const isSelected = selectedDate && 
            day.date.getDate() === selectedDate.getDate() && 
            day.date.getMonth() === selectedDate.getMonth() && 
            day.date.getFullYear() === selectedDate.getFullYear();
            
          const isToday = day.isToday;
          
          return (
            <div 
              key={index} 
              className={`calendar-day ${
                day.isCurrentMonth ? 'current-month' : 'other-month'
              } ${isToday ? 'today' : ''} ${
                day.hasSessions ? 'has-session' : ''
              } ${isSelected ? 'selected' : ''}`}
              onClick={() => handleDateSelect(day)}
            >
              <div className="calendar-day-number">{day.date.getDate()}</div>
              {day.hasSessions && (
                <div className="calendar-day-events">
                  {day.eventCount > 3 
                    ? <React.Fragment>
                        <div className="calendar-day-event-marker"></div>
                        <div className="calendar-day-event-marker"></div>
                        <div className="calendar-day-event-marker"></div>
                      </React.Fragment>
                    : Array(day.eventCount).fill(0).map((_, i) => (
                        <div key={i} className="calendar-day-event-marker"></div>
                      ))
                  }
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper function to generate calendar data
function generateCalendarData(currentDate, sessions) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Get the first day of the month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  // Array to hold all calendar dates
  const calendarDays = [];
  
  // Add days from previous month to fill the first week
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i);
    calendarDays.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, new Date()),
      hasSessions: false,
      eventCount: 0
    });
  }
  
  // Add days for current month
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const date = new Date(year, month, day);
    const sessionForDate = sessions.filter(session => isSameDay(new Date(session.start_time), date));
    
    calendarDays.push({
      date,
      isCurrentMonth: true,
      isToday: isSameDay(date, new Date()),
      hasSessions: sessionForDate.length > 0,
      eventCount: sessionForDate.length
    });
  }
  
  // Add days from next month to complete the calendar (ensuring we have 6 weeks)
  const daysToAdd = 42 - calendarDays.length;
  for (let day = 1; day <= daysToAdd; day++) {
    const date = new Date(year, month + 1, day);
    calendarDays.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, new Date()),
      hasSessions: false,
      eventCount: 0
    });
  }
  
  return calendarDays;
}

// Helper function to check if two dates are the same day
function isSameDay(date1, date2) {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
}

export default SessionCalendar;
