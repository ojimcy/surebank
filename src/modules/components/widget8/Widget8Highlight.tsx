import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'

export interface Widget8HighlightProps extends React.HTMLAttributes<HTMLElement>, BsPrefixProps {
	size?: 'sm' | 'lg'
}

const propTypes = {
	as: PropTypes.elementType,
	size: PropTypes.string,
}

const Widget8Highlight: BsPrefixRefForwardingComponent<'div', Widget8HighlightProps> = React.forwardRef<
	HTMLElement,
	Widget8HighlightProps
>(
	(
		{
			bsPrefix,
			size,
			// Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
			as: Component = 'h4',
			className,
			...props
		},
		ref
	) => {
		bsPrefix = useBootstrapPrefix(bsPrefix, 'widget8-highlight')

		return <Component ref={ref} {...props} className={classNames(className, bsPrefix, size && `${bsPrefix}-${size}`)} />
	}
)

Widget8Highlight.propTypes = propTypes
Widget8Highlight.displayName = 'Widget8Highlight'

export default Widget8Highlight
