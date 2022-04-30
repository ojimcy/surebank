import React from 'react'
import { Portlet, RichList, Avatar, Button } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserTag } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'
import Link from 'next/link'

const Widget15Component = () => {
	const [list] = React.useState([
		{
			image: '/images/avatar/blank.webp',
			name: 'Airi Satou',
			job: 'Accountant',
			link: '#',
			feed: (
				<>
					Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatem optio libero deleniti minus culpa modi,
					quam rem eius quaerat aut.
				</>
			),
		},
		{
			image: '/images/avatar/blank.webp',
			name: 'Cedric Kelly',
			job: 'Senior Developer',
			link: '#',
			feed: (
				<>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Minus non, in, culpa libero quidem consequatur.</>
			),
		},
		{
			image: '/images/avatar/blank.webp',
			name: 'Brielle Williamson',
			job: 'Integration Specialist',
			link: '#',
			feed: (
				<>
					Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae nesciunt blanditiis tempora eius
					accusamus, libero facere amet! Neque quis odio dicta dolor, eaque consectetur. Nihil?
				</>
			),
		},
		{
			image: '/images/avatar/blank.webp',
			name: 'Sonya Frost',
			job: 'Software Engineer',
			link: '#',
			feed: (
				<>
					Lorem ipsum dolor sit amet, consectetur adipisicing elit. Expedita praesentium rem aut aliquam perferendis
					harum molestiae cum beatae, perspiciatis, at nisi reprehenderit minus voluptatibus veritatis. Iste laborum
					possimus nobis vero?
				</>
			),
		},
	])

	return (
		<Portlet>
			<Portlet.Header bordered>
				<Portlet.Icon>
					<FontAwesomeIcon icon={faUserTag} />
				</Portlet.Icon>
				<Portlet.Title>User feeds</Portlet.Title>
			</Portlet.Header>
			<Portlet.Body>
				{/* BEGIN Rich List */}
				<RichList flush>
					{list.map((data, index) => (
						<RichList.Item key={index} className="flex-column align-items-stretch">
							<RichList.Item className="p-0">
								<RichList.Addon addonType="prepend">
									{/* BEGIN Avatar */}
									<Avatar display>
										<Image src={data.image} layout="fill" alt="Avatar image" />
									</Avatar>
									{/* EBD Avatar */}
								</RichList.Addon>
								<RichList.Content>
									<RichList.Title>{data.name}</RichList.Title>
									<RichList.Subtitle>{data.job}</RichList.Subtitle>
								</RichList.Content>
								<RichList.Addon addonType="append">
									<Link href={data.link} passHref>
										<Button variant="label-primary">Follow</Button>
									</Link>
								</RichList.Addon>
							</RichList.Item>
							<p className="text-justify mb-0 mt-2">{data.feed}</p>
						</RichList.Item>
					))}
				</RichList>
				{/* END Rich List */}
			</Portlet.Body>
		</Portlet>
	)
}

export default Widget15Component
