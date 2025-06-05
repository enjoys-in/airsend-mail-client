'use client';

import Error500 from "@/components/error/internal500";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>       
        <Error500  onClick={() => reset()}/>        
      </body>
    </html>
  )
}