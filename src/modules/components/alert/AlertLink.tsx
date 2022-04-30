import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'

export interface AlertLinkProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	href?: string
}

const propTypes = {
	as: PropTypes.elementType,
	href: PropTypes.string,
}

const AlertLink: BsPrefixRefForwardingComponent<'a', AlertLinkProps> = React.forwardRef<HTMLElement, AlertLinkProps>(
	({ as: Component = 'a', href = '#', bsPrefix, className, ...props }, ref) => {
		bsPrefix = useBootstrapPrefix(bsPrefix, 'alert-link')

		return <Component ref={ref} href={href} {...props} className={classNames(className, bsPrefix)} />
	}
)

AlertLink.propTypes = propTypes
AlertLink.displayName = 'AlertLink'

export default AlertLink
