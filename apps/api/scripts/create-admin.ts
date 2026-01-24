import 'dotenv/config'
import { auth } from '../src/lib/auth'

function parseArgs(args: string[]): Record<string, string> {
  const result: Record<string, string> = {}
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const value = args[i + 1]
      if (value && !value.startsWith('--')) {
        result[key] = value
        i++
      }
    }
  }
  return result
}

function validateArgs(args: Record<string, string>): { email: string; password: string; name: string } {
  const email = args.email
  const password = args.password
  const name = args.name

  if (!email) {
    throw new Error('--email is required')
  }
  if (!password) {
    throw new Error('--password is required')
  }
  if (!name) {
    throw new Error('--name is required')
  }

  return { email, password, name }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  try {
    const { email, password, name } = validateArgs(args)

    console.log('Creating admin user...')
    console.log(`Email: ${email}`)
    console.log(`Name: ${name}`)

    const result = await auth.api.createUser({
      body: {
        email,
        password,
        name,
        role: 'admin',
      },
    })

    if (result.user) {
      console.log('✓ Admin user created successfully!')
      console.log(`  User ID: ${result.user.id}`)
      console.log(`  Email: ${result.user.email}`)
      console.log(`  Name: ${result.user.name}`)
      console.log(`  Role: ${result.user.role}`)
    } else {
      console.error('✗ Failed to create admin user')
      process.exit(1)
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`✗ Error: ${error.message}`)
    } else {
      console.error('✗ Unknown error occurred')
    }
    process.exit(1)
  }
}

main()
