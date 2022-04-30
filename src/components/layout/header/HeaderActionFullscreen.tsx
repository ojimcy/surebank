import React from 'react'
import { Button, Tooltip, OverlayTrigger } from '@blueupcode/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCompress, faExpand } from '@fortawesome/free-solid-svg-icons'

const LayoutHeaderActionFullscreen: React.FC = () => {
	const fullscreenBodyClass = 'fullscreen-active'

	const [fullscreenActive, setFullscreenActive] = React.useState(false)

	const handleToggleFullscreen = () => {
		if (fullscreenActive) {
			// Exit from fullscreen mode
			document.exitFullscreen()
		} else {
			// Activating fullscreen mode
			document.documentElement.requestFullscreen()
		}
	}

	React.useEffect(() => {
		// Check whether fullscreen mode is activated and change the state
		document.onfullscreenchange = () => {
			if (document.fullscreenElement) {
				setFullscreenActive(true)
			} else {
				setFullscreenActive(false)
			}
		}
	}, [])

	React.useEffect(() => {
		if (fullscreenActive) {
			document.body.classList.add(fullscreenBodyClass)
		} else {
			document.body.classList.remove(fullscreenBodyClass)
		}
	}, [fullscreenActive])

	return (
		<OverlayTrigger placement="left" overlay={<Tooltip id="fullscreenTrigger">Toggle fullscreen</Tooltip>}>
			<Button icon variant="label-info" onClick={handleToggleFullscreen}>
				<FontAwesomeIcon icon={faExpand} className="fullscreen-icon-expand" />
				<FontAwesomeIcon icon={faCompress} className="fullscreen-icon-compress" />
			</Button>
		</OverlayTrigger>
	)
}

export default LayoutHeaderActionFullscreen
