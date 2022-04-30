import React from 'react'
import { Portlet, Widget10, Widget8 } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBoxes, faDollarSign } from '@fortawesome/free-solid-svg-icons'

const Widget11Component = () => {
	const [list] = React.useState([
		{
			highlight: '$27,639',
			title: 'Total revenue',
			avatar: (
				<Widget8.Avatar display circle variant="label-info" className="m-0">
					<FontAwesomeIcon icon={faDollarSign} />
				</Widget8.Avatar>
			),
		},
		{
			highlight: '87,123',
			title: 'Order received',
			avatar: (
				<Widget8.Avatar display circle variant="label-primary" className="m-0">
					<FontAwesomeIcon icon={faBoxes} />
				</Widget8.Avatar>
			),
		},
	])

	return (
		<Portlet>
			{/* BEGIN Widget */}
			<Widget10 vertical="lg">
				{list.map((data, index) => (
					<Widget10.Item key={index}>
						<Widget10.Content>
							<Widget10.Title>{data.highlight}</Widget10.Title>
							<Widget10.Subtitle>{data.title}</Widget10.Subtitle>
						</Widget10.Content>
						<Widget10.Addon>{data.avatar}</Widget10.Addon>
					</Widget10.Item>
				))}
			</Widget10>
			{/* END Widget */}
		</Portlet>
	)
}

export default Widget11Component
