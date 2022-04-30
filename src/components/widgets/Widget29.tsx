import React from 'react'
import { Portlet, useTheme, Widget10, Widget11, Widget8 } from '@blueupcode/components'
import { faBoxes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ApexOptions } from 'apexcharts'
import Chart from '@blueupcode/apexcharts'

const Widget29Component = () => {
	const [data] = React.useState({
		highlight: '87,123',
		title: 'Order received',
		avatar: (
			<Widget8.Avatar display circle variant="label-success" className="m-0">
				<FontAwesomeIcon icon={faBoxes} />
			</Widget8.Avatar>
		),
	})

	const [chartSeries] = React.useState([
		{
			name: 'Order',
			data: [2000, 4000, 3600, 6200, 2800, 6400],
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
			<Widget29ComponentChart series={chartSeries} />
		</Portlet>
	)
}

const Widget29ComponentChart: React.FC<Widget29ComponentChartProps> = (props) => {
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
			colors: ['#4caf50'],
			opacity: 0.1,
		},
		stroke: {
			show: true,
			colors: ['#4caf50'],
		},
		markers: {
			colors: [theme === 'dark' ? '#424242' : '#fff'],
			strokeWidth: 4,
			strokeColors: ['#4caf50'],
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

interface Widget29ComponentChartProps {
	series: ApexAxisChartSeries | ApexNonAxisChartSeries
}

export default Widget29Component
