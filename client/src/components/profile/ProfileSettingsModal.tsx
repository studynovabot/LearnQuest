import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProfileSettingsModalProps {
  onClose: () => void;
}

const subjectsList = ["Math", "Science", "English", "History", "Biology", "Geography"];

const ProfileSettingsModal = ({ onClose }: ProfileSettingsModalProps) => {
  const [profile, setProfile] = useState({ name: "", class: "", subjects: [] as string[] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : 'guest';
    fetch("/api/profile", {
      headers: { "Authorization": userId }
    })
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubjectToggle = (subject: string) => {
    setProfile(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : 'guest';
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": userId },
      body: JSON.stringify(profile)
    });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <div>
              <label className="block mb-1 font-medium">Name</label>
              <Input name="name" value={profile.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="block mb-1 font-medium">Class</label>
              <Input name="class" value={profile.class} onChange={handleChange} required />
            </div>
            <div>
              <label className="block mb-1 font-medium">Subjects</label>
              <div className="flex flex-wrap gap-2">
                {subjectsList.map(subject => (
                  <Button
                    key={subject}
                    type="button"
                    variant={profile.subjects.includes(subject) ? "default" : "outline"}
                    onClick={() => handleSubjectToggle(subject)}
                  >
                    {subject}
                  </Button>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettingsModal; 