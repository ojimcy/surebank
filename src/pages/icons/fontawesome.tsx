import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Widget18 } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as RegularIcon from '@fortawesome/free-regular-svg-icons'
import * as BrandsIcon from '@fortawesome/free-brands-svg-icons'
import * as SolidIcon from '@fortawesome/free-solid-svg-icons'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const FontAwesomePage: ExtendedNextPage = () => {
	return (
		<Row>
			<Col xs="12">
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Font Awesome</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Get icons on your website with <strong>Font Awesome</strong>, the web&apos;s most popular icon set and
							toolkit. For more info visit{' '}
							<a href="http://fontawesome.com" target="_blank" rel="noreferrer">
								Font Awesome
							</a>
							.
						</p>
						{/* BEGIN Portlet */}
						<Portlet>
							<Portlet.Header bordered>
								<Portlet.Title>Solid</Portlet.Title>
							</Portlet.Header>
							<Portlet.Body>
								<Row>
									{[
										{ icon: <FontAwesomeIcon icon={SolidIcon.faAd} />, text: 'ad' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faAddressBook} />, text: 'address-book' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faAddressCard} />, text: 'address-card' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faAdjust} />, text: 'adjust' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faAlignCenter} />, text: 'align-center' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faAlignJustify} />, text: 'align-justify' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faAnchor} />, text: 'anchor' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faBug} />, text: 'bug' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faCapsules} />, text: 'capsules' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faFolderOpen} />, text: 'folder-open' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faHeadphones} />, text: 'headphones' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faAngleDown} />, text: 'angle-down' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faAngleLeft} />, text: 'angle-left' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faAngleRight} />, text: 'angle-right' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faAngleUp} />, text: 'angle-up' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faAsterisk} />, text: 'asterisk' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faAt} />, text: 'at' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faBackward} />, text: 'backward' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faBan} />, text: 'ban' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faBatteryHalf} />, text: 'battery-half' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faBell} />, text: 'bell' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faBezierCurve} />, text: 'bezier-curve' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faBorderAll} />, text: 'border-all' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faBullhorn} />, text: 'bullhorn' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faExpand} />, text: 'expand' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faDice} />, text: 'dice' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faCrop} />, text: 'crop' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faCreditCard} />, text: 'credit-card' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faInfo} />, text: 'info' },
										{ icon: <FontAwesomeIcon icon={SolidIcon.faChartPie} />, text: 'chart-pie' },
									].map(({ icon, text }, index) => (
										<Col key={index} md="2">
											<Widget18 icon={icon}>{text}</Widget18>
										</Col>
									))}
								</Row>
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
						{/* BEGIN Portlet */}
						<Portlet>
							<Portlet.Header bordered>
								<Portlet.Title>Regular</Portlet.Title>
							</Portlet.Header>
							<Portlet.Body>
								<Row>
									{[
										{ icon: <FontAwesomeIcon icon={RegularIcon.faClipboard} />, text: 'clipboard' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faEdit} />, text: 'edit' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faEnvelope} />, text: 'envelope' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faFile} />, text: 'file' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faCalendar} />, text: 'calendar' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faKeyboard} />, text: 'keyboard' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faImages} />, text: 'images' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faHeart} />, text: 'heart' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faMoon} />, text: 'moon' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faStar} />, text: 'star' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faSquare} />, text: 'square' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faPlayCircle} />, text: 'play-circle' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faObjectGroup} />, text: 'object-group' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faNewspaper} />, text: 'newspaper' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faPaperPlane} />, text: 'paper-plane' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faHandRock} />, text: 'hand-rock' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faFolder} />, text: 'folder' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faComments} />, text: 'comments' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faClone} />, text: 'clone' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faBellSlash} />, text: 'bell-slash' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faChartBar} />, text: 'chart-bar' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faGrinAlt} />, text: 'grin-alt' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faMap} />, text: 'map' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faListAlt} />, text: 'list-alt' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faMinusSquare} />, text: 'minus-square' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faStickyNote} />, text: 'sticky-note' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faThumbsUp} />, text: 'thumbs-up' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faLightbulb} />, text: 'lightbulb' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faUserCircle} />, text: 'user-circle' },
										{ icon: <FontAwesomeIcon icon={RegularIcon.faEye} />, text: 'eye' },
									].map(({ icon, text }, index) => (
										<Col key={index} md="2">
											<Widget18 icon={icon}>{text}</Widget18>
										</Col>
									))}
								</Row>
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
						{/* BEGIN Portlet */}
						<Portlet className="mb-0">
							<Portlet.Header bordered>
								<Portlet.Title>Brands</Portlet.Title>
							</Portlet.Header>
							<Portlet.Body>
								<Row>
									{[
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faAmazon} />, text: 'amazon' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faAirbnb} />, text: 'airbnb' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faAndroid} />, text: 'android' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faApple} />, text: 'apple' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faBlackberry} />, text: 'blackberry' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faAppStore} />, text: 'app-store' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faBootstrap} />, text: 'bootstrap' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faCcStripe} />, text: 'cc-stripe' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faCcVisa} />, text: 'cc-visa' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faChromecast} />, text: 'chromecast' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faCss3} />, text: 'css3' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faDiscourse} />, text: 'discourse' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faDailymotion} />, text: 'dailymotion' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faDeviantart} />, text: 'deviantart' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faDrupal} />, text: 'drupal' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faFirefoxBrowser} />, text: 'firefox-browser' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faGitAlt} />, text: 'git-alt' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faGithub} />, text: 'github' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faGulp} />, text: 'gulp' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faLinkedin} />, text: 'linkedin' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faMaxcdn} />, text: 'maxcdn' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faOpera} />, text: 'opera' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faPaypal} />, text: 'paypal' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faPatreon} />, text: 'patreon' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faPhp} />, text: 'php' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faPython} />, text: 'python' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faPlaystation} />, text: 'playstation' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faYoutube} />, text: 'youtube' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faWordpress} />, text: 'wordpress' },
										{ icon: <FontAwesomeIcon icon={BrandsIcon.faXbox} />, text: 'xbox' },
									].map(({ icon, text }, index) => (
										<Col key={index} md="2">
											<Widget18 icon={icon}>{text}</Widget18>
										</Col>
									))}
								</Row>
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

FontAwesomePage.pageTitle = 'Font Awesome'
FontAwesomePage.activeLink = 'elements.icons.fontawesome'
FontAwesomePage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Icon' },
	{ text: 'Font Awesome', link: '/icons/fontawesome' },
]

export default withAuth(FontAwesomePage)
