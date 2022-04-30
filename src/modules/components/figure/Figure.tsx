import createWithBsPrefix from '../_utilities/createWithBsPrefix'
import FigureImage from './FigureImage'
import FigureCaption from './FigureCaption'

const Figure = createWithBsPrefix('figure', {
	Component: 'figure',
})

export default Object.assign(Figure, {
	Image: FigureImage,
	Caption: FigureCaption,
})
