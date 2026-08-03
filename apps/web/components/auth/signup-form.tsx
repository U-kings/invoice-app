"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  SignupSchema,
  type SignupValues,
} from "@/lib/validations/auth";

import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";

import { Checkbox } from "@workspace/ui/components/checkbox";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { toast } from "@workspace/ui/components/toast";

import { AuthBrand } from "./auth-brand";
import { Divider } from "./divider";
import { PasswordInput } from "./password-input";
import { PasswordStrength } from "./password-strength";
import { SocialLogin } from "./social-login";
import { TrustBadge } from "./trust-badge";
import { AuthLoader } from "./auth-loader";

export function SignupForm() {

const router = useRouter();

const form = useForm<SignupValues>({
  resolver: zodResolver(SignupSchema),
  defaultValues: {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  },
});

const password = useWatch({
  control: form.control,
  name: "password",
});
const terms = useWatch({
  control: form.control,
  name: "terms",
});

const onSubmit = async (values: SignupValues) => {
  try {
    await new Promise((resolve) =>
      setTimeout(resolve, 2000)
    );

    toast.add({
      title: "Account created",
      description:
        "Please verify your email address.",
    });

    router.push("/verify-email");
  } catch {
    toast.add({
      title: "Something went wrong",
      description:
        "Unable to create your account.",
    });
  }
};


return ( 

    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
    >

        <AuthBrand
  title="Create your account"
  subtitle="Start sending professional invoices in minutes."
/>

<SocialLogin />


<Divider />


<FieldGroup className="grid gap-4 md:grid-cols-1">
  <Field>
    <FieldLabel>First Name</FieldLabel>

    <FieldContent>
      <Input {...form.register("firstName")} />

      <FieldError>
        {form.formState.errors.firstName?.message}
      </FieldError>
    </FieldContent>
  </Field>

  <Field>
    <FieldLabel>Last Name</FieldLabel>

    <FieldContent>
      <Input {...form.register("lastName")} />

      <FieldError>
        {form.formState.errors.lastName?.message}
      </FieldError>
    </FieldContent>
  </Field>

  <Field>
  <FieldLabel>Email</FieldLabel>

  <FieldContent>
    <Input
      type="email"
      {...form.register("email")}
    />

    <FieldError>
      {form.formState.errors.email?.message}
    </FieldError>
  </FieldContent>
</Field>

<Field>
  <FieldLabel>Password</FieldLabel>

  <FieldContent>
    <PasswordInput
      {...form.register("password")}
    />

    <PasswordStrength
      password={password ?? ""}
    />

    <FieldError>
      {form.formState.errors.password?.message}
    </FieldError>
  </FieldContent>
</Field>
<Field>
  <FieldLabel>Confirm Password</FieldLabel>

  <FieldContent>
    <PasswordInput
      {...form.register("confirmPassword")}
    />

    <FieldError>
      {form.formState.errors.confirmPassword?.message}
    </FieldError>
  </FieldContent>
</Field>

<div className="flex items-start gap-3">
  <Checkbox
    checked={terms ?? false}
    onCheckedChange={(checked: boolean) =>
      form.setValue("terms", checked === true)
    }
  />

  <p className="text-sm text-muted-foreground">
    I agree to the{" "}
    <Link
      href="/terms"
      className="text-[#2EAFB4]"
    >
      Terms of Service
    </Link>{" "}
    and{" "}
    <Link
      href="/privacy"
      className="text-[#2EAFB4]"
    >
      Privacy Policy
    </Link>
  </p>
</div>

<FieldError>
  {form.formState.errors.terms?.message}
</FieldError>


<Button
  type="submit"
  disabled={form.formState.isSubmitting}
  className="h-12 w-full bg-[#2EAFB4] hover:bg-[#289ca0]"
>
  {form.formState.isSubmitting && (
    <AuthLoader />
  )}

  Create Account
</Button>

<p className="text-center text-sm text-muted-foreground">
  Already have an account?{" "}
  <Link
    href="/login"
    className="font-semibold text-[#2EAFB4]"
  >
    Login
  </Link>
</p>


</FieldGroup>

<TrustBadge />



     </motion.div>
 );
}