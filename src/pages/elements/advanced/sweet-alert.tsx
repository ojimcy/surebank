import React from 'react'
import withAuth from 'components/auth/withAuth'
import { Row, Col, Portlet, Button } from '@blueupcode/components'
import { swal, toast } from 'components/sweetalert2/instance'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons'
import type { ExtendedNextPage } from '@blueupcode/components/types'

const SweetAlertPage: ExtendedNextPage = () => {
	return (
		<Row>
			<Col>
				{/* BEGIN Portlet */}
				<Portlet>
					<Portlet.Header bordered>
						<Portlet.Title>Sweet alert examples</Portlet.Title>
					</Portlet.Header>
					<Portlet.Body>
						<p>
							<strong>Sweet alert</strong> is a beautiful, responsive, customizable, accessible replacement for
							javascripts&apos;s popup boxes with zero dependencies. Check{' '}
							<a href="http://sweetalert2.github.io" target="_blank" rel="noreferrer">
								Sweet Alert&apos;s page
							</a>{' '}
							for more info.
						</p>
						<hr />
						{/* BEGIN Grid */}
						<div className="d-grid gap-3">
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Basic example
								</Col>
								<Col sm={8} lg={9}>
									<Swal1 />
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Subtitle
								</Col>
								<Col sm={8} lg={9}>
									<Swal2 />
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									More content
								</Col>
								<Col sm={8} lg={9}>
									<Swal3 />
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Custom HTML
								</Col>
								<Col sm={8} lg={9}>
									<Swal4 />
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									More buttons
								</Col>
								<Col sm={8} lg={9}>
									<Swal5 />
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Custom position
								</Col>
								<Col sm={8} lg={9}>
									<Swal6 />
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Custom function
								</Col>
								<Col sm={8} lg={9}>
									<Swal7 />
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Image
								</Col>
								<Col sm={8} lg={9}>
									<Swal8 />
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Close timer
								</Col>
								<Col sm={8} lg={9}>
									<Swal9 />
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									AJAX request
								</Col>
								<Col sm={8} lg={9}>
									<Swal10 />
								</Col>
							</Row>
							<Row>
								<Col sm={4} lg={3} className="col-form-label text-sm-end">
									Toast
								</Col>
								<Col sm={8} lg={9}>
									<Swal11 />
								</Col>
							</Row>
						</div>
						{/* END Grid */}
					</Portlet.Body>
				</Portlet>
				{/* END Portlet */}
			</Col>
		</Row>
	)
}

const Swal1 = () => {
	const handleClick = () => {
		swal.fire('Any fool can use a computer')
	}

	return <Button onClick={handleClick}>Click me</Button>
}

const Swal2 = () => {
	const handleClick = () => {
		swal.fire('The Internet?', 'That thing is still around?', 'question')
	}

	return <Button onClick={handleClick}>Click me</Button>
}

const Swal3 = () => {
	const handleClick = () => {
		swal.fire({
			icon: 'error',
			title: 'Oops...',
			text: 'Something went wrong!',
			footer: <a href="#">Why do I have this issue?</a>,
		})
	}

	return <Button onClick={handleClick}>Click me</Button>
}

const Swal4 = () => {
	const handleClick = () => {
		swal.fire({
			title: (
				<strong>
					HTML <u>example</u>
				</strong>
			),
			icon: 'info',
			html: (
				<>
					You can use <b>bold text</b>, <a href="https://sweetalert2.github.io/">links</a> and other HTML tag
				</>
			),
			showCloseButton: true,
			showCancelButton: true,
			focusConfirm: false,
			confirmButtonText: (
				<>
					<FontAwesomeIcon icon={faThumbsUp} /> Great!
				</>
			),
			confirmButtonAriaLabel: 'Thumbs up, great!',
			cancelButtonText: <FontAwesomeIcon icon={faThumbsDown} />,
			cancelButtonAriaLabel: 'Thumbs down',
		})
	}

	return <Button onClick={handleClick}>Click me</Button>
}

