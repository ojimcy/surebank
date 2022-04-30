import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'

export interface Widget1DisplayProps extends React.HTMLAttributes<HTMLElement>, BsPrefixProps {
	size?: 'lg' | 'sm'
	top?: boolean
	bottom?: boolean
}

const propTypes = {
	as: PropTypes.elementType,
	size: PropTypes.string,
	top: PropTypes.bool,
	bottom: PropTypes.bool,
}

const Widget1Display: BsPrefixRefForwardingComponent<'div', Widget1DisplayProps> = React.forwardRef<
	HTMLElement,
	Widget1DisplayProps
>(
	(
		{
			bsPrefix,
			size,
			top,
			bottom,
			// Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
			as: Component = 'div',
			className,
			...props
		},
		ref
	) => {
		bsPrefix = useBootstrapPrefix(bsPrefix, 'widget1-display')

		return (
			<Component
				ref={ref}
				{...props}
				className={classNames(
					className,
					bsPrefix,
					size && `${bsPrefix}-${size}`,
					top && `${bsPrefix}-top`,
					bottom && `${bsPrefix}-bottom`
				)}
			/>
		)
	}
)

Widget1Display.propTypes = propTypes
Widget1Display.displayName = 'Widget1Display'

export default Widget1Display
