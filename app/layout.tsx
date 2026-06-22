import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyDay",
  description:
    "Personal productivity workspace for client deployments, bugs, meetings and standups.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/Logo.png",
    apple: "/icons/Logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MyDay",
  },
};

export const viewport: Viewport = {
  themeColor: "#F6F7F9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isProd = process.env.NODE_ENV === "production";
  return (
    <html lang="en">
      <body>
        {children}
        {isProd ? <ServiceWorkerRegister /> : <ServiceWorkerKiller />}
      </body>
    </html>
  );
}

function ServiceWorkerRegister() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function () {
              navigator.serviceWorker.register('/sw.js').catch(function () {});
            });
          }
        `,
      }}
    />
  );
}

// In dev, the SW caches /_next/static/ cache-first; those chunks change on every
// edit, so a stale cached webpack.js causes "Cannot read properties of undefined
// (reading 'call')". Unregister any SW and clear its caches in development.
function ServiceWorkerKiller() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function (regs) {
              var had = regs.length > 0;
              Promise.all(regs.map(function (r) { return r.unregister(); })).then(function () {
                if (window.caches && caches.keys) {
                  caches.keys().then(function (keys) {
                    keys.forEach(function (k) { caches.delete(k); });
                  });
                }
                if (had) location.reload();
              });
            }).catch(function () {});
          }
        `,
      }}
    />
  );
}
