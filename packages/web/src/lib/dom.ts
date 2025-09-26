function message(msg: string, className: string = "nothing"): void {
  const x = document.getElementById("snackbar") as HTMLElement | null;
  if (x && x.className.indexOf("show") === -1) {
    x.innerHTML = msg;
    x.classList.add(className);
    x.classList.add("show");
    setTimeout(() => {
      x.className = "";
      x.innerHTML = "";
    }, 3900);
  }
}

interface DomUtils {
  message: (msg: string, className?: string) => void;
}

const obj: DomUtils = {
  message,
};

export default obj;
