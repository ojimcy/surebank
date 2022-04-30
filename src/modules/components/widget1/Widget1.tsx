import React from 'react'
import classNames from 'classnames'
import { BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import Portlet, { PortletProps } from '../portlet/Portlet'
import Widget1Addon from './Widget1Addon'
import Widget1Body from './Widget1Body'
import Widget1DialogContent from './Widget1DialogContent'
import Widget1Dialog from './Widget1Dialog'
import Widget1Display from './Widget1Display'
import Widget1Group from './Widget1Group'
import Widget1Offset from './Widget1Offset'
import Widget1Title from './Widget1Title'

export interface Widget1Props extends PortletProps, React.HTMLAttributes<HTMLElement> {}

const Widget1: BsPrefixRefForwardingComponent<'div', Widget1Props> = React.forwardRef<HTMLElement, Widget1Props>(
	({ bsPrefix, className, ...props }, ref) => {
		const classNamePrefix = useBootstrapPrefix(bsPrefix, 'widget1')

		return <Portlet ref={ref} {...props} className={classNames(classNamePrefix, className)} />
	}
)

Widget1.displayName = 'Widget1'

export default Object.assign(Widget1, {
	Addon: Widget1Addon,
	Body: Widget1Body,
	Dialog: Widget1Dialog,
	DialogContent: Widget1DialogContent,
	Display: Widget1Display,
	Group: Widget1Group,
	Offset: Widget1Offset,
	Title: Widget1Title,
})
