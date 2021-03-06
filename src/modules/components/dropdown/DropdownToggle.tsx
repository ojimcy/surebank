import React, { useContext } from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { useDropdownToggle } from '@restart/ui/DropdownToggle'
import DropdownContext from '@restart/ui/DropdownContext'
import useMergedRefs from '@restart/hooks/useMergedRefs'
import Button, { ButtonProps, CommonButtonProps } from '../button/Button'
import InputGroupContext from '../form/InputGroupContext'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import useWrappedRefWithWarning from '../_utilities/useWrappedRefWithWarning'
import { BsPrefixRefForwardingComponent } from '../helpers'

export interface DropdownToggleProps extends Omit<ButtonProps, 'as'> {
	as?: React.ElementType
	split?: boolean
	childBsPrefix?: string
	noCaret?: boolean
}

type DropdownToggleComponent = BsPrefixRefForwardingComponent<'button', DropdownToggleProps>

export type PropsFromToggle = Partial<Pick<React.ComponentPropsWithRef<DropdownToggleComponent>, CommonButtonProps>>

const propTypes = {
	/**
	 * @default 'dropdown-toggle'
	 */
	bsPrefix: PropTypes.string,

	/**
	 * An html id attribute, necessary for assistive technologies, such as screen readers.
	 * @type {string|number}
	 */
	id: PropTypes.string,

	split: PropTypes.bool,

	as: PropTypes.elementType,

	/**
	 * to passthrough to the underlying button or whatever from DropdownButton
	 * @private
	 */
	childBsPrefix: PropTypes.string,

	noCaret: PropTypes.bool,
}

const DropdownToggle: DropdownToggleComponent = React.forwardRef(
	(
		{
			bsPrefix,
			split,
			className,
			childBsPrefix,
			noCaret,
			// Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
			as: Component = Button,
			...props
		}: DropdownToggleProps,
		ref
	) => {
		const prefix = useBootstrapPrefix(bsPrefix, 'dropdown-toggle')
		const dropdownContext = useContext(DropdownContext)
		const isInputGroup = useContext(InputGroupContext)

		if (childBsPrefix !== undefined) {
			;(props as any).bsPrefix = childBsPrefix
		}

		const [toggleProps] = useDropdownToggle()

		toggleProps.ref = useMergedRefs(
			toggleProps.ref,
			useWrappedRefWithWarning(ref as React.RefObject<any>, 'DropdownToggle')
		)

		// This intentionally forwards size and variant (if set) to the
		// underlying component, to allow it to render size and style variants.
		return (
			<Component
				className={classNames(
					className,
					!noCaret && prefix,
					split && `${prefix}-split`,
					!!isInputGroup && dropdownContext?.show && 'show'
				)}
				{...toggleProps}
				{...props}
			/>
		)
	}
)

DropdownToggle.displayName = 'DropdownToggle'
DropdownToggle.propTypes = propTypes

export default DropdownToggle
