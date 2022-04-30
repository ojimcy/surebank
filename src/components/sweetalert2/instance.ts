import Swal from 'sweetalert2/dist/sweetalert2'
import swalContent from 'sweetalert2-react-content'

// Set SweetAlert options
export const swal = swalContent(
	Swal.mixin({
		customClass: {
			confirmButton: 'btn btn-label-success btn-wide mx-1',
			cancelButton: 'btn btn-label-danger btn-wide mx-1',
		},
		buttonsStyling: false,
	})
)

// Set SweetAlert toast options
export const toast = swalContent(
	Swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: 3000,
		timerProgressBar: true,
	})
)
