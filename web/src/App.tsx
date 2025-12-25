import { Layout } from 'antd'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import SiderMenu from './components/Menu'

const { Sider, Content } = Layout

// 1. 你的布局框架（左侧导航+右侧空白容器）：只负责布局，不负责内容
function AppLayout() {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider width={200}><SiderMenu /></Sider>
            <Content style={{ padding: 24, background: '#fff', flex: '1' }}>
                <Outlet />
                {' '}
                {/* 这里是「内容占位符」，只渲染页面组件，和布局不冲突 */}
            </Content>
        </Layout>
    )
}

// 2. 路由规则（彻底避免「双/」误解，写法更清晰）
const router = createBrowserRouter([
    {
        path: '/', // 根路径：加载布局框架
        element: <AppLayout />,
        children: [
            // 根路径下的默认页面：内容渲染到Outlet里
            { index: true, element: <div>首页内容（渲染在右侧容器里）</div> },
            // 其他页面：同样渲染到Outlet里
            { path: 'icon-manage/list', element: <div>雪碧图列表</div> },
            { path: 'icon-manage/upload', element: <div>图标上传</div> },
            { path: 'setting', element: <div>系统设置</div> },
            // 404：找不到路径时显示
            { path: '*', element: <div>404 → 跳首页</div> },
        ],
    },
])

// 3. 最终App组件：只渲染RouterProvider
export default function App() {
    return <RouterProvider router={router} />
}
