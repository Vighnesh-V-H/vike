"use client";

import { EmptyColumnProps } from "@/lib/leads/types";


export function EmptyColumn({ icon }: EmptyColumnProps) {
  return (
    <div className='flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 dark:border-gray-700 dark:bg-gray-800/30'>
      {icon}
      <p className='text-sm text-slate-400 dark:text-gray-500 mt-2'>
        No leads yet
      </p>
      <p className='text-xs text-slate-300 dark:text-gray-600'>
        Drag leads here
      </p>
    </div>
  );
}
