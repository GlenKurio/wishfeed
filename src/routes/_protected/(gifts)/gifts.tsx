import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/(gifts)/gifts")({
  component: RouteComponent,
});
// All the gifts you booked for someone
// Can book the gift for certain amount of time. if by that time gift is not marked as 'gifted' by user-recepient, booking of the gift is removed
// When mark the the wish as 'gifted' ask who gifted it; Allow to send 'thank you' notification; Show the thank you notification/message with the gift in gifted collection;
function RouteComponent() {
  return <div className="">Hello "/_protected/(gifts)/gifts"!</div>;
}
