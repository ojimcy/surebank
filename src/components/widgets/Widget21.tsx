import { Dropdown, Portlet, Widget8 } from '@blueupcode/components'
import { faChartLine, faChartPie, faEllipsisH, faPoll } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

const Widget21Component = () => {
	const [data] = React.useState({
		highlight: '34',
		title: 'Proposals',
		color: 'primary',
		detail: (
			<span className="text-muted">
				Completed: <strong>8</strong>
			</span>
		),
	})

	return (
		<Portlet>
			<Portlet.Header>
				<Portlet.Title>Features</Portlet.Title>
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

export default Widget21Component
