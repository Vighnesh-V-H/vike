import { TriangleAlertIcon } from "lucide-react";

export default function FormError({
  message,
}: {
  message: string | undefined;
}) {
  return (
    <>
      {message && (
        <div className='text-destructive text-base flex gap-2 items-center p-2 rounded-md bg-destructive/15  font-semibold'>
          <TriangleAlertIcon /> {message}
        </div>
      )}
    </>
  );
}
