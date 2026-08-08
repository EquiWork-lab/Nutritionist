/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Nothing host-specific here on purpose — the app deploys identically to
  // Vercel or Render. All account-specific config lives in environment variables.
};

export default nextConfig;
