import gsap from "gsap";
import type { PageRect } from "./open-book";

// The case study shown on an open book's right-hand page: one <dialog> per
// project (data-reader is the project's id), laid over the page. Escape, the
// close button or a click outside the page asks to close it; the shelf then
// closes the book and calls hide().
export function setupReader(onClose: () => void) {
  const pages = new Map(
    gsap.utils.toArray<HTMLDialogElement>("dialog[data-reader]").map((page) => [page.dataset.reader!, page]),
  );
  let open: HTMLDialogElement | undefined;
  let opener: HTMLElement | null = null;

  const place = (page: HTMLDialogElement, rect: PageRect) => {
    page.style.left = `${rect.left}px`;
    page.style.top = `${rect.top}px`;
    page.style.width = `${rect.width}px`;
    page.style.height = `${rect.height}px`;
  };

  // Only once per opening: the shelf's close() hides the page straight away.
  const requestClose = () => {
    if (open) onClose();
  };

  // Escape: handled as a key as well as the dialog's own cancel, which not
  // every browser sends for every Escape.
  const onCancel = (event: Event) => {
    event.preventDefault();
    requestClose();
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    requestClose();
  };
  // The page fills the dialog, so a click on the dialog itself landed on
  // its backdrop, outside the page.
  const onClick = (event: MouseEvent) => {
    const target = event.target as Element;
    if (target === event.currentTarget || target.closest("[data-close]")) requestClose();
  };
  for (const page of pages.values()) {
    page.addEventListener("cancel", onCancel);
    page.addEventListener("keydown", onKey);
    page.addEventListener("click", onClick);
  }

  return {
    has: (id: string) => pages.has(id),
    isOpen: () => Boolean(open),
    show(id: string, rect: PageRect) {
      const page = pages.get(id);
      if (!page) return;
      opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      open = page;
      place(page, rect);
      page.showModal();
      page.scrollTop = 0;
      gsap.fromTo(page, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    },
    move(rect: PageRect) {
      if (open) place(open, rect);
    },
    hide() {
      const page = open;
      open = undefined;
      if (!page) return;
      gsap.to(page, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          page.close();
          opener?.focus({ preventScroll: true });
          opener = null;
        },
      });
    },
    cleanup() {
      for (const page of pages.values()) {
        page.removeEventListener("cancel", onCancel);
        page.removeEventListener("keydown", onKey);
        page.removeEventListener("click", onClick);
        gsap.killTweensOf(page);
        if (page.open) page.close();
      }
    },
  };
}
