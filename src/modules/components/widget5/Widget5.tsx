import createWithBsPrefix from '../_utilities/createWithBsPrefix'
import Widget5Group from './Widget5Group'
import Widget5Info from './Widget5Info'
import Widget5Item from './Widget5Item'
import Widget5Title from './Widget5Title'
import Widget5Value from './Widget5Value'

const Widget5 = createWithBsPrefix('widget5', {
	Component: 'div',
})

export default Object.assign(Widget5, {
	Group: Widget5Group,
	Info: Widget5Info,
	Item: Widget5Item,
	Title: Widget5Title,
	Value: Widget5Value,
})
