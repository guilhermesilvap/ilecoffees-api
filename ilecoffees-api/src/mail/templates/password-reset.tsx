import { Html, Head, Body, Container, Heading, Text, Button, Hr, Section } from '@react-email/components'
import * as React from 'react'
import { NotificationRecipient, NotificationPayload } from '@/services/channels/notification-channel'

interface Props {
  recipient: NotificationRecipient
  payload: NotificationPayload
}

export function PasswordResetEmail({ recipient, payload }: Props) {
  const resetUrl = payload.data?.resetUrl as string | undefined

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
              Redefinição de senha
            </Heading>
            <Text style={{ color: '#444', lineHeight: 1.6 }}>
              Olá, <strong>{recipient.name.split(' ')[0]}</strong>! Recebemos uma solicitação para
              redefinir a senha da sua conta.
            </Text>
            <Text style={{ color: '#444', lineHeight: 1.6 }}>
              Clique no botão abaixo para criar uma nova senha. Este link é válido por <strong>1 hora</strong>.
            </Text>
            {resetUrl && (
              <Button
                href={resetUrl}
                style={{
                  background: '#3d2314', color: '#ffffff',
                  padding: '12px 24px', borderRadius: 6,
                  textDecoration: 'none', display: 'inline-block', marginTop: 8,
                }}
              >
                Redefinir senha
              </Button>
            )}
            <Hr style={{ margin: '32px 0', borderColor: '#e5e5e5' }} />
            <Text style={{ color: '#888', fontSize: 12, margin: 0 }}>
              Se você não solicitou a redefinição de senha, ignore este e-mail. Sua senha permanece a mesma.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
