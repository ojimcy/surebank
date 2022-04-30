import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import GridNavItem from './GridNavItem'
import GridNavRow from './GridNavRow'
import GridNavTitle from './GridNavTitle'
import GridNavSubtitle from './GridNavSubtitle'

export interface GridNavProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	noRounded?: boolean
	bordered?: boolean
	flush?: boolean
	action?: boolean
}

const propTypes = {
	as: PropTypes.elementType,
	noRounded: PropTypes.bool,
	bordered: PropTypes.bool,
	flush: PropTypes.bool,
	action: PropTypes.bool,
}

const GridNav: BsPrefixRefForwardingComponent<'div', GridNavProps> = React.forwardRef<HTMLElement, GridNavProps>(
	({ as: Component = 'div', bsPrefix, className, noRounded, bordered, flush, action, ...props }, ref) => {
		bsPrefix = useBootstrapPrefix(bsPrefix, 'grid-nav')

		return (
			<Component
				ref={ref}
				{...props}
				className={classNames(className, bsPrefix, {
					[`${bsPrefix}-bordered`]: bordered,
					[`${bsPrefix}-flush`]: flush,
					[`${bsPrefix}-action`]: action,
					[`${bsPrefix}-no-rounded`]: noRounded,
				})}
			/>
		)
	}
)

GridNav.propTypes = propTypes
GridNav.displayName = 'GridNav'

export default Object.assign(GridNav, {
	Item: GridNavItem,
	Row: GridNavRow,
	Title: GridNavTitle,
	Subtitle: GridNavSubtitle,
})
