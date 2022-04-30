import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Table } from '@blueupcode/components'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const TablePage: ExtendedNextPage = () => {
	return (
		<Row>
			<Col md={6}>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Basic table</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body className="pb-0">
						<p>
							Using the most basic table markup, here&apos;s how <code>Table</code>-based tables look.
						</p>
						{/* BEGIN Table */}
						<Table>
							<thead>
								<tr>
									<th scope="col">#</th>
									<th scope="col">Head</th>
									<th scope="col">Head</th>
									<th scope="col">Head</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<th scope="row">1</th>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
								</tr>
								<tr>
									<th scope="row">2</th>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
								</tr>
								<tr>
									<th scope="row">3</th>
									<td colSpan={2}>Long data</td>
									<td>Data</td>
								</tr>
							</tbody>
						</Table>
						{/* END Table */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Contextual colors</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body className="pb-0">
						<p>
							Use <code>variant</code> property to apply contextual colors
						</p>
						{/* BEGIN Table */}
						{['primary', 'secondary', 'success', 'info', 'danger', 'warning', 'dark', 'light'].map((variant, index) => (
							<Table key={index} variant={variant}>
								<thead>
									<tr>
										<th>#</th>
										<th>Head</th>
										<th>Head</th>
										<th>Head</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<th scope="row">1</th>
										<td>Data</td>
										<td>Data</td>
										<td>Data</td>
									</tr>
								</tbody>
							</Table>
						))}
						{/* END Table */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Hoverable &amp; active</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body className="pb-0">
						<p>
							Add <code>hover</code> property to enable hover effect.
						</p>
						{/* BEGIN Table */}
						<Table striped hover>
							<thead>
								<tr>
									<th>#</th>
									<th>Head</th>
									<th>Head</th>
									<th>Head</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<th scope="row">1</th>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
								</tr>
								<tr>
									<th scope="row">2</th>
									<td>Data</td>
									<td className="table-active">Data</td>
									<td>Data</td>
								</tr>
								<tr className="table-active">
									<th scope="row">3</th>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
								</tr>
							</tbody>
						</Table>
						{/* END Table */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Nesting</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body className="pb-0">
						<p>Border styles, active styles, and table variants are not inherited by nested tables.</p>
						{/* BEGIN Table */}
						<Table striped bordered>
							<thead>
								<tr>
									<th scope="col">#</th>
									<th scope="col">Head</th>
									<th scope="col">Head</th>
									<th scope="col">Head</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<th scope="row">1</th>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
								</tr>
								<tr>
									<td colSpan={4}>
										<Table className="mb-0">
											<thead>
												<tr>
													<th scope="col">Subhead</th>
													<th scope="col">Subhead</th>
													<th scope="col">Subhead</th>
												</tr>
											</thead>
											<tbody>
												<tr>
													<th scope="row">A</th>
													<td>Subdata</td>
													<td>Subdata</td>
												</tr>
												<tr>
													<th scope="row">B</th>
													<td>Subdata</td>
													<td>Subdata</td>
												</tr>
												<tr>
													<th scope="row">C</th>
													<td>Subdata</td>
													<td>Subdata</td>
												</tr>
											</tbody>
										</Table>
									</td>
								</tr>
								<tr>
									<th scope="row">3</th>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
								</tr>
							</tbody>
						</Table>
						{/* END Table */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Header &amp; footer</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body className="pb-0">
						{/* BEGIN Table */}
						<Table>
							<thead className="table-primary">
								<tr>
									<th scope="col">#</th>
									<th scope="col">Head</th>
									<th scope="col">Head</th>
									<th scope="col">Head</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<th scope="row">1</th>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
								</tr>
								<tr>
									<th scope="row">2</th>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
								</tr>
							</tbody>
							<tfoot>
								<tr>
									<td>Foot</td>
									<td>Foot</td>
									<td>Foot</td>
									<td>Foot</td>
								</tr>
							</tfoot>
						</Table>
						{/* END Table */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
			<Col md={6}>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Border variants</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body className="pb-0">
						<p>
							Change the table border style by applying <code>bordered|borderless</code> properties.
						</p>
						{/* BEGIN Table */}
						<Table bordered>
							<thead>
								<tr>
									<th scope="col">#</th>
									<th scope="col">Head</th>
									<th scope="col">Head</th>
									<th scope="col">Head</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<th scope="row">1</th>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
								</tr>
								<tr>
									<th scope="row">2</th>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
								</tr>
								<tr>
									<th scope="row">3</th>
									<td colSpan={2}>Long data</td>
									<td>Data</td>
								</tr>
							</tbody>
						</Table>
						{/* END Table */}
						{/* BEGIN Table */}
						<Table borderless>
							<thead>
								<tr>
									<th scope="col">#</th>
									<th scope="col">Head</th>
									<th scope="col">Head</th>
									<th scope="col">Head</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<th scope="row">1</th>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
								</tr>
								<tr>
									<th scope="row">2</th>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
								</tr>
								<tr>
									<th scope="row">3</th>
									<td colSpan={2}>Long data</td>
									<td>Data</td>
								</tr>
							</tbody>
						</Table>
						{/* END Table */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Striped</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body className="pb-0">
						<p>
							Use <code>striped</code> property to add zebra-striping to any table row within the{' '}
							<code>&lt;tbody&gt;</code>.
						</p>
						{/* BEGIN Table */}
						<Table striped>
							<thead>
								<tr>
									<th>#</th>
									<th>Head</th>
									<th>Head</th>
									<th>Head</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<th scope="row">1</th>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
								</tr>
								<tr>
									<th scope="row">2</th>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
								</tr>
								<tr>
									<th scope="row">3</th>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
								</tr>
							</tbody>
						</Table>
						{/* END Table */}
						{/* BEGIN Table */}
						<Table striped variant="primary">
							<thead>
								<tr>
									<th>#</th>
									<th>Head</th>
									<th>Head</th>
									<th>Head</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<th scope="row">1</th>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
								</tr>
								<tr>
									<th scope="row">2</th>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
								</tr>
								<tr>
									<th scope="row">3</th>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
								</tr>
							</tbody>
						</Table>
						{/* END Table */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Small table</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body className="pb-0">
						<p>
							Use <code>size=&quot;sm&quot;</code> to make tables compact by cutting cell padding in half.
						</p>
						{/* BEGIN Table */}
						<Table size="sm">
							<thead>
								<tr>
									<th scope="col">#</th>
									<th scope="col">Head</th>
									<th scope="col">Head</th>
									<th scope="col">Head</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<th scope="row">1</th>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
								</tr>
								<tr>
									<th scope="row">2</th>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
								</tr>
								<tr>
									<th scope="row">3</th>
									<td colSpan={2}>Long data</td>
									<td>Data</td>
								</tr>
							</tbody>
						</Table>
						{/* END Table */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Responsive table</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body className="pb-0">
						<p>
							Across every breakpoint, use <code>responsive</code> for horizontally scrolling tables. Responsive tables
							are wrapped automatically in a <code>div</code>. The following example has 12 columns that are scrollable
							horizontally.
						</p>
						{/* BEGIN Table */}
						<Table responsive striped hover>
							<thead>
								<tr>
									<th>#</th>
									<th>Head</th>
									<th>Head</th>
									<th>Head</th>
									<th>Head</th>
									<th>Head</th>
									<th>Head</th>
									<th>Head</th>
									<th>Head</th>
									<th>Head</th>
									<th>Head</th>
									<th>Head</th>
									<th>Head</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<th scope="row">1</th>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
								</tr>
								<tr>
									<th scope="row">2</th>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
								</tr>
								<tr>
									<th scope="row">3</th>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
								</tr>
							</tbody>
						</Table>
						{/* END Table */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Vertical alignment</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body className="pb-0">
						<p>
							Table cells of <code>&lt;thead&gt;</code> are always vertical aligned to the bottom. Table cells in{' '}
							<code>&lt;tbody&gt;</code> inherit their alignment from <code>&lt;Table&gt;</code> and are aligned to the
							the top by default.
						</p>
						{/* BEGIN Table */}
						<Table>
							<thead>
								<tr>
									<th scope="col" className="w-25">
										Heading 1
									</th>
									<th scope="col" className="w-25">
										Heading 2
									</th>
									<th scope="col" className="w-25">
										Heading 3
									</th>
									<th scope="col" className="w-25">
										Heading 4
									</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td className="align-top">This cell is aligned to the top.</td>
									<td className="align-middle">This cell is aligned to the middle.</td>
									<td className="align-bottom">This cell is aligned to the bottom.</td>
									<td>
										This here is some placeholder text, intended to take up quite a bit of vertical space, to
										demonstrate how the vertical alignment works in the preceding cells.
									</td>
								</tr>
							</tbody>
						</Table>
						{/* END Table */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Captions</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body className="pb-0">
						<p>
							A <code>&lt;caption&gt;</code> functions like a heading for a table. It helps users with screen readers to
							find a table and understand what it’s about and decide if they want to read it.
						</p>
						{/* BEGIN Table */}
						<Table className="caption-top">
							<caption>List of users</caption>
							<thead>
								<tr>
									<th scope="col">#</th>
									<th scope="col">Head</th>
									<th scope="col">Head</th>
									<th scope="col">Head</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<th scope="row">1</th>
									<td>Data</td>
									<td>Data</td>
									<td>Data</td>
								</tr>
							</tbody>
						</Table>
						{/* END Table */}
						<p>
							You can also put the <code>&lt;caption&gt;</code> on the top of the table with <code>.caption-top</code>.
						</p>
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

TablePage.pageTitle = 'Table'
TablePage.activeLink = 'elements.base.table'
TablePage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Base' },
	{ text: 'Table', link: '/elements/base/table' },
]

export default withAuth(TablePage)
