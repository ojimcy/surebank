import { HYDRATE } from 'next-redux-wrapper'
import { AnyAction } from 'redux'

export interface OffcanvasReducerState {
	[offcanvasKey: string]: boolean
}

const InitialState = {
	agenda: false,
	setting: false,
	navigation: false,
}

const offcanvasReducer = (state: OffcanvasReducerState = InitialState, action: AnyAction) => {
	switch (action.type) {
		case HYDRATE:
			return { ...state, ...action.payload }
		case 'OFFCANVAS_TOGGLE':
			return { ...state, [action.payload]: !state[action.payload] }
		case 'OFFCANVAS_CHANGE':
			return { ...state, [action.payload.name]: action.payload.value }
		default:
			return state
	}
}

export default offcanvasReducer
