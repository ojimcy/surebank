import React from 'react'
import { Badge, Button, Nav, Portlet, RichList, Tab, Table, useTheme } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartArea } from '@fortawesome/free-solid-svg-icons'
import { ApexOptions } from 'apexcharts'
import Chart from '@blueupcode/apexcharts'

const Widget24Component = () => {
	const [tabs] = React.useState([
		{
			key: 'last-month',
			time: 'Last month',
			employees: [
				{
					firstName: 'Garrett',
					lastName: 'Winters',
					job: 'Accountant',
					office: 'Tokyo',
					chart: {
						color: '#2196f3',
						series: [64, 40, 76, 62, 98, 64],
					},
					status: 'Excelent',
					statusColor: 'primary',
				},
				{
					firstName: 'Rhona',
					lastName: 'Davidson',
					job: 'SEO Specialist',
					office: 'Edinburgh',
					chart: {
						color: '#9c27b0',
						series: [23, 50, 26, 54, 38, 45],
					},
					status: 'Good',
					statusColor: 'success',
				},
				{
					firstName: 'Airi',
					lastName: 'Satou',
					job: 'Senior Developer',
					office: 'London',
					chart: {
						color: '#f44336',
						series: [98, 56, 76, 54, 34, 45],
					},
					status: 'Bad',
					statusColor: 'danger',
				},
				{
					firstName: 'Brielle',
					lastName: 'Williamson',
					job: 'System Architect',
					office: 'London',
					chart: {
						color: '#ff9800',
						series: [65, 86, 23, 54, 90, 45],
					},
					status: 'Standard',
					statusColor: 'info',
				},
			],
		},
		{
			key: 'all-time',
			time: 'All time',
			employees: [
				{
					firstName: 'Rhona',
					lastName: 'Davidson',
					job: 'SEO Specialist',
					office: 'Edinburgh',
					chart: {
						color: '#9c27b0',
						series: [23, 50, 26, 54, 38, 45],
					},
					status: 'Good',
					statusColor: 'success',
				},
				{
					firstName: 'Brielle',
					lastName: 'Williamson',
					job: 'System Architect',
					office: 'London',
					chart: {
						color: '#ff9800',
						series: [65, 86, 23, 54, 90, 45],
					},
					status: 'Standard',
					statusColor: 'info',
				},
				{
					firstName: 'Garrett',
					lastName: 'Winters',
					job: 'Accountant',
					office: 'Tokyo',
					chart: {
						color: '#2196f3',
						series: [64, 40, 76, 62, 98, 64],
					},
					status: 'Excelent',
					statusColor: 'primary',
				},
				{
					firstName: 'Airi',
					lastName: 'Satou',
					job: 'Senior Developer',
					office: 'London',
					chart: {
						color: '#f44336',
						series: [98, 56, 76, 54, 34, 45],
					},
					status: 'Bad',
					statusColor: 'danger',
				},
			],
		},
	])

	const defaultTabKey = 0

	return (
		<Tab.Container defaultActiveKey={tabs[defaultTabKey].key}>
			<Portlet>
				<Portlet.Header bordered>
					<Portlet.Icon>
						<FontAwesomeIcon icon={faChartArea} />
					</Portlet.Icon>
					<Portlet.Title>Employee change</Portlet.Title>
					<Portlet.Addon>
						{/* BEGIN Nav */}
						<Nav variant="lines" portlet>
							{tabs.map((tab) => (
								<Nav.Item key={tab.key}>
									<Nav.Link eventKey={tab.key}>{tab.time}</Nav.Link>
								</Nav.Item>
							))}
						</Nav>
						{/* END Nav */}
					</Portlet.Addon>
				</Portlet.Header>
				<Portlet.Body>
					{/* BEGIN Tabs */}
					<Tab.Content>
						{tabs.map((tab) => (
							<Tab.Pane key={tab.key} eventKey={tab.key}>
								<Table borderless striped hover responsive className="text-nowrap mb-0">
									<thead>
										<tr>
											<th>Name</th>
											<th>Office</th>
											<th>Change</th>
											<th>Status</th>
										</tr>
									</thead>
									<tbody>
										{tab.employees.map((employee, index) => (
											<tr key={index}>
												<td className="align-middle">
													{/* BEGIN Rich List */}
													<RichList.Item content className="p-0">
														<RichList.Title>{`${employee.firstName} ${employee.lastName}`}</RichList.Title>
														<RichList.Subtitle>{employee.job}</RichList.Subtitle>
													</RichList.Item>
													{/* END Rich List */}
												</td>
												<td className="align-middle">{employee.office}</td>
												<td className="align-middle" style={{ maxWidth: '8rem' }}>
													<Widget24ComponentChart
														color={employee.chart.color}
														label={employee.firstName}
														series={employee.chart.series}
													/>
												</td>
												<td className="align-middle">
													<Badge variant={`label-${employee.statusColor}`}>{employee.status}</Badge>
												</td>
											</tr>
										))}
									</tbody>
								</Table>
							</Tab.Pane>
						))}
					</Tab.Content>
					{/* END Tabs */}
				</Portlet.Body>
				<Portlet.Footer bordered align="end">
					<Button variant="label-primary">View all record</Button>
				</Portlet.Footer>
			</Portlet>
		</Tab.Container>
	)
}

const Widget24ComponentChart: React.FC<Widget24ComponentChartProps> = (props) => {
	const { resolvedTheme: theme } = useTheme()

	const [options, setOptions] = React.useState<ApexOptions>({
		theme: {
			mode: theme as ApexTheme['mode'],
			palette: 'palette1',
		},
		chart: {
			background: 'transparent',
			sparkline: {
				enabled: true,
			},
		},
		fill: {
			opacity: 0,
			type: 'solid',
		},
		stroke: {
			show: true,
			colors: [props.color],
			lineCap: 'round',
		},
		markers: {
			colors: [theme === 'dark' ? '#424242' : '#fff'],
			strokeWidth: 4,
			strokeColors: props.color,
		},
		tooltip: {
			followCursor: true,
			marker: {
				show: false,
			},
			x: {
				show: false,
			},
			y: {
				formatter: (val) => `${val} Tests`, // Format chart tooltip value
			},
			fixed: {
				enabled: true,
				position: 'topLeft',
				offsetY: -30,
			},
		},
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
			crosshairs: {
				show: false,
			},
		},
	})

	const series: ApexAxisChartSeries | ApexNonAxisChartSeries = [
		{
			name: props.label,
			data: props.series,
		},
	]

	React.useEffect(() => {
		setOptions((prevOptions) => ({
			...prevOptions,
			mode: theme,
			palette: 'palette1',
			markers: {
				colors: [theme === 'dark' ? '#424242' : '#fff'],
			},
		}))
	}, [theme])

	return <Chart type="area" width="100%" height={50} options={options} series={series} />
}

interface Widget24ComponentChartProps {
	color: string
	label: string
	series: number[]
}

export default Widget24Component
