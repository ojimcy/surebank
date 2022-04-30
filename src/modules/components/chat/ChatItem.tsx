import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import ChatContent from './ChatContent'

export interface ChatItemProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	align: 'start' | 'end'
	content?: boolean
}

const propTypes = {
	as: PropTypes.elementType,
	align: PropTypes.string,
	content: PropTypes.bool,
}

const ChatItem: BsPrefixRefForwardingComponent<'div', ChatItemProps> = React.forwardRef<HTMLElement, ChatItemProps>(
	({ as: Component = 'div', bsPrefix, className, align = 'start', content, children, ...props }, ref) => {
		bsPrefix = useBootstrapPrefix(bsPrefix, 'chat-item')

		return (
			<Component ref={ref} {...props} className={classNames(className, bsPrefix, align && `${bsPrefix}-${align}`)}>
				{content ? <ChatContent>{children}</ChatContent> : children}
			</Component>
		)
	}
)

ChatItem.propTypes = propTypes
ChatItem.displayName = 'ChatItem'

export default ChatItem
