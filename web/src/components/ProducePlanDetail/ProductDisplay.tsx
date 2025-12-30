import type { CalculatedFormulaTreeNode } from '../ProducePlanSearch/types'
import { Collapse, Divider, List } from 'antd'

import React from 'react'
import { useProducePlanContext } from '../../contexts/ProducePlanContext'
import utils from '../../utils'
import buildingUtils from '../../utils/building'
import itemUtils from '../../utils/items'

const { Panel } = Collapse

function renderHeader(itemName: string, productList: CalculatedFormulaTreeNode[]) {
    let totalRapid = 0
    const totalBuilding: Record<string, number> = {}
    let i = 0

    while (i < productList.length) {
        totalRapid = productList[i]?.rapid ?? 0 + totalRapid
        const building = productList[i]!.building
        const buildingCount = productList[i]?.buildingCount ?? 0

        if (totalBuilding[building]) {
            totalBuilding[building] = totalBuilding[building] + buildingCount
        }
        else {
            totalBuilding[building] = buildingCount
        }

        i++
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', marginRight: '6px' }}>
                <div
                    className={`iconitem- icon-item-${itemName}`}
                    style={itemUtils.getCss(itemName, 32)}
                >
                </div>
            </div>
            <span>
                {itemName}
                {`(${utils.toFixed2(totalRapid)}/分钟)`}
            </span>
            <Divider orientation="vertical" />
            {
                Object.entries(totalBuilding).map(([building, count]) => {
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '8px' }}>
                            {utils.toFixed2(count) }
                            {' '}
                            *
                            <div style={{ width: '32px', height: '32px', marginRight: '6px' }}>
                                <div
                                    className={`iconbuilding- icon-building-${building}`}
                                    style={buildingUtils.getCss(building, 32)}
                                >
                                </div>
                            </div>
                            <span>
                                {building}
                            </span>
                        </div>
                    )
                })
            }
        </div>
    )
}

function renderProduct(product: CalculatedFormulaTreeNode) {
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <span>
                {product.name}
                {`(${utils.toFixed2(product.rapid ?? 0)}/分钟)`}
            </span>
            <Divider orientation="vertical" />
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '8px' }}>
                {utils.toFixed2(product.buildingCount ?? 0) }
                {' '}
                *
                <div style={{ width: '32px', height: '32px', marginRight: '6px' }}>
                    <div
                        className={`iconbuilding- icon-building-${product.building}`}
                        style={buildingUtils.getCss(product.building, 32)}
                    >
                    </div>
                </div>
                <span>
                    {product.building}
                </span>
            </div>
        </div>
    )
}

const ProductDisplay: React.FC = () => {
    const ctx = useProducePlanContext()

    const productList = React.useMemo(() => {
        return Object.entries(itemUtils.getProductListFromFormulaList(ctx.initFormulaList))
    }, [ctx.initFormulaList])

    return (
        <Collapse>
            {
                productList.map(([name, product]) => {
                    return (
                        <Panel header={renderHeader(name, product)} key={name}>
                            <List<CalculatedFormulaTreeNode>
                                bordered
                                dataSource={product}
                                renderItem={item => (
                                    <List.Item>
                                        {renderProduct(item)}
                                    </List.Item>
                                )}
                            />
                        </Panel>
                    )
                })
            }
        </Collapse>
    )
}

export default ProductDisplay
