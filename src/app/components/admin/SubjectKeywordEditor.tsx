import { useEffect, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { getSchoolKeywordConfig, updateSchoolKeywordConfig } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export function SubjectKeywordEditor() {
  const { user } = useAuth();
  const [keywordMap, setKeywordMap] = useState<Record<string, string[]>>({});
  const [currentSubject, setCurrentSubject] = useState<string>('');
  const [currentKeyword, setCurrentKeyword] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConfig() {
      if (!user?.school) return;

      try {
        const config = await getSchoolKeywordConfig(user.school);
        setKeywordMap(config);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load keyword configuration');
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, [user?.school]);

  const handleAddKeyword = () => {
    if (!currentSubject.trim() || !currentKeyword.trim()) {
      toast.error('Subject and keyword are required');
      return;
    }

    const normalized = currentSubject.toLowerCase().trim();
    const normalizedKeyword = currentKeyword.toLowerCase().trim();

    setKeywordMap(prev => ({
      ...prev,
      [normalized]: Array.from(new Set([...(prev[normalized] ?? []), normalizedKeyword])),
    }));

    setCurrentKeyword('');
    toast.success('Keyword added');
  };

  const handleRemoveKeyword = (subject: string, keyword: string) => {
    setKeywordMap(prev => ({
      ...prev,
      [subject]: prev[subject].filter(k => k !== keyword),
    }));
  };

  const handleAddSubject = () => {
    if (!currentSubject.trim()) {
      toast.error('Subject name is required');
      return;
    }

    const normalized = currentSubject.toLowerCase().trim();
    if (keywordMap[normalized] !== undefined) {
      toast.error('Subject already exists');
      return;
    }

    setKeywordMap(prev => ({
      ...prev,
      [normalized]: [],
    }));

    setCurrentSubject('');
    toast.success('Subject added');
  };

  const handleRemoveSubject = (subject: string) => {
    setKeywordMap(prev => {
      const next = { ...prev };
      delete next[subject];
      return next;
    });
  };

  const handleSave = async () => {
    if (!user?.school) return;

    setSaving(true);
    try {
      await updateSchoolKeywordConfig(user.school, keywordMap);
      toast.success('Configuration saved successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-zinc-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add Subject Section */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-white">Add New Subject</CardTitle>
          <CardDescription>Create a new subject category for keyword mapping</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="e.g., Physics, Computer Science"
              value={currentSubject}
              onChange={e => setCurrentSubject(e.target.value)}
              className="flex-1 bg-zinc-800 border-zinc-700 text-white"
            />
            <Button onClick={handleAddSubject} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Subject
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Keyword Mapping Sections */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Subject Keywords</h3>

        {Object.keys(keywordMap).length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            <p>No subjects configured yet. Add a subject above to begin.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {Object.entries(keywordMap).map(([subject, keywords]) => (
              <Card key={subject} className="border-zinc-800 bg-zinc-800/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white capitalize">{subject}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSubject(subject)}
                      className="text-red-400 hover:bg-red-500/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Add Keyword Input */}
                  {
                    <>
                      <div className="flex gap-2">
                        <Input
                          placeholder="New keyword..."
                          value={currentSubject === subject ? currentKeyword : ''}
                          onChange={e => {
                            if (currentSubject !== subject) setCurrentSubject(subject);
                            setCurrentKeyword(e.target.value);
                          }}
                          onKeyPress={e => {
                            if (e.key === 'Enter') handleAddKeyword();
                          }}
                          className="flex-1 bg-zinc-700 border-zinc-600 text-white"
                        />
                        <Button
                          onClick={handleAddKeyword}
                          disabled={currentKeyword === '' || currentSubject !== subject}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          Add
                        </Button>
                      </div>

                      {/* Keywords List */}
                      {keywords.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {keywords.map(keyword => (
                            <div
                              key={keyword}
                              className="flex items-center gap-2 px-3 py-1 bg-zinc-600 rounded-full text-sm text-white"
                            >
                              <span>{keyword}</span>
                              <button
                                onClick={() => handleRemoveKeyword(subject, keyword)}
                                className="text-zinc-300 hover:text-red-400"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-500 italic">No keywords yet</p>
                      )}
                    </>
                  }
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        {saving ? 'Saving...' : 'Save Configuration'}
      </Button>
    </div>
  );
}
