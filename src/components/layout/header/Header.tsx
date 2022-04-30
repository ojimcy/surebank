import React from 'react'
import { Header, Button } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarAlt, faListAlt } from '@fortawesome/free-regular-svg-icons'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { asideMobileToggle, offcanvasToggle } from 'store/actions'
import Sticky from 'react-stickynode'
import PAGE from 'config/page.config'
import LayoutHeaderNav from './HeaderNav'
import LayoutHeaderChat from './HeaderChat'
import LayoutHeaderNotification from './HeaderNotification'
import LayoutHeaderUser from './HeaderUser'
import LayoutHeaderAction from './HeaderAction'
import LayoutHeaderBreadcrumb from './HeaderBreadcrumb'
import type { State } from 'store/reducers'

const LayoutHeader: React.FC<LayoutHeaderProps> = (props) => {
	return (
		<Header>
			<Sticky top={0} bottomBoundary={0} className="sticky-header">
				{/* BEGIN Header Holder */}
				<Header.Holder shown="desktop">
					<Header.Container fluid={PAGE.enableContainerFluid} className="g-4">
						<Header.Wrap justify="start" block>
							<LayoutHeaderNav />
						</Header.Wrap>
						<Header.Wrap className="hstack gap-2">
							<LayoutHeaderNotification variant="flat-primary" />
							<LayoutHeaderChat variant="flat-primary" />
							<Button variant="flat-primary" icon onClick={() => props.offcanvasToggle('setting')}>
								<FontAwesomeIcon icon={faListAlt} />
							</Button>
							<Button variant="flat-primary" icon onClick={() => props.offcanvasToggle('agenda')}>
								<FontAwesomeIcon icon={faCalendarAlt} />
							</Button>
							<LayoutHeaderUser variant="flat-primary" />
						</Header.Wrap>
					</Header.Container>
				</Header.Holder>
				{/* END Header Holder */}
			</Sticky>
			{/* BEGIN Header Holder */}
			<Header.Holder shown="desktop">
				<Header.Container fluid={PAGE.enableContainerFluid} className="g-4">
					<Header.Title>{props.pageTitle}</Header.Title>
					<Header.Divider />
					<Header.Wrap block justify="start">
						<LayoutHeaderBreadcrumb />
					</Header.Wrap>
					<Header.Wrap>
						<LayoutHeaderAction />
					</Header.Wrap>
				</Header.Container>
			</Header.Holder>
			{/* END Header Holder */}
			<Sticky top={0} bottomBoundary={0} className="sticky-header">
				{/* BEGIN Header Holder */}
				<Header.Holder shown="mobile">
					<Header.Container fluid={PAGE.enableContainerFluid} className="g-4">
						<Header.Wrap>
							<Button variant="flat-primary" icon onClick={() => props.asideMobileToggle()}>
								<FontAwesomeIcon icon={faBars} />
							</Button>
						</Header.Wrap>
						<Header.Wrap block justify="start" className="px-3">
							<Header.Brand>{PAGE.appName}</Header.Brand>
						</Header.Wrap>
						<Header.Wrap className="hstack gap-2">
							<Button variant="flat-primary" icon onClick={() => props.offcanvasToggle('agenda')}>
								<FontAwesomeIcon icon={faCalendarAlt} />
							</Button>
							<LayoutHeaderUser variant="flat-primary" />
						</Header.Wrap>
					</Header.Container>
				</Header.Holder>
				{/* END Header Holder */}
			</Sticky>
			{/* BEGIN Header Holder */}
			<Header.Holder shown="mobile">
				<Header.Container fluid={PAGE.enableContainerFluid} className="g-4">
					<Header.Wrap block justify="start" className="w-100">
						<LayoutHeaderBreadcrumb />
					</Header.Wrap>
				</Header.Container>
			</Header.Holder>
			{/* END Header Holder */}
		</Header>
	)
}

interface LayoutHeaderProps {
	pageTitle?: string
	asideMobileToggle: typeof asideMobileToggle
	offcanvasToggle: typeof offcanvasToggle
}

function mapStateToProps(state: State) {
	return {
		pageTitle: state.page.pageTitle,
	}
}

function mapDispatchToProps(dispatch: Dispatch) {
	return bindActionCreators({ asideMobileToggle, offcanvasToggle }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(LayoutHeader)
