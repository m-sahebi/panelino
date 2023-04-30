import React from 'react';
import DashTitle from '@/app/dash/DashTitle';

export default async function dashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <DashTitle />
      {children}
    </div>
  );
}
