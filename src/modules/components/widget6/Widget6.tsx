import createWithBsPrefix from '../_utilities/createWithBsPrefix'
import Widget6Title from './Widget6Title'
import Widget6Subtitle from './Widget6Subtitle'

const Widget6 = createWithBsPrefix('widget6', {
	Component: 'div',
})

export default Object.assign(Widget6, {
	Title: Widget6Title,
	Subtitle: Widget6Subtitle,
})
