// Coming back to the room from a case study or the experience page lands you
// where you left it. Before leaving, the room writes that spot (the id of the
// nearest heading) into its URL: the browser's back button then returns to
// /#<spot>, as does the page's "Back to the room" link. Arriving with a spot,
// the room skips its intro and jumps there.

// Where arriving at this URL should jump to, if anywhere.
export function arrivalSpot(): HTMLElement | null {
  const id = decodeURIComponent(location.hash.slice(1));
  return id ? document.getElementById(id) : null;
}

// Once there, drop the spot so a reload starts from the top as usual.
export function clearSpot() {
  history.replaceState(history.state, "", location.pathname + location.search);
}

function rememberSpot(id: string | undefined) {
  if (id) history.replaceState(history.state, "", `#${id}`);
}

// The heading a link sits under: the link's own block, then back through the
// blocks before it.
function headingOf(link: Element) {
  let block = link.closest(".section-text > *");
  while (block && !block.matches("h3[id]")) block = block.previousElementSibling;
  return block?.id;
}

// Remember the spot whenever a link leads to another page of this site.
export function rememberSpotOnLeaving() {
  const onClick = (event: MouseEvent) => {
    // Handled on this page, e.g. a case study link that opened its book.
    if (event.defaultPrevented) return;
    const link = (event.target as Element | null)?.closest?.("a[href]");
    if (!(link instanceof HTMLAnchorElement)) return;
    if (link.origin !== location.origin || link.pathname === location.pathname) return;
    rememberSpot(headingOf(link));
  };
  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}
