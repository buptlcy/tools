import { HomeOutlined, PictureOutlined, SettingOutlined } from '@ant-design/icons'
import { Menu } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'

export default function SiderMenu() {
    const navigate = useNavigate()
    const location = useLocation()

    // 多级菜单配置
    const menuItems = [
        { key: '/', icon: <HomeOutlined />, label: '首页' },
        {
            key: '/icon-manage',
            icon: <PictureOutlined />,
            label: '图标管理',
            children: [
                { key: '/icon-manage/list', label: '图标列表' },
                { key: '/icon-manage/upload', label: '图标上传' },
            ],
        },
        { key: '/setting', icon: <SettingOutlined />, label: '系统设置' },
    ]

    const handleMenuClick: React.ComponentProps<typeof Menu>['onClick'] = e => navigate(e.key)

    return (
        <Menu
            mode="inline"
            items={menuItems}
            onClick={handleMenuClick}
            selectedKeys={[location.pathname]}
            style={{ height: '100%' }}
        />
    )
}
