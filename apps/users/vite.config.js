import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    tailwindcss(),
    // 打包分析插件（仅在分析模式下启用）
    mode === 'analyze' && visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html'
    })
  ].filter(Boolean),

  resolve: {
    alias: {
      '@': '/src',
    },
  },

  server: {
    port: 8080
  },

  // 构建优化
  build: {
    // 目标浏览器（支持 ES2020 的现代浏览器）
    target: 'es2020',

    // 代码分割策略
    rollupOptions: {
      output: {
        // 手动分块，将大型依赖单独打包
        manualChunks(id) {
          // Vue 核心
          if (id.includes('node_modules/vue') || 
              id.includes('node_modules/vue-router') || 
              id.includes('node_modules/pinia')) {
            return 'vue-vendor'
          }
          // UI 组件库
          if (id.includes('node_modules/daisyui')) {
            return 'ui-vendor'
          }
          // 工具库
          if (id.includes('node_modules/axios') || 
              id.includes('node_modules/dayjs')) {
            return 'utils'
          }
        },
        // 资源文件名哈希，便于缓存
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // 安全获取文件名
          const name = assetInfo.name || ''
          const info = name.split('.')
          const ext = info[info.length - 1] || ''
          // 按类型分目录存放
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(name)) {
            return 'images/[name]-[hash][extname]'
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
            return 'fonts/[name]-[hash][extname]'
          }
          if (ext === 'css') {
            return 'css/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    },

    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,      // 移除 console.log
        drop_debugger: true,     // 移除 debugger
        pure_funcs: ['console.info', 'console.debug', 'console.trace']
      }
    },

    // 资源内联阈值（小于 4KB 内联为 base64）
    assetsInlineLimit: 4096,

    // 生成 source map（生产环境关闭）
    sourcemap: false,

    // 报告压缩后大小
    reportCompressedSize: true
  },

  // 依赖预构建优化
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'daisyui'
    ],
    // 强制预构建（解决某些依赖的兼容问题）
    force: true
  },

  // CSS 优化
  css: {
    devSourcemap: true,
    // PostCSS 配置已在 tailwindcss 插件中处理
  },

  // 预览配置（用于预览生产构建）
  preview: {
    port: 4173,
    host: true
  }
}))
