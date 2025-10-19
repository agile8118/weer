import dom from "./dom";

function validURL(str: string): boolean {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
    str
  );
}

// Handle errors from axios requests
function handleErr(error: any) {
  if (error.response && error.response.data && error.response.data.error) {
    dom.message(error.response.data.error, "error");
  } else {
    // show an error message to user on unexpected errors
    dom.message(
      "Sorry, an unknown error occurred, please try again later.",
      "error"
    );
  }
}

function cutString(string: string, maxLength: number): string {
  if (string.length > maxLength) return string.substring(0, maxLength) + "...";
  return string;
}

// Remove the http(s):// part from a url
function simplifyUrl(url: string): string {
  return url.replace(/^(?:https?:\/\/)?(?:www\.)?/, "");
}

interface Lib {
  validURL: (str: string) => boolean;
  simplifyUrl: (url: string) => string;
  cutString: (string: string, maxLength: number) => string;
  handleErr: (error: any) => void;
}

const lib: Lib = {
  validURL,
  handleErr,
  cutString,
  simplifyUrl,
};

export default lib;
