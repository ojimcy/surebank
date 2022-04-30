import createWithBsPrefix from '../_utilities/createWithBsPrefix'
import Widget14Avatar from './Widget14Avatar'
import Widget14Subtitle from './Widget14Subtitle'
import Widget14Title from './Widget14Title'

const Widget14 = createWithBsPrefix('widget14', {
	Component: 'div',
})

export default Object.assign(Widget14, {
	Avatar: Widget14Avatar,
	Title: Widget14Title,
	Subtitle: Widget14Subtitle,
})
