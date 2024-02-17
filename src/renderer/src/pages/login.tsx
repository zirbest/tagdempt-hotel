import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/composables/auth'
import { AboutUs } from '~/components/AboutUs'

export default function Login() {
  const [, { logIn }] = useAuth()

  async function handleSubmit(e: any) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    logIn(data)
  }

  return (
    <section class="h-screen grid grid-rows-[auto,1fr] lg:grid-cols-[2fr_1fr]">
      <form onSubmit={handleSubmit} class="col-start-1">
        <Card class="p-8 max-w-lg border-none mx-auto mt-24">
          <CardHeader class="text-center">
            <CardTitle class="text-2xl">
              Connectez-vous en toute simplicité
            </CardTitle>
            <CardDescription>
              Accédez à votre compte en toute sécurité et facilité
            </CardDescription>
          </CardHeader>

          <CardContent class="flex flex-col gap-8 mt-4">
            <Input value="admin" name="username" type="text" placeholder="Nom d’étulistaeur" autofocus />
            <Input value="admin" name="password" type="password" placeholder="Mot de pass" />
          </CardContent>

          <CardFooter>
            <Button class="w-full"> Connexion </Button>
          </CardFooter>
        </Card>
      </form>

      <div
        class="hidden lg:grid row-span-2 place-content-center"
        style={{ 'background-image': 'radial-gradient( black 1px,white 1px )', 'background-size': '10px 10px' }}
      >
        <span class="text-9xl text-gray-50 blur-smg rotate-90">zirtech</span>
      </div>

      <CardDescription class="col-start-1 mt-auto pb-8 text-center">
        Votre expérience est optimisée par ZIRTECH | &nbsp;
        <AboutUs />
      </CardDescription>
    </section>
  )
}
