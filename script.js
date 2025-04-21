function searchProduct() {
  let query = document.getElementById('search-input').value.toLowerCase();
  // select product that have class='product' 
  let products = document.querySelectorAll('.product');


  products.forEach(product => {
    let productnameElement = product.querySelector('[data-name]');
    let productTypeElement = product.querySelector('[data-type]');
    if (productnameElement) {
      let productName = productnameElement.getAttribute('data-name').toLowerCase();
      let productType = productTypeElement.getAttribute('data-type').toLowerCase();
      if (productName.includes(query) || (productType.includes(query))) {
        product.style.display = 'block'
      } else {
        product.style.display = 'none';
      }
    } else {
      product.style.display = 'none';
    }
  });

}

// function submit() {
//   let emailForm = document.getElementById('emailForm');
//   let emailInput = document.getElementById('emailInput');

//   if (emailForm) {
//     emailForm.addEventListener('submit', function (event) {
//       event.preventDefault();

//       if (emailInput.validity.valid) {
//         alert('Thanks for submitted!')
//       } else {
//         alert('please input email')
//       }
//     });
//   } else {
//     console.error('Form not found')
//   }
// }

// document.addEventListener('DOMContentLoaded', function () {
//   submit();
// })



// Cart functionality
document.addEventListener('DOMContentLoaded', function () {
  // Add click event listeners to all "Add to Cart" buttons
  let addToCartButtons = document.querySelectorAll('.btn-primary');

  addToCartButtons.forEach(button => {
    button.addEventListener('click', function () {
      // Get the parent card element
      const card = this.closest('.card');

      // Extract product details
      const image = card.querySelector('img').src;
      const name = card.querySelector('h2').textContent.trim();
      const price = card.querySelector('.text-lg.font-bold').textContent;
      const description = card.querySelector('.text-gray-600').textContent.trim();

      // Default quantity to 1
      const quantity = 1;

      // Create cart item object
      const cartItem = {
        image: image,
        name: name,
        price: price,
        description: description,
        quantity: quantity
      };

      // Get existing cart from localStorage or initialize empty array
      let cart = JSON.parse(localStorage.getItem('aquashop-cart')) || [];

      // Check if item already exists in cart
      const existingItemIndex = cart.findIndex(item => item.name === name);

      if (existingItemIndex !== -1) {
        // If item exists, increase quantity
        cart[existingItemIndex].quantity += quantity;
      } else {
        // If item doesn't exist, add to cart
        cart.push(cartItem);
      }

      // Save updated cart to localStorage
      localStorage.setItem('aquashop-cart', JSON.stringify(cart));

      // Show confirmation to user
      alert(`Added "${name}" to cart!`);
    });
  });
});

