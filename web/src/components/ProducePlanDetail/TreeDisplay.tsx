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
        console.log(5555, initFormulaList)
        return itemUtils.formatTreeDisplayData(initFormulaList)
    }, [initFormulaList])

    const titleRenderer = React.useCallback((data: TreeDisplayData) => {
        return (
            <>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '32px', height: '32px', marginRight: '6px' }}>
                        <div
                            className={`iconitem- icon-item-${data.name}`}
                            style={itemUtils.getCss(data.name as string, 32)}
                        >
                        </div>
                    </div>
                    <span>{data.name}</span>
                    <Select
                        options={itemUtils.getOptionsByName(data.name)}
                        style={{ width: '225px', margin: '0px 6px' }}
                        defaultValue={data.name}
                        size="small"
                        onChange={e => handleFormulaChange(data.id!, e)}
                    >
                    </Select>
                </div>
            </>
        )
    }, [])

    return (
        <div style={{ width: '100%', minHeight: 400 }}>
            <Tree<TreeDisplayData>
                titleRender={titleRenderer}
                treeData={formattedTreeData}
                showLine // 显示层级连接线，可选
                showIcon // 显示节点图标，可选
                defaultExpandAll={true} // 是否默认展开所有，false=手动展开
            />
        </div>
    )
}

export default TreeDisplay
