import React from 'react'
import { Direction } from '../types'

export interface useDirectionProps {
	dir: Direction
	setDir: (dir: Direction) => void
}

export const DirectionContext = React.createContext<useDirectionProps>({
	dir: 'ltr',
	setDir: (_) => {},
})

export const useDirection = () => React.useContext(DirectionContext)

export const useIsRTL = () => React.useContext(DirectionContext).dir === 'rtl'
