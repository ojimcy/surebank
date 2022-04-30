import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Avatar, AvatarGroup, Marker } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faStar, faUser } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'
import Link from 'next/link'
import type { AvatarVariant } from '@blueupcode/components/avatar/Avatar'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const AvatarPage: ExtendedNextPage = () => {
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
							<strong>Avatar</strong> can be used for displaying image, icon, or character on square or circle shaped
							elements. Put image, icon, or character into <code>Avatar.Display</code> or add <code>display</code>{' '}
							property to <code>Avatar</code> component. Look the example below.
						</p>
						{/* BEGIN Avatars */}
						<div className="d-flex">
							<Avatar display>
								<FontAwesomeIcon icon={faUser} />
							</Avatar>
							<Avatar display>
								<Image src="/images/avatar/blank.webp" layout="fill" alt="Avatar image" />
							</Avatar>
							<Avatar display>C</Avatar>
						</div>
						{/* END Avatars */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Circle version</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Extend default avatar element with <code>circle</code> property to change its shape to be circular.
						</p>
						{/* BEGIN Avatars */}
						<div className="d-flex">
							<Avatar display circle>
								<FontAwesomeIcon icon={faUser} />
							</Avatar>
							<Avatar display circle>
								<Image src="/images/avatar/blank.webp" layout="fill" alt="Avatar image" />
							</Avatar>
							<Avatar display circle>
								C
							</Avatar>
						</div>
						{/* END Avatars */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Sizing</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							If you want to change avatar size, you can use <code>size</code> property with <code>sm|lg</code> values.
						</p>
						{/* BEGIN Avatars */}
						<Avatar display size="sm">
							A
						</Avatar>
						<Avatar display>B</Avatar>
						<Avatar display size="lg">
							C
						</Avatar>
						<Avatar display circle size="sm">
							A
						</Avatar>
						<Avatar display circle>
							B
						</Avatar>
						<Avatar display circle size="lg">
							C
						</Avatar>
						{/* END Avatars */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Group</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Wrap a series of avatar elements into <code>AvatarGroup</code> to group the elements. Instead of applying
							avatar sizing classes to every avatar in a group, just set <code>size</code> property to each{' '}
							<code>AvatarGroup</code>
						</p>
						{/* BEGIN Avatar Group */}
						<AvatarGroup size="sm">
							<Avatar display circle>
								A
							</Avatar>
							<Avatar display circle>
								A
							</Avatar>
							<Avatar display circle>
								A
							</Avatar>
							<Avatar display circle>
								A
							</Avatar>
						</AvatarGroup>
						{/* END Avatar Group */}
						{/* BEGIN Avatar Group */}
						<AvatarGroup>
							<Avatar display circle>
								B
							</Avatar>
							<Avatar display circle>
								B
							</Avatar>
							<Avatar display circle>
								B
							</Avatar>
							<Avatar display circle>
								B
							</Avatar>
						</AvatarGroup>
						{/* END Avatar Group */}
						{/* BEGIN Avatar Group */}
						<AvatarGroup size="lg">
							<Avatar display circle>
								C
							</Avatar>
							<Avatar display circle>
								C
							</Avatar>
							<Avatar display circle>
								C
							</Avatar>
							<Avatar display circle>
								C
							</Avatar>
						</AvatarGroup>
						{/* END Avatar Group */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
			<Col md={6}>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Contextual colors</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>Change avatar color for functionality, check examples below.</p>
						{/* BEGIN Portlet */}
						<Portlet>
							<Portlet.Header bordered>
								<Portlet.Title>Solid</Portlet.Title>
							</Portlet.Header>
							<Portlet.Body>
								<p>
									You can use those by setting <code>variant</code> property to avatar element
								</p>
								{/* BEGIN Avatars */}
								{['primary', 'secondary', 'info', 'success', 'warning', 'danger', 'light', 'dark'].map((variant) => (
									<Avatar key={variant} variant={variant as AvatarVariant} display>
										<FontAwesomeIcon icon={faUser} />
									</Avatar>
								))}
								{/* END Avatars */}
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
						{/* BEGIN Portlet */}
						<Portlet>
							<Portlet.Header bordered>
								<Portlet.Title>Label</Portlet.Title>
							</Portlet.Header>
							<Portlet.Body>
								<p>
									For these variant, you can use <code>label-(color)</code> in <code>variant</code> property
								</p>
								{/* BEGIN Avatars */}
								{[
									'label-primary',
									'label-secondary',
									'label-info',
									'label-success',
									'label-warning',
									'label-danger',
									'label-light',
									'label-dark',
								].map((variant) => (
									<Avatar key={variant} variant={variant as AvatarVariant} display>
										<FontAwesomeIcon icon={faUser} />
									</Avatar>
								))}
								{/* END Avatars */}
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Addon</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Addon can be replaced to <strong>top-left</strong> or <strong>bottom-right</strong> of avatar element. Use{' '}
							<code>Avatar.Addon</code> and you must set <code>position</code> property to set placement. You can put{' '}
							<Link href="/elements/base/badge">badge</Link> or <Link href="/elements/base/marker">marker</Link> into
							avatar addon.
						</p>
						{/* BEGIN Avatars */}
						<Avatar variant="primary">
							<Avatar.Addon position="top">
								<Marker type="dot" variant="success" />
							</Avatar.Addon>
							<Avatar.Display>
								<FontAwesomeIcon icon={faUser} />
							</Avatar.Display>
						</Avatar>
						<Avatar variant="primary">
							<Avatar.Display>
								<FontAwesomeIcon icon={faUser} />
							</Avatar.Display>
							<Avatar.Addon position="bottom">
								<Marker type="dot" variant="success" />
							</Avatar.Addon>
						</Avatar>
						<Avatar variant="primary">
							<Avatar.Addon position="top">
								<Avatar.Icon variant="danger">
									<FontAwesomeIcon icon={faCheck} />
								</Avatar.Icon>
							</Avatar.Addon>
							<Avatar.Display>
								<FontAwesomeIcon icon={faUser} />
							</Avatar.Display>
						</Avatar>
						<Avatar variant="primary">
							<Avatar.Display>
								<FontAwesomeIcon icon={faUser} />
							</Avatar.Display>
							<Avatar.Addon position="bottom">
								<Avatar.Icon variant="success">
									<FontAwesomeIcon icon={faStar} />
								</Avatar.Icon>
							</Avatar.Addon>
						</Avatar>
						<Avatar variant="primary">
							<Avatar.Addon position="top">
								<Avatar.Badge pill variant="danger">
									9+
								</Avatar.Badge>
							</Avatar.Addon>
							<Avatar.Display>
								<FontAwesomeIcon icon={faUser} />
							</Avatar.Display>
						</Avatar>
						<Avatar variant="primary">
							<Avatar.Display>
								<FontAwesomeIcon icon={faUser} />
							</Avatar.Display>
							<Avatar.Addon position="bottom">
								<Avatar.Badge pill variant="success">
									9+
								</Avatar.Badge>
							</Avatar.Addon>
						</Avatar>
						{/* BEGIN Avatars */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

AvatarPage.pageTitle = 'Avatar'
AvatarPage.activeLink = 'elements.advanced.avatar'
AvatarPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Advanced' },
	{ text: 'Avatar', link: '/elements/advanced/avatar' },
]

export default withAuth(AvatarPage)
