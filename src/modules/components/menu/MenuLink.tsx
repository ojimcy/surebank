import React, { ReactNode } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import Caret from '../caret/Caret'

export interface MenuLinkProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	bullet?: boolean
	active?: boolean
	caret?: boolean
	addon?: ReactNode
	icon?: ReactNode
}

const propTypes = {
	as: PropTypes.elementType,
	bullet: PropTypes.bool,
	active: PropTypes.bool,
	caret: PropTypes.bool,
	addon: PropTypes.node,
	icon: PropTypes.node,
}

const MenuLink: BsPrefixRefForwardingComponent<'a', MenuLinkProps> = React.forwardRef<HTMLElement, MenuLinkProps>(
	({ as: Component = 'a', bsPrefix, className, bullet, active, caret, addon, icon, children, ...props }, ref) => {
		bsPrefix = useBootstrapPrefix(bsPrefix, 'menu-item')

		return (
			<Component
				ref={ref}
				{...props}
				className={classNames(className, `${bsPrefix}-link`, {
					active: active,
				})}
			>
				{icon ? (
					<span className={classNames(`${bsPrefix}-icon`)}>{icon}</span>
				) : bullet ? (
					<i className={classNames(`${bsPrefix}-bullet`)} />
				) : null}
				<span className={classNames(`${bsPrefix}-text`)}>{children}</span>
				{addon ? (
					<span className={classNames(`${bsPrefix}-addon`)}>{addon}</span>
				) : caret ? (
					<span className={classNames(`${bsPrefix}-addon`)}>
						<Caret className={classNames(`${bsPrefix}-caret`)} />
					</span>
				) : null}
			</Component>
		)
	}
)

MenuLink.propTypes = propTypes
MenuLink.displayName = 'MenuLink'

export default MenuLink
