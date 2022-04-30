import PropTypes from 'prop-types'
import type { NextPage, NextComponentType, NextPageContext } from 'next'
import type { AppProps } from 'next/app'
import { Theme } from './_theme/ThemeContextHook'

export type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light'
export type OutlineVariant =
	| 'outline-primary'
	| 'outline-secondary'
	| 'outline-success'
	| 'outline-danger'
	| 'outline-warning'
	| 'outline-info'
	| 'outline-dark'
	| 'outline-light'
export type LabelVariant =
	| 'label-primary'
	| 'label-secondary'
	| 'label-success'
	| 'label-danger'
	| 'label-warning'
	| 'label-info'
	| 'label-dark'
	| 'label-light'
export type FlatVariant =
	| 'flat-primary'
	| 'flat-secondary'
	| 'flat-success'
	| 'flat-danger'
	| 'flat-warning'
	| 'flat-info'
	| 'flat-dark'
	| 'flat-light'
export type TextVariant =
	| 'text-primary'
	| 'text-secondary'
	| 'text-success'
	| 'text-danger'
	| 'text-warning'
	| 'text-info'
	| 'text-dark'
	| 'text-light'
export type Color =
	| 'primary'
	| 'secondary'
	| 'success'
	| 'danger'
	| 'warning'
	| 'info'
	| 'dark'
	| 'light'
	| 'white'
	| 'muted'
export type AlertVariant = Variant | OutlineVariant | LabelVariant | string
export type BadgeVariant = Variant | OutlineVariant | LabelVariant | TextVariant | string
export type ButtonVariant = Variant | OutlineVariant | FlatVariant | LabelVariant | TextVariant | 'link' | string
export type Placement = import('@restart/ui/usePopper').Placement

export type AlignDirection = 'start' | 'end'

export type ResponsiveAlignProp =
	| { sm: AlignDirection }
	| { md: AlignDirection }
	| { lg: AlignDirection }
	| { xl: AlignDirection }
	| { xxl: AlignDirection }

export type AlignType = AlignDirection | ResponsiveAlignProp

const alignDirection = PropTypes.oneOf<AlignDirection>(['start', 'end'])

export const alignPropType = PropTypes.oneOfType([
	alignDirection,
	PropTypes.shape({ sm: alignDirection }),
	PropTypes.shape({ md: alignDirection }),
	PropTypes.shape({ lg: alignDirection }),
	PropTypes.shape({ xl: alignDirection }),
	PropTypes.shape({ xxl: alignDirection }),
])

export type RootCloseEvent = 'click' | 'mousedown'

export type GapValue = 0 | 1 | 2 | 3 | 4 | 5

export type BreakpointValue = 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs'

export interface PageBreadcrumbItem {
	text: string,
	link?: string
}

export type PageBreadcrumb = PageBreadcrumbItem[]

export type AdditionalNextPageProps = {
	activeLink?: string
	layoutName?: string
	pageTitle?: string
	breadcrumb?: PageBreadcrumb
	theme?: Theme
}

export type Direction = 'ltr' | 'rtl'

export type ExtendedNextPage<P = {}, IP = P> = NextPage<P, IP> & Partial<AdditionalNextPageProps>

export type ExtendedNextPageComponent = NextComponentType<NextPageContext, any, {}> & Partial<AdditionalNextPageProps>

export type ExtendedAppProps<P = {}> = AppProps<P> & {
	Component: ExtendedNextPageComponent
}
