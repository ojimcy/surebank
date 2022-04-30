import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'

export interface Widget9DisplayProps extends React.HTMLAttributes<HTMLElement>, BsPrefixProps {
	size?: 'sm'
}

const propTypes = {
	as: PropTypes.elementType,
	size: PropTypes.string,
}

const Widget9Display: BsPrefixRefForwardingComponent<'div', Widget9DisplayProps> = React.forwardRef<
	HTMLElement,
	Widget9DisplayProps
>(
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
		bsPrefix = useBootstrapPrefix(bsPrefix, 'widget9-display')

		return <Component ref={ref} {...props} className={classNames(className, bsPrefix, size && `${bsPrefix}-${size}`)} />
	}
)

Widget9Display.propTypes = propTypes
Widget9Display.displayName = 'Widget9Display'

export default Widget9Display
