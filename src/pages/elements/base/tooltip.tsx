import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Button, FormLabel, OverlayTrigger, Tooltip } from '@blueupcode/components'
import type { Placement } from '@blueupcode/components/types'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const TooltipPage: ExtendedNextPage = () => {
	return (
		<Row>
			<Col>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Tooltip examples</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						{/* BEGIN Grid */}
						<div className="d-grid gap-3">
							{/* BEGIN Row */}
							<Row>
								<FormLabel column sm={4} lg={3} className="text-sm-end">
									Basic tooltip
								</FormLabel>
								<Col sm={8} lg={9}>
									<OverlayTrigger placement="top" overlay={Tooltip1}>
										<Button variant="primary">Hover me</Button>
									</OverlayTrigger>
								</Col>
							</Row>
							{/* END Row */}
							{/* BEGIN Row */}
							<Row>
								<FormLabel column sm={4} lg={3} className="text-sm-end">
									Placements
								</FormLabel>
								<Col sm={8} lg={9}>
									<div className="mb-2">
										{[
											{ placement: 'top', text: 'Top' },
											{ placement: 'bottom', text: 'Bottom' },
											{ placement: 'right', text: 'right' },
											{ placement: 'left', text: 'Left' },
										].map((data, index) => (
											<OverlayTrigger
												key={index}
												placement={data.placement as Placement}
												overlay={<Tooltip id={`tooltip-${data.placement}`}>{data.text} content</Tooltip>}
											>
												<Button variant="primary" className="me-2">
													{data.text}
												</Button>
											</OverlayTrigger>
										))}
									</div>
									<p className="mb-0">
										Set <code>placement</code> property with <code>top|bottom|right|left</code> to change tooltip
										placement
									</p>
								</Col>
							</Row>
							{/* END Row */}
							{/* BEGIN Row */}
							<Row>
								<FormLabel column sm={4} lg={3} className="text-sm-end">
									HTML Content
								</FormLabel>
								<Col sm={8} lg={9}>
									<div className="mb-2">
										<OverlayTrigger placement="top" overlay={Tooltip2}>
											<Button variant="primary">Hover me</Button>
										</OverlayTrigger>
									</div>
									<p className="mb-0">You can put HTML content inside tooltip elements</p>
								</Col>
							</Row>
							{/* END Row */}
							{/* BEGIN Row */}
							<Row>
								<FormLabel column sm={4} lg={3} className="text-sm-end">
									Trigger on click
								</FormLabel>
								<Col sm={8} lg={9}>
									<div className="mb-2">
										<OverlayTrigger trigger="focus" placement="top" overlay={Tooltip1}>
											<Button variant="primary">Hover me</Button>
										</OverlayTrigger>
									</div>
									<p className="mb-0">Change tooltip trigger to focus</p>
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

const Tooltip1 = <Tooltip id="tooltip-1">Tooltip content</Tooltip>

const Tooltip2 = (
	<Tooltip id="tooltip-2">
		content <b>bold</b> and <em>italic</em>
	</Tooltip>
)

TooltipPage.pageTitle = 'Tooltip'
TooltipPage.activeLink = 'elements.base.tooltip'
TooltipPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Base' },
	{ text: 'Tooltip', link: '/elements/base/tooltip' },
]

export default withAuth(TooltipPage)
