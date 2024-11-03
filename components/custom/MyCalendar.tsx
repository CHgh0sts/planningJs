"use client";
import { useContext, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GlobalContext } from '@/lib/GlobalState';
import { PopupBox } from './PopupBox';
import { Event } from './Event';
import { CalendarTopBar } from './CallendarTopBar';
import { Spinner } from './Spinner';

interface DayInfo {
  day: number;
  date?: Date;
  isCurrentMonth: boolean;
  isToday?: boolean;
  events: any[];
}

export const MyCalendar = () => {
  const { actualDate, setActualEditDate, calendarView, idUserList, ListUsers, listEvent, setListEvent, setMe, setIsDialogOpen, hoursAddEvent, setHoursAddEvent } = useContext(GlobalContext);
  const [calendarData, setCalendarData] = useState<DayInfo[]>([]);
  const [nbtLigne, setNbtLigne] = useState(5);
  const [loading, setLoading] = useState(true);
  const offsetYRef = useRef(0);
  const router = useRouter();

  const verifyToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/account/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Token invalide ou expiré');

      const data = await res.json();
      setMe(data.user);
      setLoading(false);
    } catch {
      router.push('/login');
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  const fetchEvents = async (date: Date) => {
    const baseDate = new Date(date);
    let startDate: string, endDate: string;

    if (calendarView === "month") {
      const firstDayOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
      const lastDayOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
      startDate = firstDayOfMonth.toISOString().split('T')[0];
      endDate = lastDayOfMonth.toISOString().split('T')[0];
    } else if (calendarView === "week") {
      const currentDay = baseDate.getDay();
      const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      const firstDayOfWeek = new Date(baseDate);
      firstDayOfWeek.setDate(baseDate.getDate() + diffToMonday);
      const lastDayOfWeek = new Date(firstDayOfWeek);
      lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
      startDate = firstDayOfWeek.toISOString().split('T')[0];
      endDate = lastDayOfWeek.toISOString().split('T')[0];
    } else {
      startDate = baseDate.toISOString().split('T')[0];
      endDate = baseDate.toISOString().split('T')[0];
    }

    const res = await fetch(`/api/events?startDate=${startDate}&endDate=${endDate}`);
    if (!res.ok) return [];

    try {
      return await res.json();
    } catch {
      return [];
    }
  };

  const updateEventDate = async (eventId: string, newDate: Date) => {
    try {
      const formattedNewDate = newDate.toISOString();
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: formattedNewDate }),
      });
      if (!res.ok) throw new Error('Erreur lors de la mise à jour de la date de l\'événement');
      return await res.json();
    } catch (error) {
      console.error(error);
    }
  };

  const updateEventDebutAt = async (eventId: string, newDebutAt: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ debutAt: newDebutAt }),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour de l'événement");
      return await res.json();
    } catch (error) {
      console.error(error);
    }
  };

  const generateMonthView = async (date: Date) => {
    const today = new Date();
    const firstDayOfMonth = new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
    const lastDayOfMonth = new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0));

    const daysBefore = (firstDayOfMonth.getUTCDay() + 6) % 7;
    let daysAfter = 42 - (daysBefore + lastDayOfMonth.getUTCDate());
    while (daysAfter >= 7) daysAfter -= 7;

    const afterDays: Date[] = [];
    for (let i = 1; i <= daysAfter; i++) {
        afterDays.push(new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, i)));
    }

    setNbtLigne((daysBefore + lastDayOfMonth.getUTCDate() + daysAfter) / 7);

    const calendarDays: DayInfo[] = [];

    const previousMonthLastDay = new Date(Date.UTC(date.getFullYear(), date.getMonth(), 0)).getUTCDate();
    for (let i = daysBefore; i > 0; i--) {
      calendarDays.push({
        day: previousMonthLastDay - i + 1,
        isCurrentMonth: false,
        events: [],
      });
    }
    for (let i = 1; i <= lastDayOfMonth.getUTCDate(); i++) {
      const isToday = i === today.getUTCDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
      const currentDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), i));
      calendarDays.push({
        date: currentDate,
        day: i,
        isCurrentMonth: true,
        isToday,
        events: [],
      });
    }
    for (let i = 1; i <= daysAfter; i++) {
      calendarDays.push({
        day: i,
        isCurrentMonth: false,
        events: [],
      });
    }
    return calendarDays;
  };

  const generateWeekView = async (date: Date) => {
    const calendarDays: DayInfo[] = [];
    const startOfWeek = new Date(date);
    const today = new Date();
    const dayOfWeek = startOfWeek.getUTCDay();
    const difference = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() + difference);

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setUTCDate(startOfWeek.getUTCDate() + i);

      const isToday = currentDate.getUTCFullYear() === today.getUTCFullYear() &&
                      currentDate.getUTCMonth() === today.getUTCMonth() &&
                      currentDate.getUTCDate() === today.getUTCDate();

      calendarDays.push({
        date: currentDate,
        day: currentDate.getUTCDate(),
        isCurrentMonth: currentDate.getUTCMonth() === date.getUTCMonth(),
        isToday: isToday,
        events: [],
      });
    }

    return calendarDays;
  };

  const generateDayView = async (date: Date) => {
    const startOfDay = new Date(date);
    const currentDate = new Date(startOfDay);
    const today = new Date();

    const isToday = currentDate.getUTCFullYear() === today.getUTCFullYear() &&
                      currentDate.getUTCMonth() === today.getUTCMonth() &&
                      currentDate.getUTCDate() === today.getUTCDate();
    return [{
      date: date,
      day: date.getUTCDate(),
      isCurrentMonth: true,
      isToday,
      events: [],
    }];
  };

  const generateCalendar = async (date: Date) => {
    switch (calendarView) {
      case 'month':
        return generateMonthView(date);
      case 'week':
        return generateWeekView(date);
      case 'day':
        return generateDayView(date);
      default:
        return generateMonthView(date);
    }
  };

  const handleDragStart = (event: React.DragEvent) => {
    const eventBox = (event.target as HTMLElement).getBoundingClientRect();
    offsetYRef.current = event.clientY - eventBox.top;
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDragEnd = () => {
    document.querySelectorAll('.event').forEach((el) => {
      el.classList.remove('notDrag');
      el.classList.remove('isDrag');
    });
  };

  const handleDrop = async (event: React.DragEvent, newDay: number) => {
    const eventId = event.dataTransfer.getData('eventId');
    const newDate = new Date(Date.UTC(actualDate.getFullYear(), actualDate.getMonth(), newDay));

    let hour = 0;
    let minutes = 0;
    if (calendarView === 'week' || calendarView === 'day') {
      const hoursContainer = (event.currentTarget as HTMLElement).querySelector('.hours-container') as HTMLElement;
      if (hoursContainer) {
        const rect = hoursContainer.getBoundingClientRect();
        const offsetY = event.clientY - rect.top - offsetYRef.current;
        const totalHeight = rect.height;
        const totalSlots = 48;
        const slot = Math.floor((offsetY / totalHeight) * totalSlots);
        hour = Math.floor(slot / 2);
        minutes = (slot % 2) * 30;
      }
      if (hour >= 24) {
        hour = 0;
        minutes = 0;
      }
      if (hour < 0) {
        hour = 0;
        minutes = 0;
      }
      if (minutes < 0) minutes *= -1;
    }

    let updatedEvent = await updateEventDate(eventId, newDate);

    if (calendarView === 'week' || calendarView === 'day') {
      const newDateString = newDate.toISOString().split('T')[0] + `T${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00.000Z`;

      updatedEvent = await updateEventDebutAt(eventId, newDateString);
    }

    recupEvents();
  };

  const handleDoubleClick = async (dayInfo: DayInfo, event: React.MouseEvent) => {
    let hour: string | null = null, minutes: string | null = null;
    if(calendarView !== 'month') {
      if (calendarView === 'week' || calendarView === 'day') {
        const hoursContainer = (event.currentTarget as HTMLElement).querySelector('.hours-container') as HTMLElement;
        if (hoursContainer) {
          const rect = hoursContainer.getBoundingClientRect();
          const offsetY = event.clientY - rect.top;
          const totalHeight = rect.height;
          const totalSlots = 48;
          const slot = Math.floor((offsetY / totalHeight) * totalSlots);
          hour = (Math.floor(slot / 2)).toString();
          minutes = ((slot % 2) * 30).toString();
        }
      }
      const heureAddEvent = `${hour?.padStart(2, '0')}:${minutes?.padStart(2, '0')}`;
      await setHoursAddEvent(heureAddEvent);
    }
    const addEventInDate = new Date(Date.UTC(actualDate.getFullYear(), actualDate.getMonth(), dayInfo.day)).toISOString().split('T')[0];
    
    await setActualEditDate(addEventInDate);
    setTimeout(() => setIsDialogOpen(true), 10);
  };

  const recupEvents = async () => {
    const listEvents = await fetchEvents(actualDate);
    setListEvent(listEvents);
  };

  useEffect(() => {
    if (actualDate) {
      generateCalendar(actualDate).then(setCalendarData);
    }
  }, [actualDate, calendarView]);

  useEffect(() => {
    recupEvents();
  }, [actualDate, calendarView, idUserList]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className={`p-1 w-full h-full flex${calendarView !== 'month' ? ' overflow-x-hidden' : ''}`}>
      {calendarView !== 'month' && (
        <div className="listHeure w-[3rem] flex flex-col">
          {/* Render hour labels here */}
        </div>
      )}
      <div className="flex relative w-full h-full flex-col">
        <CalendarTopBar />
        <div
          className={`
            ${calendarView === 'month' ? `grid grid-cols-7 grid-rows-${nbtLigne}` : ''}
            ${calendarView === 'week' ? 'grid grid-cols-7' : ''}
            ${calendarView === 'day' ? 'grid grid-cols-1' : ''}
            gap-0 border border-gray-200 rounded-lg h-full flex-grow
          `}
        >
          {calendarData.map((dayInfo, index) => (
            <div
              key={index}
              className={`border border-gray-100 flex flex-col ${dayInfo.isCurrentMonth ? 'bg-white text-black' : 'bg-gray-100 text-gray-400'}`}
              onDragOver={handleDragOver}
              onDragStart={handleDragStart}
              onDrop={(event) => handleDrop(event, dayInfo.day)}
              onDoubleClick={(event) => handleDoubleClick(dayInfo, event)}
            >
              <div className={`dayNumber${dayInfo.isToday ? ' inDay' : ''}`}>
                {dayInfo.day}
              </div>
              {/* Render events */}
            </div>
          ))}
        </div>
      </div>
      <PopupBox heureAddEvent={hoursAddEvent} />
    </div>
  );
};
