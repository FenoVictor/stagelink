import { useState, useEffect } from "react";
import { Briefcase, Building2, Calendar, CheckCircle, XCircle, Download, Play, FileText, Star } from "lucide-react";
import { studentService } from "../../services/studentService";
import { getErrorMessage } from "../../services/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import toast from "react-hot-toast";

const statusConfig = {
  in_progress: { label: "En cours", variant: "info" },
  completed: { label: "Terminé", variant: "success" },
  terminated: { label: "Arrêté", variant: "danger" },
};

export default function MyInternships() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completeModal, setCompleteModal] = useState(null);
  const [endDate, setEndDate] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    studentService.getMyInternships()
      .then(setInternships)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStart = async (internship) => {
    const startDate = new Date().toISOString().split("T")[0];
    try {
      await studentService.startInternship(internship.id, startDate);
      toast.success("Stage démarré !");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleComplete = async () => {
    if (!endDate) return toast.error("Veuillez indiquer la date de fin");
    setSubmitting(true);
    try {
      await studentService.completeInternship(completeModal.id, endDate, feedback);
      toast.success("Stage terminé ! Vous pouvez télécharger votre attestation.");
      setCompleteModal(null);
      setEndDate("");
      setFeedback("");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAttestation = async (id) => {
    try {
      await studentService.downloadAttestation(id);
      toast.success("Attestation téléchargée !");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (error) return <div className="text-center py-12 text-danger"><p>{error}</p><button onClick={load} className="mt-4 text-primary underline cursor-pointer">Réessayer</button></div>;

  const inProgress = internships.filter((i) => i.status === "in_progress");
  const completed = internships.filter((i) => i.status !== "in_progress");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Mes stages</h1>
        <p className="text-text-muted text-sm">Suivez vos stages en cours et passés</p>
      </div>

      {internships.length === 0 ? (
        <EmptyState icon={Briefcase} title="Aucun stage" description="Vous n'avez pas encore de stage. Quand votre candidature sera acceptée, vous pourrez démarrer votre stage ici." action actionLabel="Voir les offres" onAction={() => window.location.href = "/student/internships"} />
      ) : (
        <div className="space-y-6">
          {inProgress.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Play size={18} className="text-primary" /> Stage en cours</h2>
              <div className="space-y-3">
                {inProgress.map((s) => (
                  <Card key={s.id}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{s.internship?.title}</h3>
                        <p className="text-sm text-text-muted flex items-center gap-1.5 mt-1"><Building2 size={14} />{s.internship?.company?.name || "Entreprise"}</p>
                        <p className="text-xs text-text-muted flex items-center gap-1 mt-1"><Calendar size={12} />Début : {new Date(s.start_date).toLocaleDateString("fr-FR")}</p>
                      </div>
                      <Badge>En cours</Badge>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" onClick={() => setCompleteModal(s)}><CheckCircle size={14} className="mr-1" /> Terminer le stage</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><FileText size={18} className="text-text-muted" /> Stages terminés</h2>
              <div className="space-y-3">
                {completed.map((s) => {
                  const cfg = statusConfig[s.status] || {};
                  return (
                    <Card key={s.id}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{s.internship?.title}</h3>
                          <p className="text-sm text-text-muted flex items-center gap-1.5 mt-1"><Building2 size={14} />{s.internship?.company?.name || "Entreprise"}</p>
                          <p className="text-xs text-text-muted flex items-center gap-1 mt-1">
                            <Calendar size={12} />
                            {new Date(s.start_date).toLocaleDateString("fr-FR")} — {s.end_date ? new Date(s.end_date).toLocaleDateString("fr-FR") : "..."}
                          </p>
                          {s.feedback && <p className="text-sm text-text-muted mt-2 italic">"{s.feedback}"</p>}
                        </div>
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      </div>
                      {s.status === "completed" && (
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" onClick={() => handleAttestation(s.id)}><Download size={14} className="mr-1" /> Attestation</Button>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={!!completeModal} onClose={() => setCompleteModal(null)} title="Terminer le stage">
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Stage : <strong>{completeModal?.internship?.title}</strong> chez <strong>{completeModal?.internship?.company?.name}</strong>
          </p>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Date de fin</label>
            <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Feedback (optionnel)</label>
            <textarea className="w-full h-24 px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" placeholder="Partagez votre expérience..." value={feedback} onChange={(e) => setFeedback(e.target.value)} />
          </div>
          <Button className="w-full" onClick={handleComplete} loading={submitting}>Valider la fin du stage</Button>
        </div>
      </Modal>
    </div>
  );
}
