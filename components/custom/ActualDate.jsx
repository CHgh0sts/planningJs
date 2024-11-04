"use client"
import { useContext } from 'react';
import { GlobalContext } from '@/lib/GlobalState';

export const ActualDate = () => {
  const { actualDate, setActualDate } = useContext(GlobalContext);
  return (
    <div>
      <h1>
        Heure actuelle :{' '}
        {actualDate
          ? `${actualDate.toLocaleDateString()} ${actualDate.getHours()}:${actualDate.getMinutes()}:${actualDate.getSeconds()}`
          : 'Chargement...'}
      </h1>
    </div>
  );
};
