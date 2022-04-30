import React from 'react'
import { Breadcrumb } from '@blueupcode/components'
import { Home } from 'react-feather'
import { connect } from 'react-redux'
import Link from 'next/link'
import type { State } from 'store/reducers'
import type { PageBreadcrumb } from '@blueupcode/components/types'

const LayoutHeaderBreadcrumb: React.FC<LayoutHeaderBreadcrumbProps> = ({ breadcrumbData }) => {
	return (
		<Breadcrumb transparent className="mb-0">
			{breadcrumbData.map((data, index) => {
				const BreadcrumbItemIcon = index === 0 ? <Home /> : undefined
				const BreadcrumbItem = <Breadcrumb.Item icon={BreadcrumbItemIcon}>{data.text}</Breadcrumb.Item>

				if (data.link) {
					return (
						<Link passHref key={index} href={data.link}>
							{BreadcrumbItem}
						</Link>
					)
				}

				return BreadcrumbItem
			})}
		</Breadcrumb>
	)
}

interface LayoutHeaderBreadcrumbProps {
	breadcrumbData: PageBreadcrumb
}

function mapStateToProps(state: State) {
	return {
		breadcrumbData: state.breadcrumb.breadcrumbData,
	}
}

export default connect(mapStateToProps)(LayoutHeaderBreadcrumb)
