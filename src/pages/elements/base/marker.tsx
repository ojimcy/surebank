import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Marker, Button } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import type { MarkerVariant, MarkerType } from '@blueupcode/components/marker/Marker'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const MarkerPage: ExtendedNextPage = () => {
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
							<p>
								<strong>Marker</strong> is component that you can use for marking something with shape and color, you
								can combine it with many components. Marker by default has 3 different shapes, like the examples below.
								Change marker color by applying <code>variant</code> property.
							</p>
							{/* BEGIN Row */}
							<Row className="g-3">
								<Col md={4}>
									{/* BEGIN Portlet */}
									<Portlet noMargin>
										<Portlet.Header bordered>
											<Portlet.Title>Dot</Portlet.Title>
										</Portlet.Header>
										<Portlet.Body>
											<p>
												Apply <code>type=&quot;dot&quot;</code> property for this shape
											</p>
											{/* BEGIN Markers */}
											{['primary', 'secondary', 'info', 'success', 'warning', 'danger', 'dark', 'light'].map(
												(variant, index) => (
													<Marker key={index} variant={variant as MarkerVariant} type="dot" />
												)
											)}
											{/* END Markers */}
										</Portlet.Body>
									</Portlet>
									{/* END Portlet */}
								</Col>
								<Col md={4}>
									{/* BEGIN Portlet */}
									<Portlet noMargin>
										<Portlet.Header bordered>
											<Portlet.Title>Circle</Portlet.Title>
										</Portlet.Header>
										<Portlet.Body>
											<p>
												Apply <code>type=&quot;circle&quot;</code> property for this shape
											</p>
											{/* BEGIN Markers */}
											{['primary', 'secondary', 'info', 'success', 'warning', 'danger', 'dark', 'light'].map(
												(variant, index) => (
													<Marker key={index} variant={variant as MarkerVariant} type="circle" />
												)
											)}
											{/* END Markers */}
										</Portlet.Body>
									</Portlet>
									{/* END Portlet */}
								</Col>
								<Col md={4}>
									{/* BEGIN Portlet */}
									<Portlet noMargin>
										<Portlet.Header bordered>
											<Portlet.Title>Pill</Portlet.Title>
										</Portlet.Header>
										<Portlet.Body>
											<p>
												Apply <code>type=&quot;pill&quot;</code> property for this shape
											</p>
											{/* BEGIN Markers */}
											{['primary', 'secondary', 'info', 'success', 'warning', 'danger', 'dark', 'light'].map(
												(variant, index) => (
													<Marker key={index} variant={variant as MarkerVariant} type="pill" />
												)
											)}
											{/* END Markers */}
										</Portlet.Body>
									</Portlet>
									{/* END Portlet */}
								</Col>
							</Row>
							{/* BEGIN Row */}
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
							<Portlet.Title>Sizing</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body>
							<p>
								Change marker size to smaller or larger by setting <code>size</code> property with <code>sm|lg</code>
							</p>
							{/* BEGIN Markers */}
							{['dot', 'circle', 'pill'].map((type, index) => (
								<React.Fragment key={index}>
									<Marker variant="primary" type={type as MarkerType} size="sm" />
									<Marker variant="success" type={type as MarkerType} />
									<Marker variant="danger" type={type as MarkerType} size="lg" />
								</React.Fragment>
							))}
							{/* END Markers */}
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
				</Col>
				<Col md={6}>
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>Usage</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body>
							<p>You can use marker with several elements together.</p>
							<Button variant="primary">
								Button
								<Button.Marker>
									<Marker type="dot" variant="success" />
								</Button.Marker>
							</Button>{' '}
							<Button icon variant="primary">
								<FontAwesomeIcon icon={faStar} />
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

MarkerPage.pageTitle = 'Marker'
MarkerPage.activeLink = 'elements.base.marker'
MarkerPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Base' },
	{ text: 'Marker', link: '/elements/base/marker' },
]

export default withAuth(MarkerPage)
