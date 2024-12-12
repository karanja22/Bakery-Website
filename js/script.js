// Navbar Toggle
const navbar = document.querySelector('.header .navbar');
const menu = document.querySelector('#menu-btn');

menu.addEventListener('click', () => {
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('active');
});

// Swiper Initialization
const swiper = new Swiper('.home-slider', {
    grabCursor: true,
    loop: true,
    centeredSlides: true,
    autoplay: {
        delay: 1000,
        disableOnInteraction: false,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});

// Cart functionality
let cart = [];

// Utility function to find an item in the cart
function findCartItem(id) {
    return cart.find(item => item.id === id);
}

// Render the cart items
function renderCart() {
    const cartItemsDiv = document.getElementById('cart-items');
    const totalPriceSpan = document.getElementById('total-price');

    // Clear existing items
    cartItemsDiv.innerHTML = '';

    let totalPrice = 0;

    cart.forEach(item => {
        totalPrice += item.price * item.quantity;

        const itemDiv = document.createElement('div');
        itemDiv.classList.add('cart-item');
        itemDiv.innerHTML = `
            <span>${item.name}</span>
            <input type="number" value="${item.quantity}" min="1" data-id="${item.id}" class="cart-quantity">
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
            <button class="remove-item" data-id="${item.id}">Remove</button>
        `;

        cartItemsDiv.appendChild(itemDiv);
    });

    // Update total price
    totalPriceSpan.textContent = `$${totalPrice.toFixed(2)}`;

    // Attach event listeners for quantity inputs
    document.querySelectorAll('.cart-quantity').forEach(input => {
        input.addEventListener('input', handleQuantityChange);
    });

    // Attach event listeners for remove buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', handleRemoveItem);
    });
}

// Handle quantity change
function handleQuantityChange(e) {
    const id = e.target.dataset.id;
    const newQuantity = parseInt(e.target.value, 10);

    const cartItem = findCartItem(id);
    if (cartItem) {
        cartItem.quantity = newQuantity > 0 ? newQuantity : 1;
        renderCart();
    }
}

// Handle removing an item
function handleRemoveItem(e) {
    const id = e.target.dataset.id;

    // Filter out the item to remove
    cart = cart.filter(item => item.id !== id);

    // Re-render the cart
    renderCart();
}

// Add item to the cart
function addToCart(id, name, price) {
    const existingItem = findCartItem(id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    renderCart();
}

// Event listener for Add to Cart buttons
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            const name = button.dataset.name;
            const price = parseFloat(button.dataset.price);
            addToCart(id, name, price);
        });
    });

    // Order Now Button
    document.getElementById('order-btn').addEventListener('click', () => {
        document.getElementById('order-form').style.display = 'block';
    });

    // Clear cart button
    document.getElementById('clear-cart').addEventListener('click', () => {
        cart = [];
        renderCart();
    });

    // Submit Order Form
    document.getElementById('order-details').addEventListener('submit', e => {
        e.preventDefault();

        const orderData = {
            firstName: document.getElementById('first-name').value,
            lastName: document.getElementById('last-name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            items: cart,
        };

        // Send order data to backend
        fetch('http://localhost:3000/submit_order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
        })
            .then(response => response.json())
            .then(() => {
                alert('Order Submitted Successfully!');
                cart = []; // Clear the cart
                renderCart();
                document.getElementById('order-form').style.display = 'none';
            })
            .catch(error => console.error('Error submitting order:', error));
    });
});
