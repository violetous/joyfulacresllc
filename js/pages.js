function setupPages() {
	// Get all "navbar-burger" elements
	const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

	// Check if there are any navbar burgers
	if ($navbarBurgers.length > 0) {

	// Add a click event on each of them
	$navbarBurgers.forEach( el => {
	  el.addEventListener('click', () => {

	    // Get the target from the "data-target" attribute
	    const target = el.dataset.target;
	    const $target = document.getElementById(target);

	    // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
	    el.classList.toggle('is-active');
	    $target.classList.toggle('is-active');

	  });
	});
	}

  const $navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'), 0);
  const $pages = Array.prototype.slice.call(document.querySelectorAll('.page'), 0);

  // Check if there are any nav links
  if ($navLinks.length > 0) {

    // Add a click event on each of them
    $navLinks.forEach( el => {
      el.addEventListener('click', () => {

        // Get the target from the "data-target" attribute
        const target = el.dataset.target;

        // Set the active nav link to the one that was just clicked (deactivate the others)
        $navLinks.forEach( el => { el.parentElement.classList.remove('is-active')});
        el.parentElement.classList.add('is-active');

        $pages.forEach( el => { el.classList.add('inactive')});

        document.getElementById('page-' + target).classList.remove('inactive');

        if(target === 'shop') {
			catalogShowPage(1);
		}

        
 ga('send', {
          hitType: 'event',
          eventCategory: 'link',
          eventAction: target,
        });

      });
    });
  }

}

function showPage(name) {
	const $navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'), 0);
	const $pages = Array.prototype.slice.call(document.querySelectorAll('.page'), 0);

  	if ($navLinks.length > 0) {
	    $navLinks.forEach( el => {
	    	if(el.dataset.target == name) {
	    		el.click();
	    	}
	    });
	}
}