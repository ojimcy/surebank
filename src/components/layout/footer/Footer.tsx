import { Row, Col, Container, Footer } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopyright } from '@fortawesome/free-regular-svg-icons'
import { faHeart } from '@fortawesome/free-solid-svg-icons'
import PAGE from 'config/page.config'

const LayoutFooter = () => {
	const copyrightYear = new Date().getFullYear()

	return (
		<Footer>
			<Container fluid={PAGE.enableContainerFluid} className="g-4">
				<Row className="g-3">
					<Col sm="6" className="text-center text-sm-start">
						<p className="mb-0">
							<FontAwesomeIcon icon={faCopyright} /> <span>{copyrightYear}</span> {PAGE.appName}. All rights reserved
						</p>
					</Col>
					<Col sm="6" className="text-center text-sm-end">
						<p className="mb-0">
							Hand-crafted and made with <FontAwesomeIcon icon={faHeart} className="text-danger" />
						</p>
					</Col>
				</Row>
			</Container>
		</Footer>
	)
}

export default LayoutFooter
