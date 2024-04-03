import React from "react";
import { TopText } from "../entry/topText";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import { z } from "zod";
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
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { IoCloudUploadOutline } from "react-icons/io5";

const formSchema = z.object({
  country: z
    .string()
    .min(4, { message: "Country must be at least 4 characters" }),
  town: z.string().min(1, { message: "Town must at least have 1 character" }),
  source: z
    .string()
    .min(4, { message: "Source must be at least 4 characters" }),
  location: z.string().url().or(z.literal("")),
  date: z.date(),
  image: z.string(),
  service: z.string(),
});

export default function SubmitForm() {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // defaultValues: {
    //   country: "United States",
    //   town: "San Francisco",
    //   source: "https://twitter.com/peduarte/status/1442422346456527873",
    //   location: "https://www.google.com/maps?q=37.7749,-122.4194",
    //   date: new Date(),
    //   service: "Google",
    // },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <div className="space-y-4">
      <TopText title="Submission Form" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormLabel>
            If you saw a Street View car, whether it was parked or driving,
            whether it was recently or a long time ago, then feel free to
            contribute by submitting the sighting here. Our contributors will
            review the submission and add it to our database if it is valid.
          </FormLabel>

          {/* Date */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input placeholder="February 16, 2024" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image */}
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <div className="flex w-full items-center justify-center">
                  <AspectRatio
                    className="mx-auto content-center rounded-md border border-dashed p-2"
                    ratio={21 / 5}
                  >
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <IoCloudUploadOutline className="h-10 w-10 md:h-16 md:w-16" />
                      <p className="text-sm leading-7 md:text-base">
                        Drag an image here or click to upload.
                      </p>
                    </div>
                  </AspectRatio>
                </div>
                {/* <FormControl>
                  <Input placeholder="shadcn" {...field} />
                </FormControl> */}
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
                  <Input placeholder="San Jose, California, USA" {...field} />
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
                  <Input placeholder="United States" {...field} />
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
                    placeholder="https://twitter.com/aiaddict1/status/1758281981509640247"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Source of where the sighting was found. Could be either a
                  website link, social media post, or your name if you were the
                  one who spotted it.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://maps.app.goo.gl/5D5CK4LcDdmH9Fmr8"
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

          <FormField
            control={form.control}
            name="service"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service</FormLabel>
                <FormControl>
                  <Input placeholder="Google" {...field} />
                </FormControl>
                <FormDescription>
                  Service that the vehicle sighted associated with. Leave blank
                  if unknown.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Footer */}
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}
