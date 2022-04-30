import React from 'react'
import { Badge, Marker, Portlet, Timeline, Widget7 } from '@blueupcode/components'
import { MarkerVariant } from '@blueupcode/components/marker/Marker'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faListAlt } from '@fortawesome/free-solid-svg-icons'

const Widget12Component = () => {
	const [list] = React.useState([
		{
			color: 'primary',
			content: '12 new users registered',
			time: 'Just now',
		},
		{
			color: 'success',
			content: (
				<>
					System shutdown <Badge variant="label-success">pending</Badge>
				</>
			),
			time: '2 mins',
		},
		{
			color: 'primary',
			content: 'New invoice received',
			time: '3 mins',
		},
		{
			color: 'danger',
			content: (
				<>
					New order received <Badge variant="label-danger">urgent</Badge>
				</>
			),
			time: '10 mins',
		},
		{
			color: 'warning',
			content: 'Production server down',
			time: '1 hrs',
		},
		{
			color: 'info',
			content: (
				<>
					System error <a href="#">check</a>
				</>
			),
			time: '2 hrs',
		},
		{
			color: 'secondary',
			content: 'DB overloaded 80%',
			time: '5 hrs',
		},
		{
			color: 'success',
			content: 'Production server up',
			time: '6 hrs',
		},
	])

	return (
		<Portlet>
			<Portlet.Header>
				<Portlet.Icon>
					<FontAwesomeIcon icon={faListAlt} />
				</Portlet.Icon>
				<Portlet.Title>Lastest log</Portlet.Title>
			</Portlet.Header>
			<Portlet.Body>
				<Portlet noMargin className="h-100">
					<Portlet.Body>
						{/* BEGIN Timeline */}
						<Timeline>
							{list.map((data, index) => (
								<Timeline.Item key={index} pin={<Marker type="dot" variant={data.color as MarkerVariant} />}>
									{/* BEGIN Widget */}
									<Widget7>
										<Widget7.Text>{data.content}</Widget7.Text>
										<Widget7.Time>{data.time}</Widget7.Time>
									</Widget7>
									{/* END Widget */}
								</Timeline.Item>
							))}
						</Timeline>
						{/* END Timeline */}
					</Portlet.Body>
				</Portlet>
			</Portlet.Body>
		</Portlet>
	)
}

export default Widget12Component
