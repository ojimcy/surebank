import React from 'react'
import { Button, Dropdown, Nav, Portlet, RichList, Tab, Widget1, Widget2 } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine, faChartPie, faCog, faPoll } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'

const Widget1Component = () => {
	const [data] = React.useState({
		highlight: '$237,650',
		tabs: [
			{
				key: 'march',
				time: 'March',
				data: [
					{
						highlight: '$23,050',
						title: 'Annual companies taxes',
					},
					{
						highlight: '$46,50',
						title: 'Avarage product price',
					},
					{
						highlight: '$260,700',
						title: 'Total annual profit before tax',
					},
				],
			},
			{
				key: 'april',
				time: 'April',
				data: [
					{
						highlight: '$13,000',
						title: 'Annual companies taxes',
					},
					{
						highlight: '$34,00',
						title: 'Avarage product price',
					},
					{
						highlight: '$350,650',
						title: 'Total annual profit before tax',
					},
				],
			},
			{
				key: 'mei',
				time: 'Mei',
				data: [
					{
						highlight: '$3,050',
						title: 'Annual companies taxes',
					},
					{
						highlight: '$16,20',
						title: 'Avarage product price',
					},
					{
						highlight: '$135,500',
						title: 'Total annual profit before tax',
					},
				],
			},
			{
				key: 'june',
				time: 'June',
				data: [
					{
						highlight: '$56,650',
						title: 'Annual companies taxes',
					},
					{
						highlight: '$35,50',
						title: 'Avarage product price',
					},
					{
						highlight: '$341,080',
						title: 'Total annual profit before tax',
					},
				],
			},
		],
	})

	return (
		<Widget1>
			<Widget1.Display size="lg" top className="bg-primary text-white">
				<Widget1.Group>
					<Widget1.Title>Company income</Widget1.Title>
					<Widget1.Addon>
						{/* BEGIN Dropdown */}
						<Dropdown>
							<Dropdown.Toggle variant="label-light">Option</Dropdown.Toggle>
							<Dropdown.Menu animated align="end">
								<Dropdown.Item icon={<FontAwesomeIcon icon={faPoll} />}>Report</Dropdown.Item>
								<Dropdown.Item icon={<FontAwesomeIcon icon={faChartPie} />}>Charts</Dropdown.Item>
								<Dropdown.Item icon={<FontAwesomeIcon icon={faChartLine} />}>Statistics</Dropdown.Item>
								<Dropdown.Item icon={<FontAwesomeIcon icon={faCog} />}>Settings</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>
						{/* END Dropdown */}
					</Widget1.Addon>
				</Widget1.Group>
				<Widget1.Dialog>
					<Widget1.DialogContent>
						<h1 className="display-3">{data.highlight}</h1>
					</Widget1.DialogContent>
				</Widget1.Dialog>
				<Widget1.Offset>
					<Link href="#" passHref>
						<Button variant="flat-secondary" size="lg" width="widest" height="tallest" pill>
							All Earnings
						</Button>
					</Link>
				</Widget1.Offset>
			</Widget1.Display>
			<Widget1.Body className="pt-5">
				<Widget1ComponentTab tabData={data.tabs} />
			</Widget1.Body>
		</Widget1>
	)
}

const Widget1ComponentTab: React.FC<Widget1ComponentTabProps> = ({ tabData }) => {
	const defaultTabKey = 0

	return (
		<Tab.Container defaultActiveKey={tabData[defaultTabKey].key}>
			{/* BEGIN Nav */}
			<div className="mb-4">
				<Widget2 size="lg" justify>
					{tabData.map((tabDataItem) => (
						<Nav.Item key={tabDataItem.key}>
							<Nav.Link eventKey={tabDataItem.key}>{tabDataItem.time}</Nav.Link>
						</Nav.Item>
					))}
				</Widget2>
			</div>
			{/* END Nav */}
			{/* BEGIN Tabs */}
			<Tab.Content>
				{tabData.map((tabDataItem) => (
					<Tab.Pane key={tabDataItem.key} eventKey={tabDataItem.key}>
						{/* BEGIN Portlet */}
						<Portlet noMargin>
							{/* BEGIN Rich List */}
							<RichList flush>
								{tabDataItem.data.map((tabDataChildItem, key) => (
									<RichList.Item key={key} content>
										<RichList.Title>{tabDataChildItem.highlight}</RichList.Title>
										<RichList.Subtitle>{tabDataChildItem.title}</RichList.Subtitle>
									</RichList.Item>
								))}
							</RichList>
							{/* END Rich List */}
						</Portlet>
						{/* END Portlet */}
					</Tab.Pane>
				))}
			</Tab.Content>
			{/* END Tabs */}
		</Tab.Container>
	)
}

export interface Widget1ComponentTabProps {
	tabData: Widget1ComponentTabData[]
}

export interface Widget1ComponentTabData {
	key: string
	time: string
	data: {
		highlight: string
		title: string
	}[]
}

export default Widget1Component
