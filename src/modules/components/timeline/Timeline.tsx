import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import TimelineItem from './TimelineItem'

export interface TimelineProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	zigzag?: boolean
	timed?: boolean
}

const propTypes = {
	as: PropTypes.elementType,
	zigzag: PropTypes.bool,
	timed: PropTypes.bool,
}

const Timeline: BsPrefixRefForwardingComponent<'div', TimelineProps> = React.forwardRef<HTMLElement, TimelineProps>(
	({ as: Component = 'div', bsPrefix, className, zigzag, timed, ...props }, ref) => {
		bsPrefix = useBootstrapPrefix(bsPrefix, 'timeline')

		return (
			<Component
				ref={ref}
				{...props}
				className={classNames(className, bsPrefix, {
					[`${bsPrefix}-zigzag`]: zigzag,
					[`${bsPrefix}-timed`]: timed,
				})}
			/>
		)
	}
)

Timeline.propTypes = propTypes
Timeline.displayName = 'Timeline'

export default Object.assign(Timeline, {
	Item: TimelineItem,
})
