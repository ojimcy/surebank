export function pageTitleChange(pageTitle: string) {
	return {
		type: 'PAGE_TITLE_CHANGE',
		payload: pageTitle,
	}
}