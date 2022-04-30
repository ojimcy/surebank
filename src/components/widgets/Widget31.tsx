import React from 'react'
import { Portlet, useTheme } from '@blueupcode/components'
import { ApexOptions } from 'apexcharts'
import Chart from '@blueupcode/apexcharts'

const Widget31Component = () => {
	const [data] = React.useState({
		title: 'New users',
		subtitle: 'Last 6 months',
	})

	const [chartSeries] = React.useState([
		{
			name: 'Users',
			data: [640, 400, 760, 620, 980, 640],
		},
	])

	return (
		<Portlet>
			<Portlet.Body>
				<h4 className="text-primary">{data.title}</h4>
				<span className="text-muted">{data.subtitle}</span>
				<Widget31ComponentChart series={chartSeries} />
			</Portlet.Body>
		</Portlet>
	)
}

const Widget31ComponentChart: React.FC<Widget31ComponentChartProps> = (props) => {
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
			opacity: 0,
		},
		markers: {
			strokeColors: theme === 'dark' ? '#424242' : '#fff',
		},
		stroke: {
			show: true,
			colors: ['#2196f3'],
			lineCap: 'round',
		},
		tooltip: {
			marker: {
				show: false,
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
				strokeColors: theme === 'dark' ? '#424242' : '#fff',
			},
		}))
	}, [theme])

	return <Chart type="area" width="100%" height={150} options={options} series={props.series} />
}

interface Widget31ComponentChartProps {
	series: ApexAxisChartSeries | ApexNonAxisChartSeries
}

export default Widget31Component
