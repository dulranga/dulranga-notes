/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    // Search reads notes at runtime via a glob, which Next.js cannot trace.
    '/api/search': ['./content/academia/**/*.md'],
  },
};

export default config;
