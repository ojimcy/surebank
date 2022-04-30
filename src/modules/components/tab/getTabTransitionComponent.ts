import { TransitionComponent } from '@restart/ui/types'
import { TransitionType } from '../helpers'
import Fade from '../transition/Fade'

export default function getTabTransitionComponent(transition?: TransitionType): TransitionComponent | undefined {
	if (typeof transition === 'boolean') {
		return transition ? (Fade as TransitionComponent) : undefined
	}

	return transition
}
