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
})
