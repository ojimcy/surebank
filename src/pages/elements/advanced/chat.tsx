import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Chat, Avatar, RichList } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { faFile } from '@fortawesome/free-regular-svg-icons'
import Image from 'next/image'
import Link from 'next/link'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const ChatPage: ExtendedNextPage = () => {
	return (
		<Row>
			<Col md={6}>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Basic</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							<strong>Chat</strong> elements as the name suggests can be used for messaging. To make chat bubbles use{' '}
							<code>Chat.Bubble</code> component. Wrap your chat bubbles into <code>Chat.Content</code>. You must set
							chat items alignment by extend <code>Chat.Item</code> component with <code>align</code> property.
						</p>
						{/* BEGIN Chat */}
						<Chat>
							<Chat.Item align="end" content>
								<Chat.Author>Me</Chat.Author>
								<Chat.Bubble>consectetur adipisicing elit, sed do eiusmod tempor.</Chat.Bubble>
								<Chat.Bubble>Lorem ipsum dolor sit amet.</Chat.Bubble>
								<Chat.Time>1 hrs ago</Chat.Time>
							</Chat.Item>
							<Chat.Item align="start" content>
								<Chat.Author>Charlie</Chat.Author>
								<Chat.Bubble>
									Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore
									et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
									aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
									dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in.
								</Chat.Bubble>
								<Chat.Time>2 hrs ago</Chat.Time>
							</Chat.Item>
						</Chat>
						{/* END Chat */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Avatar</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							You can put your <Link href="/elements/advanced/avatar">avatar</Link> into the chat elements. Use{' '}
							<code>Chat.Avatar</code> component instead the default avatar component.
						</p>
						{/* BEGIN Chat */}
						<Chat>
							<Chat.Item align="end">
								{/* BEGIN Avatar */}
								<Chat.Avatar>
									<Avatar display circle>
										<FontAwesomeIcon icon={faUser} />
									</Avatar>
								</Chat.Avatar>
								{/* END Avatar */}
								<Chat.Content>
									<Chat.Author>Me</Chat.Author>
									<Chat.Bubble>consectetur adipisicing elit, sed do eiusmod tempor.</Chat.Bubble>
									<Chat.Bubble>Lorem ipsum dolor sit amet.</Chat.Bubble>
									<Chat.Time>1 hrs ago</Chat.Time>
								</Chat.Content>
							</Chat.Item>
							<Chat.Item align="start">
								{/* BEGIN Avatar */}
								<Chat.Avatar>
									<Avatar display circle>
										<Image src="/images/avatar/blank.webp" layout="fill" alt="Avatar Image" />
									</Avatar>
								</Chat.Avatar>
								{/* END Avatar */}
								<Chat.Content>
									<Chat.Author>Charlie</Chat.Author>
									<Chat.Bubble>
										Consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
									</Chat.Bubble>
									<Chat.Time>2 hrs ago</Chat.Time>
								</Chat.Content>
							</Chat.Item>
						</Chat>
						{/* END Chat */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Section</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>Chat section is an element that can be used for marking time section, look the example.</p>
						{/* BEGIN Chat */}
						<Chat>
							<Chat.Item align="end" content>
								<Chat.Author>Me</Chat.Author>
								<Chat.Bubble>consectetur adipisicing elit, sed do eiusmod tempor.</Chat.Bubble>
								<Chat.Bubble>Lorem ipsum dolor sit amet.</Chat.Bubble>
								<Chat.Time>1 hrs ago</Chat.Time>
							</Chat.Item>
							<Chat.Section>17 August</Chat.Section>
							<Chat.Item align="start" content>
								<Chat.Author>Charlie</Chat.Author>
								<Chat.Bubble>
									Consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
								</Chat.Bubble>
								<Chat.Time>2 hrs ago</Chat.Time>
							</Chat.Item>
						</Chat>
						{/* END Chat */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
			<Col md={6}>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Colors</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Change the bubble color with <code>variant</code> property to differentiate each chat bubbles.
						</p>
						{/* BEGIN Chat */}
						<Chat>
							<Chat.Item align="end" content>
								<Chat.Author>Me</Chat.Author>
								<Chat.Bubble variant="primary">consectetur adipisicing elit, sed do eiusmod tempor.</Chat.Bubble>
								<Chat.Bubble variant="primary">Lorem ipsum dolor sit amet.</Chat.Bubble>
								<Chat.Time>1 hrs ago</Chat.Time>
							</Chat.Item>
							<Chat.Item align="start" content>
								<Chat.Author>Charlie</Chat.Author>
								<Chat.Bubble variant="success">
									Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore
									et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
									aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
									dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in.
								</Chat.Bubble>
								<Chat.Time>2 hrs ago</Chat.Time>
							</Chat.Item>
						</Chat>
						{/* END Chat */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>More content</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							You can put chat bubble into another bubble to make mentioned message. Insert images or any elements to
							make more rich messages.
						</p>
						{/* BEGIN Chat */}
						<Chat>
							<Chat.Item align="end">
								{/* BEGIN Avatar */}
								<Chat.Avatar>
									<Avatar display circle>
										<FontAwesomeIcon icon={faUser} />
									</Avatar>
								</Chat.Avatar>
								{/* END Avatar */}
								<Chat.Content>
									<Chat.Author>Me</Chat.Author>
									<Chat.Bubble variant="primary">
										<Chat.Image src="/images/banner/banner-1.webp" alt="User Image" />
										<p className="mb-0">Lorem ipsum dolor sit amet.</p>
									</Chat.Bubble>
									<Chat.Bubble variant="primary">Duis aute irure dolor in</Chat.Bubble>
									<Chat.Time>1 hrs ago</Chat.Time>
								</Chat.Content>
							</Chat.Item>
							<Chat.Item align="start">
								{/* BEGIN Avatar */}
								<Chat.Avatar>
									<Avatar display circle>
										<Image src="/images/avatar/blank.webp" layout="fill" alt="Avatar image" />
									</Avatar>
								</Chat.Avatar>
								{/* END Avatar */}
								<Chat.Content>
									<Chat.Author>Charlie</Chat.Author>
									<Chat.Bubble variant="success">
										<Chat.Bubble variant="primary">Duis aute irure dolor in</Chat.Bubble>
										<p className="mb-0">Excepteur sint occaecat cupidatat non proident, sunt in.</p>
									</Chat.Bubble>
									<Chat.Time>2 hrs ago</Chat.Time>
								</Chat.Content>
							</Chat.Item>
							<Chat.Item align="end">
								{/* BEGIN Avatar */}
								<Avatar display circle>
									<FontAwesomeIcon icon={faUser} />
								</Avatar>
								{/* END Avatar */}
								<Chat.Content>
									<Chat.Author>Me</Chat.Author>
									<Chat.Bubble variant="primary">
										<Chat.Bubble variant="primary">
											<RichList.Item className="p-0">
												<RichList.Addon addonType="prepend">
													{/* BEGIN Avatar */}
													<Avatar display variant="label-primary">
														<FontAwesomeIcon icon={faFile} />
													</Avatar>
													{/* END Avatar */}
												</RichList.Addon>
												<RichList.Content>
													<RichList.Title>Porta.zip</RichList.Title>
													<RichList.Subtitle>Cras justo odio</RichList.Subtitle>
												</RichList.Content>
											</RichList.Item>
										</Chat.Bubble>
										<p className="mb-0">Lorem ipsum dolor sit amet.</p>
									</Chat.Bubble>
									<Chat.Bubble variant="primary">Duis aute irure dolor in</Chat.Bubble>
									<Chat.Time>1 hrs ago</Chat.Time>
								</Chat.Content>
							</Chat.Item>
						</Chat>
						{/* END Chat */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

ChatPage.pageTitle = 'Chat'
ChatPage.activeLink = 'elements.advanced.chat'
ChatPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Advanced' },
	{ text: 'Chat', link: '/elements/advanced/chat' },
]

export default withAuth(ChatPage)
