import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Badge, Nav, Caret } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArchive, faCog, faWrench } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const NavPage: ExtendedNextPage = () => {
	return (
		<Row>
			<Col md={6}>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Variation</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body className="pb-0">
						<p>
							Navigation bits in Bootstrap all share a general <code>Nav</code>
							component and styles. Swap <code>variant</code>s to switch between each style. The base <code>Nav</code>{' '}
							component is built with flexbox and provide a strong foundation for building all types of navigation
							components.
						</p>
						{/* BEGIN Portlet */}
						<Portlet>
							<Portlet.Header bordered>
								<Portlet.Title>Default</Portlet.Title>
							</Portlet.Header>
							<Portlet.Body>
								<p>This is basic example for nav components</p>
								{/* BEGIN Nav */}
								<Nav activeKey="link-1" onSelect={(selectedKey) => alert(`${selectedKey} clicked`)}>
									<Nav.Item>
										<Nav.Link eventKey="link-1">Active</Nav.Link>
									</Nav.Item>
									<Nav.Item>
										<Nav.Link eventKey="link-2">Link</Nav.Link>
									</Nav.Item>
									<Nav.Item>
										<Nav.Link eventKey="link-3">Link</Nav.Link>
									</Nav.Item>
									<Nav.Item>
										<Nav.Link eventKey="link-4" disabled>
											Disabled
										</Nav.Link>
									</Nav.Item>
								</Nav>
								{/* END Nav */}
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
						{/* BEGIN Portlet */}
						<Portlet>
							<Portlet.Header bordered>
								<Portlet.Title>Pill</Portlet.Title>
							</Portlet.Header>
							<Portlet.Body>
								<p>
									Apply <code>variant=&quot;pills&quot;</code> property to <code>Nav</code> element
								</p>
								{/* BEGIN Nav */}
								<Nav variant="pills" activeKey="link-1" onSelect={(selectedKey) => alert(`${selectedKey} clicked`)}>
									<Nav.Item>
										<Nav.Link eventKey="link-1">Active</Nav.Link>
									</Nav.Item>
									<Nav.Item>
										<Nav.Link eventKey="link-2">Link</Nav.Link>
									</Nav.Item>
									<Nav.Item>
										<Nav.Link eventKey="link-3">Link</Nav.Link>
									</Nav.Item>
									<Nav.Item>
										<Nav.Link eventKey="link-4" disabled>
											Disabled
										</Nav.Link>
									</Nav.Item>
								</Nav>
								{/* END Nav */}
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
						{/* BEGIN Portlet */}
						<Portlet>
							<Portlet.Header bordered>
								<Portlet.Title>Tab</Portlet.Title>
							</Portlet.Header>
							<Portlet.Body>
								<p>
									Apply <code>variant=&quot;tabs&quot;</code> property to <code>Nav</code> element
								</p>
								{/* BEGIN Nav */}
								<Nav variant="tabs" activeKey="link-1" onSelect={(selectedKey) => alert(`${selectedKey} clicked`)}>
									<Nav.Item>
										<Nav.Link eventKey="link-1">Active</Nav.Link>
									</Nav.Item>
									<Nav.Item>
										<Nav.Link eventKey="link-2">Link</Nav.Link>
									</Nav.Item>
									<Nav.Item>
										<Nav.Link eventKey="link-3">Link</Nav.Link>
									</Nav.Item>
									<Nav.Item>
										<Nav.Link eventKey="link-4" disabled>
											Disabled
										</Nav.Link>
									</Nav.Item>
								</Nav>
								{/* END Nav */}
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
						{/* BEGIN Portlet */}
						<Portlet>
							<Portlet.Header bordered>
								<Portlet.Title>Line</Portlet.Title>
							</Portlet.Header>
							<Portlet.Body>
								<p>
									Apply <code>variant=&quot;lines&quot;</code> property to <code>Nav</code> element
								</p>
								{/* BEGIN Nav */}
								<Nav variant="lines" activeKey="link-1" onSelect={(selectedKey) => alert(`${selectedKey} clicked`)}>
									<Nav.Item>
										<Nav.Link eventKey="link-1">Active</Nav.Link>
									</Nav.Item>
									<Nav.Item>
										<Nav.Link eventKey="link-2">Link</Nav.Link>
									</Nav.Item>
									<Nav.Item>
										<Nav.Link eventKey="link-3">Link</Nav.Link>
									</Nav.Item>
									<Nav.Item>
										<Nav.Link eventKey="link-4" disabled>
											Disabled
										</Nav.Link>
									</Nav.Item>
								</Nav>
								{/* END Nav */}
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
						<Portlet.Title>Alignment</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							You can control the the direction and orientation of the
							<code>Nav</code> by using <code>alignment</code> property. By default, navs are left-aligned, but that is
							easily changed to center or right-aligned.
						</p>
						{/* BEGIN Nav */}
						<Nav alignment="start" activeKey="link-1" onSelect={(selectedKey) => alert(`${selectedKey} clicked`)}>
							<Nav.Item>
								<Nav.Link eventKey="link-1">Active</Nav.Link>
							</Nav.Item>
							<Nav.Item>
								<Nav.Link eventKey="link-2">Link</Nav.Link>
							</Nav.Item>
							<Nav.Item>
								<Nav.Link eventKey="link-3">Link</Nav.Link>
							</Nav.Item>
							<Nav.Item>
								<Nav.Link eventKey="link-4" disabled>
									Disabled
								</Nav.Link>
							</Nav.Item>
						</Nav>
						{/* END Nav */}
						{/* BEGIN Nav */}
						<Nav alignment="center" activeKey="link-1" onSelect={(selectedKey) => alert(`${selectedKey} clicked`)}>
							<Nav.Item>
								<Nav.Link eventKey="link-1">Active</Nav.Link>
							</Nav.Item>
							<Nav.Item>
								<Nav.Link eventKey="link-2">Link</Nav.Link>
							</Nav.Item>
							<Nav.Item>
								<Nav.Link eventKey="link-3">Link</Nav.Link>
							</Nav.Item>
							<Nav.Item>
								<Nav.Link eventKey="link-4" disabled>
									Disabled
								</Nav.Link>
							</Nav.Item>
						</Nav>
						{/* END Nav */}
						{/* BEGIN Nav */}
						<Nav alignment="end" activeKey="link-1" onSelect={(selectedKey) => alert(`${selectedKey} clicked`)}>
							<Nav.Item>
								<Nav.Link eventKey="link-1">Active</Nav.Link>
							</Nav.Item>
							<Nav.Item>
								<Nav.Link eventKey="link-2">Link</Nav.Link>
							</Nav.Item>
							<Nav.Item>
								<Nav.Link eventKey="link-3">Link</Nav.Link>
							</Nav.Item>
							<Nav.Item>
								<Nav.Link eventKey="link-4" disabled>
									Disabled
								</Nav.Link>
							</Nav.Item>
						</Nav>
						{/* END Nav */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Fill and justify</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Force the contents of your nav to extend the full available width. To proportionately fill the space use{' '}
							<code>fill</code>. Notice that the nav is the entire width but each nav item is a different size.
						</p>
						<p>
							If you want each NavItem to be the same size use <code>justify</code>.
						</p>
						{/* BEGIN Navs */}
						<div className="d-grid gap-3">
							<Nav fill variant="pills" activeKey="link-1" onSelect={(selectedKey) => alert(`${selectedKey} clicked`)}>
								<Nav.Item>
									<Nav.Link eventKey="link-1">Active</Nav.Link>
								</Nav.Item>
								<Nav.Item>
									<Nav.Link eventKey="link-2">Much longer nav link</Nav.Link>
								</Nav.Item>
								<Nav.Item>
									<Nav.Link eventKey="link-3">Link</Nav.Link>
								</Nav.Item>
								<Nav.Item>
									<Nav.Link eventKey="link-4" disabled>
										Disabled
									</Nav.Link>
								</Nav.Item>
							</Nav>
							<Nav
								justify
								variant="pills"
								activeKey="link-1"
								onSelect={(selectedKey) => alert(`${selectedKey} clicked`)}
							>
								<Nav.Item>
									<Nav.Link eventKey="link-1">Active</Nav.Link>
								</Nav.Item>
								<Nav.Item>
									<Nav.Link eventKey="link-2">Longer link</Nav.Link>
								</Nav.Item>
								<Nav.Item>
									<Nav.Link eventKey="link-3">Link</Nav.Link>
								</Nav.Item>
								<Nav.Item>
									<Nav.Link eventKey="link-4" disabled>
										Disabled
									</Nav.Link>
								</Nav.Item>
							</Nav>
						</div>
						{/* END Navs */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Additional elements</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							You can combine other elements such as <Link href="/elements/base/badge">badge</Link>, icon or caret to
							separate nav items, we provide <code>Nav.Addon</code> for wrapping those elements.
						</p>
						{/* BEGIN Nav */}
						<Nav variant="pills" activeKey="link-2" onSelect={(selectedKey) => alert(`${selectedKey} clicked`)}>
							<Nav.Item>
								<Nav.Link eventKey="link-1">
									<Nav.Content>Link</Nav.Content>
									<Nav.Addon type="append">
										<Caret />
									</Nav.Addon>
								</Nav.Link>
							</Nav.Item>
							<Nav.Item>
								<Nav.Link eventKey="link-2">
									<Nav.Addon type="prepend">
										<Nav.Icon>
											<FontAwesomeIcon icon={faArchive} />
										</Nav.Icon>
									</Nav.Addon>
									<Nav.Content>Active</Nav.Content>
								</Nav.Link>
							</Nav.Item>
							<Nav.Item>
								<Nav.Link eventKey="link-3">
									<Nav.Addon type="prepend">
										<Nav.Icon>
											<FontAwesomeIcon icon={faCog} />
										</Nav.Icon>
									</Nav.Addon>
									<Nav.Content>Link</Nav.Content>
									<Nav.Addon type="append">
										<Caret />
									</Nav.Addon>
								</Nav.Link>
							</Nav.Item>
							<Nav.Item>
								<Nav.Link eventKey="link-4" disabled>
									<Nav.Addon type="prepend">
										<Nav.Icon>
											<FontAwesomeIcon icon={faWrench} />
										</Nav.Icon>
									</Nav.Addon>
									<Nav.Content>Link</Nav.Content>
									<Nav.Addon type="append">
										<Badge variant="warning" pill>
											2
										</Badge>
									</Nav.Addon>
								</Nav.Link>
							</Nav.Item>
						</Nav>
						{/* END Nav */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

NavPage.pageTitle = 'Navigation'
NavPage.activeLink = 'elements.base.nav'
NavPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Base' },
	{ text: 'Nav', link: '/elements/base/nav' },
]

export default withAuth(NavPage)
