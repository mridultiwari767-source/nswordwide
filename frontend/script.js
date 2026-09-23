document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // MOBILE MENU
    // =====================================================

    const menuToggle = document.querySelector("#menuToggle");
    const nav = document.querySelector("#mainNav") || document.querySelector(".nav");

    if (menuToggle && nav) {

        menuToggle.addEventListener("click", function () {

            nav.classList.toggle("show");
            nav.classList.toggle("open");

            const icon = menuToggle.querySelector("i");

            if (icon) {
                if (
                    nav.classList.contains("show") ||
                    nav.classList.contains("open")
                ) {
                    icon.classList.remove("fa-bars");
                    icon.classList.add("fa-xmark");
                } else {
                    icon.classList.remove("fa-xmark");
                    icon.classList.add("fa-bars");
                }
            }

        });

        nav.querySelectorAll("a").forEach(function (link) {

            link.addEventListener("click", function () {

                nav.classList.remove("show");
                nav.classList.remove("open");

                const icon = menuToggle.querySelector("i");

                if (icon) {
                    icon.classList.remove("fa-xmark");
                    icon.classList.add("fa-bars");
                }

            });

        });
    }


    // =====================================================
    // HEADER SCROLL
    // =====================================================

    const header = document.querySelector(".header");

    window.addEventListener("scroll", function () {

        if (!header) return;

        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }

    });


    // =====================================================
    // SMOOTH SCROLL
    // =====================================================

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {

        link.addEventListener("click", function (e) {

            const targetId = this.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);

            if (target) {

                e.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });


    // =====================================================
    // PRODUCT SYSTEM
    // =====================================================

    const productsContainer =
        document.querySelector("#frontendProducts");

    const productSearch =
        document.querySelector("#productSearch");

    const categoryFilter =
        document.querySelector("#categoryFilter");

    const noProducts =
        document.querySelector("#noProducts");

    let allProducts = [];


    // =====================================================
    // ESCAPE HTML
    // =====================================================

    function escapeHtml(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // =====================================================
    // LOAD PRODUCTS FROM BACKEND
    // =====================================================

    async function loadProducts() {

        if (!productsContainer) {
            return;
        }

        productsContainer.innerHTML = `
            <p style="text-align:center;width:100%;">
                Loading products...
            </p>
        `;

        try {

            const response =
                await fetch("/api/products");

            if (!response.ok) {
                throw new Error("Unable to load products");
            }

            allProducts = await response.json();

            createCategoryFilter();

            displayProducts(allProducts);

            console.log(
                "Products loaded:",
                allProducts
            );

        } catch (error) {

            console.error(
                "Product loading error:",
                error
            );

            productsContainer.innerHTML = `
                <p style="text-align:center;width:100%;color:red;">
                    Unable to load products.
                </p>
            `;

        }

    }


    // =====================================================
    // CREATE CATEGORY DROPDOWN
    // =====================================================

    function createCategoryFilter() {

        if (!categoryFilter) {
            return;
        }

        const categories = [];

        allProducts.forEach(function (product) {

            if (
                product.category &&
                !categories.includes(product.category)
            ) {
                categories.push(product.category);
            }

        });

        categories.sort();

        categoryFilter.innerHTML = `
            <option value="all">All Categories</option>
        `;

        categories.forEach(function (category) {

            const option =
                document.createElement("option");

            option.value = category;
            option.textContent = category;

            categoryFilter.appendChild(option);

        });

    }


    // =====================================================
    // DISPLAY PRODUCTS
    // =====================================================

    function displayProducts(products) {

        if (!productsContainer) {
            return;
        }

        productsContainer.innerHTML = "";

        if (!products || products.length === 0) {

            if (noProducts) {
                noProducts.style.display = "block";
            }

            productsContainer.innerHTML = `
                <p style="text-align:center;width:100%;">
                    No products found.
                </p>
            `;

            return;
        }

        if (noProducts) {
            noProducts.style.display = "none";
        }


        products.forEach(function (product) {

            const card =
                document.createElement("div");

            card.className = "product-card";


            const image =
                product.image ||
                "https://via.placeholder.com/500x350?text=NS+Worldwide";


            const name =
                escapeHtml(product.name);


            const category =
                escapeHtml(
                    product.category ||
                    "Civil Engineering Equipment"
                );


            const description =
                escapeHtml(
                    product.description ||
                    "Quality civil engineering testing equipment."
                );


            const whatsappMessage =
                `Hello NS Worldwide,

I am interested in ${product.name}.

Please share:
- Product details
- Price
- Availability
- Delivery information`;


            const whatsappURL =
                "https://wa.me/919554530206?text=" +
                encodeURIComponent(whatsappMessage);


            card.innerHTML = `

                <div class="product-image">

                    <img
                        src="${escapeHtml(image)}"
                        alt="${name}"
                        loading="lazy"
                        onerror="this.src='https://via.placeholder.com/500x350?text=Image+Not+Available'"
                    >

                </div>


                <div class="product-content">

                    <span class="product-category">
                        ${category}
                    </span>


                    <h3>
                        ${name}
                    </h3>


                    <p>
                        ${description}
                    </p>


                    <div class="product-actions">

                        <a
                            href="/product-details.html?id=${product.id}"
                            class="product-details-btn"
                        >
                            View Details
                        </a>


                        <a
                            href="${whatsappURL}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="product-link"
                        >
                            Enquire Now
                        </a>

                    </div>

                </div>

            `;


            productsContainer.appendChild(card);

        });

    }


    // =====================================================
    // SEARCH + FILTER
    // =====================================================

    function filterProducts() {

        const searchValue =
            productSearch
                ? productSearch.value.toLowerCase().trim()
                : "";


        const selectedCategory =
            categoryFilter
                ? categoryFilter.value
                : "all";


        const filteredProducts =
            allProducts.filter(function (product) {

                const name =
                    (product.name || "")
                        .toLowerCase();


                const category =
                    (product.category || "")
                        .toLowerCase();


                const description =
                    (product.description || "")
                        .toLowerCase();


                const matchesSearch =
                    name.includes(searchValue) ||
                    category.includes(searchValue) ||
                    description.includes(searchValue);


                const matchesCategory =
                    selectedCategory === "all" ||
                    product.category === selectedCategory;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            });


        displayProducts(filteredProducts);

    }


    if (productSearch) {

        productSearch.addEventListener(
            "input",
            filterProducts
        );

    }


    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            filterProducts
        );

    }


    // =====================================================
    // CATEGORY CARDS
    // =====================================================

    const categoryCards =
        document.querySelectorAll(
            ".category-card"
        );


    categoryCards.forEach(function (card) {

        card.addEventListener(
            "click",
            function () {

                const category =
                    this.dataset.category ||
                    this.dataset.categoryLink;


                if (!categoryFilter) {
                    return;
                }


                let found = false;


                Array.from(
                    categoryFilter.options
                ).forEach(function (option) {

                    if (
                        option.value.toLowerCase() ===
                        String(category).toLowerCase()
                    ) {

                        categoryFilter.value =
                            option.value;

                        found = true;

                    }

                });


                const productsSection =
                    document.querySelector(
                        "#products"
                    );


                if (productsSection) {

                    productsSection.scrollIntoView({
                        behavior: "smooth"
                    });

                }


                if (found) {
                    filterProducts();
                }

            }
        );

    });


    // =====================================================
    // CONTACT FORM
    // =====================================================

    const contactForm =
        document.querySelector("#contactForm");

    const formMessage =
        document.querySelector("#formMessage");


    if (contactForm) {

        console.log("Contact form found!");


        contactForm.addEventListener(
            "submit",
            async function (e) {

                e.preventDefault();


                const nameInput =
                    document.querySelector("#name");

                const phoneInput =
                    document.querySelector("#phone");

                const emailInput =
                    document.querySelector("#email");

                const messageInput =
                    document.querySelector("#message");


                if (
                    !nameInput ||
                    !phoneInput ||
                    !emailInput ||
                    !messageInput
                ) {

                    console.error(
                        "Contact form fields missing."
                    );

                    return;

                }


                const formData = {

                    name:
                        nameInput.value.trim(),

                    phone:
                        phoneInput.value.trim(),

                    email:
                        emailInput.value.trim(),

                    message:
                        messageInput.value.trim()

                };


                if (formMessage) {

                    formMessage.textContent =
                        "Sending...";

                    formMessage.style.color =
                        "#102a43";

                }


                try {

                    const response =
                        await fetch(
                            "/api/contact",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(formData)
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Server error"
                        );

                    }


                    if (formMessage) {

                        formMessage.textContent =
                            data.message ||
                            "Your enquiry has been received.";

                        formMessage.style.color =
                            "green";

                    }


                    contactForm.reset();


                    console.log(
                        "Enquiry submitted successfully!"
                    );


                } catch (error) {

                    console.error(
                        "Contact form error:",
                        error
                    );


                    if (formMessage) {

                        formMessage.textContent =
                            "Unable to send enquiry. Please try again.";

                        formMessage.style.color =
                            "red";

                    }

                }

            }
        );

    }


    // =====================================================
    // GALLERY LIGHTBOX
    // =====================================================

    const galleryImages =
        document.querySelectorAll(
            ".gallery-item img"
        );


    galleryImages.forEach(function (image) {

        image.addEventListener(
            "click",
            function () {

                const lightbox =
                    document.querySelector(
                        ".lightbox"
                    );


                const lightboxImage =
                    document.querySelector(
                        ".lightbox img"
                    );


                if (
                    lightbox &&
                    lightboxImage
                ) {

                    lightboxImage.src =
                        this.src;

                    lightboxImage.alt =
                        this.alt;

                    lightbox.classList.add(
                        "active"
                    );

                }

            }
        );

    });


    const lightbox =
        document.querySelector(
            ".lightbox"
        );


    const lightboxClose =
        document.querySelector(
            ".lightbox-close"
        );


    if (
        lightboxClose &&
        lightbox
    ) {

        lightboxClose.addEventListener(
            "click",
            function () {

                lightbox.classList.remove(
                    "active"
                );

            }
        );

    }


    if (lightbox) {

        lightbox.addEventListener(
            "click",
            function (e) {

                if (
                    e.target === lightbox
                ) {

                    lightbox.classList.remove(
                        "active"
                    );

                }

            }
        );

    }


    // =====================================================
    // ESC KEY
    // =====================================================

    document.addEventListener(
        "keydown",
        function (e) {

            if (e.key === "Escape") {

                if (lightbox) {

                    lightbox.classList.remove(
                        "active"
                    );

                }


                if (nav) {

                    nav.classList.remove(
                        "show"
                    );

                    nav.classList.remove(
                        "open"
                    );

                }

            }

        }
    );


    // =====================================================
    // BACK TO TOP
    // =====================================================

    let backTop =
        document.querySelector(
            ".back-to-top"
        );


    if (!backTop) {

        backTop =
            document.createElement(
                "button"
            );


        backTop.className =
            "back-to-top";


        backTop.innerHTML =
            "↑";


        backTop.setAttribute(
            "aria-label",
            "Back to top"
        );


        document.body.appendChild(
            backTop
        );

    }


    window.addEventListener(
        "scroll",
        function () {

            if (
                window.scrollY > 500
            ) {

                backTop.classList.add(
                    "show"
                );

            } else {

                backTop.classList.remove(
                    "show"
                );

            }

        }
    );


    backTop.addEventListener(
        "click",
        function () {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }
    );


    // =====================================================
    // REVEAL ANIMATION
    // =====================================================

    const revealElements =
        document.querySelectorAll(
            ".reveal"
        );


    if (
        "IntersectionObserver" in window
    ) {

        const observer =
            new IntersectionObserver(
                function (entries) {

                    entries.forEach(
                        function (entry) {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "visible"
                                );

                                observer.unobserve(
                                    entry.target
                                );

                            }

                        }
                    );

                },
                {
                    threshold: 0.1
                }
            );


        revealElements.forEach(
            function (element) {

                observer.observe(
                    element
                );

            }
        );

    } else {

        revealElements.forEach(
            function (element) {

                element.classList.add(
                    "visible"
                );

            }
        );

    }


    // =====================================================
    // COUNTERS
    // =====================================================

    const counters =
        document.querySelectorAll(
            ".counter"
        );


    counters.forEach(
        function (counter) {

            const target =
                Number(
                    counter.dataset.target
                );


            if (!target) {
                return;
            }


            let started = false;


            if (
                "IntersectionObserver" in window
            ) {

                const observer =
                    new IntersectionObserver(
                        function (entries) {

                            if (
                                entries[0].isIntersecting &&
                                !started
                            ) {

                                started = true;

                                let number = 0;


                                const interval =
                                    setInterval(
                                        function () {

                                            number +=
                                                Math.ceil(
                                                    target / 50
                                                );


                                            if (
                                                number >= target
                                            ) {

                                                number =
                                                    target;

                                                clearInterval(
                                                    interval
                                                );

                                            }


                                            counter.textContent =
                                                number + "+";


                                        },
                                        30
                                    );


                                observer.unobserve(
                                    counter
                                );

                            }

                        }
                    );


                observer.observe(
                    counter
                );

            } else {

                counter.textContent =
                    target + "+";

            }

        }
    );


    // =====================================================
    // CURRENT YEAR
    // =====================================================

    const year =
        document.querySelector(
            "#currentYear"
        );


    if (year) {

        year.textContent =
            new Date().getFullYear();

    }


    // =====================================================
    // LOAD PRODUCTS
    // =====================================================

    loadProducts();


    // =====================================================
    // FINAL MESSAGE
    // =====================================================

    console.log(
        "NS Worldwide JavaScript loaded successfully!"
    );

});