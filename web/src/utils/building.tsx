import spriteItem from '../assets/sprite-building.png'
import itemsPosition from '../data/sprite-position-building.json'

// .sprite-icon {
//   /* 1. 容器尺寸 = 目标区域尺寸（必须匹配） */
//   width: [width]px;
//   height: [height]px;

//   /* 2. 雪碧图基础属性（拆分后） */
//   background-image: url('/assets/xxx.png'); /* 雪碧图路径 */
//   background-repeat: no-repeat; /* 禁止重复（必加） */
//   background-position: -[x]px -[y]px; /* 核心定位：x/y取负数 */
//   background-size: auto; /* 保持原始尺寸，可选（默认值） */
// }

function getCss(name: string, targetSize: number) {
    const originSize = itemsPosition[name as keyof typeof itemsPosition].width
    const ratio = targetSize / originSize

    return {
        backgroundImage: `url(${spriteItem})`,
        transform: `scale(${ratio})`,
        transformOrigin: '0 0',
    }
}

export default {
    getCss,
}
