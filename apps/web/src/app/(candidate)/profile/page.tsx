'use client';

import { ProfilePage as ImportedProfilePage } from '@/components/microint/components/pages/ProfilePage';
import { Toast } from '@/components/microint/components/common/Toast';

export default function ProfilePage() {
  return (
    <>
      <ImportedProfilePage />
      <Toast />
    </>
  );
}
