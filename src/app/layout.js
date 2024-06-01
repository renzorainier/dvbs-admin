// src/app/RootLayout.js

import "./globals.css";
import { Urbanist } from 'next/font/google';
import { useEffect } from 'react';

const inter = Urbanist({ subsets: ['latin'] });

export const metadata = {
  title: "Attendance Log",
  description: "Just another project",
};

export default function RootLayout({ children }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New update available
                  showUpdateNotification();
                } else {
                  // Content is cached for offline use
                  console.log('Content cached for offline use.');
                }
              }
            };
          };
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });

      let refreshing;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        window.location.reload();
        refreshing = true;
      });
    }
  }, []);

  const showUpdateNotification = () => {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.textContent = 'New version available. Please refresh.';
    const refreshButton = document.createElement('button');
    refreshButton.textContent = 'Refresh';
    refreshButton.onclick = () => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage('SKIP_WAITING');
      }
    };
    notification.appendChild(refreshButton);
    document.body.appendChild(notification);
  };

  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}









// import "./globals.css";
// import { Urbanist } from 'next/font/google'

// const inter = Urbanist({ subsets: ['latin'] })

// export const metadata = {
//   title: "Rescue Zone | DVBS 2024",
//   description: "Just another project",
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className={inter.className} >{children}</body>
//     </html>
//   );
// }
