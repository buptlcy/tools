import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import Spritesmith from 'spritesmith'

import { get__dirname } from '../utils'

const __dirname = get__dirname()

const spritesmithRun = promisify(Spritesmith.run)

// ===================== 核心配置（请根据实际路径修改） =====================
interface Config {
    sourceImgDir: string // 源图片文件夹
    tempOutputDir: string // 临时输出目录
    targetDir: string // JSON/CSS目标拷贝目录
    targetCssDir?: string
    sprite: {
        padding: number // 图片间距
        algorithm: 'binary-tree' | 'left-right' | 'top-down' | 'diagonal' | 'alt-diagonal' // 排列算法
        imgName: string // 雪碧图文件名
        jsonName: string // JSON文件名
        cssName: string // CSS文件名
        cssClassPrefix: string // CSS类名前缀
        imgPathInCss: string // CSS中雪碧图的引用路径
    }
}

// const CONFIG: Config = {
//     sourceImgDir: path.join(__dirname, './icon'),
//     tempOutputDir: path.join(__dirname, './temp-sprite'),
//     targetDir: path.join(__dirname, './dist/assets'),
//     sprite: {
//         padding: 2,
//         algorithm: 'binary-tree',
//         imgName: 'sprite.png',
//         jsonName: 'sprite.json',
//         cssName: 'sprite.css',
//         cssClassPrefix: 'icon-',
//         imgPathInCss: './sprite.png',
//     },
// }
// =============================================================================

/**
 * 步骤1：获取指定文件夹内的所有图片文件
 * @param dir 文件夹路径
 * @returns 图片文件绝对路径数组
 */
function getImageFiles(dir: string): string[] {
    // 检查文件夹是否存在
    if (!fs.existsSync(dir)) {
        throw new Error(`【步骤1失败】源图片文件夹不存在：${dir}`)
    }

    // 支持的图片格式
    const validImageExts = ['.png', '.jpg', '.jpeg', '.webp', '.gif']

    // 读取并过滤图片文件
    const imageFiles = fs.readdirSync(dir)
        .filter((file) => {
            const ext = path.extname(file).toLowerCase()
            return validImageExts.includes(ext)
        })
        .map(file => path.join(dir, file))

    if (imageFiles.length === 0) {
        throw new Error(`【步骤1失败】源图片文件夹中未找到任何图片文件：${dir}`)
    }

    console.log(`✅ 【步骤1完成】共找到 ${imageFiles.length} 张图片`)
    return imageFiles
}

/**
 * 雪碧图坐标信息类型
 */
interface SpriteCoordinate {
    x: number
    y: number
    width: number
    height: number
    offsetX: number
    offsetY: number
}

/**
 * 步骤2：生成雪碧图、JSON坐标、CSS文件
 * @param imageFiles 图片文件路径数组
 * @returns 生成的文件路径
 */
async function generateSpriteFiles(imageFiles: string[], config: Config): Promise<{
    jsonPath: string
    cssPath: string
    imgPath: string
}> {
    // 创建临时输出目录
    if (!fs.existsSync(config.tempOutputDir)) {
        fs.mkdirSync(config.tempOutputDir, { recursive: true })
    }

    try {
    // 调用spritesmith生成雪碧图
        const result = await spritesmithRun({
            src: imageFiles,
            padding: config.sprite.padding,
            algorithm: config.sprite.algorithm,
        })

        // 1. 写入雪碧图文件
        const spriteImgPath = path.join(config.tempOutputDir, config.sprite.imgName)
        fs.writeFileSync(spriteImgPath, result.image, 'binary')

        // 2. 整理坐标数据并写入JSON文件
        const spriteJson: Record<string, SpriteCoordinate> = {}
        Object.keys(result.coordinates).forEach((imgPath) => {
            const imgName = path.basename(imgPath, path.extname(imgPath))
            const coords = result.coordinates[imgPath]!

            spriteJson[imgName] = {
                x: coords.x,
                y: coords.y,
                width: coords.width,
                height: coords.height,
                offsetX: -coords.x,
                offsetY: -coords.y,
            }
        })
        const spriteJsonPath = path.join(config.tempOutputDir, config.sprite.jsonName)
        fs.writeFileSync(spriteJsonPath, JSON.stringify(spriteJson, null, 2), 'utf8')

        // 3. 生成CSS文件
        let cssContent = `/* 自动生成的雪碧图CSS */
.${config.sprite.cssClassPrefix.replace('-', '')} {
  background-image: url('${config.sprite.imgPathInCss}');
  background-repeat: no-repeat;
  display: inline-block;
}
`
        Object.keys(spriteJson).forEach((imgName) => {
            const info = spriteJson[imgName]!
            const className = config.sprite.cssClassPrefix + imgName
            cssContent += `
.${className} {
  width: ${info.width}px;
  height: ${info.height}px;
  background-position: ${info.offsetX}px ${info.offsetY}px;
}
`
        })
        const spriteCssPath = path.join(config.tempOutputDir, config.sprite.cssName)
        fs.writeFileSync(spriteCssPath, cssContent, 'utf8')

        console.log(`✅ 【步骤2完成】已生成：
      - 雪碧图：${spriteImgPath}
      - JSON坐标：${spriteJsonPath}
      - CSS文件：${spriteCssPath}`)

        return {
            jsonPath: spriteJsonPath,
            cssPath: spriteCssPath,
            imgPath: spriteImgPath,
        }
    }
    catch (err) {
        const error = err as Error
        throw new Error(`【步骤2失败】生成雪碧图文件出错：${error.message}`)
    }
}

