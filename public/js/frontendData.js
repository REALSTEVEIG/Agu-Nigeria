const elements = document.querySelectorAll('[id^=element]');

elements.forEach(element => {
  element.addEventListener('click', event => {
    event.preventDefault()
    const clickedElement = event.target;
    const value = clickedElement.innerHTML; // or use clickedElement.textContent

    console.log(value)

    // Send the value to the server using an HTTP request
    // const xhr = new XMLHttpRequest();
    // xhr.open('POST', 'https://agunigeria.onrender.com/value', true);
    // xhr.setRequestHeader('Content-Type', 'application/json');
    // xhr.send(JSON.stringify({ value }));

    fetch('https://agunigeria.onrender.com/paystack/pay', {
      method: 'POST',
      body: JSON.stringify({
        value: value
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    // .then(response => response.json())
    .then(data => {
      // Do something with the response data
    });
  });
});