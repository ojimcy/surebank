import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import Widget3Display from './Widget3Display'
import Widget3Subtitle from './Widget3Subtitle'
import Widget3Title from './Widget3Title'

export interface Widget3Props extends React.HTMLAttributes<HTMLElement>, BsPrefixProps {
	size?: 'sm'
}

const propTypes = {
	as: PropTypes.elementType,
	size: PropTypes.string,
}

const Widget3: BsPrefixRefForwardingComponent<'div', Widget3Props> = React.forwardRef<HTMLElement, Widget3Props>(
	(
		{
			bsPrefix,
			size,
			// Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
			as: Component = 'div',
			className,
			...props
		},
		ref
	) => {
		bsPrefix = useBootstrapPrefix(bsPrefix, 'widget3')

		return <Component ref={ref} {...props} className={classNames(className, bsPrefix, size && `${bsPrefix}-${size}`)} />
	}
)

Widget3.propTypes = propTypes
Widget3.displayName = 'Widget3'

export default Object.assign(Widget3, {
	Display: Widget3Display,
	Subtitle: Widget3Subtitle,
	Title: Widget3Title,
})
