import React from 'react'
import { Col, Portlet, ProgressBar, Row, Widget4 } from '@blueupcode/components'

const Widget7Component = () => {
	const [list] = React.useState([
		{
			title: 'Completed Transactions',
			highlight: '54,234',
			isProgress: false,
		},
		{
			title: 'Avarage Product Price',
			highlight: '$67,50',
			isProgress: false,
		},
		{
			title: 'New Orders',
			highlight: '242',
			isProgress: false,
		},
		{
			title: 'Satisfication Rate',
			highlight: '90%',
			progress: 90,
			isProgress: true,
		},
	])

	return (
		<Portlet>
			<Portlet.Body>
				<Row className="g-2">
					{list.map((data, index) => (
						<Col sm="6" key={index}>
							{data.isProgress ? (
								<Widget7ComponentProgress
									title={data.title}
									highlight={data.highlight}
									progress={data.progress as number}
								/>
							) : (
								<Widget7ComponentDisplay title={data.title} highlight={data.highlight} />
							)}
						</Col>
					))}
				</Row>
			</Portlet.Body>
		</Portlet>
	)
}

const Widget7ComponentDisplay: React.FC<Widget7ComponentDisplayProps> = ({ title, highlight, ...props }) => {
	return (
		<Widget4 {...props}>
			<Widget4.Group>
				<Widget4.Display>
					<Widget4.Subtitle>{title}</Widget4.Subtitle>
					<Widget4.Highlight>{highlight}</Widget4.Highlight>
				</Widget4.Display>
			</Widget4.Group>
		</Widget4>
	)
}

interface Widget7ComponentDisplayProps {
	title: string
	highlight: string
}

const Widget7ComponentProgress: React.FC<Widget7ComponentProgressProps> = ({
	title,
	highlight,
	progress,
	...props
}) => {
	return (
		<Widget4 {...props}>
			<Widget4.Group>
				<Widget4.Display>
					<Widget4.Subtitle>{title}</Widget4.Subtitle>
				</Widget4.Display>
				<Widget4.Addon>
					<Widget4.Subtitle>{highlight}</Widget4.Subtitle>
				</Widget4.Addon>
			</Widget4.Group>
			<ProgressBar now={progress} variant="primary" />
		</Widget4>
	)
}

interface Widget7ComponentProgressProps {
	title: string
	highlight: string
	progress: number
}

export default Widget7Component
