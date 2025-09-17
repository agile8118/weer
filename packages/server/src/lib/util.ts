export interface Util {
  isValidUrlId(id: string | number): boolean;
}

function isValidUrlId(id: string | number): boolean {
  return id.toString().length === 6;
}

const util: Util = {
  isValidUrlId,
};

export default util;
