import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Calendar, MapPin, FileText, Plus, Edit, Building2, User } from "lucide-react";
import { interviewService } from "../services/interviewService";
import { internshipService } from "../services/internshipService";
import { getErrorMessage } from "../services/api";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import EmptyState from "../components/ui/EmptyState";
import toast from "react-hot-toast";

const statusLabels = {
  scheduled: "Programmé",
  completed: "Terminé",
  cancelled: "Annulé",
};

const statusVariants = {
  scheduled: "pending",
  completed: "accepted",
  cancelled: "rejected",
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(dateStr) {
  return `${formatDate(dateStr)} à ${formatTime(dateStr)}`;
}

function toDatetimeLocal(dateStr) {
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function Interviews() {
  const { user } = useAuth();
  const isCompany = user?.role === "company";

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    application_id: "",
    date: "",
    location: "",
    meeting_link: "",
    notes: "",
    status: "scheduled",
  });
  const [applications, setApplications] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [fetchKey, setFetchKey] = useState(0);

  const fetchInterviews = () => {
    interviewService.getAll()
      .then((data) => setInterviews(Array.isArray(data) ? data : []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInterviews(); }, [fetchKey]);

  useEffect(() => {
    if (!isCompany || !showCreate) return;
    let cancelled = false;
    (async () => {
      try {
        const internships = await internshipService.getMyInternships();
        if (!Array.isArray(internships) || cancelled) return;
        const results = [];
        for (const internship of internships) {
          try {
            const apps = await internshipService.getInternshipApplications(internship.id);
            if (Array.isArray(apps) && !cancelled) {
              apps.forEach((app) => {
                results.push({ ...app, internship_title: internship.title });
              });
            }
          } catch { /* skip */ }
        }
        if (!cancelled) setApplications(results);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [isCompany, showCreate]);

  const resetForm = () => {
    setFormData({ application_id: "", date: "", location: "", meeting_link: "", notes: "", status: "scheduled" });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await interviewService.create({
        application_id: formData.application_id,
        date: formData.date,
        location: formData.location,
        meeting_link: formData.meeting_link,
        notes: formData.notes,
      });
      toast.success("Entretien programmé avec succès");
      setShowCreate(false);
      resetForm();
      setFetchKey((k) => k + 1);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (interview) => {
    setEditingId(interview.id);
    setFormData({
      date: toDatetimeLocal(interview.date),
      location: interview.location || "",
      meeting_link: interview.meeting_link || "",
      notes: interview.notes || "",
      status: interview.status,
    });
    setShowEdit(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await interviewService.update(editingId, {
        date: formData.date,
        location: formData.location,
        meeting_link: formData.meeting_link,
        notes: formData.notes,
        status: formData.status,
      });
      toast.success("Entretien mis à jour");
      setShowEdit(false);
      setEditingId(null);
      resetForm();
      setFetchKey((k) => k + 1);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-danger">
        <p>{error}</p>
        <button onClick={() => { setError(null); setFetchKey((k) => k + 1); }} className="mt-4 text-primary underline cursor-pointer">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Entretiens</h1>
          <p className="text-text-muted text-sm">
            {isCompany
              ? "Gérez les entretiens avec les candidats"
              : "Consultez vos entretiens à venir"}
          </p>
        </div>
        {isCompany && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={18} />
            Programmer un entretien
          </Button>
        )}
      </div>

      {interviews.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Aucun entretien"
          description={
            isCompany
              ? "Vous n'avez pas encore programmé d'entretien"
              : "Vous n'avez pas encore d'entretien programmé"
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {interviews.map((interview) => (
            <Card key={interview.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <Badge variant={statusVariants[interview.status] || "open"}>
                    {statusLabels[interview.status] || interview.status}
                  </Badge>
                  {isCompany && interview.status === "scheduled" && (
                    <button
                      onClick={() => openEdit(interview)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <Edit size={16} className="text-text-muted" />
                    </button>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-text-muted">
                    <Calendar size={15} className="flex-shrink-0" />
                    <span>{formatDateTime(interview.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-muted">
                    <MapPin size={15} className="flex-shrink-0" />
                    <span>{interview.location || "En ligne"}</span>
                  </div>
                  {user?.role === "student" && (
                    <div className="flex items-center gap-2 text-text-muted">
                      <Building2 size={15} className="flex-shrink-0" />
                      <span>{interview.company?.name || "Entreprise"}</span>
                    </div>
                  )}
                  {isCompany && (
                    <div className="flex items-center gap-2 text-text-muted">
                      <User size={15} className="flex-shrink-0" />
                      <span>{interview.student?.name || "Étudiant"}</span>
                    </div>
                  )}
                  {interview.internship?.title && (
                    <div className="flex items-center gap-2 text-text-muted">
                      <FileText size={15} className="flex-shrink-0" />
                      <span className="font-medium">{interview.internship.title}</span>
                    </div>
                  )}
                  {interview.notes && (
                    <div className="flex items-start gap-2 text-text-muted pt-1">
                      <FileText size={15} className="flex-shrink-0 mt-0.5" />
                      <span className="italic">{interview.notes}</span>
                    </div>
                  )}
                  {interview.meeting_link && (
                    <div className="flex items-center gap-2 text-text-muted pt-1">
                      <a
                        href={interview.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm truncate"
                      >
                        {interview.meeting_link}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={showCreate}
        onClose={() => { setShowCreate(false); resetForm(); }}
        title="Programmer un entretien"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="application" className="block text-sm font-medium text-text">
              Candidature
            </label>
            <select
              id="application"
              value={formData.application_id}
              onChange={(e) => setFormData({ ...formData, application_id: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
            >
              <option value="">Sélectionnez une candidature</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.student?.name || "Étudiant"} – {app.internship_title || app.internship?.title || "Stage"}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Date et heure"
            id="date"
            type="datetime-local"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <Input
            label="Lieu (ou lien visio)"
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="En ligne ou adresse"
          />
          <Input
            label="Lien de réunion"
            id="meeting_link"
            value={formData.meeting_link}
            onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
            placeholder="https://meet.google.com/..."
          />
          <div className="space-y-1.5">
            <label htmlFor="notes" className="block text-sm font-medium text-text">
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Informations complémentaires..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setShowCreate(false); resetForm(); }}>
              Annuler
            </Button>
            <Button type="submit" loading={submitting}>
              Programmer
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={showEdit}
        onClose={() => { setShowEdit(false); resetForm(); }}
        title="Modifier l'entretien"
        size="md"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Date et heure"
            id="edit_date"
            type="datetime-local"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <div className="space-y-1.5">
            <label htmlFor="edit_status" className="block text-sm font-medium text-text">
              Statut
            </label>
            <select
              id="edit_status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
            >
              <option value="scheduled">Programmé</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
          <Input
            label="Lieu (ou lien visio)"
            id="edit_location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="En ligne ou adresse"
          />
          <Input
            label="Lien de réunion"
            id="edit_meeting_link"
            value={formData.meeting_link}
            onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
            placeholder="https://meet.google.com/..."
          />
          <div className="space-y-1.5">
            <label htmlFor="edit_notes" className="block text-sm font-medium text-text">
              Notes
            </label>
            <textarea
              id="edit_notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Informations complémentaires..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setShowEdit(false); resetForm(); }}>
              Annuler
            </Button>
            <Button type="submit" loading={submitting}>
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
