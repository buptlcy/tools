import type React from 'react'
import type { CalculatedFormulaTreeNode, Formula, SearchParams, TreeDisplayData } from
    '../components/ProducePlanSearch/types'
import spriteItem from '../assets/sprite-item.png'
import allFormulas from '../data/all_formula.json'
import itemsPosition from '../data/sprite-position.json'

const formulas = formatFormulas()

function getItems() {
    return Object.keys(itemsPosition)
}

function getItemOption() {
    const options = getItems().map((name) => {
        return {
            value: name,
            label: name,
        }
    })

    const filterdOptions = options.filter((opt) => {
        const { label } = opt

        const name = fix(label)

        return !!formulas[name]
    })

    return filterdOptions
}

const options = getItemOption()

function formatFormulas() {
    const formattedFormulas: Record<string, Formula> = {}

    allFormulas.forEach((formula) => {
        const _formula = {
            ...formula,
            alternative: 0,
        }

        let {
            name,
            building,
        } = _formula

        if (name.includes('替代')) {
            _formula.alternative = 1
        }

        if (building === '资源抽取器' && ['水', '原油'].includes(name)) {
            name = `资源抽取器-${name}`
        }

        formattedFormulas[name] = _formula
    })

    return formattedFormulas
}
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
    const formula = getFormulaByFormulaName(name)

    const name1 = (formula ? getFormulaOutputName(formula) : name) as keyof typeof itemsPosition

    try {
        const originSize = itemsPosition[name1].width
        const ratio = targetSize / originSize

        return {
            backgroundImage: `url(${spriteItem})`,
            transform: `scale(${ratio})`,
            transformOrigin: '0 0',
        }
    }
    catch (_u: unknown) {
        console.error(_u)
        console.error('get css error name is : ', name1)
    }
}

function getDefaultFormulaListFromSearch(searchParams: SearchParams) {
    if (!searchParams.length) {
        return []
    }

    const topLevelFormulas = searchParams.map(({ item, rapid }) => {
        const f = formulas[fix(item)]!
        const buildingCount = rapid / (f.output[0]?.rapid ?? 1)

        return {
            ...f,
            buildingCount,
            rapid,
        }
    })

    // console.log('top level formulas is: ', topLevelFormulas)

    const defaultFormulas = recursiveGetFormula(topLevelFormulas)

    return defaultFormulas
}

function updateFormula(formulaName: string, rapid: number) {
    const topLevelFormula = formulas[formulaName]!

    let outputIndex = 0

    if (topLevelFormula.output.some(v => !v.name)) {
        let i = 0
        let max = 0
        while (i < topLevelFormula.output.length) {
            if (topLevelFormula.output[i]!.rapid > max) {
                max = topLevelFormula.output[i]!.rapid
                outputIndex = i
            }
            i++
        }
    }

    const buildingCount = rapid / (topLevelFormula.output[outputIndex]?.rapid ?? 1)

    const defaultFormulas = recursiveGetFormula([{ ...topLevelFormula, rapid, buildingCount }])

    return defaultFormulas[0]
}

function fix(name: string) {
    if (name === 'F金锭') {
        return 'F金锭（铁）'
    }

    return name
}

function unfix(name: string) {
    if (name === 'F金锭（铁）') {
        return 'F金锭'
    }

    return name
}

function recursiveGetFormula(topLevelFormulas: CalculatedFormulaTreeNode[]) {
    return topLevelFormulas.map((f) => {
        const { input, output, rapid = 0 } = f
        const nextLevelFromulas = input.map(({ name, count }) => {
            const patchName = fix(name)

            const nextLevelFormula = formulas[patchName] ?? formulas[`资源抽取器-${patchName}`]!

            let index = 0
            if (nextLevelFormula.output.some(v => !v.name)) {
                let i = 0
                let max = 0
                while (i < nextLevelFormula.output.length) {
                    if (nextLevelFormula.output[i]?.rapid ?? max < 0) {
                        max = nextLevelFormula.output[i]?.rapid ?? 0
                        index = i
                    }
                    i++
                }
            }

            const nextLevelOutput = nextLevelFormula.output[index]
            const thisLevelOutput = output[0]

            const nextLevelRapid = (count ?? 0) * rapid / (thisLevelOutput?.count ?? 1)
            const nextLevelbuldingCount = nextLevelRapid / (nextLevelOutput?.rapid ?? 1)

            return { ...nextLevelFormula, rapid: nextLevelRapid, buildingCount: nextLevelbuldingCount }
        })
        f.children = recursiveGetFormula(nextLevelFromulas)
        f.id = crypto.randomUUID()
        return f
    })
}

function formatTreeDisplayData(originTreeNodeList: CalculatedFormulaTreeNode[]) {
    const treeData: TreeDisplayData[] = originTreeNodeList.map((treeNode: CalculatedFormulaTreeNode) => {
        return {
            ...treeNode,
            title: treeNode.name,
            key: treeNode.id || crypto.randomUUID(),
            children: formatTreeDisplayData(treeNode.children ?? []),
        }
    })

    return treeData
}

function optionRender(info: Formula) {
    const { output, input, name, building } = info
    const itemName = output[0] ? output[0].name ? output[0].name : output.find(o => o.name)?.name : info.name
    const count = output[0]?.count ?? 0

    const inputList = input.map((product, index) => {
        return (
            <div style={
                { display: 'flex', marginRight: '4px' }
            }
            >
                {index === 0 ? '' : '+'}
                {product.count}
                {' '}
                *
                <div style={{ width: '24px', height: '24px', marginRight: '6px' }}>
                    <div
                        className={`iconitem- icon-item-${product.name}`}
                        style={getCss(product.name, 24)}
                    >
                    </div>
                </div>
                {product.name}
            </div>
        )
    })

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '4px' }}>
                {name}
                {`\(${building}\)`}
                {inputList.length ? ':' : ''}
            </span>
            {
                inputList.length > 0 && (
                    < >
                        <span>
                            {count}
                            *
                            {itemName}
                        </span>
                        =
                        {inputList}
                    </>
                )
            }

        </div>
    )
}

console.log(99999, formulas)

function getOptionsByName(name: string) {
    const result: { value: string, label: React.ReactNode }[] = []

    Object.entries(formulas).forEach(([fName, formula]) => {
        const { output } = formula

        if (output.some(item => item.name === fix(name))) {
            result.push({
                value: fName,
                label: optionRender(formula),
            })
        }
    })

    return result
}

function getFormulaOutputName<T extends Formula = Formula>(formula: T) {
    const { output, name } = formula

    if (output.length === 0) {
        return name
    }

    if (output[0]!.name) {
        // 总是在第一位
        return output[0]!.name
    }

    return output.find(p => p.name)!.name
}

function getFormulaByFormulaName(name: string) {
    return formulas[name]
}

export default {
    options,
    getDefaultFormulaListFromSearch,
    formatTreeDisplayData,
    getOptionsByName,
    getCss,
    getFormulaOutputName,
    updateFormula,
    unfix,
}
