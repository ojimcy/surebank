import React from 'react'
import invariant from 'invariant'
import useMergedRefs from '@restart/hooks/useMergedRefs'

export default function useWrappedRefWithWarning(ref: React.RefObject<any>, componentName: string) {
	// @ts-ignore
	if (!(process.env.NODE_ENV === 'production')) return ref

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const warningRef = React.useCallback(
		(refValue) => {
			invariant(
				refValue == null || !refValue.isReactComponent,
				`${componentName} injected a ref to a provided \`as\` component that resolved to a component instance instead of a DOM element. ` +
					'Use `React.forwardRef` to provide the injected ref to the class component as a prop in order to pass it directly to a DOM element'
			)
		},
		[componentName]
	)
	// eslint-disable-next-line react-hooks/rules-of-hooks
	return useMergedRefs(warningRef, ref)
}
