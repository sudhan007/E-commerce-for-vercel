/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
// import axios from "axios";
import { _axios } from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "./ui/button";

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
  onLoginSuccess?: (token: string, user: any) => void;
};


const LoginModal: React.FC<LoginModalProps> = ({ open, onClose, onLoginSuccess }) => {

  const queryClient = useQueryClient()
  const [phone, setPhone] = useState("");
  const [checked, setChecked] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpId, setOtpId] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const otpRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
  // Reset on open/close
  useEffect(() => {
    if (open) {
      setPhone("");
      setChecked(false);
      setIsOtpStep(false);
      setOtp(["", "", "", "", "", ""]);
      setOtpId(null);
      setResendCountdown(0);
      setError("");
      setLoading(false);
    }
  }, [open]);

  // Countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Auto-focus OTP input
  useEffect(() => {
    if (isOtpStep && otpRefs.current[0]) {
      otpRefs.current[0]?.focus();
    }
  }, [isOtpStep]);

  const handleGetOtp = async () => {
    if (phone.length !== 10) return;

    // setLoading(true);
    setError("");

    try {
      const res = await _axios.post(`/user/userauth/send-otp`, {
        mobile: phone,
      });

      if (res.data.status) {
        setOtpId(res.data.otpId || res.data.data?.otpId);
        setIsOtpStep(true);
        setResendCountdown(30); // 30 seconds
        toast.success("OTP sent successfully!");
      } else {
        setError(res.data.message || "Failed to send OTP");
        toast.error(res.data.message || "Failed to send OTP");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Network error. Try again.");
      toast.error(err.response?.data?.message || "Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6 || !otpId) return;

    setLoading(true);
    setError("");

    try {
      const res = await _axios.post(`/user/userauth/verify-otp`, {
        otpId,
        otpNo: otpCode,
      });

      if (res.data.status) {
        await handleLogin();
      } else {
        setError(res.data.message || "Invalid OTP");
        toast.error(res.data.message || "Invalid OTP");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await _axios.post(`/user/userauth/login`, {
        mobile: phone,
        referCode: "",
      });

      if (res.data.status) {
        const { token, userDetails } = res.data.data;
        queryClient.invalidateQueries({ queryKey: ['session'] })
        // Store in sessionStorage
        sessionStorage.setItem("authToken", token);
        sessionStorage.setItem("user", JSON.stringify(userDetails));

        toast.success("Login successful!");

        // Callback
        onLoginSuccess?.(token, userDetails);

        // Close modal after delay
        setTimeout(() => {
          handleClose();
        }, 800);
      } else {
        setError(res.data.message || "Login failed");
        toast.error(res.data.message || "Login failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
      queryClient.invalidateQueries({ queryKey: ['session'] })
    }
  };

  const handleOtpChange = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);

    // Auto-focus next
    if (val && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleResendOtp = () => {
    if (resendCountdown > 0) return;
    handleGetOtp();
  };

  const handleEditPhone = () => {
    setIsOtpStep(false);
    setOtp(["", "", "", "", "", ""]);
    setOtpId(null);
    setError("");
  };

  const handleClose = () => {
    setIsOtpStep(false);
    setOtp(["", "", "", "", "", ""]);
    setResendCountdown(0);
    setError("");
    onClose();
  };




  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div  className="bg-white w-full h-dvh  max-w-5xl md:h-[600px] overflow-hidden shadow-2xl flex relative">
        {/* Left Image */}
        <div className="hidden md:block md:w-[40%] h-full bg-[#223222]">
          <img
            src='/login-image.png'
            alt="login visual"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Form */}
        <div className="flex-1 flex flex-col items-center  md:px-8 py-5 relative">
{/* Close Button – Fixed for mobile */}
<button
  className="absolute z-10 text-2xl text-gray-600 hover:text-gray-800
             right-4 top-4
             md:top-6 md:right-6"
  onClick={handleClose}
>
  <FiX className="w-7 h-7 md:w-8 md:h-8" />
</button>


          {!isOtpStep ? (
            <div className="w-full p-3 flex flex-col gap-2">
              <img src='/logo.png' alt="Logo" className=" mb-10 mx-auto" />
              <h2 className="text-[22px] text-[#1F1F1F]  text-center font-sans font-bold">
                LOGIN / SIGNUP
              </h2>
              <p className="text-[#828999] font-normal font-sans md:text-[20px] text-base mb-7 text-center">
                Join now for seamless shopping experience
              </p>

              <label className="text-sm md:text-[18px] font-medium">Phone Number</label>
              <div className="flex bg-white border border-[#828999] h-12 md:h-[56px] shadow px-4 rounded-[6px]  md:rounded-[8px] overflow-hidden items-center">
                <img src="/design-icons/flag.svg" alt="" className=" border-r-[#828999] border-r md:border-r-2 pr-2.5 py-1" />
                <input
                  type="tel"
                  className="flex-1 outline-none px-2 py-2 text-[#000000] font-sans text-sm md:text-[16px] placeholder:text-[#828999] placeholder:text-[16px] font-normal"
                  placeholder="Enter 10 digit phone number"
                  maxLength={10}
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                  disabled={loading}
                />
              </div>

              <label className="flex items-center gap-2 mt-2 text-xs">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={e => setChecked(e.target.checked)}
                  className="rounded border-gray-300 cursor-pointer"
                  disabled={loading}
                />
                <span className="text-[#828999]">I agree a</span>
                
                <a href="#" className=" text-primary font-medium font-sans text-[12px]">
                  Terms of Use and Privacy Policy.
                </a>
              </label>

              <button
                className="mt-3 bg-[#0E3051] hover:bg-[#183B56] text-white font-semibold py-2 rounded transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!checked || phone.length !== 10 || loading}
                onClick={handleGetOtp}
              >
                {loading ? "Sending..." : "GET OTP"}
              </button>

<div className="absolute bottom-8 md:static left-0 right-0 mx-6 md:mx-0">
                <div className="mt-4 flex items-center gap-2 mb-5 ">
                <span className="flex-1 h-px bg-gray-200"></span>
                <span className="text-sm text-[#1F1F1F] font-sans">Or</span>
                <span className="flex-1 h-px bg-gray-200"></span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-1">
                <button className="w-full cursor-pointer flex items-center h-[50px] rounded-[6px] md:rounded-[8px] justify-center border border-gray-300 px-4 py-2 rounded bg-white hover:bg-gray-50 gap-2 text-sm">
                  <img src='/Google.png' className="w-5 h-5" alt="Google" />
                  Continue With Google
                </button>
                <button className="w-full cursor-pointer flex items-center h-[50px] rounded-[6px] md:rounded-[8px] justify-center border border-gray-300 px-4 py-2 rounded bg-white hover:bg-gray-50 gap-2 text-sm">
                  <img src='/Apple.png' className="w-5 h-5" alt="Apple" />
                  Continue With Apple
                </button>
              </div>
</div>
            </div>
          ) : (
            <div className="w-full  flex flex-col items-center">
              <img
                src='/logo.png'
                alt="Zudio Logo"
                className=" mt-8 "
              />
              <h3 className="font-bold text-lg sm:text-xl mb-1 text-center mt-10 ">OTP VERIFICATION</h3>
              <p className="mb-3 text-[#828999] text-center text-sm flex flex-col mt-3 ">
                +91 {phone}{" "}
                <span
                  onClick={handleEditPhone}
                  className="flex text-sm cursor-pointer text-[#0E3051] mt-5 gap-2"
                >
                <img src="/design-icons/edit-pencil.svg" alt="" className="" />  Edit Phone Number
                </span>
              </p>

            <div className="flex gap-2 mb-4 justify-center mt-5 ">
  {otp.map((digit, idx) => (
    <input
      key={idx}
      ref={el => {
        otpRefs.current[idx] = el;
      }}
      type="text"
      maxLength={1}
      value={digit}
      onChange={e => handleOtpChange(e.target.value, idx)}
      onKeyDown={e => handleOtpKeyDown(e, idx)}
      className="w-12 h-12 text-center border border-gray-300 rounded focus:border-[#0E3051] focus:outline-none text-xl font-medium"
      disabled={loading}
    />
  ))}
</div>

              <p className="text-sm text-gray-400 mb-4 text-center mt-5 flex gap-2">
               <img src="/design-icons/refresh.svg" alt="" className="" /> <button
  type="button"
  onClick={handleResendOtp}
  disabled={resendCountdown > 0}
  className={`
    bg-transparent border-none text-[#828999] font-normal cursor-pointer
    disabled:text-gray-400 disabled:cursor-not-allowed
     focus:outline-none transition-colors text-sm md:text-[18px]
  `}
>
  Resend OTP {resendCountdown > 0 ? `in` : ``}
  {resendCountdown > 0 ?  <span className="font-normal text-primary ml-2">{resendCountdown}s</span> : ''}
</button> {" "}

              </p>

              <button
                className="md:w-full mt-8  w-[90%] bg-[#0E3051] hover:bg-[#183B56] text-white font-semibold py-2 rounded text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleVerifyOtp}
                disabled={otp.join("").length !== 6 || loading}
              >
                {loading ? "Verifying..." : "SUBMIT"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;