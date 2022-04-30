import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../../helpers'
import { useBootstrapPrefix } from '../../_prefix/PrefixProvider'

export interface HeaderContainerProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	fluid?: boolean
}

const propTypes = {
	as: PropTypes.elementType,
	fluid: PropTypes.bool,
}

const HeaderContainer: BsPrefixRefForwardingComponent<'div', HeaderContainerProps> = React.forwardRef<
	HTMLElement,
	HeaderContainerProps
>(({ as: Component = 'div', fluid, bsPrefix, className, ...props }, ref) => {
	bsPrefix = useBootstrapPrefix(bsPrefix, 'header-container')

	return (
		<Component
			ref={ref}
			{...props}
			className={classNames(className, bsPrefix, fluid ? 'container-fluid' : 'container')}
		/>
	)
})

HeaderContainer.propTypes = propTypes
HeaderContainer.displayName = 'HeaderContainer'

export default HeaderContainer
