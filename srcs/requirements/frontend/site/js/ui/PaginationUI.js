export function createPagination({ previous, next, target, tabKey ='' }) {
	if (!previous && !next) return ``;
	return `
	  <div class="d-flex justify-content-between gap-3 mt-2">
		<button
		  class="btn flex-grow-1"
		  id="prev-page"
		  data-action="update-pagination"
		  data-updatetarget="${target}"
		  data-tab="${tabKey}"
		  data-url="${previous || ''}"
		  ${previous ? '' : 'disabled'}
		  data-i18n="previous"
		>
		  PREVIOUS
		</button>
		<button
		  class="btn flex-grow-1"
		  id="next-page"
		  data-action="update-pagination"
		  data-updatetarget="${target}"
		  data-tab="${tabKey}"
		  data-url="${next || ''}"
		  ${next ? '' : 'disabled'}
		  data-i18n="next"
		>
		  NEXT
		</button>
	  </div>
	`;
  }