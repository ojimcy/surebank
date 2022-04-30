import React, { MouseEventHandler, MutableRefObject, RefObject } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../../helpers'
import { useBootstrapPrefix } from '../../_prefix/PrefixProvider'
import BackdropPortal from '../portal/BackdropPortal'

export interface AsideProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	desktopMinimized: boolean
	mobileMinimized: boolean
	backdropOnClick?: Function
}

const propTypes = {
	as: PropTypes.elementType,
	desktopMinimized: PropTypes.bool,
	mobileMinimized: PropTypes.bool,
	backdropOnClick: PropTypes.func,
}

const Aside: BsPrefixRefForwardingComponent<'div', AsideProps> = React.forwardRef<HTMLElement, AsideProps>(
	(
		{
			as: Component = 'div',
			bsPrefix,
			className,
			desktopMinimized,
			mobileMinimized,
			backdropOnClick,
			children,
			...props
		},
		ref
	) => {
		bsPrefix = useBootstrapPrefix(bsPrefix, 'aside')

		const [hoverable, setHoverable] = React.useState(false)

		const viewportBreakpoint = 1025
		const transitionDuration = 200

		const backdropId = `${bsPrefix}-backdrop`
		const activeClass = `${bsPrefix}-active`
		const hoverClass = `${bsPrefix}-hover`
		const stateClasses = {
			desktop: {
				minimized: `${bsPrefix}-desktop-minimized`,
				maximized: `${bsPrefix}-desktop-maximized`,
			},
			mobile: {
				minimized: `${bsPrefix}-mobile-minimized`,
				maximized: `${bsPrefix}-mobile-maximized`,
			},
		}

		const toggleMinimized = (viewport: 'desktop' | 'mobile', minimized: boolean) => {
			if (minimized) {
				document.body.classList.add(stateClasses[viewport].minimized)
				document.body.classList.remove(stateClasses[viewport].maximized)
			} else {
				document.body.classList.add(stateClasses[viewport].maximized)
				document.body.classList.remove(stateClasses[viewport].minimized)
			}

			if (viewport === 'desktop') {
				if (minimized) {
					setTimeout(() => {
						setHoverable(true)
					}, transitionDuration)
				} else {
					setHoverable(false)
				}
			}
		}

		const backdropClick: MouseEventHandler<HTMLDivElement> = (e) => {
			if (backdropOnClick) {
				backdropOnClick(e)
			}
		}

		React.useLayoutEffect(() => {
			if (window.innerWidth >= viewportBreakpoint) {
				toggleMinimized('desktop', desktopMinimized)
			} else {
				toggleMinimized('mobile', mobileMinimized)
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [desktopMinimized, mobileMinimized])

		React.useLayoutEffect(() => {
			document.body.classList.add(activeClass)
			toggleMinimized('desktop', desktopMinimized)
			toggleMinimized('mobile', mobileMinimized)

			setTimeout(() => {
				window.dispatchEvent(new Event('resize'))
			}, transitionDuration * 2)

			return () => {
				document.body.classList.remove(activeClass)
				document.body.classList.remove(stateClasses.desktop.maximized)
				document.body.classList.remove(stateClasses.desktop.minimized)
				document.body.classList.remove(stateClasses.mobile.maximized)
				document.body.classList.remove(stateClasses.mobile.minimized)
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [])

		return (
			<Component
				ref={ref}
				{...props}
				className={classNames(className, bsPrefix, {
					[hoverClass]: hoverable,
				})}
			>
				{children}
				{!mobileMinimized && (
					<BackdropPortal>
						<div id={backdropId} style={{ opacity: 1 }} onClick={backdropClick} />
					</BackdropPortal>
				)}
			</Component>
		)
	}
)

Aside.propTypes = propTypes
Aside.displayName = 'Aside'

export default Aside
