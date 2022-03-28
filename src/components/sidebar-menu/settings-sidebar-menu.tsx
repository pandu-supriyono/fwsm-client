import { SidebarMenu } from './sidebar-menu'
import { SidebarMenuItem } from './sidebar-menu-item'

export function SettingsSidebarMenu(props: {
  active: 'profile' | 'product' | 'images' | 'account' | null
}) {
  const { active = null } = props
  return (
    <SidebarMenu>
      <SidebarMenuItem href="/settings/profile" isActive={active === 'profile'}>
        Public profile
      </SidebarMenuItem>
      <SidebarMenuItem href="/settings/product" isActive={active === 'product'}>
        Product description
      </SidebarMenuItem>
      <SidebarMenuItem href="/settings/images" isActive={active === 'images'}>
        Product images
      </SidebarMenuItem>
      <SidebarMenuItem href="/settings/account" isActive={active === 'account'}>
        Account
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
