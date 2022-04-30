import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet } from '@blueupcode/components'
import ReactQuill from '@blueupcode/quill'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const EditorBubblePage: ExtendedNextPage = () => {
	const [content, setContent] = React.useState(
		[
			`<h1 class="ql-align-center">Quill Rich Text Editor</h1>`,
			`<br>`,
			`<p>Quill is a free, <a href="http://github.com/quilljs/quill" target="_blank">open source</a> WYSIWYG editor built for the modern web. With its <a href="http://quilljs.com/docs/modules" target="_blank">modular architecture</a> and expressive <a href="http://quilljs.com/docs/api" target="_blank">API</a>, it is completely customizable to fit any need.</p>`,
			`<p>`,
			`<br>`,
			`<ol>`,
			`<li>Cillum dolore eu fugiat nulla pariatur</li>`,
			`<li>Duis aute irure dolor in</li>`,
			`<li>Tempor incididunt ut labore</li>`,
			`<li>`,
			`<ol>`,
			`<li>Lorem ipsum dolor sit amet</li>`,
			`<li>Ommodo consequat</li>`,
			`<li>Duis aute irure dolor in</li>`,
			`</ol>`,
			`</li>`,
			`<li>Laboris nisi ut aliquip ex ea</li>`,
			`<li>Excepteur sint occaecat</li>`,
			`</ol>`,
			`</p>`,
			`<br>`,
			`<p><strong>Lorem ipsum</strong> dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`,
		].join('\n')
	)

	const handleChange = (value: string) => {
		setContent(value)
	}

	const modules = {
		toolbar: [
			[{ font: ['poppins', 'roboto mono'] }, { size: [] }],
			['bold', 'italic', 'underline', 'strike'],
			[{ color: [] }, { background: [] }],
			[{ script: 'super' }, { script: 'sub' }],
			[{ header: '1' }, { header: '2' }, 'blockquote'],
			[{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
			[{ direction: 'rtl' }, { align: [] }],
			['link', 'image', 'video'],
			['clean'],
		],
	}

	return (
		<Row>
			<Col>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Bubble editor</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<ReactQuill theme="bubble" defaultValue={content} onChange={handleChange} modules={modules} />
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

EditorBubblePage.pageTitle = 'Bubble Editor'
EditorBubblePage.activeLink = 'form.editor.bubble'
EditorBubblePage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Editor' },
	{ text: 'Bubble', link: '/editor/bubble' },
]

export default withAuth(EditorBubblePage)
