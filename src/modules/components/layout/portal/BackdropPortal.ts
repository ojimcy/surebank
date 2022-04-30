import { ReactNode } from 'react'
import ReactDOM from 'react-dom'

const BackdropPortal = ({ children }: { children: ReactNode }) =>
	ReactDOM.createPortal(children, document.querySelector('body') as HTMLElement)

export default BackdropPortal
