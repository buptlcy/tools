import crawFormula from './formula'
import crawImage from './images'

async function main() {
    console.log('----运行爬虫脚本----')
    console.log('----💡爬取图片----')
    crawImage()

    console.log('----💡爬取配方----')
    await crawFormula()

    console.log('----✅一切结束----')
}

main()
