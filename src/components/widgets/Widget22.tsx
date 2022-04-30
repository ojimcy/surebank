import React from 'react'
import { Portlet, Dropdown, useTheme, Row, Col, Widget4, ProgressBar } from '@blueupcode/components'
import { ProgressBarVariant } from '@blueupcode/components/progress/ProgressBar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine, faChartPie, faEllipsisH, faExchangeAlt, faPoll, faCog } from '@fortawesome/free-solid-svg-icons'
import { ApexOptions } from 'apexcharts'
import Chart from '@blueupcode/apexcharts'

const Widget22Component = () => {
	const [list] = React.useState([
		{
			title: 'New York',
			progress: 60,
			color: 'warning',
		},
		{
			title: 'San Francisco',
			progress: 75,
			color: 'primary',
		},
		{
			title: 'Sydney',
			progress: 90,
			color: 'success',
		},
		{
			title: 'Tokyo',
			progress: 55,
			color: 'danger',
		},
	])

	const [chartSeries] = React.useState([
		{
			name: 'Revenue',
			data: [3100, 4000, 2800, 5100, 4200, 10900, 5600, 8600, 7000],
		},
	])

	return (
		<Portlet>
			<Portlet.Header>
				<Portlet.Icon>
					<FontAwesomeIcon icon={faExchangeAlt} />
				</Portlet.Icon>
				<Portlet.Title>Revenue change</Portlet.Title>
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
							<Dropdown.Divider />
							<Dropdown.Item href="#" icon={<FontAwesomeIcon icon={faCog} />}>
								Settings
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
					{/* END Dropdown */}
				</Portlet.Addon>
			</Portlet.Header>
			<Portlet.Body>
				<Widget22ComponentChart series={chartSeries} />
				<Row className="gy-2 mt-4">
					{list.map((listItem, index) => (
						<Col key={index} xs={6}>
							<Widget4>
								<Widget4.Group>
									<Widget4.Display>
										<Widget4.Subtitle>{listItem.title}</Widget4.Subtitle>
									</Widget4.Display>
									<Widget4.Addon>
										<Widget4.Subtitle>{listItem.progress}%</Widget4.Subtitle>
									</Widget4.Addon>
								</Widget4.Group>
								<ProgressBar now={listItem.progress} variant={listItem.color as ProgressBarVariant} size="sm" />
							</Widget4>
						</Col>
					))}
				</Row>
			</Portlet.Body>
		</Portlet>
	)
}

const Widget22ComponentChart: React.FC<Widget22ComponentChartProps> = (props) => {
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
			type: 'solid',
		},
		markers: {
			strokeColors: theme === 'dark' ? '#424242' : '#fff',
		},
		stroke: {
			show: false,
		},
		tooltip: {
			marker: {
				show: false,
			},
			y: {
				formatter: (val) => currency.format(val), // Format chart tooltip value
			},
		},
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
			crosshairs: {
				show: false,
			},
		},
		responsive: [
			{
				breakpoint: 576,
				options: {
					chart: {
						height: 200,
					},
				},
			},
		],
	})

	React.useEffect(() => {
		setOptions((prevOptions) => ({
			...prevOptions,
			mode: theme,
			palette: 'palette1',
			markers: {
				strokeColors: theme === 'dark' ? '#424242' : '#fff',
			},
		}))
	}, [theme])

	return <Chart type="area" width="100%" height={300} options={options} series={props.series} />
}

interface Widget22ComponentChartProps {
	series: ApexAxisChartSeries | ApexNonAxisChartSeries
}

// Currency formatter
const currency = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 0,
})

export default Widget22Component
