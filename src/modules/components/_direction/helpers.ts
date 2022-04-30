export const getSystemDirection = (fallback?: string) => {
	if (typeof document === 'undefined') return undefined

	let direction

	try {
		direction = document.documentElement.dir || undefined
	} catch (e) {
		// Unsupported
	}

	return direction || fallback
}

export const animationStyleId = 'buc-direction-style'

export function disableAnimation() {
	const styleElement = document.createElement('style')
	styleElement.setAttribute('id', animationStyleId)
	styleElement.textContent = `
	* {
		animation: none !important;
		transition: none !important;
	}
	`

	document.head.append(styleElement)
}

export function enableAnimation() {
	setTimeout(() => {
		document.getElementById(animationStyleId)?.remove()
	}, 1000)
}
