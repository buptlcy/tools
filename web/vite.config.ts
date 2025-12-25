import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// export default defineConfig({
//     plugins: [
//         react({
//             babel: {
//                 plugins: [['babel-plugin-react-compiler']],
//             },
//         }),
//     ],
// })

export default defineConfig({
    plugins: [react({
        babel: {
            plugins: [['babel-plugin-react-compiler']],
        },
    })],
    // 1. 优化依赖：将react、antd等第三方库单独打包（拆分为vendor chunk）
    build: {
    // 开启代码分割，拆分第三方库和业务代码
        rollupOptions: {
            output: {
                // 拆分规则：第三方库单独打包成vendor-[hash].js
                manualChunks: {
                    // react相关核心库打包在一起
                    react: ['react', 'react-dom', 'react-router-dom'],
                    // antd单独打包
                    antd: ['antd', '@ant-design/icons'],
                    // 其他第三方库可按需添加（如axios、lodash等）
                    // utils: ['axios', 'lodash']
                },
                // 文件名格式：hash用于缓存（内容不变则hash不变，浏览器缓存不失效）
                chunkFileNames: 'assets/vendor/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]',
                hoistTransitiveImports: false,
            },
        },
        // 生产环境移除console和debugger（可选优化）
        minify: 'terser',
        terserOptions: {
            mangle: {
                keep_classnames: true,
                keep_fnames: true,
            },
        },
    },
    // 2. 优化预构建：缓存第三方库的预构建结果，加快打包速度
    optimizeDeps: {
    // 指定需要预构建的依赖（强制预构建react/antd）
        include: ['react', 'react-dom', 'react-router-dom', 'antd', '@ant-design/icons'],
    },
    // 路径别名（可选，方便导入页面组件）
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    cacheDir: 'node_modules/.vite', // 统一缓存目录，包含预构建依赖+打包缓存
})
