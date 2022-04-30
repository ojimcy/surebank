import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'

export interface PortletFooterProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	bordered?: boolean
	align?: 'start' | 'center' | 'end'
}

const propTypes = {
	bordered: PropTypes.bool,
	align: PropTypes.string,
}

const PortletFooter: BsPrefixRefForwardingComponent<'div', PortletFooterProps> = React.forwardRef<
	HTMLElement,
	PortletFooterProps
>(({ as: Component = 'div', bsPrefix, className, bordered, align, ...props }, ref) => {
	const classNamePrefix = useBootstrapPrefix(bsPrefix, 'portlet-footer')

	return (
		<Component
			ref={ref}
			{...props}
			className={classNames(className, classNamePrefix, {
				[`${classNamePrefix}-bordered`]: bordered,
				[`text-${align}`]: align,
			})}
		/>
	)
})

PortletFooter.propTypes = propTypes
PortletFooter.displayName = 'PortletFooter'

export default PortletFooter
