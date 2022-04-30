import React from 'react'
import { Avatar, Dropdown, Portlet, RichList, Button, Badge, GridNav, Widget13 } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faAddressCard,
	faCalendarCheck,
	faClone,
	faComments,
	faStickyNote,
	faBell,
} from '@fortawesome/free-regular-svg-icons'
import { faUserAlt } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from 'components/auth/authContext'
import { firebaseAuth } from 'components/firebase/firebaseClient'
import { signOut } from 'firebase/auth'
import Router from 'next/router'
import PAGE from 'config/page.config'
import type { ButtonVariant } from '@blueupcode/components/types'

const LayoutHeaderUser: React.FC<LayoutHeaderUserProps> = ({ variant }) => {
	const { userData } = useAuth()

	const email = userData?.email
	const fullName = userData?.displayName

	const handleLogout = async () => {
		// Sign out with Firebase
		await signOut(firebaseAuth)

		// Redirect to login page
		Router.push(PAGE.loginPagePath)
	}

	const [navigationData] = React.useState([
		[
			{
				icon: <FontAwesomeIcon icon={faAddressCard} />,
				title: 'Profile',
			},
			{
				icon: <FontAwesomeIcon icon={faComments} />,
				title: 'Messages',
			},
			{
				icon: <FontAwesomeIcon icon={faClone} />,
				title: 'Activities',
			},
		],
		[
			{
				icon: <FontAwesomeIcon icon={faCalendarCheck} />,
				title: 'Tasks',
			},
			{
				icon: <FontAwesomeIcon icon={faStickyNote} />,
				title: 'Notes',
			},
			{
				icon: <FontAwesomeIcon icon={faBell} />,
				title: 'Notification',
			},
		],
	])

	return (
		<Dropdown>
			<Widget13 variant={variant} noCaret>
				<Widget13.Text>
					Hi <strong>User</strong>
				</Widget13.Text>
				{/* BEGIN Avatar */}
				<Widget13.Avatar display variant="info">
					<FontAwesomeIcon icon={faUserAlt} />
				</Widget13.Avatar>
				{/* END Avatar */}
			</Widget13>
			<Dropdown.Menu wide animated align="end" className="overflow-hidden py-0">
				{/* BEGIN Portlet */}
				<Portlet scroll className="border-0">
					<Portlet.Header className="bg-primary rounded-0">
						{/* BEGIN Rich List */}
						<RichList.Item className="w-100 p-0">
							<RichList.Addon addonType="prepend">
								<Avatar variant="label-light" display circle>
									<FontAwesomeIcon icon={faUserAlt} />
								</Avatar>
							</RichList.Addon>
							<RichList.Content>
								<RichList.Title className="text-white">{fullName ?? 'Guest'}</RichList.Title>
								<RichList.Subtitle className="text-white">{email ?? 'No email'}</RichList.Subtitle>
							</RichList.Content>
							<RichList.Addon addonType="append">
								<Badge variant="label-light" className="fs-6">
									9+
								</Badge>
							</RichList.Addon>
						</RichList.Item>
						{/* END Rich List */}
					</Portlet.Header>
					<Portlet.Body className="p-0">
						{/* BEGIN Grid Nav */}
						<GridNav flush action noRounded>
							{navigationData.map((navigationRow, index) => (
								<GridNav.Row key={index}>
									{navigationRow.map((nativationItem, index) => {
										return (
											<GridNav.Item key={index} icon={nativationItem.icon}>
												{nativationItem.title}
											</GridNav.Item>
										)
									})}
								</GridNav.Row>
							))}
						</GridNav>
						{/* END Grid Nav */}
					</Portlet.Body>
					<Portlet.Footer bordered className="rounded-0" onClick={handleLogout}>
						<Button variant="label-danger">Sign out</Button>
					</Portlet.Footer>
				</Portlet>
				{/* END Portlet */}
			</Dropdown.Menu>
		</Dropdown>
	)
}

interface LayoutHeaderUserProps {
	variant: ButtonVariant
}

export default LayoutHeaderUser