// Function to display cart items on cart.html
function displayCart() {
  try {
    const cartContainer = document.getElementById('cart-items');
    if (!cartContainer) {
      console.error('Cart container not found');
      return;
    }

    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('aquashop-cart')) || [];
    
    // Clear existing content
    cartContainer.innerHTML = '';

    if (cart.length === 0) {
      cartContainer.innerHTML = '<div class="text-center p-8"><h2 class="text-2xl font-bold">Your cart is empty</h2><p class="mt-2">Go to the <a href="product.html" class="text-blue-500">products page</a> to add items to your cart.</p></div>';
      return;
    }

    // Calculate total price
    let totalPrice = 0;

    // Create cart items
    cart.forEach((item, index) => {
      // Extract numeric price value
      const priceValue = parseFloat(item.price.replace(/[^0-9.]/g, ''));
      const itemTotal = priceValue * item.quantity;
      totalPrice += itemTotal;

      localStorage.setItem('aquashop-total', (totalPrice + 10).toFixed(2));

      // Create cart item element
      const cartItemDiv = document.createElement('div');
      cartItemDiv.className = 'bg-white shadow-lg rounded-lg p-4 mb-4 flex flex-col md:flex-row';
      cartItemDiv.innerHTML = `
          <div class="md:w-1/4 mb-4 md:mb-0">
            <img src="${item.image}" alt="${item.name}" class="w-full h-48 object-cover rounded-lg">
          </div>
          <div class="md:w-2/4 md:px-4">
            <h3 class="text-xl font-semibold">${item.name}</h3>
            <p class="text-gray-600 mt-2">${item.description}</p>
            <p class="text-lg font-bold mt-2">${item.price} × ${item.quantity} = $${itemTotal}</p>
          </div>
          <div class="md:w-1/4 flex flex-col items-center justify-center">
            <div class="flex items-center mb-4">
              <button class="btn btn-sm btn-circle" onclick="updateQuantity(${index}, -1)">-</button>
              <span class="mx-4">${item.quantity}</span>
              <button class="btn btn-sm btn-circle" onclick="updateQuantity(${index}, 1)">+</button>
            </div>
            <button class="btn btn-error" onclick="removeFromCart(${index})">Remove</button>
          </div>
        `;

      cartContainer.appendChild(cartItemDiv);
    });

    // Add order summary section
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'bg-white shadow-lg rounded-lg p-6 mt-6';
    summaryDiv.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">Order Summary</h2>
        <div class="flex justify-between mb-2">
          <span>Subtotal:</span>
          <span>$${totalPrice.toFixed(2)}</span>
        </div>
        <div class="flex justify-between mb-2">
          <span>Shipping:</span>
          <span>$10.00</span>
        </div>
        <div class="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
          <span>Total:</span>
          <span>$${(totalPrice + 10).toFixed(2)}</span>
        </div>
        <button class="btn btn-primary w-full mt-6" onclick="window.location.href='./pay.html'">Proceed to Checkout</button>
        <button class="btn btn-outline w-full mt-2" onclick="clearCart()">Clear Cart</button>
      `;

    cartContainer.appendChild(summaryDiv);
  } catch (error) {
    console.error('Error displaying cart:', error);
    const cartContainer = document.getElementById('cart-items');
    if (cartContainer) {
      cartContainer.innerHTML = '<div class="text-center p-8"><h2 class="text-2xl font-bold">Error loading cart</h2><p class="mt-2">Please try refreshing the page.</p></div>';
    }
  }
}

// Function to update item quantity
function updateQuantity(index, change) {
  // Get cart from localStorage
  let cart = JSON.parse(localStorage.getItem('aquashop-cart')) || [];

  // Update quantity
  cart[index].quantity += change;

  // Make sure quantity doesn't go below 1
  if (cart[index].quantity < 1) {
    cart[index].quantity = 1;
  }

  // Save updated cart
  localStorage.setItem('aquashop-cart', JSON.stringify(cart));

  // Refresh cart display
  displayCart();
}

// Function to remove item from cart
function removeFromCart(index) {
  // Get cart from localStorage
  let cart = JSON.parse(localStorage.getItem('aquashop-cart')) || [];

  // Remove the item
  cart.splice(index, 1);

  // Save updated cart
  localStorage.setItem('aquashop-cart', JSON.stringify(cart));

  // Refresh cart display
  displayCart();
}

// Function to clear the entire cart
function clearCart() {
  if (confirm('Are you sure you want to clear your cart?')) {
    localStorage.removeItem('aquashop-cart');
    displayCart();
  }
}


document.addEventListener('DOMContentLoaded', function () {
  console.log('Current path:', window.location.pathname);
  console.log('Cart contents:', localStorage.getItem('aquashop-cart'));
  
  const path = window.location.pathname;
  if (path.includes('cart.html') || 
      path.endsWith('/cart') || 
      path.endsWith('/cart/') ||
      path === '/cart') {
    console.log('Attempting to display cart');
    displayCart();
  }
});

// Call displayCart when page loads (if on cart page)
// document.addEventListener('DOMContentLoaded', function () {
//   if (  window.location.pathname.includes('cart.html') || path.endsWith('/cart')) {
//     displayCart();
//   // if (window.location.pathname.includes('cart.html')) {
//   //   displayCart();
//   }
// });

document.addEventListener('DOMContentLoaded', function () {
  const totalAmountElement = document.getElementById('totalAmount');
  const total = localStorage.getItem('aquashop-total');

  if (total && totalAmountElement) {
    totalAmountElement.textContent = `$${parseFloat(total).toFixed(2)}`;
  }
  else {
    totalAmountElement.textContent = '$0.00'
  }
}
);

// document.addEventListener('DOMContentLoaded', function () {
//   const totalAmountElement = document.getElementById('totalAmount');
//   const payBtn = document.getElementById('payBtn');
//   const total = localStorage.getItem('aquashop-total');

//   if (total && totalAmountElement) {
//     totalAmountElement.textContent = `$${parseFloat(total).toFixed(2)}`;
//   } else {
//     totalAmountElement.textContent = '$0.00'
//   }

//   // Add event listener to the payment button
//   document.addEventListener('DOMContentLoaded', function () {
//     if (document.getElementById('payment-form')) {
//     const form = document.getElementById('payment-form');

//     form.addEventListener('submit', function (event) {
//       // prevent send form to server first
//       event.preventDefault();

//       const name = document.getElementById('name').value.trim();
//       const email = document.getElementById('email').value.trim();
//       const phone = document.getElementById('phone').value.trim();
//       const address = document.getElementById('address').value.trim();

//       if (name && email && phone && address) {
//         localStorage.removeItem('aquashop-cart');
//         localStorage.removeItem('aquashop-total');
//         alert('Payment successful! Thank you for your order!');
//         window.location.href = './index.html';

//       } else {
//         alert('Please fill in all fields!');
//       }
//     })
//   }}
//   )
// });


document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('emailForm')) {
    setupEmailForm(); // หน้า index
  }

  if (document.getElementById('payment-form')) {
    setupPaymentForm(); // หน้า pay
  }
});

function setupEmailForm() {
  const emailForm = document.getElementById('emailForm');
  const emailInput = document.getElementById('emailInput');

  emailForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (emailInput.validity.valid) {
      alert('Thanks for submitted!');
    } else {
      alert('Please input email');
    }
  });
}

function setupPaymentForm() {
  const form = document.getElementById('payment-form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();

    if (name && email && phone && address) {
      localStorage.removeItem('aquashop-cart');
      localStorage.removeItem('aquashop-total');
      alert('ขอบคุณสำหรับการสั่งซื้อ!');
      window.location.href = './index.html';
    } else {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
  });
}
