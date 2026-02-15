import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_FILEMAKER_PROXY_TARGET?.trim()
  if (proxyTarget) {
    console.log('[vite] FileMaker proxy: /fmi ->', proxyTarget)
  }
  return {
    plugins: [vue(), tailwindcss()],
    server: {
      proxy: proxyTarget
        ? {
            '/fmi': {
              target: proxyTarget,
              changeOrigin: true,
              secure: false,
              configure: (proxy) => {
                proxy.on('error', (err, _req, _res) => {
                  console.error('[vite] FileMaker proxy error:', err.message)
                })
                proxy.on('proxyReq', (proxyReq, req) => {
                  console.log('[vite] FileMaker proxy:', req.method, req.url, '->', proxyTarget)
                })
              },
            },
          }
        : undefined,
    },
  }
})
