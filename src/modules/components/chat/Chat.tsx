import createWithBsPrefix from '../_utilities/createWithBsPrefix'
import ChatAuthor from './ChatAuthor'
import ChatAvatar from './ChatAvatar'
import ChatBubble from './ChatBubble'
import ChatContent from './ChatContent'
import ChatImage from './ChatImage'
import ChatItem from './ChatItem'
import ChatSection from './ChatSection'
import ChatTime from './ChatTime'

const Chat = createWithBsPrefix('chat', {
	Component: 'div',
})

export default Object.assign(Chat, {
	Author: ChatAuthor,
	Avatar: ChatAvatar,
	Bubble: ChatBubble,
	Content: ChatContent,
	Item: ChatItem,
	Image: ChatImage,
	Section: ChatSection,
	Time: ChatTime,
})
