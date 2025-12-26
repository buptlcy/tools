import React, { createContext, useContext } from 'react'

// 空Context类型（仅占位，无任何属性）
interface ProducePlanContextType {}

// 创建Context，默认值为空对象
const ProducePlanContext = createContext<ProducePlanContextType>({})

// Context Provider组件（仅包裹子组件，无任何状态）
export const ProducePlanProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    return <ProducePlanContext.Provider value={{}}>{children}</ProducePlanContext.Provider>
}

// 自定义Hook（仅占位，无逻辑）
export function useProducePlanContext() {
    return useContext(ProducePlanContext)
}
