const stripe = Stripe("pk_test_51MyLhPHsyVYBWJ5kWEgMXnRjP0aSAPlELUmk3bn2K0ldjagQ02eC5ugFIeFtnpBeZ3aVS15bxPhugsshSzlFj0sR00ax8zhq3e"); // Your Publishable Key
const elements = stripe.elements();

// Create our card inputs
var style = {
  base: {
    color: "#fff",
  },
};

const card = elements.create("card", { style });
card.mount("#card-element");

const form = document.querySelector("form");
const errorEl = document.querySelector("#card-errors");

// Give our token to our form
const stripeTokenHandler = (token) => {
  const hiddenInput = document.createElement("input");
  hiddenInput.setAttribute("type", "hidden");
  hiddenInput.setAttribute("name", "stripeToken");
  hiddenInput.setAttribute("value", token.id);
  form.appendChild(hiddenInput);

  form.submit();
};

// Create token from card data
form.addEventListener("submit", (e) => {
  e.preventDefault();

  stripe.createToken(card).then((res) => {
    if (res.error) errorEl.textContent = res.error.message;
    else stripeTokenHandler(res.token);
  });
});
