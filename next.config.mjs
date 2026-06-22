/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep the client router cache from serving stale dynamic pages (sibling-app gotcha).
  experimental: {
    staleTimes: { dynamic: 0 },
    // node-ical (and its deps) use dynamic requires — keep it external to the bundle.
    serverComponentsExternalPackages: ["node-ical"],
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
