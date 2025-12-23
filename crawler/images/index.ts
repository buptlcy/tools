import path from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'

import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs-extra'
import sharp from 'sharp' // 图片压缩（需额外装：pnpm add sharp）
import spritesmith from 'spritesmith'

import { __dirname } from '../utils'
import { BUILDING_CONFIG } from './building'
import { ITEM_CONFIG } from './item'

const spritesmithRun = promisify(spritesmith.run)

export interface Config {
    targetUrl: string
    imgSelector: string // 目标img标签选择器（F12看页面结构改）
    rawImgDir: string // 原始图片保存目录
    compressedImgDir: string // 压缩后图片目录
    spriteOutput: string // 雪碧图输出路径
    spriteJsonOutput: string // 雪碧图位置JSON
    compressSize: { width: number, height: number } // 压缩到64*64
}

// ========== 仅需修改这2处配置 ==========
const VIRTUAL_UA
    = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
        + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// 1. 爬取页面img的src并下载图片
async function crawlAndDownloadImgs(config: Config) {
    try {
    // 创建目录
        await fs.ensureDir(config.rawImgDir)
        await fs.ensureDir(config.compressedImgDir)

        // 1.1 请求页面
        const { data: html } = await axios.get(config.targetUrl, {
            headers: {
                'User-Agent': VIRTUAL_UA,
            },
        })
        const $ = cheerio.load(html)

        // 1.2 提取所有img的src
        const imgSrcMap: Map<string, string> = new Map()
        $(config.imgSelector).each((_, el) => {
            const src = $(el).attr('src')
            const name = $(el).attr('alt') ?? 'unknown'

            if (src && !imgSrcMap.has(src)) {
                imgSrcMap.set(name, src)
            }
        })

        const imgSrcList = [...imgSrcMap]
        console.log(`✅ 提取到 ${imgSrcList.length} 个图片链接`)

        // 1.3 下载图片
        for (const [index, [name, src]] of imgSrcList.entries()) {
            try {
                // 处理相对路径（拼接域名）
                const fullSrc = src.startsWith('http') ? src : new URL(src, config.targetUrl).href
                // 下载图片
                // 保存原始图片（命名：001.png、002.png...）
                const imgExt = path.extname(fullSrc) ? path.extname(fullSrc).split('?')[0] : '.png'
                const imgName = `${name}${imgExt}`
                const rawImgPath = path.resolve(config.rawImgDir, imgName)

                console.log(imgName, rawImgPath)
                const exists = await fs.exists(rawImgPath)
                if (!exists) {
                    const { data: imgBuffer } = await axios.get(fullSrc, { responseType: 'arraybuffer' })
                    await fs.writeFile(rawImgPath, imgBuffer)
                }

                console.log(`📥 下载完成 [${index + 1}/${imgSrcList.length}]：${imgName}`)
            }
            catch (err) {
                console.error(`❌ 下载失败 ${src}：`, err)
            }
        }
    }
    catch (err) {
        console.error('❌ 爬取/下载失败：', err)
        process.exit(1)
    }
}

// 2. 压缩图片到64*64
async function compressImgs(config: Config) {
    try {
        const imgFiles = await fs.readdir(config.rawImgDir)
        for (const file of imgFiles) {
            const rawPath = path.resolve(config.rawImgDir, file)
            const compressedPath = path.resolve(config.compressedImgDir, file)
            // 压缩并保存（保持比例，填充透明背景到64*64）
            await sharp(rawPath)
                .resize(config.compressSize.width, config.compressSize.height, {
                    fit: 'contain', // 保持比例
                    background: { r: 0, g: 0, b: 0, alpha: 0 }, // 透明背景
                })
                .png() // 强制转PNG（保证透明）
                .toFile(compressedPath)
        }
        console.log(`✅ 图片压缩完成（${config.compressSize.width}*${config.compressSize.height}）`)
    }
    catch (err) {
        console.error('❌ 压缩失败：', err)
        process.exit(1)
    }
}

// 3. 生成雪碧图
async function generateSprite(config: Config) {
    try {
    // 获取压缩后的图片列表
        const imgFiles = await fs.readdir(config.compressedImgDir)
        const imgPaths = imgFiles
            .filter(file => ['.png', '.jpg', '.jpeg'].includes(path.extname(file).toLowerCase()))
            .map(file => path.resolve(config.compressedImgDir, file))

        if (imgPaths.length === 0) {
            console.log('⚠️ 无压缩图片生成雪碧图')
            return
        }

        // 生成雪碧图
        const { image, coordinates } = await spritesmithRun({ src: imgPaths })
        // 保存雪碧图
        await fs.ensureDir(path.dirname(config.spriteOutput))
        await fs.writeFile(config.spriteOutput, image)

        // json中只保留png名字
        const parsedJson: typeof coordinates = {}
        Object.entries(coordinates).forEach(([p, entity]) => {
            const _ = p.split('\/')
            const fileName = _.pop()!.split('\.')[0]!

            console.log(fileName)
            parsedJson[fileName] = entity
        })

        // 保存位置JSON
        await fs.writeJSON(config.spriteJsonOutput, parsedJson, { spaces: 2 })

        console.log(`✅ 雪碧图生成完成：${config.spriteOutput}`)
        console.log(`✅ 位置信息保存：${config.spriteJsonOutput}`)
    }
    catch (err) {
        console.error('❌ 雪碧图生成失败：', err)
        process.exit(1)
    }
}

async function getItems() {
    await crawlAndDownloadImgs(ITEM_CONFIG)
    await compressImgs(ITEM_CONFIG)
    await generateSprite(ITEM_CONFIG)
}

async function getBuildings() {
    await crawlAndDownloadImgs(BUILDING_CONFIG)
    await compressImgs(BUILDING_CONFIG)
    await generateSprite(BUILDING_CONFIG)
}

// 主流程：爬取 → 下载 → 压缩 → 雪碧图
export default async function main() {
    await getItems()
    await getBuildings()
    console.log('\n🎉 全部流程完成！')
}
