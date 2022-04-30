import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { Color, BadgeVariant } from '../types'

export interface BadgeProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	circle?: boolean
	square?: boolean
	variant?: BadgeVariant
	pill?: boolean
	text?: Color
}

const propTypes = {
	circle: PropTypes.bool,
	square: PropTypes.bool,

	/** @default 'badge' */
	bsPrefix: PropTypes.string,

	/**
	 * The visual style of the badge
	 *
	 * @type {('primary'|'secondary'|'success'|'danger'|'warning'|'info'|'light'|'dark')}
	 */
	variant: PropTypes.string,

	/**
	 * Add the `pill` modifier to make badges more rounded with
	 * some additional horizontal padding
	 */
	pill: PropTypes.bool,

	/** @default span */
	as: PropTypes.elementType,
}

const defaultProps = {
	variant: 'primary',
	pill: false,
}

const Badge: BsPrefixRefForwardingComponent<'span', BadgeProps> = React.forwardRef<HTMLElement, BadgeProps>(
	({ bsPrefix, variant, pill, circle, square, className, as: Component = 'span', ...props }, ref) => {
		const prefix = useBootstrapPrefix(bsPrefix, 'badge')
		return (
			<Component
				ref={ref}
				{...props}
				className={classNames(
					className,
					prefix,
					pill && `rounded-pill`,
					circle && `badge-circle`,
					square && `badge-square`,
					variant && `badge-${variant}`
				)}
			/>
		)
	}
)

Badge.displayName = 'Badge'
Badge.propTypes = propTypes
Badge.defaultProps = defaultProps

export default Badge
