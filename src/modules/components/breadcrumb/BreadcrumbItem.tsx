import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import Anchor from '@restart/ui/Anchor'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import BreadcrumbIcon from './BreadcrumbIcon'
import BreadcrumbText from './BreadcrumbText'

export interface BreadcrumbItemProps extends BsPrefixProps, Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
	icon?: React.ReactNode
	active?: boolean
	href?: string
}

const propTypes = {
	icon: PropTypes.node,
	/**
	 * @default 'breadcrumb-item'
	 */
	bsPrefix: PropTypes.string,
	/**
	 * Adds a visual "active" state to a Breadcrumb
	 * Item and disables the link.
	 */
	active: PropTypes.bool,
	/**
	 * `href` attribute for the inner `a` element
	 */
	href: PropTypes.string,
	/**
	 * Additional props passed as-is to the underlying link for non-active items.
	 */

	as: PropTypes.elementType,
}

const defaultProps = {
	active: false,
}

const BreadcrumbItem: BsPrefixRefForwardingComponent<'li', BreadcrumbItemProps> = React.forwardRef<
	HTMLElement,
	BreadcrumbItemProps
>(
	(
		{
			bsPrefix,
			active,
			children,
			className,
			// Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
			as: Component = 'span',
			icon: Icon,
			...props
		},
		ref
	) => {
		const prefix = useBootstrapPrefix(bsPrefix, 'breadcrumb-item')

		if (props.href) {
			Component = 'a'
		}

		return (
			<Component
				ref={ref}
				{...props}
				className={classNames(prefix, className, { active })}
				aria-current={active ? 'page' : undefined}
			>
				{Icon && <BreadcrumbIcon>{Icon}</BreadcrumbIcon>}
				<BreadcrumbText>{children}</BreadcrumbText>
			</Component>
		)
	}
)

BreadcrumbItem.displayName = 'BreadcrumbItem'
BreadcrumbItem.propTypes = propTypes
BreadcrumbItem.defaultProps = defaultProps

export default BreadcrumbItem
