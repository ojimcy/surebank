import { put, PutEffect, select, SelectEffect } from 'redux-saga/effects'
import { menuActiveLinkPartialChange } from 'store/actions'
import { State } from 'store/reducers'
import PAGE from 'config/page.config'

export function* separatingActiveLink(): Generator<SelectEffect | PutEffect, void, string> {
	const activeLink: string = yield select((state: State) => state.menu.activeLink)
	const activeLinkPartial = activeLink?.split(PAGE.menuLinkSeparator) ?? []

	yield put(menuActiveLinkPartialChange(activeLinkPartial))
}
