import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, GridNav } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faAddressCard,
	faBell,
	faCalendarCheck,
	faClone,
	faComments,
	faStickyNote,
} from '@fortawesome/free-regular-svg-icons'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const GridNavPage: ExtendedNextPage = () => {
	return (
		<>
			<Row>
				<Col>
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>Variations</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body>
							<p>
								<strong>Grid Nav</strong> has 3 versions of the border, like example below
							</p>
							{/* BEGIN Row */}
							<Row className="g-3">
								<Col md={4}>
									{/* BEGIN Portlet */}
									<Portlet noMargin>
										<Portlet.Header bordered>
											<Portlet.Title>Basic</Portlet.Title>
										</Portlet.Header>
										<Portlet.Body>
											<p>Default version of grid navigation</p>
											{/* BEGIN Grid Nav */}
											<GridNav>
												<GridNav.Row>
													<GridNav.Item icon={<FontAwesomeIcon icon={faAddressCard} />}>Profile</GridNav.Item>
													<GridNav.Item icon={<FontAwesomeIcon icon={faComments} />}>Messages</GridNav.Item>
													<GridNav.Item icon={<FontAwesomeIcon icon={faClone} />}>Activities</GridNav.Item>
												</GridNav.Row>
											</GridNav>
											{/* END Grid Nav */}
										</Portlet.Body>
									</Portlet>
									{/* END Portlet */}
								</Col>
								<Col md={4}>
									{/* BEGIN Portlet */}
									<Portlet noMargin>
										<Portlet.Header bordered>
											<Portlet.Title>Flush</Portlet.Title>
										</Portlet.Header>
										<Portlet.Body>
											<p>
												Add <code>flush</code> property to default grid navigation to appear like below
											</p>
											{/* BEGIN Grid Nav */}
											<GridNav flush>
												<GridNav.Row>
													<GridNav.Item icon={<FontAwesomeIcon icon={faAddressCard} />}>Profile</GridNav.Item>
													<GridNav.Item icon={<FontAwesomeIcon icon={faComments} />}>Messages</GridNav.Item>
													<GridNav.Item icon={<FontAwesomeIcon icon={faClone} />}>Activities</GridNav.Item>
												</GridNav.Row>
											</GridNav>
											{/* END Grid Nav */}
										</Portlet.Body>
									</Portlet>
									{/* END Portlet */}
								</Col>
								<Col md={4}>
									{/* BEGIN Portlet */}
									<Portlet noMargin>
										<Portlet.Header bordered>
											<Portlet.Title>Bordered</Portlet.Title>
										</Portlet.Header>
										<Portlet.Body>
											<p>
												Add <code>bordered</code> property to default grid navigation to appear like below
											</p>
											{/* BEGIN Grid Nav */}
											<GridNav bordered>
												<GridNav.Row>
													<GridNav.Item icon={<FontAwesomeIcon icon={faAddressCard} />}>Profile</GridNav.Item>
													<GridNav.Item icon={<FontAwesomeIcon icon={faComments} />}>Messages</GridNav.Item>
													<GridNav.Item icon={<FontAwesomeIcon icon={faClone} />}>Activities</GridNav.Item>
												</GridNav.Row>
											</GridNav>
											{/* END Grid Nav */}
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
							<Portlet.Title>More content</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body>
							<p>
								You can add multiple rows and more content by using <code>GridNav.Title</code> and{' '}
								<code>GridNav.Subtitle</code>
							</p>
							{/* BEGIN Grid Nav */}
							<GridNav bordered>
								<GridNav.Row>
									<GridNav.Item icon={<FontAwesomeIcon icon={faAddressCard} />}>
										<GridNav.Title>Profile</GridNav.Title>
										<GridNav.Subtitle>Edit your profile</GridNav.Subtitle>
									</GridNav.Item>
									<GridNav.Item icon={<FontAwesomeIcon icon={faComments} />}>
										<GridNav.Title>Messages</GridNav.Title>
										<GridNav.Subtitle>Check new messages</GridNav.Subtitle>
									</GridNav.Item>
									<GridNav.Item icon={<FontAwesomeIcon icon={faClone} />}>
										<GridNav.Title>Activities</GridNav.Title>
										<GridNav.Subtitle>Show last activity</GridNav.Subtitle>
									</GridNav.Item>
								</GridNav.Row>
								<GridNav.Row>
									<GridNav.Item icon={<FontAwesomeIcon icon={faCalendarCheck} />}>
										<GridNav.Title>Tasks</GridNav.Title>
										<GridNav.Subtitle>Remind my tasks</GridNav.Subtitle>
									</GridNav.Item>
									<GridNav.Item icon={<FontAwesomeIcon icon={faStickyNote} />}>
										<GridNav.Title>Notes</GridNav.Title>
										<GridNav.Subtitle>Show my notes</GridNav.Subtitle>
									</GridNav.Item>
									<GridNav.Item icon={<FontAwesomeIcon icon={faBell} />}>
										<GridNav.Title>Notification</GridNav.Title>
										<GridNav.Subtitle>Check all notification</GridNav.Subtitle>
									</GridNav.Item>
								</GridNav.Row>
							</GridNav>
							{/* END Grid Nav */}
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
				</Col>
				<Col md={6}>
					{/* BEGIN Portlet */}
					<Portlet>
						<Portlet.Header bordered>
							<Portlet.Title>Action</Portlet.Title>
						</Portlet.Header>
						<Portlet.Body>
							<p>
								Apply hover and focus states by adding <code>action</code> property. Use <code>active</code> property to
								appear clicked effect to individual link and use <code>disabled</code> property for disabled appearance.
							</p>
							{/* BEGIN Grid Nav */}
							<GridNav bordered action>
								<GridNav.Row>
									<GridNav.Item icon={<FontAwesomeIcon icon={faAddressCard} />} active>
										<GridNav.Title>Profile</GridNav.Title>
										<GridNav.Subtitle>Edit your profile</GridNav.Subtitle>
									</GridNav.Item>
									<GridNav.Item icon={<FontAwesomeIcon icon={faComments} />} disabled>
										<GridNav.Title>Messages</GridNav.Title>
										<GridNav.Subtitle>Check new messages</GridNav.Subtitle>
									</GridNav.Item>
									<GridNav.Item icon={<FontAwesomeIcon icon={faClone} />}>
										<GridNav.Title>Activities</GridNav.Title>
										<GridNav.Subtitle>Show last activity</GridNav.Subtitle>
									</GridNav.Item>
								</GridNav.Row>
								<GridNav.Row>
									<GridNav.Item icon={<FontAwesomeIcon icon={faCalendarCheck} />}>
										<GridNav.Title>Tasks</GridNav.Title>
										<GridNav.Subtitle>Remind my tasks</GridNav.Subtitle>
									</GridNav.Item>
									<GridNav.Item icon={<FontAwesomeIcon icon={faStickyNote} />}>
										<GridNav.Title>Notes</GridNav.Title>
										<GridNav.Subtitle>Show my notes</GridNav.Subtitle>
									</GridNav.Item>
									<GridNav.Item icon={<FontAwesomeIcon icon={faBell} />}>
										<GridNav.Title>Notification</GridNav.Title>
										<GridNav.Subtitle>Check all notification</GridNav.Subtitle>
									</GridNav.Item>
								</GridNav.Row>
							</GridNav>
							{/* END Grid Nav */}
						</Portlet.Body>
					</Portlet>
					{/* END Portlet */}
				</Col>
			</Row>
		</>
	)
}

GridNavPage.pageTitle = 'Grid Navigation'
GridNavPage.activeLink = 'elements.advanced.grid-nav'
GridNavPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Base' },
	{ text: 'Grid Navigation', link: '/elements/base/grid-nav' },
]

export default withAuth(GridNavPage)
