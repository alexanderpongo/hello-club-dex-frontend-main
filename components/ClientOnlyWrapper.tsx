"use client";

import { useEffect, useState } from "react";

interface ClientOnlyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ClientOnlyWrapper({
  children,
  fallback = (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
    </div>
  )
}: ClientOnlyWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
