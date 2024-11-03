import { useContext } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { GlobalContext } from "@/lib/GlobalState";
import { Button } from "../ui/button";

export const CalendarTopBar = () => {
  const { actualDate, setActualDate, calendarView, setCalendarView } = useContext(GlobalContext);

  const mois = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet",
    "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const handlePrevPeriod = () => {
    if (calendarView === "month") {
      const prevMonthDate = new Date(actualDate.setMonth(actualDate.getMonth() - 1));
      setActualDate(new Date(prevMonthDate));
    } else if (calendarView === "week") {
      const prevWeekDate = new Date(actualDate.setDate(actualDate.getDate() - 7));
      setActualDate(new Date(prevWeekDate));
    } else if (calendarView === "day") {
      const prevDayDate = new Date(actualDate.setDate(actualDate.getDate() - 1));
      setActualDate(new Date(prevDayDate));
    }
  };

  const handleNextPeriod = () => {
    if (calendarView === "month") {
      const nextMonthDate = new Date(actualDate.setMonth(actualDate.getMonth() + 1));
      setActualDate(new Date(nextMonthDate));
    } else if (calendarView === "week") {
      const nextWeekDate = new Date(actualDate.setDate(actualDate.getDate() + 7));
      setActualDate(new Date(nextWeekDate));
    } else if (calendarView === "day") {
      const nextDayDate = new Date(actualDate.setDate(actualDate.getDate() + 1));
      setActualDate(new Date(nextDayDate));
    }
  };

  const formatWeekRange = (date) => {
    const startOfWeek = new Date(date);
    const dayOfWeek = startOfWeek.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const formatDate = (date) => {
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    return `de ${formatDate(startOfWeek)} au ${formatDate(endOfWeek)}`;
  };

  return (
    <div className="topBarCallendar flex items-center p-6">
        <div className="left">
            <Button onClick={() => setActualDate(new Date())} className="btn btn-icon inDay">
                Aujourd'hui
            </Button>
            <Button variant="secondary" onClick={handlePrevPeriod} className="btn btn-icon">
                <ChevronUp />
            </Button>
            <Button variant="secondary" onClick={handleNextPeriod} className="btn btn-icon">
                <ChevronDown />
            </Button>
            {calendarView === "month" && (
                <span className="month">{mois[actualDate.getMonth()]} {actualDate.getFullYear()}</span>
            )}
            {calendarView === "week" && (
                <span className="week">{formatWeekRange(actualDate)}</span>
            )}
            {calendarView === "day" && (
                <span className="day">
                {`${actualDate.getDate().toString().padStart(2, '0')}/${(actualDate.getMonth() + 1).toString().padStart(2, '0')}/${actualDate.getFullYear()}`}
                </span>
            )}
        </div>
        <div className="right">
            <Button variant="secondary" className={`btn-view ${calendarView === 'month' ? 'active' : ''}`} onClick={() => setCalendarView('month')}>
            Mois
            </Button>
            <Button variant="secondary" className={`btn-view ${calendarView === 'week' ? 'active' : ''}`} onClick={() => setCalendarView('week')}>
            Semaine
            </Button>
            <Button variant="secondary" className={`btn-view ${calendarView === 'day' ? 'active' : ''}`} onClick={() => setCalendarView('day')}>
            Jour
            </Button>
        </div>
    </div>
  );
};
