// formats a date into a AM/PM time string
export const formatTime = (date) => {
  let hours = date.getHours() % 12;
  if (hours === 0) hours = 12;
  hours = hours.toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes} ${date.getHours() >= 12 ? "PM" : "AM"}`;
};

// helper function that does for each and waits
export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

// this needs to be a normal function vs arrow because we need "this" to be in context of calling component
export function setStateAsync(state) {
  return new Promise((resolve) => {
    this.setState(state, resolve);
  });
}

// like Array.map but for objects
export const objectMap = (obj, fn) =>
  Object.fromEntries(
    Object.entries(obj).map(
      ([k, v], i) => [k, fn(v, k, i)]
    )
  )
