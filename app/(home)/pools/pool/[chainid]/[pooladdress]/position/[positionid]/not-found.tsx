"use client";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PositionNotFound() {
  const router = useRouter();

  return (
    <div className="mt-12 md:mt-24 xl:mt-28 container">
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-primary" />
          <h1 className="text-3xl md:text-4xl font-formula font-light uppercase text-primary text-center">
            Position Not Found
          </h1>
          <p className="text-gray-400 text-center max-w-md font-lato">
            The position you're looking for doesn't exist or may have been removed.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="font-lato font-[400] border-black/20 dark:text-white dark:border-white/20 rounded-full uppercase hover:bg-black/10 dark:hover:bg-white/10"
          >
            Go Back
          </Button>
          <Button
            variant="default"
            onClick={() => router.push("/pools")}
            className="font-lato font-semibold rounded-full button-primary"
          >
            View All Pools
          </Button>
        </div>
      </div>
    </div>
  );
}
