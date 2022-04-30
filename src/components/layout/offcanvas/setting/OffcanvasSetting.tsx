import React from 'react'
import { Button, Offcanvas } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { offcanvasChange } from 'store/actions'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from 'store/reducers'
import WidgetOptions from 'components/layout/widget/WidgetOptions'
import WidgetPerformance from 'components/layout/widget/WidgetPerformance'
import useSimplebar from 'hooks/useSimplebar'

const offcanvasName = 'setting'

const OffcanvasSetting: React.FC<OffcanvasSettingProps> = ({ show, offcanvasChange }) => {
	const simplebarInstance = useSimplebar()

	const handleHide = () =>
		offcanvasChange({
			name: offcanvasName,
			value: false,
		})

	return (
		<Offcanvas placement="end" show={show} onHide={handleHide}>
			<Offcanvas.Header>
				<Offcanvas.Title>Settings</Offcanvas.Title>
				<Button icon variant="label-danger" onClick={handleHide}>
					<FontAwesomeIcon icon={faTimes} />
				</Button>
			</Offcanvas.Header>
			<Offcanvas.Body ref={simplebarInstance}>
				<WidgetPerformance
					performances={[
						{
							title: 'CPU Load',
							subtitle: '60%',
							variant: 'info',
							now: 60,
						},
						{
							title: 'CPU Temparature',
							subtitle: '42°',
							variant: 'success',
							now: 30,
						},
						{
							title: 'RAM Usage',
							subtitle: '6,532 MB',
							variant: 'danger',
							now: 80,
						},
					]}
				/>
				<WidgetOptions
					title="Customer care"
					defaultSettings={{
						setting1: {
							checked: false,
							label: 'Enable notifications',
						},
						setting2: {
							checked: true,
							label: 'Enable case tracking',
						},
						setting3: {
							checked: false,
							label: 'Support portal',
						},
					}}
				/>
				<WidgetOptions
					title="Reports"
					defaultSettings={{
						setting1: {
							checked: false,
							label: 'Generate reports',
						},
						setting2: {
							checked: true,
							label: 'Enable report export',
						},
						setting3: {
							checked: false,
							label: 'Allow data',
						},
					}}
				/>
				<WidgetOptions
					title="Projects"
					defaultSettings={{
						setting1: {
							checked: false,
							label: 'Enable create projects',
						},
						setting2: {
							checked: true,
							label: 'Enable custom projects',
						},
						setting3: {
							checked: false,
							label: 'Enable project review',
						},
					}}
				/>
			</Offcanvas.Body>
		</Offcanvas>
	)
}

interface OffcanvasSettingProps {
	show: boolean
	offcanvasChange: typeof offcanvasChange
}

function mapStateToProps(state: State) {
	return {
		show: state.offcanvas[offcanvasName],
	}
}

function mapDispatchToProps(dispatch: Dispatch) {
	return bindActionCreators({ offcanvasChange }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(OffcanvasSetting)
