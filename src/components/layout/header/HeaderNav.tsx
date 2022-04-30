import React from 'react'
import { Dropdown, Badge, Button, GridNav } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBoxes, faProjectDiagram, faTasks, faDollarSign, faUserCog } from '@fortawesome/free-solid-svg-icons'
import {
	faWindowRestore,
	faClipboard,
	faQuestionCircle,
	faImages,
	faChartBar,
	faBookmark,
} from '@fortawesome/free-regular-svg-icons'
import Link from 'next/link'

const LayoutHeaderNav: React.FC = () => {
	return (
		<>
			{/* BEGIN Dropdown */}
			<Dropdown className="d-inline">
				<Dropdown.Toggle variant="flat-primary" width="wider" noCaret active>
					Apps
				</Dropdown.Toggle>
				<Dropdown.Menu align="start" animated>
					<Dropdown.Item
						icon={<FontAwesomeIcon icon={faBoxes} />}
						addon={
							<Badge variant="warning" pill>
								20
							</Badge>
						}
					>
						Inventory Manager
					</Dropdown.Item>
					{/* BEGIN Dropdown Submenu */}
					<Dropdown.Submenu>
						<Dropdown.Item icon={<FontAwesomeIcon icon={faProjectDiagram} />} caret>
							Project manager
						</Dropdown.Item>
						<Dropdown.SubmenuMenu align="end">
							<Dropdown.Item bullet>Create project</Dropdown.Item>
							<Dropdown.Item bullet>Delete project</Dropdown.Item>
							<Dropdown.Item bullet>Ongoing project</Dropdown.Item>
							<Dropdown.Item bullet>Completed project</Dropdown.Item>
							<Dropdown.Item bullet>Urgent project</Dropdown.Item>
						</Dropdown.SubmenuMenu>
					</Dropdown.Submenu>
					{/* END Dropdown Submenu */}
					{/* BEGIN Dropdown Submenu */}
					<Dropdown.Submenu>
						<Dropdown.Item icon={<FontAwesomeIcon icon={faTasks} />} caret>
							Task manager
						</Dropdown.Item>
						<Dropdown.SubmenuMenu align="end">
							<Dropdown.Item bullet>Show task</Dropdown.Item>
							<Dropdown.Item bullet>Assign task</Dropdown.Item>
							<Dropdown.Item bullet>Assign member</Dropdown.Item>
							<Dropdown.Item bullet>Completed task</Dropdown.Item>
							<Dropdown.Item bullet>Urgent task</Dropdown.Item>
						</Dropdown.SubmenuMenu>
					</Dropdown.Submenu>
					{/* END Dropdown Submenu */}
					<Dropdown.Item icon={<FontAwesomeIcon icon={faDollarSign} />}>Invoice</Dropdown.Item>
					<Dropdown.Item icon={<FontAwesomeIcon icon={faUserCog} />}>My Account</Dropdown.Item>
				</Dropdown.Menu>
			</Dropdown>
			{/* END Dropdown */}
			{/* BEGIN Dropdown */}
			<Dropdown className="d-inline">
				<Dropdown.Toggle variant="flat-primary" width="wider" className="ms-2"  noCaret>
					Features
				</Dropdown.Toggle>
				<Dropdown.Menu wide animated align="start" className="overflow-hidden">
					<Dropdown.Row>
						{/* BEGIN Dropdown Column */}
						<Dropdown.Col className="d-flex flex-column align-items-start justify-content-center bg-primary text-white">
							<h2 className="font-weight-bolder">Welcome back!</h2>
							<p>
								Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium, commodi hic qui aspernatur
								doloremque quos tempora placeat culpa illum, voluptatibus delectus provident cumque aliquid enim,
								laborum aliquam. Quod, perferendis unde.
							</p>
							<Link href="/pages/login/login-1" passHref>
								<Button variant="light" width="wider">
									Login
								</Button>
							</Link>
						</Dropdown.Col>
						{/* END Dropdown Column */}
						{/* BEGIN Dropdown Column */}
						<Dropdown.Col>
							<Dropdown.Header>Features</Dropdown.Header>
							{/* BEGIN Grid Nav */}
							<GridNav action>
								<GridNav.Row>
									<GridNav.Item icon={<FontAwesomeIcon icon={faWindowRestore} />}>Dashboard</GridNav.Item>
									<GridNav.Item icon={<FontAwesomeIcon icon={faClipboard} />}>TODO List</GridNav.Item>
									<GridNav.Item icon={<FontAwesomeIcon icon={faQuestionCircle} />}>Help Center</GridNav.Item>
								</GridNav.Row>
								<GridNav.Row>
									<GridNav.Item icon={<FontAwesomeIcon icon={faImages} />}>Galery</GridNav.Item>
									<GridNav.Item icon={<FontAwesomeIcon icon={faChartBar} />}>Scrumboard</GridNav.Item>
									<GridNav.Item icon={<FontAwesomeIcon icon={faBookmark} />}>Docs</GridNav.Item>
								</GridNav.Row>
							</GridNav>
							{/* END Grid Nav */}
						</Dropdown.Col>
						{/* END Dropdown Column */}
						{/* BEGIN Dropdown Column */}
						<Dropdown.Col className="border-start">
							<Dropdown.Header>Tools</Dropdown.Header>
							<Dropdown.Item bullet>Components</Dropdown.Item>
							<Dropdown.Item bullet>Form Wizard</Dropdown.Item>
							<Dropdown.Item bullet>Documentation</Dropdown.Item>
							<Dropdown.Item bullet>Knowledge Base</Dropdown.Item>
							<Dropdown.Item bullet>Inventory Manager</Dropdown.Item>
						</Dropdown.Col>
						{/* END Dropdown Column */}
					</Dropdown.Row>
				</Dropdown.Menu>
			</Dropdown>
			{/* END Dropdown */}
		</>
	)
}

export default LayoutHeaderNav
