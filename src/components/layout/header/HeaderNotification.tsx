import React from 'react'
import { Avatar, Badge, Button, Caret, Dropdown, Marker, Portlet, RichList } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faAsterisk,
	faDownload,
	faFileInvoice,
	faPaperPlane,
	faShoppingBasket,
	faUserPlus,
	faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { faBell } from '@fortawesome/free-regular-svg-icons'
import useSimplebar from 'hooks/useSimplebar'
import type { ButtonVariant } from '@blueupcode/components/types'

const LayoutHeaderNotification: React.FC<LayoutHeaderNotificationProps> = ({ variant }) => {
	const simplebarInstance = useSimplebar()

	const [notificationData] = React.useState([
		{
			avatar: (
				<Avatar display variant="label-info">
					<FontAwesomeIcon icon={faFileInvoice} />
				</Avatar>
			),
			content: 'New report has been received',
			time: '2 min ago',
		},
		{
			avatar: (
				<Avatar display variant="label-success">
					<FontAwesomeIcon icon={faShoppingBasket} />
				</Avatar>
			),
			content: 'Last order was completed',
			time: '1 hrs ago',
		},
		{
			avatar: (
				<Avatar display variant="label-danger">
					<FontAwesomeIcon icon={faUsers} />
				</Avatar>
			),
			content: 'Company meeting canceled',
			time: '5 hrs ago',
		},
		{
			avatar: (
				<Avatar display variant="label-warning">
					<FontAwesomeIcon icon={faPaperPlane} />
				</Avatar>
			),
			content: 'New feedback received',
			time: '6 hrs ago',
		},
		{
			avatar: (
				<Avatar display variant="label-primary">
					<FontAwesomeIcon icon={faDownload} />
				</Avatar>
			),
			content: 'New update was available',
			time: '1 day ago',
		},
		{
			avatar: (
				<Avatar display variant="label-success">
					<FontAwesomeIcon icon={faAsterisk} />
				</Avatar>
			),
			content: 'Your password was changed',
			time: '2 day ago',
		},
		{
			avatar: (
				<Avatar display variant="label-info">
					<FontAwesomeIcon icon={faUserPlus} />
				</Avatar>
			),
			content: 'New account has been registered',
			time: '5 day ago',
		},
	])

	const notificationCount = notificationData.length

	return (
		<Dropdown>
			<Dropdown.Toggle variant={variant} icon noCaret>
				<FontAwesomeIcon icon={faBell} />
				<Button.Marker>
					<Marker type="dot" variant="primary" />
				</Button.Marker>
			</Dropdown.Toggle>
			<Dropdown.Menu wide animated align="end" className="overflow-hidden py-0">
				{/* BEGIN Portlet */}
				<Portlet scroll className="border-0">
					<Portlet.Header className="bg-info rounded-0">
						<Portlet.Icon className="text-white">
							<FontAwesomeIcon icon={faBell} />
						</Portlet.Icon>
						<Portlet.Title className="text-white">Notification</Portlet.Title>
						<Portlet.Addon>
							<Badge variant="label-light" className="fs-6">
								{notificationCount > 9 ? '9+' : notificationCount}
							</Badge>
						</Portlet.Addon>
					</Portlet.Header>
					<Portlet.Body ref={simplebarInstance} className="p-0 rounded-0">
						{/* BEGIN Rich List */}
						<RichList action>
							{notificationData.map((notification, index) => (
								<RichList.Item key={index}>
									<RichList.Addon addonType="prepend">{notification.avatar}</RichList.Addon>
									<RichList.Content>
										<RichList.Title>{notification.content}</RichList.Title>
										<RichList.Subtitle>{notification.time}</RichList.Subtitle>
									</RichList.Content>
									<RichList.Addon addonType="append">
										<Caret className="mx-2" />
									</RichList.Addon>
								</RichList.Item>
							))}
						</RichList>
						{/* END Rich List */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Dropdown.Menu>
		</Dropdown>
	)
}

interface LayoutHeaderNotificationProps {
	variant: ButtonVariant
}

export default LayoutHeaderNotification
