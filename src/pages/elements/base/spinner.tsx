import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Button, Spinner } from '@blueupcode/components'
import type { SpinnerVariant } from '@blueupcode/components/spinner/Spinner'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const SpinnerPage: ExtendedNextPage = () => {
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
								<strong>Spinners</strong> can be used to show the loading state in your projects. You can customize the
								color with text color utilities
							</p>
							{/* BEGIN Row */}
							<Row className="g-3">
								<Col md={6}>
									{/* BEGIN Portlet */}
									<Portlet noMargin>
										<Portlet.Header bordered>
											<Portlet.Title>Border spinner</Portlet.Title>
										</Portlet.Header>
										<Portlet.Body>
											{/* BEGIN Spinners */}
											{['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'].map(
												(variant, index) => (
													<React.Fragment key={index}>
														<Spinner animation="border" variant={variant as SpinnerVariant} />{' '}
													</React.Fragment>
												)
											)}
										</Portlet.Body>
									</Portlet>
									{/* END Portlet */}
								</Col>
								<Col md={6}>
									{/* BEGIN Portlet */}
									<Portlet noMargin>
										<Portlet.Header bordered>
											<Portlet.Title>Border spinner</Portlet.Title>
										</Portlet.Header>
										<Portlet.Body>
											{/* BEGIN Spinners */}
											{['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'].map(
												(variant, index) => (
													<React.Fragment key={index}>
														<Spinner animation="grow" variant={variant as SpinnerVariant} />{' '}
													</React.Fragment>
												)
											)}
											{/* END Spinners */}
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
							<Portlet.Title>Sizing</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body>
							<p>
								Using <code>size</code> property to make a smaller spinner or, use custom CSS or inline styles to change
								the dimensions as needed.
							</p>
							{/* BEGIN Spinners */}
							<Spinner animation="border" size="sm" /> <Spinner animation="grow" size="sm" />{' '}
							<Spinner animation="border" style={{ height: '3rem', width: '3rem' }} />{' '}
							<Spinner animation="grow" style={{ height: '3rem', width: '3rem' }} />
							{/* END Spinners */}
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
				</Col>
				<Col md={6}>
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>Buttons</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body>
							<p>Use spinners within buttons to indicate an action is currently processing or taking place</p>
							{/* BEGIN Button with spinner */}
							<Button variant="primary" disabled>
								<Spinner animation="border" size="sm" />
							</Button>{' '}
							<Button variant="primary" disabled>
								<Spinner animation="border" size="sm" className="me-2" />
								Loading...
							</Button>{' '}
							<Button variant="primary" disabled>
								<Spinner animation="grow" size="sm" />
							</Button>{' '}
							<Button variant="primary" disabled>
								<Spinner animation="grow" size="sm" className="me-2" />
								Loading...
							</Button>
							{/* END Button with spinner */}
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
				</Col>
			</Row>
		</>
	)
}

SpinnerPage.pageTitle = 'Spinner'
SpinnerPage.activeLink = 'elements.base.spinner'
SpinnerPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Base' },
	{ text: 'Spinner', link: '/elements/base/spinner' },
]

export default withAuth(SpinnerPage)
