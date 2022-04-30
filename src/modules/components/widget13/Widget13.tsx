import React from 'react'
import classNames from 'classnames'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import { BsPrefixRefForwardingComponent } from '../helpers'
import DropdownToggle, { DropdownToggleProps } from '../dropdown/DropdownToggle'
import Widget13Avatar from './Widget13Avatar'
import Widget13Text from './Widget13Text'

export interface Widget13Props extends DropdownToggleProps {}

const Widget13: BsPrefixRefForwardingComponent<'div', Widget13Props> = React.forwardRef<HTMLElement, Widget13Props>(
	({ bsPrefix, className, ...props }, ref) => {
		bsPrefix = useBootstrapPrefix(bsPrefix, 'widget13')

		return <DropdownToggle ref={ref} {...props} className={classNames(className, bsPrefix)} />
	}
)

Widget13.displayName = 'Widget13'

export default Object.assign(Widget13, {
	Avatar: Widget13Avatar,
	Text: Widget13Text,
})
