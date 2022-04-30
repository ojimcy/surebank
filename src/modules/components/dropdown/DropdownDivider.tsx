import createWithBsPrefix from '../_utilities/createWithBsPrefix'

const DropdownDivider = createWithBsPrefix('dropdown-divider', {
	Component: 'div',
	defaultProps: { role: 'separator' },
})

export default DropdownDivider
