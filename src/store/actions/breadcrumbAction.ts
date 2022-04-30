import type { PageBreadcrumb } from '@blueupcode/components/types'

export function breadcrumbChange(breadcrumbData: PageBreadcrumb) {
	return {
		type: 'BREADCRUMB_CHANGE',
		payload: breadcrumbData,
	}
}