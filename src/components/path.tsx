"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function Path() {
  const pathname = usePathname();

  const getPathSegments = () => {
    const segments = pathname.split("/").filter(Boolean);

    // Check if we have a chat route and remove everything after /chat/
    const chatIndex = segments.indexOf("chat");
    if (chatIndex !== -1 && chatIndex < segments.length - 1) {
      segments.splice(chatIndex + 1);
    }

    // Filter out ID-like segments
    const meaningfulSegments = segments.filter((segment) => {
      const isNumeric = /^\d+$/.test(segment);
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          segment
        );
      const isLongId = segment.length > 20 && /^[a-z0-9]+$/i.test(segment);

      return !(isNumeric || isUUID || isLongId);
    });

    return meaningfulSegments;
  };

  const formatSegment = (segment: string) => {
    return (
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
    );
  };

  const buildPath = (index: number, segments: string[]) => {
    return "/" + segments.slice(0, index + 1).join("/");
  };

  const segments = getPathSegments();

  if (segments.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const path = buildPath(index, segments);

          return (
            <div key={path} className='flex items-center gap-1.5'>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{formatSegment(segment)}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={path}>{formatSegment(segment)}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default Path;
