import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../../helpers'
import { useBootstrapPrefix } from '../../_prefix/PrefixProvider'

export interface HeaderHolderProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	shown?: 'mobile' | 'desktop'
}

const propTypes = {
	as: PropTypes.elementType,
	shown: PropTypes.oneOf(['mobile', 'desktop']),
}

const HeaderHolder: BsPrefixRefForwardingComponent<'div', HeaderHolderProps> = React.forwardRef<
	HTMLElement,
	HeaderHolderProps
>(({ as: Component = 'div', shown, bsPrefix, className, ...props }, ref) => {
	bsPrefix = useBootstrapPrefix(bsPrefix, 'header-holder')

	return (
		<Component
			ref={ref}
			{...props}
			className={classNames(className, bsPrefix, {
				[`${bsPrefix}-${shown}`]: shown,
			})}
		/>
	)
})

HeaderHolder.propTypes = propTypes
HeaderHolder.displayName = 'HeaderHolder'

export default HeaderHolder
