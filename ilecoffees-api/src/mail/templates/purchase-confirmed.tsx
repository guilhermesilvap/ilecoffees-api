import {
  Html, Head, Body, Container, Heading, Text, Button, Hr, Section,
} from '@react-email/components'
import * as React from 'react'
import { NotificationRecipient, NotificationPayload } from '@/services/channels/notification-channel'

interface Props {
  recipient: NotificationRecipient
  payload: NotificationPayload
}

export function PurchaseConfirmedEmail({ recipient, payload }: Props) {
  const orderId = payload.data?.orderId as string | undefined

  return (
    <Html lang="pt-BR">
      <Head />
      <Body style={{ fontFamily: 'sans-serif', background: '#f5f5f5', margin: 0 }}>
        <Container style={{ maxWidth: 480, margin: '40px auto', background: '#ffffff', borderRadius: 8, overflow: 'hidden' }}>
          <Section style={{ background: '#3d2314', padding: '24px 32px' }}>
            <Heading style={{ color: '#ffffff', fontSize: 20, margin: 0 }}>ilecoffees</Heading>
          </Section>
          <Section style={{ padding: '32px' }}>
            <Heading style={{ fontSize: 22, color: '#1a1a1a', marginTop: 0 }}>
              Pagamento confirmado ✓
            </Heading>
            <Text style={{ color: '#444', lineHeight: 1.6 }}>
              Olá, <strong>{recipient.name}</strong>!
            </Text>
            <Text style={{ color: '#444', lineHeight: 1.6 }}>{payload.body}</Text>
            {orderId && (
              <Button
                href={`https://ilecoffees.com.br/orders/${orderId}`}
                style={{
                  background: '#3d2314',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: 6,
                  textDecoration: 'none',
                  display: 'inline-block',
                  marginTop: 8,
                }}
              >
                Ver pedido
              </Button>
            )}
            <Hr style={{ margin: '32px 0', borderColor: '#e5e5e5' }} />
            <Text style={{ color: '#888', fontSize: 12, margin: 0 }}>
              Você recebeu este e-mail porque realizou uma compra na ilecoffees.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
