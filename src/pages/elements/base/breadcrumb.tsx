import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Breadcrumb } from '@blueupcode/components'
import { Home, Bookmark } from 'react-feather'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const BreadcrumbPage: ExtendedNextPage = () => {
	return (
		<Row>
			<Col>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Breadcrumb</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Indicate the current page’s location within a navigational hierarchy that automatically adds separators
							via CSS. Add <code>active</code>
							prop to active <code>Breadcrumb.Item</code>. Do not set both <code>active</code> and <code>href</code>{' '}
							attributes. <code>active</code> overrides <code>href</code> and <code>span</code>
							element is rendered instead of <code>a</code>.
						</p>
						{/* BEGIN Breadcrumb */}
						<Breadcrumb>
							<Breadcrumb.Item icon={<Home />}>Home</Breadcrumb.Item>
							<Breadcrumb.Item icon={<Bookmark />}>Library</Breadcrumb.Item>
							<Breadcrumb.Item>Data</Breadcrumb.Item>
						</Breadcrumb>
						{/* END Breadcrumb */}
						<p>
							You can add <code>transparent</code> property to remove background and remove x-axis padding on the
							breadcrumb.
						</p>
						{/* BEGIN Breadcrumb */}
						<Breadcrumb transparent>
							<Breadcrumb.Item icon={<Home />}>Home</Breadcrumb.Item>
							<Breadcrumb.Item icon={<Bookmark />}>Library</Breadcrumb.Item>
							<Breadcrumb.Item>Data</Breadcrumb.Item>
						</Breadcrumb>
						{/* END Breadcrumb */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

BreadcrumbPage.pageTitle = 'Breadcrumb'
BreadcrumbPage.activeLink = 'elements.base.breadcrumb'
BreadcrumbPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Base' },
	{ text: 'Breadcrumb', link: '/elements/base/breadcrumb' },
]

export default withAuth(BreadcrumbPage)
