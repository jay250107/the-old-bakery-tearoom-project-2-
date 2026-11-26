"use strict";

// Wait until the HTML document has loaded.
document.addEventListener("DOMContentLoaded", function () {

    /* =====================================
       1. DARK AND LIGHT MODE
    ===================================== */

    const themeButton = document.getElementById("theme-toggle");

    // Restore previously selected theme.
    const savedTheme = localStorage.getItem("cafeTheme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    }

    if (themeButton) {

        themeButton.addEventListener("click", function () {

            document.body.classList.toggle("dark-mode");

            const isDark = document.body.classList.contains("dark-mode");

            localStorage.setItem(
                "cafeTheme",
                isDark ? "dark" : "light"
            );

            themeButton.textContent = isDark
                ? "Light Mode"
                : "Dark Mode";

        });

    }

    /* =====================================
       2. TEXT SIZE ADJUSTMENT
    ===================================== */

    let currentSize = 16;

    const increaseButton = document.getElementById("increase-text");
    const decreaseButton = document.getElementById("decrease-text");
    const resetButton = document.getElementById("reset-text");

    function changeTextSize(size) {

        currentSize = Math.max(14, Math.min(24, size));

        document.documentElement.style.setProperty(
            "--font-size",
            currentSize + "px"
        );

        localStorage.setItem("cafeTextSize", currentSize);

    }

    const savedSize = Number(localStorage.getItem("cafeTextSize"));

    if (savedSize >= 14 && savedSize <= 24) {
        changeTextSize(savedSize);
    }

    if (increaseButton) {
        increaseButton.addEventListener("click", function () {
            changeTextSize(currentSize + 2);
        });
    }

    if (decreaseButton) {
        decreaseButton.addEventListener("click", function () {
            changeTextSize(currentSize - 2);
        });
    }

    if (resetButton) {
        resetButton.addEventListener("click", function () {
            changeTextSize(16);
        });
    }

    /* =====================================
       3. MOBILE NAVIGATION
    ===================================== */

    const menuToggle = document.querySelector(".menu-toggle");
    const navigation = document.getElementById("main-navigation");

    if (menuToggle && navigation) {

        menuToggle.addEventListener("click", function () {

            navigation.classList.toggle("open");

            const isOpen = navigation.classList.contains("open");

            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Close navigation menu" : "Open navigation menu"
            );

        });

    }

    /* =====================================
       4. MENU CATEGORY FILTERS
    ===================================== */

    const filterButtons = document.querySelectorAll(".filter-btn");
    const productCards = document.querySelectorAll("[data-category]");

    filterButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const category = button.dataset.filter;

            filterButtons.forEach(function (item) {

                item.classList.remove("active");
                item.setAttribute("aria-pressed", "false");

            });

            button.classList.add("active");
            button.setAttribute("aria-pressed", "true");

            productCards.forEach(function (card) {

                if (
                    category === "all" ||
                    card.dataset.category === category
                ) {
                    card.hidden = false;
                } else {
                    card.hidden = true;
                }

            });

        });

    });

    /* =====================================
       5. SHOPPING BASKET
    ===================================== */

    let basket = [];

    try {
        basket = JSON.parse(localStorage.getItem("cafeBasket") || "[]");
    } catch (error) {
        basket = [];
    }

    if (!Array.isArray(basket)) {
        basket = [];
    }

    const basketCount = document.getElementById("basket-count");
    const basketTotal = document.getElementById("basket-total");
    const basketItems = document.getElementById("basket-items");

    // Header basket elements.
    const headerBasketCount = document.getElementById("header-basket-count");
    const headerBasketButton = document.getElementById("header-basket-toggle");
    const headerBasketDropdown = document.getElementById("header-basket-dropdown");

    // Open and close the header basket dropdown.
    if (headerBasketButton && headerBasketDropdown) {

        headerBasketButton.addEventListener("click", function () {

            const isOpen = !headerBasketDropdown.hidden;

            headerBasketDropdown.hidden = isOpen;

            headerBasketButton.setAttribute(
                "aria-expanded",
                String(!isOpen)
            );

        });

    }

    function updateBasket() {

        let count = 0;
        let total = 0;

        basket.forEach(function (item) {

            count += item.quantity;
            total += item.price * item.quantity;

        });

        if (basketCount) {
            basketCount.textContent = count;
        }

        if (basketTotal) {
            basketTotal.textContent = total.toFixed(2);
        }

        // Update the basket count in the header.
        if (headerBasketCount) {
            headerBasketCount.textContent = count;
        }

        // Update the accessible label of the header basket.
        if (headerBasketButton) {
            headerBasketButton.setAttribute(
                "aria-label",
                "Open basket, " + count + " items"
            );
        }

        // Display basket items with a remove dropdown.
        if (basketItems) {

            basketItems.replaceChildren();

            basket.forEach(function (item, index) {

                const itemRow = document.createElement("div");
                itemRow.className = "basket-item";

                const itemDetails = document.createElement("span");

                itemDetails.textContent =
                    item.name + " x " + item.quantity +
                    " - £" + (item.price * item.quantity).toFixed(2);

                const removeDropdown = document.createElement("select");

                removeDropdown.setAttribute(
                    "aria-label",
                    "Options for " + item.name
                );

                const defaultOption = document.createElement("option");
                defaultOption.value = "";
                defaultOption.textContent = "Choose action";

                const removeOption = document.createElement("option");
                removeOption.value = "remove";
                removeOption.textContent = "Remove item";

                removeDropdown.appendChild(defaultOption);
                removeDropdown.appendChild(removeOption);

                removeDropdown.addEventListener("change", function () {

                    if (removeDropdown.value === "remove") {

                        basket.splice(index, 1);

                        updateBasket();

                    }

                });

                itemRow.appendChild(itemDetails);
                itemRow.appendChild(removeDropdown);

                basketItems.appendChild(itemRow);

            });

        }

        localStorage.setItem("cafeBasket", JSON.stringify(basket));

    }

    // Add products to basket.
    const addButtons = document.querySelectorAll(".add-to-basket");

    addButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const name = button.dataset.name;
            const price = Number(button.dataset.price);

            if (!name || !Number.isFinite(price)) {
                return;
            }

            const existingItem = basket.find(function (item) {
                return item.name === name;
            });

            if (existingItem) {

                existingItem.quantity += 1;

            } else {

                basket.push({
                    name: name,
                    price: price,
                    quantity: 1
                });

            }

            updateBasket();

            const originalText = button.textContent;
            button.textContent = "Added!";

            window.setTimeout(function () {
                button.textContent = originalText;
            }, 1200);

        });

    });

    // Clear the entire basket.
    const clearBasketButton = document.getElementById("clear-basket");

    if (clearBasketButton) {

        clearBasketButton.addEventListener("click", function () {

            basket = [];

            updateBasket();

        });

    }

    updateBasket();

    /* =====================================
       6. CONTACT FORM VALIDATION
    ===================================== */

    const contactForm = document.getElementById("contact-form");

    if (contactForm) {

        contactForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const name = document.getElementById("name");
            const email = document.getElementById("email");
            const message = document.getElementById("message");
            const feedback = document.getElementById("form-feedback");

            const fields = [name, email, message];
            let firstInvalid = null;

            fields.forEach(function (field) {

                const valid = field.checkValidity();

                field.setAttribute("aria-invalid", String(!valid));

                if (!valid && firstInvalid === null) {
                    firstInvalid = field;
                }

            });

            if (firstInvalid) {

                feedback.textContent =
                    "Please check the highlighted fields and try again.";

                firstInvalid.focus();

                return;

            }

            feedback.textContent =
                "Thank you! Your form has been validated. " +
                "This demonstration does not send messages.";

            contactForm.reset();

            fields.forEach(function (field) {
                field.removeAttribute("aria-invalid");
            });

        });

    }

});