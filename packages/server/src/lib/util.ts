export interface Util {
  isValidUrlId(id: string | number): boolean;
}

function isValidUrlId(id: string | number): boolean {
  /** @TODO make sure all code types are validated */
  return true;
}

const util: Util = {
  isValidUrlId,
};

export default util;
