import React from 'react'
import { Avatar, AvatarGroup, Marker, Portlet, Timeline } from '@blueupcode/components'
import { MarkerVariant } from '@blueupcode/components/marker/Marker'
import { faClipboardList } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'

const Widget13Component = () => {
	const [list] = React.useState([
		{
			time: '10:00',
			color: 'primary',
			content: (
				<div className="d-flex align-items-center">
					<span>Meeting with</span>{' '}
					<AvatarGroup className="ms-2">
						<Avatar display circle>
							<Image src="/images/avatar/blank.webp" layout="fill" alt="Avatar image" />
						</Avatar>
						<Avatar display circle>
							<Image src="/images/avatar/blank.webp" layout="fill" alt="Avatar image" />
						</Avatar>
						<Avatar display circle>
							<Image src="/images/avatar/blank.webp" layout="fill" alt="Avatar image" />
						</Avatar>
					</AvatarGroup>
				</div>
			),
		},
		{
			time: '12:45',
			color: 'warning',
			content: (
				<p className="mb-0">
					Lorem ipsum dolor sit amit,consectetur eiusmdd tempor incididunt ut labore et dolore magna elit enim at minim
					veniam quis nostrud
				</p>
			),
		},
		{
			time: '14:00',
			color: 'danger',
			content: (
				<p className="mb-0">
					Received a new feedback on <a href="#">GoFinance</a> App product.
				</p>
			),
		},
		{
			time: '15:20',
			color: 'success',
			content: (
				<p className="mb-0">
					Lorem ipsum dolor sit amit,consectetur eiusmdd tempor incididunt ut labore et dolore magna.
				</p>
			),
		},
		{
			time: '17:00',
			color: 'info',
			content: (
				<p className="mb-0">
					Make Deposit <a href="#">USD 700</a> o ESL.
				</p>
			),
		},
	])

	return (
		<Portlet>
			<Portlet.Header bordered>
				<Portlet.Icon>
					<FontAwesomeIcon icon={faClipboardList} />
				</Portlet.Icon>
				<Portlet.Title>Recent activities</Portlet.Title>
			</Portlet.Header>
			<Portlet.Body>
				{/* BEGIN Timeline */}
				<Timeline timed>
					{list.map((data, index) => (
						<Timeline.Item
							key={index}
							time={data.time}
							pin={<Marker type="circle" variant={data.color as MarkerVariant} />}
						>
							{data.content}
						</Timeline.Item>
					))}
				</Timeline>
				{/* END Timeline */}
			</Portlet.Body>
		</Portlet>
	)
}

export default Widget13Component
