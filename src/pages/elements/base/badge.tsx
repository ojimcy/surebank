import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Badge, Button } from '@blueupcode/components'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const BadgePage: ExtendedNextPage = () => {
	return (
		<>
			<Row>
				<Col>
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>Basic</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body>
							{/* BEGIN Row */}
							<Row className="g-3">
								<Col md={6}>
									{/* BEGIN Portlet */}
									<Portlet noMargin>
										<Portlet.Header bordered>
											<Portlet.Title>Solid</Portlet.Title>
										</Portlet.Header>
										<Portlet.Body>
											<p>
												Use <code>variant</code> property to apply contextual colors
											</p>
											{[
												{ variant: 'primary', text: 'Primary' },
												{ variant: 'secondary', text: 'Secondary' },
												{ variant: 'success', text: 'Success' },
												{ variant: 'info', text: 'Info' },
												{ variant: 'warning', text: 'Warning' },
												{ variant: 'danger', text: 'Danger' },
												{ variant: 'dark', text: 'Dark' },
												{ variant: 'light', text: 'Light' },
											].map(({ variant, text }, index) => (
												<>
													<Badge key={index} variant={variant}>
														{text}
													</Badge>{' '}
												</>
											))}
										</Portlet.Body>
									</Portlet>
									{/* END Portlet */}
								</Col>
								<Col md={6}>
									{/* BEGIN Portlet */}
									<Portlet noMargin>
										<Portlet.Header bordered>
											<Portlet.Title>Label</Portlet.Title>
										</Portlet.Header>
										<Portlet.Body>
											<p>
												Fill <code>variant</code> property with <code>label-(color)</code> to apply these variants
											</p>
											{[
												{ variant: 'label-primary', text: 'Primary' },
												{ variant: 'label-secondary', text: 'Secondary' },
												{ variant: 'label-success', text: 'Success' },
												{ variant: 'label-info', text: 'Info' },
												{ variant: 'label-warning', text: 'Warning' },
												{ variant: 'label-danger', text: 'Danger' },
												{ variant: 'label-dark', text: 'Dark' },
												{ variant: 'label-light', text: 'Light' },
											].map(({ variant, text }, index) => (
												<>
													<Badge key={index} variant={variant}>
														{text}
													</Badge>{' '}
												</>
											))}
										</Portlet.Body>
									</Portlet>
									{/* END Portlet */}
								</Col>
								<Col md={6}>
									{/* BEGIN Portlet */}
									<Portlet noMargin>
										<Portlet.Header bordered>
											<Portlet.Title>Outline</Portlet.Title>
										</Portlet.Header>
										<Portlet.Body>
											<p>
												Fill <code>variant</code> property with <code>outline-(color)</code> to apply these variants
											</p>
											{[
												{ variant: 'outline-primary', text: 'Primary' },
												{ variant: 'outline-secondary', text: 'Secondary' },
												{ variant: 'outline-success', text: 'Success' },
												{ variant: 'outline-info', text: 'Info' },
												{ variant: 'outline-warning', text: 'Warning' },
												{ variant: 'outline-danger', text: 'Danger' },
												{ variant: 'outline-dark', text: 'Dark' },
												{ variant: 'outline-light', text: 'Light' },
											].map(({ variant, text }, index) => (
												<>
													<Badge key={index} variant={variant}>
														{text}
													</Badge>{' '}
												</>
											))}
										</Portlet.Body>
									</Portlet>
									{/* END Portlet */}
								</Col>
								<Col md={6}>
									{/* BEGIN Portlet */}
									<Portlet noMargin>
										<Portlet.Header bordered>
											<Portlet.Title>Text</Portlet.Title>
										</Portlet.Header>
										<Portlet.Body>
											<p>
												Fill <code>variant</code> property with <code>text-(color)</code> to apply these variants
											</p>
											{[
												{ variant: 'text-primary', text: 'Primary' },
												{ variant: 'text-secondary', text: 'Secondary' },
												{ variant: 'text-success', text: 'Success' },
												{ variant: 'text-info', text: 'Info' },
												{ variant: 'text-warning', text: 'Warning' },
												{ variant: 'text-danger', text: 'Danger' },
												{ variant: 'text-dark', text: 'Dark' },
												{ variant: 'text-light', text: 'Light' },
											].map(({ variant, text }, index) => (
												<>
													<Badge key={index} variant={variant}>
														{text}
													</Badge>{' '}
												</>
											))}
										</Portlet.Body>
									</Portlet>
									{/* END Portlet */}
								</Col>
							</Row>
							{/* END Row */}
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
				</Col>
			</Row>
			<Row>
				<Col md={6}>
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>Shaped badges</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body>
							<p>
								Make your badge into a circle or square shape by adding <code>circle</code> or <code>square</code>{' '}
								property.
							</p>
							{/* BEGIN Row */}
							<Row className="g-3">
								<Col md={6}>
									{/* BEGIN Portlet */}
									<Portlet noMargin>
										<Portlet.Header bordered>
											<Portlet.Title>Circle</Portlet.Title>
										</Portlet.Header>
										<Portlet.Body>
											{['primary', 'outline-secondary', 'warning', 'outline-danger'].map((variant, index) => (
												<>
													<Badge key={index} variant={variant} circle>
														A
													</Badge>{' '}
												</>
											))}
										</Portlet.Body>
									</Portlet>
									{/* END Portlet */}
								</Col>
								<Col md={6}>
									{/* BEGIN Portlet */}
									<Portlet noMargin>
										<Portlet.Header bordered>
											<Portlet.Title>Square</Portlet.Title>
										</Portlet.Header>
										<Portlet.Body>
											{['primary', 'outline-secondary', 'warning', 'outline-danger'].map((variant, index) => (
												<>
													<Badge key={index} variant={variant} square>
														A
													</Badge>{' '}
												</>
											))}
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
						<Portlet.Header bordered>
							<Portlet.Title>Pill badges</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body>
							<p>
								Add <code>pill</code> property to make badge element more rounded.
							</p>
							{[
								{ variant: 'primary', text: 'Primary' },
								{ variant: 'secondary', text: 'Secondary' },
								{ variant: 'success', text: 'Success' },
								{ variant: 'info', text: 'Info' },
								{ variant: 'warning', text: 'Warning' },
								{ variant: 'danger', text: 'Danger' },
								{ variant: 'dark', text: 'Dark' },
								{ variant: 'light', text: 'Light' },
							].map(({ variant, text }, index) => (
								<>
									<Badge key={index} variant={variant} pill>
										{text}
									</Badge>{' '}
								</>
							))}
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
				</Col>
				<Col md={6}>
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>Header</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body>
							<p>
								Badges scale to match the size of the immediate parent element by using relative font sizing and{' '}
								<code>em</code> units
							</p>
							<h3>
								Example heading <Badge variant="secondary">New</Badge>
							</h3>
							<h4>
								Example heading <Badge variant="secondary">New</Badge>
							</h4>
							<h5>
								Example heading <Badge variant="secondary">New</Badge>
							</h5>
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>Button</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body>
							<p>Badges can be used as part of links or buttons to provide a counter.</p>
							<Button variant="primary">
								Notification
								<Badge variant="secondary">+ 10</Badge>
							</Button>
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
				</Col>
			</Row>
		</>
	)
}

BadgePage.pageTitle = 'Badge'
BadgePage.activeLink = 'elements.base.badge'
BadgePage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Base' },
	{ text: 'Badge', link: '/elements/base/badge' },
]

export default withAuth(BadgePage)
