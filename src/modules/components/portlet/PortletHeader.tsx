import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'

export interface PortletHeaderProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	bordered?: boolean
}

const propTypes = {
	bordered: PropTypes.bool,
}

const PortletHeader: BsPrefixRefForwardingComponent<'div', PortletHeaderProps> = React.forwardRef<
	HTMLElement,
	PortletHeaderProps
>(({ as: Component = 'div', bsPrefix, className, bordered, ...props }, ref) => {
	const classNamePrefix = useBootstrapPrefix(bsPrefix, 'portlet-header')

	return (
		<Component
			ref={ref}
			{...props}
			className={classNames(className, classNamePrefix, bordered && `${classNamePrefix}-bordered`)}
		/>
	)
})

PortletHeader.propTypes = propTypes
PortletHeader.displayName = 'PortletHeader'

export default PortletHeader
