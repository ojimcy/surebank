import React from 'react'
import { Menu } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons'

export interface AsideNavigationMenuSectionProps {
	title: string
}

const AsideNavigationMenuSection: React.FC<AsideNavigationMenuSectionProps> = ({ title, children }) => {
	return (
		<>
			<Menu.Section icon={<FontAwesomeIcon icon={faEllipsisH} />}>{title}</Menu.Section>
			{children}
		</>
	)
}

export default AsideNavigationMenuSection
