import React from 'react'
import classNames from 'classnames'
import { BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import Avatar, { AvatarProps } from '../avatar/Avatar'

export interface Widget13AvatarProps extends AvatarProps {}

const Widget13Avatar: BsPrefixRefForwardingComponent<'div', Widget13AvatarProps> = React.forwardRef<
	HTMLElement,
	Widget13AvatarProps
>(({ bsPrefix, className, ...props }, ref) => {
	const classNamePrefix = useBootstrapPrefix(bsPrefix, 'widget13-avatar')

	return <Avatar ref={ref} {...props} className={classNames(classNamePrefix, className)} />
})

Widget13Avatar.displayName = 'Widget13Avatar'

export default Widget13Avatar
