import { exec } from 'child_process'
import { fakerFR as faker } from '@faker-js/faker'
import { format } from 'date-fns'
import type { Invoice, User } from './schema'
import { invoices, users } from './schema'
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

function prouctFaker(items = 10) {
  const invoices: Invoice[] = []

  let i = 0
  while (i < items) {
    invoices.push({
      number: faker.number.int({ min: 1, max: 999 }),
      date: format(faker.date.past(), 'yyyy-dd-MM').toString(),
      amount: faker.number.float({ min: 10, max: 100, precision: 0.001 }),
      paymentStatus: 'unpaid',
      paymentDate: format(faker.date.past(), 'yyyy-dd-MM').toString(),
      paymentType: 'cash',

      updatedAt: format(faker.date.past(), 'yyyy-dd-MM HH:mm:ss').toString(),
    },
    )
    i++
  }

  return invoices
}

console.log(prouctFaker())

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
    .values(prouctFaker())
    .onConflictDoNothing()
    .returning()

  console.log('invoices table is seeded 🎉️')
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
