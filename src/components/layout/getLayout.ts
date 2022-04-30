import React from 'react'
import DefaultLayout from './template/DefaultLayout'
import BackgroundLayout from './template/BackgroundLayout'
import BlankLayout from './template/BlankLayout'
import PAGE from 'config/page.config'

export type LayoutType = React.ElementType

export type LayoutNames = 'default' | 'background' | 'blank'

export type LayoutOptionsInterface = {
	[layoutName in LayoutNames]: LayoutType
}

export const layoutOptions: LayoutOptionsInterface = {
	default: DefaultLayout,
	background: BackgroundLayout,
	blank: BlankLayout,
}

export default function getLayout(layoutName: LayoutNames): LayoutType {
	if (layoutName in layoutOptions) {
		return layoutOptions[layoutName]
	}

	return layoutOptions[PAGE.defaultLayoutName]
}
