import React from 'react'
import classNames from 'classnames'
import { BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import Badge, { BadgeProps } from '../badge/Badge'

export interface ButtonCounterProps extends BadgeProps {}

const ButtonCounter: BsPrefixRefForwardingComponent<'div', ButtonCounterProps> = React.forwardRef<
	HTMLElement,
	ButtonCounterProps
>(({ bsPrefix, className, ...props }, ref) => {
	const classNamePrefix = useBootstrapPrefix(bsPrefix, 'btn-counter')

	return <Badge ref={ref} {...props} className={classNames(classNamePrefix, className)} />
})

ButtonCounter.displayName = 'ButtonCounter'

export default ButtonCounter
