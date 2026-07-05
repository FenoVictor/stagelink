import { useState, useEffect } from "react";
import { FileText, Check, X, Eye } from "lucide-react";
import { internshipService } from "../../services/internshipService";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import toast from "react-hot-toast";

export default function CompanyApplications() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [applications, setApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    internshipService.getMyInternships()
      .then(setInternships)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const viewApplications = async (internship) => {
    setSelectedInternship(internship);
    setShowModal(true);
    try {
      const data = await internshipService.getInternshipApplications(internship.id);
      setApplications(data);
    } catch {
      setApplications([]);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await internshipService.updateApplicationStatus(id, status);
      toast.success(`Candidature ${status === "accepted" ? "acceptée" : "refusée"}`);
      setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
    } catch {
      toast.error("Erreur");
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Candidatures reçues</h1>
        <p className="text-text-muted text-sm">Consultez les candidatures par offre</p>
      </div>

      {internships.length === 0 ? (
        <EmptyState icon={FileText} title="Aucune offre" description="Créez d'abord une offre de stage." action actionLabel="Créer une offre" onAction={() => window.location.href = "/company/internships"} />
      ) : (
        <div className="space-y-3">
          {internships.map((internship) => (
            <Card key={internship.id} hover onClick={() => viewApplications(internship)}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{internship.title}</h3>
                  <p className="text-sm text-text-muted">{internship.location} · {internship.type}</p>
                </div>
                <Badge>{internship.applications_count || 0} candidature(s)</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={`Candidatures - ${selectedInternship?.title || ""}`} size="lg">
        {applications.length === 0 ? (
          <p className="text-text-muted text-center py-8">Aucune candidature pour cette offre.</p>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <Card key={app.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{app.student?.name || "Étudiant"}</h4>
                    <p className="text-xs text-text-muted">{app.student?.email}</p>
                    <Badge variant={app.status} className="mt-2">
                      {app.status === "pending" ? "En attente" : app.status === "accepted" ? "Acceptée" : "Refusée"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedApp(app)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"><Eye size={16} className="text-text-muted" /></button>
                    {app.status === "pending" && (
                      <>
                        <button onClick={() => updateStatus(app.id, "accepted")} className="p-2 rounded-lg hover:bg-green-50 transition-colors cursor-pointer"><Check size={16} className="text-cta" /></button>
                        <button onClick={() => updateStatus(app.id, "rejected")} className="p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"><X size={16} className="text-danger" /></button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Modal>

      <Modal open={!!selectedApp} onClose={() => setSelectedApp(null)} title="Candidature">
        {selectedApp && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">{selectedApp.student?.name}</h4>
              <p className="text-sm text-text-muted">{selectedApp.student?.email}</p>
              {selectedApp.student?.phone && <p className="text-sm text-text-muted">{selectedApp.student.phone}</p>}
            </div>
            <div>
              <h5 className="font-medium text-sm text-text-muted mb-1">Lettre de motivation</h5>
              <p className="text-sm">{selectedApp.cover_letter || "Non fournie"}</p>
            </div>
            {selectedApp.cv_url && (
              <a href={selectedApp.cv_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">Voir le CV</Button>
              </a>
            )}
            {selectedApp.status === "pending" && (
              <div className="flex gap-2">
                <Button onClick={() => { updateStatus(selectedApp.id, "accepted"); setSelectedApp(null); }} variant="primary" size="sm"><Check size={16} />Accepter</Button>
                <Button onClick={() => { updateStatus(selectedApp.id, "rejected"); setSelectedApp(null); }} variant="danger" size="sm"><X size={16} />Refuser</Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
