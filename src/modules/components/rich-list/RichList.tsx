import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BsPrefixProps, BsPrefixRefForwardingComponent } from '../helpers'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import RichListAddon from './RichListAddon'
import RichListItem from './RichListItem'
import RichListContent from './RichListContent'
import RichListTitle from './RichListTitle'
import RichListSubtitle from './RichListSubtitle'
import RichListParagraph from './RichListParagraph'

export interface RichListProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	bordered?: boolean
	flush?: boolean
	action?: boolean
}

const propTypes = {
	as: PropTypes.elementType,
	bordered: PropTypes.bool,
	flush: PropTypes.bool,
	action: PropTypes.bool,
}

const RichList: BsPrefixRefForwardingComponent<'div', RichListProps> = React.forwardRef<HTMLElement, RichListProps>(
	({ as: Component = 'div', bsPrefix, className, bordered, flush, action, ...props }, ref) => {
		bsPrefix = useBootstrapPrefix(bsPrefix, 'rich-list')

		return (
			<Component
				ref={ref}
				{...props}
				className={classNames(className, bsPrefix, {
					[`${bsPrefix}-bordered`]: bordered,
					[`${bsPrefix}-flush`]: flush,
					[`${bsPrefix}-action`]: action,
				})}
			/>
		)
	}
)

RichList.propTypes = propTypes
RichList.displayName = 'RichList'

export default Object.assign(RichList, {
	Addon: RichListAddon,
	Item: RichListItem,
	Content: RichListContent,
	Title: RichListTitle,
	Subtitle: RichListSubtitle,
	Paragraph: RichListParagraph,
})
