import type { TreeDisplayData } from '../ProducePlanSearch/types'
import { Select, Tree } from 'antd'
import React from 'react'

import { useProducePlanContext } from '../../contexts/ProducePlanContext'
import itemUtils from '../../utils/items'

import '../../styles/sprite-item.css'

// 纯净树形组件
function TreeDisplay() {
    const { initFormulaList, handleFormulaChange } = useProducePlanContext()

    const formattedTreeData = React.useMemo(() => {
        return itemUtils.formatTreeDisplayData(initFormulaList)
    }, [initFormulaList])

    const titleRenderer = React.useCallback((data: TreeDisplayData) => {
        const itemName = itemUtils.getFormulaOutputName(data)

        return (
            <>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '32px', height: '32px', marginRight: '6px' }}>
                        <div
                            className={`iconitem- icon-item-${itemName}`}
                            style={itemUtils.getCss(itemName, 32)}
                        >
                        </div>
                    </div>
                    <span>{itemName}</span>
                    <Select
                        options={itemUtils.getOptionsByName(itemName)}
                        style={{ width: '225px', margin: '0px 6px' }}
                        defaultValue={itemName}
                        size="small"
                        onChange={e => handleFormulaChange(data.id!, e)}
                    >
                    </Select>
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
