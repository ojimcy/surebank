import React from 'react'
import LayoutHeaderActionFullscreen from './HeaderActionFullscreen'
import LayoutHeaderActionToggle from './HeaderActionToggle'

const LayoutHeaderAction: React.FC = () => {
  return (
    <>
      <LayoutHeaderActionToggle />
      <LayoutHeaderActionFullscreen />
    </>
  )
}

export default LayoutHeaderAction