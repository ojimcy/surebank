import React from 'react'
import { ToggleButton, ToggleButtonGroup } from '@blueupcode/components'

const LayoutHeaderActionToggle: React.FC = () => {
  return (
    <ToggleButtonGroup className="me-2" type="radio" name="timeOption" defaultValue="today">
      <ToggleButton variant="flat-primary" id="timeOption1" value="today">
        Today
      </ToggleButton>
      <ToggleButton variant="flat-primary" id="timeOption2" value="week">
        Week
      </ToggleButton>
      <ToggleButton variant="flat-primary" id="timeOption3" value="month">
        Month
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

export default LayoutHeaderActionToggle