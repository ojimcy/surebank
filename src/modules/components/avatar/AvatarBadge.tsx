import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import Badge, { BadgeProps } from '../badge/Badge'

export interface AvatarBadgeProps extends BadgeProps {}

const propTypes = {
	as: PropTypes.elementType,
}

const AvatarBadge: BsPrefixRefForwardingComponent<'div', AvatarBadgeProps> = React.forwardRef<
	HTMLElement,
	AvatarBadgeProps
>(({ as: Component = Badge, bsPrefix, className, ...props }, ref) => {
	bsPrefix = useBootstrapPrefix(bsPrefix, 'avatar-badge')

	return <Component ref={ref} {...props} className={classNames(className, bsPrefix)} />
})

AvatarBadge.propTypes = propTypes
AvatarBadge.displayName = 'AvatarBadge'

export default AvatarBadge
