import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col } from '@blueupcode/components'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const Error2Page: ExtendedNextPage = () => {
	return (
		<Row className="g-0 align-items-center justify-content-center h-100">
			<Col className="text-white">
				<h1 className="display-1 fw-bold">404</h1>
				<h3>How did you get here</h3>
				<h6>Sorry we can&apos;t seem to find the page you&apos;re looking for.</h6>
				<p>There may be amisspelling in the URL entered, or the page you are looking for may no longer exist.</p>
			</Col>
		</Row>
	)
}

Error2Page.pageTitle = 'Error 2'
Error2Page.layoutName = 'background'

export default withAuth(Error2Page)
