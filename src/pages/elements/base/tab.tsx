import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Nav, Tabs, Tab, Card } from '@blueupcode/components'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const TabPage: ExtendedNextPage = () => {
	return (
		<Row>
			<Col>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header>
						<Portlet.Title>Basic tab</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						{/* BEGIN Row */}
						<Row className="g-3">
							<Col md={4}>
								{/* BEGIN Portlet */}
								<Portlet noMargin>
									<Portlet.Body>
										{/* BEGIN Tabs */}
										<Tabs defaultActiveKey="home" id="basic-tab-1" variant="lines" className="mb-3">
											<Tab eventKey="home" title="Home">
												<p className="mb-0">
													It has survived not only five centuries, but also the leap into electronic typesetting,
													remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset
													sheets containing Lorem Ipsum passages, and more recently with desktop publishing software
													like Aldus PageMaker including versions of Lorem Ipsum.
												</p>
											</Tab>
											<Tab eventKey="profile" title="Profile">
												<p className="mb-0">
													Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
													been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer
													took a galley of type and scrambled it to make a type specimen book. It has survived not only
													five centuries, but also the leap into electronic typesetting, remaining essentially unchanged
												</p>
											</Tab>
											<Tab eventKey="contact" title="Contact">
												<p className="mb-0">
													Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
													been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer
													took a galley of type and scrambled it to make a type specimen book. It has survived not only
													five centuries, but also the leap into electronic typesetting, remaining essentially
													unchanged. It was popularised in the 1960s with the release of Letraset sheets containLorem
													Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker
													including versions of Lorem Ipsum.
												</p>
											</Tab>
										</Tabs>
										{/* END Tabs */}
									</Portlet.Body>
								</Portlet>
								{/* END Portlet */}
							</Col>
							<Col md={4}>
								{/* BEGIN Portlet */}
								<Portlet noMargin>
									<Portlet.Body>
										{/* BEGIN Tabs */}
										<Tabs defaultActiveKey="home" id="basic-tab-2" variant="pills" className="mb-3">
											<Tab eventKey="home" title="Home">
												<p className="mb-0">
													It has survived not only five centuries, but also the leap into electronic typesetting,
													remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset
													sheets containing Lorem Ipsum passages, and more recently with desktop publishing software
													like Aldus PageMaker including versions of Lorem Ipsum.
												</p>
											</Tab>
											<Tab eventKey="profile" title="Profile">
												<p className="mb-0">
													Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
													been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer
													took a galley of type and scrambled it to make a type specimen book. It has survived not only
													five centuries, but also the leap into electronic typesetting, remaining essentially unchanged
												</p>
											</Tab>
											<Tab eventKey="contact" title="Contact">
												<p className="mb-0">
													Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
													been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer
													took a galley of type and scrambled it to make a type specimen book. It has survived not only
													five centuries, but also the leap into electronic typesetting, remaining essentially
													unchanged. It was popularised in the 1960s with the release of Letraset sheets containLorem
													Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker
													including versions of Lorem Ipsum.
												</p>
											</Tab>
										</Tabs>
										{/* END Tabs */}
									</Portlet.Body>
								</Portlet>
								{/* END Portlet */}
							</Col>
							<Col md={4}>
								{/* BEGIN Portlet */}
								<Portlet noMargin>
									<Portlet.Body>
										{/* BEGIN Tabs */}
										<Tabs defaultActiveKey="home" id="basic-tab-3" variant="tabs" className="mb-3">
											<Tab eventKey="home" title="Home">
												<p className="mb-0">
													It has survived not only five centuries, but also the leap into electronic typesetting,
													remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset
													sheets containing Lorem Ipsum passages, and more recently with desktop publishing software
													like Aldus PageMaker including versions of Lorem Ipsum.
												</p>
											</Tab>
											<Tab eventKey="profile" title="Profile">
												<p className="mb-0">
													Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
													been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer
													took a galley of type and scrambled it to make a type specimen book. It has survived not only
													five centuries, but also the leap into electronic typesetting, remaining essentially unchanged
												</p>
											</Tab>
											<Tab eventKey="contact" title="Contact">
												<p className="mb-0">
													Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
													been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer
													took a galley of type and scrambled it to make a type specimen book. It has survived not only
													five centuries, but also the leap into electronic typesetting, remaining essentially
													unchanged. It was popularised in the 1960s with the release of Letraset sheets containLorem
													Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker
													including versions of Lorem Ipsum.
												</p>
											</Tab>
										</Tabs>
										{/* END Tabs */}
									</Portlet.Body>
								</Portlet>
								{/* END Portlet */}
							</Col>
						</Row>
						{/* END Row */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header>
						<Portlet.Title>Portlet tab</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						{/* BEGIN Row */}
						<Row className="g-3">
							<Col md={4}>
								{/* BEGIN Tab Container */}
								<Tab.Container defaultActiveKey="home">
									{/* BEGIN Portlet */}
									<Portlet noMargin>
										<Portlet.Header bordered>
											<Portlet.Title>Portlet</Portlet.Title>
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
														It has survived not only five centuries, but also the leap into electronic typesetting,
														remaining essentially unchanged. It was popularised in the 1960s with the release of
														Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing
														software like Aldus PageMaker including versions of Lorem Ipsum.
													</p>
												</Tab.Pane>
												<Tab.Pane eventKey="profile">
													<p className="mb-0">
														Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
														been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer
														took a galley of type and scrambled it to make a type specimen book. It has survived not
														only five centuries, but also the leap into electronic typesetting, remaining essentially
														unchanged
													</p>
												</Tab.Pane>
												<Tab.Pane eventKey="contact">
													<p className="mb-0">
														Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
														been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer
														took a galley of type and scrambled it to make a type specimen book. It has survived not
														only five centuries, but also the leap into electronic typesetting, remaining essentially
														unchanged. It was popularised in the 1960s with the release of Letraset sheets containLorem
														Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker
														including versions of Lorem Ipsum.
													</p>
												</Tab.Pane>
											</Tab.Content>
											{/* END Tabs */}
										</Portlet.Body>
									</Portlet>
									{/* END Portlet */}
								</Tab.Container>
								{/* END Tab Container */}
							</Col>
							<Col md={4}>
								{/* BEGIN Tab Container */}
								<Tab.Container defaultActiveKey="home">
									{/* BEGIN Portlet */}
									<Portlet noMargin>
										<Portlet.Header bordered>
											<Portlet.Title>Portlet</Portlet.Title>
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
														It has survived not only five centuries, but also the leap into electronic typesetting,
														remaining essentially unchanged. It was popularised in the 1960s with the release of
														Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing
														software like Aldus PageMaker including versions of Lorem Ipsum.
													</p>
												</Tab.Pane>
												<Tab.Pane eventKey="profile">
													<p className="mb-0">
														Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
														been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer
														took a galley of type and scrambled it to make a type specimen book. It has survived not
														only five centuries, but also the leap into electronic typesetting, remaining essentially
														unchanged
													</p>
												</Tab.Pane>
												<Tab.Pane eventKey="contact">
													<p className="mb-0">
														Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
														been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer
														took a galley of type and scrambled it to make a type specimen book. It has survived not
														only five centuries, but also the leap into electronic typesetting, remaining essentially
														unchanged. It was popularised in the 1960s with the release of Letraset sheets containLorem
														Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker
														including versions of Lorem Ipsum.
													</p>
												</Tab.Pane>
											</Tab.Content>
											{/* END Tabs */}
										</Portlet.Body>
									</Portlet>
									{/* END Portlet */}
								</Tab.Container>
								{/* END Tab Container */}
							</Col>
							<Col md={4}>
								{/* BEGIN Tab Container */}
								<Tab.Container defaultActiveKey="home">
									{/* BEGIN Portlet */}
									<Portlet noMargin>
										<Portlet.Header bordered>
											<Portlet.Title>Portlet</Portlet.Title>
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
														It has survived not only five centuries, but also the leap into electronic typesetting,
														remaining essentially unchanged. It was popularised in the 1960s with the release of
														Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing
														software like Aldus PageMaker including versions of Lorem Ipsum.
													</p>
												</Tab.Pane>
												<Tab.Pane eventKey="profile">
													<p className="mb-0">
														Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
														been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer
														took a galley of type and scrambled it to make a type specimen book. It has survived not
														only five centuries, but also the leap into electronic typesetting, remaining essentially
														unchanged
													</p>
												</Tab.Pane>
												<Tab.Pane eventKey="contact">
													<p className="mb-0">
														Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
														been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer
														took a galley of type and scrambled it to make a type specimen book. It has survived not
														only five centuries, but also the leap into electronic typesetting, remaining essentially
														unchanged. It was popularised in the 1960s with the release of Letraset sheets containLorem
														Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker
														including versions of Lorem Ipsum.
													</p>
												</Tab.Pane>
											</Tab.Content>
											{/* END Tabs */}
										</Portlet.Body>
									</Portlet>
									{/* END Portlet */}
								</Tab.Container>
								{/* END Tab Container */}
							</Col>
						</Row>
						{/* END Row */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header>
						<Portlet.Title>Card tab</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						{/* BEGIN Row */}
						<Row className="g-3">
							<Col md={4}>
								{/* BEGIN Tab Container */}
								<Tab.Container defaultActiveKey="home">
									{/* BEGIN Card */}
									<Card>
										<Card.Header>
											{/* BEGIN Nav */}
											<Nav variant="lines">
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
										</Card.Header>
										<Card.Body>
											{/* BEGIN Tabs */}
											<Tab.Content>
												<Tab.Pane eventKey="home">
													<p className="mb-0">
														It has survived not only five centuries, but also the leap into electronic typesetting,
														remaining essentially unchanged. It was popularised in the 1960s with the release of
														Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing
														software like Aldus PageMaker including versions of Lorem Ipsum.
													</p>
												</Tab.Pane>
												<Tab.Pane eventKey="profile">
													<p className="mb-0">
														Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
														been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer
														took a galley of type and scrambled it to make a type specimen book. It has survived not
														only five centuries, but also the leap into electronic typesetting, remaining essentially
														unchanged
													</p>
												</Tab.Pane>
												<Tab.Pane eventKey="contact">
													<p className="mb-0">
														Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
														been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer
														took a galley of type and scrambled it to make a type specimen book. It has survived not
														only five centuries, but also the leap into electronic typesetting, remaining essentially
														unchanged. It was popularised in the 1960s with the release of Letraset sheets containLorem
														Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker
														including versions of Lorem Ipsum.
													</p>
												</Tab.Pane>
											</Tab.Content>
											{/* END Tabs */}
										</Card.Body>
									</Card>
									{/* END Card */}
								</Tab.Container>
								{/* END Tab Container */}
							</Col>
							<Col md={4}>
								{/* BEGIN Tab Container */}
								<Tab.Container defaultActiveKey="home">
									{/* BEGIN Card */}
									<Card>
										<Card.Header>
											{/* BEGIN Nav */}
											<Nav variant="pills">
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
										</Card.Header>
										<Card.Body>
											{/* BEGIN Tabs */}
											<Tab.Content>
												<Tab.Pane eventKey="home">
													<p className="mb-0">
														It has survived not only five centuries, but also the leap into electronic typesetting,
														remaining essentially unchanged. It was popularised in the 1960s with the release of
														Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing
														software like Aldus PageMaker including versions of Lorem Ipsum.
													</p>
												</Tab.Pane>
												<Tab.Pane eventKey="profile">
													<p className="mb-0">
														Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
														been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer
														took a galley of type and scrambled it to make a type specimen book. It has survived not
														only five centuries, but also the leap into electronic typesetting, remaining essentially
														unchanged
													</p>
												</Tab.Pane>
												<Tab.Pane eventKey="contact">
													<p className="mb-0">
														Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
														been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer
														took a galley of type and scrambled it to make a type specimen book. It has survived not
														only five centuries, but also the leap into electronic typesetting, remaining essentially
														unchanged. It was popularised in the 1960s with the release of Letraset sheets containLorem
														Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker
														including versions of Lorem Ipsum.
													</p>
												</Tab.Pane>
											</Tab.Content>
											{/* END Tabs */}
										</Card.Body>
									</Card>
									{/* END Card */}
								</Tab.Container>
								{/* END Tab Container */}
							</Col>
							<Col md={4}>
								{/* BEGIN Tab Container */}
								<Tab.Container defaultActiveKey="home">
									{/* BEGIN Card */}
									<Card>
										<Card.Header>
											{/* BEGIN Nav */}
											<Nav variant="tabs">
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
										</Card.Header>
										<Card.Body>
											{/* BEGIN Tabs */}
											<Tab.Content>
												<Tab.Pane eventKey="home">
													<p className="mb-0">
														It has survived not only five centuries, but also the leap into electronic typesetting,
														remaining essentially unchanged. It was popularised in the 1960s with the release of
														Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing
														software like Aldus PageMaker including versions of Lorem Ipsum.
													</p>
												</Tab.Pane>
												<Tab.Pane eventKey="profile">
													<p className="mb-0">
														Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
														been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer
														took a galley of type and scrambled it to make a type specimen book. It has survived not
														only five centuries, but also the leap into electronic typesetting, remaining essentially
														unchanged
													</p>
												</Tab.Pane>
												<Tab.Pane eventKey="contact">
													<p className="mb-0">
														Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
														been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer
														took a galley of type and scrambled it to make a type specimen book. It has survived not
														only five centuries, but also the leap into electronic typesetting, remaining essentially
														unchanged. It was popularised in the 1960s with the release of Letraset sheets containLorem
														Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker
														including versions of Lorem Ipsum.
													</p>
												</Tab.Pane>
											</Tab.Content>
											{/* END Tabs */}
										</Card.Body>
									</Card>
									{/* END Card */}
								</Tab.Container>
								{/* END Tab Container */}
							</Col>
						</Row>
						{/* END Row */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

TabPage.pageTitle = 'Tab'
TabPage.activeLink = 'elements.base.tab'
TabPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Base' },
	{ text: 'Tab', link: '/elements/base/tab' },
]

export default withAuth(TabPage)
