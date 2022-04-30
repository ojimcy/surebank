import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, ProgressBar } from '@blueupcode/components'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const ProgressPage: ExtendedNextPage = () => {
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
							<strong>Progress</strong> provide up-to-date feedback on the progress of a workflow or action with
							simple yet flexible progress bars.
						</p>
						{/* BEGIN Progresses */}
						<div className="d-grid gap-2">
							<ProgressBar now={25} />
							<ProgressBar now={50} />
							<ProgressBar now={75} />
							<ProgressBar now={100} />
						</div>
						{/* END Progresses */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Striped</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Add <code>striped</code> property to any <code>Progress</code> component to apply a stripe via CSS
							gradient over the progress bar&apos;s background color.
						</p>
						{/* BEGIN Portlet */}
						<Portlet>
							<Portlet.Body>
								{/* BEGIN Progresses */}
								<div className="d-grid gap-2">
									<ProgressBar striped variant="primary" now={20} />
									<ProgressBar striped variant="secondary" now={30} />
									<ProgressBar striped variant="info" now={40} />
								</div>
								{/* END Progresses */}
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
						<p>
							The striped gradient can also be animated. Add <code>animated</code> property to <code>Progress</code>{' '}
							component to animate the stripes via CSS3 animations.
						</p>
						{/* BEGIN Portlet */}
						<Portlet noMargin>
							<Portlet.Body>
								{/* BEGIN Progresses */}
								<div className="d-grid gap-2">
									<ProgressBar striped animated variant="primary" now={20} />
									<ProgressBar striped animated variant="secondary" now={30} />
									<ProgressBar striped animated variant="info" now={40} />
								</div>
								{/* END Progresses */}
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Multiple</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>Include multiple progress bars in a progress component if you need.</p>
						{/* BEGIN Progresses */}
						<ProgressBar>
							<ProgressBar now={15} />
							<ProgressBar variant="success" now={30} />
							<ProgressBar variant="info" now={20} />
						</ProgressBar>
						{/* END Progresses */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
			<Col md={6}>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Contextual color</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Use <code>variant</code> property to change the appearance of individual progress bars.
						</p>
						{/* BEGIN Progresses */}
						<div className="d-grid gap-2">
							<ProgressBar variant="primary" now={20} />
							<ProgressBar variant="secondary" now={30} />
							<ProgressBar variant="success" now={40} />
							<ProgressBar variant="info" now={50} />
							<ProgressBar variant="danger" now={60} />
							<ProgressBar variant="warning" now={70} />
							<ProgressBar variant="dark" now={80} />
						</div>
						{/* END Progresses */}
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
							Add a <code>label</code> prop to show a visible percentage. For low percentages, consider adding a
							min-width to ensure the label&apos;s text is fully visible.
						</p>
						{/* BEGIN Progresses */}
						<div className="d-grid gap-2">
							<ProgressBar variant="primary" now={20} label="20%" />
							<ProgressBar variant="secondary" now={30} label="30%" />
							<ProgressBar variant="success" now={40} label="40%" />
						</div>
						{/* END Progresses */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Height</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							Use <code>size</code> property to change progress element height.
						</p>
						{/* BEGIN Progresses */}
						<div className="d-grid gap-2 mb-3">
							<ProgressBar size="sm" now={25} />
							<ProgressBar size="lg" now={25} />
						</div>
						{/* END Progresses */}
						<p>
							Or you can set a height value on the <code>Progress</code>.
						</p>
						{/* BEGIN Progresses */}
						<div className="d-grid gap-2">
							<ProgressBar now={25} style={{ height: '2px' }} />
							<ProgressBar now={25} style={{ height: '10px' }} />
						</div>
						{/* END Progresses */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

ProgressPage.pageTitle = 'Progress'
ProgressPage.activeLink = 'elements.base.progress'
ProgressPage.breadcrumb = [
	{ text: "Dashboard", link: "/" },
	{ text: "Elements" },
	{ text: "Base" },
	{ text: "Progress", link: "/elements/base/progress" }
]

export default withAuth(ProgressPage)
