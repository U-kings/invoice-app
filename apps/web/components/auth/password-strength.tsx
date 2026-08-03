"use client";

interface Props {
  password: string;
}

export function PasswordStrength({
  password,
}: Props) {
  const strength =
    password.length < 1
      ? 0
      :password.length < 3
      ? 10
      : password.length < 6
      ? 25
      : password.length < 8
      ? 50
      : password.match(/[A-Z]/) &&
        password.match(/[0-9]/)
      ? 100
      : 75;
  // const strength =
  //   password.length < 3
  //     ? 10
  //     : password.length < 6
  //     ? 25
  //     : password.length < 8
  //     ? 50
  //     : password.match(/[A-Z]/) &&
  //       password.match(/[0-9]/)
  //     ? 100
  //     : 75;

  return (
    <div className="mt-3">
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          style={{
            width: `${strength}%`,
          }}
          className="h-full rounded-full bg-[#2EAFB4] transition-all"
        />
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Password Strength
      </p>
    </div>
  );
}