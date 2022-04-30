import React, { ReactNode } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'

export interface MenuSectionProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	icon?: ReactNode
}

const propTypes = {
	as: PropTypes.elementType,
	icon: PropTypes.node,
}

const MenuSection: BsPrefixRefForwardingComponent<'div', MenuSectionProps> = React.forwardRef<
	HTMLElement,
	MenuSectionProps
>(({ as: Component = 'div', bsPrefix, className, icon, children, ...props }, ref) => {
	bsPrefix = useBootstrapPrefix(bsPrefix, 'menu-section')

	return (
		<Component ref={ref} {...props} className={classNames(className, bsPrefix)}>
			{icon && <div className={classNames(`${bsPrefix}-icon`)}>{icon}</div>}
			<h2 className={classNames(`${bsPrefix}-text`)}>{children}</h2>
		</Component>
	)
})

MenuSection.propTypes = propTypes
MenuSection.displayName = 'MenuSection'

export default MenuSection
