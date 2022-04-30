import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'

export type AvatarAddonPosition = 'top' | 'bottom'

export interface AvatarAddonProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	position: AvatarAddonPosition
}

const propTypes = {
	as: PropTypes.elementType,
	position: PropTypes.oneOf(['top', 'bottom']),
}

const AvatarAddon: BsPrefixRefForwardingComponent<'div', AvatarAddonProps> = React.forwardRef<
	HTMLElement,
	AvatarAddonProps
>(({ as: Component = 'div', bsPrefix, className, position = 'top', ...props }, ref) => {
	bsPrefix = useBootstrapPrefix(bsPrefix, 'avatar-addon')

	return <Component ref={ref} {...props} className={classNames(className, bsPrefix, `${bsPrefix}-${position}`)} />
})

AvatarAddon.propTypes = propTypes
AvatarAddon.displayName = 'AvatarAddon'

export default AvatarAddon
