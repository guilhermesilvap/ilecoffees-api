import { hash } from 'bcrypt'
import { AppError } from '@/utils/AppError'
import { Supplier } from '@/entities/supplier'
import { SuppliersRepository, CreateSupplierDTO } from '@/repositories/suppliers-repository'
import { UsersRepository } from '@/repositories/users-repository'
import { MailService } from '@/services/mail-service'

interface CreateSupplierInput extends Omit<CreateSupplierDTO, 'passwordHash'> {
  password: string
}

export class CreateSupplierUseCase {
  constructor(
    private suppliersRepository: SuppliersRepository,
    private usersRepository: UsersRepository,
    private mailService: MailService,
  ) {}

  async execute(input: CreateSupplierInput): Promise<Supplier> {
    const email = input.email.toLowerCase().trim()

    const emailTakenByUser = await this.usersRepository.existsByEmail(email)
    const emailTakenBySupplier = await this.suppliersRepository.existsByEmail(email)

    if (emailTakenByUser || emailTakenBySupplier) {
      throw new AppError('Já existe um usuário cadastrado com este e-mail')
    }

    const { password, ...rest } = input
    const passwordHash = await hash(password, 8)

    const supplier = await this.suppliersRepository.create({ ...rest, email, passwordHash })

    this.mailService.send({
      to: supplier.email,
      name: supplier.name,
      subject: 'Bem-vindo(a) à ilecoffees ☕',
      type: 'WELCOME',
    }).catch(() => {})

    return supplier
  }
}
