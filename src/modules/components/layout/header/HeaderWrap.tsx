import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../../helpers'
import { useBootstrapPrefix } from '../../_prefix/PrefixProvider'

export interface HeaderWrapProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	block?: boolean
	justify?: 'start' | 'center' | 'end'
}

const propTypes = {
	as: PropTypes.elementType,
	block: PropTypes.bool,
	justify: PropTypes.oneOf(['start', 'center', 'end']),
}

const HeaderWrap: BsPrefixRefForwardingComponent<'div', HeaderWrapProps> = React.forwardRef<
	HTMLElement,
	HeaderWrapProps
>(({ as: Component = 'div', block, justify, bsPrefix, className, ...props }, ref) => {
	bsPrefix = useBootstrapPrefix(bsPrefix, 'header-wrap')

	return (
		<Component
			ref={ref}
			{...props}
			className={classNames(className, bsPrefix, {
				[`${bsPrefix}-block`]: block,
				[`justify-content-${justify}`]: justify,
			})}
		/>
	)
})

HeaderWrap.propTypes = propTypes
HeaderWrap.displayName = 'HeaderWrap'

export default HeaderWrap
