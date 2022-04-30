import React from 'react'
import { Portlet, Widget10, Widget8 } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBoxes, faDollarSign, faLink, faUser } from '@fortawesome/free-solid-svg-icons'

const Widget33Component = () => {
	const [list] = React.useState([
		{
			title: '$27,639',
			subtitle: 'Total revenue',
			avatar: (
				<Widget8.Avatar display circle variant="label-info" className="m-0">
					<FontAwesomeIcon icon={faDollarSign} />
				</Widget8.Avatar>
			),
		},
		{
			title: '87,123',
			subtitle: 'Order received',
			avatar: (
				<Widget8.Avatar display circle variant="label-primary" className="m-0">
					<FontAwesomeIcon icon={faBoxes} />
				</Widget8.Avatar>
			),
		},
		{
			title: '237',
			subtitle: 'New users',
			avatar: (
				<Widget8.Avatar display circle variant="label-success" className="m-0">
					<FontAwesomeIcon icon={faUser} />
				</Widget8.Avatar>
			),
		},
		{
			title: '5,726',
			subtitle: 'Unique visits',
			avatar: (
				<Widget8.Avatar display circle variant="label-danger" className="m-0">
					<FontAwesomeIcon icon={faLink} />
				</Widget8.Avatar>
			),
		},
	])

	return (
		<Portlet>
			<Widget10 vertical="md">
				{list.map((listItem, index) => (
					<Widget10.Item key={index}>
						<Widget10.Content>
							<Widget10.Title>{listItem.title}</Widget10.Title>
							<Widget10.Subtitle>{listItem.subtitle}</Widget10.Subtitle>
						</Widget10.Content>
						<Widget10.Addon>{listItem.avatar}</Widget10.Addon>
					</Widget10.Item>
				))}
			</Widget10>
		</Portlet>
	)
}

export default Widget33Component
