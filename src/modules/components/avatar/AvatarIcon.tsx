import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import { Variant } from '../types'

export interface AvatarIconProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	variant?: Variant
}

const propTypes = {
	as: PropTypes.elementType,
	variant: PropTypes.string,
}

const AvatarIcon: BsPrefixRefForwardingComponent<'div', AvatarIconProps> = React.forwardRef<
	HTMLElement,
	AvatarIconProps
>(({ as: Component = 'div', bsPrefix, className, variant, ...props }, ref) => {
	bsPrefix = useBootstrapPrefix(bsPrefix, 'avatar-icon')

	return (
		<Component ref={ref} {...props} className={classNames(className, bsPrefix, variant && `${bsPrefix}-${variant}`)} />
	)
})

AvatarIcon.propTypes = propTypes
AvatarIcon.displayName = 'AvatarIcon'

export default AvatarIcon
