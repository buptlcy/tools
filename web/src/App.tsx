import { Layout } from 'antd'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import SiderMenu from './components/Menu'
import { routes } from './router'

const { Sider, Content } = Layout

// 1. 你的布局框架（左侧导航+右侧空白容器）：只负责布局，不负责内容
function AppLayout() {
    return (
        <Layout style={{ minHeight: '100vh', height: '100%' }}>
            <Sider width={200} style={{ height: '100%' }}><SiderMenu /></Sider>
            <div style={{ height: '100%', overflow: 'scroll', flex: 1 }}>
                <Content style={{ background: '#fff', flex: '1', minHeight: '100%' }}>
                    <Outlet />
                    {' '}
                    {/* 这里是「内容占位符」，只渲染页面组件，和布局不冲突 */}
                </Content>
            </div>
        </Layout>
    )
}

// 2. 路由规则（彻底避免「双/」误解，写法更清晰）
const router = createBrowserRouter([
    {
        path: '/', // 根路径：加载布局框架
        element: <AppLayout />,
        children: routes,
    },
])

// 3. 最终App组件：只渲染RouterProvider
export default function App() {
    return <RouterProvider router={router} />
}
