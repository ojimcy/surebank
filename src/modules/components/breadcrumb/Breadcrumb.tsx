import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import BreadcrumbItem from './BreadcrumbItem'
import BreadcrumbIcon from './BreadcrumbIcon'
import BreadcrumbText from './BreadcrumbText'

export interface BreadcrumbProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	label?: string
	transparent?: boolean
}

const propTypes = {
	transparent: PropTypes.bool,

	/**
	 * @default 'breadcrumb'
	 */
	bsPrefix: PropTypes.string,

	/**
	 * ARIA label for the nav element
	 * https://www.w3.org/TR/wai-aria-practices/#breadcrumb
	 */
	label: PropTypes.string,

	as: PropTypes.elementType,
}

const defaultProps = {
	label: 'breadcrumb',
}

const Breadcrumb: BsPrefixRefForwardingComponent<'nav', BreadcrumbProps> = React.forwardRef<
	HTMLElement,
	BreadcrumbProps
>(
	(
		{
			transparent,
			bsPrefix,
			className,
			children,
			label,
			// Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
			as: Component = 'div',
			...props
		},
		ref
	) => {
		const prefix = useBootstrapPrefix(bsPrefix, 'breadcrumb')

		return (
			<Component
				aria-label={label}
				className={classNames(prefix, transparent && `${prefix}-transparent`, className)}
				ref={ref}
				{...props}
			>
				{children}
			</Component>
		)
	}
)

Breadcrumb.displayName = 'Breadcrumb'
Breadcrumb.propTypes = propTypes
Breadcrumb.defaultProps = defaultProps

export default Object.assign(Breadcrumb, {
	Item: BreadcrumbItem,
	Icon: BreadcrumbIcon,
	Text: BreadcrumbText,
})
