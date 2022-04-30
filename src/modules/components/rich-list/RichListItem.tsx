import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import RichListContent from './RichListContent'

export interface RichListItemProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	active?: boolean
	disabled?: boolean
	content?: boolean
}

const propTypes = {
	as: PropTypes.elementType,
	active: PropTypes.bool,
	disabled: PropTypes.bool,
	content: PropTypes.bool,
}

const RichListItem: BsPrefixRefForwardingComponent<'div', RichListItemProps> = React.forwardRef<
	HTMLElement,
	RichListItemProps
>(({ as: Component = 'div', bsPrefix, className, active, disabled, content, children, ...props }, ref) => {
	bsPrefix = useBootstrapPrefix(bsPrefix, 'rich-list-item')

	return (
		<Component
			ref={ref}
			{...props}
			className={classNames(className, bsPrefix, {
				active: !disabled && active,
				disabled: disabled,
			})}
		>
			{content ? <RichListContent>{children}</RichListContent> : children}
		</Component>
	)
})

RichListItem.propTypes = propTypes
RichListItem.displayName = 'RichListItem'

export default RichListItem
