import React from 'react'
import { Avatar, AvatarGroup, Marker, Portlet, ProgressBar, Table, Widget4 } from '@blueupcode/components'
import { MarkerVariant } from '@blueupcode/components/marker/Marker'
import { faTruckLoading } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'

const Widget4Component = () => {
	const [list] = React.useState([
		{
			id: '837563',
			statusColor: 'primary',
			statusInfo: 'Arrived',
			operatorImages: [
				'/images/avatar/blank.webp',
				'/images/avatar/blank.webp',
				'/images/avatar/blank.webp',
				'/images/avatar/blank.webp',
				'/images/avatar/blank.webp',
			],
			location: 'Tokyo',
			progress: 90,
			startDate: '26/06/2020',
			endDate: '27/06/2020',
		},
		{
			id: '982365',
			statusColor: 'danger',
			statusInfo: 'Pending',
			operatorImages: ['/images/avatar/blank.webp'],
			location: 'San Francisco',
			progress: 20,
			startDate: '23/04/2020',
			endDate: '28/04/2020',
		},
		{
			id: '872048',
			statusColor: 'success',
			statusInfo: 'Moving',
			operatorImages: [
				'/images/avatar/blank.webp',
				'/images/avatar/blank.webp',
				'/images/avatar/blank.webp',
				'/images/avatar/blank.webp',
			],
			location: 'Edinburgh',
			progress: 75,
			startDate: '26/04/2020',
			endDate: '30/04/2020',
		},
		{
			id: '324712',
			statusColor: 'warning',
			statusInfo: 'Hold',
			operatorImages: ['/images/avatar/blank.webp'],
			location: 'Tokyo',
			progress: 30,
			startDate: '26/06/2020',
			endDate: '30/06/2020',
		},
		{
			id: '128747',
			statusColor: 'success',
			statusInfo: 'Moving',
			operatorImages: [
				'/images/avatar/blank.webp',
				'/images/avatar/blank.webp',
				'/images/avatar/blank.webp',
				'/images/avatar/blank.webp',
			],
			location: 'New York',
			progress: 60,
			startDate: '10/05/2020',
			endDate: '15/05/2020',
		},
	])

	return (
		<Portlet>
			<Portlet.Header>
				<Portlet.Icon>
					<FontAwesomeIcon icon={faTruckLoading} />
				</Portlet.Icon>
				<Portlet.Title>Order progress</Portlet.Title>
			</Portlet.Header>
			<Portlet.Body>
				<Table responsive className="text-nowrap mb-0">
					<thead>
						<tr>
							<th>Order ID</th>
							<th>Status</th>
							<th>Operators</th>
							<th>Location</th>
							<th>Progress</th>
							<th>Start date</th>
							<th>Estimation</th>
						</tr>
					</thead>
					<tbody>
						{list.map((data, index) => (
							<tr key={index}>
								<td className="align-middle">{data.id}</td>
								<td className="align-middle">
									<Marker type="dot" variant={data.statusColor as MarkerVariant} /> {data.statusInfo}
								</td>
								<td className="align-middle">
									{/* BEGIN Avatar Group */}
									<AvatarGroup>
										{data.operatorImages.map((image, index) => (
											<Avatar key={index} circle display>
												<Image src={image} layout="fill" alt="Avatar image" />
											</Avatar>
										))}
									</AvatarGroup>
									{/* END Avatar Group */}
								</td>
								<td className="align-middle">{data.location}</td>
								<td className="align-middle">
									{/* BEGIN Widget */}
									<Widget4>
										<Widget4.Group>
											<Widget4.Display>
												<Widget4.Subtitle>{`${data.progress}%`}</Widget4.Subtitle>
											</Widget4.Display>
										</Widget4.Group>
										<ProgressBar now={data.progress} variant="primary" size="sm" />
									</Widget4>
									{/* END Widget */}
								</td>
								<td className="align-middle">{data.startDate}</td>
								<td className="align-middle">{data.endDate}</td>
							</tr>
						))}
					</tbody>
				</Table>
			</Portlet.Body>
		</Portlet>
	)
}

export default Widget4Component
