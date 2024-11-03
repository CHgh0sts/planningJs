import { useContext, useState, useEffect, useRef } from "react";
import { GlobalContext } from '@/lib/GlobalState';

export const Event = ({ ...props }) => {
    const { calendarView, setListEvent, rightBar, setRightBar } = useContext(GlobalContext);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [changeSize, setChangeSize] = useState(false);
    const mouseMoveType = useRef(null);
    const offsetYRef = useRef(0);

    const { eventIndex, className, event, formattedHour, formattedMinutes, style, heightEditable, eventKey } = props;

    const updateTimeEvent = async (params) => {
        try {
            const res = await fetch(`/api/eventsUpdate`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });            
            if (!res.ok) throw new Error("Erreur lors de la mise à jour de l'événement");
            const updatedEvent = await res.json();
            setListEvent((prevList) =>
                prevList.map((event) =>
                    event.id === updatedEvent.id ? updatedEvent : event
                )
            );
            return updatedEvent;
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    const handleMouseMove = async (event) => {
        let hour = 0;
        let minutes = 0;
        let afterDay = false;

        if (calendarView === 'week' || calendarView === 'day') {
            const hoursContainer = document.querySelector('.hours-container');
            if (hoursContainer) {
                const rect = hoursContainer.getBoundingClientRect();
                const offsetY = event.clientY - rect.top;
                const totalHeight = rect.height;
                const totalSlots = 48;
                const slot = Math.floor((offsetY / totalHeight) * totalSlots);
                hour = Math.floor(slot / 2);
                minutes = (slot % 2) * 30;
            }

            if (hour >= 24) {
                afterDay = true;
                hour = 0;
                minutes = 0;
            }

            if (hour < 0) {
                hour = 0;
                minutes = 0;
            }

            if (minutes < 0) minutes *= -1;
        }
        console.log(`${hour}:${minutes}`);

        if (calendarView === 'week' || calendarView === 'day') {
            if (mouseMoveType.current === 'Top') {
                await updateTimeEvent({
                    debutAt: `${hour}:${minutes}`,
                    id: eventKey,
                });
            }
            if (mouseMoveType.current === 'Bottom') {
                await updateTimeEvent({
                    finAt: `${hour}:${minutes}`,
                    afterDay,
                    id: eventKey,
                });
            }
        }
    };

    const handleMouseDown = (e) => {
        setChangeSize(true)
        mouseMoveType.current = e.target.classList[1];
        setIsMouseDown(true);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseUp = () => {
        setIsMouseDown(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        setTimeout(() => setChangeSize(false), 0);
    };

    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const handleDragStart = (event, eventData) => {
        const eventBox = event.target.getBoundingClientRect();
        offsetYRef.current = event.clientY - eventBox.top;
        
        event.dataTransfer.setData('eventId', eventData.id);
        const eventDate = new Date(eventData.date);
        if (!isNaN(eventDate)) {
            event.dataTransfer.setData('oldDay', eventDate.getUTCDate());
        }
        document.querySelectorAll('.event').forEach((el) => {
            if (el !== event.target) {
                el.classList.add('notDrag');
            } else {
                el.classList.add('isDrag');
            }
        });
    };

    const handleDragEnd = () => {
        document.querySelectorAll('.event').forEach((el) => {
            el.classList.remove('notDrag');
            el.classList.remove('isDrag');
        });
    };

    const handleDoubleClickEvent = (e, event) => {
        e.stopPropagation();
        console.log('event Dbl Click', event);
    };

    const handleClickEvent = (e, event) => {
        if(!changeSize) {
            setRightBar(event.id);
        }else {
            setChangeSize(false)
        }
    };

    return (
        <div
            style={style}
            key={eventIndex}
            className={className}
            draggable="true"
            onDragStart={(e) => handleDragStart(e, event)}
            onDragEnd={handleDragEnd}
            onDoubleClick={(e) => handleDoubleClickEvent(e, event)}
            onClick={(e) => handleClickEvent(e, event)}
        >
            {heightEditable && (
                <div
                    className="btnSize Top"
                    draggable="false"
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleMouseDown(e);
                    }}
                    onMouseLeave={() => handleMouseUp()}
                ></div>
            )}
            <p>
                {!event.fullDay && <span>{formattedHour}h{formattedMinutes} - </span>}
                {event.title}
            </p>
            {heightEditable && (
                <div
                    className="btnSize Bottom"
                    draggable="false"
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleMouseDown(e);
                    }}
                    onMouseLeave={() => handleMouseUp()}
                ></div>
            )}
        </div>
    );
};
