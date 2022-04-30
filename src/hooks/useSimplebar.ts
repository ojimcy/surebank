import React from 'react'
import SimpleBar from 'simplebar'

export default function useSimplebar() {
	const simplebarInstance = React.useRef<SimpleBar>()

	const simplebarCallback = React.useCallback((node) => {
		if (node) {
			simplebarInstance.current = new SimpleBar(node)
		}
	}, [])

	return simplebarCallback
}
