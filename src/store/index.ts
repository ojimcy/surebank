import { applyMiddleware, createStore, Store } from 'redux'
import { createWrapper, Context } from 'next-redux-wrapper'
import { composeWithDevTools } from '@redux-devtools/extension'
import createSagaMiddleware from 'redux-saga'
import reducers from './reducers'
import rootSaga from './sagas'

const sagaMiddleware = createSagaMiddleware()

const makeStore = (context: Context) => {
	const store = createStore(reducers, composeWithDevTools(applyMiddleware(sagaMiddleware)))

	sagaMiddleware.run(rootSaga)

	return store
}

export const wrapper = createWrapper<Store>(makeStore)
