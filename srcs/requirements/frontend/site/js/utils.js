export function show(element) {
  element.classList.remove("d-none");
}
export function hide(element) {
  element.classList.add("d-none");
}

export function formatDuration(duration) {
  if (!duration) return "N/A";
  const parts = duration.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
