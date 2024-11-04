"use client";
import { useContext } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar } from "@/components/ui/calendar";
import { GlobalContext } from '@/lib/GlobalState';
import { ListUser } from './ListUser';

export const LeftBar = () => {
  const { actualDate, setActualDate } = useContext(GlobalContext);
  const { leftBar } = useContext(GlobalContext);

  const handleSelectDate = (date) => {
    if (date) {
      const currentDate = new Date();
      const updatedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        currentDate.getHours(),
        currentDate.getMinutes(),
        currentDate.getSeconds()
      );
      setActualDate(updatedDate);
    }
  };

  return (
    <div className={(leftBar) ? "LeftBar open" : "LeftBar"}>
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            {actualDate ? `${actualDate.toLocaleString('default', { month: 'long' })} ${actualDate.getFullYear()}` : 'Chargement...'}
          </AccordionTrigger>
          <AccordionContent>
            <Calendar
              mode="single"
              selected={actualDate}
              onSelect={handleSelectDate}
              initialFocus
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <ListUser />
    </div>
  );
};
