import antfu from '@antfu/eslint-config'

export default antfu({
    stylistic: {
        indent: 4,
        quotes: 'single',
        jsx: true,
    },
}, {
    rules: {
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        'semi': ['error', 'never'], // 强制分号
        'max-len': ['error', { code: 120 }], // 行宽限制
    },
    ignores: [
        'dist/**/*', // 排除编译产物目录
        'node_modules/**/*', // 排除依赖目录（默认已排除，可省略）
        'scripts/build.js', // 排除单个文件
        '*.config.js', // 排除所有根目录的.config.js文件（如vite.config.js）
        'src/test/**/*.ts', // 排除src/test下的所有TS文件
        '.env',
        '.env.prod',
    ],
})
