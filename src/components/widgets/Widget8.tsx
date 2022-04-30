import React from 'react'
import { Portlet, Widget4, ProgressBar } from '@blueupcode/components'
import { ProgressBarVariant } from '@blueupcode/components/progress/ProgressBar'

const Widget8Component = () => {
	const [list] = React.useState([
		{
			title: 'New Orders',
			subtitle: 'Fresh Order Amount',
			highlight: 523,
			change: 75,
			color: 'info',
		},
		{
			title: 'New Users',
			subtitle: 'Joined New User',
			highlight: 138,
			change: 60,
			color: 'success',
		},
	])

	return (
		<Portlet>
			<Portlet.Body>
				{list.map((data, index) => (
					<React.Fragment key={index}>
						<Widget4>
							<Widget4.Group>
								<Widget4.Display>
									<Widget4.Title>{data.title}</Widget4.Title>
									<Widget4.Subtitle>{data.subtitle}</Widget4.Subtitle>
								</Widget4.Display>
								<Widget4.Addon>
									<Widget4.Highlight className={`text-${data.color}`}>{data.highlight}</Widget4.Highlight>
								</Widget4.Addon>
							</Widget4.Group>
							<ProgressBar now={data.change} variant={data.color as ProgressBarVariant} size="sm" />
							<Widget4.Group>
								<Widget4.Display>
									<Widget4.Subtitle>Change</Widget4.Subtitle>
								</Widget4.Display>
								<Widget4.Addon>
									<span className="text-muted">{data.change}%</span>
								</Widget4.Addon>
							</Widget4.Group>
						</Widget4>
						{list.length - 1 > index && <hr />}
					</React.Fragment>
				))}
			</Portlet.Body>
		</Portlet>
	)
}

export default Widget8Component
