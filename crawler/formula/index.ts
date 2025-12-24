import path from 'node:path'
import process from 'node:process'

import { URL } from 'node:url'
import axios from 'axios'
import * as cheerio from 'cheerio'

import fs from 'fs-extra'
import { __dirname, VIRTUAL_UA } from '../utils'

const TARGET_BUILDING_PATH = '/zh/buildings'
const TARGET_ORIGIN = 'https://satisfactory-calculator.com/'
const JSON_OUTPUT_DIR = path.resolve(__dirname, '../dist/data/')
const ALL_FORMULA_JSON_FILE_NAME = 'all_formula.json'
const BUILDING_FORMULA_JSON_FILE_NAME = 'building_formula.json'
const BUILDING_MATERAIL = 'building_materail.json'
const BUILDING_COSUMPTION = 'building_comsumption.json'

const SELECTORS = {
    buildingDivSelector: 'div.card.mb-3.text-center.flex-grow-1',
    buildingFormulaTableSelector: 'table.table.mb-0',
    formulaTrSelector: 'tbody tr',
    buildingRequiresSelector: '.col-xl-6.mb-3',
    buildingConsumptionSeletor: {
        ul: 'ul',
        span: '.float-right',
        index: 1,
    },
    buildingMaterailSelector: 'p.m-0',
}

interface FormulaItem {
    count: number
    rapid: number
    name: string
}

interface Formula {
    name: string
    input: FormulaItem[]
    output: FormulaItem[]
}

type FormulaWithBuilding = Formula & {
    building: string
}

function extractNumber(s: string | undefined) {
    return +(s ?? '0').replace(/\D+/g, '')
}

// 1. 爬取页面所有建筑链接，并且点进去，然后找配方
async function crawlBuildingDetails() {
    try {
        const buildingUrl = new URL(TARGET_BUILDING_PATH, TARGET_ORIGIN).href
        // 1.1 请求页面
        const { data: html } = await axios.get(buildingUrl, {
            headers: {
                'User-Agent': VIRTUAL_UA,
            },
        })
        const $ = cheerio.load(html)

        const buildingLinks: Record<string, string> = {}
        // 1.2 找到所有建筑对应链接
        $(SELECTORS.buildingDivSelector).each((_, el) => {
            $(el).find('h6').each((_1, h6) => {
                const buildingLink = $(h6).find('a').attr('href')!
                const buildingName = $(h6).find('a').text()!.trim()

                buildingLinks[buildingName] = buildingLink
            })
        })

        console.log('🎉爬去所有建筑链接完成！！')
        return buildingLinks
    }
    catch (err) {
        console.error('❌ 爬取建筑链接失败：', err)
        process.exit(1)
    }
}

async function crawlBuildingFormulas(buildingLinks: Record<string, string>) {
    // 根据building聚合
    const allBuildingFormulas: Record<string, Formula[]> = {}
    const allFormulas: FormulaWithBuilding[] = []

    const allBuildingMaterail: Record<string, Record<string, number>> = {}
    const allBuildingComsuption: Record<string, number> = {}

    for (const [buildingName, href] of Object.entries(buildingLinks)) {
        const { formula, buildingConsumption, buildingMaterail } = await crawlBuildingFormula(href)
        allBuildingFormulas[buildingName] = formula

        const formulsaWithBuilding: FormulaWithBuilding[] = formula.map(f => ({
            ...f,
            building: buildingName,
        }))

        allBuildingMaterail[buildingName] = buildingMaterail
        allBuildingComsuption[buildingName] = buildingConsumption
        allFormulas.push(...formulsaWithBuilding)
    }

    console.log('🎉所有建筑内容爬取完毕🎉🎉')
    console.log(JSON.stringify(allBuildingMaterail))
    console.log(JSON.stringify(allBuildingComsuption))
    return {
        allFormulas,
        allBuildingFormulas,
        allBuildingMaterail,
        allBuildingComsuption,
    }
}

