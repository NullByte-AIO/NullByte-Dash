"use client";
import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(false); // Default to no notifications

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
    setNotifying(false);
  };

  return (
    <div className="relative">
      <button
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-all bg-black/20 border border-white/5 rounded-full hover:text-[#00D2FF] h-11 w-11 hover:bg-[#00D2FF]/10 dark:border-white/5 dark:bg-black/40 dark:text-gray-400 shadow-lg"
        onClick={handleClick}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-[#00D2FF] ${
            !notifying ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-[#00D2FF] rounded-full opacity-75 animate-ping"></span>
        </span>
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex w-[350px] flex-col rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl p-6 shadow-2xl shadow-black/50 lg:right-0"
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <h5 className="text-sm font-black uppercase tracking-[0.2em] text-white">
            Neural Activity
          </h5>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-1">Matrix Stable</p>
          <p className="text-xs font-bold text-gray-400">No incoming neural signals detected.</p>
        </div>

        <button
          onClick={closeDropdown}
          className="block w-full py-3 mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-center text-gray-400 bg-white/5 border border-white/5 rounded-xl hover:bg-[#00D2FF]/10 hover:text-[#00D2FF] hover:border-[#00D2FF]/20 transition-all"
        >
          Archive View
        </button>
      </Dropdown>
    </div>
  );
}
