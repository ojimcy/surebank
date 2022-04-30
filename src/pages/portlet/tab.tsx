import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Nav, Tab, Button, Portlet, Dropdown } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as SolidIcon from '@fortawesome/free-solid-svg-icons'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const PortletTabPage: ExtendedNextPage = () => {
	return (
		<>
			<Row>
				<Col md="4">
					{/* BEGIN Portlet */}
					<Tab.Container defaultActiveKey="home">
						<Portlet>
							<Portlet.Header bordered>
								<Portlet.Title>Line</Portlet.Title>
								<Portlet.Addon>
									{/* BEGIN Nav */}
									<Nav variant="lines" portlet>
										<Nav.Item>
											<Nav.Link eventKey="home">Home</Nav.Link>
										</Nav.Item>
										<Nav.Item>
											<Nav.Link eventKey="profile">Profile</Nav.Link>
										</Nav.Item>
										<Nav.Item>
											<Nav.Link eventKey="contact">Contact</Nav.Link>
										</Nav.Item>
									</Nav>
									{/* END Nav */}
								</Portlet.Addon>
							</Portlet.Header>
							<Portlet.Body>
								{/* BEGIN Tabs */}
								<Tab.Content>
									<Tab.Pane eventKey="home">
										<p className="mb-0">
											It has survived not only five centuries, but also the leap into electronic typesetting, remaining
											essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets
											containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus
											PageMaker including versions of Lorem Ipsum.
										</p>
									</Tab.Pane>
									<Tab.Pane eventKey="profile">
										<p className="mb-0">
											Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
											the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a
											galley of type and scrambled it to make a type specimen book. It has survived not only five
											centuries, but also the leap into electronic typesetting, remaining essentially unchanged
										</p>
									</Tab.Pane>
									<Tab.Pane eventKey="contact">
										<p className="mb-0">
											Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
											the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a
											galley of type and scrambled it to make a type specimen book. It has survived not only five
											centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was
											popularised in the 1960s with the release of Letraset sheets containLorem Ipsum passages, and more
											recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
										</p>
									</Tab.Pane>
								</Tab.Content>
								{/* END Tabs */}
							</Portlet.Body>
						</Portlet>
					</Tab.Container>
					{/* END Portlet */}
				</Col>
				<Col md="4">
					{/* BEGIN Portlet */}
					<Tab.Container defaultActiveKey="home">
						<Portlet>
							<Portlet.Header bordered>
								<Portlet.Title>Pill</Portlet.Title>
								<Portlet.Addon>
									{/* BEGIN Nav */}
									<Nav variant="pills" portlet>
										<Nav.Item>
											<Nav.Link eventKey="home">Home</Nav.Link>
										</Nav.Item>
										<Nav.Item>
											<Nav.Link eventKey="profile">Profile</Nav.Link>
										</Nav.Item>
										<Nav.Item>
											<Nav.Link eventKey="contact">Contact</Nav.Link>
										</Nav.Item>
									</Nav>
									{/* END Nav */}
								</Portlet.Addon>
							</Portlet.Header>
							<Portlet.Body>
								{/* BEGIN Tabs */}
								<Tab.Content>
									<Tab.Pane eventKey="home">
										<p className="mb-0">
											It has survived not only five centuries, but also the leap into electronic typesetting, remaining
											essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets
											containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus
											PageMaker including versions of Lorem Ipsum.
										</p>
									</Tab.Pane>
									<Tab.Pane eventKey="profile">
										<p className="mb-0">
											Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
											the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a
											galley of type and scrambled it to make a type specimen book. It has survived not only five
											centuries, but also the leap into electronic typesetting, remaining essentially unchanged
										</p>
									</Tab.Pane>
									<Tab.Pane eventKey="contact">
										<p className="mb-0">
											Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
											the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a
											galley of type and scrambled it to make a type specimen book. It has survived not only five
											centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was
											popularised in the 1960s with the release of Letraset sheets containLorem Ipsum passages, and more
											recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
										</p>
									</Tab.Pane>
								</Tab.Content>
								{/* END Tabs */}
							</Portlet.Body>
						</Portlet>
					</Tab.Container>
					{/* END Portlet */}
				</Col>
				<Col md="4">
					{/* BEGIN Portlet */}
					<Tab.Container defaultActiveKey="home">
						<Portlet>
							<Portlet.Header bordered>
								<Portlet.Title>Tab</Portlet.Title>
								<Portlet.Addon>
									{/* BEGIN Nav */}
									<Nav variant="tabs" portlet>
										<Nav.Item>
											<Nav.Link eventKey="home">Home</Nav.Link>
										</Nav.Item>
										<Nav.Item>
											<Nav.Link eventKey="profile">Profile</Nav.Link>
										</Nav.Item>
										<Nav.Item>
											<Nav.Link eventKey="contact">Contact</Nav.Link>
										</Nav.Item>
									</Nav>
									{/* END Nav */}
								</Portlet.Addon>
							</Portlet.Header>
							<Portlet.Body>
								{/* BEGIN Tabs */}
								<Tab.Content>
									<Tab.Pane eventKey="home">
										<p className="mb-0">
											It has survived not only five centuries, but also the leap into electronic typesetting, remaining
											essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets
											containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus
											PageMaker including versions of Lorem Ipsum.
										</p>
									</Tab.Pane>
									<Tab.Pane eventKey="profile">
										<p className="mb-0">
											Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
											the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a
											galley of type and scrambled it to make a type specimen book. It has survived not only five
											centuries, but also the leap into electronic typesetting, remaining essentially unchanged
										</p>
									</Tab.Pane>
									<Tab.Pane eventKey="contact">
										<p className="mb-0">
											Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
											the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a
											galley of type and scrambled it to make a type specimen book. It has survived not only five
											centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was
											popularised in the 1960s with the release of Letraset sheets containLorem Ipsum passages, and more
											recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
										</p>
									</Tab.Pane>
								</Tab.Content>
								{/* END Tabs */}
							</Portlet.Body>
						</Portlet>
					</Tab.Container>
					{/* END Portlet */}
				</Col>
			</Row>
			<Row>
				<Col md="6">
					{/* BEGIN Portlet */}
					<Tab.Container defaultActiveKey="home">
						<Portlet>
							<Portlet.Header bordered>
								<Portlet.Icon>
									<FontAwesomeIcon icon={SolidIcon.faMapMarkerAlt} />
								</Portlet.Icon>
								<Portlet.Title>Icon</Portlet.Title>
								<Portlet.Addon>
									{/* BEGIN Nav */}
									<Nav variant="lines" portlet>
										<Nav.Item>
											<Nav.Link eventKey="home">Home</Nav.Link>
										</Nav.Item>
										<Nav.Item>
											<Nav.Link eventKey="profile">Profile</Nav.Link>
										</Nav.Item>
										<Nav.Item>
											<Nav.Link eventKey="contact">Contact</Nav.Link>
										</Nav.Item>
									</Nav>
									{/* END Nav */}
								</Portlet.Addon>
							</Portlet.Header>
							<Portlet.Body>
								{/* BEGIN Tabs */}
								<Tab.Content>
									<Tab.Pane eventKey="home">
										<p className="mb-0">
											It has survived not only five centuries, but also the leap into electronic typesetting, remaining
											essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets
											containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus
											PageMaker including versions of Lorem Ipsum.
										</p>
									</Tab.Pane>
									<Tab.Pane eventKey="profile">
										<p className="mb-0">
											Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
											the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a
											galley of type and scrambled it to make a type specimen book. It has survived not only five
											centuries, but also the leap into electronic typesetting, remaining essentially unchanged
										</p>
									</Tab.Pane>
									<Tab.Pane eventKey="contact">
										<p className="mb-0">
											Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
											the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a
											galley of type and scrambled it to make a type specimen book. It has survived not only five
											centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was
											popularised in the 1960s with the release of Letraset sheets containLorem Ipsum passages, and more
											recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
										</p>
									</Tab.Pane>
								</Tab.Content>
								{/* END Tabs */}
							</Portlet.Body>
						</Portlet>
					</Tab.Container>
					{/* END Portlet */}
					{/* BEGIN Portlet */}
					<Tab.Container defaultActiveKey="home">
						<Portlet>
							<Portlet.Header bordered>
								<Portlet.Title>Dropdown</Portlet.Title>
								<Portlet.Addon>
									{/* BEGIN Nav */}
									<Nav variant="pills" portlet>
										<Nav.Item>
											<Nav.Link eventKey="home">Home</Nav.Link>
										</Nav.Item>
										<Nav.Item>
											<Nav.Link eventKey="profile">Profile</Nav.Link>
										</Nav.Item>
										{/* BEGIN Dropdown */}
										<Dropdown as={Nav.Item}>
											<Dropdown.Toggle as={Nav.Link} caret>
												Dropdown
											</Dropdown.Toggle>
											<Dropdown.Menu>
												<Dropdown.Item>Action</Dropdown.Item>
												<Dropdown.Item>Another Action</Dropdown.Item>
												<Dropdown.Item>Something else here</Dropdown.Item>
												<Dropdown.Divider />
												<Dropdown.Item>Separated link</Dropdown.Item>
											</Dropdown.Menu>
										</Dropdown>
										{/* END Dropdown */}
										<Nav.Item>
											<Nav.Link eventKey="contact">Contact</Nav.Link>
										</Nav.Item>
									</Nav>
									{/* END Nav */}
								</Portlet.Addon>
							</Portlet.Header>
							<Portlet.Body>
								{/* BEGIN Tabs */}
								<Tab.Content>
									<Tab.Pane eventKey="home">
										<p className="mb-0">
											It has survived not only five centuries, but also the leap into electronic typesetting, remaining
											essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets
											containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus
											PageMaker including versions of Lorem Ipsum.
										</p>
									</Tab.Pane>
									<Tab.Pane eventKey="profile">
										<p className="mb-0">
											Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
											the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a
											galley of type and scrambled it to make a type specimen book. It has survived not only five
											centuries, but also the leap into electronic typesetting, remaining essentially unchanged
										</p>
									</Tab.Pane>
									<Tab.Pane eventKey="contact">
										<p className="mb-0">
											Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
											the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a
											galley of type and scrambled it to make a type specimen book. It has survived not only five
											centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was
											popularised in the 1960s with the release of Letraset sheets containLorem Ipsum passages, and more
											recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
										</p>
									</Tab.Pane>
								</Tab.Content>
								{/* END Tabs */}
							</Portlet.Body>
							<Portlet.Footer bordered align="end">
								<Button variant="primary">Submit</Button> <Button variant="outline-secondary">Cancel</Button>
							</Portlet.Footer>
						</Portlet>
					</Tab.Container>
					{/* END Portlet */}
				</Col>
				<Col md="6">
					{/* BEGIN Portlet */}
					<Tab.Container defaultActiveKey="home">
						<Portlet>
							<Portlet.Header bordered>
								<Portlet.Icon>
									<FontAwesomeIcon icon={SolidIcon.faLayerGroup} />
								</Portlet.Icon>
								<Portlet.Title>Footer</Portlet.Title>
								<Portlet.Addon>
									{/* BEGIN Nav */}
									<Nav variant="pills" portlet>
										<Nav.Item>
											<Nav.Link eventKey="home">Home</Nav.Link>
										</Nav.Item>
										<Nav.Item>
											<Nav.Link eventKey="profile">Profile</Nav.Link>
										</Nav.Item>
										<Nav.Item>
											<Nav.Link eventKey="contact">Contact</Nav.Link>
										</Nav.Item>
									</Nav>
									{/* END Nav */}
								</Portlet.Addon>
							</Portlet.Header>
							<Portlet.Body>
								{/* BEGIN Tabs */}
								<Tab.Content>
									<Tab.Pane eventKey="home">
										<p className="mb-0">
											It has survived not only five centuries, but also the leap into electronic typesetting, remaining
											essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets
											containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus
											PageMaker including versions of Lorem Ipsum.
										</p>
									</Tab.Pane>
									<Tab.Pane eventKey="profile">
										<p className="mb-0">
											Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
											the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a
											galley of type and scrambled it to make a type specimen book. It has survived not only five
											centuries, but also the leap into electronic typesetting, remaining essentially unchanged
										</p>
									</Tab.Pane>
									<Tab.Pane eventKey="contact">
										<p className="mb-0">
											Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
											the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a
											galley of type and scrambled it to make a type specimen book. It has survived not only five
											centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was
											popularised in the 1960s with the release of Letraset sheets containLorem Ipsum passages, and more
											recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
										</p>
									</Tab.Pane>
								</Tab.Content>
								{/* END Tabs */}
							</Portlet.Body>
							<Portlet.Footer bordered align="end">
								<Button variant="primary">Submit</Button> <Button variant="outline-secondary">Cancel</Button>
							</Portlet.Footer>
						</Portlet>
					</Tab.Container>
					{/* END Portlet */}
					<Tab.Container defaultActiveKey="home">
						<Portlet>
							<Portlet.Header bordered>
								<Portlet.Addon>
									{/* BEGIN Nav */}
									<Nav variant="lines" portlet>
										<Nav.Item>
											<Nav.Link eventKey="home">Home</Nav.Link>
										</Nav.Item>
										<Nav.Item>
											<Nav.Link eventKey="profile">Profile</Nav.Link>
										</Nav.Item>
										<Nav.Item>
											<Nav.Link eventKey="contact">Contact</Nav.Link>
										</Nav.Item>
									</Nav>
									{/* END Nav */}
								</Portlet.Addon>
							</Portlet.Header>
							<Portlet.Body>
								{/* BEGIN Tabs */}
								<Tab.Content>
									<Tab.Pane eventKey="home">
										<p className="mb-0">
											It has survived not only five centuries, but also the leap into electronic typesetting, remaining
											essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets
											containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus
											PageMaker including versions of Lorem Ipsum.
										</p>
									</Tab.Pane>
									<Tab.Pane eventKey="profile">
										<p className="mb-0">
											Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
											the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a
											galley of type and scrambled it to make a type specimen book. It has survived not only five
											centuries, but also the leap into electronic typesetting, remaining essentially unchanged
										</p>
									</Tab.Pane>
									<Tab.Pane eventKey="contact">
										<p className="mb-0">
											Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
											the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a
											galley of type and scrambled it to make a type specimen book. It has survived not only five
											centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was
											popularised in the 1960s with the release of Letraset sheets containLorem Ipsum passages, and more
											recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
										</p>
									</Tab.Pane>
								</Tab.Content>
								{/* END Tabs */}
							</Portlet.Body>
						</Portlet>
					</Tab.Container>
				</Col>
			</Row>
		</>
	)
}

PortletTabPage.pageTitle = 'Portlet Tab'
PortletTabPage.activeLink = 'elements.portlet.tab'
PortletTabPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Portlet' },
	{ text: 'Tab', link: '/portlet/tab' },
]

export default withAuth(PortletTabPage)
