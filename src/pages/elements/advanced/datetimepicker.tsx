import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet } from '@blueupcode/components'
import DateTimePicker from 'react-datetime'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const DateTimePickerPage: ExtendedNextPage = () => {
	return (
		<Row>
			<Col>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Date Time Picker examples</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							A date and time picker for ReactJS, for more info please visit{' '}
							<a href="https://www.npmjs.com/package/react-datetime" target="_blank" rel="noreferrer">
								React Datetime&apos;s page
							</a>
							.
						</p>
						<hr />
						{/* BEGIN Grid */}
						<div className="d-grid gap-3">
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Basic demo
								</Col>
								<Col sm={5} lg={4}>
									<DateTimePicker />
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Initial Value
								</Col>
								<Col sm={5} lg={4}>
									<DateTimePicker initialValue={new Date()} />
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Close on Select
								</Col>
								<Col sm={5} lg={4}>
									<DateTimePicker closeOnSelect />
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Date Only
								</Col>
								<Col sm={5} lg={4}>
									<DateTimePicker timeFormat={false} />
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Custom Date Format
								</Col>
								<Col sm={5} lg={4}>
									<DateTimePicker dateFormat="YYYY-MM-DD" timeFormat={false} />
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Time Only
								</Col>
								<Col sm={5} lg={4}>
									<DateTimePicker dateFormat={false} />
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Custom Time Format
								</Col>
								<Col sm={5} lg={4}>
									<DateTimePicker timeFormat="hh:mm A" dateFormat={false} />
								</Col>
							</Row>
						</div>
						{/* END Grid */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

DateTimePickerPage.pageTitle = 'Date Time Picker'
DateTimePickerPage.activeLink = 'elements.advanced.datetimepicker'
DateTimePickerPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Advanced' },
	{ text: 'Date Time Picker', link: '/elements/advanced/datetimepicker' },
]

export default withAuth(DateTimePickerPage)
