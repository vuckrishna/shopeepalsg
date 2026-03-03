document.addEventListener('DOMContentLoaded', function () {
    var nav = document.querySelector('.nav');
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.getElementById('primary-navigation');

    if (nav && toggle && menu) {
        toggle.addEventListener('click', function () {
            var isOpen = nav.getAttribute('data-menu-open') === 'true';
            var next = !isOpen;
            nav.setAttribute('data-menu-open', String(next));
            toggle.setAttribute('aria-expanded', String(next));
        });

        // Close menu when a link is clicked (mobile UX)
        menu.addEventListener('click', function (e) {
            var t = e.target;
            if (t && t.tagName === 'A') {
                nav.setAttribute('data-menu-open', 'false');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Close on escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                nav.setAttribute('data-menu-open', 'false');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    var yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
    }

    function renderProductCard(d) {
        return '<article class="product-card">' +
            '<img src="' + d.image + '" alt="' + d.name + '">' +
            '<div class="product-details">' +
            '<div class="product-name">' + d.name + '</div>' +
            '<div class="price-row">' +
            '<span class="original-price">' + d.originalPrice + '</span>' +
            '<span class="discounted-price">' + d.discountedPrice + '</span>' +
            '</div>' +
            '<div class="coupon-discount">' + d.couponDiscount + '</div>' +
            '<a class="deal-link" href="' + d.link + '" target="_blank" rel="noopener noreferrer">View on Shopee</a>' +
            '</div></article>';
    }

    // Deals page: fetch and render product cards from JSON
    var fetchDealsGrid = document.querySelector('.deals-grid[data-fetch-deals]');
    if (fetchDealsGrid) {
        var jsonUrl = fetchDealsGrid.getAttribute('data-fetch-deals');
        fetch(jsonUrl)
            .then(function (res) { return res.json(); })
            .then(function (data) {
                var deals = data.deals || [];
                fetchDealsGrid.innerHTML = deals.map(renderProductCard).join('');
            })
            .catch(function () {
                fetchDealsGrid.innerHTML = '<p class="deals-no-results">Unable to load deals. Please try again later.</p>';
            });
    }

    // Monthly Deals page: fetch and render sections by month from JSON
    var fetchMonthlyGrids = document.querySelectorAll('.deals-grid[data-fetch-monthly]');
    if (fetchMonthlyGrids.length) {
        var monthlyJsonUrl = fetchMonthlyGrids[0].getAttribute('data-fetch-monthly');
        fetch(monthlyJsonUrl)
            .then(function (res) { return res.json(); })
            .then(function (data) {
                var sections = data.sections || [];
                fetchMonthlyGrids.forEach(function (grid) {
                    var sectionEl = grid.closest('[data-monthly-section]');
                    var idx = sectionEl ? parseInt(sectionEl.getAttribute('data-monthly-section'), 10) : 0;
                    var section = sections[idx];
                    if (section) {
                        var labelEl = sectionEl.querySelector('.monthly-label');
                        if (labelEl) labelEl.textContent = section.month || '';
                        var summaryEl = sectionEl.querySelector('[data-monthly-summary]');
                        if (summaryEl && section.summary) {
                            summaryEl.textContent = section.summary;
                            summaryEl.style.display = '';
                        } else if (summaryEl) {
                            summaryEl.style.display = 'none';
                        }
                        var deals = section.deals || [];
                        grid.innerHTML = deals.map(renderProductCard).join('');
                    }
                });
            })
            .catch(function () {
                fetchMonthlyGrids.forEach(function (grid) {
                    grid.innerHTML = '<p class="deals-no-results">Unable to load monthly deals. Please try again later.</p>';
                });
            });
    }

    // Deals / Monthly Deals search: filter product cards by nav-search input
    var searchInput = document.querySelector('.nav-search .search-input');
    var noResultsEl = document.getElementById('deals-no-results') || document.getElementById('monthly-no-results');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            var dealsGrids = document.querySelectorAll('.deals-grid');
            var productCards = [];
            dealsGrids.forEach(function (grid) {
                productCards = productCards.concat(Array.from(grid.querySelectorAll('.product-card')));
            });
            var query = (this.value || '').trim().toLowerCase();
            var visibleCount = 0;
            productCards.forEach(function (card) {
                var nameEl = card.querySelector('.product-name');
                var name = nameEl ? nameEl.textContent.trim().toLowerCase() : '';
                var matches = !query || name.indexOf(query) !== -1;
                card.style.display = matches ? '' : 'none';
                if (matches) visibleCount++;
            });
            if (noResultsEl) {
                noResultsEl.style.display = (query && visibleCount === 0) ? 'block' : 'none';
            }
        });
    }
});
