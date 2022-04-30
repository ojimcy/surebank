import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'

export interface AvatarGroupProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	size?: 'sm' | 'lg'
}

const propTypes = {
	as: PropTypes.elementType,
	size: PropTypes.oneOf(['sm', 'lg']),
}

const AvatarGroup: BsPrefixRefForwardingComponent<'div', AvatarGroupProps> = React.forwardRef<
	HTMLElement,
	AvatarGroupProps
>(({ as: Component = 'div', bsPrefix, className, size, ...props }, ref) => {
	bsPrefix = useBootstrapPrefix(bsPrefix, 'avatar-group')

	return <Component ref={ref} {...props} className={classNames(className, bsPrefix, size && `${bsPrefix}-${size}`)} />
})

AvatarGroup.propTypes = propTypes
AvatarGroup.displayName = 'AvatarGroup'

export default AvatarGroup
