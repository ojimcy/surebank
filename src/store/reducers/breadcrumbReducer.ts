import { HYDRATE } from 'next-redux-wrapper'
import { AnyAction } from 'redux'
import type { PageBreadcrumb } from '@blueupcode/components/types'

export interface BreadcrumbReducerState {
	breadcrumbData: PageBreadcrumb
}

const InitialState = {
	breadcrumbData: [],
}

const breadcrumbReducer = (state: BreadcrumbReducerState = InitialState, action: AnyAction) => {
	switch (action.type) {
		case HYDRATE:
			return { ...state, ...action.payload }
		case 'BREADCRUMB_CHANGE':
			return { ...state, breadcrumbData: action.payload }
		default:
			return state
	}
}

export default breadcrumbReducer
