import React from 'react'
import { Avatar, Badge, Button, Marker, Portlet, RichList } from '@blueupcode/components'
import { faUsers, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'

const WidgetContacts: React.FC<WidgetContactsProps> = ({ contacts }) => {
	return (
		<Portlet>
			<Portlet.Header bordered>
				<Portlet.Icon>
					<FontAwesomeIcon icon={faUsers} />
				</Portlet.Icon>
				<Portlet.Title>Contacts</Portlet.Title>
				<Portlet.Addon>
					<Button icon variant="label-primary">
						<FontAwesomeIcon icon={faPlus} />
					</Button>
				</Portlet.Addon>
			</Portlet.Header>
			<Portlet.Body className="p-0">
				<RichList flush action>
					{contacts.map((contact, index) => {
						return (
							<RichList.Item key={index}>
								<RichList.Addon addonType="prepend">
									<Avatar circle>
										{contact.avatarMarker && <Avatar.Addon position="top">{contact.avatarMarker}</Avatar.Addon>}
										<Avatar.Display>
											<Image src={contact.image} layout="fill" alt={contact.name} />
										</Avatar.Display>
										<Avatar.Addon position="bottom">
											<Marker type="dot" variant={contact.online ? 'success' : 'secondary'} />
										</Avatar.Addon>
									</Avatar>
								</RichList.Addon>
								<RichList.Content>
									<RichList.Title>{contact.name}</RichList.Title>
									<RichList.Subtitle>{contact.title}</RichList.Subtitle>
								</RichList.Content>
								<RichList.Addon addonType="append" className="flex-column align-items-end">
									<span className="text-muted text-nowrap">{contact.time}</span>
									{contact.count > 0 && (
										<Badge variant="success" pill>
											{contact.count}
										</Badge>
									)}
								</RichList.Addon>
							</RichList.Item>
						)
					})}
				</RichList>
			</Portlet.Body>
		</Portlet>
	)
}

export interface WidgetContactsProps {
	contacts: WidgetContactsData[]
}

export interface WidgetContactsData {
	name: string
	title: string
	time: string
	link: string
	image: string
	count: number
	online: boolean
	avatarMarker?: React.ReactNode
}

export default WidgetContacts
