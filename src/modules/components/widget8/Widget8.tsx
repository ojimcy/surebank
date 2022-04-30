import createWithBsPrefix from '../_utilities/createWithBsPrefix'
import Widget8Addon from './Widget8Addon'
import Widget8Avatar from './Widget8Avatar'
import Widget8Content from './Widget8Content'
import Widget8Highlight from './Widget8Highlight'
import Widget8Subtitle from './Widget8Subtitle'
import Widget8Title from './Widget8Title'

const Widget8 = createWithBsPrefix('widget8', {
	Component: 'div',
})

export default Object.assign(Widget8, {
	Addon: Widget8Addon,
	Avatar: Widget8Avatar,
	Content: Widget8Content,
	Highlight: Widget8Highlight,
	Subtitle: Widget8Subtitle,
	Title: Widget8Title,
})
