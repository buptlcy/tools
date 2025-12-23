import type { Config } from './index'

import path from 'node:path'
import { __dirname } from '../utils'

export const BUILDING_CONFIG: Config = {
    targetUrl: 'https://satisfactory-calculator.com/zh/buildings',
    imgSelector: 'img.img-fluid', // 目标img标签选择器（F12看页面结构改）
    rawImgDir: path.resolve(__dirname, '../temp/raw-icons-building'), // 原始图片保存目录
    compressedImgDir: path.resolve(__dirname, '../temp/compressed-icons-building'), // 压缩后图片目录
    spriteOutput: path.resolve(__dirname, '../dist/sprite-icons-building.png'), // 雪碧图输出路径
    spriteJsonOutput: path.resolve(__dirname, '../dist/sprite-position-building.json'), // 雪碧图位置JSON
    compressSize: { width: 64, height: 64 }, // 压缩到64*64
}
