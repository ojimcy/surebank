import createWithBsPrefix from '../_utilities/createWithBsPrefix'
import Widget9Degree from './Widget9Degree'
import Widget9Display from './Widget9Display'
import Widget9Grid from './Widget9Grid'
import Widget9GridIcon from './Widget9GridIcon'
import Widget9GridItem from './Widget9GridItem'
import Widget9GridText from './Widget9GridText'
import Widget9Icon from './Widget9Icon'
import Widget9List from './Widget9List'
import Widget9ListAddon from './Widget9ListAddon'
import Widget9ListItem from './Widget9ListItem'
import Widget9ListText from './Widget9ListText'
import Widget9Text from './Widget9Text'

const Widget9 = createWithBsPrefix('widget9', {
	Component: 'div',
})

export default Object.assign(Widget9, {
	Degree: Widget9Degree,
	Display: Widget9Display,
	Text: Widget9Text,
	Icon: Widget9Icon,
	Grid: Widget9Grid,
	GridItem: Widget9GridItem,
	GridIcon: Widget9GridIcon,
	GridText: Widget9GridText,
	List: Widget9List,
	ListItem: Widget9ListItem,
	ListText: Widget9ListText,
	ListAddon: Widget9ListAddon,
})
