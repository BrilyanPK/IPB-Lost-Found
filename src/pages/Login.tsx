import { useState } from 'react';

const imgVector = "https://www.figma.com/api/mcp/asset/947f727a-58ca-4e91-87b6-565f2bd0c355";
const imgGoogleIconStreamlineSvgLogos = "https://www.figma.com/api/mcp/asset/0e2f7306-c7d2-48dc-912e-c722ddb8b7d0";

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement login API call
    console.log('Login attempt:', formData);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="bg-gray-50 relative size-full flex items-center justify-center min-h-screen">
      <div className="bg-white border border-gray-300 border-solid flex flex-col gap-8 items-start max-w-md p-10 rounded-lg w-full mx-4">
        {/* Header */}
        <div className="w-full">
          <div className="flex flex-col gap-2 items-center w-full">
            <h1 className="font-montserrat font-bold text-2xl text-gray-800 text-center">
              IPB LOST & FOUND
            </h1>
            <p className="font-roboto font-normal text-sm text-gray-600 text-center">
              Masuk Ke Akun Anda
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex flex-col gap-6 w-full">
            {/* Email Field */}
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="email" className="font-roboto font-normal text-xs text-gray-800">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@gmail.com"
                required
                className="bg-white border border-gray-300 rounded-lg px-3 py-3.75 font-roboto text-base text-gray-600 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="font-roboto font-normal text-xs text-gray-800">
                  Password
                </label>
                <a href="#" className="font-roboto font-normal text-xs text-gray-600 hover:text-blue-600">
                  Lupa Password?
                </a>
              </div>
              <div className="relative flex items-center">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-3.75 font-roboto text-base text-gray-600 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 flex items-center justify-center size-5 text-gray-600 hover:text-gray-800 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <img alt="" className="size-5" src={imgVector} />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white font-roboto font-bold text-sm py-3 rounded-xl w-full hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="flex items-center justify-center w-full gap-5">
          <div className="flex-1 border-t border-gray-300" />
          <span className="font-roboto font-bold text-xs text-gray-600 whitespace-nowrap">ATAU</span>
          <div className="flex-1 border-t border-gray-300" />
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          className="border border-gray-300 rounded-xl w-full px-5 py-3 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <img alt="Google" className="size-5" src={imgGoogleIconStreamlineSvgLogos} />
          <span className="font-roboto font-bold text-sm text-gray-600">Masuk Dengan Google</span>
        </button>

        {/* Sign Up Link */}
        <div className="w-full text-center pt-2">
          <p className="font-roboto font-normal text-xs text-gray-600">
            Belum Punya Akun?{' '}
            <a href="#" className="font-roboto font-normal text-blue-600 hover:underline">
              Daftar Sekarang
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
