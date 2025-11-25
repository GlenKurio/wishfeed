import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/(new-wish)/new-wish")({
  component: RouteComponent,
});
// TODO:
// 3 steps process:
// 1. Paste the link input or fill the form below; Click next
// 2. Preview, if link was pasted - show the loading ui while scraping, and fill out the preview with ability to edit. On edit open the page/overlay with form-like fields to allow edit, and save to go backl to preview; Preview has button "Publish" or wish for it! On wish for it we are publishing the wish and swapping the url to our affiliate link;
// 3. Success with return to home page?
function RouteComponent() {
  return <div>Hello "/(new-wish)/new-wish"!</div>;
}
