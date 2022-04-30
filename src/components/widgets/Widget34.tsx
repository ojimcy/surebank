import React from 'react'
import { Portlet, useTheme, Widget10, Widget11, Widget8 } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons'
import { ApexOptions } from 'apexcharts'
import Chart from '@blueupcode/apexcharts'

const Widget34Component = () => {
	const [data] = React.useState({
		highlight: '5,726',
		title: 'Unique visits',
		avatar: (
			<Widget8.Avatar display circle variant="label-danger" className="m-0">
				<FontAwesomeIcon icon={faLink} />
			</Widget8.Avatar>
		),
	})

	const [chartSeries] = React.useState([
		{
			name: 'Visit',
			data: [560, 400, 480, 340, 780, 640],
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
			<Widget34ComponentChart series={chartSeries} />
		</Portlet>
	)
}

const Widget34ComponentChart: React.FC<Widget34ComponentChartProps> = (props) => {
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
			colors: ['#f44336'],
			opacity: 0.1,
		},
		stroke: {
			show: true,
			colors: ['#f44336'],
		},
		markers: {
			colors: [theme === 'dark' ? '#424242' : '#fff'],
			strokeWidth: 4,
			strokeColors: ['#f44336'],
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

interface Widget34ComponentChartProps {
	series: ApexAxisChartSeries | ApexNonAxisChartSeries
}

export default Widget34Component