/**
 * 步骤3：拷贝JSON和CSS文件到指定目标目录
 * @param jsonPath JSON文件路径
 * @param cssPath CSS文件路径
 */
function copyFilesToTarget(imagePath: string, cssPath: string, config: Config): void {
    // 创建目标目录
    if (!fs.existsSync(config.targetDir)) {
        fs.mkdirSync(config.targetDir, { recursive: true })
    }

    if (config.targetCssDir) {
        fs.mkdirSync(config.targetCssDir, { recursive: true })
    }

    // 拷贝image文件
    const targetImagePath = path.join(config.targetDir, path.basename(imagePath))
    fs.copyFileSync(imagePath, targetImagePath)

    // 拷贝CSS文件
    const targetCssPath = path.join(config.targetCssDir ?? config.targetDir, path.basename(cssPath))
    fs.copyFileSync(cssPath, targetCssPath)

    console.log(`✅ 【步骤3完成】已拷贝文件到目标目录：
    - 图片文件：${targetImagePath}
    - CSS文件：${targetCssPath}`)
}

/**
 * 主函数：执行完整流程
 */
async function runSpriteWorkflow(config: Config): Promise<void> {
    try {
    // 步骤1：获取所有图片文件
        const imageFiles = getImageFiles(config.sourceImgDir)

        // 步骤2：生成雪碧图、JSON、CSS
        const { imgPath, cssPath } = await generateSpriteFiles(imageFiles, config)

        // 步骤3：拷贝文件到目标目录
        copyFilesToTarget(imgPath, cssPath, config)

        console.log('\n🎉 【全部流程完成】雪碧图生成+文件拷贝已全部完成！')
    }
    catch (err) {
        const error = err as Error
        console.error('❌ 【流程执行失败】', error.message)
    }
}

const CONFIG_ITEM: Config = {
    sourceImgDir: path.join(__dirname, '../temp/compressed-icons'),
    tempOutputDir: path.join(__dirname, './dist'),
    targetDir: path.join(__dirname, '../../web/src/assets'),
    targetCssDir: path.join(__dirname, '../../web/src/styles'),
    sprite: {
        padding: 2,
        algorithm: 'binary-tree',
        imgName: 'sprite-item.png',
        jsonName: 'sprite-item.json',
        cssName: 'sprite-item.css',
        cssClassPrefix: 'icon-item-',
        imgPathInCss: './sprite-item.png',
    },
}

const CONFIG_BIULDING: Config = {
    sourceImgDir: path.join(__dirname, '../temp/compressed-icons-building'),
    tempOutputDir: path.join(__dirname, './dist'),
    targetDir: path.join(__dirname, '../../web/src/assets'),
    targetCssDir: path.join(__dirname, '../../web/src/styles'),
    sprite: {
        padding: 2,
        algorithm: 'binary-tree',
        imgName: 'sprite-building.png',
        jsonName: 'sprite-building.json',
        cssName: 'sprite-building.css',
        cssClassPrefix: 'icon-building-',
        imgPathInCss: './sprite-building.png',
    },
}

// 执行主流程
async function run() {
    await runSpriteWorkflow(CONFIG_ITEM)
    await runSpriteWorkflow(CONFIG_BIULDING)
}

run()
