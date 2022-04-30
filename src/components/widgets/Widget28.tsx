import React from 'react'
import { Portlet, useTheme, Widget10, Widget11, Widget8 } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDollarSign } from '@fortawesome/free-solid-svg-icons'
import { ApexOptions } from 'apexcharts'
import Chart from '@blueupcode/apexcharts'

const Widget28Component = () => {
	const [data] = React.useState({
		highlight: '$27,639',
		title: 'Total revenue',
		avatar: (
			<Widget8.Avatar display circle variant="label-primary" className="m-0">
				<FontAwesomeIcon icon={faDollarSign} />
			</Widget8.Avatar>
		),
	})

	const [chartSeries] = React.useState([
		{
			name: 'Revenue',
			data: [6400, 4000, 7600, 6200, 9800, 6400],
		},
	])

	return (
		<Portlet>
			<Portlet.Body>
				{/* BEGIN Widget */}
				<Widget10.Item className="p-0">
					<Widget10.Content>
						<Widget10.Title>{data.highlight}</Widget10.Title>
						<Widget10.Subtitle>{data.title}</Widget10.Subtitle>
					</Widget10.Content>
					<Widget10.Addon>{data.avatar}</Widget10.Addon>
				</Widget10.Item>
				{/* END Widget */}
			</Portlet.Body>
			<Widget28ComponentChart series={chartSeries} />
		</Portlet>
	)
}

const Widget28ComponentChart: React.FC<Widget28ComponentChartProps> = (props) => {
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
			colors: ['#2196f3'],
			opacity: 0.1,
		},
		stroke: {
			show: true,
			colors: ['#2196f3'],
		},
		markers: {
			colors: [theme === 'dark' ? '#424242' : '#fff'],
			strokeWidth: 4,
			strokeColors: ['#2196f3'],
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
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
			crosshairs: {
				show: false,
			},
		},
	})

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

	return (
		<Widget11 bottom>
			<Chart type="area" width="100%" height={200} options={options} series={props.series} />
		</Widget11>
	)
}

interface Widget28ComponentChartProps {
	series: ApexAxisChartSeries | ApexNonAxisChartSeries
}

// Currency formatter
const currency = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 0,
})

export default Widget28Component
