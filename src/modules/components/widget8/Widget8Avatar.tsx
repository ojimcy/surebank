import React from 'react'
import classNames from 'classnames'
import { BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import Avatar, { AvatarProps } from '../avatar/Avatar'

export interface Widget8AvatarProps extends AvatarProps, React.HTMLAttributes<HTMLElement> {}

const Widget8Avatar: BsPrefixRefForwardingComponent<'div', Widget8AvatarProps> = React.forwardRef<
	HTMLElement,
	Widget8AvatarProps
>(({ bsPrefix, className, ...props }, ref) => {
	const classNamePrefix = useBootstrapPrefix(bsPrefix, 'widget8-avatar')

	return <Avatar ref={ref} {...props} className={classNames(classNamePrefix, className)} />
})

Widget8Avatar.displayName = 'Widget8Avatar'

export default Widget8Avatar
