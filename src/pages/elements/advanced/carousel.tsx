import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Card, Button, Portlet, CarouselItem, ButtonProps } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons'
import Carousel from '@blueupcode/slick'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const CarouselPage: ExtendedNextPage = () => {
	return (
		<Row>
			<Col md="6">
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Basic</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							These carousels are powered by{' '}
							<a href="http://kenwheeler.github.io/slick" target="_blank" rel="noreferrer">
								slick.js
							</a>
							. The example below is a basic initialization. Put your content or any elements into{' '}
							<code>CarouselItem</code> component.
						</p>
						{/* BEGIN Carousel */}
						<Carousel>
							<CarouselItem>
								{/* BEGIN Card */}
								<Card>
									<Card.Img src="/images/banner/1120x480.webp" alt="Card Image" />
								</Card>
								{/* END Card */}
							</CarouselItem>
							<CarouselItem>
								{/* BEGIN Card */}
								<Card>
									<Card.Img src="/images/banner/1120x480.webp" alt="Card Image" />
								</Card>
								{/* END Card */}
							</CarouselItem>
						</Carousel>
						{/* END Carousel */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Center mode</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Centered carousel, you can enable this feature by setting <code>{'centerMode'}</code> property.
						</p>
						{/* BEGIN Carousel */}
						<Carousel centerMode prevArrow={<CarouselPrev2 />} nextArrow={<CarouselNext2 />}>
							<CarouselItem>
								{/* BEGIN Card */}
								<Card>
									<Card.Img src="/images/banner/1120x480.webp" alt="Card Image" />
								</Card>
								{/* END Card */}
							</CarouselItem>
							<CarouselItem>
								{/* BEGIN Card */}
								<Card>
									<Card.Img src="/images/banner/1120x480.webp" alt="Card Image" />
								</Card>
								{/* END Card */}
							</CarouselItem>
							<CarouselItem>
								{/* BEGIN Card */}
								<Card>
									<Card.Img src="/images/banner/1120x480.webp" alt="Card Image" />
								</Card>
								{/* END Card */}
							</CarouselItem>
						</Carousel>
						{/* END Carousel */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Sync</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>Sync your carousels and make one of them as navigation, look the example.</p>
						<SyncCarousel />
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
			<Col md="6">
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Number of slides</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Set number of slides to show for carousel by setting <code>slidesToShow</code> property.
						</p>
						{/* BEGIN Carousel */}
						<Carousel slidesToShow={3} slidesToScroll={2}>
							<CarouselItem>
								{/* BEGIN Card */}
								<Card>
									<Card.Img src="/images/banner/560x400.webp" alt="Card Image" />
								</Card>
								{/* END Card */}
							</CarouselItem>
							<CarouselItem>
								{/* BEGIN Card */}
								<Card>
									<Card.Img src="/images/banner/560x400.webp" alt="Card Image" />
								</Card>
								{/* END Card */}
							</CarouselItem>
							<CarouselItem>
								{/* BEGIN Card */}
								<Card>
									<Card.Img src="/images/banner/560x400.webp" alt="Card Image" />
								</Card>
								{/* END Card */}
							</CarouselItem>
							<CarouselItem>
								{/* BEGIN Card */}
								<Card>
									<Card.Img src="/images/banner/560x400.webp" alt="Card Image" />
								</Card>
								{/* END Card */}
							</CarouselItem>
						</Carousel>
						{/* END Carousel */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Alternative navigation</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>We provide custom navigation that you can use like example below</p>
						{/* BEGIN Carousel */}
						<Carousel prevArrow={<CarouselPrev3 />} nextArrow={<CarouselNext3 />}>
							<CarouselItem>
								{/* BEGIN Card */}
								<Card>
									<Card.Img src="/images/banner/1120x480.webp" alt="Card Image" />
								</Card>
								{/* END Card */}
							</CarouselItem>
							<CarouselItem>
								{/* BEGIN Card */}
								<Card>
									<Card.Img src="/images/banner/1120x480.webp" alt="Card Image" />
								</Card>
								{/* END Card */}
							</CarouselItem>
						</Carousel>
						{/* END Carousel */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Autoplay</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Set <code>{'autoplay'}</code> to enabled autoplay features and set <code>autoplaySpeed</code> property for
							autoplay speed.
						</p>
						{/* BEGIN Carousel */}
						<Carousel autoplay autoplaySpeed={1000} slidesToShow={2}>
							<CarouselItem>
								{/* BEGIN Card */}
								<Card>
									<Card.Img src="/images/banner/560x400.webp" alt="Card Image" />
								</Card>
								{/* END Card */}
							</CarouselItem>
							<CarouselItem>
								{/* BEGIN Card */}
								<Card>
									<Card.Img src="/images/banner/560x400.webp" alt="Card Image" />
								</Card>
								{/* END Card */}
							</CarouselItem>
							<CarouselItem>
								{/* BEGIN Card */}
								<Card>
									<Card.Img src="/images/banner/560x400.webp" alt="Card Image" />
								</Card>
								{/* END Card */}
							</CarouselItem>
						</Carousel>
						{/* END Carousel */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Dot indicator</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							To enable dot indicator, you must set <code>{'dots'}</code>. The dots have navigation functionality, you
							can click those to change slides.
						</p>
						{/* BEGIN Carousel */}
						<Carousel dots>
							<CarouselItem>
								{/* BEGIN Card */}
								<Card>
									<Card.Img src="/images/banner/1120x480.webp" alt="Card Image" />
								</Card>
								{/* END Card */}
							</CarouselItem>
							<CarouselItem>
								{/* BEGIN Card */}
								<Card>
									<Card.Img src="/images/banner/1120x480.webp" alt="Card Image" />
								</Card>
								{/* END Card */}
							</CarouselItem>
							<CarouselItem>
								{/* BEGIN Card */}
								<Card>
									<Card.Img src="/images/banner/1120x480.webp" alt="Card Image" />
								</Card>
								{/* END Card */}
							</CarouselItem>
						</Carousel>
						{/* END Carousel */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

const SyncCarousel = () => {
	const mainCarousel = React.useRef<any>()
	const navCarousel = React.useRef<any>()

	return (
		<>
			{/* BEGIN Carousel */}
			<Carousel arrows={false} asNavFor={navCarousel.current} ref={mainCarousel}>
				<CarouselItem>
					{/* BEGIN Card */}
					<Card>
						<Card.Img src="/images/banner/1120x480.webp" alt="Card Image" />
					</Card>
					{/* END Card */}
				</CarouselItem>
				<CarouselItem>
					{/* BEGIN Card */}
					<Card>
						<Card.Img src="/images/banner/1120x480.webp" alt="Card Image" />
					</Card>
					{/* END Card */}
				</CarouselItem>
				<CarouselItem>
					{/* BEGIN Card */}
					<Card>
						<Card.Img src="/images/banner/1120x480.webp" alt="Card Image" />
					</Card>
					{/* END Card */}
				</CarouselItem>
				<CarouselItem>
					{/* BEGIN Card */}
					<Card>
						<Card.Img src="/images/banner/1120x480.webp" alt="Card Image" />
					</Card>
					{/* END Card */}
				</CarouselItem>
			</Carousel>
			{/* END Carousel */}
			{/* BEGIN Carousel */}
			<Carousel
				centerMode
				focusOnSelect
				slidesToShow={3}
				asNavFor={mainCarousel.current}
				prevArrow={<CarouselPrev2 />}
				nextArrow={<CarouselNext2 />}
				ref={navCarousel}
				className="mt-4"
			>
				<CarouselItem>
					{/* BEGIN Card */}
					<Card>
						<Card.Img src="/images/banner/560x400.webp" alt="Card Image" />
					</Card>
					{/* END Card */}
				</CarouselItem>
				<CarouselItem>
					{/* BEGIN Card */}
					<Card>
						<Card.Img src="/images/banner/560x400.webp" alt="Card Image" />
					</Card>
					{/* END Card */}
				</CarouselItem>
				<CarouselItem>
					{/* BEGIN Card */}
					<Card>
						<Card.Img src="/images/banner/560x400.webp" alt="Card Image" />
					</Card>
					{/* END Card */}
				</CarouselItem>
				<CarouselItem>
					{/* BEGIN Card */}
					<Card>
						<Card.Img src="/images/banner/560x400.webp" alt="Card Image" />
					</Card>
					{/* END Card */}
				</CarouselItem>
			</Carousel>
			{/* END Carousel */}
		</>
	)
}

const CarouselNext2: React.FC<ButtonProps> = (props) => {
	const { style, onClick } = props

	return (
		<Button className="slick-next-2" variant="flat-primary" style={{ ...style }} onClick={onClick}>
			<FontAwesomeIcon icon={faAngleRight} />
		</Button>
	)
}

const CarouselPrev2: React.FC<ButtonProps> = (props) => {
	const { style, onClick } = props
	return (
		<Button className="slick-prev-2" variant="flat-primary" style={{ ...style }} onClick={onClick}>
			<FontAwesomeIcon icon={faAngleLeft} />
		</Button>
	)
}

const CarouselNext3: React.FC<ButtonProps> = (props) => {
	const { style, onClick } = props
	return (
		<Button className="slick-next-3" variant="flat-primary" style={{ ...style }} onClick={onClick}>
			<FontAwesomeIcon icon={faAngleRight} />
		</Button>
	)
}

const CarouselPrev3: React.FC<ButtonProps> = (props) => {
	const { style, onClick } = props
	return (
		<Button className="slick-prev-3" variant="flat-primary" style={{ ...style }} onClick={onClick}>
			<FontAwesomeIcon icon={faAngleLeft} />
		</Button>
	)
}

CarouselPage.pageTitle = 'Carousel'
CarouselPage.activeLink = 'elements.advanced.carousel'
CarouselPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Advanced' },
	{ text: 'Carousel', link: '/elements/advanced/carousel' },
]

export default withAuth(CarouselPage)
