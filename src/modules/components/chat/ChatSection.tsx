import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'

export interface ChatSectionProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {}

const propTypes = {
	as: PropTypes.elementType,
}

const ChatSection: BsPrefixRefForwardingComponent<'div', ChatSectionProps> = React.forwardRef<
	HTMLElement,
	ChatSectionProps
>(({ as: Component = 'div', bsPrefix, className, children, ...props }, ref) => {
	bsPrefix = useBootstrapPrefix(bsPrefix, 'chat-section')

	return (
		<Component ref={ref} {...props} className={classNames(className, bsPrefix)}>
			<span className={classNames(`${bsPrefix}-text`)}>{children}</span>
		</Component>
	)
})

ChatSection.propTypes = propTypes
ChatSection.displayName = 'ChatSection'

export default ChatSection
