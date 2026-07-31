'use client';

import { NotificationsPage } from '@/components/microint/components/pages/NotificationsPage';
import { Toast } from '@/components/microint/components/common/Toast';

export default function NotificationsRoutePage() {
  return (
    <>
      <NotificationsPage />
      <Toast />
    </>
  );
}
