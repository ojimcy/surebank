import React from 'react'
import { OverlayTrigger, Portlet, Tooltip, Widget8 } from '@blueupcode/components'
import { faCaretUp, faQuestion, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Widget16Component = () => {
	const [data] = React.useState({
		avatar: (
			<Widget8.Avatar display circle variant="label-primary">
				<FontAwesomeIcon icon={faUser} />
			</Widget8.Avatar>
		),
		highlight: '35.2K',
		title: 'Users',
		detail: (
			<>
				<FontAwesomeIcon icon={faCaretUp} /> 0.2%
			</>
		),
		color: 'success',
		tooltip: 'New users for last month',
	})

	return (
		<Portlet>
			<Portlet.Body>
				{/* BEGIN Widget */}
				<Widget8>
					<OverlayTrigger placement="right" overlay={<Tooltip>{data.tooltip}</Tooltip>}>
						<Widget8.Addon>
							<FontAwesomeIcon icon={faQuestion} />
						</Widget8.Addon>
					</OverlayTrigger>
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

export default Widget16Component
