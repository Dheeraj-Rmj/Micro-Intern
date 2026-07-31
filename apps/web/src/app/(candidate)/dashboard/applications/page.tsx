'use client';

import { MyApplicationsPage } from '@/components/microint/components/pages/MyApplicationsPage';
import { Toast } from '@/components/microint/components/common/Toast';

export default function ApplicationsPage() {
  return (
    <>
      <MyApplicationsPage />
      <Toast />
    </>
  );
}
