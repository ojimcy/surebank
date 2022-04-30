import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'

export interface AccordionIconProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {}

const propTypes = {
	as: PropTypes.elementType,
}

const AccordionIcon: BsPrefixRefForwardingComponent<'div', AccordionIconProps> = React.forwardRef<
	HTMLElement,
	AccordionIconProps
>(({ as: Component = 'div', bsPrefix, className, ...props }, ref) => {
	bsPrefix = useBootstrapPrefix(bsPrefix, 'accordion-icon')

	return <Component ref={ref} {...props} className={classNames(className, bsPrefix)} />
})

AccordionIcon.propTypes = propTypes
AccordionIcon.displayName = 'AccordionIcon'

export default AccordionIcon
