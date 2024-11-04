"use client";
import Image from "next/image";
import '@/style/style.css';
import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { GlobalContext } from '@/lib/GlobalState';
import { IoIosMenu } from "react-icons/io";
import { Button } from "../ui/button";
import { InfoProfil } from "./infoProfil";

export const TopBar = () => {
  const { leftBar, setLeftBar } = useContext(GlobalContext);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="topBar fixed top-0 left-0 z-10 bg-white w-full h-10 flex items-center justify-between">
      <div className="flex items-center w-[30vh]">
        <button className="btn-menu" onClick={() => setLeftBar(!leftBar)}>
          <IoIosMenu />
        </button>
      </div>
      <div className="mr-4">
        <InfoProfil />
      </div>
    </div>
  );
};
