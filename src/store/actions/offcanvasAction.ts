export function offcanvasToggle(offcanvasKey: string) {
	return {
		type: 'OFFCANVAS_TOGGLE',
		payload: offcanvasKey,
	}
}

export function offcanvasChange(offcanvasState: { name: string; value: boolean }) {
	return {
		type: 'OFFCANVAS_CHANGE',
		payload: offcanvasState,
	}
}
