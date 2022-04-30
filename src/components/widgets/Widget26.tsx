import React from 'react'
import { Button, Col, Portlet, Row, useTheme } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBoxes, faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { ApexOptions } from 'apexcharts'
import Chart from '@blueupcode/apexcharts'
import Link from 'next/link'

const Widget26Component = () => {
	const [data] = React.useState({
		highlight: '3,478',
		title: 'Sales this month',
		link: '#',
	})

	const [list] = React.useState([
		<>
			<span className="text-success">
				<FontAwesomeIcon icon={faCaretUp} /> +11% more sales
			</span>{' '}
			in comparison to last month
		</>,
		<>
			<span className="text-danger">
				<FontAwesomeIcon icon={faCaretDown} /> -2% revenue pre sales
			</span>{' '}
			in comparison to last month
		</>,
	])

	const [chartSeries] = React.useState([
		{
			name: 'Sales',
			data: [640, 400, 760, 620, 980, 640],
		},
	])

	return (
		<Portlet>
			<Portlet.Header bordered>
				<Portlet.Icon>
					<FontAwesomeIcon icon={faBoxes} />
				</Portlet.Icon>
				<Portlet.Title>Sales changes</Portlet.Title>
			</Portlet.Header>
			<Portlet.Body>
				<Row>
					<Col md="6" lg="5" className="p-5">
						<h3 className="display-4">{data.highlight}</h3>
						<span className="text-muted">{data.title}</span>
						{list.map((listItem, index) => (
							<p key={index} className="text-level-2 my-3">
								{listItem}
							</p>
						))}
						<Link href={data.link} passHref>
							<Button variant="label-primary" width="widest">
								View details
							</Button>
						</Link>
					</Col>
					<Col md="6" lg="7">
						<Widget26ComponentChart series={chartSeries} />
					</Col>
				</Row>
			</Portlet.Body>
		</Portlet>
	)
}

const Widget26ComponentChart: React.FC<Widget26ComponentChartProps> = (props) => {
	const { resolvedTheme: theme } = useTheme()

	const [options, setOptions] = React.useState<ApexOptions>({
		theme: {
			mode: theme as ApexTheme['mode'],
			palette: 'palette1',
		},
		chart: {
			background: 'transparent',
			toolbar: {
				show: false,
			},
		},
		dataLabels: {
			enabled: false,
		},
		fill: {
			opacity: 0,
			type: 'solid',
		},
		stroke: {
			show: true,
			colors: ['#2196f3'],
			lineCap: 'round',
		},
		markers: {
			colors: [theme === 'dark' ? '#424242' : '#fff'],
			strokeWidth: 4,
			strokeColors: '#2196f3',
		},
		tooltip: {
			marker: {
				show: false,
			},
			y: {
				formatter: (val) => `${val} Products`, // Format chart tooltip value
			},
		},
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
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

	return <Chart type="area" width="100%" height={300} options={options} series={props.series} />
}

interface Widget26ComponentChartProps {
	series: ApexAxisChartSeries | ApexNonAxisChartSeries
}

export default Widget26Component
