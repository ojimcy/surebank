import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import { LabelVariant, Variant } from '../types'
import AvatarDisplay from './AvatarDisplay'
import AvatarAddon from './AvatarAddon'
import AvatarBadge from './AvatarBadge'
import AvatarIcon from './AvatarIcon'

export interface AvatarProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	variant?: AvatarVariant
	display?: boolean
	circle?: boolean
	size?: 'sm' | 'lg'
}

export type AvatarVariant = Variant | LabelVariant

const propTypes = {
	variant: PropTypes.string,
	display: PropTypes.bool,
	circle: PropTypes.bool,
	size: PropTypes.oneOf(['sm', 'lg']),
}

const Avatar: BsPrefixRefForwardingComponent<'div', AvatarProps> = React.forwardRef<HTMLElement, AvatarProps>(
	({ as: Component = 'div', bsPrefix, className, variant, circle, size, display, children, ...props }, ref) => {
		bsPrefix = useBootstrapPrefix(bsPrefix, 'avatar')

		return (
			<Component
				ref={ref}
				{...props}
				className={classNames(className, bsPrefix, {
					[`${bsPrefix}-${variant}`]: variant,
					[`${bsPrefix}-circle`]: circle,
					[`${bsPrefix}-${size}`]: size,
				})}
			>
				{display ? <AvatarDisplay>{children}</AvatarDisplay> : children}
			</Component>
		)
	}
)

Avatar.propTypes = propTypes
Avatar.displayName = 'Avatar'

export default Object.assign(Avatar, {
	Display: AvatarDisplay,
	Addon: AvatarAddon,
	Badge: AvatarBadge,
	Icon: AvatarIcon,
})
