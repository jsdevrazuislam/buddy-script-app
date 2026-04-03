'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { useAuth } from '../hooks/useAuth';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    repeatPassword: z.string().min(6, 'Repeat password must be at least 6 characters'),
    agreeTerms: z.boolean().optional(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords don't match",
    path: ['repeatPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const { register: registerUser, isRegistering, registerError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      agreeTerms: true,
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
    });
  };

  return (
    <section className="_social_registration_wrapper _layout_main_wrapper">
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
      <div className="_social_registration_wrap">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              <div className="_social_registration_right">
                <div className="_social_registration_right_image">
                  <Image
                    src="/assets/images/registration.png"
                    alt="Registration"
                    width={633}
                    height={500}
                    priority
                  />
                </div>
                <div className="_social_registration_right_image_dark">
                  <Image
                    src="/assets/images/registration1.png"
                    alt="Registration Dark"
                    width={633}
                    height={500}
                  />
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className="_social_registration_content">
                <div className="_social_registration_right_logo _mar_b28">
                  <Image
                    src="/assets/images/logo.svg"
                    alt="Logo"
                    width={161}
                    height={40}
                    className="_right_logo"
                  />
                </div>
                <p className="_social_registration_content_para _mar_b8">Get Started Now</p>
                <h4 className="_social_registration_content_title _titl4 _mar_b50">Registration</h4>
                <button type="button" className="_social_registration_content_btn _mar_b40">
                  <Image
                    src="/assets/images/google.svg"
                    alt="Google"
                    width={20}
                    height={20}
                    className="_google_img"
                  />{' '}
                  <span>Register with google</span>
                </button>
                <div className="_social_registration_content_bottom_txt _mar_b40">
                  {' '}
                  <span>Or</span>
                </div>
                <form className="_social_registration_form" onSubmit={handleSubmit(onSubmit)}>
                  <div className="row">
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">First Name</label>
                        <input
                          type="text"
                          className={`form-control _social_registration_input ${errors.firstName ? 'is-invalid' : ''}`}
                          {...register('firstName')}
                        />
                        {errors.firstName && (
                          <div className="invalid-feedback">{errors.firstName.message}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">Last Name</label>
                        <input
                          type="text"
                          className={`form-control _social_registration_input ${errors.lastName ? 'is-invalid' : ''}`}
                          {...register('lastName')}
                        />
                        {errors.lastName && (
                          <div className="invalid-feedback">{errors.lastName.message}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">Email</label>
                        <input
                          type="email"
                          className={`form-control _social_registration_input ${errors.email ? 'is-invalid' : ''}`}
                          {...register('email')}
                        />
                        {errors.email && (
                          <div className="invalid-feedback">{errors.email.message}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">Password</label>
                        <input
                          type="password"
                          className={`form-control _social_registration_input ${errors.password ? 'is-invalid' : ''}`}
                          {...register('password')}
                        />
                        {errors.password && (
                          <div className="invalid-feedback">{errors.password.message}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">
                          Repeat Password
                        </label>
                        <input
                          type="password"
                          className={`form-control _social_registration_input ${errors.repeatPassword ? 'is-invalid' : ''}`}
                          {...register('repeatPassword')}
                        />
                        {errors.repeatPassword && (
                          <div className="invalid-feedback">{errors.repeatPassword.message}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {registerError && (
                    <div className="alert alert-danger p-2 mb-3" style={{ fontSize: '14px' }}>
                      {registerError instanceof Error
                        ? registerError.message
                        : 'Registration failed'}
                    </div>
                  )}

                  <div className="row">
                    <div className="col-lg-12 col-xl-12 col-md-12 col-sm-12">
                      <div className="form-check _social_registration_form_check">
                        <input
                          className="form-check-input _social_registration_form_check_input"
                          type="radio"
                          name="flexRadioDefault"
                          id="flexRadioDefault2"
                          checked
                          readOnly
                        />
                        <label
                          className="form-check-label _social_registration_form_check_label"
                          htmlFor="flexRadioDefault2"
                        >
                          I agree to terms & conditions
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
                      <div className="_social_registration_form_btn _mar_t40 _mar_b60">
                        <button
                          type="submit"
                          className="_social_registration_form_btn_link _btn1"
                          disabled={isRegistering}
                        >
                          {isRegistering ? 'Registering...' : 'Register now'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
                <div className="row">
                  <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                    <div className="_social_registration_bottom_txt">
                      <p className="_social_registration_bottom_txt_para">
                        Already have an account? <Link href="/login">Login Now</Link>
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
