import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet } from '@blueupcode/components'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const TypoghrapyPage: ExtendedNextPage = () => {
	return (
		<Row>
			<Col md="6">
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Basic headings</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body className="pb-0">
						<p>
							All HTML headings, <code>&lt;h1&gt;</code> through <code>&lt;h6&gt;</code>, are available.
						</p>
						<p>
							<code>.h1</code> through <code>.h6</code> classes are also available, for when you want to match the font
							styling of a heading but cannot use the associated HTML element.
						</p>
						{/* BEGIN Portlet */}
						<Portlet>
							<Portlet.Body>
								<h1>Heading 1</h1>
								<h2>Heading 2</h2>
								<h3>Heading 3</h3>
								<h4>Heading 4</h4>
								<h5>Heading 5</h5>
								<h6>Heading 6</h6>
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
						<p>Use the included utility classes to recreate the small secondary heading text</p>
						{/* BEGIN Portlet */}
						<Portlet>
							<Portlet.Body>
								<h3 className="text-level-3 mb-0">
									Fancy display heading <small className="text-muted">With faded secondary text</small>
								</h3>
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Blockquote</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							For quoting blocks of content from another source within your document. Wrap{' '}
							<code>&lt;blockquote class=&quot;blockquote&quot;&gt;</code> around any{' '}
							<abbr title="HyperText Markup Language">HTML</abbr> as the quote.
						</p>
						{/* BEGIN Portlet */}
						<Portlet>
							<Portlet.Body className="pb-0">
								{/* BEGIN Blockquote */}
								<blockquote className="blockquote">
									<p>A well-known quote, contained in a blockquote element.</p>
								</blockquote>
								{/* END Blockquote */}
								{/* BEGIN Blockquote */}
								<figure>
									<blockquote className="blockquote">
										<p>A well-known quote, contained in a blockquote element.</p>
									</blockquote>
									<figcaption className="blockquote-footer">
										Someone famous in <cite title="Source Title">Source Title</cite>
									</figcaption>
								</figure>
								{/* END Blockquote */}
								{/* BEGIN Blockquote */}
								<figure className="text-center">
									<blockquote className="blockquote">
										<p>A well-known quote, contained in a blockquote element.</p>
									</blockquote>
									<figcaption className="blockquote-footer">
										Someone famous in <cite title="Source Title">Source Title</cite>
									</figcaption>
								</figure>
								{/* END Blockquote */}
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
						<p>
							The HTML spec requires that blockquote attribution be placed outside the <code>&lt;blockquote&gt;</code>.
							When providing attribution, wrap your <code>&lt;blockquote&gt;</code> in a <code>&lt;figure&gt;</code> and
							use a <code>&lt;figcaption&gt;</code> or a block level element (e.g., <code>&lt;p&gt;</code>) with the{' '}
							<code>.blockquote-footer</code> class. Be sure to wrap the name of the source work in{' '}
							<code>&lt;cite&gt;</code> as well.
						</p>
						<p className="mb-0">Use text utilities as needed to change the alignment of your blockquote.</p>
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Lists</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body className="pb-0">
						<p>
							Remove the default <code>list-style</code> and left margin on list items (immediate children only).{' '}
							<strong>This only applies to immediate children list items</strong>, meaning you will need to add the
							class for any nested lists as well.
						</p>
						{/* BEGIN Portlet */}
						<Portlet>
							<Portlet.Body className="pb-0">
								{/* BEGIN List */}
								<ul className="list-unstyled">
									<li>This is a list.</li>
									<li>It appears completely unstyled.</li>
									<li>Structurally, it&apos;s still a list.</li>
									<li>However, this style only applies to immediate child elements.</li>
									<li>
										Nested lists:
										<ul>
											<li>are unaffected by this style</li>
											<li>will still show a bullet</li>
											<li>and have appropriate left margin</li>
										</ul>
									</li>
									<li>This may still come in handy in some situations.</li>
								</ul>
								{/* END List */}
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
						<p>
							Remove a list&apos;s bullets and apply some light <code>margin</code> with a combination of two classes,{' '}
							<code>.list-inline</code> and <code>.list-inline-item</code>.
						</p>
						{/* BEGIN Portlet */}
						<Portlet>
							<Portlet.Body className="pb-0">
								{/* BEGIN List */}
								<ul className="list-inline">
									<li className="list-inline-item">This is a list item.</li>
									<li className="list-inline-item">And another one.</li>
									<li className="list-inline-item">But they&apos;re displayed inline.</li>
								</ul>
								{/* END List */}
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Abbreviations</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body className="pb-0">
						<p>
							Stylized implementation of HTML&apos;s <code>&lt;abbr&gt;</code> element for abbreviations and acronyms to
							show the expanded version on hover. Abbreviations have a default underline and gain a help cursor to
							provide additional context on hover and to users of assistive technologies.
						</p>
						<p>
							Add <code>.initialism</code> to an abbreviation for a slightly smaller font-size.
						</p>
						{/* BEGIN Portlet */}
						<Portlet>
							<Portlet.Body>
								<p>
									<abbr title="attribute">attr</abbr>
								</p>
								<p className="mb-0">
									<abbr title="HyperText Markup Language" className="initialism">
										HTML
									</abbr>
								</p>
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
			<Col md="6">
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Display headings</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body className="pb-0">
						<p>
							Traditional heading elements are designed to work best in the meat of your page content. When you need a
							heading to stand out, consider using a <strong>display heading</strong>—a larger, slightly more
							opinionated heading style.
						</p>
						{/* BEGIN Portlet */}
						<Portlet>
							<Portlet.Body>
								<h1 className="display-1">Display 1</h1>
								<h1 className="display-2">Display 2</h1>
								<h1 className="display-3">Display 3</h1>
								<h1 className="display-4">Display 4</h1>
								<h1 className="display-5">Display 5</h1>
								<h1 className="display-6">Display 6</h1>
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Lead</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body className="pb-0">
						<p>
							Make a paragraph stand out by adding <code>.lead</code>.
						</p>
						{/* BEGIN Portlet */}
						<Portlet>
							<Portlet.Body>
								<p className="lead mb-0">
									Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Duis mollis, est non commodo
									luctus.
								</p>
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Inline text styles</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>Styling for common inline HTML5 elements.</p>
						{/* BEGIN Portlet */}
						<Portlet>
							<Portlet.Body>
								<p>
									You can use the mark tag to <mark>highlight</mark> text.
								</p>
								<p>
									<del>This line of text is meant to be treated as deleted text.</del>
								</p>
								<p>
									<s>This line of text is meant to be treated as no longer accurate.</s>
								</p>
								<p>
									<ins>This line of text is meant to be treated as an addition to the document.</ins>
								</p>
								<p>
									<u>This line of text will render as underlined</u>
								</p>
								<p>
									<small>This line of text is meant to be treated as fine print.</small>
								</p>
								<p>
									<strong>This line rendered as bold text.</strong>
								</p>
								<p className="mb-0">
									<em>This line rendered as italicized text.</em>
								</p>
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
						<p>If you want to style your text, you should use the following classes instead:</p>
						{/* BEGIN List */}
						<ul>
							<li>
								<code>.mark</code> will apply the same styles as <code>&lt;mark&gt;</code>.
							</li>
							<li>
								<code>.small</code> will apply the same styles as <code>&lt;small&gt;</code>.
							</li>
							<li>
								<code>.text-decoration-underline</code> will apply the same styles as <code>&lt;u&gt;</code>.
							</li>
							<li>
								<code>.text-decoration-line-through</code> will apply the same styles as <code>&lt;s&gt;</code>.
							</li>
						</ul>
						{/* END List */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Description list alignment</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body className="pb-0">
						<p>
							Align terms and descriptions horizontally by using our grid system&apos;s predefined classes (or semantic
							mixins). For longer terms, you can optionally add a <code>.text-truncate</code> class to truncate the text
							with an ellipsis.
						</p>
						{/* BEGIN Portlet */}
						<Portlet>
							<Portlet.Body className="pb-0">
								{/* BEGIN Description List */}
								<Row as="dl">
									<Col as="dt" sm="3">
										Description lists
									</Col>
									<Col as="dd" sm="9">
										A description list is perfect for defining terms.
									</Col>

									<Col as="dt" sm="3">
										Term
									</Col>
									<Col as="dd" sm="9">
										<p>Definition for the term.</p>
										<p>And some more placeholder definition text.</p>
									</Col>

									<Col as="dt" sm="3">
										Another term
									</Col>
									<Col as="dd" sm="9">
										This definition is short, so no extra paragraphs or anything.
									</Col>

									<Col as="dt" sm="3" className="text-truncate">
										Truncated term is truncated
									</Col>
									<Col as="dd" sm="9">
										This can be useful when space is tight. Adds an ellipsis at the end.
									</Col>

									<Col as="dt" sm="3">
										Nesting
									</Col>
									<Col as="dd" sm="9">
										<Row as="dl">
											<Col as="dt" sm="4">
												Nested definition list
											</Col>
											<Col as="dd" sm="8">
												I heard you like definition lists. Let me put a definition list inside your definition list.
											</Col>
										</Row>
									</Col>
								</Row>
								{/* END Description List */}
							</Portlet.Body>
						</Portlet>
						{/* END Portlet */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

TypoghrapyPage.pageTitle = 'Typography'
TypoghrapyPage.activeLink = 'elements.base.type'
TypoghrapyPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Base' },
	{ text: 'Typoghrapy', link: '/elements/base/type' },
]

export default withAuth(TypoghrapyPage)
