import React from 'react'
import { Portlet, Widget8 } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown, faDollarSign } from '@fortawesome/free-solid-svg-icons'

const Widget18Component = () => {
	const [data] = React.useState({
		avatar: (
			<Widget8.Avatar display circle variant="label-info">
				<FontAwesomeIcon icon={faDollarSign} />
			</Widget8.Avatar>
		),
		highlight: '$23K',
		title: 'Profit',
		color: 'danger',
		detail: (
			<>
				<FontAwesomeIcon icon={faCaretDown} /> 1.4%
			</>
		),
	})

	return (
		<Portlet>
			<Portlet.Body>
				{/* BEGIN Widget */}
				<Widget8>
					<Widget8.Content>
						{data.avatar}
						<Widget8.Highlight>{data.highlight}</Widget8.Highlight>
						<Widget8.Title>{data.title}</Widget8.Title>
						<Widget8.Subtitle className={`text-${data.color}`}>{data.detail}</Widget8.Subtitle>
					</Widget8.Content>
				</Widget8>
				{/* END Widget */}
			</Portlet.Body>
		</Portlet>
	)
}

export default Widget18Component
