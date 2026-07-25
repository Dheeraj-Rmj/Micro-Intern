'use client';

import React, { useRef, useState } from 'react';

import { Button } from './Button';

interface FileUploadProps {
  label: string;
  accept?: string;
  onUpload: (file: File) => Promise<void>;
  currentFileUrl?: string | null;
  buttonText?: string;
}

export function FileUpload({
  label,
  accept = '*/*',
  onUpload,
  currentFileUrl,
  buttonText = 'Upload File',
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      await onUpload(file);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMsg);
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="flex items-center space-x-4">
        {currentFileUrl !== undefined && currentFileUrl !== null && (
          <a
            href={currentFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            View Current
          </a>
        )}
        <input
          type="file"
          accept={accept}
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => { void handleFileChange(e); }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          isLoading={isUploading}
        >
          {buttonText}
        </Button>
      </div>
      {error !== null && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
