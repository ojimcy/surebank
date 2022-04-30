import React from 'react'
import { Col, Marker, Portlet, Row, Table, useTheme } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInbox } from '@fortawesome/free-solid-svg-icons'
import { ApexOptions } from 'apexcharts'
import Chart from '@blueupcode/apexcharts'

const Widget25Component = () => {
	const [indicators] = React.useState([
		<>
			<Marker type="dot" variant="primary" /> 20% Margin
		</>,
		<>
			<Marker type="dot" variant="success" /> 70% Profit
		</>,
		<>
			<Marker type="dot" variant="danger" /> 10% Lost
		</>,
	])

	const [details] = React.useState([
		{
			title: 'EPS',
			value: '+75,10%',
			color: 'primary',
		},
		{
			title: 'PDO',
			value: '15,900',
			color: 'success',
		},
		{
			title: 'OPL Status',
			value: 'Negative',
			color: 'danger',
		},
		{
			title: 'Priority',
			value: '+460,080',
			color: 'info',
		},
		{
			title: 'Net profit',
			value: '$215,950',
			color: 'primary',
		},
	])

	const [chartSeries] = React.useState([2000, 7000, 1000])

	return (
		<Portlet>
			<Portlet.Header bordered>
				<Portlet.Icon>
					<FontAwesomeIcon icon={faInbox} />
				</Portlet.Icon>
				<Portlet.Title>Support requests</Portlet.Title>
			</Portlet.Header>
			<Portlet.Body>
				<Row>
					<Col md="6" lg="5">
						<Widget25ComponentChart series={chartSeries} />
						<div className="d-flex justify-content-around mt-4">
							{indicators.map((indicator, index) => (
								<span key={index} className="text-muted">
									{indicator}
								</span>
							))}
						</div>
					</Col>
					<Col md="6" lg="7">
						{/* BEGIN Table */}
						<Table>
							<thead>
								<tr>
									<th>Type</th>
									<th className="text-end">Amount</th>
								</tr>
							</thead>
							<tbody>
								{details.map((detail, index) => (
									<tr key={index}>
										<td>{detail.title}</td>
										<td className={`text-end text-${detail.color}`}>{detail.value}</td>
									</tr>
								))}
							</tbody>
						</Table>
						{/* END Table */}
					</Col>
				</Row>
			</Portlet.Body>
		</Portlet>
	)
}

const Widget25ComponentChart: React.FC<Widget25ComponentChartProps> = (props) => {
	const { resolvedTheme: theme } = useTheme()

	const [options, setOptions] = React.useState<ApexOptions>({
		theme: {
			mode: theme as ApexTheme['mode'],
			palette: 'palette1',
		},
		chart: {
			background: 'transparent',
		},
		stroke: {
			colors: [theme === 'dark' ? '#424242' : '#fff'],
		},
		labels: ['Margin', 'Profit', 'Lost'],
		colors: ['#2196f3', '#4caf50', '#f44336'],
		tooltip: {
			fillSeriesColor: false,
			y: {
				formatter: (val) => currency.format(val), // Format chart tooltip value
			},
		},
		legend: {
			show: false,
		},
		dataLabels: {
			enabled: false,
		},
	})

	React.useEffect(() => {
		setOptions((prevOptions) => ({
			...prevOptions,
			mode: theme,
			palette: 'palette1',
			stroke: {
				colors: [theme === 'dark' ? '#424242' : '#fff'],
			},
		}))
	}, [theme])

	return (
		<Chart
			type="donut"
			width={300}
			height="auto"
			options={options}
			series={props.series}
			className="d-flex justify-content-center"
		/>
	)
}

interface Widget25ComponentChartProps {
	series: ApexAxisChartSeries | ApexNonAxisChartSeries
}

// Currency formatter
const currency = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 0,
})

export default Widget25Component
