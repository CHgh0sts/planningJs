"use client";
import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '@/lib/GlobalState';
import { Event } from './Event';
import { Button } from '../ui/button';
import { PanelLeftClose, PanelRightClose, Calendar } from "lucide-react"

export const RightBar = () => {
  const { rightBar, setRightBar, idUserList, ListUsers, listEvent, calendarView } = useContext(GlobalContext);
  const [eventsForDay, setEventsForDay] = useState([]);

  const fetchEventsForDay = async () => {
    if (rightBar && typeof rightBar === 'number') {
      try {
        const res = await fetch(`/api/eventsForDay?eventId=${rightBar}`);
        if (!res.ok) throw new Error('Erreur lors de la récupération des événements');
        const events = await res.json();
        
        setEventsForDay(events);
      } catch (error) {
        console.error('Erreur lors de la récupération des événements :', error);
      }
    } else {
      setEventsForDay([]);
    }
  };

  useEffect(() => {
    fetchEventsForDay();
  }, [rightBar, listEvent]);

  useEffect(() => {
    if(calendarView !== 'month') setRightBar(false)
  }, [rightBar, calendarView])

  return (
    <>
      <div className={rightBar ? "RightBar open" : "RightBar"}>
        {eventsForDay.length > 0 ? (
          eventsForDay.map((event, eventIndex) => {
            const eventDate = new Date(event.date);
            const dayDate = new Date(event.date);
            const isSameDay =
              eventDate.getUTCFullYear() === dayDate.getUTCFullYear() &&
              eventDate.getUTCMonth() === dayDate.getUTCMonth() &&
              eventDate.getUTCDate() === dayDate.getUTCDate();

            // Traitement des userId multiples (séparés par "/")
            const userIds = event.userId.split('/').map(id => parseInt(id));

            // Vérification si un ou plusieurs utilisateurs de idUserList sont dans userIds
            const usersInEvent = userIds.filter(userId => idUserList.includes(userId));

            if (isSameDay && usersInEvent.length > 0) {
              const eventDebut = new Date(event.debutAt);
              const users = usersInEvent.map(userId => ListUsers.find((use) => use.id === userId));
              const formattedHour = eventDebut.getUTCHours().toString().padStart(2, "0");
              const formattedMinutes = eventDebut.getUTCMinutes().toString().padStart(2, "0");

              return (
                <Event
                  style={{ "--c": users[0]?.color }} // Prend la couleur du premier utilisateur correspondant
                  key={eventIndex}
                  eventKey={event.id}
                  event={event}
                  formattedHour={formattedHour}
                  formattedMinutes={formattedMinutes}
                  eventIndex={eventIndex}
                  className={`event listing ${event.fullDay ? "fullDay" : ""} p-1 mb-1 rounded`}
                />
              );
            }
            return null;
          })
        ) : (
          <div className='noEvent'>
            <Calendar />
            <h2>Aucun Événement trouvé</h2>
          </div>
        )}
        {(calendarView == 'month' && 
          <Button variant="secondary" className="btnRightBar" onClick={() => setRightBar(!rightBar)}>
            {rightBar && <PanelRightClose />}
            {!rightBar && <PanelLeftClose />}
          </Button>
        )}
      </div>
    </>
  );
};
