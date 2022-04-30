import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import BaseDropdownItem, { useDropdownItem, DropdownItemProps as BaseDropdownItemProps } from '@restart/ui/DropdownItem'
import Anchor from '@restart/ui/Anchor'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import DropdownIcon from './DropdownIcon'
import DropdownContent from './DropdownContent'
import DropdownBullet from './DropdownBullet'
import DropdownAddon from './DropdownAddon'
import Caret from '../caret/Caret'

export interface DropdownItemProps extends BaseDropdownItemProps, BsPrefixProps {
	icon?: React.ReactNode
	bullet?: boolean
	caret?: boolean
}

const propTypes = {
	icon: PropTypes.node,
	bullet: PropTypes.bool,
	caret: PropTypes.bool,

	/** @default 'dropdown-item' */
	bsPrefix: PropTypes.string,

	/**
	 * Highlight the menu item as active.
	 */
	active: PropTypes.bool,

	/**
	 * Disable the menu item, making it unselectable.
	 */
	disabled: PropTypes.bool,

	/**
	 * Value passed to the `onSelect` handler, useful for identifying the selected menu item.
	 */
	eventKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

	/**
	 * HTML `href` attribute corresponding to `a.href`.
	 */
	href: PropTypes.string,

	/**
	 * Callback fired when the menu item is clicked.
	 */
	onClick: PropTypes.func,

	as: PropTypes.elementType,
}

const DropdownItem: BsPrefixRefForwardingComponent<typeof BaseDropdownItem, DropdownItemProps> = React.forwardRef(
	(
		{
			bsPrefix,
			className,
			eventKey,
			disabled = false,
			icon,
			bullet,
			caret,
			onClick,
			active,
			as: Component = Anchor,
			children,
			...props
		},
		ref
	) => {
		const prefix = useBootstrapPrefix(bsPrefix, 'dropdown-item')
		const [dropdownItemProps, meta] = useDropdownItem({
			key: eventKey,
			href: props.href,
			disabled,
			onClick,
			active,
		})

		return (
			<Component
				{...props}
				{...dropdownItemProps}
				ref={ref}
				className={classNames(className, prefix, meta.isActive && 'active', disabled && 'disabled')}
			>
				{icon && <DropdownIcon>{icon}</DropdownIcon>}
				{bullet && !icon && <DropdownBullet />}
				{icon || bullet || caret ? <DropdownContent>{children}</DropdownContent> : children}
				{caret && (
					<DropdownAddon>
						<Caret />
					</DropdownAddon>
				)}
			</Component>
		)
	}
)

DropdownItem.displayName = 'DropdownItem'
DropdownItem.propTypes = propTypes

export default DropdownItem
