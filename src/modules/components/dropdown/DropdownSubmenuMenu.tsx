import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'

export interface DropdownSubmenuMenuProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	align?: 'start' | 'end'
}

const propTypes = {
	as: PropTypes.elementType,
	align: PropTypes.string,
}

const DropdownSubmenuMenu: BsPrefixRefForwardingComponent<'div', DropdownSubmenuMenuProps> = React.forwardRef<
	HTMLElement,
	DropdownSubmenuMenuProps
>(({ as: Component = 'div', align = 'start', bsPrefix, className, ...props }, ref) => {
	bsPrefix = useBootstrapPrefix(bsPrefix, 'dropdown-submenu')

	return (
		<Component
			ref={ref}
			{...props}
			className={classNames(className, `${bsPrefix}-menu`, align && `${bsPrefix}-${align}`)}
		/>
	)
})

DropdownSubmenuMenu.propTypes = propTypes
DropdownSubmenuMenu.displayName = 'DropdownSubmenuMenu'

export default DropdownSubmenuMenu
