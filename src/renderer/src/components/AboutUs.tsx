import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'

export function AboutUs(props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger class="text-bold">
        { props.children || 'à propos de nous' }
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>ZirTech</AlertDialogTitle>
        <AlertDialogDescription class="text-justify">
          We bring your ideas to life across mobile, desktop, and web. Our expert team builds custom apps that streamline your workflow and boost your productivity. Get in touch today to unlock your digital potential.
          <div class="mt-8">
            <span class="mr-2">For More Information Contact us</span>
            <a href="mailto:zirbst@gmail.com" class="font-bold mt-2">
              zirbst@gmail.com
            </a>
          </div>
        </AlertDialogDescription>
      </AlertDialogContent>
    </AlertDialog>
  )
}
