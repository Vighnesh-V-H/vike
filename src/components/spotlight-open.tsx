"use client";
import { useSpotlight } from "@/providers/modal-provider";

export default function SpotlightOpen() {
  const { openSpotlight } = useSpotlight();

  return (
    <div
      className='dark:bg-[#5b5b5bcf] pl-4 pr-4 cursor-pointer opacity-75  z-[999] dark:text-muted-foreground flex items-center gap-4    text-sm rounded-2xl px-2 py-1 '
      onClick={() => {
        openSpotlight();
      }}>
      <div className='dark:text-white'>spotlight</div>
      <div className='dark:text-white'>ctrl+k</div>
    </div>
  );
}
