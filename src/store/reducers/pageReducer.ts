import { HYDRATE } from 'next-redux-wrapper'
import { AnyAction } from 'redux'

export interface PageReducerState {
	pageTitle: string
}

const InitialState = {
	pageTitle: '',
}

const pageReducer = (state: PageReducerState = InitialState, action: AnyAction) => {
	switch (action.type) {
		case HYDRATE:
			return { ...state, ...action.payload }
		case 'PAGE_TITLE_CHANGE':
			return { ...state, pageTitle: action.payload }
		default:
			return state
	}
}

export default pageReducer
