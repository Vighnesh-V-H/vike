"use client";

import { SignInSchema } from "@/lib/schema";
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
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import Authcard from "./authcard";
import axios from "axios";
import { useRouter } from "next/navigation";
import FormSuccess from "./formSuccess";
import FormError from "./formError";

function SigninForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof SignInSchema>) {
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        const response = await axios.post("/api/signin", values);
        console.log(response.data);
        if (response.status === 200) {
          router.push("/integrations");
        }

        if (response.data.error) {
          setError(response.data.error);
        }

        return response.data;
      } catch (error) {
        // @ts-expect-error error comes from backend
        setError(error.response?.data?.error);
      }
    });
  }

  return (
    <Authcard
      header='Sign-In'
      footertext='Forgot password'
      footerlink='/forgot-password'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    type='email'
                    className='dark:bg-black bg-white dark:text-white text-black focus:dark:bg-black focus:bg-white active:dark:bg-black active:bg-white'
                    placeholder='you@example.com'
                    {...field}
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
                  <div className=' dark:bg-black bg-white dark:text-white text-black relative'>
                    <Input
                      disabled={isPending}
                      className='dark:bg-black bg-white dark:text-white text-black focus:dark:bg-black focus:bg-white active:dark:bg-black active:bg-white'
                      type={showPassword ? "text" : "password"}
                      placeholder='••••••'
                      {...field}
                    />
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
          <FormSuccess message={success} />
          <FormError message={error} />
          <Button
            type='submit'
            disabled={isPending}
            className='cursor-pointer w-full'>
            Sign in
          </Button>
        </form>
      </Form>
    </Authcard>
  );
}

export default SigninForm;
