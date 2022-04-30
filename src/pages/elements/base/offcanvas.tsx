import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Offcanvas, Button, FormLabel } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const OffcanvasPage: ExtendedNextPage = () => {
	return (
		<Row>
			<Col>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Offcanvas examples</Portlet.Title>
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
									<Offcanvas1 />
								</Col>
							</Row>
							{/* END Row */}
							{/* BEGIN Row */}
							<Row>
								<FormLabel column sm={4} lg={3} className="text-sm-end">
									Placements
								</FormLabel>
								<Col sm={8} lg={9}>
									<div className="mb-2">
										<Offcanvas2 />
										<Offcanvas3 />
										<Offcanvas4 />
										<Offcanvas5 />
									</div>
									<p className="mb-0">Offcanvas supports a few different placements:</p>
								</Col>
							</Row>
							{/* END Row */}
							{/* BEGIN Row */}
							<Row>
								<FormLabel column sm={4} lg={3} className="text-sm-end">
									Backdrop
								</FormLabel>
								<Col sm={8} lg={9}>
									<div className="mb-2">
										<Offcanvas6 />
										<Offcanvas7 />
									</div>
									<p className="mb-0">
										Use the <code>scroll</code> prop to toggle <code>&lt;body&gt;</code> scrolling and the{' '}
										<code>backdrop</code> prop to toggle the backdrop.
									</p>
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

const Offcanvas1 = () => {
	const [show, setShow] = React.useState(false)

	const handleHide = () => setShow(false)
	const handleShow = () => setShow(true)

	return (
		<>
			<Button variant="primary" onClick={handleShow}>
				Click me
			</Button>
			{/* BEGIN Offcanvas */}
			<Offcanvas show={show} onHide={handleHide}>
				<Offcanvas.Header>
					<Offcanvas.Title>Basic offcanvas</Offcanvas.Title>
					<Button icon variant="label-danger" onClick={handleHide}>
						<FontAwesomeIcon icon={faTimes} />
					</Button>
				</Offcanvas.Header>
				<Offcanvas.Body>
					<p>
						Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists,
						etc.
					</p>
				</Offcanvas.Body>
			</Offcanvas>
			{/* END Offcanvas */}
		</>
	)
}

const Offcanvas2 = () => {
	const [show, setShow] = React.useState(false)

	const handleHide = () => setShow(false)
	const handleShow = () => setShow(true)

	return (
		<>
			<Button variant="primary" onClick={handleShow} className="me-2">
				Start
			</Button>
			{/* BEGIN Offcanvas */}
			<Offcanvas placement="start" show={show} onHide={handleHide}>
				<Offcanvas.Header>
					<Offcanvas.Title>Offcanvas start</Offcanvas.Title>
					<Button icon variant="label-danger" onClick={handleHide}>
						<FontAwesomeIcon icon={faTimes} />
					</Button>
				</Offcanvas.Header>
				<Offcanvas.Body>
					<p>
						Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists,
						etc.
					</p>
				</Offcanvas.Body>
			</Offcanvas>
			{/* END Offcanvas */}
		</>
	)
}

const Offcanvas3 = () => {
	const [show, setShow] = React.useState(false)

	const handleHide = () => setShow(false)
	const handleShow = () => setShow(true)

	return (
		<>
			<Button variant="primary" onClick={handleShow} className="me-2">
				End
			</Button>
			{/* BEGIN Offcanvas */}
			<Offcanvas placement="end" show={show} onHide={handleHide}>
				<Offcanvas.Header>
					<Offcanvas.Title>Offcanvas end</Offcanvas.Title>
					<Button icon variant="label-danger" onClick={handleHide}>
						<FontAwesomeIcon icon={faTimes} />
					</Button>
				</Offcanvas.Header>
				<Offcanvas.Body>
					<p>
						Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists,
						etc.
					</p>
				</Offcanvas.Body>
			</Offcanvas>
			{/* END Offcanvas */}
		</>
	)
}

const Offcanvas4 = () => {
	const [show, setShow] = React.useState(false)

	const handleHide = () => setShow(false)
	const handleShow = () => setShow(true)

	return (
		<>
			<Button variant="primary" onClick={handleShow} className="me-2">
				Top
			</Button>
			{/* BEGIN Offcanvas */}
			<Offcanvas placement="top" show={show} onHide={handleHide}>
				<Offcanvas.Header>
					<Offcanvas.Title>Offcanvas top</Offcanvas.Title>
					<Button icon variant="label-danger" onClick={handleHide}>
						<FontAwesomeIcon icon={faTimes} />
					</Button>
				</Offcanvas.Header>
				<Offcanvas.Body>
					<p>
						Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists,
						etc.
					</p>
				</Offcanvas.Body>
			</Offcanvas>
			{/* END Offcanvas */}
		</>
	)
}

const Offcanvas5 = () => {
	const [show, setShow] = React.useState(false)

	const handleHide = () => setShow(false)
	const handleShow = () => setShow(true)

	return (
		<>
			<Button variant="primary" onClick={handleShow} className="me-2">
				Bottom
			</Button>
			{/* BEGIN Offcanvas */}
			<Offcanvas placement="bottom" show={show} onHide={handleHide}>
				<Offcanvas.Header>
					<Offcanvas.Title>Offcanvas bottom</Offcanvas.Title>
					<Button icon variant="label-danger" onClick={handleHide}>
						<FontAwesomeIcon icon={faTimes} />
					</Button>
				</Offcanvas.Header>
				<Offcanvas.Body>
					<p>
						Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists,
						etc.
					</p>
				</Offcanvas.Body>
			</Offcanvas>
			{/* END Offcanvas */}
		</>
	)
}

const Offcanvas6 = () => {
	const [show, setShow] = React.useState(false)

	const handleHide = () => setShow(false)
	const handleShow = () => setShow(true)

	return (
		<>
			<Button variant="primary" onClick={handleShow} className="me-2">
				Enabled
			</Button>
			{/* BEGIN Offcanvas */}
			<Offcanvas backdrop={true} show={show} onHide={handleHide}>
				<Offcanvas.Header>
					<Offcanvas.Title>Offcanvas with backdrop</Offcanvas.Title>
					<Button icon variant="label-danger" onClick={handleHide}>
						<FontAwesomeIcon icon={faTimes} />
					</Button>
				</Offcanvas.Header>
				<Offcanvas.Body>
					<p>
						Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists,
						etc.
					</p>
				</Offcanvas.Body>
			</Offcanvas>
			{/* END Offcanvas */}
		</>
	)
}

const Offcanvas7 = () => {
	const [show, setShow] = React.useState(false)

	const handleHide = () => setShow(false)
	const handleShow = () => setShow(true)

	return (
		<>
			<Button variant="primary" onClick={handleShow} className="me-2">
				Disabled
			</Button>
			{/* BEGIN Offcanvas */}
			<Offcanvas backdrop={false} show={show} onHide={handleHide}>
				<Offcanvas.Header>
					<Offcanvas.Title>Offcanvas without backdrop</Offcanvas.Title>
					<Button icon variant="label-danger" onClick={handleHide}>
						<FontAwesomeIcon icon={faTimes} />
					</Button>
				</Offcanvas.Header>
				<Offcanvas.Body>
					<p>
						Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists,
						etc.
					</p>
				</Offcanvas.Body>
			</Offcanvas>
			{/* END Offcanvas */}
		</>
	)
}

OffcanvasPage.pageTitle = 'Offcanvas'
OffcanvasPage.activeLink = 'elements.base.offcanvas'
OffcanvasPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Base' },
	{ text: 'Offcanvas', link: '/elements/base/offcanvas' },
]

export default withAuth(OffcanvasPage)
