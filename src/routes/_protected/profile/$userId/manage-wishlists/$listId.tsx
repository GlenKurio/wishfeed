import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/profile/$userId/manage-wishlists/$listId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>Hello "/_protected/profile/$userId/manage-wishlists/$listId"!</div>
  )
}
