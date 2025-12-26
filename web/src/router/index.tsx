// import { Navigate } from 'react-router-dom'
import { ProducePlan } from '../pages'

// 多级路由 + 404跳转首页11
export const routes = [
    // { path: '/', element: <Home /> }, // 一级路由
    // {
    //     path: '/生产计划', // 一级路由（包含子路由）
    //     element: <ProducePlan />,
    //     children: [ // 二级路由
    //         { path: 'list', element: <IconList /> }, // 路径：/icon-manage/list
    //         { path: 'upload', element: <IconUpload /> }, // 路径：/icon-manage/upload
    //     ],
    // },
    { path: '/produce_plan', element: <ProducePlan /> }, // 一级路由
    // { path: '*', element: <Navigate to="/" replace /> }, // 任意错误地址跳转首页
]
