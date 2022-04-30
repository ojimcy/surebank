import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import { Variant } from '../types'

export interface FloatingButtonProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	align: 'start' | 'end'
}

const propTypes = {
	as: PropTypes.elementType,
	align: PropTypes.oneOf(['start', 'end']),
}

const FloatingButton: BsPrefixRefForwardingComponent<'div', FloatingButtonProps> = React.forwardRef<
	HTMLElement,
	FloatingButtonProps
>(({ as: Component = 'div', bsPrefix, className, align = 'start', ...props }, ref) => {
	bsPrefix = useBootstrapPrefix(bsPrefix, 'floating-btn')

	return <Component ref={ref} {...props} className={classNames(className, bsPrefix, `${bsPrefix}-${align}`)} />
})

FloatingButton.propTypes = propTypes
FloatingButton.displayName = 'FloatingButton'

export default FloatingButton
