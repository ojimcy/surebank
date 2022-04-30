import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Pagination } from '@blueupcode/components'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const paginationLength = 3
const paginationLinkNumbers = Array.from({ length: paginationLength }, (_, i) => i + 1)

const PaginationPage: ExtendedNextPage = () => {
	return (
		<Row>
			<Col md={6}>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Basic</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							We use a large block of connected links for our pagination, making links hard to miss and easily
							scalable—all while providing large hit areas.
						</p>
						{/* BEGIN Pagination */}
						<PaginationExample />
						{/* END Pagination */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Sizing</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Fancy larger or smaller pagination? Apply <code>size</code> property for additional sizes.
						</p>
						{/* BEGIN Paginations */}
						<div className="d-grid gap-3">
							<PaginationExample size="lg" />
							<PaginationExample />
							<PaginationExample size="sm" />
						</div>
						{/* END Paginations */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
			<Col md={6}>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Disabled &amp; active states</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Pagination links are customizable for different circumstances. Use <code>disabled</code> for links that
							appear un-clickable and <code>active</code> to indicate the current page.
						</p>
						{/* BEGIN Pagination */}
						<PaginationStatesExample />
						{/* END Pagination */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Alignments</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>Change the alignment of pagination component with flexbox utilities.</p>
						{/* BEGIN Paginations */}
						<div className="d-grid gap-3">
							<PaginationExample className="justify-content-start" />
							<PaginationExample className="justify-content-center" />
							<PaginationExample className="justify-content-end" />
						</div>
						{/* END Paginations */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

const PaginationExample = (props: any) => {
	return (
		<Pagination {...props}>
			<Pagination.Item>Previous</Pagination.Item>
			{paginationLinkNumbers.map((paginationNumber) => (
				<Pagination.Item key={paginationNumber}>{paginationNumber}</Pagination.Item>
			))}
			<Pagination.Item>Next</Pagination.Item>
		</Pagination>
	)
}

const PaginationStatesExample = (props: any) => {
	const activeLinkNumber = 1
	const disabledLinkNumber = 2

	return (
		<Pagination {...props}>
			<Pagination.Item>Previous</Pagination.Item>
			{paginationLinkNumbers.map((paginationNumber) => (
				<Pagination.Item
					key={paginationNumber}
					active={paginationNumber === activeLinkNumber}
					disabled={paginationNumber === disabledLinkNumber}
				>
					{paginationNumber}
				</Pagination.Item>
			))}
			<Pagination.Item>Next</Pagination.Item>
		</Pagination>
	)
}

PaginationPage.pageTitle = 'Pagination'
PaginationPage.activeLink = 'elements.base.pagination'
PaginationPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Base' },
	{ text: 'Pagination', link: '/elements/base/pagination' },
]

export default withAuth(PaginationPage)
