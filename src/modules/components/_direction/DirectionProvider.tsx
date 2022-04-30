import React from 'react'
import { disableAnimation, enableAnimation } from './helpers'
import { DirectionContext, useDirectionProps } from './DirectionContextHook'
import { getSystemDirection } from './helpers'
import { Direction } from '../types'

export interface DirectionProviderProps extends Partial<useDirectionProps> {
	defaultDirection: Direction
	children: React.ReactNode
}

function DirectionProvider({ defaultDirection = 'ltr', children }: DirectionProviderProps) {
	const [dir, setDir] = React.useState(() => (getSystemDirection() || defaultDirection) as Direction)

	const contextValue = React.useMemo(() => ({ dir, setDir }), [dir, setDir])

	React.useEffect(() => {
		document.documentElement.dir = dir
		disableAnimation()
		enableAnimation()
	}, [dir])

	return <DirectionContext.Provider value={contextValue}>{children}</DirectionContext.Provider>
}

export default DirectionProvider
