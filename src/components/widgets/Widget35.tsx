import React from 'react'
import { Dropdown, Portlet, Widget8 } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine, faChartPie, faEllipsisH, faPoll } from '@fortawesome/free-solid-svg-icons'

const Widget35Component = () => {
	const [data] = React.useState({
		highlight: '21',
		title: 'Report',
		color: 'danger',
		detail: (
			<span className="text-muted">
				Fixed: <strong>4</strong>
			</span>
		),
	})

	return (
		<Portlet>
			<Portlet.Header>
				<Portlet.Title>Bug</Portlet.Title>
				<Portlet.Addon>
					{/* BEGIN Dropdown */}
					<Dropdown>
						<Dropdown.Toggle variant="text-secondary" icon noCaret>
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
			<Portlet.Body>
				{/* BEGIN Widget */}
				<Widget8>
					<Widget8.Content>
						<Widget8.Highlight size="lg" className={`text-${data.color}`}>
							{data.highlight}
						</Widget8.Highlight>
						<Widget8.Title>{data.title}</Widget8.Title>
					</Widget8.Content>
				</Widget8>
				{/* END Widget */}
			</Portlet.Body>
			<Portlet.Footer>{data.detail}</Portlet.Footer>
		</Portlet>
	)
}

export default Widget35Component
