import React from 'react'
import { Avatar, Button, Dropdown, RichList, Widget1 } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faCalendarAlt, faEllipsisH, faPoll } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'

const Widget9Component = () => {
	const [data] = React.useState({
		content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Veniam ratione eum quidem optio.',
		author: 'Charlie Stone',
		time: '1 min',
		link: '#',
	})

	return (
		<Widget1>
			<Widget1.Display className="bg-primary text-white">
				<Widget1.Group>
					<Widget1.Title>Announcement</Widget1.Title>
					<Widget1.Addon>
						{/* BEGIN Dropdown */}
						<Dropdown>
							<Dropdown.Toggle variant="label-light" icon noCaret>
								<FontAwesomeIcon icon={faEllipsisH} />
							</Dropdown.Toggle>
							<Dropdown.Menu animated align="end">
								<Dropdown.Item icon={<FontAwesomeIcon icon={faPoll} />}>Report</Dropdown.Item>
								<Dropdown.Item icon={<FontAwesomeIcon icon={faCalendarAlt} />}>Event</Dropdown.Item>
								<Dropdown.Item icon={<FontAwesomeIcon icon={faBell} />}>Notification</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>
						{/* END Dropdown */}
					</Widget1.Addon>
				</Widget1.Group>
				<Widget1.Dialog>
					<Widget1.DialogContent className="d-flex flex-column align-items-center">
						<h5 className="text-center mb-0">{data.content}</h5>
						{/* BEGIN Rich List */}
						<RichList.Item className="my-4">
							<RichList.Addon addonType="prepend">
								{/* BEGIN Avatar */}
								<Avatar display circle variant="info">
									{data.author.charAt(0)}
								</Avatar>
								{/* END Avatar */}
							</RichList.Addon>
							<RichList.Content>
								<RichList.Title className="text-white">{data.author}</RichList.Title>
								<RichList.Subtitle className="text-white">{data.time}</RichList.Subtitle>
							</RichList.Content>
						</RichList.Item>
						{/* END Rich List */}
						<Link href={data.link} passHref>
							<Button variant="label-light" width="wider">
								All feeds
							</Button>
						</Link>
					</Widget1.DialogContent>
				</Widget1.Dialog>
			</Widget1.Display>
		</Widget1>
	)
}

export default Widget9Component
