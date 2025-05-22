"use client";

import { SignUpSchema } from "@/lib/schema";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState, useTransition } from "react";
import Authcard from "./authcard";
import axios from "axios";
import FormError from "./formError";
import FormSuccess from "./formSuccess";

function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof SignUpSchema>) {
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        const response = await axios.post("/api/signup", values);
        return response.data;
      } catch (error: any) {
        return {
          error: error.response?.data?.error || "Something went wrong",
        };
      }
    });
  }

  return (
    <Authcard
      header='Create an account'
      footerlink='/signin'
      footertext='Sign In'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder='John Doe'
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder='you@example.com'
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder='••••••'
                      {...field}
                      disabled={isPending}
                    />
                    <FormError message={error} />
                    <FormSuccess message={success} />

                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent'
                      onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <EyeOff className='h-4 w-4' />
                      ) : (
                        <Eye className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit' disabled={isPending} className='w-full'>
            Sign up
          </Button>
        </form>
      </Form>
    </Authcard>
  );
}

export default SignupForm;
