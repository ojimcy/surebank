import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import { Variant } from '../types'
import PortletAddon from './PortletAddon'
import PortletHeader from './PortletHeader'
import PortletFooter from './PortletFooter'
import PortletTitle from './PortletTitle'
import PortletBody from './PortletBody'
import PortletIcon from './PortletIcon'

export interface PortletProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	variant?: Variant
	scroll?: boolean
	noMargin?: boolean
}

const propTypes = {
	as: PropTypes.elementType,
	variant: PropTypes.string,
	scroll: PropTypes.bool,
	noMargin: PropTypes.bool,
}

const Portlet: BsPrefixRefForwardingComponent<'div', PortletProps> = React.forwardRef<HTMLElement, PortletProps>(
	({ as: Component = 'div', bsPrefix, className, variant, scroll, noMargin, ...props }, ref) => {
		bsPrefix = useBootstrapPrefix(bsPrefix, 'portlet')

		return (
			<Component
				ref={ref}
				{...props}
				className={classNames(
					className,
					bsPrefix,
					variant && `${bsPrefix}-${variant}`,
					scroll && `${bsPrefix}-scroll`,
					noMargin && 'mb-0'
				)}
			/>
		)
	}
)

Portlet.propTypes = propTypes
Portlet.displayName = 'Portlet'

export default Object.assign(Portlet, {
	Header: PortletHeader,
	Footer: PortletFooter,
	Addon: PortletAddon,
	Title: PortletTitle,
	Icon: PortletIcon,
	Body: PortletBody,
})
