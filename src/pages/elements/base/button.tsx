import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Button, Marker } from '@blueupcode/components'
import { Anchor, Archive, Camera, Eye } from 'react-feather'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faAnchor,
	faBars,
	faCheck,
	faCog,
	faRocket,
	faStar,
	faTimes,
	faWrench,
} from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const ButtonPage: ExtendedNextPage = () => {
	return (
		<>
			<Row>
				<Col>
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>Variants</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body className="pb-0">
							{/* BEGIN Portlet */}
							<Portlet>
								<Portlet.Header bordered>
									<Portlet.Title>Solid</Portlet.Title>
								</Portlet.Header>
								<Portlet.Body>
									<p>
										These is a standard button variant, you can use it by setting <code>variant</code> property with
										contextual color
									</p>
									{[
										{ variant: 'primary', text: 'Primary' },
										{ variant: 'secondary', text: 'Secondary' },
										{ variant: 'success', text: 'Success' },
										{ variant: 'warning', text: 'Warning' },
										{ variant: 'danger', text: 'Danger' },
										{ variant: 'info', text: 'Info' },
										{ variant: 'dark', text: 'Dark' },
										{ variant: 'light', text: 'Light' },
									].map(({ variant, text }, index) => (
										<>
											<Button key={index} variant={variant}>
												{text}
											</Button>{' '}
										</>
									))}
								</Portlet.Body>
							</Portlet>
							{/* END Portlet */}
							{/* BEGIN Portlet */}
							<Portlet>
								<Portlet.Header bordered>
									<Portlet.Title>Outline</Portlet.Title>
								</Portlet.Header>
								<Portlet.Body>
									<p>
										Replace the default <code>variant</code> property value with <code>outline-(color)</code> to apply
										these variants
									</p>
									{[
										{ variant: 'outline-primary', text: 'Primary' },
										{ variant: 'outline-secondary', text: 'Secondary' },
										{ variant: 'outline-success', text: 'Success' },
										{ variant: 'outline-warning', text: 'Warning' },
										{ variant: 'outline-danger', text: 'Danger' },
										{ variant: 'outline-info', text: 'Info' },
										{ variant: 'outline-dark', text: 'Dark' },
										{ variant: 'outline-light', text: 'Light' },
									].map(({ variant, text }, index) => (
										<>
											<Button key={index} variant={variant}>
												{text}
											</Button>{' '}
										</>
									))}
								</Portlet.Body>
							</Portlet>
							{/* END Portlet */}
							{/* BEGIN Portlet */}
							<Portlet>
								<Portlet.Header bordered>
									<Portlet.Title>Flat</Portlet.Title>
								</Portlet.Header>
								<Portlet.Body>
									<p>
										Replace the default <code>variant</code> property value with <code>flat-(color)</code> to apply
										these variants
									</p>
									{[
										{ variant: 'flat-primary', text: 'Primary' },
										{ variant: 'flat-secondary', text: 'Secondary' },
										{ variant: 'flat-success', text: 'Success' },
										{ variant: 'flat-warning', text: 'Warning' },
										{ variant: 'flat-danger', text: 'Danger' },
										{ variant: 'flat-info', text: 'Info' },
										{ variant: 'flat-dark', text: 'Dark' },
										{ variant: 'flat-light', text: 'Light' },
									].map(({ variant, text }, index) => (
										<>
											<Button key={index} variant={variant}>
												{text}
											</Button>{' '}
										</>
									))}
								</Portlet.Body>
							</Portlet>
							{/* END Portlet */}
							{/* BEGIN Portlet */}
							<Portlet>
								<Portlet.Header bordered>
									<Portlet.Title>Label</Portlet.Title>
								</Portlet.Header>
								<Portlet.Body>
									<p>
										Replace the default <code>variant</code> property value with <code>label-(color)</code> to apply
										these variants
									</p>
									{[
										{ variant: 'label-primary', text: 'Primary' },
										{ variant: 'label-secondary', text: 'Secondary' },
										{ variant: 'label-success', text: 'Success' },
										{ variant: 'label-warning', text: 'Warning' },
										{ variant: 'label-danger', text: 'Danger' },
										{ variant: 'label-info', text: 'Info' },
										{ variant: 'label-dark', text: 'Dark' },
										{ variant: 'label-light', text: 'Light' },
									].map(({ variant, text }, index) => (
										<>
											<Button key={index} variant={variant}>
												{text}
											</Button>{' '}
										</>
									))}
								</Portlet.Body>
							</Portlet>
							{/* END Portlet */}
							{/* BEGIN Portlet */}
							<Portlet>
								<Portlet.Header bordered>
									<Portlet.Title>Text</Portlet.Title>
								</Portlet.Header>
								<Portlet.Body>
									<p>
										Replace the default <code>variant</code> property value with <code>text-(color)</code> to apply
										these variants
									</p>
									{[
										{ variant: 'text-primary', text: 'Primary' },
										{ variant: 'text-secondary', text: 'Secondary' },
										{ variant: 'text-success', text: 'Success' },
										{ variant: 'text-warning', text: 'Warning' },
										{ variant: 'text-danger', text: 'Danger' },
										{ variant: 'text-info', text: 'Info' },
										{ variant: 'text-dark', text: 'Dark' },
										{ variant: 'text-light', text: 'Light' },
									].map(({ variant, text }, index) => (
										<>
											<Button key={index} variant={variant}>
												{text}
											</Button>{' '}
										</>
									))}
								</Portlet.Body>
							</Portlet>
							{/* END Portlet */}
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
				</Col>
			</Row>
			<Row>
				<Col md={7}>
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>Pill buttons</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body>
							<p>
								Extend button element with <code>pill</code> property to make the button more rounded.
							</p>
							{[
								{ variant: 'label-primary', text: 'Primary' },
								{ variant: 'label-secondary', text: 'Secondary' },
								{ variant: 'outline-success', text: 'Success' },
								{ variant: 'outline-warning', text: 'Warning' },
								{ variant: 'flat-danger', text: 'Danger' },
								{ variant: 'flat-info', text: 'Info' },
								{ variant: 'dark', text: 'Dark' },
								{ variant: 'light', text: 'Light' },
							].map(({ variant, text }, index) => (
								<>
									<Button key={index} variant={variant} pill>
										{text}
									</Button>{' '}
								</>
							))}
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>Sizing</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body>
							<p>
								Make your button larger or smaller by setting <code>size</code> property with <code>sm|lg</code> to
								button.
							</p>
							<Button variant="primary" size="sm">
								Smaller
							</Button>{' '}
							<Button variant="secondary">Default</Button>{' '}
							<Button variant="success" size="lg">
								Larger
							</Button>{' '}
							<Button variant="dark" size="sm" pill>
								Smaller
							</Button>{' '}
							<Button variant="success" pill>
								Default
							</Button>{' '}
							<Button variant="info" size="lg" pill>
								Larger
							</Button>{' '}
							<Button variant="warning" size="sm" icon>
								<FontAwesomeIcon icon={faStar} />
							</Button>{' '}
							<Button variant="danger" icon>
								<FontAwesomeIcon icon={faCog} />
							</Button>{' '}
							<Button variant="info" size="lg" icon>
								<FontAwesomeIcon icon={faWrench} />
							</Button>{' '}
							<Button variant="warning" size="sm" icon circle>
								<FontAwesomeIcon icon={faRocket} />
							</Button>{' '}
							<Button variant="danger" icon circle>
								<FontAwesomeIcon icon={faAnchor} />
							</Button>{' '}
							<Button variant="info" size="lg" icon circle>
								<FontAwesomeIcon icon={faCheck} />
							</Button>
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>Taller, wider and block</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body className="pb-0">
							<p>
								You can&apos;t use the properties below together with <code>icon</code> property
							</p>
							{/* BEGIN Portlet */}
							<Portlet>
								<Portlet.Header bordered>
									<Portlet.Title>Wide</Portlet.Title>
								</Portlet.Header>
								<Portlet.Body>
									<p>
										Fill <code>width</code> property with <code>wide|wider|widest</code> to make your button wider
									</p>
									<Button variant="primary" width="wide">
										Wide
									</Button>{' '}
									<Button variant="primary" width="wider">
										Wider
									</Button>{' '}
									<Button variant="primary" width="widest">
										Widest
									</Button>
								</Portlet.Body>
							</Portlet>
							{/* END Portlet */}
							{/* BEGIN Portlet */}
							<Portlet>
								<Portlet.Header bordered>
									<Portlet.Title>Tall</Portlet.Title>
								</Portlet.Header>
								<Portlet.Body>
									<p>
										Fill <code>height</code> property with <code>tall|taller|tallest</code> to make your button taller
									</p>
									<Button variant="primary" height="tall">
										Tall
									</Button>{' '}
									<Button variant="primary" height="taller">
										Taller
									</Button>{' '}
									<Button variant="primary" height="tallest">
										Tallest
									</Button>
								</Portlet.Body>
							</Portlet>
							{/* END Portlet */}
							{/* BEGIN Portlet */}
							<Portlet>
								<Portlet.Header bordered>
									<Portlet.Title>Block</Portlet.Title>
								</Portlet.Header>
								<Portlet.Body>
									<p>
										Create responsive stacks of full-width, “block buttons” like those in Bootstrap 4 with a mix of our
										display and gap utilities.
									</p>
									<div className="d-grid gap-2">
										<Button variant="primary">Block</Button>
										<Button variant="label-primary">Block</Button>
									</div>
								</Portlet.Body>
							</Portlet>
							{/* END Portlet */}
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
				</Col>
				<Col md={5}>
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>Button icon</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body className="pb-0">
							{/* BEGIN Portlet */}
							<Portlet>
								<Portlet.Header bordered>
									<Portlet.Title>Square buttons</Portlet.Title>
								</Portlet.Header>
								<Portlet.Body>
									<p>
										If you need square button with an icon inside, you can use <code>icon</code> property.
									</p>
									<Button variant="secondary" icon>
										<Anchor />
									</Button>{' '}
									<Button variant="outline-success" icon>
										<Archive />
									</Button>{' '}
									<Button variant="outline-warning" icon>
										<Camera />
									</Button>{' '}
									<Button variant="outline-info" icon>
										<Eye />
									</Button>{' '}
									<Button variant="primary" icon>
										<FontAwesomeIcon icon={faTimes} />
									</Button>{' '}
									<Button variant="label-danger" icon>
										<FontAwesomeIcon icon={faWrench} />
									</Button>{' '}
									<Button variant="label-info" icon>
										<FontAwesomeIcon icon={faCog} />
									</Button>{' '}
									<Button variant="flat-primary" icon>
										<FontAwesomeIcon icon={faBars} />
									</Button>
								</Portlet.Body>
							</Portlet>
							{/* END Portlet */}
							{/* BEGIN Portlet */}
							<Portlet>
								<Portlet.Header bordered>
									<Portlet.Title>Circle buttons</Portlet.Title>
								</Portlet.Header>
								<Portlet.Body>
									<p>
										Make your icon buttons circular by extending button element with <code>circle</code> property.
									</p>
									<Button variant="secondary" icon circle>
										<Anchor />
									</Button>{' '}
									<Button variant="outline-success" icon circle>
										<Archive />
									</Button>{' '}
									<Button variant="outline-warning" icon circle>
										<Camera />
									</Button>{' '}
									<Button variant="outline-info" icon circle>
										<Eye />
									</Button>{' '}
									<Button variant="primary" icon circle>
										<FontAwesomeIcon icon={faTimes} />
									</Button>{' '}
									<Button variant="label-danger" icon circle>
										<FontAwesomeIcon icon={faWrench} />
									</Button>{' '}
									<Button variant="label-info" icon circle>
										<FontAwesomeIcon icon={faCog} />
									</Button>{' '}
									<Button variant="flat-primary" icon circle>
										<FontAwesomeIcon icon={faBars} />
									</Button>
								</Portlet.Body>
							</Portlet>
							{/* END Portlet */}
							{/* BEGIN Portlet */}
							<Portlet>
								<Portlet.Header bordered>
									<Portlet.Title>Icon with text</Portlet.Title>
								</Portlet.Header>
								<Portlet.Body>
									<p>
										If you want to use icon with text, you don&apos;t need to apply <code>icon</code> property
									</p>
									<Button variant="primary">
										<Eye className="me-2" />
										Button
									</Button>{' '}
									<Button variant="label-info">
										Button
										<Camera className="ms-2" />
									</Button>{' '}
									<Button variant="outline-danger">
										<FontAwesomeIcon icon={faCog} className="me-2" />
										Button
									</Button>{' '}
									<Button variant="flat-success">
										Button
										<FontAwesomeIcon icon={faCheck} className="ms-2" />
									</Button>
								</Portlet.Body>
							</Portlet>
							{/* END Portlet */}
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>States</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body>
							<p>
								Add <code>active</code> or <code>disabled</code> properties for the active or inactive button
								appearance.
							</p>
							<Button variant="primary" active>
								Active
							</Button>{' '}
							<Button variant="primary" disabled>
								Disabled
							</Button>
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>Addon</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body>
							<p>
								You can add a counter or marker to button by adding <code>Button.Marker</code> and{' '}
								<code>Button.Counter</code> element and combine with <Link href="/elements/base/badge">badge</Link> or{' '}
								<Link href="/elements/base/marker">marker</Link> component.
							</p>
							<Button variant="primary">
								Button
								<Button.Marker>
									<Button.Counter variant="secondary">12</Button.Counter>
								</Button.Marker>
							</Button>{' '}
							<Button variant="primary">
								Button
								<Button.Marker>
									<Button.Counter variant="secondary" pill>
										12
									</Button.Counter>
								</Button.Marker>
							</Button>{' '}
							<Button variant="primary">
								Button
								<Button.Marker>
									<Marker type="dot" variant="success" />
								</Button.Marker>
							</Button>{' '}
							<Button variant="primary" icon>
								<FontAwesomeIcon icon={faCog} />
								<Button.Marker>
									<Button.Counter variant="secondary">12</Button.Counter>
								</Button.Marker>
							</Button>{' '}
							<Button variant="primary" icon>
								<FontAwesomeIcon icon={faStar} />
								<Button.Marker>
									<Button.Counter variant="secondary" pill>
										12
									</Button.Counter>
								</Button.Marker>
							</Button>{' '}
							<Button variant="primary" icon>
								<FontAwesomeIcon icon={faWrench} />
								<Button.Marker>
									<Marker type="dot" variant="success" />
								</Button.Marker>
							</Button>
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
				</Col>
			</Row>
		</>
	)
}

ButtonPage.pageTitle = 'Button'
ButtonPage.activeLink = 'elements.base.button'
ButtonPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Base' },
	{ text: 'Breadcrumb', link: '/elements/base/breadcrumb' },
]

export default withAuth(ButtonPage)
