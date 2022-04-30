import React from 'react'

export interface MenuSubmenuContextValue {
	height: number | 'auto'
	setHeight: Function
	active: boolean
	setActive: Function
	defaultActive: boolean
}

const MenuSubmenuContext = React.createContext<MenuSubmenuContextValue>({
	height: 'auto',
	setHeight: () => {},
	active: true,
	setActive: () => {},
	defaultActive: false,
})

MenuSubmenuContext.displayName = 'MenuSubmenuContext'

export default MenuSubmenuContext
