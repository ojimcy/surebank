import { takeEvery } from 'redux-saga/effects'
import { separatingActiveLink } from './menuSaga'

function* rootSaga() {
	yield takeEvery('MENU_ACTIVE_LINK_CHANGE', separatingActiveLink)
}

export default rootSaga
