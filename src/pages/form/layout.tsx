import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Form, Button, InputGroup } from '@blueupcode/components'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const FormLayoutPage: ExtendedNextPage = () => {
	return (
		<Row>
			<Col md={6}>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Basic layout</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Every group of form fields should reside in a <code>&lt;Form&gt;</code> element. Bootstrap provides no
							default styling for the <code>&lt;Form&gt;</code> element, but there are some powerful browser features
							that are provided by default.
						</p>
						<p>
							The <code>FormGroup</code> component is the easiest way to add some structure to forms. It provides a
							flexible container for grouping of labels, controls, optional help text, and form validation messaging.
							Use it with <code>fieldset</code>s, <code>div</code>s, or nearly any other element.
						</p>
						<p>
							You also add the <code>controlId</code> prop to accessibly wire the nested label and input together via
							the <code>id</code>.
						</p>
						<hr />
						{/* BEGIN Form */}
						<Form className="d-grid gap-3">
							<Form.Group controlId="formGroupExampleInput">
								<Form.Label>Example label</Form.Label>
								<Form.Control type="text" placeholder="Example input placeholder" />
							</Form.Group>
							<Form.Group controlId="formGroupExampleInput2">
								<Form.Label>Another label</Form.Label>
								<Form.Control type="text" placeholder="Another input placeholder" />
							</Form.Group>
						</Form>
						{/* END Form */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Horizontal form</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Create horizontal forms with the grid by adding <code>as={`{Row}`}</code> to form groups and using{' '}
							<code>Col</code> to specify the width of your labels and controls. Be sure to add the{' '}
							<code>column </code> prop to your <code>FormLabel</code>s as well so they’re vertically centered with
							their associated form controls.
						</p>
						<hr />
						{/* BEGIN Form */}
						<Form className="d-grid gap-3">
							{/* BEGIN Form Group */}
							<Form.Group as={Row} controlId="formHorizontalEmail">
								<Form.Label column sm={2}>
									Email
								</Form.Label>
								<Col sm={10}>
									<Form.Control type="email" />
								</Col>
							</Form.Group>
							{/* END Form Group */}
							{/* BEGIN Form Group */}
							<Form.Group as={Row} controlId="formHorizontalPassword">
								<Form.Label column sm={2}>
									Password
								</Form.Label>
								<Col sm={10}>
									<Form.Control type="password" />
								</Col>
							</Form.Group>
							{/* END Form Group */}
							{/* BEGIN Fieldset */}
							<fieldset>
								<Form.Group as={Row}>
									<Form.Label as="legend" column sm={2}>
										Radios
									</Form.Label>
									<Col sm={10}>
										<Form.Check
											type="radio"
											label="First radio"
											name="formHorizontalRadios"
											id="formHorizontalRadios1"
											defaultChecked={true}
										/>
										<Form.Check
											type="radio"
											label="Second radio"
											name="formHorizontalRadios"
											id="formHorizontalRadios2"
										/>
										<Form.Check
											type="radio"
											label="Third disabled radio"
											name="formHorizontalRadios"
											id="formHorizontalRadios3"
											disabled
										/>
									</Col>
								</Form.Group>
							</fieldset>
							{/* END Fieldset */}
							{/* BEGIN Form Group */}
							<Form.Group as={Row} controlId="formHorizontalCheck">
								<Col sm={{ span: 10, offset: 2 }}>
									<Form.Check label="Example checkbox" />
								</Col>
							</Form.Group>
							{/* END Form Group */}
							{/* BEGIN Form Group */}
							<Form.Group as={Row}>
								<Col sm={{ span: 10, offset: 2 }}>
									<Button type="submit">Sign in</Button>
								</Col>
							</Form.Group>
							{/* END Form Group */}
						</Form>
						{/* END Form */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Horizontal form sizing</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							You can size the <code>&lt;FormLabel&gt;</code> using the <code>column</code> prop as shown.
						</p>
						<hr />
						{/* BEGIN Form */}
						<Form className="d-grid gap-3">
							<Form.Group as={Row} controlId="colFormLabelSm">
								<Form.Label column="sm" sm={2}>
									Email
								</Form.Label>
								<Col sm={10}>
									<Form.Control type="email" size="sm" placeholder="col-form-label-sm" />
								</Col>
							</Form.Group>
							<Form.Group as={Row} controlId="colFormLabel">
								<Form.Label column sm={2}>
									Email
								</Form.Label>
								<Col sm={10}>
									<Form.Control type="email" placeholder="col-form-label" />
								</Col>
							</Form.Group>
							<Form.Group as={Row} controlId="colFormLabelLg">
								<Form.Label column sm={2}>
									Email
								</Form.Label>
								<Col sm={10}>
									<Form.Control type="email" placeholder="col-form-label-lg" />
								</Col>
							</Form.Group>
						</Form>
						{/* END Form */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
			<Col md={6}>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Form grid</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							More complex forms can be built using the grid components. Use these for form layouts that require
							multiple columns, varied widths, and additional alignment options.
						</p>
						<hr />
						{/* BEGIN Form */}
						<Form as={Row} className="g-3">
							<Col md={6}>
								<Form.Group controlId="inputEmail4">
									<Form.Label>Email</Form.Label>
									<Form.Control type="email" />
								</Form.Group>
							</Col>
							<Col md={6}>
								<Form.Group controlId="inputPassword4">
									<Form.Label>Password</Form.Label>
									<Form.Control type="password" />
								</Form.Group>
							</Col>
							<Col xs={12}>
								<Form.Group controlId="inputAddress">
									<Form.Label>Address</Form.Label>
									<Form.Control type="text" placeholder="1234 Main St" />
								</Form.Group>
							</Col>
							<Col xs={12}>
								<Form.Group controlId="inputAddress2">
									<Form.Label>Address 2</Form.Label>
									<Form.Control type="text" placeholder="Apartment, studio, or floor" />
								</Form.Group>
							</Col>
							<Col md={6}>
								<Form.Group controlId="inputCity">
									<Form.Label>City</Form.Label>
									<Form.Control type="text" />
								</Form.Group>
							</Col>
							<Col md={4}>
								<Form.Group controlId="inputState">
									<Form.Label>State</Form.Label>
									<Form.Select defaultValue="none">
										<option value="none">Choose...</option>
										<option value="more">...</option>
									</Form.Select>
								</Form.Group>
							</Col>
							<Col md={2}>
								<Form.Group controlId="inputZip">
									<Form.Label>Zip</Form.Label>
									<Form.Control type="text" />
								</Form.Group>
							</Col>
							<Col xs={12}>
								<Form.Check type="checkbox" id="gridCheck" label="Check me out" />
							</Col>
							<Col xs={12}>
								<Button type="submit" variant="primary">
									Sign in
								</Button>
							</Col>
						</Form>
						{/* END Form */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Column sizing</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							As shown in the previous examples, our grid system allows you to place any number of{' '}
							<code>&lt;Col&gt;</code>s within a <code>&lt;Row&gt;</code>. They&apos;ll split the available width
							equally between them. You may also pick a subset of your columns to take up more or less space, while
							the remaining <code>&lt;Col&gt;</code>s equally split the rest, with specific column classes like{' '}
							<code>&lt;Col xs={`{7}`}&gt;</code>.
						</p>
						<hr />
						{/* BEGIN Form */}
						<Form as={Row} className="g-3">
							<Col sm={7}>
								<Form.Control type="text" placeholder="City" />
							</Col>
							<Col sm>
								<Form.Control type="text" placeholder="State" />
							</Col>
							<Col sm>
								<Form.Control type="text" placeholder="Zip" />
							</Col>
						</Form>
						{/* END Form */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Auto-sizing</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							The example below uses a flexbox utility to vertically center the contents and changes{' '}
							<code>&lt;Col&gt;</code> to <code>&lt;Col xs=&quot;auto&quot;&gt;</code> so that your columns only take
							up as much space as needed. Put another way, the column sizes itself based on on the contents.
						</p>
						<hr />
						{/* BEGIN Form */}
						<Form as={Row} className="gx-3 gy-2 align-items-center">
							<Col sm={3}>
								<Form.Group controlId="specificSizeInputName">
									<Form.Label visuallyHidden>Name</Form.Label>
									<Form.Control type="text" placeholder="Jane Doe" />
								</Form.Group>
							</Col>
							<Col sm={3}>
								<Form.Group controlId="specificSizeInputGroupUsername">
									<Form.Label visuallyHidden>Username</Form.Label>
									{/* BEGIN Input Group */}
									<InputGroup>
										<InputGroup.Text>@</InputGroup.Text>
										<Form.Control type="text" placeholder="Username" />
									</InputGroup>
									{/* END Input Group */}
								</Form.Group>
							</Col>
							<Col sm={3}>
								<Form.Group controlId="specificSizeSelect">
									<Form.Label visuallyHidden>Preference</Form.Label>
									<Form.Select defaultValue="none">
										<option value="none">Choose...</option>
										<option value="1">One</option>
										<option value="2">Two</option>
										<option value="3">Three</option>
									</Form.Select>
								</Form.Group>
							</Col>
							<Col xs="auto">
								<Form.Check type="checkbox" id="autoSizingCheck2" label="Remember me" className="mb-0" />
							</Col>
							<Col xs="auto">
								<Button type="submit" variant="primary">
									Submit
								</Button>
							</Col>
						</Form>
						{/* END Form */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Inline forms</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Use the <code>{`{ cols: 'auto' }`}</code> property value to create responsive horizontal layouts. By
							adding gutter modifier classes, we&apos;ll have gutters in horizontal and vertical directions. The{' '}
							<code>.align-items-center</code> aligns the form elements to the middle, making the form element align
							properly.
						</p>
						<hr />
						{/* BEGIN Form */}
						<Form as={Row} lg={{ cols: 'auto' }} className="g-3 align-items-center">
							<Col xs={12}>
								<Form.Group controlId="inlineFormInputGroupUsername">
									<Form.Label visuallyHidden>Username</Form.Label>
									{/* BEGIN Input Group */}
									<InputGroup>
										<InputGroup.Text>@</InputGroup.Text>
										<Form.Control type="text" placeholder="Username" />
									</InputGroup>
									{/* END Input Group */}
								</Form.Group>
							</Col>
							<Col xs={12}>
								<Form.Group controlId="inlineFormSelectPref">
									<Form.Label visuallyHidden>Preference</Form.Label>
									<Form.Select defaultValue="none">
										<option value="none">Choose...</option>
										<option value="1">One</option>
										<option value="2">Two</option>
										<option value="3">Three</option>
									</Form.Select>
								</Form.Group>
							</Col>
							<Col xs={12}>
								<Form.Check type="checkbox" id="inlineFormCheck" label="Remember me" className="mb-lg-0" />
							</Col>
							<Col xs={12}>
								<Button type="submit" variant="primary">
									Submit
								</Button>
							</Col>
						</Form>
						{/* END Form */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

FormLayoutPage.pageTitle = 'Form Layout'
FormLayoutPage.activeLink = 'form.layout'
FormLayoutPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Form' },
	{ text: 'Layout', link: '/form/layout' },
]

export default withAuth(FormLayoutPage)
