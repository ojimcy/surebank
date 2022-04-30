import React from 'react'
import { Avatar, Button, Marker, Offcanvas } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faThumbtack, faTimes } from '@fortawesome/free-solid-svg-icons'
import { offcanvasChange } from 'store/actions'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { State } from 'store/reducers'
import { Dispatch } from 'redux'
import WidgetTimeline from 'components/layout/widget/WidgetTimeline'
import WidgetContacts from 'components/layout/widget/WidgetContacts'
import useSimplebar from 'hooks/useSimplebar'

const offcanvasName = 'agenda'

const OffcanvasAgenda = ({ show, offcanvasChange }: OffcanvasAgendaProps) => {
	const simplebarInstance = useSimplebar()

	const handleHide = () =>
		offcanvasChange({
			name: offcanvasName,
			value: false,
		})

	return (
		<Offcanvas placement="end" show={show} onHide={handleHide}>
			<Offcanvas.Header>
				<Offcanvas.Title>May 14, 2020</Offcanvas.Title>
				<Button icon variant="label-danger" onClick={handleHide}>
					<FontAwesomeIcon icon={faTimes} />
				</Button>
			</Offcanvas.Header>
			<Offcanvas.Body ref={simplebarInstance}>
				<WidgetTimeline
					title="Upcoming events"
					timeline={[
						{
							time: '12:00',
							text: 'Donec laoreet fringilla justo a pellentesque',
							marker: <Marker type="circle" variant="primary" />,
						},
						{
							time: '13:20',
							text: 'Nunc quis massa nec enim',
							marker: <Marker type="circle" variant="success" />,
						},
						{
							time: '14:00',
							text: 'Praesent sit amet',
							marker: <Marker type="circle" variant="danger" />,
						},
					]}
				/>
				<WidgetContacts
					contacts={[
						{
							name: 'Charlie Stone',
							title: 'Art Director',
							time: '1 min',
							link: '#',
							image: '/images/avatar/blank.webp',
							count: 1,
							online: false,
							avatarMarker: (
								<Avatar.Icon variant="info">
									<FontAwesomeIcon icon={faThumbtack} />
								</Avatar.Icon>
							),
						},
						{
							name: 'Freddie Stevens',
							title: 'Journalist',
							time: '2 hour',
							link: '#',
							image: '/images/avatar/blank.webp',
							count: 12,
							online: true,
						},
						{
							name: 'Tyler Clark',
							title: 'Programmer',
							time: '5 hour',
							link: '#',
							image: '/images/avatar/blank.webp',
							count: 0,
							online: true,
						},
						{
							name: 'Darcy Harrison',
							title: 'Internet Marketer',
							time: '1 day',
							link: '#',
							image: '/images/avatar/blank.webp',
							count: 2,
							online: false,
							avatarMarker: (
								<Avatar.Icon variant="success">
									<FontAwesomeIcon icon={faCheck} />
								</Avatar.Icon>
							),
						},
						{
							name: 'Victor Payne',
							title: 'Accountant',
							time: '1 day',
							link: '#',
							image: '/images/avatar/blank.webp',
							count: 5,
							online: true,
						},
						{
							name: 'Alberta Harris',
							title: 'UI Designer',
							time: '2 day',
							link: '#',
							image: '/images/avatar/blank.webp',
							count: 4,
							online: false,
						},
					]}
				/>
			</Offcanvas.Body>
		</Offcanvas>
	)
}

interface OffcanvasAgendaProps {
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

export default connect(mapStateToProps, mapDispatchToProps)(OffcanvasAgenda)
