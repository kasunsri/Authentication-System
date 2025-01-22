import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const ResetPassword = () => {

  const {backendUrl} = useContext(AppContent)
  axios.defaults.withCredentials = true

  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isEmailSent, setIsEmailSent] = useState('')
  const [otp, setOtp] = useState(0)
  const [isOtpSubmited, SetIsOtpSubmited] = useState(false)

  const inputRef = React.useRef([])
  
    const handleInput = (e, index) => {
      if(e.target.value.length > 0 && index < inputRef.current.length - 1){
        inputRef.current[index + 1].focus();
      }
    }
  
    const handleKeyDown = (e, index) => {
      if(e.key === 'Backspace' && e.target.value === '' && index > 0){
        inputRef.current[index - 1].focus();
      }
    }
  
  
    const handlePast = (e) => {
      const paste = e.clipboardData.getData('text');
      const pasteArray = paste.split('');
      pasteArray.forEach((char, index) => {
        if(inputRef.current[index]){
          inputRef.current[index].value = char;
        }
      })
    }

    const onSubmitEmail = async (e)=>{
      e.preventDefault();
      try {
        const {data} = await axios.post(backendUrl + '/api/auth/send-reset-otp', {email})
        data.success ? toast.success(data.message) : toast.error(data.message)
        data.success &&  setIsEmailSent(true)
      } catch (error) {
        toast.error(error.message)
      }
    }

    const onSubmitOTP = async (e)=>{
      e.preventDefault();
      const otpArray = inputRef.current.map(e => e.value)
      setOtp(otpArray.join(''))
      SetIsOtpSubmited(true)
    }

    const onSubmitNewPassword = async (e) =>{
      e.preventDefault();
      try {
        const {data} = await axios.post(backendUrl + '/api/auth/reset-password', {email, otp, newPassword})
        data.success ? toast.success(data.message) : toast.error(data.message)
        data.success && navigate('/login')
      } catch (error) {
        toast.error(error.message)
      }
    }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-red-500 to bg-purple-800'>
      {/*<img onClick={()=>navigate('/')} src={assets.logo} alt="" className='absolute left-5 sm:left-20 top-5 w-8 sm:w-32 cursor-pointer' />*/}


      {/*enter email Id */}

      {!isEmailSent && (
  <form onSubmit={onSubmitEmail} className="bg-blue-900 p-8 rounded-lg shadow-lg w-96 text-sm">
    <h1 className="text-white text-2xl font-semibold text-center mb-4">Reset Password</h1>
    <p className="text-center mb-6 text-indigo-300">Enter your registered email address</p>
    <div className="mb-4 flex items-center border border-gray-50 gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
      <img src={assets.mail_icon} alt="" className="w-3 h-3" />
      <input
        type="email"
        placeholder="Email id"
        className="bg-transparent outline-none text-white"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
    </div>
    <button className="w-full py-2.5 bg-gradient-to-r from-indigo-900 to-indigo-900 border border-gray-600 text-white rounded-full mt-3">
      Submit
    </button>
  </form>
)}

{isEmailSent && !isOtpSubmited && (
  <form onSubmit={onSubmitOTP} className="bg-blue-900 p-8 rounded-lg shadow-lg w-96 text-sm">
    <h1 className="text-white text-2xl font-semibold text-center mb-4">Resend Password OTP</h1>
    <p className="text-center mb-6 text-indigo-300">Enter the 6 digit code sent to your email</p>
    <div className="flex justify-between mb-8 border border-gray-50" onPaste={handlePast}>
      {Array(6)
        .fill(0)
        .map((_, index) => (
          <input
            type="text"
            maxLength="1"
            key={index}
            required
            className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
            ref={(e) => (inputRef.current[index] = e)}
            onInput={(e) => handleInput(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          />
        ))}
    </div>
    <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full">
      Submit
    </button>
  </form>
)}

{isOtpSubmited && (
  <form onSubmit={onSubmitNewPassword} className="bg-blue-900 p-8 rounded-lg shadow-lg w-96 text-sm">
    <h1 className="text-white text-2xl font-semibold text-center mb-4">New Password</h1>
    <p className="text-center mb-6 text-indigo-300">Enter your New Password</p>
    <div className="mb-4 flex items-center border border-gray-50 gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
      <img src={assets.lock_icon} alt="" className="w-3 h-3" />
      <input
        type="password"
        placeholder="Password"
        className="bg-transparent outline-none text-white"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />
    </div>
    <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3">
      Submit
    </button>
  </form>
)}
    </div>
  )
}

export default ResetPassword