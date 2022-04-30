import React from 'react'
import { Dropdown, Portlet, Widget3 } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown, faChartLine, faChartPie, faEllipsisH, faPoll } from '@fortawesome/free-solid-svg-icons'

const Widget17Component = () => {
	const [data] = React.useState({
		highlight: '12,050',
		detail: (
			<>
				<FontAwesomeIcon icon={faCaretDown} /> 12,5%
			</>
		),
	})

	return (
		<Portlet variant="primary">
			<Portlet.Header>
				<Portlet.Title>Daily sales</Portlet.Title>
				<Portlet.Addon>
					{/* BEGIN Dropdown */}
					<Dropdown>
						<Dropdown.Toggle variant="label-light" icon noCaret>
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
					<Widget3.Title className="text-white">
						{data.highlight} <Widget3.Subtitle className="text-white">{data.detail}</Widget3.Subtitle>
					</Widget3.Title>
				</Widget3.Display>
			</Widget3>
			{/* END Widget */}
		</Portlet>
	)
}

export default Widget17Component
