import React from 'react'
import ProducePlanDetail from '../../components/ProducePlanDetail'
import ProducePlanSearch from '../../components/ProducePlanSearch'
import { ProducePlanProvider } from '../../contexts/ProducePlanContext'
// import SearchArea from './SearchArea';
// import ResultArea from './ResultArea';
import styles from './index.module.css'

// 页面级查询组件（骨架）
const ProducePlan: React.FC = () => {
    return (
        <div className={styles['query-page-card']}>
            <ProducePlanProvider>
                {/* 搜索区：绑定美化类名 */}
                <div className={styles['query-search-section']}>
                    <ProducePlanSearch />
                </div>

                {/* 结果展示区：绑定美化类名 */}
                <div className={styles['query-result-section']}>
                    <ProducePlanDetail />
                </div>
            </ProducePlanProvider>
        </div>
    )
}

export default ProducePlan
