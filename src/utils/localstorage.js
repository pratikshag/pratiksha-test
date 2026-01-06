export const deleteLocalStorage = (key) => {
  if (window.localStorage) {
    if (key) {
      localStorage.removeItem(key);
    } else {
      localStorage.clear();
    }
  }
};
