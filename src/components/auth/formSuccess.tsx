import { CheckCircle } from "lucide-react";

export default function FormSuccess({
  message,
}: {
  message: string | undefined;
}) {
  return (
    <>
      {message && (
        <div>
          <div className='text-emerald-700 pl-2 flex items-center gap-2 h-10 rounded-md bg-emerald-300 font-semibold w-full text-base'>
            <CheckCircle /> {message}
          </div>
        </div>
      )}
    </>
  );
}
