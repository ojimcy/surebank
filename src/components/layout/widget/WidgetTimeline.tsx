import React from 'react'
import { Marker, Portlet, RichList, Timeline } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTasks } from '@fortawesome/free-solid-svg-icons'

const WidgetTimeline: React.FC<WidgetTimelineProps> = ({ title, timeline }) => {
	return (
		<Portlet>
			<Portlet.Header bordered>
				<Portlet.Icon>
					<FontAwesomeIcon icon={faTasks} />
				</Portlet.Icon>
				<Portlet.Title>{title}</Portlet.Title>
			</Portlet.Header>
			<Portlet.Body>
				<Timeline className="rich-list-bordered">
					{timeline.map((timelineItem, index) => (
						<Timeline.Item key={index} pin={timelineItem.marker}>
							<RichList.Item content>
								<RichList.Title>{timelineItem.time}</RichList.Title>
								<RichList.Subtitle>{timelineItem.text}</RichList.Subtitle>
							</RichList.Item>
						</Timeline.Item>
					))}
				</Timeline>
			</Portlet.Body>
		</Portlet>
	)
}

export interface WidgetTimelineProps {
	title: string
	timeline: WidgetTimelineData[]
}

export interface WidgetTimelineData {
	time: string
	text: string
	marker: React.ReactNode
}

export default WidgetTimeline
