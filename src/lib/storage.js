import localforage from "localforage";

localforage.config({ name: "sitzplan" });

export async function saveState(key, value) {
  try {
    await localforage.setItem(key, value);
  } catch (e) {
    console.error("saveState error", e);
  }
}
export async function loadState(key) {
  try {
    return await localforage.getItem(key);
  } catch (e) {
    console.error("loadState error", e);
    return null;
  }
}
export async function removeState(key) {
  try {
    await localforage.removeItem(key);
  } catch (e) {
    console.error("removeState error", e);
  }
}
