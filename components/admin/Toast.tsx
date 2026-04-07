import { Toaster, toast as hotToast } from 'react-hot-toast'

export { Toaster }

export const toast = {
  success: (message: string) =>
    hotToast.success(message, {
      style: {
        background: '#1C2333',
        color: '#E2E8F0',
        border: '1px solid #22C55E',
        fontFamily: 'DM Sans, sans-serif',
        fontSize: '14px',
      },
      iconTheme: { primary: '#22C55E', secondary: '#1C2333' },
    }),

  error: (message: string) =>
    hotToast.error(message, {
      style: {
        background: '#1C2333',
        color: '#E2E8F0',
        border: '1px solid #EF4444',
        fontFamily: 'DM Sans, sans-serif',
        fontSize: '14px',
      },
      iconTheme: { primary: '#EF4444', secondary: '#1C2333' },
    }),

  loading: (message: string) =>
    hotToast.loading(message, {
      style: {
        background: '#1C2333',
        color: '#E2E8F0',
        border: '1px solid #2D3748',
        fontFamily: 'DM Sans, sans-serif',
        fontSize: '14px',
      },
    }),
}
