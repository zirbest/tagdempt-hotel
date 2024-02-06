import { exec } from 'child_process'
import { fakerFR as faker } from '@faker-js/faker'
import { format } from 'date-fns'
import type { Invoice, Service, User } from '../lib/types'
import { invoices, services, users } from './schema'
import { db } from '.'

function userFaker() {
  return [
    {
      username: 'admin',
      password: 'admin',
      role: 'admin',
    },
    {
      username: 'user',
      password: 'user',
      role: 'user',
    },
  ] as User[]
}

function invoiceFaker(items = 10) {
  const invoices: Invoice[] = []

  let i = 0
  while (i < items) {
    invoices.push({
      number: faker.number.int({ min: 1, max: 999 }),
      organization: faker.company.catchPhraseDescriptor(),
      date: format(faker.date.past(), 'yyyy-dd-MM').toString(),
      amount: faker.number.float({ min: 10, max: 100, precision: 0.001 }),
      paymentStatus: 'unpaid',
      paymentDate: format(faker.date.past(), 'yyyy-MM-dd').toString(),
      paymentType: 'cash',

      updatedAt: format(faker.date.past(), 'yyyy-MM-dd HH:mm:ss').toString(),
    },
    )
    i++
  }

  return invoices
}

function serviceFaker(items = 4) {
  const services: Service[] = []

  let i = 0
  while (i < items) {
    services.push({
      name: faker.word.sample(),
      label: faker.word.sample(),
      description: faker.word.words(),

      updatedAt: format(faker.date.past(), 'yyyy-MM-dd HH:mm:ss').toString(),
    })
    i++
  }

  return services
}

console.log(invoiceFaker())

async function seeds() {
  beforSeed()

  await db
    .insert(users)
    .values(userFaker())
    .onConflictDoNothing()
    .returning()

  console.log('users table is seeded 🎉️')

  await db
    .insert(invoices)
    .values(invoiceFaker())
    .onConflictDoNothing()
    .returning()

  console.log('invoices table is seeded 🎉️')

  await db
    .insert(services)
    .values(serviceFaker())
    .onConflictDoNothing()
    .returning()

  console.log('services table is seeded 🎉️')
}
seeds()

function beforSeed() {
  exec('nr db:push', (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`)
      return
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`)
      return
    }
    console.log(`stdout: ${stdout}`)
  })
}
