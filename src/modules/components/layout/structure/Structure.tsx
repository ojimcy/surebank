import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../../helpers'
import { useBootstrapPrefix } from '../../_prefix/PrefixProvider'

export interface StructureProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	type: 'holder' | 'wrapper' | 'content'
}

const propTypes = {
	as: PropTypes.elementType,
	type: PropTypes.oneOf(['holder', 'wrapper', 'content']),
}

const Structure: BsPrefixRefForwardingComponent<'div', StructureProps> = React.forwardRef<HTMLElement, StructureProps>(
	({ as: Component = 'div', bsPrefix, type, className, ...props }, ref) => {
		bsPrefix = useBootstrapPrefix(bsPrefix, type)

		return <Component ref={ref} {...props} className={classNames(className, bsPrefix)} />
	}
)

Structure.propTypes = propTypes
Structure.displayName = 'Structure'

export default Structure
