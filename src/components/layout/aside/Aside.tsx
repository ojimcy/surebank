import React from 'react'
import { Aside, Button } from '@blueupcode/components'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { asideMobileChange, asideMobileToggle, asideDekstopToggle } from 'store/actions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbtack, faTimes } from '@fortawesome/free-solid-svg-icons'
import AsideNavigationMenu from './AsideNavigationMenu'
import useSimplebar from 'hooks/useSimplebar'
import PAGE from 'config/page.config'
import type { State } from 'store/reducers'

const LayoutAside: React.FC<LayoutAsideProps> = (props) => {
	const simplebarInstance = useSimplebar()

	const viewportBreakpoint = 1025

	const desktopMinimized = props.layout.asideDesktopMinimized
	const mobileMinimized = props.layout.asideMobileMinimized

	const backdropOnClick = () => props.asideMobileChange(true)

	const asideToggle = () => {
		if (window.innerWidth >= viewportBreakpoint) {
			props.asideDekstopToggle()
		} else {
			props.asideMobileToggle()
		}
	}

	return (
		<Aside desktopMinimized={desktopMinimized} mobileMinimized={mobileMinimized} backdropOnClick={backdropOnClick}>
			<Aside.Header>
				<Aside.Title>{PAGE.appName}</Aside.Title>
				<Aside.Addon>
					<Button icon size="lg" variant="label-primary" onClick={asideToggle}>
						<FontAwesomeIcon icon={faTimes} className="aside-icon-minimize" />
						<FontAwesomeIcon icon={faThumbtack} className="aside-icon-maximize" />
					</Button>
				</Aside.Addon>
			</Aside.Header>
			<Aside.Body ref={simplebarInstance}>
				<AsideNavigationMenu />
			</Aside.Body>
		</Aside>
	)
}

interface LayoutAsideProps {
	layout: State['layout']
	asideMobileChange: typeof asideMobileChange
	asideMobileToggle: typeof asideMobileToggle
	asideDekstopToggle: typeof asideDekstopToggle
}

function mapStateToProps(state: State) {
	return {
		layout: state.layout,
	}
}

function mapDispatchToProps(dispatch: Dispatch) {
	return bindActionCreators({ asideMobileChange, asideMobileToggle, asideDekstopToggle }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(LayoutAside)
