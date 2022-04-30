export function asideDekstopToggle() {
	return { type: 'ASIDE_DESKTOP_TOGGLE' }
}

export function asideMobileToggle() {
	return { type: 'ASIDE_MOBILE_TOGGLE' }
}

export function asideDekstopChange(asideState: boolean) {
	return {
		type: 'ASIDE_DESKTOP_CHANGE',
		payload: asideState,
	}
}

export function asideMobileChange(asideState: boolean) {
	return {
		type: 'ASIDE_MOBILE_CHANGE',
		payload: asideState,
	}
}
