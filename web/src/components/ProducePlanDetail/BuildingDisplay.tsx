import type { CalculatedFormulaTreeNode } from '../ProducePlanSearch/types'
import { Collapse, Divider, List } from 'antd'

import React from 'react'
import { useProducePlanContext } from '../../contexts/ProducePlanContext'
import utils from '../../utils'
import buildingUtils from '../../utils/building'
import itemUtils from '../../utils/items'

const { Panel } = Collapse

function renderHeader(buildingName: string, formulas: CalculatedFormulaTreeNode[]) {
    let totalBuilding = 0
    let i = 0

    while (i < formulas.length) {
        totalBuilding = formulas[i]?.buildingCount ?? 0 + totalBuilding
        i++
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', marginRight: '6px' }}>
                <div
                    className={`iconbuilding- icon-building-${buildingName}`}
                    style={buildingUtils.getCss(buildingName, 32)}
                >
                </div>
            </div>
            <span>
                {buildingName}
                {`(${utils.toFixed2(totalBuilding)})`}
            </span>
        </div>
    )
}

function renderBuilding(item: CalculatedFormulaTreeNode) {
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <span>
                {item.building}
                {`(${utils.toFixed2(item.buildingCount ?? 0)})`}
            </span>
            <Divider orientation="vertical" />
            {itemUtils.optionRender(item)}
        </div>
    )
}

const BuildingDisplay: React.FC = () => {
    const ctx = useProducePlanContext()

    const buildingList = React.useMemo(() => {
        return Object.entries(itemUtils.getBuildingListFromFormulaList(ctx.initFormulaList))
    }, [ctx.initFormulaList])

    return (
        <Collapse>
            {
                buildingList.map(([buildingName, formulas]) => {
                    return (
                        <Panel header={renderHeader(buildingName, formulas)} key={buildingName}>
                            <List<CalculatedFormulaTreeNode>
                                bordered
                                dataSource={formulas}
                                renderItem={item => (
                                    <List.Item>
                                        {renderBuilding(item)}
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

export default BuildingDisplay
