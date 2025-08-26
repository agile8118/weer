const obj = {};

obj.message = (msg, className = "nothing") => {
  var x = document.getElementById("snackbar");
  if (x.className.indexOf("show") === -1) {
    x.innerHTML = msg;
    x.classList.add(className);
    x.classList.add("show");
    setTimeout(function() {
      x.className = "";
      x.innerHTML = "";
    }, 3900);
  }
};

export default obj;
