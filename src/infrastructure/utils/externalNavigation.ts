"use client";

const DEFAULT_OFFLINE_MESSAGE =
  "This feature needs an internet connection and is not available offline yet.";

export const openExternalUrl = (
  url: string,
  offlineMessage: string = DEFAULT_OFFLINE_MESSAGE
) => {
  if (typeof window === "undefined") {
    return false;
  }

  if (!window.navigator.onLine) {
    window.alert(offlineMessage);
    return false;
  }

  window.open(url, "_blank");
  return true;
};

export const redirectToExternalUrl = (
  url: string,
  offlineMessage: string = DEFAULT_OFFLINE_MESSAGE
) => {
  if (typeof window === "undefined") {
    return false;
  }

  if (!window.navigator.onLine) {
    window.alert(offlineMessage);
    return false;
  }

  window.location.href = url;
  return true;
};
