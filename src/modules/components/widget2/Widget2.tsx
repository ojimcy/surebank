import React from 'react'
import classNames from 'classnames'
import { BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import Nav, { NavProps } from '../nav/Nav'

export interface Widget2Props extends NavProps {}

const Widget2: BsPrefixRefForwardingComponent<'div', Widget2Props> = React.forwardRef<HTMLElement, Widget2Props>(
	({ bsPrefix, className, ...props }, ref) => {
		const classNamePrefix = useBootstrapPrefix(bsPrefix, 'widget2')

		return <Nav ref={ref} {...props} className={classNames(classNamePrefix, className)} />
	}
)

Widget2.displayName = 'Widget2'

export default Widget2
