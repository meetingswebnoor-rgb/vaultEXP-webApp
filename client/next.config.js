/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow cross-origin images
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  // Redirect shorthand URLs
  async redirects() {
    return [
      { source: '/login',    destination: '/auth/login',    permanent: true },
      { source: '/register', destination: '/auth/signup', permanent: true },
    ];
  },

  // ── Dev Proxy ────────────────────────────────────────────────────
  // Forwards all /api/* requests to the backend server.
  // This means the browser never makes a cross-origin request,
  // completely eliminating CORS issues in development.
  //
  // Browser:  GET /api/auth/signup (same origin: localhost:300x)
  //   Next.js rewrites to → http://localhost:5000/api/auth/signup
  //   (server-to-server, no CORS involved)
  async rewrites() {
    const backendUrl = 'http://localhost:5000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
