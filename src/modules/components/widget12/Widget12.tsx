import React from 'react'
import classNames from 'classnames'
import { BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import Avatar, { AvatarProps } from '../avatar/Avatar'

export interface Widget12Props extends AvatarProps, React.HTMLAttributes<HTMLElement> {
	small?: boolean
}

const Widget12: BsPrefixRefForwardingComponent<'div', Widget12Props> = React.forwardRef<HTMLElement, Widget12Props>(
	({ bsPrefix, className, small, ...props }, ref) => {
		const classNamePrefix = useBootstrapPrefix(bsPrefix, 'widget12')

		return (
			<Avatar
				ref={ref}
				{...props}
				className={classNames(small ? `${classNamePrefix}-sm` : classNamePrefix, className)}
			/>
		)
	}
)

Widget12.displayName = 'Widget12'

export default Widget12
