import { HYDRATE } from 'next-redux-wrapper'
import { AnyAction } from 'redux'

export interface LayoutReducerState {
	asideDesktopMinimized: boolean
	asideMobileMinimized: boolean
}

const InitialState = {
	asideDesktopMinimized: false,
	asideMobileMinimized: true,
}

const layoutReducer = (state: LayoutReducerState = InitialState, action: AnyAction) => {
	switch (action.type) {
		case HYDRATE:
			return { ...state, ...action.payload }
		case 'ASIDE_DESKTOP_TOGGLE':
			return { ...state, asideDesktopMinimized: !state.asideDesktopMinimized }
		case 'ASIDE_MOBILE_TOGGLE':
			return { ...state, asideMobileMinimized: !state.asideMobileMinimized }
		case 'ASIDE_DESKTOP_CHANGE':
			return { ...state, asideDesktopMinimized: action.payload }
		case 'ASIDE_MOBILE_CHANGE':
			return { ...state, asideMobileMinimized: action.payload }
		default:
			return state
	}
}

export default layoutReducer
