import React from 'react'
import { Portlet, useTheme } from '@blueupcode/components'
import { ApexOptions } from 'apexcharts'
import Chart from '@blueupcode/apexcharts'

const Widget32Component = () => {
	const [data] = React.useState({
		title: 'Page views',
		subtitle: 'Check out the chart',
	})

	const [chartSeries] = React.useState([
		{
			name: 'Visit',
			data: [320, 450, 360, 560, 440, 480],
		},
	])

	return (
		<Portlet variant="primary">
			<Portlet.Body>
				<h4>{data.title}</h4>
				<span>{data.subtitle}</span>
				<Widget32ComponentChart series={chartSeries} />
			</Portlet.Body>
		</Portlet>
	)
}

const Widget32ComponentChart: React.FC<Widget32ComponentChartProps> = (props) => {
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
			strokeColors: '#fff',
		},
		stroke: {
			show: true,
			colors: ['#fff'],
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
		}))
	}, [theme])

	return <Chart type="area" width="100%" height={150} options={options} series={props.series} />
}

interface Widget32ComponentChartProps {
	series: ApexAxisChartSeries | ApexNonAxisChartSeries
}

export default Widget32Component
