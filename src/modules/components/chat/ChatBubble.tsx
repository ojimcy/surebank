import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import { Variant } from '../types'

export interface ChatBubbleProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	variant?: ChatBubbleVariant
}

export type ChatBubbleVariant = Variant

const propTypes = {
	as: PropTypes.elementType,
	variant: PropTypes.string,
}

const ChatBubble: BsPrefixRefForwardingComponent<'p', ChatBubbleProps> = React.forwardRef<HTMLElement, ChatBubbleProps>(
	({ as: Component = 'p', bsPrefix, className, variant, ...props }, ref) => {
		bsPrefix = useBootstrapPrefix(bsPrefix, 'chat-bubble')

		return (
			<Component
				ref={ref}
				{...props}
				className={classNames(className, bsPrefix, variant && `${bsPrefix}-${variant}`)}
			/>
		)
	}
)

ChatBubble.propTypes = propTypes
ChatBubble.displayName = 'ChatBubble'

export default ChatBubble
