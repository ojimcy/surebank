import dynamic from 'next/dynamic'

const Quill = dynamic(() => import('quill'), { ssr: false })
const Mixin = dynamic(() => import('./mixin'), { ssr: false })
const Toolbar = dynamic(() => import('./toolbar'), { ssr: false })
const ReactQuill = dynamic(() => import('./component'), { ssr: false })

export { Quill, Mixin, Toolbar }
export default ReactQuill
