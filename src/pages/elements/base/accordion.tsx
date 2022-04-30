import React from 'react'
import withAuth from 'components/auth/withAuth'
import { faBell, faBookmark, faPaperPlane } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Row, Col, Accordion, Portlet } from '@blueupcode/components'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const AccordionPage: ExtendedNextPage = () => {
	return (
		<Row>
			<Col>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Accordion</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>Build vertically collapsing accordions in combination with the Collapse component.</p>
						<p>
							If you want your <code>Accordion</code> to start in a fully-collapsed state, then simply don&apos;t pass
							in a <code>defaultActiveKey</code> prop to <code>Accordion</code>.
						</p>
						<p>
							Add <code>flush</code> to remove the default background-color, some borders, and some rounded corners to
							render accordions edge-to-edge with their parent container.
						</p>
						{/* BEGIN Row */}
						<Row className="gy-3">
							<Col sm={6}>
								{/* BEGIN Accordion */}
								<Accordion defaultActiveKey="0">
									<Accordion.Item eventKey="0">
										<Accordion.Header icon={() => <FontAwesomeIcon icon={faPaperPlane} />}>
											Accordion Item #1
										</Accordion.Header>
										<Accordion.Body>
											<strong>Lorem ipsum dolor sit amet</strong>, consectetur adipiscing elit, sed do eiusmod tempor
											incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
											ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
											voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
											proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
										</Accordion.Body>
									</Accordion.Item>
									<Accordion.Item eventKey="1">
										<Accordion.Header icon={() => <FontAwesomeIcon icon={faBookmark} />}>
											Accordion Item #2
										</Accordion.Header>
										<Accordion.Body>
											<strong>Lorem ipsum dolor sit amet</strong>, consectetur adipiscing elit, sed do eiusmod tempor
											incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
											ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
											voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
											proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
										</Accordion.Body>
									</Accordion.Item>
									<Accordion.Item eventKey="2">
										<Accordion.Header icon={() => <FontAwesomeIcon icon={faBell} />}>
											Accordion Item #3
										</Accordion.Header>
										<Accordion.Body>
											<strong>Lorem ipsum dolor sit amet</strong>, consectetur adipiscing elit, sed do eiusmod tempor
											incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
											ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
											voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
											proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
										</Accordion.Body>
									</Accordion.Item>
								</Accordion>
								{/* END Accordion */}
							</Col>
							<Col sm={6}>
								{/* BEGIN Accordion */}
								<Accordion flush defaultActiveKey="0">
									<Accordion.Item eventKey="0">
										<Accordion.Header icon={() => <FontAwesomeIcon icon={faPaperPlane} />}>
											Accordion Item #1
										</Accordion.Header>
										<Accordion.Body>
											<strong>Lorem ipsum dolor sit amet</strong>, consectetur adipiscing elit, sed do eiusmod tempor
											incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
											ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
											voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
											proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
										</Accordion.Body>
									</Accordion.Item>
									<Accordion.Item eventKey="1">
										<Accordion.Header icon={() => <FontAwesomeIcon icon={faBookmark} />}>
											Accordion Item #2
										</Accordion.Header>
										<Accordion.Body>
											<strong>Lorem ipsum dolor sit amet</strong>, consectetur adipiscing elit, sed do eiusmod tempor
											incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
											ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
											voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
											proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
										</Accordion.Body>
									</Accordion.Item>
									<Accordion.Item eventKey="2">
										<Accordion.Header icon={() => <FontAwesomeIcon icon={faBell} />}>
											Accordion Item #3
										</Accordion.Header>
										<Accordion.Body>
											<strong>Lorem ipsum dolor sit amet</strong>, consectetur adipiscing elit, sed do eiusmod tempor
											incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
											ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
											voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
											proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
										</Accordion.Body>
									</Accordion.Item>
								</Accordion>
								{/* END Accordion */}
							</Col>
						</Row>
						{/* END Row */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

AccordionPage.pageTitle = 'Accordion'
AccordionPage.activeLink = 'elements.base.accordion'
AccordionPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Base' },
	{ text: 'Accordion', link: '/elements/base/accordion' },
]

export default withAuth(AccordionPage)
