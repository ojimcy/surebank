import React from 'react'
import { Menu } from '@blueupcode/components'

export interface AsideNavigationMenuSubmenuProps {
	title: string
	active?: boolean
	icon?: React.ReactNode
}

const AsideNavigationMenuSubmenu: React.FC<AsideNavigationMenuSubmenuProps> = ({
	title,
	children,
	active,
	icon,
}) => {
	return (
		<Menu.Submenu defaultActive={active}>
			<Menu.Toggle icon={icon} caret>
				{title}
			</Menu.Toggle>
			<Menu.SubmenuMenu>{children}</Menu.SubmenuMenu>
		</Menu.Submenu>
	)
}

export default AsideNavigationMenuSubmenu
