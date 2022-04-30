import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'

export interface NavAddonProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	type: 'prepend' | 'append'
}

const propTypes = {
	as: PropTypes.elementType,
	type: PropTypes.string,
}

const NavAddon: BsPrefixRefForwardingComponent<'div', NavAddonProps> = React.forwardRef<HTMLElement, NavAddonProps>(
	({ as: Component = 'div', bsPrefix, className, type, ...props }, ref) => {
		bsPrefix = useBootstrapPrefix(bsPrefix, 'nav')

		return <Component ref={ref} {...props} className={classNames(className, `${bsPrefix}-${type}`)} />
	}
)

NavAddon.propTypes = propTypes
NavAddon.displayName = 'NavAddon'

export default NavAddon
