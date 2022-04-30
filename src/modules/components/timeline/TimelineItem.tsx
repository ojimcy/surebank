import React, { ReactNode } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'

export interface TimelineItemProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	time?: ReactNode
	pin?: ReactNode
}

const propTypes = {
	as: PropTypes.elementType,
	time: PropTypes.node,
	pin: PropTypes.node,
}

const TimelineItem: BsPrefixRefForwardingComponent<'div', TimelineItemProps> = React.forwardRef<
	HTMLElement,
	TimelineItemProps
>(({ as: Component = 'div', bsPrefix, className, time, pin, children, ...props }, ref) => {
	bsPrefix = useBootstrapPrefix(bsPrefix, 'timeline')

	return (
		<Component ref={ref} {...props} className={classNames(className, `${bsPrefix}-item`)}>
			{time && <div className={classNames(`${bsPrefix}-time`)}>{time}</div>}
			{pin && <div className={classNames(`${bsPrefix}-pin`)}>{pin}</div>}
			<div className={classNames(`${bsPrefix}-content`)}>{children}</div>
		</Component>
	)
})

TimelineItem.propTypes = propTypes
TimelineItem.displayName = 'TimelineItem'

export default TimelineItem
