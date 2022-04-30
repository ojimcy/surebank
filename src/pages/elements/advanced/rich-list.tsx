import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, RichList, Avatar, Caret, Badge } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog, faPaperPlane, faUser, faWrench } from '@fortawesome/free-solid-svg-icons'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const RichListPage: ExtendedNextPage = () => {
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
							<strong>Rich list</strong> is a flexible and powerful component for displaying a series of content. Basic
							rich list has <code>RichList.Item</code> where wrapping content or any elements.
						</p>
						{/* BEGIN Rich List */}
						<RichList>
							<RichList.Item content>
								<RichList.Title>Porta</RichList.Title>
								<RichList.Subtitle>Cras justo odio</RichList.Subtitle>
							</RichList.Item>
							<RichList.Item content>
								<RichList.Title>Consectetur</RichList.Title>
								<RichList.Subtitle>Dapibus ac facilisis in</RichList.Subtitle>
							</RichList.Item>
							<RichList.Item content>
								<RichList.Title>Vestibulum</RichList.Title>
								<RichList.Subtitle>Morbi leo risus</RichList.Subtitle>
							</RichList.Item>
						</RichList>
						{/* END Rich List */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Border variants</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body className="pb-0">
						<p>By default, rich list component has 2 border versions, like the examples below.</p>
						{/* BEGIN Portlet */}
						<Portlet>
							<Portlet.Header bordered>
								<Portlet.Title>Flush</Portlet.Title>
							</Portlet.Header>
							<Portlet.Body>
								<p>
									Extend basic rich list with <code>flush</code> property to appear like below.
								</p>
								{/* BEGIN Rich List */}
								<RichList flush>
									<RichList.Item>
										<RichList.Addon addonType="prepend">
											{/* BEGIN Avatar */}
											<Avatar display>
												<FontAwesomeIcon icon={faUser} />
											</Avatar>
											{/* END Avatar */}
										</RichList.Addon>
										<RichList.Content>
											<RichList.Title>Porta</RichList.Title>
											<RichList.Subtitle>Cras justo odio</RichList.Subtitle>
										</RichList.Content>
										<RichList.Addon addonType="append">
											<Caret className="mx-2" />
										</RichList.Addon>
									</RichList.Item>
									<RichList.Item>
										<RichList.Addon addonType="prepend">
											{/* BEGIN Avatar */}
											<Avatar display>
												<FontAwesomeIcon icon={faUser} />
											</Avatar>
											{/* END Avatar */}
										</RichList.Addon>
										<RichList.Content>
											<RichList.Title>Consectetur</RichList.Title>
											<RichList.Subtitle>Dapibus ac facilisis in</RichList.Subtitle>
										</RichList.Content>
										<RichList.Addon addonType="append">
											<Badge variant="label-success">9+</Badge>
										</RichList.Addon>
									</RichList.Item>
									<RichList.Item>
										<RichList.Addon addonType="prepend">
											{/* BEGIN Avatar */}
											<Avatar display>
												<FontAwesomeIcon icon={faUser} />
											</Avatar>
											{/* END Avatar */}
										</RichList.Addon>
										<RichList.Content>
											<RichList.Title>Vestibulum</RichList.Title>
											<RichList.Subtitle>Morbi leo risus</RichList.Subtitle>
										</RichList.Content>
										<RichList.Addon addonType="append">
											<Badge variant="primary">new</Badge>
										</RichList.Addon>
									</RichList.Item>
								</RichList>
								{/* END Rich List */}
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
						{/* BEGIN Portlet */}
						<Portlet>
							<Portlet.Header bordered>
								<Portlet.Title>Bordered</Portlet.Title>
							</Portlet.Header>
							<Portlet.Body>
								<p>
									Extend basic rich list with <code>bordered</code> property to appear like below.
								</p>
								{/* BEGIN Rich List */}
								<RichList bordered>
									<RichList.Item>
										<RichList.Addon addonType="prepend">
											{/* BEGIN Avatar */}
											<Avatar display>
												<FontAwesomeIcon icon={faUser} />
											</Avatar>
											{/* END Avatar */}
										</RichList.Addon>
										<RichList.Content>
											<RichList.Title>Porta</RichList.Title>
											<RichList.Subtitle>Cras justo odio</RichList.Subtitle>
										</RichList.Content>
										<RichList.Addon addonType="append">
											<Caret className="mx-2" />
										</RichList.Addon>
									</RichList.Item>
									<RichList.Item>
										<RichList.Addon addonType="prepend">
											{/* BEGIN Avatar */}
											<Avatar display>
												<FontAwesomeIcon icon={faUser} />
											</Avatar>
											{/* END Avatar */}
										</RichList.Addon>
										<RichList.Content>
											<RichList.Title>Consectetur</RichList.Title>
											<RichList.Subtitle>Dapibus ac facilisis in</RichList.Subtitle>
										</RichList.Content>
										<RichList.Addon addonType="append">
											<Badge variant="label-success">9+</Badge>
										</RichList.Addon>
									</RichList.Item>
									<RichList.Item>
										<RichList.Addon addonType="prepend">
											{/* BEGIN Avatar */}
											<Avatar display>
												<FontAwesomeIcon icon={faUser} />
											</Avatar>
											{/* END Avatar */}
										</RichList.Addon>
										<RichList.Content>
											<RichList.Title>Vestibulum</RichList.Title>
											<RichList.Subtitle>Morbi leo risus</RichList.Subtitle>
										</RichList.Content>
										<RichList.Addon addonType="append">
											<Badge variant="primary">new</Badge>
										</RichList.Addon>
									</RichList.Item>
								</RichList>
								{/* END Rich List */}
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
			<Col md={6}>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Addon</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Put other elements inside rich list within <code>RichList.Addon</code>
						</p>
						{/* BEGIN Rich List */}
						<RichList>
							<RichList.Item>
								<RichList.Addon addonType="prepend">
									{/* BEGIN Avatar */}
									<Avatar display>
										<FontAwesomeIcon icon={faCog} />
									</Avatar>
									{/* END Avatar */}
								</RichList.Addon>
								<RichList.Content>
									<RichList.Title>Porta</RichList.Title>
									<RichList.Subtitle>Cras justo odio</RichList.Subtitle>
								</RichList.Content>
								<RichList.Addon addonType="append">
									<Caret className="mx-2" />
								</RichList.Addon>
							</RichList.Item>
							<RichList.Item>
								<RichList.Addon addonType="prepend">
									{/* BEGIN Avatar */}
									<Avatar variant="success" display circle>
										<FontAwesomeIcon icon={faWrench} />
									</Avatar>
									{/* END Avatar */}
								</RichList.Addon>
								<RichList.Content>
									<RichList.Title>Consectetur</RichList.Title>
									<RichList.Subtitle>Dapibus ac facilisis in</RichList.Subtitle>
								</RichList.Content>
								<RichList.Addon addonType="append">
									<Badge variant="label-success">9+</Badge>
								</RichList.Addon>
							</RichList.Item>
							<RichList.Item>
								<RichList.Addon addonType="prepend">
									{/* BEGIN Avatar */}
									<Avatar variant="label-primary" display>
										<FontAwesomeIcon icon={faPaperPlane} />
									</Avatar>
									{/* END Avatar */}
								</RichList.Addon>
								<RichList.Content>
									<RichList.Title>Vestibulum</RichList.Title>
									<RichList.Subtitle>Morbi leo risus</RichList.Subtitle>
								</RichList.Content>
								<RichList.Addon addonType="append">
									<Badge variant="primary">new</Badge>
								</RichList.Addon>
							</RichList.Item>
						</RichList>
						{/* END Rich List */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Action</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							If you want to make your rich list has clickable behavior, you must add <code>action</code> property.
						</p>
						{/* BEGIN Rich List */}
						<RichList bordered action>
							<RichList.Item>
								<RichList.Addon addonType="prepend">
									{/* BEGIN Avatar */}
									<Avatar display>
										<FontAwesomeIcon icon={faUser} />
									</Avatar>
									{/* END Avatar */}
								</RichList.Addon>
								<RichList.Content>
									<RichList.Title>Porta</RichList.Title>
									<RichList.Subtitle>Cras justo odio</RichList.Subtitle>
								</RichList.Content>
								<RichList.Addon addonType="append">
									<Caret className="mx-2" />
								</RichList.Addon>
							</RichList.Item>
							<RichList.Item>
								<RichList.Addon addonType="prepend">
									{/* BEGIN Avatar */}
									<Avatar display>
										<FontAwesomeIcon icon={faUser} />
									</Avatar>
									{/* END Avatar */}
								</RichList.Addon>
								<RichList.Content>
									<RichList.Title>Consectetur</RichList.Title>
									<RichList.Subtitle>Dapibus ac facilisis in</RichList.Subtitle>
								</RichList.Content>
								<RichList.Addon addonType="append">
									<Badge variant="label-success">9+</Badge>
								</RichList.Addon>
							</RichList.Item>
							<RichList.Item>
								<RichList.Addon addonType="prepend">
									{/* BEGIN Avatar */}
									<Avatar display>
										<FontAwesomeIcon icon={faUser} />
									</Avatar>
									{/* END Avatar */}
								</RichList.Addon>
								<RichList.Content>
									<RichList.Title>Vestibulum</RichList.Title>
									<RichList.Subtitle>Morbi leo risus</RichList.Subtitle>
								</RichList.Content>
								<RichList.Addon addonType="append">
									<Badge variant="primary">new</Badge>
								</RichList.Addon>
							</RichList.Item>
						</RichList>
						{/* END Rich List */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>States</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							We provide <code>active</code> and <code>disabled</code> states for <code>RichList.Item</code>, look the
							example
						</p>
						{/* BEGIN Rich List */}
						<RichList bordered action>
							<RichList.Item active>
								<RichList.Addon addonType="prepend">
									{/* BEGIN Avatar */}
									<Avatar display>
										<FontAwesomeIcon icon={faUser} />
									</Avatar>
									{/* END Avatar */}
								</RichList.Addon>
								<RichList.Content>
									<RichList.Title>Active state</RichList.Title>
									<RichList.Subtitle>Cras justo odio</RichList.Subtitle>
								</RichList.Content>
								<RichList.Addon addonType="append">
									<Caret className="mx-2" />
								</RichList.Addon>
							</RichList.Item>
							<RichList.Item disabled>
								<RichList.Addon addonType="prepend">
									{/* BEGIN Avatar */}
									<Avatar display>
										<FontAwesomeIcon icon={faUser} />
									</Avatar>
									{/* END Avatar */}
								</RichList.Addon>
								<RichList.Content>
									<RichList.Title>Disabled state</RichList.Title>
									<RichList.Subtitle>Dapibus ac facilisis in</RichList.Subtitle>
								</RichList.Content>
								<RichList.Addon addonType="append">
									<Badge variant="label-success">9+</Badge>
								</RichList.Addon>
							</RichList.Item>
							<RichList.Item>
								<RichList.Addon addonType="prepend">
									{/* BEGIN Avatar */}
									<Avatar display>
										<FontAwesomeIcon icon={faUser} />
									</Avatar>
									{/* END Avatar */}
								</RichList.Addon>
								<RichList.Content>
									<RichList.Title>Vestibulum</RichList.Title>
									<RichList.Subtitle>Morbi leo risus</RichList.Subtitle>
								</RichList.Content>
								<RichList.Addon addonType="append">
									<Badge variant="primary">new</Badge>
								</RichList.Addon>
							</RichList.Item>
						</RichList>
						{/* END Rich List */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

RichListPage.pageTitle = 'Rich List'
RichListPage.activeLink = 'elements.advanced.rich-list'
RichListPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Advanced' },
	{ text: 'Rich List', link: '/elements/advanced/rich-list' },
]

export default withAuth(RichListPage)
