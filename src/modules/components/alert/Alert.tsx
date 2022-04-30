import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import useEventCallback from '@restart/hooks/useEventCallback'
import Fade from '../transition/Fade'
import AlertLink from './AlertLink'
import AlertHeading from './AlertHeading'
import CloseButton, { CloseButtonVariant } from '../button/CloseButton'
import { useUncontrolled } from 'uncontrollable'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import { AlertVariant } from '../types'
import { TransitionType } from '../helpers'
import AlertContent from './AlertContent'
import AlertIcon from './AlertIcon'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
	icon?: React.ReactNode
	bsPrefix?: string
	variant?: AlertVariant
	dismissible?: boolean
	show?: boolean
	onClose?: (a: any, b: any) => void
	closeLabel?: string
	closeVariant?: CloseButtonVariant
	transition?: TransitionType
}

const propTypes = {
	icon: PropTypes.node,

	/**
	 * @default 'alert'
	 */
	bsPrefix: PropTypes.string,

	/**
	 * The Alert visual variant
	 *
	 * @type {'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light'}
	 */
	variant: PropTypes.string,

	/**
	 * Renders a properly aligned dismiss button, as well as
	 * adding extra horizontal padding to the Alert.
	 */
	dismissible: PropTypes.bool,

	/**
	 * Controls the visual state of the Alert.
	 *
	 * @controllable onClose
	 */
	show: PropTypes.bool,

	/**
	 * Callback fired when alert is closed.
	 *
	 * @controllable show
	 */
	onClose: PropTypes.func,

	/**
	 * Sets the text for alert close button.
	 */
	closeLabel: PropTypes.string,

	/**
	 * Sets the variant for close button.
	 */
	closeVariant: PropTypes.oneOf<CloseButtonVariant>(['white']),
}

const defaultProps = {
	variant: 'primary',
	show: true,
	closeLabel: 'Close alert',
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>((uncontrolledProps: AlertProps, ref) => {
	const {
		bsPrefix,
		show,
		icon,
		closeLabel,
		closeVariant,
		className,
		children,
		variant,
		onClose,
		dismissible,
		transition = Fade,
		...props
	} = useUncontrolled(uncontrolledProps, {
		show: 'onClose',
	})

	const prefix = useBootstrapPrefix(bsPrefix, 'alert')
	const handleClose = useEventCallback((e) => {
		if (onClose) {
			onClose(false, e)
		}
	})
	const Transition = transition === true ? Fade : transition
	const alert = (
		<div
			role="alert"
			{...(!Transition ? props : undefined)}
			ref={ref}
			className={classNames(
				className,
				prefix,
				variant && `${prefix}-${variant}`,
				dismissible && `${prefix}-dismissible`
			)}
		>
			{icon && <AlertIcon>{icon}</AlertIcon>}
			<AlertContent>{children}</AlertContent>
			{dismissible && <CloseButton onClick={handleClose} aria-label={closeLabel} variant={closeVariant} />}
		</div>
	)

	if (!Transition) return show ? alert : null

	return (
		<Transition unmountOnExit {...props} ref={undefined} in={show}>
			{alert}
		</Transition>
	)
})

Alert.displayName = 'Alert'
Alert.defaultProps = defaultProps

export default Object.assign(Alert, {
	Link: AlertLink,
	Heading: AlertHeading,
})
