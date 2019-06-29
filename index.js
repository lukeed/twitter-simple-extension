;(function () {
	var ro1, ro2, last;
	const $ = document.querySelector.bind(document);
	const sleep = ms => new Promise(r => setTimeout(r, ms));
	const ready = (sel, tmp) => new Promise(r => (tmp=$(sel)) ? r(tmp) : sleep(5).then(() => ready(sel)).then(r));

	const map = {
		'/explore': 'div[aria-label="Timeline: Explore"]',
		'/notifications': '[aria-label="Notifications timelines"]',
		'/home': '[aria-label="Timeline: Your Home Timeline"]',
	};

	function nomax(elem) {
		elem.style.maxWidth = 'none';
	}

	function sniff() {
		var i=0, elems=document.querySelectorAll('[data-testid=tweet]');
		for (; i < elems.length; i++) {
			if (elems[i]._seen) continue;
			if (elems[i].lastElementChild.childElementCount > 2) {
				elems[i].parentNode.parentNode.parentNode.parentNode.parentNode.style.display = 'none';
			}
			elems[i]._seen = 1;
		}
	}

	async function onchange() {
		var uri = location.pathname;
		if (ro2) ro2=ro2.disconnect();
		if (last && last !== uri) return onload();

		var tar = await ready(map[uri]);

		if (uri === '/messages') {
			// nothing
		} else if (uri ==='/' || uri === '/home') {
			ro2 = new ResizeObserver(sniff);
			ro2.observe(tar); // block promoted tweets
			nomax($('a[aria-label="Compose new Tweet"]').nextElementSibling );
			$('[data-testid=primaryColumn] h2').parentNode.insertAdjacentElement('afterend', $('form[role=search]'));
		} else if (uri === '/notifications') {
			var i=0, tabs=tar.querySelectorAll('[role=presentation]');
			for (; i < tabs.length; i++) tabs[i].style.flex = 1;
			nomax(tar.parentNode);
		} else if (uri === '/explore') {
			nomax(tar.parentNode.parentNode.parentNode);
		}
	}

	async function onload() {
		last = location.pathname;
		if (ro1) ro1=ro1.disconnect();
		ro1 = new ResizeObserver(onchange);

		await Promise.all([
			ready('[data-testid=primaryColumn]'),
			ready('[data-testid=sidebarColumn]'),
		]).then(arr => {
			arr[1].style.display = 'none';
			ro1.observe(arr[0]);
			nomax(arr[0]);
		});
	}

	addEventListener('popstate', onload);
	onload(); // init
})();
