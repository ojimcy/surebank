import React from 'react'
import { Row, Col, Button, Widget20 } from '@blueupcode/components'
import Link from 'next/link'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const NotFoundPage: ExtendedNextPage = () => {
	return (
		<Row className="g-0 align-items-center justify-content-center h-100">
			<Col md={8} lg={6} xl={4} className="text-center">
				<Widget20>404</Widget20>
				<h2 className="mb-3">Page Not Found!</h2>
				<p className="mb-4">
					Sorry we can&apos;t seem to find the page you&apos;re looking for. There may be amisspelling in the URL
					entered, or the page you are looking for may no longer exist.
				</p>
				<Link href="/" passHref>
					<Button variant="label-primary" size="lg" width="widest">
						Back to home
					</Button>
				</Link>
			</Col>
		</Row>
	)
}

NotFoundPage.pageTitle = 'Not Found'
NotFoundPage.layoutName = 'blank'

export default NotFoundPage
