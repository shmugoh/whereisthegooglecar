import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { formSchema } from "../../../utils/formSchema";

import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { TurnstileWidget } from "~/components/turnstile-captcha";
import { api } from "~/utils/api";

type EditDialogProps = {
  size: "sm" | "lg";
  country?: string;
  town?: string;
  source?: string;
  location?: string;
  service?: string;
  date?: Date;
  id: string;
};

export default function EditDialog(props: EditDialogProps) {
  const editMutation = api.form.editForm.useMutation({});
  const [captchaToken, setCaptchaToken] = useState<string>();

  // form default settings
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: props.country,
      town: props.town,
      source: props.source,
      location: props.location,
      date: props.date,
      image: "https://whereisthegooglecar.com",
    },
  });

  // on submitting
  function onSubmit(values: z.infer<typeof formSchema>) {
    const {
      date,
      country,
      town,
      source,
      location,
      service,
      cf_turnstile_token,
    } = values;

    editMutation.mutate({
      date: date,
      country: country,
      town: town,
      source: source,
      location: location,
      service: service,
      cf_turnstile_token: cf_turnstile_token,
      id: props.id,
    });

    console.log(values);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <a className="text-lg font-medium text-primary underline underline-offset-4 hover:cursor-pointer hover:text-primary/80">
          Edit
        </a>
      </DialogTrigger>

      {/* Form */}
      <DialogContent className="max-w-[425px] lg:max-w-[800px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Header */}
            <DialogHeader>
              <DialogTitle>Edit Sighting</DialogTitle>
              <DialogDescription>
                If you believe the spotting data is incorrect, you can request
                to edit it using the form below. One of our contributors will
                review your request and make the necessary changes.
              </DialogDescription>
            </DialogHeader>

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Town */}
            <FormField
              control={form.control}
              name="town"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Town</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Country */}
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Service */}
            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Source URL */}
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormDescription>
                    Source of where the sighting was found. Could be either a
                    website link, social media post, or your name if you were
                    the one who spotted it.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormDescription>
                    Location of where the sighting was taken. Must be a website
                    link, preferrably a Google Maps link.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Footer */}
            <FormField
              control={form.control}
              name="cf_turnstile_token"
              render={({ field }) => (
                <FormItem>
                  <TurnstileWidget
                    setToken={(token) =>
                      form.setValue("cf_turnstile_token", token)
                    }
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
