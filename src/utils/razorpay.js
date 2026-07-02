// Loads the Razorpay Checkout script once (lazily) and exposes a small promise-based
// wrapper around it. No npm package needed — this is the standard way Razorpay expects
// Checkout to be embedded.

let loadingPromise = null;

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve();
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Razorpay checkout script"));
    document.body.appendChild(script);
  });

  return loadingPromise;
}

/**
 * Opens Razorpay Checkout for an order and resolves with the result on success, or
 * rejects with { cancelled: true } if the user closes the popup without paying.
 *
 * @param {Object} order - { razorpayOrderId, keyId, amountPaise, currency, planName }
 * @param {Object} prefill - { name, email, contact } (optional, improves UX)
 * @returns {Promise<{ razorpay_order_id, razorpay_payment_id, razorpay_signature }>}
 */
export function openRazorpayCheckout(order, prefill = {}, theme = {}) {
  return loadRazorpayScript().then(
    () =>
      new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amountPaise,
          currency: order.currency || "INR",
          order_id: order.razorpayOrderId,
          name: "StudyHub",
          description: order.planName ? `Payment for ${order.planName}` : "Subscription payment",
          prefill,
          theme: { color: "#f59e0b", ...theme },
          modal: {
            ondismiss: () => reject({ cancelled: true }),
          },
          handler: (response) => resolve(response),
        });
        rzp.on("payment.failed", (response) => {
          reject({ cancelled: false, error: response?.error });
        });
        rzp.open();
      })
  );
}
