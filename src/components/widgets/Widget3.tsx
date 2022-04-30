import React from 'react'
import { Button, Dropdown, Portlet, Widget5 } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChalkboard, faChartLine, faChartPie, faCog, faPoll } from '@fortawesome/free-solid-svg-icons'

const Widget3Component = () => {
	const [list] = React.useState([
		{
			title: 'Monthly income',
			detail: [
				{
					info: 'Total',
					value: '$65,880',
				},
				{
					info: 'Change',
					value: '+15%',
					color: 'success',
				},
				{
					info: 'Sales',
					value: '554',
				},
			],
		},
		{
			title: 'Employee amount',
			detail: [
				{
					info: 'Total',
					value: '1250',
				},
				{
					info: 'Change',
					value: '-2%',
					color: 'danger',
				},
				{
					info: 'Active',
					value: '1120',
				},
			],
		},
		{
			title: 'Product sales',
			detail: [
				{
					info: 'Total',
					value: '2350',
				},
				{
					info: 'Change',
					value: '+10%',
					color: 'success',
				},
				{
					info: 'Last report',
					value: '2220',
				},
			],
		},
		{
			title: 'Monthly profit',
			detail: [
				{
					info: 'Total',
					value: '$502,100',
				},
				{
					info: 'Change',
					value: '+15%',
					color: 'success',
				},
				{
					info: 'Last month',
					value: '$453,000',
				},
			],
		},
	])

	return (
		<Portlet variant="primary">
			<Portlet.Header>
				<Portlet.Icon>
					<FontAwesomeIcon icon={faChalkboard} />
				</Portlet.Icon>
				<Portlet.Title>Company summary</Portlet.Title>
				<Portlet.Addon>
					{/* BEGIN Dropdown */}
					<Dropdown>
						<Dropdown.Toggle variant="label-light">June, 2020</Dropdown.Toggle>
						<Dropdown.Menu animated align="end">
							<Dropdown.Item icon={<FontAwesomeIcon icon={faPoll} />}>Report</Dropdown.Item>
							<Dropdown.Item icon={<FontAwesomeIcon icon={faChartPie} />}>Charts</Dropdown.Item>
							<Dropdown.Item icon={<FontAwesomeIcon icon={faChartLine} />}>Statistics</Dropdown.Item>
							<Dropdown.Item icon={<FontAwesomeIcon icon={faCog} />}>Settings</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
					{/* END Dropdown */}
				</Portlet.Addon>
			</Portlet.Header>
			<Portlet.Body>
				<div className="d-grid gap-2">
					{list.map((data, index) => (
						<Portlet key={index} noMargin>
							<Portlet.Body>
								<Widget5>
									<Widget5.Title>{data.title}</Widget5.Title>
									<Widget5.Group>
										{data.detail.map((detail, index) => (
											<Widget5.Item key={index}>
												<Widget5.Info>{detail.info}</Widget5.Info>
												<Widget5.Value className={detail.color && `text-${detail.color}`}>{detail.value}</Widget5.Value>
											</Widget5.Item>
										))}
									</Widget5.Group>
								</Widget5>
							</Portlet.Body>
						</Portlet>
					))}
				</div>
			</Portlet.Body>
			<Portlet.Footer align="end">
				<Button variant="label-light">View all packages</Button>
			</Portlet.Footer>
		</Portlet>
	)
}

export default Widget3Component
