import createWithBsPrefix from '../_utilities/createWithBsPrefix'
import MenuItem from './MenuItem'
import MenuLink from './MenuLink'
import MenuSection from './MenuSection'
import MenuSubmenu from './MenuSubmenu'
import MenuSubmenuMenu from './MenuSubmenuMenu'
import MenuToggle from './MenuToggle'

const Menu = createWithBsPrefix('menu', {
	Component: 'div',
})

export default Object.assign(Menu, {
	Item: MenuItem,
	Link: MenuLink,
	Toggle: MenuToggle,
	Section: MenuSection,
	Submenu: MenuSubmenu,
	SubmenuMenu: MenuSubmenuMenu,
})
