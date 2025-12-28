import type { SearchParams } from './types'
import { MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, InputNumber, message, Select, Space } from 'antd'
import React, { useState } from 'react'

import { useProducePlanContext } from '../../contexts/ProducePlanContext'
import items from '../../utils/items'
import styles from './index.module.css'
import '../../styles/sprite-item.css'

// 下拉框可选选项（可根据你的业务调整）
const ITEM_OPTIONS = items.options

const RAPID_OPTIONS = [5, 10, 15, 30, 60]

const optionRender: React.ComponentProps<typeof Select>['optionRender'] = (info) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', marginRight: '6px' }}>
                <div
                    className={`iconitem- icon-item-${info.label}`}
                    style={items.getCss(info.label as string, 32)}
                >
                </div>
            </div>
            <span>{info.label}</span>
        </div>
    )
}

const labelRender: React.ComponentProps<typeof Select<string>>['labelRender'] = (label) => {
    if (!label.value) {
        return null
    }
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '24px', height: '24px', marginRight: '6px' }}>
                <div
                    className={`iconitem- icon-item-${label.value}`}
                    style={items.getCss(label.value as string, 24)}
                >
                </div>
            </div>
            <span>{label.value}</span>
        </div>
    )
}

// 搜索区组件（支持添加/删除组）
const ProducePlanSearch: React.FC = () => {
    const producePlanContext = useProducePlanContext()

    // 初始化至少1组搜索条件
    const [searchGroups, setSearchGroups] = useState<SearchParams>([
        { item: '', rapid: 0 },
    ])

    // 添加一组搜索条件
    const handleAddGroup = () => {
        setSearchGroups([...searchGroups, { item: '', rapid: 0 }])
    }

    // 删除指定索引的搜索组
    const handleRemoveGroup = (index: number) => {
    // 至少保留1组，避免空状态
        if (searchGroups.length <= 1)
            return
        const newGroups = [...searchGroups]
        newGroups.splice(index, 1)
        setSearchGroups(newGroups)
    }

    // 修改单组的item值
    const handleItemChange = (index: number, value: string) => {
        const newGroups = [...searchGroups]
        newGroups[index]!.item = value
        setSearchGroups(newGroups)
    }

    // 修改单组的rapid值
    const handleRapidChange = (index: number, value: number) => {
        const newGroups = [...searchGroups]
        newGroups[index]!.rapid = value || 0 // 兜底避免undefined
        setSearchGroups(newGroups)
    }

    const validate = (): boolean => {
        // 遍历所有组，检查item是否为空
        for (let i = 0; i < searchGroups.length; i++) {
            if (!searchGroups[i]!.item) {
                // 提示用户第n组的物品未选择（Antd的message提示，需导入）
                message.error(`第${i + 1}组查询条件的【物品】不能为空，请选择！`)
                return false // 校验失败
            }
            else if (searchGroups[i]!.rapid === 0) {
                message.error(`第${i + 1}组查询条件的【速率】不能为空，请选择！`)
                return false // 校验失败
            }
        }
        return true // 校验通过
    }

    // 提交查询（输出最终的搜索数据数组）
    const handleSearch = () => {
    // 过滤掉item为空的无效组（可选）
        if (!validate()) {
            return false
        }
        const validData = searchGroups.filter(group => group.item)
        console.log('最终搜索数据：', validData) // 格式：{item: string, rapid: number}[]

        producePlanContext.setSearchParams(validData)
    }

    // 重置所有搜索组
    const handleReset = () => {
        setSearchGroups([{ item: '', rapid: 0 }])
    }

    return (
        <div className={styles['search-area-container']}>
            {/* 搜索区标题 */}
            <div className={styles['search-area-title']}>生产计划</div>

            {/* 搜索组列表 */}
            <div className={styles['search-groups']}>
                {searchGroups.map((group, index) => (
                    <div key={index} className={styles['search-group-item']}>
                        <Space align="center" size="middle">
                            {/* 删除按钮（至少保留1组时显示） */}
                            <div className={styles['delete-wrapper']}>
                                {
                                    index !== 0 && (
                                        <Button
                                            className={styles['button-mini']}
                                            icon={<MinusOutlined />}
                                            danger
                                            size="small"
                                            onClick={() => handleRemoveGroup(index)}
                                            disabled={searchGroups.length <= 1}
                                        />
                                    )
                                }
                            </div>
                            <div>
                                <span style={{ fontSize: 14, color: '#374151', whiteSpace: 'nowrap' }}>物品：</span>
                                {/* Select下拉框 */}
                                <Select
                                    placeholder="请选择项目"
                                    options={ITEM_OPTIONS}
                                    optionRender={optionRender}
                                    labelRender={labelRender}
                                    value={group.item}
                                    onChange={value => handleItemChange(index, value)}
                                    style={{ width: 250 }}
                                    size="small"
                                    showSearch={{
                                        filterOption: (input, option) => {
                                            return option!.label.includes(input)
                                        },
                                    }}

                                />
                            </div>
                            <div>
                                <span style={{ fontSize: 14, color: '#374151', whiteSpace: 'nowrap' }}>速率：</span>
                                <InputNumber
                                    placeholder="请输入数值"
                                    value={group.rapid}
                                    onChange={value => handleRapidChange(index, value as number)}
                                    min={0}
                                    style={{ width: 60 }}
                                    size="small"
                                />

                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                                {RAPID_OPTIONS.map(num => (
                                    <Button
                                        key={num}
                                        size="small"
                                        type="text"
                                        style={{
                                            padding: '0 6px',
                                            height: 24,
                                            lineHeight: '24px',
                                            fontSize: 12,
                                            color: '#4096ff',
                                        }}
                                        onClick={() => handleRapidChange(index, num)}
                                    >
                                        {num}
                                    </Button>
                                ))}
                            </div>
                        </Space>
                    </div>
                ))}
            </div>

            {/* 添加按钮 */}
            <div className={styles['search-area-actions']}>
                <Button
                    icon={<PlusOutlined />}
                    type="dashed"
                    onClick={handleAddGroup}
                >
                    添加物品
                </Button>
                <Space className={styles['search-area-btns']}>
                    <Button type="primary" onClick={handleSearch}>
                        给爷算
                    </Button>
                    <Button onClick={handleReset}>
                        重制
                    </Button>
                </Space>
            </div>

        </div>
    )
}

export default ProducePlanSearch
