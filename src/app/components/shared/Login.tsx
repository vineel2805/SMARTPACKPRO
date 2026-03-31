import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, UserRole } from '../../context/AuthContext';
import { loginWithSchoolCredentials } from '../../services/firestoreService';

export function Login() {
  const { schoolName: encodedSchoolName } = useParams();
  const schoolName = encodedSchoolName ? decodeURIComponent(encodedSchoolName) : '';
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (isLoggingIn) return;

    if (!schoolName) {
      toast.error('Please select a school first');
      navigate('/');
      return;
    }

    if (!email.trim() || !password.trim()) {
      toast.error('Enter your email and password');
      return;
    }

    setIsLoggingIn(true);

    try {
      const user = await loginWithSchoolCredentials({
        schoolName,
        role,
        email,
        password,
      });

      if (!user) {
        toast.error('Invalid school, role, or credentials');
        return;
      }

      login(user);
      navigate(`/${role}`);
    } catch {
      toast.error('Login failed. Please check your internet and data setup.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F5F9] text-[#1E2A44]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D9DEE8] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,#4F46E5,#5B5FF2)] shadow-[0_14px_28px_rgba(79,70,229,0.25)]">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-[28px] font-semibold leading-8">Smart Pack App</h1>
          <p className="mt-1 text-[14px] text-[#677489]">{schoolName || 'Select school to continue'}</p>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.08)]">
          <p className="mb-3 text-[13px] text-[#677489]">Login with your school credentials</p>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[13px] font-medium text-[#41506A]">Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="h-12 w-full rounded-xl border border-[#C8CEDB] bg-white px-3 text-[14px] outline-none focus:border-[#5B5FF2]"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[13px] font-medium text-[#41506A]">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="h-12 w-full rounded-xl border border-[#C8CEDB] bg-white px-3 text-[14px] outline-none placeholder:text-[#8A94A8] focus:border-[#5B5FF2]"
              />
            </div>

            <div>
              <label className="mb-1 block text-[13px] font-medium text-[#41506A]">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-12 w-full rounded-xl border border-[#C8CEDB] bg-white px-3 text-[14px] outline-none placeholder:text-[#8A94A8] focus:border-[#5B5FF2]"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[linear-gradient(135deg,#4F46E5,#5B5FF2)] text-[15px] font-semibold text-white shadow-[0_10px_20px_rgba(79,70,229,0.28)] disabled:opacity-60"
            >
              {isLoggingIn ? 'Signing in...' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
