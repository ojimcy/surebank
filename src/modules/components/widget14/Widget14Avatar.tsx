import React from 'react'
import classNames from 'classnames'
import { BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import Avatar, { AvatarProps } from '../avatar/Avatar'

export interface Widget14AvatarProps extends AvatarProps {}

const Widget14Avatar: BsPrefixRefForwardingComponent<'div', Widget14AvatarProps> = React.forwardRef<
	HTMLElement,
	Widget14AvatarProps
>(({ bsPrefix, className, ...props }, ref) => {
	const classNamePrefix = useBootstrapPrefix(bsPrefix, 'widget14-avatar')

	return <Avatar ref={ref} {...props} className={classNames(classNamePrefix, className)} />
})

Widget14Avatar.displayName = 'Widget14Avatar'

export default Widget14Avatar
