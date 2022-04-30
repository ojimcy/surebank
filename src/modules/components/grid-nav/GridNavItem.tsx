import React, { ReactNode } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import GridNavIcon from './GridNavIcon'
import GridNavContent from './GridNavContent'

export interface GridNavItemProps extends BsPrefixProps, React.HTMLAttributes<HTMLAnchorElement> {
	active?: boolean
	disabled?: boolean
	icon?: ReactNode
	href?: string
}

const propTypes = {
	as: PropTypes.elementType,
	active: PropTypes.bool,
	disabled: PropTypes.bool,
	icon: PropTypes.node,
	href: PropTypes.string,
}

const GridNavItem: BsPrefixRefForwardingComponent<'div', GridNavItemProps> = React.forwardRef<
	HTMLAnchorElement,
	GridNavItemProps
>(({ as: Component = 'div', bsPrefix, className, active, disabled, icon, children, ...props }, ref) => {
	bsPrefix = useBootstrapPrefix(bsPrefix, 'grid-nav-item')

	if (props.href) {
		Component = 'a'
	}

	return (
		<Component
			ref={ref}
			{...props}
			className={classNames(className, bsPrefix, {
				active: !disabled && active,
				disabled: disabled,
			})}
		>
			{icon && <GridNavIcon>{icon}</GridNavIcon>}
			<GridNavContent>{children}</GridNavContent>
		</Component>
	)
})

GridNavItem.propTypes = propTypes
GridNavItem.displayName = 'GridNavItem'

export default GridNavItem
