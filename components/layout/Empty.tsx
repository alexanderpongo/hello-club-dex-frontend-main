import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Archive } from 'lucide-react';

const Empty = ({ label = 'No Data' }: { label?: string }) => {
  return (
    <Card className="card-primary">
      <CardContent className='p-5'>
        <div className="text-center">
          <div className="flex justify-center">
            <Archive className="size-8 dark:text-slate" />
          </div>
          <p className="dark:text-slate">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Empty;
