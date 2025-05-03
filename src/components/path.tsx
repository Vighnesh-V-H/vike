"use client";

import { usePathname } from "next/navigation";

function Path() {
  const pathname = usePathname();

  return <div> {pathname} </div>;
}

export default Path;
