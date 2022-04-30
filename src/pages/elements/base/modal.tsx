import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Button, FormLabel, Modal, FormGroup, FormControl, FormText } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const ModalPage: ExtendedNextPage = () => {
	return (
		<Row>
			<Col>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Modal examples</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						{/* BEGIN Grid */}
						<div className="d-grid gap-3">
							{/* BEGIN Row */}
							<Row>
								<FormLabel column sm={4} lg={3} className="text-sm-end">
									Basic demo
								</FormLabel>
								<Col sm={8} lg={9}>
									<Modal1 />
								</Col>
							</Row>
							{/* END Row */}
							{/* BEGIN Row */}
							<Row>
								<FormLabel column sm={4} lg={3} className="text-sm-end">
									Without footer
								</FormLabel>
								<Col sm={8} lg={9}>
									<Modal2 />
								</Col>
							</Row>
							{/* END Row */}
							{/* BEGIN Row */}
							<Row>
								<FormLabel column sm={4} lg={3} className="text-sm-end">
									Static backdrop
								</FormLabel>
								<Col sm={8} lg={9}>
									<div className="mb-2">
										<Modal3 />
									</div>
									<p className="mb-0">Disable backdrop behavior (don&apos;t close modal when backdrop clicked)</p>
								</Col>
							</Row>
							{/* END Row */}
							{/* BEGIN Row */}
							<Row>
								<FormLabel column sm={4} lg={3} className="text-sm-end">
									Scrolling modal
								</FormLabel>
								<Col sm={8} lg={9}>
									<Modal4 />
								</Col>
							</Row>
							{/* END Row */}
							{/* BEGIN Row */}
							<Row>
								<FormLabel column sm={4} lg={3} className="text-sm-end">
									Fixed scrollable content
								</FormLabel>
								<Col sm={8} lg={9}>
									<div className="mb-2">
										<Modal5 />
									</div>
									<p className="mb-0">
										Apply <code>scrollable</code> property to make modal body fixed and scrollable
									</p>
								</Col>
							</Row>
							{/* END Row */}
							{/* BEGIN Row */}
							<Row>
								<FormLabel column sm={4} lg={3} className="text-sm-end">
									Vertically centered
								</FormLabel>
								<Col sm={8} lg={9}>
									<div className="mb-2">
										<Modal6 />
									</div>
									<p className="mb-0">
										Make your modal align center to page by applying <code>centered</code> property
									</p>
								</Col>
							</Row>
							{/* END Row */}
							{/* BEGIN Row */}
							<Row>
								<FormLabel column sm={4} lg={3} className="text-sm-end">
									Form in modal
								</FormLabel>
								<Col sm={8} lg={9}>
									<div className="mb-2">
										<Modal7 />
									</div>
									<p className="mb-0">You can insert any elements to modal body</p>
								</Col>
							</Row>
							{/* END Row */}
						</div>
						{/* END Grid */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

const Modal1 = () => {
	const [show, setShow] = React.useState(false)

	const handleHide = () => setShow(false)
	const handleShow = () => setShow(true)

	return (
		<>
			<Button variant="primary" onClick={handleShow}>
				Click me
			</Button>
			{/* BEGIN Modal */}
			<Modal show={show} onHide={handleHide}>
				<Modal.Header>
					<Modal.Title>Basic</Modal.Title>
					<Button icon variant="label-danger" onClick={handleHide}>
						<FontAwesomeIcon icon={faTimes} />
					</Button>
				</Modal.Header>
				<Modal.Body>
					<p className="mb-0">
						Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cupiditate fugit eveniet sed, ipsum rem quasi
						quisquam recusandae nesciunt deleniti iste sit repellat rerum amet. Neque debitis iste, quos repudiandae ut!
					</p>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="primary">Submit</Button>
					<Button variant="outline-danger">Reset</Button>
				</Modal.Footer>
			</Modal>
			{/* END Modal */}
		</>
	)
}

const Modal2 = () => {
	const [show, setShow] = React.useState(false)

	const handleHide = () => setShow(false)
	const handleShow = () => setShow(true)

	return (
		<>
			<Button variant="primary" onClick={handleShow}>
				Click me
			</Button>
			{/* BEGIN Modal */}
			<Modal show={show} onHide={handleHide}>
				<Modal.Header>
					<Modal.Title>Without footer</Modal.Title>
					<Button icon variant="label-danger" onClick={handleHide}>
						<FontAwesomeIcon icon={faTimes} />
					</Button>
				</Modal.Header>
				<Modal.Body>
					<p className="mb-0">
						Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cupiditate fugit eveniet sed, ipsum rem quasi
						quisquam recusandae nesciunt deleniti iste sit repellat rerum amet. Neque debitis iste, quos repudiandae ut!
					</p>
				</Modal.Body>
			</Modal>
			{/* END Modal */}
		</>
	)
}

const Modal3 = () => {
	const [show, setShow] = React.useState(false)

	const handleHide = () => setShow(false)
	const handleShow = () => setShow(true)

	return (
		<>
			<Button variant="primary" onClick={handleShow}>
				Click me
			</Button>
			{/* BEGIN Modal */}
			<Modal backdrop="static" keyboard={false} show={show} onHide={handleHide}>
				<Modal.Header>
					<Modal.Title>Static backdrop</Modal.Title>
					<Button icon variant="label-danger" onClick={handleHide}>
						<FontAwesomeIcon icon={faTimes} />
					</Button>
				</Modal.Header>
				<Modal.Body>
					<p className="mb-0">
						Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cupiditate fugit eveniet sed, ipsum rem quasi
						quisquam recusandae nesciunt deleniti iste sit repellat rerum amet. Neque debitis iste, quos repudiandae ut!
					</p>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="primary">Submit</Button>
					<Button variant="outline-danger">Reset</Button>
				</Modal.Footer>
			</Modal>
			{/* END Modal */}
		</>
	)
}

const Modal4 = () => {
	const [show, setShow] = React.useState(false)

	const handleHide = () => setShow(false)
	const handleShow = () => setShow(true)

	return (
		<>
			<Button variant="primary" onClick={handleShow}>
				Click me
			</Button>
			{/* BEGIN Modal */}
			<Modal show={show} onHide={handleHide}>
				<Modal.Header>
					<Modal.Title>Scrollable</Modal.Title>
					<Button icon variant="label-danger" onClick={handleHide}>
						<FontAwesomeIcon icon={faTimes} />
					</Button>
				</Modal.Header>
				<Modal.Body>
					<p>
						Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget
						quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
					</p>
					<p>
						Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet
						rutrum faucibus dolor auctor.
					</p>
					<p>
						Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl
						consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
					</p>
					<p>
						Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget
						quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
					</p>
					<p>
						Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet
						rutrum faucibus dolor auctor.
					</p>
					<p>
						Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl
						consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
					</p>
					<p>
						Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget
						quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
					</p>
					<p>
						Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet
						rutrum faucibus dolor auctor.
					</p>
					<p>
						Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl
						consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
					</p>
					<p>
						Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget
						quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
					</p>
					<p>
						Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet
						rutrum faucibus dolor auctor.
					</p>
					<p>
						Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl
						consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
					</p>
					<p>
						Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget
						quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
					</p>
					<p>
						Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet
						rutrum faucibus dolor auctor.
					</p>
					<p>
						Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl
						consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
					</p>
					<p className="mb-0">
						Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget
						quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
					</p>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="primary">Submit</Button>
					<Button variant="outline-danger">Reset</Button>
				</Modal.Footer>
			</Modal>
			{/* END Modal */}
		</>
	)
}

const Modal5 = () => {
	const [show, setShow] = React.useState(false)

	const handleHide = () => setShow(false)
	const handleShow = () => setShow(true)

	return (
		<>
			<Button variant="primary" onClick={handleShow}>
				Click me
			</Button>
			{/* BEGIN Modal */}
			<Modal scrollable show={show} onHide={handleHide}>
				<Modal.Header>
					<Modal.Title>Fixed scrollable content</Modal.Title>
					<Button icon variant="label-danger" onClick={handleHide}>
						<FontAwesomeIcon icon={faTimes} />
					</Button>
				</Modal.Header>
				<Modal.Body>
					<p>
						Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget
						quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
					</p>
					<p>
						Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet
						rutrum faucibus dolor auctor.
					</p>
					<p>
						Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl
						consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
					</p>
					<p>
						Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget
						quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
					</p>
					<p>
						Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet
						rutrum faucibus dolor auctor.
					</p>
					<p>
						Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl
						consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
					</p>
					<p>
						Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget
						quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
					</p>
					<p>
						Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet
						rutrum faucibus dolor auctor.
					</p>
					<p>
						Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl
						consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
					</p>
					<p>
						Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget
						quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
					</p>
					<p>
						Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet
						rutrum faucibus dolor auctor.
					</p>
					<p>
						Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl
						consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
					</p>
					<p>
						Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget
						quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
					</p>
					<p>
						Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet
						rutrum faucibus dolor auctor.
					</p>
					<p>
						Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl
						consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
					</p>
					<p className="mb-0">
						Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget
						quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
					</p>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="primary">Submit</Button>
					<Button variant="outline-danger">Reset</Button>
				</Modal.Footer>
			</Modal>
			{/* END Modal */}
		</>
	)
}

const Modal6 = () => {
	const [show, setShow] = React.useState(false)

	const handleHide = () => setShow(false)
	const handleShow = () => setShow(true)

	return (
		<>
			<Button variant="primary" onClick={handleShow}>
				Click me
			</Button>
			{/* BEGIN Modal */}
			<Modal centered show={show} onHide={handleHide}>
				<Modal.Header>
					<Modal.Title>Vertically centered</Modal.Title>
					<Button icon variant="label-danger" onClick={handleHide}>
						<FontAwesomeIcon icon={faTimes} />
					</Button>
				</Modal.Header>
				<Modal.Body>
					<p className="mb-0">
						Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cupiditate fugit eveniet sed, ipsum rem quasi
						quisquam recusandae nesciunt deleniti iste sit repellat rerum amet. Neque debitis iste, quos repudiandae ut!
					</p>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="primary">Submit</Button>
					<Button variant="outline-danger">Reset</Button>
				</Modal.Footer>
			</Modal>
			{/* END Modal */}
		</>
	)
}

const Modal7 = () => {
	const [show, setShow] = React.useState(false)

	const handleHide = () => setShow(false)
	const handleShow = () => setShow(true)

	return (
		<>
			<Button variant="primary" onClick={handleShow}>
				Click me
			</Button>
			{/* BEGIN Modal */}
			<Modal show={show} onHide={handleHide}>
				<Modal.Header>
					<Modal.Title>Form</Modal.Title>
					<Button icon variant="label-danger" onClick={handleHide}>
						<FontAwesomeIcon icon={faTimes} />
					</Button>
				</Modal.Header>
				<Modal.Body>
					<FormGroup controlId="email">
						<FormLabel>Email form</FormLabel>
						<FormControl type="email" />
						<FormText>Please submit your email</FormText>
					</FormGroup>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="primary">Submit</Button>
					<Button variant="outline-danger">Reset</Button>
				</Modal.Footer>
			</Modal>
			{/* END Modal */}
		</>
	)
}

ModalPage.pageTitle = 'Modal'
ModalPage.activeLink = 'elements.base.modal'
ModalPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Base' },
	{ text: 'Modal', link: '/elements/base/modal' },
]

export default withAuth(ModalPage)
