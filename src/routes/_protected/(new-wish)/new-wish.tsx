import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/(new-wish)/new-wish')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(new-wish)/new-wish"!</div>
}
