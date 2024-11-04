"use client";
import { useContext, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GlobalContext } from '@/lib/GlobalState';
import { PopupBox } from './PopupBox';
import { Event } from './Event';
import { CalendarTopBar } from './CallendarTopBar';
import { Spinner } from './Spinner';

export const MyCalendar = () => {
  const { actualDate, setActualEditDate, calendarView, idUserList, ListUsers, listEvent, setListEvent , setMe, setIsDialogOpen, hoursAddEvent, setHoursAddEvent } = useContext(GlobalContext);
  const [calendarData, setCalendarData] = useState([]);
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

      if (!res.ok) {
        throw new Error('Token invalide ou expiré');
      }

      const data = await res.json();
      
      setMe(data.user)
      setLoading(false);
    } catch (error) {
      router.push('/login');
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  const fetchEvents = async (date) => {
    const baseDate = new Date(date);
    let startDate, endDate;

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
    } else if (calendarView === "day") {
      startDate = baseDate.toISOString().split('T')[0];
      endDate = baseDate.toISOString().split('T')[0];
    }

    const res = await fetch(`/api/events?startDate=${startDate}&endDate=${endDate}`);

    if (!res.ok) {
      console.error('Erreur lors de la récupération des événements:', res.statusText);
      return [];
    }

    try {
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Erreur lors du parsing JSON:', error);
      return [];
    }
  };

  const updateEventDate = async (eventId, newDate) => {
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
      const updatedEvent = await res.json();
      return updatedEvent;
    } catch (error) {
      console.error(error);
    }
  };

  const updateEventDebutAt = async (eventId, newDebutAt) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ debutAt: newDebutAt }),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour de l'événement");
      const updatedEvent = await res.json();
      return updatedEvent;
    } catch (error) {
      console.error(error);
    }
  };

  const generateMonthView = async (date) => {
    const today = new Date();
    const firstDayOfMonth = new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
    const lastDayOfMonth = new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0));

    const daysBefore = (firstDayOfMonth.getUTCDay() + 6) % 7;
    let daysAfter = 42 - (daysBefore + lastDayOfMonth.getUTCDate());
    while (daysAfter >= 7) daysAfter -= 7;

    const afterDays = [];
    for (let i = 1; i <= daysAfter; i++) {
        afterDays.push(new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, i)));
    }

    setNbtLigne((daysBefore + lastDayOfMonth.getUTCDate() + daysAfter) / 7);

    const calendarDays = [];

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

  const generateWeekView = async (date) => {
    const calendarDays = [];
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

  const generateDayView = async (date) => {
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

  const generateCalendar = async (date) => {
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

  const handleDragStart = (event) => {
    const eventBox = event.target.getBoundingClientRect();
    offsetYRef.current = event.clientY - eventBox.top;
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDragEnd = () => {
    document.querySelectorAll('.event').forEach((el) => {
      el.classList.remove('notDrag');
      el.classList.remove('isDrag');
    });
  };

  const handleDrop = async (event, newDay) => {
    const eventId = event.dataTransfer.getData('eventId');
    const oldDay = parseInt(event.dataTransfer.getData('oldDay'), 10);
    const newDate = new Date(Date.UTC(actualDate.getFullYear(), actualDate.getMonth(), newDay));

    let hour = 0;
    let minutes = 0;
    if (calendarView === 'week' || calendarView === 'day') {
      const hoursContainer = event.currentTarget.querySelector('.hours-container');
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

  const renderHourLabels = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(
        <div key={`label-hour-${i}`} className="flex text-[.65rem] flex-col justify-center items-center h-[10vh] border-t border-gray-300">
          <div>{i}:00</div>
        </div>
      );
    }
    return hours;
  };

  const renderTimeSlots = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(
        <div key={`hour-${i}`} className="flex flex-col border-t border-gray-300 h-[5vh]">
          <div className="half-hour h-1/2 border-b border-gray-200"></div>
          <div className="half-hour h-1/2"></div>
        </div>
      );
    }
    return hours;
  };

  const handleDoubleClick = async (dayInfo, event) => {
    let hour = null, minutes = null;
    if(calendarView !== 'month') {
      if (calendarView === 'week' || calendarView === 'day') {
        const hoursContainer = event.currentTarget.querySelector('.hours-container');
        if (hoursContainer) {
          const rect = hoursContainer.getBoundingClientRect();
          const offsetY = event.clientY - rect.top;
          const totalHeight = rect.height;
          const totalSlots = 48;
          const slot = Math.floor((offsetY / totalHeight) * totalSlots);
          hour = (Math.floor(slot / 2)) + '';
          minutes = ((slot % 2) * 30)  + '';
        }
      }
      const heureAddEvent = `${hour.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
      await setHoursAddEvent(heureAddEvent)
      console.log(heureAddEvent);
      
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
        <Spinner /> {/* Icône de chargement */}
      </div>
    );
  }

  return (
    <>
      <div className={`p-1 w-full h-full flex${calendarView !== 'month' ? ' overflow-x-hidden': ''}`}>
        {calendarView !== 'month' && (
          <div className="listHeure w-[3rem] flex flex-col">
            {renderHourLabels()}
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
                className={`border border-gray-100 flex flex-col ${
                  dayInfo.isCurrentMonth ? 'bg-white text-black' : 'bg-gray-100 text-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragStart={(e) => handleDragStart(e)}
                onDrop={(event) => handleDrop(event, dayInfo.day)}
                onDoubleClick={(event) => handleDoubleClick(dayInfo, event)}
              >
                <div className={`dayNumber${dayInfo.isToday ? ' inDay' : ''}`}>
                  {dayInfo.day}
                </div>

                {calendarView === 'month' && (
                  <div className="events-container mt-1 overflow-x-hidden max-h-[12vh]">
                    {listEvent.filter(event => {
                        const eventDate = new Date(event.date);
                        const dayDate = new Date(dayInfo.date);

                        const isSameDay = eventDate.getUTCFullYear() === dayDate.getUTCFullYear() &&
                                          eventDate.getUTCMonth() === dayDate.getUTCMonth() &&
                                          eventDate.getUTCDate() === dayDate.getUTCDate();

                        const userIds = event.userId.split('/').map(id => parseInt(id));
                        const hasMatchingUser = userIds.some(userId => idUserList.includes(userId));

                        return isSameDay && hasMatchingUser;
                      })
                      .slice(0, 2).map((event, eventIndex) => {
                        const eventDebut = new Date(event.debutAt);
                        const user = ListUsers.filter(use => use.id === parseInt(event.userId));
                        const formattedHour = eventDebut.getUTCHours().toString().padStart(2, '0');
                        const formattedMinutes = eventDebut.getUTCMinutes().toString().padStart(2, '0');

                        const userIds = event.userId.split('/').map(id => parseInt(id));

                        return (
                          <Event
                            style={{ '--c': user[0].color }}
                            key={eventIndex}
                            eventKey={event.id}
                            event={event}
                            formattedHour={formattedHour}
                            formattedMinutes={formattedMinutes}
                            eventIndex={eventIndex}
                            className={`event${event.fullDay ? ' fullDay' : ''}${userIds.length > 1 ? ' groupe' : ''} p-1 mb-1 rounded`}
                          />
                        );
                      })}
                    {listEvent.filter(event => {
                      const eventDate = new Date(event.date);
                      const dayDate = new Date(dayInfo.date);

                      const isSameDay = eventDate.getUTCFullYear() === dayDate.getUTCFullYear() &&
                                        eventDate.getUTCMonth() === dayDate.getUTCMonth() &&
                                        eventDate.getUTCDate() === dayDate.getUTCDate();
                      const userIds = event.userId.split('/').map(id => parseInt(id));
                      const hasMatchingUser = userIds.some(userId => idUserList.includes(userId));

                      return isSameDay && hasMatchingUser;
                    }).length > 2 && (
                      <div className="more-events text-xs text-gray-500">
                        +{listEvent.filter(event => {
                          const eventDate = new Date(event.date);
                          const dayDate = new Date(dayInfo.date);

                          const isSameDay = eventDate.getUTCFullYear() === dayDate.getUTCFullYear() &&
                                            eventDate.getUTCMonth() === dayDate.getUTCMonth() &&
                                            eventDate.getUTCDate() === dayDate.getUTCDate();
                          const userIds = event.userId.split('/').map(id => parseInt(id));
                          const hasMatchingUser = userIds.some(userId => idUserList.includes(userId));

                          return isSameDay && hasMatchingUser;
                        }).length - 2} autres
                      </div>
                    )}
                  </div>
                )}

                {calendarView === 'week' && (
                  <div className="hours-container flex-grow overflow-auto relative">
                    {renderTimeSlots()}
                    <div className="absolute inset-0 overflow-hidden">
                      {listEvent.map((event, eventIndex) => {
                        const eventDate = new Date(event.date);
                        const dayDate = new Date(dayInfo.date);

                        const isSameDay = eventDate.getUTCFullYear() === dayDate.getUTCFullYear() &&
                                          eventDate.getUTCMonth() === dayDate.getUTCMonth() &&
                                          eventDate.getUTCDate() === dayDate.getUTCDate();

                        if(isSameDay && idUserList.includes(parseInt(event.userId))) {
                          const eventDebut = new Date(event.debutAt);
                          const eventFin = new Date(event.finAt);
                          const user = ListUsers.filter(use => use.id === parseInt(event.userId));
                          const top = (eventDebut.getUTCHours() + eventDebut.getUTCMinutes() / 60) * 5;
                          const duration = (eventFin.getTime() - eventDebut.getTime()) / (1000 * 60 * 60);
                          const height = duration * 5;

                          const formattedHour = eventDebut.getUTCHours().toString().padStart(2, '0');
                          const formattedMinutes = eventDebut.getUTCMinutes().toString().padStart(2, '0');

                          const userIds = event.userId.split('/').map(id => parseInt(id));

                          return (
                            <Event
                              style={{ top: `${top}vh`, height: `${height}vh`, zIndex: 50 - (duration * 2), '--c': user[0].color }}
                              key={eventIndex}
                              eventKey={event.id}
                              event={event}
                              formattedHour={formattedHour}
                              formattedMinutes={formattedMinutes}
                              eventIndex={eventIndex}
                              className={`event${userIds.length > 1 ? ' groupe' : ''} editable absolute left-0 w-full overflow-x-hidden`}
                              heightEditable={(event.fullDay) ? '' : 'true'}
                            />
                          );
                        }
                      })}
                    </div>
                  </div>
                )}

                {calendarView === 'day' && (
                  <div className="hours-container flex-grow overflow-auto relative">
                    {renderTimeSlots()}
                    <div className="absolute inset-0 overflow-hidden">
                      {listEvent.map((event, eventIndex) => {
                        const eventDate = new Date(event.date);
                        const dayDate = new Date(dayInfo.date);

                        const isSameDay = eventDate.getUTCFullYear() === dayDate.getUTCFullYear() &&
                                          eventDate.getUTCMonth() === dayDate.getUTCMonth() &&
                                          eventDate.getUTCDate() === dayDate.getUTCDate();

                        if(isSameDay && idUserList.includes(event.userId)) {
                          const eventDebut = new Date(event.debutAt);
                          const eventFin = new Date(event.finAt);
                          const user = ListUsers.filter(use => use.id === event.userId);
                          const top = (eventDebut.getUTCHours() + eventDebut.getUTCMinutes() / 60) * 5;
                          const duration = (eventFin.getTime() - eventDebut.getTime()) / (1000 * 60 * 60);
                          const height = duration * 5;

                          const formattedHour = eventDebut.getUTCHours().toString().padStart(2, '0');
                          const formattedMinutes = eventDebut.getUTCMinutes().toString().padStart(2, '0');

                          return (
                            <Event
                              style={{ top: `${top}vh`, height: `${height}vh`, '--c': user[0].color }}
                              key={eventIndex}
                              eventKey={event.id}
                              event={event}
                              formattedHour={formattedHour}
                              formattedMinutes={formattedMinutes}
                              eventIndex={eventIndex}
                              className="event editable absolute left-0 w-full overflow-x-hidden"
                              heightEditable="true"
                            />
                          );
                        }
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <PopupBox heureAddEvent={hoursAddEvent} />
      </div>
    </>
  );
};
