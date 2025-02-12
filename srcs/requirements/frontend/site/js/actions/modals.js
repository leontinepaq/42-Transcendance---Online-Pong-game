export function showModal(message)
{
	const modalBody = document.querySelector('#myModal .modal-body');
	modalBody.textContent = message;
	const modal = new bootstrap.Modal(document.getElementById('myModal'));
	modal.show();    
}
