"use client";
import { useForm } from "react-hook-form";
import { CardContent } from "../ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { newPasswordSchema } from "@/lib/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

import { Button } from "../ui/button";

import Authcard from "@/components/auth/authcard";

import { Suspense, useState, useTransition } from "react";

import FormSuccess from "@/components/auth/formSuccess";

import { useRouter, useSearchParams } from "next/navigation";
import FormError from "@/components/auth/formError";
import axios from "axios";

function ResetPasswordFormContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof newPasswordSchema>>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  // Handle token validation
  if (!token) {
    return (
      <Authcard
        header='Reset Your Password'
        footertext='Login'
        footerlink='/signin'>
        <CardContent>
          <FormError message='Token not found' />
        </CardContent>
      </Authcard>
    );
  }

  function onSubmit(values: z.infer<typeof newPasswordSchema>) {
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        const response = await axios.post("/api/reset-password", {
          values,
          token,
        });

        if (response.data?.success) {
          setSuccess("Password reset successfully!");
          router.push("/signin");
        }

        if (response.data?.error) {
          setError(response.data.error);
        }
      } catch (error) {
        // @ts-expect-error response from backend
        setError(error.response.data.error);
      }
    });
  }

  return (
    <Authcard
      header='Reset Your Password'
      footertext='Login'
      footerlink='/signin'>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='*******'
                        className='border-black focus:border-2'
                        disabled={isPending}
                        type='password'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormError message={error} />
            <FormSuccess message={success} />

            <Button
              type='submit'
              className='w-full bg-black'
              disabled={isPending}>
              {isPending ? (
                <svg
                  className='animate-spin h-5 w-5 mr-3 text-white'
                  viewBox='0 0 24 24'>
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                    fill='none'
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </svg>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Authcard>
  );
}

function ResetPasswordForm() {
  return (
    <Suspense
      fallback={
        <Authcard
          header='Reset Your Password'
          footertext='Login'
          footerlink='/signin'>
          <CardContent>
            <div className='flex justify-center items-center py-8'>
              <svg
                className='animate-spin h-8 w-8 text-gray-600'
                viewBox='0 0 24 24'>
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                  fill='none'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
              </svg>
            </div>
          </CardContent>
        </Authcard>
      }>
      <ResetPasswordFormContent />
    </Suspense>
  );
}

export default ResetPasswordForm;