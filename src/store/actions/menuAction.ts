export function menuActiveLinkChange(linkName: string) {
	return {
		type: 'MENU_ACTIVE_LINK_CHANGE',
		payload: linkName,
	}
}

export function menuActiveLinkPartialChange(linkPartial: Array<string>) {
	return {
		type: 'MENU_ACTIVE_LINK_PARTIAL_CHANGE',
		payload: linkPartial,
	}
}
