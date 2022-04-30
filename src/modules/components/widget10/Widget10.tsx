import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import Widget10Addon from './Widget10Addon'
import Widget10Content from './Widget10Content'
import Widget10Item from './Widget10Item'
import Widget10Subtitle from './Widget10Subtitle'
import Widget10Title from './Widget10Title'

export interface Widget10Props extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	vertical: 'xl' | 'lg' | 'md' | 'sm' | boolean
}

const propTypes = {
	as: PropTypes.elementType,
	vertical: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
}

const Widget10: BsPrefixRefForwardingComponent<'div', Widget10Props> = React.forwardRef<HTMLElement, Widget10Props>(
	({ as: Component = 'div', bsPrefix, className, vertical, ...props }, ref) => {
		bsPrefix = useBootstrapPrefix(bsPrefix, 'widget10')

		let verticalClass

		if (typeof vertical === 'string') {
			verticalClass = `${bsPrefix}-vertical-${vertical}`
		} else if (typeof vertical === 'boolean') {
			verticalClass = `${bsPrefix}-vertical`
		} else {
			verticalClass = null
		}

		return <Component ref={ref} {...props} className={classNames(className, bsPrefix, verticalClass)} />
	}
)

Widget10.propTypes = propTypes
Widget10.displayName = 'Widget10'

export default Object.assign(Widget10, {
	Addon: Widget10Addon,
	Content: Widget10Content,
	Item: Widget10Item,
	Subtitle: Widget10Subtitle,
	Title: Widget10Title,
})
