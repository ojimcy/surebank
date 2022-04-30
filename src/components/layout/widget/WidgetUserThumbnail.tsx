import React from 'react'
import { Widget14 } from '@blueupcode/components'
import { useAuth } from 'components/auth/authContext'

const WidgetUserThumbnail = () => {
	const { userData } = useAuth()

	const fullName = userData?.displayName
	const shortName = generateShortName(fullName)

	return (
		<Widget14>
			<Widget14.Avatar variant="label-success" display circle>
				{shortName}
			</Widget14.Avatar>
			<Widget14.Title>{fullName}</Widget14.Title>
			<Widget14.Subtitle>Art Director</Widget14.Subtitle>
		</Widget14>
	)
}

const shortNameLength = 2

const generateShortName = (fullName: string | null | undefined) => {
	if (fullName) ''

	const partialName = fullName?.split(' ') || []

	let shortName = ''

	for (let i = 0; i < shortNameLength; i++) {
		if (partialName[i]) {
			shortName += partialName[i].charAt(0)
		}
	}

	return shortName
}

export default WidgetUserThumbnail
