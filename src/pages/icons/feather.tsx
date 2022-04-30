import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Widget18 } from '@blueupcode/components'
import * as FeatherIcon from 'react-feather'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const FeatherPage: ExtendedNextPage = () => {
	return (
		<Row>
			<Col xs="12">
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Feather</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							<strong>Feather icons</strong> are simply beautiful open source icons that you can use for your website.
							Check{' '}
							<a href="http://feathericons.com" target="_blank" rel="noreferrer">
								Feather&apos;s homepage
							</a>{' '}
							for more information.
						</p>
						<hr />
						<Row>
							{[
								{ icon: <FeatherIcon.AlertCircle />, text: 'alert-circle' },
								{ icon: <FeatherIcon.AlignCenter />, text: 'align-center' },
								{ icon: <FeatherIcon.AlignJustify />, text: 'align-justify' },
								{ icon: <FeatherIcon.Anchor />, text: 'anchor' },
								{ icon: <FeatherIcon.Archive />, text: 'archive' },
								{ icon: <FeatherIcon.ArrowDown />, text: 'arrow-down' },
								{ icon: <FeatherIcon.ArrowUp />, text: 'arrow-up' },
								{ icon: <FeatherIcon.ArrowLeft />, text: 'arrow-left' },
								{ icon: <FeatherIcon.ArrowRight />, text: 'arrow-right' },
								{ icon: <FeatherIcon.AtSign />, text: 'at-sign' },
								{ icon: <FeatherIcon.BarChart />, text: 'bar-chart' },
								{ icon: <FeatherIcon.Battery />, text: 'battery' },
								{ icon: <FeatherIcon.Clock />, text: 'clock' },
								{ icon: <FeatherIcon.Cloud />, text: 'cloud' },
								{ icon: <FeatherIcon.Code />, text: 'code' },
								{ icon: <FeatherIcon.Columns />, text: 'columns' },
								{ icon: <FeatherIcon.Copy />, text: 'copy' },
								{ icon: <FeatherIcon.CheckSquare />, text: 'check-square' },
								{ icon: <FeatherIcon.Bell />, text: 'bell' },
								{ icon: <FeatherIcon.Book />, text: 'book' },
								{ icon: <FeatherIcon.Bookmark />, text: 'bookmark' },
								{ icon: <FeatherIcon.Camera />, text: 'camera' },
								{ icon: <FeatherIcon.Cast />, text: 'cast' },
								{ icon: <FeatherIcon.Clipboard />, text: 'clipboard' },
								{ icon: <FeatherIcon.CreditCard />, text: 'credit-card' },
								{ icon: <FeatherIcon.Crop />, text: 'crop' },
								{ icon: <FeatherIcon.Database />, text: 'database' },
								{ icon: <FeatherIcon.DollarSign />, text: 'dollar-sign' },
								{ icon: <FeatherIcon.Download />, text: 'download' },
								{ icon: <FeatherIcon.Edit />, text: 'edit' },
								{ icon: <FeatherIcon.Eye />, text: 'eye' },
								{ icon: <FeatherIcon.Grid />, text: 'grid' },
								{ icon: <FeatherIcon.Hash />, text: 'hash' },
								{ icon: <FeatherIcon.Headphones />, text: 'headphones' },
								{ icon: <FeatherIcon.Home />, text: 'home' },
								{ icon: <FeatherIcon.Image />, text: 'image' },
							].map(({ icon, text }, index) => (
								<Col key={index} md="2">
									<Widget18 icon={icon}>{text}</Widget18>
								</Col>
							))}
						</Row>
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

FeatherPage.pageTitle = 'Feather'
FeatherPage.activeLink = 'elements.icons.feather'
FeatherPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Icon' },
	{ text: 'Feather', link: '/icons/feather' },
]

export default withAuth(FeatherPage)
