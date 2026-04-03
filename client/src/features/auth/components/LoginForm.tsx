'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const { login, isLoggingIn, loginError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: true,
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    login({ email: data.email, password: data.password });
  };

  return (
    <section className="_social_login_wrapper _layout_main_wrapper">
      <div className="_shape_one">
        <Image
          src="/assets/images/shape1.svg"
          alt=""
          width={300}
          height={300}
          className="_shape_img"
        />
        <Image
          src="/assets/images/dark_shape.svg"
          alt=""
          width={300}
          height={300}
          className="_dark_shape"
        />
      </div>
      <div className="_shape_two">
        <Image
          src="/assets/images/shape2.svg"
          alt=""
          width={300}
          height={300}
          className="_shape_img"
        />
        <Image
          src="/assets/images/dark_shape1.svg"
          alt=""
          width={300}
          height={300}
          className="_dark_shape _dark_shape_opacity"
        />
      </div>
      <div className="_shape_three">
        <Image
          src="/assets/images/shape3.svg"
          alt=""
          width={300}
          height={300}
          className="_shape_img"
        />
        <Image
          src="/assets/images/dark_shape2.svg"
          alt=""
          width={300}
          height={300}
          className="_dark_shape _dark_shape_opacity"
        />
      </div>
      <div className="_social_login_wrap">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              <div className="_social_login_left">
                <div className="_social_login_left_image">
                  <Image
                    src="/assets/images/login.png"
                    alt="Login"
                    width={633}
                    height={500}
                    className="_left_img"
                    priority
                  />
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className="_social_login_content">
                <div className="_social_login_left_logo _mar_b28">
                  <Image
                    src="/assets/images/logo.svg"
                    alt="Logo"
                    width={161}
                    height={40}
                    className="_left_logo"
                  />
                </div>
                <p className="_social_login_content_para _mar_b8">Welcome back</p>
                <h4 className="_social_login_content_title _titl4 _mar_b50">
                  Login to your account
                </h4>
                <button type="button" className="_social_login_content_btn _mar_b40">
                  <Image
                    src="/assets/images/google.svg"
                    alt="Google"
                    width={20}
                    height={20}
                    className="_google_img"
                  />{' '}
                  <span>Or sign-in with google</span>
                </button>
                <div className="_social_login_content_bottom_txt _mar_b40">
                  {' '}
                  <span>Or</span>
                </div>
                <form className="_social_login_form" onSubmit={handleSubmit(onSubmit)}>
                  <div className="row">
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_login_form_input _mar_b14">
                        <label className="_social_login_label _mar_b8">Email</label>
                        <input
                          type="email"
                          className={`form-control _social_login_input ${errors.email ? 'is-invalid' : ''}`}
                          {...register('email')}
                        />
                        {errors.email && (
                          <div className="invalid-feedback">{errors.email.message}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_login_form_input _mar_b14">
                        <label className="_social_login_label _mar_b8">Password</label>
                        <input
                          type="password"
                          className={`form-control _social_login_input ${errors.password ? 'is-invalid' : ''}`}
                          {...register('password')}
                        />
                        {errors.password && (
                          <div className="invalid-feedback">{errors.password.message}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {loginError && (
                    <div className="alert alert-danger p-2 mb-3" style={{ fontSize: '14px' }}>
                      {loginError instanceof Error ? loginError.message : 'Invalid credentials'}
                    </div>
                  )}

                  <div className="row">
                    <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
                      <div className="form-check _social_login_form_check">
                        <input
                          className="form-check-input _social_login_form_check_input"
                          type="radio"
                          name="flexRadioDefault"
                          id="flexRadioDefault2"
                          checked
                          readOnly
                        />
                        <label
                          className="form-check-label _social_login_form_check_label"
                          htmlFor="flexRadioDefault2"
                        >
                          Remember me
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
                      <div className="_social_login_form_left">
                        <p className="_social_login_form_left_para">Forgot password?</p>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
                      <div className="_social_login_form_btn _mar_t40 _mar_b60">
                        <button
                          type="submit"
                          className="_social_login_form_btn_link _btn1"
                          disabled={isLoggingIn}
                        >
                          {isLoggingIn ? 'Logging in...' : 'Login now'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
                <div className="row">
                  <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                    <div className="_social_login_bottom_txt">
                      <p className="_social_login_bottom_txt_para">
                        Dont have an account? <Link href="/register">Create New Account</Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
