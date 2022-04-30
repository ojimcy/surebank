import React from 'react'
import { Avatar, Button, Chat, Dropdown, FormControl, InputGroup, Marker, Portlet, RichList } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { faComments } from '@fortawesome/free-regular-svg-icons'
import useSimplebar from 'hooks/useSimplebar'
import Image from 'next/image'
import type { ButtonVariant, AlignDirection } from '@blueupcode/components/types'
import type { ChatBubbleVariant } from '@blueupcode/components/chat/ChatBubble'

const LayoutHeaderChat: React.FC<LayoutHeaderChatProps> = ({ variant }) => {
	const simplebarInstance = useSimplebar()

	const [userData] = React.useState({
		name: 'Garrett Winters',
		title: 'UX Designer',
		avatar: (
			<Avatar display circle>
				<Image src="/images/avatar/blank.webp" layout="fill" alt="Avatar image" />
			</Avatar>
		),
	})

	const [conversationData] = React.useState([
		{
			align: 'start',
			time: '3 min ago',
			bubbles: [
				{
					variant: 'primary',
					content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Unde, eius.',
				},
				{
					variant: 'primary',
					content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Unde, eius.',
				},
			],
		},
		{
			align: 'end',
			time: '2 min ago',
			bubbles: [
				{
					variant: undefined,
					content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Unde, eius.',
				},
			],
		},
		{
			align: 'start',
			time: '1 min ago',
			bubbles: [
				{
					variant: 'primary',
					content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Unde, eius.',
				},
			],
		},
	])

	return (
		<Dropdown>
			<Dropdown.Toggle variant={variant} icon noCaret>
				<FontAwesomeIcon icon={faComments} />
				<Button.Marker>
					<Marker type="dot" variant="primary" />
				</Button.Marker>
			</Dropdown.Toggle>
			<Dropdown.Menu wide animated align="end" className="overflow-hidden py-0">
				{/* BEGIN Portlet */}
				<Portlet scroll className="border-0">
					<Portlet.Header bordered className="rounded-0">
						{/* BEGIN Rich List */}
						<RichList.Item className="w-100 p-0">
							<RichList.Addon addonType="prepend">{userData.avatar}</RichList.Addon>
							<RichList.Content>
								<RichList.Title>{userData.name}</RichList.Title>
								<RichList.Subtitle>{userData.title}</RichList.Subtitle>
							</RichList.Content>
						</RichList.Item>
						{/* END Rich List */}
					</Portlet.Header>
					<Portlet.Body ref={simplebarInstance}>
						{/* BEGIN Chat */}
						<Chat>
							{conversationData.map((conversation, index) => (
								<Chat.Item key={index} align={conversation.align as AlignDirection}>
									<Chat.Content>
										{conversation.bubbles.map((bubble, index) => (
											<Chat.Bubble key={index} variant={bubble.variant as ChatBubbleVariant | undefined}>
												{bubble.content}
											</Chat.Bubble>
										))}
										<Chat.Time>{conversation.time}</Chat.Time>
									</Chat.Content>
								</Chat.Item>
							))}
						</Chat>
						{/* END Chat */}
					</Portlet.Body>
					<Portlet.Footer bordered className="rounded-0">
						{/* BEGIN Input Group */}
						<InputGroup>
							<FormControl type="text" placeholder="Type..." />
							<Button icon variant="primary">
								<FontAwesomeIcon icon={faPaperPlane} />
							</Button>
						</InputGroup>
						{/* END Input Group */}
					</Portlet.Footer>
				</Portlet>
				{/* END Portlet */}
			</Dropdown.Menu>
		</Dropdown>
	)
}

interface LayoutHeaderChatProps {
	variant: ButtonVariant
}

export default LayoutHeaderChat
