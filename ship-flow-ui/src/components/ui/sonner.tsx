'use client';

import { Toaster as SonnerToaster, toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

/**
 * Sonner Toast Provider Component
 *
 * Pre-configured with:
 * - Position: bottom-right
 * - Rich colors enabled
 * - Close button enabled
 *
 * Usage in layout.tsx:
 * import { Toaster } from '@/components/ui/sonner';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <Toaster />
 *       </body>
 *     </html>
 *   );
 * }
 */

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      closeButton
      icons={{
        error: <AlertCircle className="size-5" />,
      }}
      toastOptions={{
        classNames: {
          error:
            '!border-red-200 !bg-red-50 [&_[data-icon]]:!text-red-600 [&_[data-title]]:!text-red-900 [&_[data-description]]:!text-red-800',
          success:
            '!border-gray-200 !bg-white [&_[data-icon]]:hidden [&_[data-title]]:!text-black [&_[data-title]]:!font-semibold [&_[data-title]]:!text-sm [&_[data-description]]:!text-gray-700',
          title: '!text-sm !font-semibold',
          description: '!text-sm',
          closeButton: '!border-0 !bg-transparent !text-slate-400 hover:!text-slate-600',
          icon: '!text-red-600',
        },
        style: {
          border: '1px solid #e5e7eb',
        },
      }}
    />
  );
}

export { toast };
