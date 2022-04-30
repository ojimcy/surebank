import React from 'react'
import { Avatar, Button, Col, Nav, Portlet, ProgressBar, RichList, Row, Tab, Widget4 } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsersCog } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'
import Link from 'next/link'

const Widget5Component = () => {
	const [tabs] = React.useState([
		{
			key: 'manager',
			title: 'Manager',
			persons: [
				{
					image: '/images/avatar/blank.webp',
					name: 'Rhona Davidson',
					detail: 'Javascript Developer, Tokyo',
					progress: 35,
					link: '#',
				},
				{
					image: '/images/avatar/blank.webp',
					name: 'Timothy Mooney',
					detail: 'Office Manage, San Francisco',
					progress: 55,
					link: '#',
				},
				{
					image: '/images/avatar/blank.webp',
					name: 'Jackson Bradshaw',
					detail: 'Regional Director, San Francisco',
					progress: 75,
					link: '#',
				},
				{
					image: '/images/avatar/blank.webp',
					name: 'Brielle Williamson',
					detail: 'Integration Specialist, New York',
					progress: 60,
					link: '#',
				},
				{
					image: '/images/avatar/blank.webp',
					name: 'Prescott Bartlett',
					detail: 'Technical Author, London',
					progress: 85,
					link: '#',
				},
			],
		},
		{
			key: 'employee',
			title: 'Employee',
			persons: [
				{
					image: '/images/avatar/blank.webp',
					name: 'Timothy Mooney',
					detail: 'Office Manage, San Francisco',
					progress: 55,
					link: '#',
				},
				{
					image: '/images/avatar/blank.webp',
					name: 'Prescott Bartlett',
					detail: 'Technical Author, London',
					progress: 85,
					link: '#',
				},
				{
					image: '/images/avatar/blank.webp',
					name: 'Rhona Davidson',
					detail: 'Javascript Developer, Tokyo',
					progress: 35,
					link: '#',
				},
				{
					image: '/images/avatar/blank.webp',
					name: 'Brielle Williamson',
					detail: 'Integration Specialist, New York',
					progress: 60,
					link: '#',
				},
				{
					image: '/images/avatar/blank.webp',
					name: 'Jackson Bradshaw',
					detail: 'Regional Director, San Francisco',
					progress: 75,
					link: '#',
				},
			],
		},
	])

	const defaultTabKey = 0

	return (
		<Tab.Container defaultActiveKey={tabs[defaultTabKey].key}>
			<Portlet>
				<Portlet.Header bordered>
					<Portlet.Icon>
						<FontAwesomeIcon icon={faUsersCog} />
					</Portlet.Icon>
					<Portlet.Title>Human resources</Portlet.Title>
					<Portlet.Addon>
						{/* BEGIN Nav */}
						<Nav variant="pills">
							{tabs.map((tab) => (
								<Nav.Item key={tab.key}>
									<Nav.Link eventKey={tab.key}>{tab.title}</Nav.Link>
								</Nav.Item>
							))}
						</Nav>
						{/* END Nav */}
					</Portlet.Addon>
				</Portlet.Header>
				<Portlet.Body>
					{/* BEGIN Tabs */}
					<Tab.Content>
						{tabs.map((tab) => (
							<Tab.Pane key={tab.key} eventKey={tab.key}>
								<RichList>
									{tab.persons.map((person, index) => (
										<RichList.Item key={index}>
											<Row className="g-2 w-100">
												<Col lg="6">
													<RichList.Item className="p-0">
														<RichList.Addon addonType="prepend">
															<Avatar display circle size="lg">
																<Image src={person.image} layout="fill" alt="Avatar image" />
															</Avatar>
														</RichList.Addon>
														<RichList.Content>
															<RichList.Title>{person.name}</RichList.Title>
															<RichList.Subtitle>{person.detail}</RichList.Subtitle>
														</RichList.Content>
													</RichList.Item>
												</Col>
												<Col lg="6" className="d-flex align-items-center">
													<Widget4 className="flex-grow-1 me-4">
														<Widget4.Group>
															<Widget4.Display>
																<Widget4.Subtitle>Progress</Widget4.Subtitle>
															</Widget4.Display>
															<Widget4.Addon>
																<span className="text-muted">{person.progress}%</span>
															</Widget4.Addon>
														</Widget4.Group>
														<ProgressBar now={person.progress} variant="primary" size="sm" />
													</Widget4>
													<Link href={person.link} passHref>
														<Button variant="label-primary">Follow</Button>
													</Link>
												</Col>
											</Row>
										</RichList.Item>
									))}
								</RichList>
							</Tab.Pane>
						))}
					</Tab.Content>
					{/* END Tabs */}
				</Portlet.Body>
			</Portlet>
		</Tab.Container>
	)
}

export default Widget5Component
