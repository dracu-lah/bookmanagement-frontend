import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import routePath from "@/router/routePath";
import { LoginAPI } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, LoaderIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { Label } from "@/components/ui/label";
import useAuthStore from "@/store/useAuthStore";
import { isTesting } from "@/utils/constants";
const LoginPage = () => {
  const { setToken } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const defaultValues = {
    usernameOrEmail: isTesting ? "user321" : "",
    password: isTesting ? "securePassword123" : "",
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues,
  });
  const loginMutation = useMutation({
    mutationFn: LoginAPI,
    onSuccess: (data) => {
      setToken({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        data: {
          username: data.username,
          email: data.email,
        },
      });
      navigate(routePath.dashboard);
    },
    onError: ({ response }) => {
      setError("root.serverError", {
        type: response.status,
        message: response.data.message,
      });
    },
  });
  const onSubmit = ({ usernameOrEmail, password }) => {
    queryClient.invalidateQueries();

    setToken({
      accessToken: "randomtoken",
      refreshToken: "randomtoken",
      data: {
        userName: "User321",
        email: "User321@gmail.com",
      },
    });
    // loginMutation.mutate({
    //   username: usernameOrEmail,
    //   password,
    // });
  };
  return (
    <Card className="m-auto my-40 w-[350px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Username / Email</Label>
              <Input
                id="email"
                type="text"
                {...register("usernameOrEmail", { required: true })}
              />
              {errors.usernameOrEmail && (
                <span className="form-error">
                  {errors.usernameOrEmail.message}
                </span>
              )}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="framework">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="* * * * * *"
                  {...register("password", { required: true })}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="absolute right-0 top-0"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
                {errors.password && (
                  <span className="form-error">{errors.password.message}</span>
                )}
                {errors.root && (
                  <span className="form-error">
                    {errors.root.serverError.message}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full mt-4" type="submit">
            {loginMutation.isPending ? (
              <LoaderIcon className="animate-spin" />
            ) : (
              "Login"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginPage;
