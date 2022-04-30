import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { useContext } from 'react'
import { useUncontrolled } from 'uncontrollable'
import BaseNav, { NavProps as BaseNavProps } from '@restart/ui/Nav'
import { EventKey } from '@restart/ui/types'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import CardHeaderContext from '../card/CardHeaderContext'
import NavItem from './NavItem'
import NavLink from './NavLink'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import NavContent from './NavContent'
import NavAddon from './NavAddon'
import NavIcon from './NavIcon'

export interface NavProps extends BsPrefixProps, BaseNavProps {
	cardHeaderBsPrefix?: string
	variant?: 'tabs' | 'pills' | 'lines'
	defaultActiveKey?: EventKey
	fill?: boolean
	justify?: boolean
	alignment?: 'start' | 'center' | 'end'
	size?: 'lg' | 'sm'
	portlet?: boolean
}

const propTypes = {
	alignment: PropTypes.string,
	/**
	 * @default 'nav'
	 */
	bsPrefix: PropTypes.string,

	/** @private */
	cardHeaderBsPrefix: PropTypes.string,

	/**
	 * The visual variant of the nav items.
	 *
	 * @type {('tabs'|'pills')}
	 */
	variant: PropTypes.string,

	/**
	 * Marks the NavItem with a matching `eventKey` (or `href` if present) as active.
	 */
	activeKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

	/**
	 * Have all `NavItem`s proportionately fill all available width.
	 */
	fill: PropTypes.bool,

	/**
	 * Have all `NavItem`s evenly fill all available width.
	 *
	 * @type {boolean}
	 */
	justify: PropTypes.bool,

	/**
	 * A callback fired when a NavItem is selected.
	 *
	 * ```js
	 * function (
	 *  Any eventKey,
	 *  SyntheticEvent event?
	 * )
	 * ```
	 */
	onSelect: PropTypes.func,

	/**
	 * ARIA role for the Nav, in the context of a TabContainer, the default will
	 * be set to "tablist", but can be overridden by the Nav when set explicitly.
	 *
	 * When the role is "tablist", NavLink focus is managed according to
	 * the ARIA authoring practices for tabs:
	 * https://www.w3.org/TR/2013/WD-wai-aria-practices-20130307/#tabpanel
	 */
	role: PropTypes.string,

	size: PropTypes.string,

	as: PropTypes.elementType,

	/** @private */
	onKeyDown: PropTypes.func,

	portlet: PropTypes.bool,
}

const defaultProps = {
	justify: false,
	fill: false,
}

const Nav: BsPrefixRefForwardingComponent<'div', NavProps> = React.forwardRef<HTMLElement, NavProps>(
	(uncontrolledProps, ref) => {
		const {
			as = 'div',
			bsPrefix: initialBsPrefix,
			alignment,
			variant,
			fill,
			justify,
			className,
			activeKey,
			size,
			portlet,
			...props
		} = useUncontrolled(uncontrolledProps, { activeKey: 'onSelect' })

		const bsPrefix = useBootstrapPrefix(initialBsPrefix, 'nav')

		let cardHeaderBsPrefix

		const cardHeaderContext = useContext(CardHeaderContext)

		if (cardHeaderContext) {
			;({ cardHeaderBsPrefix } = cardHeaderContext)
		}

		return (
			<BaseNav
				as={as}
				ref={ref}
				activeKey={activeKey}
				className={classNames(className, bsPrefix, {
					[`${cardHeaderBsPrefix}-${variant}`]: !!cardHeaderBsPrefix,
					[`${bsPrefix}-${variant}`]: !!variant,
					[`${bsPrefix}-${size}`]: size,
					[`${bsPrefix}-fill`]: fill,
					[`${bsPrefix}-justified`]: justify,
					[`justify-content-${alignment}`]: alignment,
					'portlet-nav': portlet,
				})}
				{...props}
			/>
		)
	}
)

Nav.displayName = 'Nav'
Nav.propTypes = propTypes
Nav.defaultProps = defaultProps

export default Object.assign(Nav, {
	Item: NavItem,
	Link: NavLink,
	Content: NavContent,
	Addon: NavAddon,
	Icon: NavIcon,
})
