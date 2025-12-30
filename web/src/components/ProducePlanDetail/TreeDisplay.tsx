import type { TreeDisplayData } from '../ProducePlanSearch/types'
import { Select, Tree } from 'antd'
import React from 'react'

import { useProducePlanContext } from '../../contexts/ProducePlanContext'
import utils from '../../utils'
import buildingUtils from '../../utils/building'
import itemUtils from '../../utils/items'

import '../../styles/sprite-item.css'
import '../../styles/sprite-building.css'

// 纯净树形组件
function TreeDisplay() {
    const { initFormulaList, handleFormulaChange } = useProducePlanContext()

    const formattedTreeData = React.useMemo(() => {
        return itemUtils.formatTreeDisplayData(initFormulaList)
    }, [initFormulaList])

    const titleRenderer = React.useCallback((data: TreeDisplayData) => {
        const itemName = itemUtils.getFormulaOutputName(data)

        const buildingCount = data.buildingCount ? utils.toFixed2(data.buildingCount) : '一些'
        const rapid = data.rapid ? utils.toFixed2(data.rapid) : '一些'

        const allAvailableFormulas = itemUtils.getOptionsByName(itemName)

        return (
            <>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {rapid}
                    {' '}
                    *
                    <div style={{ width: '32px', height: '32px', marginRight: '6px' }}>
                        <div
                            className={`iconitem- icon-item-${itemName}`}
                            style={itemUtils.getCss(itemName, 32)}
                        >
                        </div>
                    </div>
                    <span>
                        {itemName}
                    </span>
                    <span style={{ margin: '0 6px' }}>=</span>

                    {buildingCount}
                    {' '}
                    *
                    <div style={{ width: '32px', height: '32px', marginRight: '6px' }}>
                        <div
                            className={`iconbuilding- icon-building-${data.building}`}
                            style={buildingUtils.getCss(data.building, 32)}
                        >
                        </div>
                    </div>
                    <span>
                        {data.building}
                    </span>
                    {
                        allAvailableFormulas.length > 1 && (
                            <Select
                                options={allAvailableFormulas}
                                style={{ width: '600px', margin: '0px 6px' }}
                                defaultValue={itemName}
                                size="small"
                                onChange={e => handleFormulaChange(data.id!, data.rapid ?? 0, e)}
                            >
                            </Select>
                        )
                    }
                    {itemUtils.findAddtionalProduct(itemName, data)}
                </div>
            </>
        )
    }, [formattedTreeData])

    const [expandKeys, setExpandKeys] = React.useState<string[]>([])

    React.useEffect(() => {
        const allKeys = getAllNodeKeys(formattedTreeData)

        setExpandKeys(allKeys)
    }, [formattedTreeData])

    return (
        <div style={{ width: '100%', minHeight: 400 }}>
            <Tree<TreeDisplayData>
                titleRender={titleRenderer}
                treeData={formattedTreeData}
                showLine // 显示层级连接线，可选
                showIcon // 显示节点图标，可选
                defaultExpandAll={true} // 是否默认展开所有，false=手动展开
                expandedKeys={expandKeys}
            />
            {/* {JSON.stringify(formattedTreeData)} */}
        </div>
    )
}

function getAllNodeKeys(treeNodes: TreeDisplayData[]) {
    const keys: string[] = []

    treeNodes.forEach((n) => {
        keys.push(n.key)
        keys.push(...getAllNodeKeys(n.children))
    })

    return keys
}

export default TreeDisplay
