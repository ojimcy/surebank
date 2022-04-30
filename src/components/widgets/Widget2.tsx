import React from 'react'
import { Col, Portlet, ProgressBar, Row, Widget3, Widget4 } from '@blueupcode/components'
import { ProgressBarVariant } from '@blueupcode/components/progress/ProgressBar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBoxes } from '@fortawesome/free-solid-svg-icons'

const Widget2Component = () => {
	const [data] = React.useState({
		highlight: '$237,650',
		title: 'Total Revenue',
		detail: [
			{
				percent: 62,
				title: 'Sales growth',
				color: 'primary',
			},
			{
				percent: 40,
				title: 'Product growth',
				color: 'danger',
			},
			{
				percent: 74,
				title: 'Market share',
				color: 'success',
			},
		],
	})

	const colSize = 12 / data.detail.length

	return (
		<Portlet>
			<Portlet.Header bordered>
				<Portlet.Icon>
					<FontAwesomeIcon icon={faBoxes} />
				</Portlet.Icon>
				<Portlet.Title>Product sales</Portlet.Title>
			</Portlet.Header>
			<Portlet.Body as={Widget3}>
				<Widget3.Display>
					<Widget3.Title>
						{data.highlight} <Widget3.Subtitle>{data.title}</Widget3.Subtitle>
					</Widget3.Title>
				</Widget3.Display>
				<Row>
					{data.detail.map((detailData, index) => (
						<Col key={index} md={colSize}>
							<Widget4>
								<Widget4.Group>
									<Widget4.Addon>
										<Widget4.Highlight>{detailData.percent}%</Widget4.Highlight>
									</Widget4.Addon>
								</Widget4.Group>
								<ProgressBar now={detailData.percent} variant={detailData.color as ProgressBarVariant} size="sm" />
								<Widget4.Group>
									<Widget4.Addon>
										<Widget4.Subtitle>{detailData.title}</Widget4.Subtitle>
									</Widget4.Addon>
								</Widget4.Group>
							</Widget4>
						</Col>
					))}
				</Row>
			</Portlet.Body>
		</Portlet>
	)
}

export default Widget2Component
