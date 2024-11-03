"use client"
import { createContext, useState, useEffect } from 'react';
export const GlobalContext = createContext();
export const GlobalProvider = ({ children }) => {
  const [actualDate, setActualDate] = useState(new Date());
  const [leftBar, setLeftBar] = useState(true);
  const [rightBar, setRightBar] = useState(false);
  const [calendarView, setCalendarView] = useState('month');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actualEditDate, setActualEditDate] = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [calendar, setCalendar] = useState([]);
  const [idUserList, setIdUserList] = useState([])
  const [ListUsers, setListUsers] = useState([]);
  const [me , setMe] = useState(null);
  const [listEvent, setListEvent ] = useState([]);
  const [hoursAddEvent, setHoursAddEvent] = useState(null)



  useEffect(() => {
    setActualDate(new Date());
  }, []);

  return (
    <GlobalContext.Provider value={{ actualDate, setActualDate, leftBar, setLeftBar, rightBar, setRightBar, calendarView, setCalendarView, isDialogOpen, setIsDialogOpen, actualEditDate, setActualEditDate, pageLoading, setPageLoading, calendar, setCalendar, idUserList, setIdUserList, ListUsers, setListUsers,listEvent, setListEvent, me , setMe, hoursAddEvent, setHoursAddEvent }}>
      {children}
    </GlobalContext.Provider>
  );
};
