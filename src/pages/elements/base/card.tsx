import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Card, ListGroup, Nav, Button, Image, Badge, CardGroup } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog, faStar } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const CardPage: ExtendedNextPage = () => {
	return (
		<>
			<Row>
				<Col md={6}>
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>Basic</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body>
							<p>
								<strong>Card</strong> is a flexible and extensible content container. It includes options for headers
								and footers, a wide variety of content, contextual background colors, and powerful display options.
							</p>
							<p>
								Cards support a wide variety of content, including images, text, list groups, links, and more. Below are
								examples of what&apos;s supported.
							</p>
							<p>
								Use <code>&lt;Card.Body&gt;</code> to pad content inside a <code>&lt;Card&gt;</code>.
							</p>
							<p>
								Using <code>&lt;Card.Title&gt;</code>, <code>&lt;Card.Subtitle&gt;</code>, and
								<code>&lt;Card.Text&gt;</code> inside the <code>&lt;Card.Body&gt;</code> will line them up nicely.
								<code>&lt;Card.Link&gt;</code>s are used to line up links next to each other.
							</p>
							{/* BEGIN Row */}
							<Row xs={{ cols: 1 }} md={{ cols: 2 }} className="g-3">
								<Col>
									{/* BEGIN Card */}
									<Card>
										<Card.Img variant="top" src="/images/banner/760x480.webp" />
										<Card.Body>
											<Card.Title>Card title</Card.Title>
											<Card.Text>
												Some quick example text to build on the card title and make up the bulk of the card&apos;s
												content.
											</Card.Text>
											<Button variant="primary">Go somewhere</Button>
										</Card.Body>
									</Card>
									{/* END Card */}
								</Col>
								<Col>
									{/* BEGIN Card */}
									<Card body>
										<Card.Title>Card title</Card.Title>
										<Card.Subtitle className="mb-2 text-muted">Card subtitle</Card.Subtitle>
										<Card.Text>
											Some quick example text to build on the card title and make up the bulk of the card&apos;s
											content.
										</Card.Text>
										<Card.Link href="#">Card link</Card.Link>
										<Card.Link href="#">Another link</Card.Link>
									</Card>
									{/* END Card */}
								</Col>
							</Row>
							{/* END Row */}
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>List group</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body>
							<p>
								Mix and match multiple content types to create the card you need, or throw everything in there. Shown
								below are image styles, blocks, text styles, and a list group—all wrapped in a fixed-width card.
							</p>
							{/* BEGIN Row */}
							<Row className="g-3">
								<Col sm={6}>
									{/* BEGIN Grid */}
									<div className="d-grid gap-3">
										{/* BEGIN Card */}
										<Card>
											<ListGroup variant="flush">
												<ListGroup.Item>Cras justo odio</ListGroup.Item>
												<ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
												<ListGroup.Item>Vestibulum at eros</ListGroup.Item>
											</ListGroup>
										</Card>
										{/* END Card */}
										{/* BEGIN Card */}
										<Card>
											<Card.Header>Featured</Card.Header>
											<ListGroup variant="flush">
												<ListGroup.Item>Cras justo odio</ListGroup.Item>
												<ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
											</ListGroup>
										</Card>
										{/* END Card */}
										{/* BEGIN Card */}
										<Card>
											<ListGroup variant="flush">
												<ListGroup.Item>Cras justo odio</ListGroup.Item>
												<ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
											</ListGroup>
											<Card.Footer>Card footer</Card.Footer>
										</Card>
										{/* END Card */}
									</div>
									{/* END Grid */}
								</Col>
								<Col sm={6}>
									{/* BEGIN Card */}
									<Card>
										<Card.Img variant="top" src="/images/banner/760x480.webp" />
										<Card.Body>
											<Card.Title>Card title</Card.Title>
											<Card.Text>
												Some quick example text to build on the card title and make up the bulk of the card&apos;s
												content.
											</Card.Text>
										</Card.Body>
										<ListGroup variant="flush">
											<ListGroup.Item>An item</ListGroup.Item>
											<ListGroup.Item>A second item</ListGroup.Item>
											<ListGroup.Item>A third item</ListGroup.Item>
										</ListGroup>
										<Card.Body>
											<Card.Link href="#">Card link</Card.Link>
											<Card.Link href="#">Another link</Card.Link>
										</Card.Body>
									</Card>
									{/* END Card */}
								</Col>
							</Row>
							{/* END Row */}
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>Navigation</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body>
							<p>
								Add some navigation to a card’s header (or block) with <Link href="/elements/base/nav">nav</Link>.
							</p>
							{/* BEGIN Grid */}
							<div className="d-grid gap-3">
								{/* BEGIN Card */}
								<Card className="text-center">
									<Card.Header>
										{/* BEGIN Nav */}
										<Nav variant="tabs" defaultActiveKey="link-1">
											<Nav.Item>
												<Nav.Link eventKey="link-1">Active</Nav.Link>
											</Nav.Item>
											<Nav.Item>
												<Nav.Link eventKey="link-2">Link</Nav.Link>
											</Nav.Item>
											<Nav.Item>
												<Nav.Link eventKey="link-3" disabled>
													Disabled
												</Nav.Link>
											</Nav.Item>
										</Nav>
										{/* END Nav */}
									</Card.Header>
									<Card.Body>
										<Card.Title>Special title treatment</Card.Title>
										<Card.Text>With supporting text below as a natural lead-in to additional content.</Card.Text>
										<Button variant="primary">Go somewhere</Button>
									</Card.Body>
								</Card>
								{/* END Card */}
								{/* BEGIN Card */}
								<Card className="text-center">
									<Card.Header>
										{/* BEGIN Nav */}
										<Nav variant="pills" defaultActiveKey="link-1">
											<Nav.Item>
												<Nav.Link eventKey="link-1">Active</Nav.Link>
											</Nav.Item>
											<Nav.Item>
												<Nav.Link eventKey="link-2">Link</Nav.Link>
											</Nav.Item>
											<Nav.Item>
												<Nav.Link eventKey="link-3" disabled>
													Disabled
												</Nav.Link>
											</Nav.Item>
										</Nav>
										{/* END Nav */}
									</Card.Header>
									<Card.Body>
										<Card.Title>Special title treatment</Card.Title>
										<Card.Text>With supporting text below as a natural lead-in to additional content.</Card.Text>
										<Button variant="primary">Go somewhere</Button>
									</Card.Body>
								</Card>
								{/* END Card */}
								{/* BEGIN Card */}
								<Card className="text-center">
									<Card.Header>
										{/* BEGIN Nav */}
										<Nav variant="lines" defaultActiveKey="link-1">
											<Nav.Item>
												<Nav.Link eventKey="link-1">Active</Nav.Link>
											</Nav.Item>
											<Nav.Item>
												<Nav.Link eventKey="link-2">Link</Nav.Link>
											</Nav.Item>
											<Nav.Item>
												<Nav.Link eventKey="link-3" disabled>
													Disabled
												</Nav.Link>
											</Nav.Item>
										</Nav>
										{/* END Nav */}
									</Card.Header>
									<Card.Body>
										<Card.Title>Special title treatment</Card.Title>
										<Card.Text>With supporting text below as a natural lead-in to additional content.</Card.Text>
										<Button variant="primary">Go somewhere</Button>
									</Card.Body>
								</Card>
								{/* END Card */}
							</div>
							{/* END Grid */}
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>Horizontal</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body>
							<p>
								Using a combination of grid and utility classes, cards can be made horizontal in a mobile-friendly and
								responsive way. In the example below, we remove the grid gutters with <code>.g-0</code> and use{' '}
								<code>.col-md-*</code> classes to make the card horizontal at the <code>md</code> breakpoint. Further
								adjustments may be needed depending on your card content.
							</p>
							{/* BEGIN Card */}
							<Card>
								<Row className="g-0">
									<Col md={4}>
										<Image fluid className="rounded-start" src="/images/banner/760x480.webp" alt="Card image" />
									</Col>
									<Col md={8}>
										<Card.Body>
											<Card.Title>Card title</Card.Title>
											<Card.Text>
												This is a wider card with supporting text below as a natural lead-in to additional content. This
												content is a little bit longer.
											</Card.Text>
											<Card.Text>
												<small className="text-muted">Last updated 3 mins ago</small>
											</Card.Text>
										</Card.Body>
									</Col>
								</Row>
							</Card>
							{/* END Card */}
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
				</Col>
				<Col md={6}>
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>Image</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body>
							<p>
								<code>Card.Img</code> with <code>top</code> property places an image to the top of the card. With{' '}
								<code>Card.Text</code>, text can be added to the card. Text within <code>Card.Text</code> can also be
								styled with the standard HTML tags.
							</p>
							<p>
								Similar to headers and footers, cards can include top and bottom “image caps”—images at the top or
								bottom of a card.
							</p>
							{/* BEGIN Row */}
							<Row xs={{ cols: 1 }} md={{ cols: 2 }} className="g-3 mb-3">
								<Col>
									{/* BEGIN Card */}
									<Card>
										<Card.Img variant="top" src="/images/banner/760x480.webp" />
										<Card.Body>
											<Card.Title>Card title</Card.Title>
											<Card.Text>
												This is a wider card with supporting text below as a natural lead-in to additional content. This
												content is a little bit longer.
											</Card.Text>
											<Card.Text>
												<small className="text-muted">Last updated 3 mins ago</small>
											</Card.Text>
										</Card.Body>
									</Card>
									{/* END Card */}
								</Col>
								<Col>
									{/* BEGIN Card */}
									<Card>
										<Card.Body>
											<Card.Title>Card title</Card.Title>
											<Card.Text>
												This is a wider card with supporting text below as a natural lead-in to additional content. This
												content is a little bit longer.
											</Card.Text>
											<Card.Text>
												<small className="text-muted">Last updated 3 mins ago</small>
											</Card.Text>
										</Card.Body>
										<Card.Img variant="bottom" src="/images/banner/760x480.webp" />
									</Card>
									{/* END Card */}
								</Col>
							</Row>
							{/* END Row */}
							<p>
								Turn an image into a card background and overlay your card&apos;s text. Depending on the image, you may
								or may not need additional styles or utilities.
							</p>
							{/* BEGIN Card */}
							<Card>
								<Card.Img src="/images/banner/1120x480.webp" />
								<Card.ImgOverlay>
									<Card.Title className="text-white">Card title</Card.Title>
									<Card.Text className="text-white">
										This is a wider card with supporting text below as a natural lead-in to additional content. This
										content is a little bit longer.
									</Card.Text>
									<Card.Text className="text-white">Last updated 3 mins ago</Card.Text>
								</Card.ImgOverlay>
							</Card>
							{/* END Card */}
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>Header and footer</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body>
							<p>
								Add an optional header and/or footer within a card. Card header can be contain title, icon, or other
								elements.
							</p>
							{/* BEGIN Grid */}
							<div className="d-grid gap-3">
								{/* BEGIN Card */}
								<Card>
									<Card.Header>Header</Card.Header>
									<Card.Body>
										<Card.Title>Special title treatment</Card.Title>
										<Card.Text>With supporting text below as a natural lead-in to additional content.</Card.Text>
										<Button variant="primary">Go somewhere</Button>
									</Card.Body>
								</Card>
								{/* END Card */}
								{/* BEGIN Card */}
								<Card>
									<Card.Header>
										<Card.Icon>
											<FontAwesomeIcon icon={faCog} />
										</Card.Icon>
										<Card.Title>Header</Card.Title>
									</Card.Header>
									<Card.Body>
										<Card.Title>Special title treatment</Card.Title>
										<Card.Text>With supporting text below as a natural lead-in to additional content.</Card.Text>
										<Button variant="primary">Go somewhere</Button>
									</Card.Body>
									<Card.Footer className="text-muted">2 days ago</Card.Footer>
								</Card>
								{/* END Card */}
								{/* BEGIN Card */}
								<Card>
									<Card.Header>
										<Card.Icon>
											<FontAwesomeIcon icon={faStar} />
										</Card.Icon>
										<Card.Title>Header</Card.Title>
										<Card.Addon>
											<Badge variant="warning" pill>
												9+
											</Badge>
										</Card.Addon>
									</Card.Header>
									<Card.Body>
										<Card.Title>Special title treatment</Card.Title>
										<Card.Text>With supporting text below as a natural lead-in to additional content.</Card.Text>
										<Button variant="primary">Go somewhere</Button>
									</Card.Body>
									<Card.Footer className="text-muted">2 days ago</Card.Footer>
								</Card>
								{/* END Card */}
							</div>
							{/* END Grid */}
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>Alignment</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body>
							<p>
								You can quickly change the text alignment of any card—in its entirety or specific parts—with our{' '}
								<strong>text align classes</strong>.
							</p>
							{/* BEGIN Grid */}
							<div className="d-grid gap-3">
								{/* BEGIN Card */}
								<Card body className="text-start">
									<Card.Title>Special title treatment</Card.Title>
									<Card.Text>With supporting text below as a natural lead-in to additional content.</Card.Text>
									<Button variant="primary">Go somewhere</Button>
								</Card>
								{/* END Card */}
								{/* BEGIN Card */}
								<Card body className="text-center">
									<Card.Title>Special title treatment</Card.Title>
									<Card.Text>With supporting text below as a natural lead-in to additional content.</Card.Text>
									<Button variant="primary">Go somewhere</Button>
								</Card>
								{/* END Card */}
								{/* BEGIN Card */}
								<Card body className="text-end">
									<Card.Title>Special title treatment</Card.Title>
									<Card.Text>With supporting text below as a natural lead-in to additional content.</Card.Text>
									<Button variant="primary">Go somewhere</Button>
								</Card>
								{/* END Card */}
							</div>
							{/* END Grid */}
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
				</Col>
			</Row>
			<Row>
				<Col>
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>Card groups</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body>
							<p>
								Use card groups to render cards as a single, attached element with equal width and height columns. Card
								groups start off stacked and use <code>display: flex;</code> to become attached with uniform dimensions
								starting at the <code>sm</code> breakpoint.
							</p>
							{/* BEGIN Card Group */}
							<CardGroup>
								{/* BEGIN Card */}
								<Card>
									<Card.Img variant="top" src="/images/banner/760x480.webp" />
									<Card.Body>
										<Card.Title>Card title</Card.Title>
										<Card.Text>
											This is a wider card with supporting text below as a natural lead-in to additional content. This
											content is a little bit longer.
										</Card.Text>
									</Card.Body>
									<Card.Footer>
										<small className="text-muted">Last updated 3 mins ago</small>
									</Card.Footer>
								</Card>
								{/* END Card */}
								{/* BEGIN Card */}
								<Card>
									<Card.Img variant="top" src="/images/banner/760x480.webp" />
									<Card.Body>
										<Card.Title>Card title</Card.Title>
										<Card.Text>
											This card has supporting text below as a natural lead-in to additional content.
										</Card.Text>
									</Card.Body>
									<Card.Footer>
										<small className="text-muted">Last updated 3 mins ago</small>
									</Card.Footer>
								</Card>
								{/* END Card */}
								{/* BEGIN Card */}
								<Card>
									<Card.Img variant="top" src="/images/banner/760x480.webp" />
									<Card.Body>
										<Card.Title>Card title</Card.Title>
										<Card.Text>
											This is a wider card with supporting text below as a natural lead-in to additional content. This
											card has even longer content than the first to show that equal height action.
										</Card.Text>
									</Card.Body>
									<Card.Footer>
										<small className="text-muted">Last updated 3 mins ago</small>
									</Card.Footer>
								</Card>
								{/* END Card */}
							</CardGroup>
							{/* END Card Group */}
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>Card grid</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body>
							<p>
								Use the Bootstrap grid system and its <code>cols</code> property to control how many grid columns
								(wrapped around your cards) you show per row. For example, here&apos;s <code>cols: 1</code> laying out
								the cards on one column, and{' '}
								<code>
									md={`{{`} cols: 2 {`}}`}
								</code>{' '}
								splitting four cards to equal width across multiple rows, from the medium breakpoint up.
							</p>
							{/* BEGIN Card Group */}
							<Row xs={{ cols: 1 }} md={{ cols: 3 }} className="g-3">
								<Col>
									{/* BEGIN Card */}
									<Card className="h-100">
										<Card.Img variant="top" src="/images/banner/760x480.webp" />
										<Card.Body>
											<Card.Title>Card title</Card.Title>
											<Card.Text>
												This is a longer card with supporting text below as a natural lead-in to additional content.
												This content is a little bit longer.
											</Card.Text>
											<Card.Text>
												<small className="text-muted">Last updated 3 mins ago</small>
											</Card.Text>
										</Card.Body>
									</Card>
									{/* END Card */}
								</Col>
								<Col>
									{/* BEGIN Card */}
									<Card className="h-100">
										<Card.Img variant="top" src="/images/banner/760x480.webp" />
										<Card.Body>
											<Card.Title>Card title</Card.Title>
											<Card.Text>
												This card has supporting text below as a natural lead-in to additional content.
											</Card.Text>
											<Card.Text>
												<small className="text-muted">Last updated 3 mins ago</small>
											</Card.Text>
										</Card.Body>
									</Card>
									{/* END Card */}
								</Col>
								<Col>
									{/* BEGIN Card */}
									<Card className="h-100">
										<Card.Img variant="top" src="/images/banner/760x480.webp" />
										<Card.Body>
											<Card.Title>Card title</Card.Title>
											<Card.Text>
												This is a wider card with supporting text below as a natural lead-in to additional content. This
												card has even longer content than the first to show that equal height action.
											</Card.Text>
											<Card.Text>
												<small className="text-muted">Last updated 3 mins ago</small>
											</Card.Text>
										</Card.Body>
									</Card>
									{/* END Card */}
								</Col>
							</Row>
							{/* END Card Group */}
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
				</Col>
			</Row>
		</>
	)
}

CardPage.pageTitle = 'Card'
CardPage.activeLink = 'elements.base.card'
CardPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Base' },
	{ text: 'Card', link: '/elements/base/card' },
]

export default withAuth(CardPage)
