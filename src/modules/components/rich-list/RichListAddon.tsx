import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'

export interface RichListAddonProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	addonType: 'prepend' | 'append'
}

const propTypes = {
	as: PropTypes.elementType,
	addonType: PropTypes.string,
}

const RichListAddon: BsPrefixRefForwardingComponent<'div', RichListAddonProps> = React.forwardRef<
	HTMLElement,
	RichListAddonProps
>(({ as: Component = 'div', bsPrefix, className, addonType, ...props }, ref) => {
	bsPrefix = useBootstrapPrefix(bsPrefix, `rich-list-${addonType}`)

	return <Component ref={ref} {...props} className={classNames(className, bsPrefix)} />
})

RichListAddon.propTypes = propTypes
RichListAddon.displayName = 'RichListAddon'

export default RichListAddon
