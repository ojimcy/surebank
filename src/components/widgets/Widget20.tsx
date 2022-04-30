import React from 'react'
import { Portlet, Widget9 } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faCloud,
	faCloudRain,
	faCloudShowersHeavy,
	faCloudSun,
	faCloudSunRain,
	faCompass,
	faFan,
	faMapMarkerAlt,
} from '@fortawesome/free-solid-svg-icons'

const Widget20Component = () => {
	const [data] = React.useState({
		degreeSign: '°C',
		highlightIcon: <FontAwesomeIcon icon={faCloudSunRain} />,
		highlightContent: '28',
	})

	const [grid] = React.useState([
		{
			icon: <FontAwesomeIcon icon={faFan} />,
			content: '12 KM',
		},
		{
			icon: <FontAwesomeIcon icon={faCompass} />,
			content: 'NW',
		},
		{
			icon: <FontAwesomeIcon icon={faCloud} />,
			content: '98%',
		},
	])

	const [list] = React.useState([
		{
			icon: <FontAwesomeIcon icon={faCloudSun} />,
			content: '30',
			info: 'Sun',
		},
		{
			icon: <FontAwesomeIcon icon={faCloudRain} />,
			content: '25',
			info: 'Tue',
		},
		{
			icon: <FontAwesomeIcon icon={faCloudShowersHeavy} />,
			content: '22',
			info: 'Wed',
		},
	])

	return (
		<Portlet>
			<Portlet.Header>
				<Portlet.Icon>
					<FontAwesomeIcon icon={faMapMarkerAlt} />
				</Portlet.Icon>
				<Portlet.Title>Weather</Portlet.Title>
			</Portlet.Header>
			<Portlet.Body className="p-0">
				{/* BEGIN Widget */}
				<Widget9>
					<Widget9.Display>
						<Widget9.Icon>{data.highlightIcon}</Widget9.Icon>
						<Widget9.Text>
							{data.highlightContent} <Widget9.Degree>{data.degreeSign}</Widget9.Degree>
						</Widget9.Text>
					</Widget9.Display>
					<Widget9.Grid>
						{grid.map((gridItem, index) => (
							<Widget9.GridItem key={index}>
								<Widget9.GridIcon>{gridItem.icon}</Widget9.GridIcon>
								<Widget9.GridText>{gridItem.content}</Widget9.GridText>
							</Widget9.GridItem>
						))}
					</Widget9.Grid>
					<Widget9.List>
						{list.map((listItem, index) => (
							<Widget9.ListItem key={index}>
								<Widget9.ListText>{listItem.info}</Widget9.ListText>
								<Widget9.ListAddon>
									<Widget9.Display size="sm">
										<Widget9.Icon>{listItem.icon}</Widget9.Icon>
										<Widget9.Text>
											{listItem.content} <Widget9.Degree>{data.degreeSign}</Widget9.Degree>
										</Widget9.Text>
									</Widget9.Display>
								</Widget9.ListAddon>
							</Widget9.ListItem>
						))}
					</Widget9.List>
				</Widget9>
				{/* END Widget */}
			</Portlet.Body>
		</Portlet>
	)
}

export default Widget20Component
