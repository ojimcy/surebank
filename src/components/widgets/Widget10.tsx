import React from 'react'
import { Avatar, Badge, CarouselItem, Portlet, RichList, Widget6 } from '@blueupcode/components'
import { faFunnelDollar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Carousel from '@blueupcode/slick'
import Image from 'next/image'

const Widget10Component = () => {
	const mainCarousel = React.useRef<any>()
	const navCarousel = React.useRef<any>()

	const [list] = React.useState([
		{
			key: 'software-engineer',
			job: 'Software Engineer',
			office: 'San Francisco',
			employees: [
				{
					image: '/images/avatar/blank.webp',
					name: 'Angelica Ramos',
					earning: '$162,700',
					change: '+$17',
					color: 'success',
				},
				{
					image: '/images/avatar/blank.webp',
					name: 'Airi Satou',
					earning: '$433,060',
					change: '-$127',
					color: 'danger',
				},
				{
					image: '/images/avatar/blank.webp',
					name: 'Colleen Hurst',
					earning: '$205,500',
					change: '+$56',
					color: 'success',
				},
				{
					image: '/images/avatar/blank.webp',
					name: 'Brielle Williamson',
					earning: '$86,000',
					change: '+$6',
					color: 'success',
				},
				{
					image: '/images/avatar/blank.webp',
					name: 'Garrett Winters',
					earning: '$327,900',
					change: '-$25',
					color: 'danger',
				},
			],
		},
		{
			key: 'javascript-developer',
			job: 'Javascript Developer',
			office: 'Singapore',
			employees: [
				{
					image: '/images/avatar/blank.webp',
					name: 'Airi Satou',
					earning: '$433,060',
					change: '-$127',
					color: 'danger',
				},
				{
					image: '/images/avatar/blank.webp',
					name: 'Angelica Ramos',
					earning: '$162,700',
					change: '+$17',
					color: 'success',
				},
				{
					image: '/images/avatar/blank.webp',
					name: 'Garrett Winters',
					earning: '$327,900',
					change: '-$25',
					color: 'danger',
				},
				{
					image: '/images/avatar/blank.webp',
					name: 'Brielle Williamson',
					earning: '$86,000',
					change: '+$6',
					color: 'success',
				},
				{
					image: '/images/avatar/blank.webp',
					name: 'Colleen Hurst',
					earning: '$205,500',
					change: '+$56',
					color: 'success',
				},
			],
		},
		{
			key: 'marketing-designer',
			job: 'Marketing Designer',
			office: 'Edinburgh',
			employees: [
				{
					image: '/images/avatar/blank.webp',
					name: 'Airi Satou',
					earning: '$433,060',
					change: '-$127',
					color: 'danger',
				},
				{
					image: '/images/avatar/blank.webp',
					name: 'Colleen Hurst',
					earning: '$205,500',
					change: '+$56',
					color: 'success',
				},
				{
					image: '/images/avatar/blank.webp',
					name: 'Brielle Williamson',
					earning: '$86,000',
					change: '+$6',
					color: 'success',
				},
				{
					image: '/images/avatar/blank.webp',
					name: 'Garrett Winters',
					earning: '$327,900',
					change: '-$25',
					color: 'danger',
				},
				{
					image: '/images/avatar/blank.webp',
					name: 'Angelica Ramos',
					earning: '$162,700',
					change: '+$17',
					color: 'success',
				},
			],
		},
	])

	return (
		<Portlet>
			<Portlet.Header>
				<Portlet.Icon>
					<FontAwesomeIcon icon={faFunnelDollar} />
				</Portlet.Icon>
				<Portlet.Title>Employee salary</Portlet.Title>
			</Portlet.Header>
			<Carousel
				centerMode
				slidesToShow={1}
				slidesToScroll={1}
				arrows={false}
				asNavFor={mainCarousel.current}
				className="my-3"
				ref={navCarousel}
			>
				{list.map((data) => (
					<CarouselItem key={data.key}>
						{/* BEGIN Widget */}
						<Widget6>
							<Widget6.Title>{data.job}</Widget6.Title>
							<Widget6.Subtitle>{data.office}</Widget6.Subtitle>
						</Widget6>
						{/* END Widget */}
					</CarouselItem>
				))}
			</Carousel>
			<Portlet.Body>
				<Carousel slidesToShow={1} slidesToScroll={1} arrows={false} asNavFor={navCarousel.current} ref={mainCarousel}>
					{list.map((data) => (
						<CarouselItem key={data.key}>
							<RichList>
								{data.employees.map((employee, index) => (
									<RichList.Item key={index}>
										<RichList.Addon addonType="prepend">
											{/* BEGIN Avatar */}
											<Avatar display>
												<Image src={employee.image} layout="fill" alt="Avatar image" />
											</Avatar>
											{/* END Avatar */}
										</RichList.Addon>
										<RichList.Content>
											<RichList.Title>{employee.name}</RichList.Title>
											<RichList.Subtitle>{employee.earning}</RichList.Subtitle>
										</RichList.Content>
										<RichList.Addon addonType="append">
											<Badge className="fs-6" variant={`label-${employee.color}`}>
												{employee.change}
											</Badge>
										</RichList.Addon>
									</RichList.Item>
								))}
							</RichList>
						</CarouselItem>
					))}
				</Carousel>
			</Portlet.Body>
		</Portlet>
	)
}

export default Widget10Component
