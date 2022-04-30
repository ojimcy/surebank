import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Alert, AlertProps } from '@blueupcode/components'
import { faArchive, faCog, faWrench } from '@fortawesome/free-solid-svg-icons'
import { faStar } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const AlertPage: ExtendedNextPage = () => {
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
								<strong>Alerts</strong> are available for any length of text, as well as an optional dismiss button. For
								proper styling, use one of the eight <strong>required</strong> contextual classes
							</p>
							{/* BEGIN Row */}
							<Row className="g-3">
								<Col md={4}>
									{/* BEGIN Portlet */}
									<Portlet noMargin>
										<Portlet.Header bordered>
											<Portlet.Title>Solid</Portlet.Title>
										</Portlet.Header>
										<Portlet.Body className="pb-0">
											<p>
												Use <code>variant</code> property to apply contextual colors
											</p>
											{['primary', 'secondary', 'info', 'warning', 'danger', 'success', 'dark', 'light'].map(
												(variant, index) => (
													<Alert key={index} variant={variant}>
														This is a {variant} alert—check it out!
													</Alert>
												)
											)}
										</Portlet.Body>
									</Portlet>
									{/* END Portlet */}
								</Col>
								<Col md={4}>
									{/* BEGIN Portlet */}
									<Portlet noMargin>
										<Portlet.Header bordered>
											<Portlet.Title>Outline</Portlet.Title>
										</Portlet.Header>
										<Portlet.Body className="pb-0">
											<p>
												Fill <code>variant</code> property with <code>outline-(color)</code> to apply these variants
											</p>
											{[
												'outline-primary',
												'outline-secondary',
												'outline-info',
												'outline-warning',
												'outline-danger',
												'outline-success',
												'outline-dark',
												'outline-light',
											].map((variant, index) => (
												<Alert key={index} variant={variant}>
													This is a {variant} alert—check it out!
												</Alert>
											))}
										</Portlet.Body>
									</Portlet>
									{/* END Portlet */}
								</Col>
								<Col md={4}>
									{/* BEGIN Portlet */}
									<Portlet noMargin>
										<Portlet.Header bordered>
											<Portlet.Title>Label</Portlet.Title>
										</Portlet.Header>
										<Portlet.Body className="pb-0">
											<p>
												Fill <code>variant</code> property with <code>label-(color)</code> to apply these variants
											</p>
											{[
												'label-primary',
												'label-secondary',
												'label-info',
												'label-warning',
												'label-danger',
												'label-success',
												'label-dark',
												'label-light',
											].map((variant, index) => (
												<Alert key={index} variant={variant}>
													This is a {variant} alert—check it out!
												</Alert>
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
							<Portlet.Title>Links</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body className="pb-0">
							<p>
								For links, use the <code>&lt;Alert.Link&gt;</code> component to provide matching colored links within
								any alert.
							</p>
							{['primary', 'outline-secondary', 'label-success'].map((variant, index) => (
								<Alert key={index} variant={variant}>
									This is a {variant} alert with <Alert.Link href="#">an example link</Alert.Link>. Give it a click if
									you like.
								</Alert>
							))}
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>Additional content</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body className="pb-0">
							<p>Alerts can also contain additional HTML elements like headings, paragraphs and dividers.</p>
							<Alert variant="success">
								<Alert.Heading>Well done!</Alert.Heading>
								<p className="mb-0">
									Aww yeah, you successfully read this important alert message. This example text is going to run a bit
									longer so that you can see how spacing within an alert works with this kind of content.
								</p>
							</Alert>
							<Alert variant="outline-success">
								<Alert.Heading>Well done!</Alert.Heading>
								<p>
									Aww yeah, you successfully read this important alert message. This example text is going to run a bit
									longer so that you can see how spacing within an alert works with this kind of content.
								</p>
								<hr />
								<p className="mb-0">
									Whenever you need to, be sure to use margin utilities to keep things nice and tidy.
								</p>
							</Alert>
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
				</Col>
				<Col md={6}>
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>Icon</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body className="pb-0">
							<p>
								If you want to add icon into your <code>&lt;Alert&gt;</code> element, you can fill <code>icon</code>{' '}
								property with your icon element.
							</p>
							{[
								{ variant: 'primary', icon: faArchive },
								{ variant: 'outline-secondary', icon: faWrench },
								{ variant: 'label-success', icon: faStar },
							].map((data, index) => (
								<Alert key={index} variant={data.variant} icon={<FontAwesomeIcon icon={data.icon} />}>
									This is a {data.variant} alert with <Alert.Link href="#">an example link</Alert.Link>. Give it a click
									if you like.
								</Alert>
							))}
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>Dismissible alert</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body className="pb-0">
							<p>
								Add the <code>dismissible</code> prop to add a functioning dismiss button to the Alert.
							</p>
							<AlertDismissible variant="success" icon={<FontAwesomeIcon icon={faStar} />}>
								<strong>Holy guacamole!</strong> You should check in on some of those fields below.
							</AlertDismissible>
							<AlertDismissible variant="outline-warning">
								<strong>Holy guacamole!</strong> You should check in on some of those fields below.
							</AlertDismissible>
							<AlertDismissible variant="label-secondary" icon={<FontAwesomeIcon icon={faCog} />}>
								<Alert.Heading>Well done!</Alert.Heading>
								<p>
									Aww yeah, you successfully read this important alert message. This example text is going to run a bit
									longer so that you can see how spacing within an alert works with this kind of content.
								</p>
								<hr />
								<p className="mb-0">
									Whenever you need to, be sure to use margin utilities to keep things nice and tidy.
								</p>
							</AlertDismissible>
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
				</Col>
			</Row>
		</>
	)
}

const AlertDismissible = (props: AlertProps) => {
	const [show, setShow] = React.useState(true)

	return <Alert dismissible show={show} onClose={() => setShow(false)} {...props} />
}

AlertPage.pageTitle = 'Alert'
AlertPage.activeLink = 'elements.base.alert'
AlertPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Base' },
	{ text: 'Alert', link: '/elements/base/alert' },
]

export default withAuth(AlertPage)
