import { LoadingOutlined } from '@ant-design/icons'
import { Empty, Spin, Tabs } from 'antd'
import TabPane from 'antd/es/tabs/TabPane'
import React from 'react'
import { useProducePlanContext } from '../../contexts/ProducePlanContext'
import BuildingDisplay from './BuildingDisplay'
import styles from './index.module.css' // 预留样式文件，可自定义样式
import ProductDisplay from './ProductDisplay'
import TreeDisplay from './TreeDisplay'

// 组件接收的props类型
interface ProducePlanDetailProps {

}

enum DisplayType {
    Tree = 'Tree',
    Building = 'Building',
    Item = 'Item',
}

const TabName = {
    [DisplayType.Tree]: '树形展示',
    [DisplayType.Building]: '建筑展示',
    [DisplayType.Item]: '聚合展示',
}

function renderTabContent(key: DisplayType) {
    if (key === DisplayType.Tree) {
        return <TreeDisplay />
    }
    else if (key === DisplayType.Item) {
        return <ProductDisplay />
    }
    else if (key === DisplayType.Building) {
        return <BuildingDisplay />
    }

    return null
}

// 搜索结果组件核心
const ProducePlanDetail: React.FC<ProducePlanDetailProps> = () => {
    const [loading] = React.useState(false) // todo

    const produceSearchContext = useProducePlanContext()
    const isEmpty = React.useMemo(() => {
        return produceSearchContext.initFormulaList.length === 0
    }, [produceSearchContext.initFormulaList])

    // 新增：Tab切换的默认选中项，默认选中第一个tab0
    const [activeTabKey, setActiveTabKey] = React.useState<DisplayType>(DisplayType.Tree)

    // Tab切换回调
    const handleTabChange = (key: string) => {
        setActiveTabKey(key as DisplayType)
    }

    return (
        <div className={styles.resultContainer}>
            {/* 核心区域：三态切换【加载中 / 无数据 / 有数据】，无任何实际内容，纯架子 */}
            <div className={styles.resultContent}>
                {/* ① 加载中状态 - 接口请求时展示 */}
                {loading && (
                    <div className={styles.loadingWrapper}>
                        <Spin
                            indicator={<LoadingOutlined style={{ fontSize: 24, color: '#4096ff' }} spin />}
                            tip="数据查询中..."
                        />
                    </div>
                )}

                {/* ② 无数据状态 - 查询完成，无匹配结果 */}
                {!loading && isEmpty && (
                    <div className={styles.emptyWrapper}>
                        <Empty description="暂无匹配的查询结果" />
                    </div>
                )}

                {/* ③ 有数据状态 - 查询完成，有结果【纯架子，无内容，你后续循环塞数据即可】 */}
                {!loading && !isEmpty && (
                    <div className={styles.resultListWrapper}>
                        <Tabs
                            activeKey={activeTabKey}
                            onChange={handleTabChange}
                            type="card" // 卡片式tab，美观，和整体风格匹配
                            className={styles.resultTabs}
                        >
                            {
                                Object.keys(DisplayType).map((key) => {
                                    return (
                                        <TabPane tab={TabName[key as DisplayType]} key={key}>
                                            {renderTabContent(key as DisplayType)}
                                        </TabPane>
                                    )
                                })
                            }

                        </Tabs>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProducePlanDetail
