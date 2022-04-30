import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import Widget18Content from './Widget18Content'
import Widget18Icon from './Widget18Icon'

export interface Widget18Props extends React.HTMLAttributes<HTMLElement>, BsPrefixProps {
	icon?: React.ReactNode
}

const propTypes = {
	as: PropTypes.elementType,
	icon: PropTypes.node,
}

const Widget18: BsPrefixRefForwardingComponent<'div', Widget18Props> = React.forwardRef<HTMLElement, Widget18Props>(
	(
		{
			bsPrefix,
			icon,
			// Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
			as: Component = 'div',
			className,
			children,
			...props
		},
		ref
	) => {
		bsPrefix = useBootstrapPrefix(bsPrefix, 'widget18')

		return (
			<Component ref={ref} {...props} className={classNames(className, bsPrefix)}>
				{icon && <Widget18Icon>{icon}</Widget18Icon>}
				<Widget18Content>{children}</Widget18Content>
			</Component>
		)
	}
)

Widget18.propTypes = propTypes
Widget18.displayName = 'Widget18'

export default Widget18
