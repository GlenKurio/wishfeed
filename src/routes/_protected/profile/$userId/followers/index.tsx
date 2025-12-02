import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/profile/$userId/followers/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/profile/$userId/followers/"!</div>
}
