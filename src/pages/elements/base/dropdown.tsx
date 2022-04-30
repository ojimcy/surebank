import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Button, Dropdown, Form } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComments, faPaperPlane, faRocket } from '@fortawesome/free-solid-svg-icons'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const DropdownPage: ExtendedNextPage = () => {
	return (
		<Row>
			<Col>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Dropdown examples</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						{/* BEGIN Grid */}
						<div className="d-grid gap-3">
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Basic demo
								</Col>
								<Col sm={8} lg={9}>
									{/* BEGIN Dropdown */}
									<Dropdown>
										<Dropdown.Toggle variant="primary">Click me</Dropdown.Toggle>
										<Dropdown.Menu>
											<Dropdown.Item href="#">Action</Dropdown.Item>
											<Dropdown.Item href="#">Another action</Dropdown.Item>
											<Dropdown.Item href="#">Something else here</Dropdown.Item>
										</Dropdown.Menu>
									</Dropdown>
									{/* END Dropdown */}
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									States
								</Col>
								<Col sm={8} lg={9}>
									{/* BEGIN Dropdown */}
									<div className="mb-2">
										<Dropdown>
											<Dropdown.Toggle variant="primary">Click me</Dropdown.Toggle>
											<Dropdown.Menu>
												<Dropdown.Item href="#">Regular link</Dropdown.Item>
												<Dropdown.Item href="#" active>
													Active link
												</Dropdown.Item>
												<Dropdown.Item href="#" disabled>
													Disabled link
												</Dropdown.Item>
											</Dropdown.Menu>
										</Dropdown>
									</div>
									{/* END Dropdown */}
									<p className="mb-0">
										Add <code>active</code> or <code>disabled</code> property to items in the dropdown to style them as
										active or disabled
									</p>
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Animated dropdown
								</Col>
								<Col sm={8} lg={9}>
									{/* BEGIN Dropdown */}
									<div className="mb-2">
										<Dropdown>
											<Dropdown.Toggle variant="primary">Click me</Dropdown.Toggle>
											<Dropdown.Menu animated>
												<Dropdown.Item href="#">Action</Dropdown.Item>
												<Dropdown.Item href="#">Another action</Dropdown.Item>
												<Dropdown.Item href="#">Something else here</Dropdown.Item>
											</Dropdown.Menu>
										</Dropdown>
									</div>
									{/* END Dropdown */}
									<p className="mb-0">
										Add <code>animated</code> property to <code>Dropdown.Menu</code> to apply animation when dropdown
										opened
									</p>
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Icons
								</Col>
								<Col sm={8} lg={9}>
									{/* BEGIN Dropdown */}
									<div className="mb-2">
										<Dropdown>
											<Dropdown.Toggle variant="primary">Click me</Dropdown.Toggle>
											<Dropdown.Menu animated>
												<Dropdown.Item href="#" icon={<FontAwesomeIcon icon={faRocket} />}>
													Action
												</Dropdown.Item>
												<Dropdown.Item href="#" icon={<FontAwesomeIcon icon={faComments} />}>
													Another action
												</Dropdown.Item>
												<Dropdown.Item href="#" icon={<FontAwesomeIcon icon={faPaperPlane} />}>
													Something else here
												</Dropdown.Item>
											</Dropdown.Menu>
										</Dropdown>
									</div>
									{/* END Dropdown */}
									<p className="mb-0">
										Insert icon element into <code>icon</code> property to add an icon before the dropdown item content
									</p>
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Bullet
								</Col>
								<Col sm={8} lg={9}>
									{/* BEGIN Dropdown */}
									<div className="mb-2">
										<Dropdown>
											<Dropdown.Toggle variant="primary">Click me</Dropdown.Toggle>
											<Dropdown.Menu animated>
												<Dropdown.Item href="#" bullet>
													Action
												</Dropdown.Item>
												<Dropdown.Item href="#" bullet>
													Another action
												</Dropdown.Item>
												<Dropdown.Item href="#" bullet>
													Something else here
												</Dropdown.Item>
											</Dropdown.Menu>
										</Dropdown>
									</div>
									{/* END Dropdown */}
									<p className="mb-0">
										You can add circle bullet by using <code>bullet</code> property on <code>Dropdown.Item</code>
									</p>
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Header
								</Col>
								<Col sm={8} lg={9}>
									{/* BEGIN Dropdown */}
									<div className="mb-2">
										<Dropdown>
											<Dropdown.Toggle variant="primary">Click me</Dropdown.Toggle>
											<Dropdown.Menu animated>
												<Dropdown.Header>Header</Dropdown.Header>
												<Dropdown.Item href="#" icon={<FontAwesomeIcon icon={faRocket} />}>
													Action
												</Dropdown.Item>
												<Dropdown.Item href="#" icon={<FontAwesomeIcon icon={faComments} />}>
													Another action
												</Dropdown.Item>
												<Dropdown.Item href="#" icon={<FontAwesomeIcon icon={faPaperPlane} />}>
													Something else here
												</Dropdown.Item>
											</Dropdown.Menu>
										</Dropdown>
									</div>
									{/* END Dropdown */}
									<p className="mb-0">
										Insert header into a dropdown menu with <code>Dropdown.Header</code> element
									</p>
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Divider
								</Col>
								<Col sm={8} lg={9}>
									{/* BEGIN Dropdown */}
									<div className="mb-2">
										<Dropdown>
											<Dropdown.Toggle variant="primary">Click me</Dropdown.Toggle>
											<Dropdown.Menu animated>
												<Dropdown.Header>Header</Dropdown.Header>
												<Dropdown.Item href="#" icon={<FontAwesomeIcon icon={faRocket} />}>
													Action
												</Dropdown.Item>
												<Dropdown.Item href="#" icon={<FontAwesomeIcon icon={faComments} />}>
													Another action
												</Dropdown.Item>
												<Dropdown.Divider />
												<Dropdown.Item href="#" icon={<FontAwesomeIcon icon={faPaperPlane} />}>
													Something else here
												</Dropdown.Item>
											</Dropdown.Menu>
										</Dropdown>
									</div>
									{/* END Dropdown */}
									<p className="mb-0">
										Dividing your dropdown items with <code>Dropdown.Divider</code> element
									</p>
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Orientation
								</Col>
								<Col sm={8} lg={9}>
									<div className="mb-2">
										<div className="d-inline-block me-2">
											{/* BEGIN Dropdown */}
											<Dropdown drop="down">
												<Dropdown.Toggle variant="primary">Dropdown</Dropdown.Toggle>
												<Dropdown.Menu animated>
													<Dropdown.Item href="#">Action</Dropdown.Item>
													<Dropdown.Item href="#">Another action</Dropdown.Item>
													<Dropdown.Item href="#">Something else here</Dropdown.Item>
												</Dropdown.Menu>
											</Dropdown>
											{/* END Dropdown */}
										</div>
										<div className="d-inline-block me-2">
											{/* BEGIN Dropdown */}
											<Dropdown drop="up">
												<Dropdown.Toggle variant="primary">Dropup</Dropdown.Toggle>
												<Dropdown.Menu animated>
													<Dropdown.Item href="#">Action</Dropdown.Item>
													<Dropdown.Item href="#">Another action</Dropdown.Item>
													<Dropdown.Item href="#">Something else here</Dropdown.Item>
												</Dropdown.Menu>
											</Dropdown>
											{/* END Dropdown */}
										</div>
										<div className="d-inline-block me-2">
											{/* BEGIN Dropdown */}
											<Dropdown drop="end">
												<Dropdown.Toggle variant="primary">Dropend</Dropdown.Toggle>
												<Dropdown.Menu animated>
													<Dropdown.Item href="#">Action</Dropdown.Item>
													<Dropdown.Item href="#">Another action</Dropdown.Item>
													<Dropdown.Item href="#">Something else here</Dropdown.Item>
												</Dropdown.Menu>
											</Dropdown>
											{/* END Dropdown */}
										</div>
										<div className="d-inline-block">
											{/* BEGIN Dropdown */}
											<Dropdown drop="start">
												<Dropdown.Toggle variant="primary">Dropstart</Dropdown.Toggle>
												<Dropdown.Menu animated>
													<Dropdown.Item href="#">Action</Dropdown.Item>
													<Dropdown.Item href="#">Another action</Dropdown.Item>
													<Dropdown.Item href="#">Something else here</Dropdown.Item>
												</Dropdown.Menu>
											</Dropdown>
											{/* END Dropdown */}
										</div>
									</div>
									<p className="mb-0">
										Change dropdown menu orientation by applying <code>drop</code> property with{' '}
										<code>start|end|down|up</code> to <code>Dropdown</code> components
									</p>
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Menu alignment
								</Col>
								<Col sm={8} lg={9}>
									<div className="mb-2">
										<div className="d-inline-block me-2">
											{/* BEGIN Dropdown */}
											<Dropdown align="start">
												<Dropdown.Toggle variant="primary">Start</Dropdown.Toggle>
												<Dropdown.Menu animated>
													<Dropdown.Item href="#">Action</Dropdown.Item>
													<Dropdown.Item href="#">Another action</Dropdown.Item>
													<Dropdown.Item href="#">Something else here</Dropdown.Item>
												</Dropdown.Menu>
											</Dropdown>
											{/* END Dropdown */}
										</div>
										<div className="d-inline-block">
											{/* BEGIN Dropdown */}
											<Dropdown align="end">
												<Dropdown.Toggle variant="primary">End</Dropdown.Toggle>
												<Dropdown.Menu animated>
													<Dropdown.Item href="#">Action</Dropdown.Item>
													<Dropdown.Item href="#">Another action</Dropdown.Item>
													<Dropdown.Item href="#">Something else here</Dropdown.Item>
												</Dropdown.Menu>
											</Dropdown>
											{/* END Dropdown */}
										</div>
									</div>
									<p className="mb-0">
										Apply <code>align</code> property to the <code>Dropdown</code> or <code>Dropdown.Menu</code> to
										change dropdown alignment
									</p>
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Text
								</Col>
								<Col sm={8} lg={9}>
									{/* BEGIN Dropdown */}
									<div className="mb-2">
										<Dropdown>
											<Dropdown.Toggle variant="primary">Click me</Dropdown.Toggle>
											<Dropdown.Menu animated className="p-4" style={{ maxWidth: 200 }}>
												<p>Some example text that&apos;s free-flowing within the dropdown menu.</p>
												<p className="mb-0">And this is more example text.</p>
											</Dropdown.Menu>
										</Dropdown>
									</div>
									{/* END Dropdown */}
									<p className="mb-0">You can insert any elements into dropdown menu</p>
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Form
								</Col>
								<Col sm={8} lg={9}>
									{/* BEGIN Dropdown */}
									<div className="mb-2">
										<Dropdown>
											<Dropdown.Toggle variant="primary">Click me</Dropdown.Toggle>
											<Dropdown.Menu animated>
												<Form className="d-grid gap-3 px-4 py-3">
													<Form.Group controlId="exampleDropdownFormEmail1">
														<Form.Label>Email address</Form.Label>
														<Form.Control type="email" placeholder="email@example.com" />
													</Form.Group>
													<Form.Group controlId="exampleDropdownFormPassword1">
														<Form.Label>Password</Form.Label>
														<Form.Control type="password" placeholder="Password" />
													</Form.Group>
													<Form.Group>
														<Form.Check type="checkbox" id="dropdownCheck" label="Remember me" />
													</Form.Group>
													<Button type="submit" variant="primary">
														Sign in
													</Button>
												</Form>
												<Dropdown.Divider />
												<Dropdown.Item href="#">New around here? Sign up</Dropdown.Item>
												<Dropdown.Item href="#">Forgot password?</Dropdown.Item>
											</Dropdown.Menu>
										</Dropdown>
									</div>
									{/* END Dropdown */}
									<p className="mb-0">
										Put a form within a dropdown menu, or make it into a dropdown menu, and use margin or padding
										utilities to give it the negative space you require.
									</p>
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Submenu
								</Col>
								<Col sm={8} lg={9}>
									{/* BEGIN Dropdown */}
									<div className="mb-2">
										<Dropdown align="start">
											<Dropdown.Toggle variant="primary">Click me</Dropdown.Toggle>
											<Dropdown.Menu animated>
												<Dropdown.Item href="#">Action</Dropdown.Item>
												<Dropdown.Item href="#">Another action</Dropdown.Item>
												{/* BEGIN Dropdown Submenu */}
												<Dropdown.Submenu>
													<Dropdown.Item href="#" caret>
														Submenu
													</Dropdown.Item>
													<Dropdown.SubmenuMenu align="end">
														<Dropdown.Item href="#">Item 1</Dropdown.Item>
														<Dropdown.Item href="#">Item 2</Dropdown.Item>
														{/* BEGIN Dropdown Submenu */}
														<Dropdown.Submenu>
															<Dropdown.Item href="#" caret>
																Submenu
															</Dropdown.Item>
															<Dropdown.SubmenuMenu align="end">
																<Dropdown.Item href="#">Item 1</Dropdown.Item>
																<Dropdown.Item href="#">Item 2</Dropdown.Item>
																{/* BEGIN Dropdown Submenu */}
																<Dropdown.Submenu>
																	<Dropdown.Item href="#" caret>
																		Another submenu
																	</Dropdown.Item>
																	<Dropdown.SubmenuMenu align="start">
																		<Dropdown.Item href="#">Item 1</Dropdown.Item>
																		<Dropdown.Item href="#">Item 2</Dropdown.Item>
																		<Dropdown.Item href="#">Item 3</Dropdown.Item>
																	</Dropdown.SubmenuMenu>
																</Dropdown.Submenu>
																{/* END Dropdown Submenu */}
																<Dropdown.Item href="#">Item 3</Dropdown.Item>
															</Dropdown.SubmenuMenu>
														</Dropdown.Submenu>
														{/* END Dropdown Submenu */}
														<Dropdown.Item href="#">Item 3</Dropdown.Item>
													</Dropdown.SubmenuMenu>
												</Dropdown.Submenu>
												{/* END Dropdown Submenu */}
												{/* BEGIN Dropdown Submenu */}
												<Dropdown.Submenu>
													<Dropdown.Item href="#" caret>
														Another submenu
													</Dropdown.Item>
													<Dropdown.SubmenuMenu align="end">
														<Dropdown.Item href="#">Item 1</Dropdown.Item>
														<Dropdown.Item href="#">Item 2</Dropdown.Item>
														<Dropdown.Item href="#">Item 3</Dropdown.Item>
														<Dropdown.Divider />
														<Dropdown.Item href="#">Item 4</Dropdown.Item>
														<Dropdown.Item href="#">Item 5</Dropdown.Item>
													</Dropdown.SubmenuMenu>
												</Dropdown.Submenu>
												{/* END Dropdown Submenu */}
												<Dropdown.Divider />
												<Dropdown.Item href="#">Something else here</Dropdown.Item>
											</Dropdown.Menu>
										</Dropdown>
									</div>
									{/* END Dropdown */}
									<p className="mb-0">
										You can make a submenu by implementing <code>Dropdown.Submenu</code> and{' '}
										<code>Dropdown.SubmenuMenu</code>
									</p>
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Grid
								</Col>
								<Col sm={8} lg={9}>
									{/* BEGIN Dropdown */}
									<div className="mb-2">
										<Dropdown>
											<Dropdown.Toggle variant="primary">Click me</Dropdown.Toggle>
											<Dropdown.Menu animated>
												<Dropdown.Row>
													<Dropdown.Col>
														<Dropdown.Item href="#">Action</Dropdown.Item>
														<Dropdown.Item href="#">Another action</Dropdown.Item>
														<Dropdown.Item href="#">Something else here</Dropdown.Item>
													</Dropdown.Col>
													<Dropdown.Col>
														<Dropdown.Item href="#" icon={<FontAwesomeIcon icon={faRocket} />}>
															Action
														</Dropdown.Item>
														<Dropdown.Item href="#" icon={<FontAwesomeIcon icon={faComments} />}>
															Another action
														</Dropdown.Item>
														<Dropdown.Item href="#" icon={<FontAwesomeIcon icon={faPaperPlane} />}>
															Something else here
														</Dropdown.Item>
													</Dropdown.Col>
													<Dropdown.Col>
														<Dropdown.Header>Header</Dropdown.Header>
														<Dropdown.Item href="#" bullet>
															Action
														</Dropdown.Item>
														<Dropdown.Item href="#" bullet>
															Another action
														</Dropdown.Item>
													</Dropdown.Col>
												</Dropdown.Row>
											</Dropdown.Menu>
										</Dropdown>
									</div>
									{/* END Dropdown */}
									<p className="mb-0">
										Combine <code>Dropdown.Row</code> and <code>Dropdown.Col</code> to make the grid
									</p>
								</Col>
							</Row>
						</div>
						{/* END Grid */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

DropdownPage.pageTitle = 'Dropdown'
DropdownPage.activeLink = 'elements.base.dropdown'
DropdownPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Base' },
	{ text: 'Dropdown', link: '/elements/base/dropdown' },
]

export default withAuth(DropdownPage)
