'use client';
import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { IoIosClose } from 'react-icons/io';

const AnnouncementAlert = () => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <Alert className="announcement-alert rounded-lg mb-8">
      <AlertTitle className="flex justify-between">
        <div>
          <h1 className="title-regular-bold text-primary uppercase">
            New Feature Announcement
          </h1>
        </div>

        <div className="text-primary">
          <IoIosClose
            className="text-[18px] font-bold cursor-pointer"
            onClick={() => setIsOpen(false)}
          />
        </div>
      </AlertTitle>
      <AlertDescription>
        <p>
          We&apos;ve added a new feature that lets you arrange your dashboard
          blocks by priority, giving you a personalized view tailored to what
          matters most.
        </p>
      </AlertDescription>
    </Alert>
  );
};

export default AnnouncementAlert;
