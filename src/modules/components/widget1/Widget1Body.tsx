import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'

export interface Widget1BodyProps extends React.HTMLAttributes<HTMLElement>, BsPrefixProps {
	offset?: boolean
}

const propTypes = {
	as: PropTypes.elementType,
	offset: PropTypes.bool,
}

const Widget1Body: BsPrefixRefForwardingComponent<'div', Widget1BodyProps> = React.forwardRef<
	HTMLElement,
	Widget1BodyProps
>(
	(
		{
			bsPrefix,
			offset,
			// Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
			as: Component = 'div',
			className,
			...props
		},
		ref
	) => {
		bsPrefix = useBootstrapPrefix(bsPrefix, 'widget1-body')

		return (
			<Component ref={ref} {...props} className={classNames(className, bsPrefix, offset && `${bsPrefix}-offset`)} />
		)
	}
)

Widget1Body.propTypes = propTypes
Widget1Body.displayName = 'Widget1Body'

export default Widget1Body
