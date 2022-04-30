import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, FormLabel, Button, OverlayTrigger, Popover } from '@blueupcode/components'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const PopoverPage: ExtendedNextPage = () => {
	return (
		<Row>
			<Col>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Popover examples</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						{/* BEGIN Grid */}
						<div className="d-grid gap-3">
							{/* BEGIN Row */}
							<Row>
								<FormLabel column sm={4} lg={3} className="text-sm-end">
									Basic popover
								</FormLabel>
								<Col sm={8} lg={9}>
									<OverlayTrigger trigger="click" placement="right" overlay={Popover1}>
										<Button variant="primary">Click me</Button>
									</OverlayTrigger>
								</Col>
							</Row>
							{/* END Row */}
							{/* BEGIN Row */}
							<Row>
								<FormLabel column sm={4} lg={3} className="text-sm-end">
									Positions
								</FormLabel>
								<Col sm={8} lg={9}>
									<div className="mb-2">
										<OverlayTrigger trigger="click" placement="top" overlay={PopoverPosition}>
											<Button variant="primary" className="me-2">
												Top
											</Button>
										</OverlayTrigger>
										<OverlayTrigger trigger="click" placement="right" overlay={PopoverPosition}>
											<Button variant="primary" className="me-2">
												Right
											</Button>
										</OverlayTrigger>
										<OverlayTrigger trigger="click" placement="bottom" overlay={PopoverPosition}>
											<Button variant="primary" className="me-2">
												Bottom
											</Button>
										</OverlayTrigger>
										<OverlayTrigger trigger="click" placement="left" overlay={PopoverPosition}>
											<Button variant="primary">Left</Button>
										</OverlayTrigger>
									</div>
									<p className="mb-0">
										Set <code>placement</code> property to change the placement
									</p>
								</Col>
							</Row>
							{/* END Row */}
							{/* BEGIN Row */}
							<Row>
								<FormLabel column sm={4} lg={3} className="text-sm-end">
									Dismiss on next click
								</FormLabel>
								<Col sm={8} lg={9}>
									<div className="mb-2">
										<OverlayTrigger trigger="focus" placement="right" overlay={Popover1}>
											<Button variant="primary">Dismissible popover</Button>
										</OverlayTrigger>
									</div>
									<p className="mb-0">
										Use the <code>trigger=&quot;focus&quot;</code> property to dismiss popovers on the user&apos;s next
										click of a different element than the toggle element
									</p>
								</Col>
							</Row>
							{/* END Row */}
							{/* BEGIN Row */}
							<Row>
								<FormLabel column sm={4} lg={3} className="text-sm-end">
									HTML content
								</FormLabel>
								<Col sm={8} lg={9}>
									<div className="mb-2">
										<OverlayTrigger trigger="focus" placement="right" overlay={Popover3}>
											<Button variant="primary">Click me</Button>
										</OverlayTrigger>
									</div>
									<p className="mb-0">You can insert HTML content</p>
								</Col>
							</Row>
							{/* END Row */}
						</div>
						{/* END Grid */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

const Popover1 = (
	<Popover id="popover-1">
		<Popover.Header as="h3">Popover title</Popover.Header>
		<Popover.Body>And here&apos;s some amazing content. It&apos;s very engaging. Right?</Popover.Body>
	</Popover>
)

const PopoverPosition = (
	<Popover id="popover-w">
		<Popover.Body>Vivamus sagittis lacus vel augue laoreet rutrum faucibus.</Popover.Body>
	</Popover>
)

const Popover3 = (
	<Popover id="popover-3">
		<Popover.Header as="h3">Popover title</Popover.Header>
		<Popover.Body>
			And here&apos;s some amazing <b>HTML</b> content. It&apos;s very <code>engaging</code>. Right?
		</Popover.Body>
	</Popover>
)

PopoverPage.pageTitle = 'Popover'
PopoverPage.activeLink = 'elements.base.popover'
PopoverPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Base' },
	{ text: 'Popover', link: '/elements/base/popover' },
]

export default withAuth(PopoverPage)