async function crawlBuildingFormula(href: string): Promise<{
    formula: Formula[]
    buildingMaterail: Record<string, number>
    buildingConsumption: number
}> {
    const buildingDetailUrl = new URL(href, TARGET_ORIGIN).href
    console.log(`🎁准备访问建筑链接${href}`)
    const { data: html } = await axios.get(buildingDetailUrl, {
        headers: {
            'User-Agent': VIRTUAL_UA,
        },
    })
    const $ = cheerio.load(html)
    const formulaTrs: cheerio.Cheerio<Element>[][] = []
    $(SELECTORS.buildingFormulaTableSelector).each((_, table) => {
        const tr = $(table).find(SELECTORS.formulaTrSelector)
        let i = 0

        let formulaTr: cheerio.Cheerio<Element>[] = []
        while (i < tr.length) {
            if (i % 2 === 0) {
                formulaTr = []
            }

            formulaTr.push($(tr[i]) as unknown as cheerio.Cheerio<Element>)

            if (i % 2 === 1) {
                formulaTrs.push(formulaTr)
            }
            i++
        }
    })

    const formulas = formulaTrs.map(([tr0, tr1]) => {
        const name = (tr0 as unknown as cheerio.Cheerio<any>).find('h5').text()

        const content4Tds = (tr1 as unknown as cheerio.Cheerio<any>).find('td')
        const input: FormulaItem[] = []
        const output: FormulaItem[] = []

        // 有一些采矿，根据矿点纯度，一个产出物品对应多个速率，缓存名字
        let tempOutputItem = ''
        $(content4Tds).each((index, el) => {
            if (index === 0) {
                // 输入
                const divs = $(el).find('div')
                if (divs.length === 0) {
                    // 无输入，采矿等
                }
                else {
                    $(divs).each((_, div) => {
                        // count:1x item:铁矿
                        const [count, item] = $(div).text().split(' ')

                        input.push({
                            name: item || '',
                            count: extractNumber(count),
                            rapid: 0,
                        })
                    })
                }
            }
            else if (index === 1) {
                // 速率
                const divs = $(el).find('div')
                if (divs.length === 0) {
                    // 无输入，采矿等
                }
                else {
                    $(divs).each((index1, div) => {
                        // count:1x item:铁矿
                        const text = $(div).text()
                        const rapid = extractNumber(text)

                        input[index1]!.rapid = rapid
                    })
                }
            }
            else if (index === 2) {
                // 输出速率
                const divs = $(el).find('div')
                if (divs.length === 0) {
                    // 无输出，采矿等
                }
                else {
                    $(divs).each((_, div) => {
                        // count:1x item:铁矿
                        const text = $(div).text()
                        const rapid = extractNumber(text)

                        output.push({
                            name: '',
                            count: 0,
                            rapid,
                        })
                    })
                }
            }
            else {
                // 输出物品
                const divs = $(el).find('div')
                if (divs.length === 0) {
                    // 无输
                }
                else {
                    $(divs).each((index1, div) => {
                        // count:1x item:铁矿
                        const [count, item] = $(div).text().split(' ')

                        if (item && !tempOutputItem) {
                            tempOutputItem = item
                        }

                        output[index1]!.count = extractNumber(count)
                        output[index1]!.name = item || tempOutputItem || ''
                    })
                }
            }
        })

        return {
            input,
            output,
            name,
        }
    })

    let buildingConsumption = 0
    const buildingMaterail: Record<string, number> = {}
    $(SELECTORS.buildingRequiresSelector).each((index, el) => {
        if (index === 0) {
            // 耗电量
            const consumptionText = $($(el)
                .find(SELECTORS.buildingConsumptionSeletor.ul)[SELECTORS.buildingConsumptionSeletor.index])
                .find(SELECTORS.buildingConsumptionSeletor.span)
                .text()

            buildingConsumption = extractNumber(consumptionText)
        }
        else {
            // index 为1，找建筑材料
            $(el).find(SELECTORS.buildingMaterailSelector).each((_, p) => {
                const texts = $(p).text().trim().split(' ').filter(s => s)

                const materailName = texts[1] ?? ''
                const number = extractNumber(texts[0] ?? '0')

                buildingMaterail[materailName] = number
            })
        }
    })
    console.log(`🎉建筑链接${href}内容爬取完成`)
    return {
        formula: formulas,
        buildingConsumption,
        buildingMaterail,
    }
}

async function writeFile<T extends Record<string, unknown> | unknown[]>(obj: T, fileName: string) {
    const jsonStr = JSON.stringify(obj, null, 2)
    await fs.ensureDir(JSON_OUTPUT_DIR)
    const filePath = path.join(JSON_OUTPUT_DIR, fileName) // 拼接文件路径

    await fs.writeFile(filePath, jsonStr, 'utf8')
    console.log(`👌写入文件${filePath}成功`)
}

async function writeJson({ allBuildingFormulas, allFormulas, allBuildingComsuption, allBuildingMaterail }:
{
    allFormulas: FormulaWithBuilding[]
    allBuildingFormulas: Record<string, Formula[]>
    allBuildingComsuption: Record<string, number>
    allBuildingMaterail: Record<string, Record<string, number>>
}) {
    await writeFile(allBuildingFormulas, BUILDING_FORMULA_JSON_FILE_NAME)
    await writeFile(allFormulas, ALL_FORMULA_JSON_FILE_NAME)
    await writeFile(allBuildingComsuption, BUILDING_COSUMPTION)
    await writeFile(allBuildingMaterail, BUILDING_MATERAIL)
}

// 主流程：爬取
export default async function main() {
    const buildingLinks = await crawlBuildingDetails()
    const { allBuildingFormulas, allFormulas, allBuildingComsuption, allBuildingMaterail }
        = await crawlBuildingFormulas(buildingLinks)
    // 写文件
    await writeJson({ allBuildingFormulas, allFormulas, allBuildingComsuption, allBuildingMaterail })
    console.log('\n🎉 全部流程完成！')
}
