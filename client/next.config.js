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

};

module.exports = nextConfig;
