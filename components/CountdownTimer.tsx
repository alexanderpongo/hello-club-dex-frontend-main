'use client';
import { cn } from '@/lib/utils';
import React from 'react';
import Countdown from 'react-countdown';

const CountdownTimer = ({
  timestamp,
  className,
}: {
  timestamp: number;
  className?: string;
}) => {
  return (
    <Countdown
      key={timestamp * 1000}
      date={timestamp * 1000}
      renderer={(props: any) => (
        <div className="flex text-center">
          <div>
            <div className={cn('text-primary', className)}>
              <p>{props.formatted.days}</p>
            </div>
          </div>

          <div>
            <div className={cn('text-primary', className)}>
              <p>d:</p>
            </div>
          </div>

          <div>
            <div className={cn('text-primary', className)}>
              <p>{props.formatted.hours}</p>
            </div>
          </div>

          <div>
            <div className={cn('text-primary', className)}>
              <p>h:</p>
            </div>
          </div>

          <div>
            <div className={cn('text-primary', className)}>
              <p>{props.formatted.minutes}</p>
            </div>
          </div>

          <div>
            <div className={cn('text-primary', className)}>
              <p>m:</p>
            </div>
          </div>

          <div>
            <div className={cn('text-primary', className)}>
              <p>{props.formatted.seconds}</p>
            </div>
          </div>

          <div>
            <div className={cn('text-primary', className)}>
              <p>s</p>
            </div>
          </div>
        </div>
      )}
      zeroPadTime={2}
    />
  );
};

export default CountdownTimer;
