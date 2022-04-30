import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import { Variant } from '../types'

export interface MarkerProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	variant?: MarkerVariant
	type: MarkerType
	size?: 'sm' | 'lg'
}

export type MarkerVariant = Variant
export type MarkerType = 'dot' | 'circle' | 'pill'

const propTypes = {
	as: PropTypes.elementType,
}

const Marker: BsPrefixRefForwardingComponent<'i', MarkerProps> = React.forwardRef<HTMLElement, MarkerProps>(
	({ as: Component = 'i', bsPrefix, className, variant, type, size, ...props }, ref) => {
		bsPrefix = useBootstrapPrefix(bsPrefix, 'marker')

		return (
			<Component
				ref={ref}
				{...props}
				className={classNames(className, bsPrefix, `${bsPrefix}-${type}`, {
					[`${bsPrefix}-${size}`]: size,
					[`text-${variant}`]: variant,
				})}
			/>
		)
	}
)

Marker.propTypes = propTypes
Marker.displayName = 'Marker'

export default Marker
