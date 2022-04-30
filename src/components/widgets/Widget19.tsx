import React from 'react'
import { Portlet, Widget3, Dropdown } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretUp, faChartLine, faChartPie, faEllipsisH, faPoll } from '@fortawesome/free-solid-svg-icons'

const Widget19Component = () => {
	const [data] = React.useState({
		highlight: '$5,650',
		detail: (
			<>
				<FontAwesomeIcon icon={faCaretUp} /> 25,2%
			</>
		),
	})

	return (
		<Portlet>
			<Portlet.Header>
				<Portlet.Title>Monthly profit</Portlet.Title>
				<Portlet.Addon>
					{/* BEGIN Dropdown */}
					<Dropdown>
						<Dropdown.Toggle variant="label-primary" icon noCaret>
							<FontAwesomeIcon icon={faEllipsisH} />
						</Dropdown.Toggle>
						<Dropdown.Menu animated align="end">
							<Dropdown.Item href="#" icon={<FontAwesomeIcon icon={faPoll} />}>
								Report
							</Dropdown.Item>
							<Dropdown.Item href="#" icon={<FontAwesomeIcon icon={faChartPie} />}>
								Charts
							</Dropdown.Item>
							<Dropdown.Item href="#" icon={<FontAwesomeIcon icon={faChartLine} />}>
								Statistics
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
					{/* END Dropdown */}
				</Portlet.Addon>
			</Portlet.Header>
			{/* BEGIN Widget */}
			<Widget3 size="sm" as={Portlet.Body}>
				<Widget3.Display>
					<Widget3.Title>
						{data.highlight} <Widget3.Subtitle>{data.detail}</Widget3.Subtitle>
					</Widget3.Title>
				</Widget3.Display>
			</Widget3>
			{/* END Widget */}
		</Portlet>
	)
}

export default Widget19Component
