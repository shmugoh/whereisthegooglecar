import { useEffect, useState } from "react";

import { useToast } from "~/components/ui/use-toast";

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
import { addDays, format } from "date-fns";
import { CalendarIcon, PencilIcon, PencilLineIcon } from "lucide-react";

import { TurnstileWidget } from "~/components/turnstile-captcha";
import { api } from "~/utils/api";
import { SubmitButton } from "./button";
import { ErrorMessage } from "./error";
import { SUCCESS_DESCRIPTION, SUCCESS_TITLE } from "./success";
import { CustomCaption } from "../calendar";
import { ScrollArea } from "~/components/ui/scroll-area";

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
  const { toast } = useToast();

  const editMutation = api.form.editForm.useMutation({});

  // loading & error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMesasge] = useState("Processing Form...");
  const [errorMessage, setErrorMessage] = useState<string | null>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const [open, setOpen] = useState(false);

  // form default settings
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: props.country,
      town: props.town,
      source: props.source,
      location: props.location,
      date: props.date,
      service: props.service,
      image: "https://whereisthegooglecar.com",
      id: props.id,
    },
  });

  // on submitting
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const {
      date,
      country,
      town,
      source,
      location,
      service,
      cf_turnstile_token,
      id,
      image,
    } = values;

    try {
      // make call
      const webhook_response = await editMutation.mutateAsync({
        date: date,
        country: country,
        town: town,
        source: source,
        location: location,
        service: service,
        cf_turnstile_token: cf_turnstile_token,
        id: id,
        image: image,
      });

      // set success page
      if (webhook_response.code == 200 || 201 || 204) {
        setIsSuccess(true);
        setOpen(false);
        setLoadingMesasge("Submit");
        toast({ title: SUCCESS_TITLE, description: SUCCESS_DESCRIPTION });
      }
    } catch (e) {
      setIsLoading(false);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      setErrorMessage(e.message as string);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <a className="text-color-red hover:cursor-pointer hover:text-primary/80">
          <PencilLineIcon className="h-full" />
        </a>
      </DialogTrigger>

      {/* Form */}
      <DialogContent className="max-h-[500px] max-w-[425px] overflow-y-auto lg:max-h-full lg:max-w-[800px]">
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
                  <Popover modal={true}>
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
                        numberOfMonths={1}
                        fromYear={2006}
                        toDate={addDays(new Date(), 0)}
                        components={{ Caption: CustomCaption }}
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
                    <Input
                      placeholder={props.town ?? "San Jose, California, USA"}
                      {...field}
                    />
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
                    <Input
                      placeholder={props.country ?? "United States"}
                      {...field}
                    />
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
                    <Input placeholder={props.service ?? "Google"} {...field} />
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
                    <Input
                      placeholder={
                        props.source ??
                        "https://twitter.com/aiaddict1/status/1758281981509640247"
                      }
                      {...field}
                    />
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
                    <Input
                      placeholder={
                        props.location ??
                        "https://maps.app.goo.gl/5D5CK4LcDdmH9Fmr8"
                      }
                      {...field}
                    />
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
              <SubmitButton
                isLoading={isLoading}
                loadingMessage={loadingMessage}
              />
              <ErrorMessage errorMessage={errorMessage} />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
