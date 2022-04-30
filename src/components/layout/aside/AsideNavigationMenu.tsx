import React from 'react'
import { Menu } from '@blueupcode/components'
import { State } from 'store/reducers'
import { connect } from 'react-redux'
import { MenuReducerState } from 'store/reducers/menuReducer'
import PAGE from 'config/page.config'
import ASIDE_MENU from 'config/aside-menu.config'
import AsideNavigationMenuLink from './AsideNavigationMenuLink'
import AsideNavigationMenuSection from './AsideNavigationMenuSection'
import AsideNavigationMenuSubmenu from './AsideNavigationMenuSubmenu'

export interface AsideNavigationMenuProps {
	menu: MenuReducerState
}

const AsideNavigationMenu: React.FC<AsideNavigationMenuProps> = ({ menu: { activeLinkPartial } }) => {
	return (
		<Menu>
			{ASIDE_MENU.map((rootMenu) => {
				// Define root menu key
				const rootMenuKey = rootMenu.name

				// Define active state
				const rootMenuActive = activeLinkPartial[0] == rootMenu.name

				// Check menu item type
				switch (rootMenu.type) {
					case 'link':
						// Render link item
						return (
							<AsideNavigationMenuLink
								key={rootMenuKey}
								title={rootMenu.title}
								link={rootMenu.link}
								active={rootMenuActive}
								icon={rootMenu.icon}
								addon={rootMenu.addon}
							/>
						)
					case 'section':
						// Render link section
						return (
							<AsideNavigationMenuSection key={rootMenuKey} title={rootMenu.title}>
								{rootMenu.child.map((middleMenu) => {
									// Define middle menu key
									const middleMenuKey = rootMenuKey + PAGE.menuLinkSeparator + middleMenu.name

									// Define active state
									const middleMenuActive = rootMenuActive && activeLinkPartial[1] == middleMenu.name

									// Check menu item type
									switch (middleMenu.type) {
										case 'link':
											// Render link item
											return (
												<AsideNavigationMenuLink
													key={middleMenuKey}
													title={middleMenu.title}
													link={middleMenu.link}
													active={middleMenuActive}
													icon={middleMenu.icon}
													addon={middleMenu.addon}
												/>
											)
										case 'group':
											// Render link group
											return (
												<AsideNavigationMenuSubmenu
													key={middleMenuKey}
													title={middleMenu.title}
													active={middleMenuActive}
													icon={middleMenu.icon}
												>
													{middleMenu.child.map((childMenu) => {
														// Define child menu key
														const childMenuKey = middleMenuKey + PAGE.menuLinkSeparator + childMenu.name

														// Define active state
														const childMenuActive = middleMenuActive && activeLinkPartial[2] == childMenu.name

														// Check menu item type
														switch (childMenu.type) {
															// Render link item
															case 'link':
																return (
																	<AsideNavigationMenuLink
																		key={childMenuKey}
																		title={childMenu.title}
																		link={childMenu.link}
																		active={childMenuActive}
																		icon={childMenu.icon}
																		addon={childMenu.addon}
																		bullet
																	/>
																)
															default:
																return null
														}
													})}
												</AsideNavigationMenuSubmenu>
											)
										default:
											return null
									}
								})}
							</AsideNavigationMenuSection>
						)
					default:
						return null
				}
			})}
		</Menu>
	)
}

function mapStateToProps(state: State) {
	return {
		menu: state.menu,
	}
}

export default connect(mapStateToProps)(AsideNavigationMenu)
