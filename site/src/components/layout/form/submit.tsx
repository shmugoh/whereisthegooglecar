import React, { useRef, useState } from "react";
import { TopText } from "../entry/topText";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import { type z } from "zod";
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
import { addDays, format } from "date-fns";
import { formSchema } from "~/utils/formSchema";

import { CalendarIcon } from "lucide-react";
import { IoCloudUploadOutline } from "react-icons/io5";

import { cn } from "~/lib/utils";
import Image from "next/image";
import { TurnstileWidget } from "~/components/turnstile-captcha";
import { api } from "~/utils/api";
import { computeSHA256 } from "~/utils/sha256";
import { env } from "~/env";
import SuccessPage from "./success";
import { SubmitButton } from "./button";
import { ErrorMessage } from "./error";
import { CustomCaption } from "../calendar";

export default function SubmitForm() {
  // POST
  const submitMutation = api.form.submitForm.useMutation({});
  const signedURLMutation = api.form.presign_s3.useMutation({});

  // image uploading
  const [blobImage, setBlobImage] = useState<string | undefined>();
  const [imageFile, setImageFile] = useState<File | undefined>();
  const inputElement = useRef<HTMLInputElement>(null);

  // loading & error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMesasge] = useState("Processing Form...");

  const [errorMessage, setErrorMessage] = useState<string | null>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // on submitting form
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (imageFile) {
      // disable button and remove error message
      setErrorMessage(null);
      setIsLoading(true);

      // grab values
      const {
        date,
        country,
        town,
        source,
        location,
        service,
        cf_turnstile_token,
      } = values;

      // get signed url
      setLoadingMesasge("Uploading Image...");
      const imageChecksum = await computeSHA256(imageFile);

      try {
        const signedURLResponse = await signedURLMutation.mutateAsync({
          fileSize: imageFile.size,
          fileType: imageFile.type,
          checksum: imageChecksum,
          cf_turnstile_token: cf_turnstile_token,
        });

        // if aws signs url
        if (signedURLResponse.message.url && signedURLResponse.message.key) {
          // upload image to s3
          await fetch(signedURLResponse.message.url, {
            method: "PUT",
            headers: {
              "Content-Type": imageFile.type,
            },
            body: imageFile,
          });

          // generate image url
          const imageUrl = `${env.NEXT_PUBLIC_CDN_URL}/${signedURLResponse.message.key}`;

          // submit webhook
          setLoadingMesasge("Submitting Form...");
          const webhook_response = await submitMutation.mutateAsync({
            date: date,
            country: country,
            town: town,
            source: source,
            location: location,
            service: service,
            image: imageUrl,
            cf_turnstile_token: cf_turnstile_token,
          });

          // set success page
          if (webhook_response.code == 200 || 201 || 204) {
            setIsSuccess(true);
          }
        }
      } catch (e) {
        setIsLoading(false);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        setErrorMessage(e.message as string);
      }
    }
  }

  /// on uploading image
  const onFileUpload = (file: File | undefined) => {
    // if preview still exists, revoke it
    if (blobImage) {
      URL.revokeObjectURL(blobImage);
    }
    // process image
    if (file) {
      // set file & blob url
      setImageFile(file);
      const blobUrl = URL.createObjectURL(file);
      setBlobImage(blobUrl);
      form.setValue("image", blobUrl);
    }
  };

  /// on clicking div
  const onClick = () => {
    if (inputElement.current) {
      inputElement.current.click();
    }
  };

  // form configuration
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // add captcha token to form
  // useEffect(() => {
  //   if (captchaToken) {
  //     form.setValue("cf_turnstile_token", captchaToken);
  //   }
  // }, [captchaToken]);

  if (isSuccess) {
    return (
      <div>
        <TopText title="Submission Form" />
        <SuccessPage />
      </div>
    );
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

          {/* Image */}
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <div
                  className="flex w-full items-center justify-center hover:cursor-pointer"
                  // onDrag={(Event) => console.log(0, Event)}
                  // onDragOver={(event) => console.log(1, event)}
                  onClick={onClick}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    onFileUpload(file);
                  }}
                >
                  <AspectRatio
                    className="mx-auto content-center rounded-md border border-dashed p-2"
                    ratio={21 / 7}
                  >
                    <Input
                      type="file"
                      id="file"
                      accept="image/png, image/jpeg"
                      className="hidden"
                      ref={inputElement}
                      onChange={(e) => onFileUpload(e.target.files?.[0])}
                    />
                    {blobImage === undefined ? (
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <IoCloudUploadOutline className="h-10 w-10 md:h-16 md:w-16" />
                        <p className="text-sm leading-7 md:text-base">
                          Drag an image here or click to upload.
                        </p>
                      </div>
                    ) : (
                      <Image
                        src={blobImage}
                        alt={"User Uploaded Image"}
                        fill
                        className="rounded-md object-contain"
                        style={{ zIndex: 1 }}
                        loading={"eager"}
                        unoptimized
                      />
                    )}
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

          <SubmitButton isLoading={isLoading} loadingMessage={loadingMessage} />

          <ErrorMessage errorMessage={errorMessage} />
        </form>
      </Form>

      {/* error message in case backend returns failure */}
    </div>
  );
}
