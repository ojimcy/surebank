import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Form, FloatingLabel } from '@blueupcode/components'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const FormBasePage: ExtendedNextPage = () => {
	return (
		<Row>
			<Col md={6}>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Base</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							The <code>&lt;FormControl&gt;</code> component renders a form control with Bootstrap styling. The{' '}
							<code>&lt;FormGroup&gt;</code> component wraps a form control with proper spacing, along with support for
							a label, help text, and validation state. To ensure accessibility, set <code>controlId</code> on{' '}
							<code>&lt;FormGroup&gt;</code>, and use <code>&lt;FormLabel&gt;</code> for the label.
						</p>
						<hr />
						{/* BEGIN Grid */}
						<div className="d-grid gap-3">
							<Form.Group controlId="exampleFormControlInput1">
								<Form.Label>Email address</Form.Label>
								<Form.Control type="email" placeholder="name@example.com" />
							</Form.Group>
							<Form.Group controlId="exampleFormControlTextarea1">
								<Form.Label>Example textarea</Form.Label>
								<Form.Control as="textarea" rows={3} />
							</Form.Group>
						</div>
						{/* END Grid */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Disabled state</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Add the <code>disabled</code> boolean attribute on an input to prevent user interactions and make it
							appear lighter.
						</p>
						<hr />
						{/* BEGIN Grid */}
						<div className="d-grid gap-3">
							<Form.Control type="text" placeholder="Disabled input" disabled />
							<Form.Control type="text" defaultValue="Disabled readonly input" disabled readOnly />
						</div>
						{/* END Grid */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Color</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<Form.Group controlId="exampleColorInput">
							<Form.Label>Color picker</Form.Label>
							<Form.Control type="color" defaultValue="#563d7c" title="Choose your color" />
						</Form.Group>
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Select</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Customize the native <code>&lt;select&gt;</code>s with custom CSS that changes the element&apos;s initial
							appearance.
						</p>
						<p>
							Use <code>&lt;Form.Select&gt;</code> instead of <code>&lt;select&gt;</code> element
						</p>
						<hr />
						{/* BEGIN Grid */}
						<div className="d-grid gap-3">
							<Form.Select defaultValue="none" size="lg">
								<option value="none">Open this select menu</option>
								<option value="1">One</option>
								<option value="2">Two</option>
								<option value="3">Three</option>
							</Form.Select>
							<Form.Select defaultValue="none">
								<option value="none">Open this select menu</option>
								<option value="1">One</option>
								<option value="2">Two</option>
								<option value="3">Three</option>
							</Form.Select>
							<Form.Select defaultValue="none" size="sm">
								<option value="none">Open this select menu</option>
								<option value="1">One</option>
								<option value="2">Two</option>
								<option value="3">Three</option>
							</Form.Select>
							<Form.Select multiple defaultValue={[]}>
								<option value="none">Open this select menu</option>
								<option value="1">One</option>
								<option value="2">Two</option>
								<option value="3">Three</option>
							</Form.Select>
							<Form.Select disabled defaultValue="none">
								<option value="none">Open this select menu</option>
								<option value="1">One</option>
								<option value="2">Two</option>
								<option value="3">Three</option>
							</Form.Select>
						</div>
						{/* END Grid */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Checkbox and Radio</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							For the non-textual checkbox and radio controls, <code>FormCheck</code>
							provides a single component for both types that adds some additional styling and improved layout.
						</p>
						<hr />
						{/* BEGIN Grid */}
						<div className="d-grid gap-3">
							<div>
								<Form.Check type="checkbox" id="flexCheckDefault" label="Default checkbox" />
								<Form.Check type="checkbox" id="flexCheckChecked" label="Checked checkbox" defaultChecked={true} />
								<Form.Check type="checkbox" id="flexCheckDisabled" label="Checked checkbox" disabled />
								<Form.Check
									type="checkbox"
									id="flexCheckCheckedDisabled"
									label="Disabled checked checkbox"
									defaultChecked={true}
									disabled
								/>
							</div>
							<div>
								<Form.Check type="radio" id="flexRadioDefault1" name="flexRadioDefault" label="Default radio" />
								<Form.Check
									type="radio"
									id="flexRadioDefault2"
									name="flexRadioDefault"
									label="Default checked radio"
									defaultChecked={true}
								/>
								<Form.Check
									type="radio"
									id="flexRadioDisabled"
									name="flexRadioDisabled"
									label="Disabled radio"
									disabled
								/>
								<Form.Check
									type="radio"
									id="flexRadioCheckedDisabled"
									name="flexRadioDisabled"
									label="Disabled checked radio"
									defaultChecked={true}
									disabled
								/>
							</div>
						</div>
						{/* END Grid */}
						<hr />
						<p>
							Group checkboxes or radios on the same horizontal row by adding the <code>inline</code> prop.
						</p>
						<hr />
						<div>
							<Form.Check type="checkbox" id="inlineCheckbox1" label="1" inline />
							<Form.Check type="checkbox" id="inlineCheckbox2" label="2" inline />
							<Form.Check type="checkbox" id="inlineCheckbox3" label="3 (disabled)" inline disabled />
						</div>
						<hr />
						<p>
							When you render a FormCheck without a label (no <code>children</code>) some additional styling is applied
							to keep the inputs from collapsing.
						</p>
						<hr />
						{/* BEGIN Grid */}
						<div className="d-grid gap-2">
							<Form.Check type="checkbox" id="checkboxNoLabel" />
							<Form.Check type="radio" id="radioNoLabel1" name="radioNoLabel" />
						</div>
						{/* END Grid */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Switches</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							A switch has the markup of a custom checkbox but uses <code>type=&quot;switch&quot;</code>
							to render a toggle switch. Switches also support the same customizable children as{' '}
							<code>&lt;FormCheck&gt;</code>.
						</p>
						<p>
							You can also use the <code>&lt;Form.Switch&gt;</code> alias which encapsulates the above, in a very small
							component wrapper.
						</p>
						<hr />
						{/* BEGIN Grid */}
						<div className="d-grid gap-1">
							<Form.Switch id="flexSwitchCheckDefault" label="Default switch checkbox input" />
							<Form.Switch id="flexSwitchCheckChecked" label="Checked switch checkbox input" defaultChecked={true} />
							<Form.Switch id="flexSwitchCheckDisabled" label="Disabled switch checkbox input" disabled />
							<Form.Switch
								id="flexSwitchCheckCheckedDisabled"
								label="Disabled checked switch checkbox input"
								defaultChecked={true}
								disabled
							/>
						</div>
						{/* END Grid */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
			<Col md={6}>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Sizing</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Use <code>size</code> on <code>&lt;FormControl&gt;</code> to change the size of the input.
						</p>
						<hr />
						{/* BEGIN Grid */}
						<div className="d-grid gap-3">
							<Form.Control type="text" size="lg" placeholder=".form-control-lg" />
							<Form.Control type="text" placeholder="Default input" />
							<Form.Control type="text" size="sm" placeholder=".form-control-sm" />
						</div>
						{/* END Grid */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Readonly</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Add the <code>readOnly</code> prop on an input to prevent modification of the input&apos;s value.
							Read-only inputs appear lighter (just like disabled inputs), but retain the standard cursor.
						</p>
						<hr />
						<Form.Control type="text" defaultValue="Readonly input here..." readOnly />
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Readonly plain text</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							If you want to have readonly elements in your form styled as plain text, use the <code>plaintext</code>{' '}
							prop on FormControls to remove the default form field styling and preserve the correct margin and padding.
						</p>
						<hr />
						{/* BEGIN Grid */}
						<div className="d-grid gap-3">
							<Form.Group as={Row} controlId="staticEmail">
								<Form.Label column sm={2}>
									Email
								</Form.Label>
								<Col sm={10}>
									<Form.Control type="text" defaultValue="email@example.com" readOnly plaintext />
								</Col>
							</Form.Group>
							<Form.Group as={Row} controlId="inputPassword">
								<Form.Label column sm={2}>
									Password
								</Form.Label>
								<Col sm={10}>
									<Form.Control type="password" />
								</Col>
							</Form.Group>
						</div>
						{/* END Grid */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>File input</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						{/* BEGIN Grid */}
						<div className="d-grid gap-3">
							<Form.Group controlId="formFile">
								<Form.Label>Default file input example</Form.Label>
								<Form.Control type="file" />
							</Form.Group>
							<Form.Group controlId="formFileMultiple">
								<Form.Label>Multiple files input example</Form.Label>
								<Form.Control type="file" multiple />
							</Form.Group>
							<Form.Group controlId="formFileDisabled">
								<Form.Label>Disabled file input example</Form.Label>
								<Form.Control type="file" disabled />
							</Form.Group>
							<Form.Group controlId="formFileSm">
								<Form.Label>Small file input example</Form.Label>
								<Form.Control type="file" size="sm" />
							</Form.Group>
							<Form.Group controlId="formFileLg">
								<Form.Label>Large file input example</Form.Label>
								<Form.Control type="file" size="lg" />
							</Form.Group>
						</div>
						{/* END Grid */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Range</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Create custom <code>&lt;input type=&quot;range&quot;&gt;</code> controls with{' '}
							<code>&lt;FormRange&gt;</code>. The track (the background) and thumb (the value) are both styled to appear
							the same across browsers. As only Firefox supports “filling” their track from the left or right of the
							thumb as a means to visually indicate progress, we do not currently support it.
						</p>
						<hr />
						{/* BEGIN Grid */}
						<div className="d-grid gap-1">
							<Form.Group controlId="customRange1">
								<Form.Label>Example range</Form.Label>
								<Form.Range />
							</Form.Group>
							<Form.Group controlId="disabledRange">
								<Form.Label>Disabled range</Form.Label>
								<Form.Range disabled />
							</Form.Group>
						</div>
						{/* END Grid */}
						<hr />
						<p>
							By default, range inputs “snap” to integer values. To change this, you can specify a <code>step</code>{' '}
							value. In the example below, we double the number of steps by using <code>step=&quot;0.5&quot;</code>.
						</p>
						<hr />
						<Form.Group controlId="customRange3">
							<Form.Label>Example range</Form.Label>
							<Form.Range min="0" max="5" step="0.5" />
						</Form.Group>
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Floating label</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Wrap a <code>&lt;Form.Control&gt;</code> element in <code>&lt;FloatingLabel&gt;</code> to enable floating
							labels with Bootstrap&apos;s textual form fields. A <code>placeholder</code> is required on each{' '}
							<code>&lt;Form.Control&gt;</code> as our method of CSS-only floating labels uses the{' '}
							<code>:placeholder-shown</code> pseudo-element.
						</p>
						<hr />
						{/* BEGIN Grid */}
						<div className="d-grid gap-3">
							<FloatingLabel controlId="floatingInput" label="Email address">
								<Form.Control type="email" placeholder="name@example.com" />
							</FloatingLabel>
							<FloatingLabel controlId="floatingPassword" label="Password">
								<Form.Control type="password" placeholder="Password" />
							</FloatingLabel>
							<FloatingLabel controlId="floatingTextarea" label="Comments">
								<Form.Control as="textarea" placeholder="Leave a comment here" />
							</FloatingLabel>
							<FloatingLabel controlId="floatingSelect" label="Works with selects">
								<Form.Select defaultValue="none">
									<option value="none">Open this select menu</option>
									<option value="1">One</option>
									<option value="2">Two</option>
									<option value="3">Three</option>
								</Form.Select>
							</FloatingLabel>
						</div>
						{/* END Grid */}
						<hr />
						<p>Floating labels also support sizing classes.</p>
						<hr />
						{/* BEGIN Grid */}
						<div className="d-grid gap-3">
							<FloatingLabel controlId="floatingSizeLarge" label="Large">
								<Form.Control type="text" size="lg" placeholder=".form-control-lg" />
							</FloatingLabel>
							<FloatingLabel controlId="floatingSizeNormal" label="Normal">
								<Form.Control type="text" placeholder="no modifier" />
							</FloatingLabel>
							<FloatingLabel controlId="floatingSizeSmall" label="Small">
								<Form.Control type="text" size="sm" placeholder=".form-control-sm" />
							</FloatingLabel>
						</div>
						{/* END Grid */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

FormBasePage.pageTitle = 'Base Form'
FormBasePage.activeLink = 'form.base'
FormBasePage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Form' },
	{ text: 'Base', link: '/form/base' },
]

export default withAuth(FormBasePage)
