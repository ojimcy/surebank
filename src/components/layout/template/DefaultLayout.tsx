import React from 'react'
import { Container, Structure } from '@blueupcode/components'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { menuActiveLinkChange, breadcrumbChange, pageTitleChange } from 'store/actions'
import { Dispatch } from 'redux'
import LayoutHeader from '../header/Header'
import LayoutFooter from '../footer/Footer'
import LayoutAside from '../aside/Aside'
import OffcanvasAgenda from '../offcanvas/agenda/OffcanvasAgenda'
import OffcanvasSetting from '../offcanvas/setting/OffcanvasSetting'
import LayoutFloatingButton from '../floating-button/FloatingButton'
import PAGE from 'config/page.config'
import type { PageBreadcrumb } from '@blueupcode/components/types'

const DefaultLayout: React.FC<DefaultLayoutProps> = ({
	children,
	activeLink,
	menuActiveLinkChange,
	breadcrumb,
	breadcrumbChange,
	pageTitle,
	pageTitleChange
}) => {
	React.useEffect(() => {
		if (activeLink) {
			menuActiveLinkChange(activeLink)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeLink])

	React.useEffect(() => {
		if (breadcrumb) {
			breadcrumbChange(breadcrumb)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [breadcrumb])

	React.useEffect(() => {
		if (pageTitle) {
			pageTitleChange(pageTitle)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pageTitle])

	return (
		<>
			<Structure type="holder">
				<LayoutAside />
				<Structure type="wrapper">
					<LayoutHeader />
					<Structure type="content">
						<Container fluid={PAGE.enableContainerFluid} className="g-4">
							{children}
						</Container>
					</Structure>
					<LayoutFooter />
				</Structure>
			</Structure>
			<OffcanvasAgenda />
			<OffcanvasSetting />
			<LayoutFloatingButton />
		</>
	)
}

export interface DefaultLayoutProps extends React.HTMLAttributes<HTMLElement> {
	breadcrumb?: PageBreadcrumb
	activeLink?: string
	pageTitle?: string
	menuActiveLinkChange: typeof menuActiveLinkChange
	breadcrumbChange: typeof breadcrumbChange
	pageTitleChange: typeof pageTitleChange
}

function mapDispatchToProps(dispatch: Dispatch) {
	return bindActionCreators({ menuActiveLinkChange, breadcrumbChange, pageTitleChange }, dispatch)
}

export default connect(null, mapDispatchToProps)(DefaultLayout)
