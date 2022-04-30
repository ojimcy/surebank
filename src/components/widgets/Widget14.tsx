import React from 'react'
import { Avatar, Badge, Dropdown, Portlet, RichList } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faBell,
	faCheck,
	faCog,
	faEllipsisH,
	faFileInvoice,
	faPaperPlane,
	faShoppingBasket,
	faTrashAlt,
	faUsers,
} from '@fortawesome/free-solid-svg-icons'

const Widget14Component = () => {
	const [list] = React.useState([
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
	])

	return (
		<Portlet>
			<Portlet.Header>
				<Portlet.Icon>
					<FontAwesomeIcon icon={faBell} />
				</Portlet.Icon>
				<Portlet.Title>Notification</Portlet.Title>
				<Portlet.Addon>
					{/* BEGIN Dropdown */}
					<Dropdown>
						<Dropdown.Toggle variant="label-primary">All</Dropdown.Toggle>
						<Dropdown.Menu animated align="end">
							<Dropdown.Item href="#">
								<Badge variant="label-primary">Personal</Badge>
							</Dropdown.Item>
							<Dropdown.Item href="#">
								<Badge variant="label-info">Work</Badge>
							</Dropdown.Item>
							<Dropdown.Item href="#">
								<Badge variant="label-success">Important</Badge>
							</Dropdown.Item>
							<Dropdown.Item href="#">
								<Badge variant="label-danger">Company</Badge>
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
					{/* END Dropdown */}
				</Portlet.Addon>
			</Portlet.Header>
			<Portlet.Body>
				{/* BEGIN Rich List */}
				<RichList bordered action>
					{list.map((data, index) => (
						<RichList.Item key={index}>
							<RichList.Addon addonType="prepend">{data.avatar}</RichList.Addon>
							<RichList.Content>
								<RichList.Title>{data.content}</RichList.Title>
								<RichList.Subtitle>{data.time}</RichList.Subtitle>
							</RichList.Content>
							<RichList.Addon addonType="append">
								{/* BEGIN Dropdown */}
								<Dropdown>
									<Dropdown.Toggle variant="text-secondary" icon noCaret>
										<FontAwesomeIcon icon={faEllipsisH} />
									</Dropdown.Toggle>
									<Dropdown.Menu animated align="end">
										<Dropdown.Item href="#" icon={<FontAwesomeIcon icon={faCheck} />}>
											Mark as read
										</Dropdown.Item>
										<Dropdown.Item href="#" icon={<FontAwesomeIcon icon={faTrashAlt} />}>
											Delete
										</Dropdown.Item>
										<Dropdown.Item href="#" icon={<FontAwesomeIcon icon={faCog} />}>
											Settings
										</Dropdown.Item>
									</Dropdown.Menu>
								</Dropdown>
								{/* END Dropdown */}
							</RichList.Addon>
						</RichList.Item>
					))}
				</RichList>
				{/* END Rich List */}
			</Portlet.Body>
		</Portlet>
	)
}

export default Widget14Component
