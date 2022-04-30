import React from 'react'
import withAuth from 'components/auth/withAuth'
import {
	Row,
	Col,
	Portlet,
	Form,
	InputGroup,
	Button,
	DropdownButton,
	Dropdown,
	SplitButton,
} from '@blueupcode/components'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const InputGroupPage: ExtendedNextPage = () => {
	return (
		<Row>
			<Col md={6}>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Basic</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Place one add-on or button on either side of an input. You may also place one on both sides of an input.
							Remember to place <code>&lt;label&gt;</code>s outside the input group.
						</p>
						<hr />
						{/* BEGIN Grid */}
						<div className="d-grid gap-3">
							{/* BEGIN Input Group */}
							<InputGroup>
								<InputGroup.Text>@</InputGroup.Text>
								<Form.Control type="text" placeholder="Username" />
							</InputGroup>
							{/* END Input Group */}
							{/* BEGIN Input Group */}
							<InputGroup>
								<Form.Control type="text" placeholder="Recipient's username" />
								<InputGroup.Text>@example.com</InputGroup.Text>
							</InputGroup>
							{/* END Input Group */}
							{/* BEGIN Form Group */}
							<Form.Group controlId="basic-url">
								<Form.Label>Your vanity URL</Form.Label>
								{/* BEGIN Input Group */}
								<InputGroup>
									<InputGroup.Text>https://example.com/users/</InputGroup.Text>
									<Form.Control type="text" />
								</InputGroup>
								{/* END Input Group */}
							</Form.Group>
							{/* END Form Group */}
							{/* BEGIN Input Group */}
							<InputGroup>
								<InputGroup.Text>$</InputGroup.Text>
								<Form.Control type="text" />
								<InputGroup.Text>.00</InputGroup.Text>
							</InputGroup>
							{/* END Input Group */}
							{/* BEGIN Input Group */}
							<InputGroup>
								<Form.Control type="text" placeholder="Username" />
								<InputGroup.Text>@</InputGroup.Text>
								<Form.Control type="text" placeholder="Server" />
							</InputGroup>
							{/* END Input Group */}
							{/* BEGIN Input Group */}
							<InputGroup>
								<InputGroup.Text>With textarea</InputGroup.Text>
								<Form.Control as="textarea" />
							</InputGroup>
							{/* END Input Group */}
						</div>
						{/* END Grid */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Multiple inputs</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							While multiple inputs are supported visually, validation styles are only available for input groups with
							a single input.
						</p>
						<hr />
						{/* BEGIN Input Group */}
						<InputGroup>
							<InputGroup.Text>First and last name</InputGroup.Text>
							<Form.Control type="text" />
							<Form.Control type="text" />
						</InputGroup>
						{/* END Input Group */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Button addons</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						{/* BEGIN Grid */}
						<div className="d-grid gap-3">
							{/* BEGIN Input Group */}
							<InputGroup>
								<Button variant="outline-secondary">Button</Button>
								<Form.Control type="text" />
							</InputGroup>
							{/* END Input Group */}
							{/* BEGIN Input Group */}
							<InputGroup>
								<Form.Control type="text" />
								<Button variant="outline-secondary">Button</Button>
								<Button variant="outline-secondary">Button</Button>
							</InputGroup>
							{/* END Input Group */}
							{/* BEGIN Input Group */}
							<InputGroup>
								<DropdownButton variant="outline-secondary" title="Dropdown">
									<Dropdown.Item href="#">Action</Dropdown.Item>
									<Dropdown.Item href="#">Another action</Dropdown.Item>
									<Dropdown.Item href="#">Something else here</Dropdown.Item>
									<Dropdown.Divider />
									<Dropdown.Item href="#">Separated link</Dropdown.Item>
								</DropdownButton>
								<Form.Control type="text" />
							</InputGroup>
							{/* END Input Group */}
							{/* BEGIN Input Group */}
							<InputGroup>
								<Form.Control type="text" />
								<SplitButton variant="outline-secondary" title="Dropdown" align="end">
									<Dropdown.Item href="#">Action</Dropdown.Item>
									<Dropdown.Item href="#">Another action</Dropdown.Item>
									<Dropdown.Item href="#">Something else here</Dropdown.Item>
									<Dropdown.Divider />
									<Dropdown.Item href="#">Separated link</Dropdown.Item>
								</SplitButton>
							</InputGroup>
							{/* END Input Group */}
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
							Add the relative form sizing classes to the <code>InputGroup</code> and contents within will
							automatically resize—no need for repeating the form control size classes on each element.
						</p>
						<hr />
						{/* BEGIN Grid */}
						<div className="d-grid gap-3">
							{/* BEGIN Input Group */}
							<InputGroup size="sm">
								<InputGroup.Text>Small</InputGroup.Text>
								<Form.Control type="text" />
							</InputGroup>
							{/* END Input Group */}
							{/* BEGIN Input Group */}
							<InputGroup>
								<InputGroup.Text>Default</InputGroup.Text>
								<Form.Control type="text" />
							</InputGroup>
							{/* END Input Group */}
							{/* BEGIN Input Group */}
							<InputGroup size="lg">
								<InputGroup.Text>Large</InputGroup.Text>
								<Form.Control type="text" />
							</InputGroup>
							{/* END Input Group */}
						</div>
						{/* END Grid */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Checkboxes and radios</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Use the <code>InputGroup.Radio</code> or
							<code>InputGroup.Checkbox</code> to add options to an input group.
						</p>
						<hr />
						{/* BEGIN Grid */}
						<div className="d-grid gap-3">
							{/* BEGIN Input Group */}
							<InputGroup>
								<InputGroup.Checkbox />
								<Form.Control type="text" />
							</InputGroup>
							{/* END Input Group */}
							{/* BEGIN Input Group */}
							<InputGroup>
								<InputGroup.Radio />
								<Form.Control type="text" />
							</InputGroup>
							{/* END Input Group */}
						</div>
						{/* END Grid */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Multiple addons</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>Multiple add-ons are supported and can be mixed with checkbox and radio input versions.</p>
						<hr />
						{/* BEGIN Grid */}
						<div className="d-grid gap-3">
							{/* BEGIN Input Group */}
							<InputGroup>
								<InputGroup.Text>$</InputGroup.Text>
								<InputGroup.Text>0.00</InputGroup.Text>
								<Form.Control type="text" />
							</InputGroup>
							{/* END Input Group */}
							{/* BEGIN Input Group */}
							<InputGroup>
								<Form.Control type="text" />
								<InputGroup.Text>$</InputGroup.Text>
								<InputGroup.Text>0.00</InputGroup.Text>
							</InputGroup>
							{/* END Input Group */}
						</div>
						{/* END Grid */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Custom inputs</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						{/* BEGIN Grid */}
						<div className="d-grid gap-3">
							{/* BEGIN Input Group */}
							<InputGroup>
								<InputGroup.Text>Options</InputGroup.Text>
								<Form.Select defaultValue="none">
									<option value="none">Choose...</option>
									<option value="1">One</option>
									<option value="2">Two</option>
									<option value="3">Three</option>
								</Form.Select>
							</InputGroup>
							{/* END Input Group */}
							{/* BEGIN Input Group */}
							<InputGroup>
								<Form.Control type="file" />
								<Button variant="outline-secondary">Button</Button>
							</InputGroup>
							{/* END Input Group */}
						</div>
						{/* END Grid */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

InputGroupPage.pageTitle = 'Input Group'
InputGroupPage.activeLink = 'form.group'
InputGroupPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Form' },
	{ text: 'Input Group', link: '/form/group' },
]

export default withAuth(InputGroupPage)
