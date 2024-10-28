"use client"

import * as z from "zod"
import axios from "axios"
import qs from "query-string"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { linkOwner, useModal } from "@/hooks/use-modal-store"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { uzCyrl } from "date-fns/locale"

// Define the form schema using Zod
export const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  owner: z.enum(["Divya", "Akshay"]), // Match the linkOwner enum
});

// Infer the form type from the schema
type FormSchemaType = z.infer<typeof formSchema>;

export const EditLinkModal = () => {
  const { isOpen, onClose, type, data } = useModal()
  const router = useRouter()


  const isModalOpen = isOpen && type === "editLink"
  const { owner } = data

  // Initialize the form with react-hook-form and Zod resolver
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
  });

  const { handleSubmit, setValue, formState: { errors, isSubmitting }, reset } = form;

  useEffect(() => {
    if (owner) {
      setValue("owner", owner)
    } else {
      setValue("owner", "Divya") // Default to "Divya" if no owner is provided
    }
  }, [owner, setValue]);

  const onSubmit = async (values: FormSchemaType) => {
    try {
      const url = qs.stringifyUrl({
        url: "/api/link",
        query: {},
      });
      // console.log(url)

      // Make the POST request with form values
      await axios.post(url, values);

      reset();
      router.refresh();
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleClose = () => {
    reset(); // Ensure the form is reset when modal is closed
    onClose();
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Update Meeting Link
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Paste the new link here
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Paste Link..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Link Owner
                    </FormLabel>
                    <Select
                      disabled={isSubmitting}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-zinc-300/50 border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0 capitalize outline-none">
                          <SelectValue placeholder="Select a link owner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(linkOwner).map((owner, index) => (
                          <SelectItem
                            key={index}
                            value={owner}
                            className="capitalize"
                          >
                            {owner.toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
