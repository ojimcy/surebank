import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, ListGroup, FormCheck, Badge } from '@blueupcode/components'
import Link from 'next/link'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const ListGroupPage: ExtendedNextPage = () => {
	return (
		<Row>
			<Col md={6}>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Variation</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							List groups are a flexible and powerful component for displaying a series of content. Modify and extend
							them to support just about any content within.
						</p>
						<p>
							Add the <code>flush</code> variant to remove outer borders and rounded corners to render list group items
							edge-to-edge in a parent container.
						</p>
						{/* BEGIN Row */}
						<Row className="g-3">
							<Col sm={6}>
								{/* BEGIN Portlet */}
								<Portlet noMargin>
									<Portlet.Header>
										<Portlet.Title>Default</Portlet.Title>
									</Portlet.Header>
									<Portlet.Body>
										{/* BEGIN List Group */}
										<ListGroup>
											<ListGroup.Item>An item</ListGroup.Item>
											<ListGroup.Item>A second item</ListGroup.Item>
											<ListGroup.Item>A third item</ListGroup.Item>
											<ListGroup.Item>A fourth item</ListGroup.Item>
											<ListGroup.Item>And a fifth one</ListGroup.Item>
										</ListGroup>
										{/* END List Group */}
									</Portlet.Body>
								</Portlet>
								{/* END Portlet */}
							</Col>
							<Col sm={6}>
								{/* BEGIN Portlet */}
								<Portlet noMargin>
									<Portlet.Header>
										<Portlet.Title>Flush</Portlet.Title>
									</Portlet.Header>
									<Portlet.Body>
										{/* BEGIN List Group */}
										<ListGroup variant="flush">
											<ListGroup.Item>An item</ListGroup.Item>
											<ListGroup.Item>A second item</ListGroup.Item>
											<ListGroup.Item>A third item</ListGroup.Item>
											<ListGroup.Item>A fourth item</ListGroup.Item>
											<ListGroup.Item>And a fifth one</ListGroup.Item>
										</ListGroup>
										{/* END List Group */}
									</Portlet.Body>
								</Portlet>
								{/* END Portlet */}
							</Col>
						</Row>
						{/* BEGIN Row */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Contextual color</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Use contextual variants on <code>&lt;ListGroup.Item&gt;</code>s to style them with a stateful background
							and color.
						</p>
						{/* BEGIN List Group */}
						<ListGroup>
							<ListGroup.Item href="#" action>
								A simple default list group item
							</ListGroup.Item>
							<ListGroup.Item href="#" variant="primary" action>
								A simple primary list group item
							</ListGroup.Item>
							<ListGroup.Item href="#" variant="secondary" action>
								A simple secondary list group item
							</ListGroup.Item>
							<ListGroup.Item href="#" variant="success" action>
								A simple success list group item
							</ListGroup.Item>
							<ListGroup.Item href="#" variant="danger" action>
								A simple danger list group item
							</ListGroup.Item>
							<ListGroup.Item href="#" variant="warning" action>
								A simple warning list group item
							</ListGroup.Item>
							<ListGroup.Item href="#" variant="info" action>
								A simple info list group item
							</ListGroup.Item>
							<ListGroup.Item href="#" variant="light" action>
								A simple light list group item
							</ListGroup.Item>
							<ListGroup.Item href="#" variant="dark" action>
								A simple dark list group item
							</ListGroup.Item>
						</ListGroup>
						{/* END List Group */}
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
							Use the <code>horizontal</code> prop to make the ListGroup render horizontally. Currently{' '}
							<strong>horizontal list groups cannot be combined with flush list groups.</strong>
						</p>
						<p>
							There are responsive variants to <code>horizontal</code>: setting it to <code>{'{sm|md|lg|xl|xxl}'}</code>{' '}
							makes the list group horizontal starting at that breakpoint&apos;s <code>min-width</code>.
						</p>
						{/* BEGIN List Group */}
						<ListGroup horizontal>
							<ListGroup.Item>Cras justo odio</ListGroup.Item>
							<ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
							<ListGroup.Item>Morbi leo risus</ListGroup.Item>
						</ListGroup>
						{/* END List Group */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Checkboxes and radios</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>Place Bootstrap&apos;s checkboxes and radios within list group items and customize as needed.</p>
						{/* BEGIN List Group */}
						<ListGroup>
							<ListGroup.Item>
								<FormCheck.Input type="checkbox" className="me-2" />
								First checkbox
							</ListGroup.Item>
							<ListGroup.Item>
								<FormCheck.Input type="checkbox" className="me-2" />
								Second checkbox
							</ListGroup.Item>
							<ListGroup.Item>
								<FormCheck.Input type="checkbox" className="me-2" />
								Third checkbox
							</ListGroup.Item>
							<ListGroup.Item>
								<FormCheck.Input type="checkbox" className="me-2" />
								Fourth checkbox
							</ListGroup.Item>
							<ListGroup.Item>
								<FormCheck.Input type="checkbox" className="me-2" />
								Fifth checkbox
							</ListGroup.Item>
						</ListGroup>
						{/* END List Group */}
						<p className="mt-3">
							And if you want <code>&lt;label&gt;</code>s as the <code>ListGroup.Item</code> for large hit areas, you
							can do that, too.
						</p>
						{/* BEGIN List Group */}
						<ListGroup>
							<ListGroup.Item as="label">
								<FormCheck.Input type="radio" name="list-group-radios" className="me-2" />
								First radio
							</ListGroup.Item>
							<ListGroup.Item as="label">
								<FormCheck.Input type="radio" name="list-group-radios" className="me-2" />
								Second radio
							</ListGroup.Item>
							<ListGroup.Item as="label">
								<FormCheck.Input type="radio" name="list-group-radios" className="me-2" />
								Third radio
							</ListGroup.Item>
							<ListGroup.Item as="label">
								<FormCheck.Input type="radio" name="list-group-radios" className="me-2" />
								Fourth radio
							</ListGroup.Item>
							<ListGroup.Item as="label">
								<FormCheck.Input type="radio" name="list-group-radios" className="me-2" />
								Fifth radio
							</ListGroup.Item>
						</ListGroup>
						{/* END List Group */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
			<Col md={6}>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Links and buttons</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Toggle the <code>action</code> prop to create <em>actionable</em> list group items, with disabled, hover
							and active styles. List item actions will render a <code>&lt;button&gt;</code> or <code>&lt;a&gt;</code>{' '}
							(depending on the presence of an <code>href</code>) by default but can be overridden by setting the{' '}
							<code>as</code> prop as usual.
						</p>
						<p>
							List items <code>actions</code> are distinct from plain items to ensure that click or tap affordances
							aren&apos;t applied to non-interactive items.
						</p>
						{/* BEGIN Row */}
						<Row className="g-3">
							<Col sm={6}>
								{/* BEGIN Portlet */}
								<Portlet noMargin>
									<Portlet.Header>
										<Portlet.Title>Links</Portlet.Title>
									</Portlet.Header>
									<Portlet.Body>
										{/* BEGIN List Group */}
										<ListGroup>
											<ListGroup.Item as="a" href="#" action active>
												The current link item
											</ListGroup.Item>
											<ListGroup.Item as="a" href="#" action>
												A second link item
											</ListGroup.Item>
											<ListGroup.Item as="a" href="#" action>
												A third link item
											</ListGroup.Item>
											<ListGroup.Item as="a" href="#" action>
												A fourth link item
											</ListGroup.Item>
											<ListGroup.Item as="a" action disabled>
												A disabled link item
											</ListGroup.Item>
										</ListGroup>
										{/* END List Group */}
									</Portlet.Body>
								</Portlet>
								{/* END Portlet */}
							</Col>
							<Col sm={6}>
								{/* BEGIN Portlet */}
								<Portlet noMargin>
									<Portlet.Header>
										<Portlet.Title>Buttons</Portlet.Title>
									</Portlet.Header>
									<Portlet.Body>
										{/* BEGIN List Group */}
										<ListGroup>
											<ListGroup.Item as="button" action active>
												The current link item
											</ListGroup.Item>
											<ListGroup.Item as="button" action>
												A second link item
											</ListGroup.Item>
											<ListGroup.Item as="button" action>
												A third link item
											</ListGroup.Item>
											<ListGroup.Item as="button" action>
												A fourth link item
											</ListGroup.Item>
											<ListGroup.Item as="button" action disabled>
												A disabled link item
											</ListGroup.Item>
										</ListGroup>
										{/* END List Group */}
									</Portlet.Body>
								</Portlet>
								{/* END Portlet */}
							</Col>
						</Row>
						{/* BEGIN Row */}
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
							Set the <code>active</code> prop to indicate the list groups current active selection.
						</p>
						<p>
							Set the <code>disabled</code> prop to prevent actions on a <code>&lt;ListGroup.Item&gt;</code>. For
							elements that aren&apos;t naturally disable-able (like anchors) <code>onClick</code> handlers are added
							that call <code>preventDefault</code> to mimick disabled behavior.
						</p>
						{/* BEGIN List Group */}
						<ListGroup>
							<ListGroup.Item action active>
								An active item
							</ListGroup.Item>
							<ListGroup.Item action disabled>
								A disabled item
							</ListGroup.Item>
							<ListGroup.Item action>A third item</ListGroup.Item>
							<ListGroup.Item action>A fourth item</ListGroup.Item>
							<ListGroup.Item action>And a fifth one</ListGroup.Item>
						</ListGroup>
						{/* END List Group */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Numbered</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Add the <code>numbered</code> prop to opt into numbered list group items. Numbers are generated via CSS
							(as opposed to a <code>&lt;ol&gt;</code>s default browser styling) for better placement inside list group
							items and to allow for better customization.
						</p>
						{/* BEGIN List Group */}
						<ListGroup as="ol" numbered>
							<ListGroup.Item as="li">A list item</ListGroup.Item>
							<ListGroup.Item as="li">A list item</ListGroup.Item>
							<ListGroup.Item as="li">A list item</ListGroup.Item>
						</ListGroup>
						{/* END List Group */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Badges</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Add <Link href="/elements/base/badge">badges</Link> to any list group item to show unread counts,
							activity, and more with the help of some <strong>utilities</strong>.
						</p>
						{/* BEGIN List Group */}
						<ListGroup>
							<ListGroup.Item className="d-flex justify-content-between align-items-center">
								A list item
								<Badge variant="primary" pill>
									14
								</Badge>
							</ListGroup.Item>
							<ListGroup.Item className="d-flex justify-content-between align-items-center">
								A second list item
								<Badge variant="primary" pill>
									2
								</Badge>
							</ListGroup.Item>
							<ListGroup.Item className="d-flex justify-content-between align-items-center">
								A third list item
								<Badge variant="primary" pill>
									1
								</Badge>
							</ListGroup.Item>
						</ListGroup>
						{/* END List Group */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Additional content</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Add nearly any HTML within, even for linked list groups like the one below, with the help of{' '}
							<strong>flexbox utilities</strong>.
						</p>
						{/* BEGIN List Group */}
						<ListGroup>
							<ListGroup.Item href="#" action active>
								<div className="d-flex w-100 justify-content-between">
									<h5 className="mb-1">List group item heading</h5>
									<small>3 days ago</small>
								</div>
								<p className="mb-1">Some placeholder content in a paragraph.</p>
								<small>And some small print.</small>
							</ListGroup.Item>
							<ListGroup.Item href="#" action>
								<div className="d-flex w-100 justify-content-between">
									<h5 className="mb-1">List group item heading</h5>
									<small className="text-muted">3 days ago</small>
								</div>
								<p className="mb-1">Some placeholder content in a paragraph.</p>
								<small className="text-muted">And some muted small print.</small>
							</ListGroup.Item>
							<ListGroup.Item href="#" action>
								<div className="d-flex w-100 justify-content-between">
									<h5 className="mb-1">List group item heading</h5>
									<small className="text-muted">3 days ago</small>
								</div>
								<p className="mb-1">Some placeholder content in a paragraph.</p>
								<small className="text-muted">And some muted small print.</small>
							</ListGroup.Item>
						</ListGroup>
						{/* END List Group */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

ListGroupPage.pageTitle = 'List Group'
ListGroupPage.activeLink = 'elements.base.list-group'
ListGroupPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Base' },
	{ text: 'List Group', link: '/elements/base/list-group' },
]

export default withAuth(ListGroupPage)
