import React from 'react'
import withAuth from 'components/auth/withAuth'
import {
	Row,
	Col,
	Portlet,
	ButtonGroup,
	Button,
	ButtonToolbar,
	InputGroup,
	FormControl,
	DropdownButton,
	Dropdown,
	SplitButton,
	ToggleButtonGroup,
	ToggleButton,
} from '@blueupcode/components'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const ButtonGroupPage: ExtendedNextPage = () => {
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
							Wrap a series of <code>&lt;Button&gt;</code>s in a <code>&lt;ButtonGroup&gt;</code>.
						</p>
						{/* BEGIN Button Group */}
						<ButtonGroup>
							<Button variant="primary">Left</Button>
							<Button variant="primary">Middle</Button>
							<Button variant="primary">Right</Button>
						</ButtonGroup>
						{/* END Button Group */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Toolbar</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Combine sets of button groups into button toolbars for more complex components. Use utility classes as
							needed to space out groups, buttons, and more.
						</p>
						{/* BEGIN Grid */}
						<div className="d-grid gap-2">
							{/* BEGIN Button Toolbar */}
							<ButtonToolbar>
								<ButtonGroup className="me-2">
									<Button variant="primary">1</Button>
									<Button variant="primary">2</Button>
									<Button variant="primary">3</Button>
									<Button variant="primary">4</Button>
								</ButtonGroup>
								<ButtonGroup className="me-2">
									<Button variant="primary">5</Button>
									<Button variant="primary">6</Button>
									<Button variant="primary">7</Button>
								</ButtonGroup>
								<ButtonGroup>
									<Button variant="primary">8</Button>
								</ButtonGroup>
							</ButtonToolbar>
							{/* END Button Toolbar */}
							{/* BEGIN Button Toolbar */}
							<ButtonToolbar>
								<ButtonGroup className="me-2">
									<Button variant="primary">1</Button>
									<Button variant="primary">2</Button>
									<Button variant="primary">3</Button>
									<Button variant="primary">4</Button>
								</ButtonGroup>
								{/* BEGIN Input Group */}
								<InputGroup>
									<InputGroup.Text>@</InputGroup.Text>
									<FormControl type="text" placeholder="Input group example" />
								</InputGroup>
								{/* END Input Group */}
							</ButtonToolbar>
							{/* END Button Toolbar */}
						</div>
						{/* END Grid */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Nesting</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							You can place other button types within the
							<code>&lt;ButtonGroup&gt;</code> like <code>&lt;DropdownButton&gt;</code>s.
						</p>
						{/* BEGIN Button Group */}
						<ButtonGroup>
							<Button variant="primary">1</Button>
							<Button variant="primary">2</Button>
							{/* BEGIN Dropdown */}
							<DropdownButton as={ButtonGroup} title="Dropdown" id="nesting-dropdown">
								<Dropdown.Item eventKey="1">Link</Dropdown.Item>
								<Dropdown.Item eventKey="2">Link</Dropdown.Item>
							</DropdownButton>
							{/* END Dropdown */}
						</ButtonGroup>
						{/* END Button Group */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Vertical</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Make a set of buttons appear vertically stacked rather than horizontally, by adding{' '}
							<code>vertical</code> to the <code>&lt;ButtonGroup&gt;</code>.
							<strong>Split button dropdowns are not supported here.</strong>
						</p>
						{/* BEGIN Button Group */}
						<ButtonGroup vertical className="me-2">
							<Button variant="primary">Button</Button>
							<Button variant="primary">Button</Button>
							<Button variant="primary">Button</Button>
							<Button variant="primary">Button</Button>
							<Button variant="primary">Button</Button>
							<Button variant="primary">Button</Button>
						</ButtonGroup>
						{/* END Button Group */}
						{/* BEGIN Button Group */}
						<ButtonGroup vertical>
							<Button variant="primary">Button</Button>
							<Button variant="primary">Button</Button>
							{/* BEGIN Dropdown */}
							<DropdownButton as={ButtonGroup} title="Dropdown" id="vertical-nesting-dropdown">
								<Dropdown.Item eventKey="1">Link</Dropdown.Item>
								<Dropdown.Item eventKey="2">Link</Dropdown.Item>
							</DropdownButton>
							{/* END Dropdown */}
							<Button variant="primary">Button</Button>
							<Button variant="primary">Button</Button>
							<Button variant="primary">Button</Button>
						</ButtonGroup>
						{/* END Button Group */}
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
							Instead of applying button sizing props to every button in a group, just add <code>size</code> prop to
							the <code>&lt;ButtonGroup&gt;</code>.
						</p>
						{/* BEGIN Button Group */}
						<ButtonGroup size="lg" className="mb-2">
							<Button variant="primary">Left</Button>
							<Button variant="primary">Middle</Button>
							<Button variant="primary">Right</Button>
						</ButtonGroup>
						{/* END Button Group */}
						<br />
						{/* BEGIN Button Group */}
						<ButtonGroup className="mb-2">
							<Button variant="primary">Left</Button>
							<Button variant="primary">Middle</Button>
							<Button variant="primary">Right</Button>
						</ButtonGroup>
						{/* END Button Group */}
						<br />
						{/* BEGIN Button Group */}
						<ButtonGroup size="sm">
							<Button variant="primary">Left</Button>
							<Button variant="primary">Middle</Button>
							<Button variant="primary">Right</Button>
						</ButtonGroup>
						{/* END Button Group */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Split button</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Use <code>&lt;SplitButton&gt;</code> to make splited dropdown and button components.
						</p>
						{/* BEGIN Split Button */}
						<SplitButton variant="primary" title="Dropdown" id="split-button-dropdown" className="me-2">
							<Dropdown.Item href="#">Action</Dropdown.Item>
							<Dropdown.Item href="#">Another action</Dropdown.Item>
							<Dropdown.Item href="#">Something else here</Dropdown.Item>
							<Dropdown.Divider />
							<Dropdown.Item href="#">Separated link</Dropdown.Item>
						</SplitButton>
						{/* END Split Button */}
						{/* BEGIN Split Button */}
						<SplitButton drop="up" variant="primary" title="Dropup" id="split-button-dropup" className="me-2">
							<Dropdown.Item href="#">Action</Dropdown.Item>
							<Dropdown.Item href="#">Another action</Dropdown.Item>
							<Dropdown.Item href="#">Something else here</Dropdown.Item>
							<Dropdown.Divider />
							<Dropdown.Item href="#">Separated link</Dropdown.Item>
						</SplitButton>
						{/* END Split Button */}
						{/* BEGIN Split Button */}
						<SplitButton drop="end" variant="primary" title="Dropend" id="split-button-dropup" className="me-2">
							<Dropdown.Item href="#">Action</Dropdown.Item>
							<Dropdown.Item href="#">Another action</Dropdown.Item>
							<Dropdown.Item href="#">Something else here</Dropdown.Item>
							<Dropdown.Divider />
							<Dropdown.Item href="#">Separated link</Dropdown.Item>
						</SplitButton>
						{/* END Split Button */}
						{/* BEGIN Split Button */}
						<SplitButton drop="start" variant="primary" title="Dropstart" id="split-button-dropup">
							<Dropdown.Item href="#">Action</Dropdown.Item>
							<Dropdown.Item href="#">Another action</Dropdown.Item>
							<Dropdown.Item href="#">Something else here</Dropdown.Item>
							<Dropdown.Divider />
							<Dropdown.Item href="#">Separated link</Dropdown.Item>
						</SplitButton>
						{/* END Split Button */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Checkbox and radio button</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body className="pb-0">
						<p>
							Do more with buttons. Control button states or create groups of butons for more components like
							toolbars.
						</p>
						{/* BEGIN Portlet */}
						<Portlet>
							<Portlet.Header bordered>
								<Portlet.Title>Radio</Portlet.Title>
							</Portlet.Header>
							<Portlet.Body>
								{/* BEGIN Button Group */}
								<ToggleButtonGroup type="radio" name="btnradio" defaultValue="1">
									<ToggleButton variant="outline-primary" id="btnradio1" value="1">
										Radio 1
									</ToggleButton>
									<ToggleButton variant="outline-primary" id="btnradio2" value="2">
										Radio 2
									</ToggleButton>
									<ToggleButton variant="outline-primary" id="btnradio3" value="3">
										Radio 3
									</ToggleButton>
								</ToggleButtonGroup>
								{/* END Button Group */}
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
						{/* BEGIN Portlet */}
						<Portlet>
							<Portlet.Header bordered>
								<Portlet.Title>Checkbox</Portlet.Title>
							</Portlet.Header>
							<Portlet.Body>
								{/* BEGIN Button Group */}
								<ToggleButtonGroup type="checkbox" name="btncheck" defaultValue={['1']}>
									<ToggleButton variant="outline-primary" id="btncheck1" value="1">
										Checkbox 1
									</ToggleButton>
									<ToggleButton variant="outline-primary" id="btncheck2" value="2">
										Checkbox 2
									</ToggleButton>
									<ToggleButton variant="outline-primary" id="btncheck3" value="3">
										Checkbox 3
									</ToggleButton>
								</ToggleButtonGroup>
								{/* END Button Group */}
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

ButtonGroupPage.pageTitle = 'Button Group'
ButtonGroupPage.activeLink = 'elements.base.button-group'
ButtonGroupPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Base' },
	{ text: 'Button Group', link: '/elements/base/button-group' },
]

export default withAuth(ButtonGroupPage)
