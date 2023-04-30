'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import React from 'react';
import { useSession } from 'next-auth/react';

export default function DashTitle() {
  const segment = useSelectedLayoutSegment();
  const { data } = useSession();

  return (
    <>
      <h1>{segment || 'Dashboard'}</h1>
      <h4>
        Welcome to the dashboard <b>{data!.user!.name}</b>
      </h4>
    </>
  );
}
