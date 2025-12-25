import { Navigate } from 'react-router-dom'
// 一级页面占位
const Home = () => <div>首页111</div>
const IconManage = () => <div>图标管理</div>
const Setting = () => <div>系统1设置</div>
// 二级页面占位（示例：图标管理下的2个子页面）
const IconList = () => <div>图标1列表</div>
const IconUpload = () => <div>图标1上传</div>

// 多级路由 + 404跳转首页11
export const routes = [
    { path: '/', element: <Home /> }, // 一级路由
    {
        path: '/icon-manage', // 一级路由（包含子路由）
        element: <IconManage />,
        children: [ // 二级路由
            { path: 'list', element: <IconList /> }, // 路径：/icon-manage/list
            { path: 'upload', element: <IconUpload /> }, // 路径：/icon-manage/upload
        ],
    },
    { path: '/setting', element: <Setting /> }, // 一级路由
    { path: '*', element: <Navigate to="/" replace /> }, // 任意错误地址跳转首页
]
