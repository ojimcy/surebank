import React, { useContext, useMemo } from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import BaseDropdown, { DropdownProps as BaseDropdownProps, ToggleMetadata } from '@restart/ui/Dropdown'
import { useUncontrolled } from 'uncontrollable'
import useEventCallback from '@restart/hooks/useEventCallback'
import DropdownContext, { DropDirection } from './DropdownContext'
import DropdownItem from './DropdownItem'
import DropdownMenu, { getDropdownMenuPlacement } from './DropdownMenu'
import DropdownToggle from './DropdownToggle'
import InputGroupContext from '../form/InputGroupContext'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { AlignType, alignPropType } from '../types'
import { useIsRTL } from '../_direction/DirectionContextHook'
import DropdownHeader from './DropdownHeader'
import DropdownDivider from './DropdownDivider'
import DropdownItemText from './DropdownItemText'
import DropdownSubmenu from './DropdownSubmenu'
import DropdownSubmenuMenu from './DropdownSubmenuMenu'
import DropdownCol from './DropdownCol'
import DropdownRow from './DropdownRow'

export interface DropdownProps
	extends BaseDropdownProps,
		BsPrefixProps,
		Omit<React.HTMLAttributes<HTMLElement>, 'onSelect' | 'children'> {
	drop?: DropDirection
	align?: AlignType
	flip?: boolean
	focusFirstItemOnShow?: boolean | 'keyboard'
	autoClose?: boolean | 'outside' | 'inside'
}

const propTypes = {
	/** @default 'dropdown' */
	bsPrefix: PropTypes.string,
	/**
	 * Determines the direction and location of the Menu in relation to it's Toggle.
	 */
	drop: PropTypes.oneOf(['up', 'start', 'end', 'down']),

	as: PropTypes.elementType,

	/**
	 * Aligns the dropdown menu to the specified side of the Dropdown toggle. You can
	 * also align the menu responsively for breakpoints starting at `sm` and up.
	 * The alignment direction will affect the specified breakpoint or larger.
	 *
	 * *Note: Using responsive alignment will disable Popper usage for positioning.*
	 *
	 * @type {"start"|"end"|{ sm: "start"|"end" }|{ md: "start"|"end" }|{ lg: "start"|"end" }|{ xl: "start"|"end"}|{ xxl: "start"|"end"} }
	 */
	align: alignPropType,

	/**
	 * Whether or not the Dropdown is visible.
	 *
	 * @controllable onToggle
	 */
	show: PropTypes.bool,

	/**
	 * Allow Dropdown to flip in case of an overlapping on the reference element. For more information refer to
	 * Popper.js's flip [docs](https://popper.js.org/docs/v2/modifiers/flip/).
	 *
	 */
	flip: PropTypes.bool,

	/**
	 * A callback fired when the Dropdown wishes to change visibility. Called with the requested
	 * `show` value, the DOM event, and the source that fired it: `'click'`,`'keydown'`,`'rootClose'`, or `'select'`.
	 *
	 * ```js
	 * function(
	 *   isOpen: boolean,
	 *   event: SyntheticEvent,
	 *   metadata: {
	 *     source: 'select' | 'click' | 'rootClose' | 'keydown'
	 *   }
	 * ): void
	 * ```
	 *
	 * @controllable show
	 */
	onToggle: PropTypes.func,

	/**
	 * A callback fired when a menu item is selected.
	 *
	 * ```js
	 * (eventKey: any, event: Object) => any
	 * ```
	 */
	onSelect: PropTypes.func,

	/**
	 * Controls the focus behavior for when the Dropdown is opened. Set to
	 * `true` to always focus the first menu item, `keyboard` to focus only when
	 * navigating via the keyboard, or `false` to disable completely
	 *
	 * The Default behavior is `false` **unless** the Menu has a `role="menu"`
	 * where it will default to `keyboard` to match the recommended [ARIA Authoring practices](https://www.w3.org/TR/wai-aria-practices-1.1/#menubutton).
	 */
	focusFirstItemOnShow: PropTypes.oneOf([false, true, 'keyboard']),

	/**
	 * Controls the auto close behaviour of the dropdown when clicking outside of
	 * the button or the list.
	 */
	autoClose: PropTypes.oneOf([true, 'outside', 'inside', false]),
}

const defaultProps: Partial<DropdownProps> = {
	align: 'start',
	autoClose: true,
}

const Dropdown: BsPrefixRefForwardingComponent<'div', DropdownProps> = React.forwardRef<HTMLElement, DropdownProps>(
	(pProps, ref) => {
		const {
			bsPrefix,
			drop,
			show,
			className,
			align,
			onSelect,
			onToggle,
			focusFirstItemOnShow,
			// Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
			as: Component = 'div',
			autoClose,
			...props
		} = useUncontrolled(pProps, { show: 'onToggle' })

		const isInputGroup = useContext(InputGroupContext)
		const prefix = useBootstrapPrefix(bsPrefix, 'dropdown')
		const isRTL = useIsRTL()

		const isClosingPermitted = (source: string): boolean => {
			// autoClose=false only permits close on button click
			if (autoClose === false) return source === 'click'

			// autoClose=inside doesn't permit close on rootClose
			if (autoClose === 'inside') return source !== 'rootClose'

			// autoClose=outside doesn't permit close on select
			if (autoClose === 'outside') return source !== 'select'

			return true
		}

		const handleToggle = useEventCallback((nextShow: boolean, meta: ToggleMetadata) => {
			if (
				meta.originalEvent!.currentTarget === document &&
				(meta.source !== 'keydown' || (meta.originalEvent as any).key === 'Escape')
			)
				meta.source = 'rootClose'

			if (isClosingPermitted(meta.source!)) onToggle?.(nextShow, meta)
		})

		const alignEnd = align === 'end'
		const placement = getDropdownMenuPlacement(alignEnd, drop, isRTL)

		const contextValue = useMemo(
			() => ({
				align,
				drop,
				isRTL,
			}),
			[align, drop, isRTL]
		)

		return (
			<DropdownContext.Provider value={contextValue}>
				<BaseDropdown
					placement={placement}
					show={show}
					onSelect={onSelect}
					onToggle={handleToggle}
					focusFirstItemOnShow={focusFirstItemOnShow}
					itemSelector={`.${prefix}-item:not(.disabled):not(:disabled)`}
				>
					{isInputGroup ? (
						props.children
					) : (
						<Component
							{...props}
							ref={ref}
							className={classNames(
								className,
								show && 'show',
								(!drop || drop === 'down') && prefix,
								drop === 'up' && 'dropup',
								drop === 'end' && 'dropend',
								drop === 'start' && 'dropstart'
							)}
						/>
					)}
				</BaseDropdown>
			</DropdownContext.Provider>
		)
	}
)

Dropdown.displayName = 'Dropdown'
Dropdown.propTypes = propTypes
Dropdown.defaultProps = defaultProps

export default Object.assign(Dropdown, {
	Toggle: DropdownToggle,
	Menu: DropdownMenu,
	Item: DropdownItem,
	ItemText: DropdownItemText,
	Divider: DropdownDivider,
	Header: DropdownHeader,
	Submenu: DropdownSubmenu,
	SubmenuMenu: DropdownSubmenuMenu,
	Row: DropdownRow,
	Col: DropdownCol,
})
