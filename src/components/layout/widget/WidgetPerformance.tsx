import React from 'react'
import { Portlet, ProgressBar, Widget4 } from '@blueupcode/components'
import { Variant } from '@blueupcode/components/types'
import { faBolt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const WidgetPerformance: React.FC<WidgetPerformanceProps> = ({ performances }) => {
	return (
		<Portlet>
			<Portlet.Header bordered>
				<Portlet.Icon>
					<FontAwesomeIcon icon={faBolt} />
				</Portlet.Icon>
				<Portlet.Title>Performance</Portlet.Title>
			</Portlet.Header>
			<Portlet.Body>
				<div className="d-grid gap-3">
					{performances.map((performance, index) => (
						<Widget4 key={index}>
							<Widget4.Group>
								<Widget4.Display>
									<Widget4.Subtitle>{performance.title}</Widget4.Subtitle>
								</Widget4.Display>
								<Widget4.Addon>
									<Widget4.Subtitle className={`text-${performance.variant}`}>{performance.subtitle}</Widget4.Subtitle>
								</Widget4.Addon>
							</Widget4.Group>
							<ProgressBar now={performance.now} variant={performance.variant} size="sm" />
						</Widget4>
					))}
				</div>
			</Portlet.Body>
		</Portlet>
	)
}

export interface WidgetPerformanceProps {
	performances: WidgetPerformanceData[]
}

export interface WidgetPerformanceData {
	title: string
	subtitle: string
	variant: Variant
	now: number
}

export default WidgetPerformance
