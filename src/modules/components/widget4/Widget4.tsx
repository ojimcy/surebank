import createWithBsPrefix from '../_utilities/createWithBsPrefix'
import Widget4Addon from './Widget4Addon'
import Widget4Display from './Widget4Display'
import Widget4Group from './Widget4Group'
import Widget4Highlight from './Widget4Highlight'
import Widget4Subtitle from './Widget4Subtitle'
import Widget4Title from './Widget4Title'

const Widget4 = createWithBsPrefix('widget4', {
	Component: 'div',
})

export default Object.assign(Widget4, {
	Addon: Widget4Addon,
	Display: Widget4Display,
	Group: Widget4Group,
	Highlight: Widget4Highlight,
	Subtitle: Widget4Subtitle,
	Title: Widget4Title,
})
