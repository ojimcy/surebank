import React from 'react'
import PropTypes from 'prop-types'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import MenuItem from './MenuItem'
import MenuSubmenuContext, { MenuSubmenuContextValue } from './MenuSubmenuContext'

export interface MenuSubmenuProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	defaultActive?: boolean
}

const propTypes = {
	as: PropTypes.elementType,
	defaultActive: PropTypes.bool,
}

const MenuSubmenu: BsPrefixRefForwardingComponent<'div', MenuSubmenuProps> = React.forwardRef<
	HTMLElement,
	MenuSubmenuProps
>(({ defaultActive = false, ...props }, ref) => {
	const [height, setHeight] = React.useState<MenuSubmenuContextValue['height']>('auto')
	const [active, setActive] = React.useState<MenuSubmenuContextValue['active']>(true)

	return (
		<MenuSubmenuContext.Provider value={{ height, setHeight, active, setActive, defaultActive }}>
			<MenuItem ref={ref} {...props} />
		</MenuSubmenuContext.Provider>
	)
})

MenuSubmenu.propTypes = propTypes
MenuSubmenu.displayName = 'MenuSubmenu'

export default MenuSubmenu
