import createWithBsPrefix from '../../_utilities/createWithBsPrefix'
import HeaderBrand from './HeaderBrand'
import HeaderContainer from './HeaderContainer'
import HeaderDivider from './HeaderDivider'
import HeaderHolder from './HeaderHolder'
import HeaderTitle from './HeaderTitle'
import HeaderWrap from './HeaderWrap'

const Header = createWithBsPrefix('header', { Component: 'div' })

export default Object.assign(Header, {
	Container: HeaderContainer,
	Holder: HeaderHolder,
	Wrap: HeaderWrap,
	Title: HeaderTitle,
	Brand: HeaderBrand,
	Divider: HeaderDivider,
})
