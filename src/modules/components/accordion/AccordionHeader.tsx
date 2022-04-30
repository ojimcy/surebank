import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { useBootstrapPrefix } from '../_prefix/PrefixProvider'
import AccordionButton from './AccordionButton'
import { BsPrefixRefForwardingComponent, BsPrefixProps } from '../helpers'
import AccordionIcon from './AccordionIcon'

export interface AccordionHeaderProps extends BsPrefixProps, React.HTMLAttributes<HTMLElement> {
	icon?: React.ElementType
}

const propTypes = {
	/** Set a custom element for this component */
	as: PropTypes.elementType,

	icon: PropTypes.elementType,

	/** @default 'accordion-header' */
	bsPrefix: PropTypes.string,

	/** Click handler for the `AccordionButton` element */
	onClick: PropTypes.func,
}

const AccordionHeader: BsPrefixRefForwardingComponent<'h2', AccordionHeaderProps> = React.forwardRef<
	HTMLElement,
	AccordionHeaderProps
>(
	(
		{
			// Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
			as: Component = 'h2',
			icon: Icon,
			bsPrefix,
			className,
			children,
			onClick,
			...props
		},
		ref
	) => {
		bsPrefix = useBootstrapPrefix(bsPrefix, 'accordion-header')

		return (
			<Component ref={ref} {...props} className={classNames(className, bsPrefix)}>
				<AccordionButton onClick={onClick}>
					{Icon && (
						<AccordionIcon>
							<Icon />
						</AccordionIcon>
					)}
					{children}
				</AccordionButton>
			</Component>
		)
	}
)

AccordionHeader.propTypes = propTypes
AccordionHeader.displayName = 'AccordionHeader'

export default AccordionHeader
