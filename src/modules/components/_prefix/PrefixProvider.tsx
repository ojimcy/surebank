import React from 'react'
import PropTypes from 'prop-types'
import { useContext, useMemo } from 'react'

export interface PrefixContextValue {
	prefixes: Record<string, string>
}

export interface PrefixProviderProps extends Partial<PrefixContextValue> {
	children: React.ElementType
}

const PrefixContext = React.createContext<PrefixContextValue>({ prefixes: {} })

const { Consumer, Provider } = PrefixContext

function PrefixProvider({ prefixes = {}, children }: PrefixProviderProps) {
	const contextValue = useMemo(
		() => ({
			prefixes: { ...prefixes },
		}),
		[prefixes]
	)

	return <Provider value={contextValue}>{children}</Provider>
}

PrefixProvider.propTypes = {
	prefixes: PropTypes.object,
} as any

export function useBootstrapPrefix(prefix: string | undefined, defaultPrefix: string): string {
	const { prefixes } = useContext(PrefixContext)

	return prefix || prefixes[defaultPrefix] || defaultPrefix
}

export { Consumer as PrefixConsumer }

export default PrefixProvider
