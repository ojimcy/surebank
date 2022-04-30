import React from 'react'
import { Portlet, useTheme } from '@blueupcode/components'
import { ApexOptions } from 'apexcharts'
import Chart from '@blueupcode/apexcharts'

const Widget30Component = () => {
	const [data] = React.useState({
		title: 'Daily Income',
		subtitle: 'Check out each collumn for more details',
	})

	const [chartSeries] = React.useState([
		{
			name: 'Profit',
			data: [4400, 5500, 5700, 5600, 6100, 5800, 6300, 6000],
		},
		{
			name: 'Revenue',
			data: [7600, 8500, 10100, 9800, 8700, 10500, 9100, 11400],
		},
		{
			name: 'Free Cash',
			data: [3500, 4100, 3600, 2600, 4500, 4800, 5200, 5300],
		},
	])

	return (
		<Portlet>
			<Portlet.Body>
				<h4 className="text-level-2">{data.title}</h4>
				<span className="text-muted">{data.subtitle}</span>
				<Widget30ComponentChart series={chartSeries} />
			</Portlet.Body>
		</Portlet>
	)
}

const Widget30ComponentChart: React.FC<Widget30ComponentChartProps> = (props) => {
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
			opacity: 1,
		},
		stroke: {
			show: true,
			width: 2,
			colors: ['transparent'],
		},
		plotOptions: {
			bar: {
				horizontal: false,
			},
		},
		dataLabels: {
			enabled: false,
		},
		xaxis: {
			categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
		},
		tooltip: {
			y: {
				formatter: (val) => currency.format(val), // Format chart tooltip value
			},
		},
	})

	React.useEffect(() => {
		setOptions((prevOptions) => ({
			...prevOptions,
			mode: theme,
			palette: 'palette1',
		}))
	}, [theme])

	return <Chart type="bar" width="100%" height={200} options={options} series={props.series} />
}

interface Widget30ComponentChartProps {
	series: ApexAxisChartSeries | ApexNonAxisChartSeries
}

// Currency formatter
const currency = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 0,
})

export default Widget30Component
