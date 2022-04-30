import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Card, Placeholder } from '@blueupcode/components'
import type { PlaceholderVariant } from '@blueupcode/components/placeholder/usePlaceholder'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const PlaceholderPage: ExtendedNextPage = () => {
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
							Placeholders can be used to enhance the experience of your application. They&apos;re built only with
							HTML and CSS, meaning you don&apos;t need any JavaScript to create them. You will, however, need some
							custom JavaScript to toggle their visibility. Their appearance, color, and sizing can be easily
							customized with our utility classes.
						</p>
						<Card>
							<Card.Body>
								<Placeholder as={Card.Title} animation="glow">
									<Placeholder xs={6} />
								</Placeholder>
								<Placeholder as={Card.Text} animation="glow">
									<Placeholder xs={7} />
									<Placeholder xs={4} />
									<Placeholder xs={4} />
									<Placeholder xs={6} />
									<Placeholder xs={8} />
								</Placeholder>
								<Placeholder.Button variant="primary" xs={6} />
							</Card.Body>
						</Card>
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Color</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							By default, the <code>Placeholder</code> uses <code>currentColor</code>. This can be overriden with a
							custom color or utility class.
						</p>
						{/* BEGIN Portlet */}
						<Portlet noMargin>
							<Portlet.Body>
								<Placeholder xs={12} />
								{['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'].map(
									(variant, index) => (
										<Placeholder key={index} bg={variant as PlaceholderVariant} xs={12} />
									)
								)}
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
			<Col md={6}>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Width</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							You can change the <code>width</code> through grid column classes, width utilities, or inline styles.
						</p>
						{/* BEGIN Portlet */}
						<Portlet noMargin>
							<Portlet.Body>
								<Placeholder xs={6} /> <Placeholder className="w-75" /> <Placeholder style={{ width: '25%' }} />
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
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
							The size of <code>Placeholder</code>s are based on the typographic style of the parent element.
							Customize them with sizing props: <code>lg</code>, <code>sm</code>, or <code>xs</code>.
						</p>
						{/* BEGIN Portlet */}
						<Portlet noMargin>
							<Portlet.Body>
								<Placeholder xs={12} size="lg" />
								<Placeholder xs={12} />
								<Placeholder xs={12} size="sm" />
								<Placeholder xs={12} size="xs" />
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Animation</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Animate placeholders by setting the prop <code>animation</code> to <code>glow</code> or{' '}
							<code>wave</code> to better convey the perception of something being <em>actively</em> loaded.
						</p>
						{/* BEGIN Portlet */}
						<Portlet noMargin>
							<Portlet.Body>
								<Placeholder as="div" animation="glow">
									<Placeholder xs={12} />
								</Placeholder>
								<Placeholder as="div" animation="wave">
									<Placeholder xs={12} />
								</Placeholder>
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

PlaceholderPage.pageTitle = 'Placeholder'
PlaceholderPage.activeLink = 'elements.base.placeholder'
PlaceholderPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Base' },
	{ text: 'Placeholder', link: '/elements/base/placeholder' },
]

export default withAuth(PlaceholderPage)