const Swal5 = () => {
	const handleClick = () => {
		swal
			.fire({
				title: 'Do you want to save the changes?',
				showDenyButton: true,
				showCancelButton: true,
				confirmButtonText: 'Save',
				denyButtonText: `Don't save`,
			})
			.then((result) => {
				/* Read more about isConfirmed, isDenied below */
				if (result.isConfirmed) {
					swal.fire('Saved!', '', 'success')
				} else if (result.isDenied) {
					swal.fire('Changes are not saved', '', 'info')
				}
			})
	}

	return <Button onClick={handleClick}>Click me</Button>
}

const Swal6 = () => {
	const handleClick = () => {
		swal.fire({
			position: 'top-end',
			icon: 'success',
			title: 'Your work has been saved',
			showConfirmButton: false,
			timer: 1500,
		})
	}

	return <Button onClick={handleClick}>Click me</Button>
}

const Swal7 = () => {
	const handleClick = () => {
		swal
			.fire({
				title: 'Are you sure?',
				text: "You won't be able to revert this!",
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, delete it!',
			})
			.then((result) => {
				if (result.isConfirmed) {
					swal.fire('Deleted!', 'Your file has been deleted.', 'success')
				}
			})
	}

	return <Button onClick={handleClick}>Click me</Button>
}

const Swal8 = () => {
	const handleClick = () => {
		swal.fire({
			title: 'Sweet!',
			text: 'Modal with a custom image.',
			imageUrl: 'https://unsplash.it/400/200',
			imageWidth: 400,
			imageHeight: 200,
			imageAlt: 'Custom image',
		})
	}

	return <Button onClick={handleClick}>Click me</Button>
}

const Swal9 = () => {
	const handleClick = () => {
		let timerInterval: ReturnType<typeof setInterval>

		swal
			.fire({
				title: 'Auto close alert!',
				html: 'I will close in <b></b> milliseconds.',
				timer: 2000,
				timerProgressBar: true,
				didOpen: () => {
					swal.showLoading()

					const b = swal.getHtmlContainer()?.querySelector('b')

					if (b) {
						timerInterval = setInterval(() => {
							b.textContent = swal.getTimerLeft()?.toString() ?? null
						}, 100)
					}
				},
				willClose: () => {
					clearInterval(timerInterval)
				},
			})
			.then((result) => {
				/* Read more about handling dismissals below */
				if (result.dismiss === swal.DismissReason.timer) {
					console.log('I was closed by the timer')
				}
			})
	}

	return <Button onClick={handleClick}>Click me</Button>
}

const Swal10 = () => {
	const handleClick = () => {
		swal
			.fire({
				title: 'Submit your Github username',
				input: 'text',
				inputAttributes: {
					autocapitalize: 'off',
				},
				showCancelButton: true,
				confirmButtonText: 'Look up',
				showLoaderOnConfirm: true,
				preConfirm: (login) => {
					return fetch(`//api.github.com/users/${login}`)
						.then((response) => {
							if (!response.ok) {
								throw new Error(response.statusText)
							}
							return response.json()
						})
						.catch((error) => {
							swal.showValidationMessage(`Request failed: ${error}`)
						})
				},
				allowOutsideClick: () => !swal.isLoading(),
			})
			.then((result) => {
				if (result.isConfirmed) {
					swal.fire({
						title: `${result.value.login}'s avatar`,
						imageUrl: result.value.avatar_url,
					})
				}
			})
	}

	return <Button onClick={handleClick}>Click me</Button>
}

const Swal11 = () => {
	const handleClick = () => {
		toast.fire({
			icon: 'success',
			title: 'Signed in successfully',
		})
	}

	return <Button onClick={handleClick}>Click me</Button>
}

SweetAlertPage.pageTitle = 'Sweet Alert'
SweetAlertPage.activeLink = 'elements.advanced.sweet-alert'
SweetAlertPage.breadcrumb = [
	{ text: 'Dashboard', link: '/' },
	{ text: 'Elements' },
	{ text: 'Advanced' },
	{ text: 'Sweet Alert', link: '/elements/advanced/sweet-alert' },
]

export default withAuth(SweetAlertPage)
