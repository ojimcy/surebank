import React from 'react'
import { Avatar, Dropdown, Portlet, RichList, useTheme, Widget11 } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine, faChartPie, faEuroSign, faPoll } from '@fortawesome/free-solid-svg-icons'
import { ApexOptions } from 'apexcharts'
import Chart from '@blueupcode/apexcharts'

const Widget23Component = () => {
	const [list] = React.useState([
		{
			avatar: (
				<Avatar display variant="label-primary">
					<FontAwesomeIcon icon={faChartLine} />
				</Avatar>
			),
			title: 'Profit',
			subtitle: 'IPO, Margins, Transactions',
		},
		{
			avatar: (
				<Avatar display variant="label-success">
					<FontAwesomeIcon icon={faChartPie} />
				</Avatar>
			),
			title: 'Revenue',
			subtitle: 'Expenses, Loses, Profits',
		},
	])

	const [chartSeries] = React.useState([
		{
			name: 'Revenue',
			data: [4000, 9600, 4600, 13600, 6800, 14600, 11000],
		},
		{
			name: 'Profit',
			data: [3100, 8000, 2800, 5100, 2000, 10900, 10000],
		},
	])

	return (
		<Portlet>
			<Portlet.Header bordered>
				<Portlet.Icon>
					<FontAwesomeIcon icon={faEuroSign} />
				</Portlet.Icon>
				<Portlet.Title>Profit share</Portlet.Title>
				<Portlet.Addon>
					{/* BEGIN Dropdown */}
					<Dropdown>
						<Dropdown.Toggle variant="label-primary">Export</Dropdown.Toggle>
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
				{/* BEGIN Rich List */}
				<RichList className="flex-sm-row">
					{list.map((listItem, index) => (
						<RichList.Item key={index} className="flex-grow-1">
							<RichList.Addon addonType="prepend">{listItem.avatar}</RichList.Addon>
							<RichList.Content>
								<RichList.Title>{listItem.title}</RichList.Title>
								<RichList.Subtitle>{listItem.subtitle}</RichList.Subtitle>
							</RichList.Content>
						</RichList.Item>
					))}
				</RichList>
				{/* END Rich List */}
			</Portlet.Body>
			<Widget23ComponentChart series={chartSeries} />
		</Portlet>
	)
}

const Widget23ComponentChart: React.FC<Widget23ComponentChartProps> = (props) => {
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
			opacity: 0.8,
			type: 'solid',
		},
		markers: {
			strokeColors: theme === 'dark' ? '#424242' : '#fff',
		},
		stroke: {
			show: false,
		},
		tooltip: {
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

	return (
		<Widget11 bottom>
			<Chart type="area" width="100%" height={300} options={options} series={props.series} />
		</Widget11>
	)
}

interface Widget23ComponentChartProps {
	series: ApexAxisChartSeries | ApexNonAxisChartSeries
}

// Currency formatter
const currency = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 0,
})

export default Widget23Component
