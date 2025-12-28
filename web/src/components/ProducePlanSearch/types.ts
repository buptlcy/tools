export interface SearchParam {
    rapid: number
    item: string
}

export type SearchParams = SearchParam[]

export interface FormulaItem {
    name: string
    count: number
    rapid: number
}
export interface Formula {
    input: FormulaItem[]
    output: FormulaItem[]
    name: string
    building: string
    alternative: number
}

export type CalculatedFormulaTreeNode = Formula & {
    rapid?: number
    buildingCount?: number
    children?: CalculatedFormulaTreeNode[]
    id?: string
}

export type TreeDisplayData = Omit<CalculatedFormulaTreeNode, 'children'> & {
    key: string
    title: string
    children: TreeDisplayData[]
}
