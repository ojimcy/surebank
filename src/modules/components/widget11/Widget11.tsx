import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'

export interface Widget11Props extends React.HTMLAttributes<HTMLElement>, BsPrefixProps {
	bottom?: boolean
	top?: boolean
}

const propTypes = {
	as: PropTypes.elementType,
	bottom: PropTypes.bool,
	top: PropTypes.bool,
}

const Widget11: BsPrefixRefForwardingComponent<'div', Widget11Props> = React.forwardRef<HTMLElement, Widget11Props>(
	(
		{
			bsPrefix,
			bottom,
			top,
			// Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
			as: Component = 'div',
			className,
			...props
		},
		ref
	) => {
		bsPrefix = useBootstrapPrefix(bsPrefix, 'widget11')

		return (
			<Component
				ref={ref}
				{...props}
				className={classNames(className, bsPrefix, bottom && `${bsPrefix}-bottom`, top && `${bsPrefix}-top`)}
			/>
		)
	}
)

Widget11.propTypes = propTypes
Widget11.displayName = 'Widget11'

export default Widget11
