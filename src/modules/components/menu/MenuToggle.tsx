import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import MenuLink from './MenuLink'
import MenuSubmenuContext, { MenuSubmenuContextValue } from './MenuSubmenuContext'
import { MenuLinkProps } from './MenuLink'

export interface MenuToggleProps extends MenuLinkProps {}

const propTypes = {
	as: PropTypes.elementType,
}

const MenuToggle: BsPrefixRefForwardingComponent<'button', MenuToggleProps> = React.forwardRef<
	HTMLElement,
	MenuToggleProps
>(({ as = 'button', bsPrefix, className, onClick, ...props }, ref) => {
	bsPrefix = useBootstrapPrefix(bsPrefix, 'menu-item-toggle')

	const { active, setActive }: MenuSubmenuContextValue = React.useContext(MenuSubmenuContext)

	const handleToggle: React.MouseEventHandler<HTMLElement> = (e) => {
		setActive((prevActive: boolean) => !prevActive)

		if (onClick) {
			onClick(e)
		}
	}

	return (
		<MenuLink
			as={as}
			ref={ref}
			{...props}
			className={classNames(className, bsPrefix)}
			onClick={handleToggle}
			active={active}
		/>
	)
})

MenuToggle.propTypes = propTypes
MenuToggle.displayName = 'MenuToggle'

export default MenuToggle
