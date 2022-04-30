import React from 'react'
import classNames from 'classnames'
import { BsPrefixProps } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import MenuSubmenuContext, { MenuSubmenuContextValue } from './MenuSubmenuContext'

export interface MenuSubmenuMenuProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {}

const MenuSubmenuMenu: React.FC<MenuSubmenuMenuProps> = ({ bsPrefix, className, style, ...props }) => {
	bsPrefix = useBootstrapPrefix(bsPrefix, 'menu-submenu')

	const componentRef = React.useRef<HTMLDivElement>()

	const { height, setHeight, active, setActive, defaultActive }: MenuSubmenuContextValue =
		React.useContext(MenuSubmenuContext)

	React.useEffect(() => {
		setHeight(componentRef?.current?.offsetHeight || 0)
		setActive(defaultActive)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<div
			ref={componentRef as React.RefObject<HTMLDivElement>}
			{...props}
			className={classNames(className, bsPrefix)}
			style={{
				...style,
				height: active ? height : 0,
			}}
		/>
	)
}

MenuSubmenuMenu.displayName = 'MenuSubmenuMenu'

export default MenuSubmenuMenu
