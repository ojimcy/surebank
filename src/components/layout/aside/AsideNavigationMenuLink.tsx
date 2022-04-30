import Link from 'next/link'
import React from 'react'
import { Menu } from '@blueupcode/components'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { asideMobileChange } from 'store/actions'

export interface AsideNavigationMenuLinkProps {
	title: string
	link: string
	bullet?: boolean
	active?: boolean
	icon?: React.ReactNode
	addon?: React.ReactNode
	asideMobileChange: typeof asideMobileChange
}

const AsideNavigationMenuLink: React.FC<AsideNavigationMenuLinkProps> = ({
	title,
	link,
	bullet,
	active,
	icon,
	addon,
	asideMobileChange,
}) => {
	return (
		<Menu.Item>
			<Link href={link} passHref>
				<Menu.Link
					active={active}
					href={link}
					icon={icon}
					bullet={bullet}
					addon={addon}
					onClick={() => asideMobileChange(false)}
				>
					{title}
				</Menu.Link>
			</Link>
		</Menu.Item>
	)
}

function mapDispatchToProps(dispatch: Dispatch) {
	return bindActionCreators({ asideMobileChange }, dispatch)
}

export default connect(null, mapDispatchToProps)(AsideNavigationMenuLink)
