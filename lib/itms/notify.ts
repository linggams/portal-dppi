import { prisma } from "@/lib/db/prisma"

type NotifyUserInput = {
  idUser: number
  type: string
  title: string
  body: string
  href?: string
}

async function notifyItmsUser(input: NotifyUserInput) {
  await prisma.itmsNotification.create({
    data: {
      idUser: input.idUser,
      type: input.type,
      title: input.title,
      body: input.body.slice(0, 500),
      href: input.href ?? null,
    },
  })
}

export async function notifyTicketCreated(ticket: {
  idTicket: number
  number: string
  title: string
}) {
  const staff = await prisma.user.findMany({
    where: { manageItms: true },
    select: { idUser: true },
  })

  await Promise.all(
    staff.map((s) =>
      notifyItmsUser({
        idUser: s.idUser,
        type: "ticket.created",
        title: `New ticket ${ticket.number}`,
        body: ticket.title,
        href: `/itms/console/tickets/${ticket.idTicket}`,
      })
    )
  )
}

export async function notifyTicketAssigned(ticket: {
  idTicket: number
  number: string
  title: string
  idAssignee: number
}) {
  await notifyItmsUser({
    idUser: ticket.idAssignee,
    type: "ticket.assigned",
    title: `Assigned ${ticket.number}`,
    body: ticket.title,
    href: `/itms/console/tickets/${ticket.idTicket}`,
  })
}

export async function notifyTicketStatusForRequester(ticket: {
  idTicket: number
  number: string
  title: string
  status: string
  idRequester: number
}) {
  await notifyItmsUser({
    idUser: ticket.idRequester,
    type: "ticket.status",
    title: `${ticket.number} → ${ticket.status}`,
    body: ticket.title,
    href: `/itms/portal/tickets/${ticket.idTicket}`,
  })
}
