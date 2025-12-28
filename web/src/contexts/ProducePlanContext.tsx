import type { CalculatedFormulaTreeNode, SearchParams } from '../components/ProducePlanSearch/types'
import React, { createContext, useContext } from 'react'

import itemUtils from '../utils/items'
// 空Context类型（仅占位，无任何属性）
interface ProducePlanContextType {
    searchParams: SearchParams
    setSearchParams: React.Dispatch<SearchParams>
    initFormulaList: CalculatedFormulaTreeNode[]
    handleFormulaChange: (id: string, formulaName: string) => void
}

// 创建Context，默认值为空对象
const ProducePlanContext = createContext<ProducePlanContextType>({
    searchParams: [],
    setSearchParams: () => null,
    initFormulaList: [],
    handleFormulaChange: () => null,
})

// Context Provider组件（仅包裹子组件，无任何状态）
export const ProducePlanProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [searchParams, setSearchParams] = React.useState<SearchParams>([])
    const [initFormulaList, setInitFormulaList] = React.useState<CalculatedFormulaTreeNode[]>([])

    const handleFormulaChange = React.useCallback((id: string, formulaName: string) => {
        const treeNode = findTreeNodeById(initFormulaList, id)

        const newTreeNode = itemUtils.updateFormula(formulaName)

        if (newTreeNode && treeNode) {
            newTreeNode.id = treeNode.id!
            Object.assign(treeNode, newTreeNode)

            setInitFormulaList([
                ...initFormulaList,
            ])
        }
    }, [initFormulaList])

    React.useEffect(() => {
        // 根据用户选中之生产计划，生成默认配方list
        const defaultFormulaList = itemUtils.getDefaultFormulaListFromSearch(searchParams)
        setInitFormulaList(defaultFormulaList)

        console.log(defaultFormulaList)
    }, [searchParams])

    return (
        <ProducePlanContext.Provider value={{
            searchParams,
            setSearchParams,
            initFormulaList,
            handleFormulaChange,
        }}
        >
            {children}
        </ProducePlanContext.Provider>
    )
}

function findTreeNodeById(
    treeNodes: CalculatedFormulaTreeNode[],
    id: string,
): CalculatedFormulaTreeNode | null {
    const n = treeNodes.find(n => n.id === id)

    if (n) {
        return n
    }

    let i = 0
    console.log(treeNodes)

    while (i < treeNodes.length) {
        const { children = [] } = treeNodes[i]!

        const cn = findTreeNodeById(children, id)
        if (cn) {
            return cn
        }
        i++
    }

    return null
}

// 自定义Hook（仅占位，无逻辑）
export function useProducePlanContext() {
    return useContext(ProducePlanContext)
}
