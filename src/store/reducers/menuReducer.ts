import { HYDRATE } from 'next-redux-wrapper'
import { AnyAction } from 'redux'

export interface MenuReducerState {
	activeLink: string
	activeLinkPartial: Array<string>
}

const InitialState = {
	activeLink: '',
	activeLinkPartial: [],
}

const menuReducer = (state: MenuReducerState = InitialState, action: AnyAction) => {
	switch (action.type) {
		case HYDRATE:
			return { ...state, ...action.payload }
		case 'MENU_ACTIVE_LINK_CHANGE':
			return { ...state, activeLink: action.payload }
		case 'MENU_ACTIVE_LINK_PARTIAL_CHANGE':
			return { ...state, activeLinkPartial: action.payload }
		default:
			return state
	}
}

export default menuReducer
