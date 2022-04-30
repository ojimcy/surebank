import React from 'react'
import { Avatar, Dropdown, Portlet, RichList, useTheme } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPython, faFacebook, faAngular, faApple } from '@fortawesome/free-brands-svg-icons'
import { faBullhorn, faChartLine, faChartPie, faCog, faPoll } from '@fortawesome/free-solid-svg-icons'
import { ApexOptions } from 'apexcharts'
import Chart from '@blueupcode/apexcharts'

const Widget27Component = () => {
	const [list] = React.useState([
		{
			avatar: (
				<Avatar display variant="label-warning">
					<FontAwesomeIcon icon={faPython} />
				</Avatar>
			),
			brand: 'Python',
			category: 'Programming language',
		},
		{
			avatar: (
				<Avatar display variant="label-primary">
					<FontAwesomeIcon icon={faFacebook} />
				</Avatar>
			),
			brand: 'Facebook',
			category: 'Social media',
		},
		{
			avatar: (
				<Avatar display variant="label-danger">
					<FontAwesomeIcon icon={faAngular} />
				</Avatar>
			),
			brand: 'Angular',
			category: 'Javascript framework',
		},
		{
			avatar: (
				<Avatar display variant="label-secondary">
					<FontAwesomeIcon icon={faApple} />
				</Avatar>
			),
			brand: 'Apple',
			category: 'Technology brand',
		},
	])

	const [chartSeries] = React.useState([
		{
			name: 'Unique',
			data: [6400, 4000, 7600, 6200, 9800, 6400, 8600, 7000],
		},
	])

	return (
		<Portlet>
			<Portlet.Header>
				<Portlet.Icon>
					<FontAwesomeIcon icon={faBullhorn} />
				</Portlet.Icon>
				<Portlet.Title>Trends</Portlet.Title>
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
							<Dropdown.Divider />
							<Dropdown.Item href="#" icon={<FontAwesomeIcon icon={faCog} />}>
								Customize
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
					{/* END Dropdown */}
				</Portlet.Addon>
			</Portlet.Header>
			<Widget27ComponentChart series={chartSeries} />
			<Portlet.Body>
				{/* BEGIN Rich List */}
				<RichList flush>
					{list.map((listItem, index) => (
						<RichList.Item key={index}>
							<RichList.Addon addonType="prepend">{listItem.avatar}</RichList.Addon>
							<RichList.Content>
								<RichList.Title>{listItem.brand}</RichList.Title>
								<RichList.Subtitle>{listItem.category}</RichList.Subtitle>
							</RichList.Content>
						</RichList.Item>
					))}
				</RichList>
				{/* END Rich List */}
			</Portlet.Body>
		</Portlet>
	)
}

const Widget27ComponentChart: React.FC<Widget27ComponentChartProps> = (props) => {
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
		markers: {
			strokeColors: theme === 'dark' ? '#424242' : '#fff',
		},
		fill: {
			type: 'gradient',
			gradient: {
				shade: theme,
				type: 'vertical',
				opacityFrom: 1,
				opacityTo: 0,
				stops: [0, 100],
			},
		},
		tooltip: {
			marker: {
				show: false,
			},
			y: {
				formatter: (val) => `${val} Visited`, // Format chart tooltip value
			},
		},
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
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
			fill: {
				gradient: { shade: theme },
			},
		}))
	}, [theme])

	return <Chart type="area" className="my-3" width="100%" height={300} options={options} series={props.series} />
}

interface Widget27ComponentChartProps {
	series: ApexAxisChartSeries | ApexNonAxisChartSeries
}

export default Widget27Component
