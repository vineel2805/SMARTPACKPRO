import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, School, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { getSchools, type SchoolOption } from '../../services/firestoreService';

export function SchoolSelector() {
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadSchools() {
      try {
        const data = await getSchools();
        setSchools(data);
      } catch {
        toast.error('Unable to load schools');
      } finally {
        setIsLoading(false);
      }
    }

    loadSchools();
  }, []);

  const filteredSchools = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return schools;

    return schools.filter(school => school.name.toLowerCase().includes(query));
  }, [schools, searchTerm]);

  const handleSchoolSelect = (school: SchoolOption) => {
    navigate(`/login/${encodeURIComponent(school.name)}`);
  };

  return (
    <div className="min-h-screen bg-[#F3F5F9] text-[#1E2A44]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,#4F46E5,#5B5FF2)] shadow-[0_14px_28px_rgba(79,70,229,0.25)]">
            <School className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-[28px] font-semibold leading-8">Find Your School</h1>
          <p className="mt-1 text-[14px] text-[#677489]">Search your school and continue to login</p>
        </div>

        <div className="mb-4 rounded-3xl bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.08)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8893A7]" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search school name"
              className="h-12 w-full rounded-xl border border-[#C8CEDB] bg-white pl-10 pr-3 text-[14px] outline-none placeholder:text-[#8893A7] focus:border-[#5B5FF2]"
            />
          </div>

          <div className="mt-4 max-h-[48vh] space-y-2 overflow-y-auto pr-1">
            {isLoading && <div className="rounded-xl bg-[#F8FAFC] p-3 text-[13px] text-[#677489]">Loading schools...</div>}

            {!isLoading && filteredSchools.length === 0 && (
              <div className="rounded-xl border border-dashed border-[#CCD3E0] p-3 text-[13px] text-[#677489]">No schools found.</div>
            )}

            {!isLoading && filteredSchools.map(school => (
              <button
                key={school.id}
                type="button"
                onClick={() => handleSchoolSelect(school)}
                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#D6DCE8] bg-white px-3 text-left text-[14px] font-medium text-[#2F3B52] transition-colors hover:border-[#5B5FF2]"
              >
                <span className="truncate">{school.name}</span>
                <ArrowRight className="h-4 w-4 text-[#5B5FF2]" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
