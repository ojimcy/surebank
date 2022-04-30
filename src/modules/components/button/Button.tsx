import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { useButtonProps, ButtonProps as BaseButtonProps } from '@restart/ui/Button'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { ButtonVariant } from '../types'
import ButtonMarker from './ButtonMarker'
import ButtonCounter from './ButtonCounter'

export interface ButtonProps extends BaseButtonProps, Omit<BsPrefixProps, 'as'> {
	active?: boolean
	variant?: ButtonVariant
	size?: 'sm' | 'lg'
	pill?: boolean
	icon?: boolean
	circle?: boolean
	width?: 'wide' | 'wider' | 'widest'
	height?: 'tall' | 'taller' | 'tallest'
}

export type CommonButtonProps = 'href' | 'size' | 'variant' | 'disabled'

const propTypes = {
	icon: PropTypes.bool,
	pill: PropTypes.bool,
	circle: PropTypes.bool,
	width: PropTypes.string,
	height: PropTypes.string,

	/**
	 * @default 'btn'
	 */
	bsPrefix: PropTypes.string,

	/**
	 * One or more button variant combinations
	 *
	 * buttons may be one of a variety of visual variants such as:
	 *
	 * `'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark', 'light', 'link'`
	 *
	 * as well as "outline" versions (prefixed by 'outline-*')
	 *
	 * `'outline-primary', 'outline-secondary', 'outline-success', 'outline-danger', 'outline-warning', 'outline-info', 'outline-dark', 'outline-light'`
	 */
	variant: PropTypes.string,

	/**
	 * Specifies a large or small button.
	 *
	 * @type ('sm'|'lg')
	 */
	size: PropTypes.string,

	/** Manually set the visual state of the button to `:active` */
	active: PropTypes.bool,

	/**
	 * Disables the Button, preventing mouse events,
	 * even if the underlying component is an `<a>` element
	 */
	disabled: PropTypes.bool,

	/** Providing a `href` will render an `<a>` element, _styled_ as a button. */
	href: PropTypes.string,

	/**
	 * Defines HTML button type attribute.
	 *
	 * @default 'button'
	 */
	type: PropTypes.oneOf(['button', 'reset', 'submit', null]),

	as: PropTypes.elementType,
}

const defaultProps = {
	variant: 'primary',
	active: false,
	disabled: false,
}

const Button: BsPrefixRefForwardingComponent<'button', ButtonProps> = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ as, bsPrefix, variant, size, active, pill, icon, circle, width, height, className, ...props }, ref) => {
		const prefix = useBootstrapPrefix(bsPrefix, 'btn')
		const [buttonProps, { tagName }] = useButtonProps({
			tagName: as,
			...props,
		})

		const Component = tagName as React.ElementType

		return (
			<Component
				{...props}
				{...buttonProps}
				ref={ref}
				className={classNames(
					className,
					prefix,
					active && 'active',
					variant && `${prefix}-${variant}`,
					size && `${prefix}-${size}`,
					icon && `${prefix}-icon`,
					circle && `${prefix}-circle`,
					width && `${prefix}-${width}`,
					height && `${prefix}-${height}`,
					pill && `rounded-pill`,
					props.href && props.disabled && 'disabled'
				)}
			/>
		)
	}
)

Button.displayName = 'Button'
Button.propTypes = propTypes
Button.defaultProps = defaultProps

export default Object.assign(Button, {
	Marker: ButtonMarker,
	Counter: ButtonCounter,
})
