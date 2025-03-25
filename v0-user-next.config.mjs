/** @type {import('next').NextConfig} */
const nextConfig = {
  // Updated configuration to use the correct property name
  webpack: (config) => {
    config.externals.push({
      'leaflet': 'L',
    })
    return config
  },
  // Add server external packages if needed
  serverExternalPackages: ['mysql2'],
}

export default nextConfig

