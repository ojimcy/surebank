import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'

export interface CaretProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	transform?: 'up' | 'down' | 'start' | 'end'
}

const propTypes = {
	as: PropTypes.elementType,
	transform: PropTypes.string,
}

const Caret: BsPrefixRefForwardingComponent<'div', CaretProps> = React.forwardRef<HTMLElement, CaretProps>(
	({ as: Component = 'div', transform, bsPrefix, className, ...props }, ref) => {
		bsPrefix = useBootstrapPrefix(bsPrefix, 'caret')

		return (
			<Component
				ref={ref}
				{...props}
				className={classNames(className, bsPrefix, transform && `${bsPrefix}-${transform}`)}
			/>
		)
	}
)

Caret.propTypes = propTypes
Caret.displayName = 'Caret'

export default Caret
