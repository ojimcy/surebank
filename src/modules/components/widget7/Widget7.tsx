import createWithBsPrefix from '../_utilities/createWithBsPrefix'
import Widget7Text from './Widget7Text'
import Widget7Time from './Widget7Time'

const Widget7 = createWithBsPrefix('widget7', {
	Component: 'div',
})

export default Object.assign(Widget7, {
	Text: Widget7Text,
	Time: Widget7Time,
})
